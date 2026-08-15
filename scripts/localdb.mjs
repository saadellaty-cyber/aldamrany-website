/**
 * Local development database control.
 *
 * Runs a real PostgreSQL 18 server from the `@embedded-postgres/*` binaries so
 * the app can be developed, migrated, seeded and tested end-to-end without a
 * system-wide Postgres install or Docker.
 *
 * Production is expected to use a managed PostgreSQL instance — only
 * DATABASE_URL changes, nothing in the app or schema.
 *
 * Usage:
 *   node scripts/localdb.mjs start|stop|status|reset|url
 */
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, '.localdb', 'data');
const logFile = path.join(root, '.localdb', 'postgres.log');

export const LOCAL_DB = {
  host: '127.0.0.1',
  port: 54329,
  user: 'eldamarany',
  password: 'eldamarany_dev',
  database: 'eldamarany',
};

export const LOCAL_DATABASE_URL =
  `postgresql://${LOCAL_DB.user}:${LOCAL_DB.password}` +
  `@${LOCAL_DB.host}:${LOCAL_DB.port}/${LOCAL_DB.database}?schema=public`;

/** Resolve the platform-specific binary directory shipped by embedded-postgres. */
function binDir() {
  const platform = { win32: 'windows', darwin: 'darwin', linux: 'linux' }[os.platform()];
  const arch = { x64: 'x64', arm64: 'arm64', ia32: 'ia32' }[os.arch()];
  const pkg = `@embedded-postgres/${platform}-${arch}`;

  const candidates = [path.join(root, 'node_modules', ...pkg.split('/'), 'native', 'bin')];
  try {
    // `exports` may not expose package.json, so fall back to the module entry.
    candidates.push(path.join(path.dirname(require.resolve(pkg)), '..', 'native', 'bin'));
  } catch {
    /* resolved via the node_modules path below, if present */
  }

  const found = candidates.map((dir) => path.resolve(dir)).find((dir) => fs.existsSync(dir));
  if (found) return found;

  throw new Error(
    `Could not locate ${pkg}. Run "npm install" first, or point DATABASE_URL at your own PostgreSQL server.`,
  );
}

function bin(name) {
  return path.join(binDir(), os.platform() === 'win32' ? `${name}.exe` : name);
}

function run(name, args, options = {}) {
  const result = spawnSync(bin(name), args, {
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: LOCAL_DB.password, ...(options.env ?? {}) },
  });
  if (result.error) throw result.error;
  return result;
}

function probe() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    const done = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(LOCAL_DB.port, LOCAL_DB.host);
  });
}

async function waitForPort(timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await probe()) return true;
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

function isInitialised() {
  return fs.existsSync(path.join(dataDir, 'PG_VERSION'));
}

function initialise() {
  console.log('[localdb] initialising a new PostgreSQL cluster…');
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  fs.rmSync(dataDir, { recursive: true, force: true });

  const pwFile = path.join(os.tmpdir(), `eldamarany-pw-${process.pid}`);
  fs.writeFileSync(pwFile, LOCAL_DB.password, 'utf8');
  try {
    const result = run('initdb', [
      '-D', dataDir,
      '-U', LOCAL_DB.user,
      `--pwfile=${pwFile}`,
      '-E', 'UTF8',
      '--auth=scram-sha-256',
      '--auth-host=scram-sha-256',
    ]);
    if (result.status !== 0) {
      throw new Error(`initdb failed:\n${result.stdout ?? ''}${result.stderr ?? ''}`);
    }
  } finally {
    fs.rmSync(pwFile, { force: true });
  }
}

/**
 * The embedded distribution ships server binaries only (no psql/createdb), so
 * the application database is provisioned through the `pg` driver.
 */
async function ensureDatabase() {
  const { default: pg } = await import('pg');

  const connect = async () => {
    const client = new pg.Client({
      host: LOCAL_DB.host,
      port: LOCAL_DB.port,
      user: LOCAL_DB.user,
      password: LOCAL_DB.password,
      database: 'postgres',
    });
    await client.connect();
    return client;
  };

  // The port opens before the server finishes recovery, so early connections
  // are refused with "the database system is starting up".
  let client;
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      client = await connect();
      break;
    } catch (error) {
      if (Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      LOCAL_DB.database,
    ]);
    if (rowCount === 0) {
      // Identifier cannot be parameterised; it is a fixed constant, not user input.
      await client.query(`CREATE DATABASE "${LOCAL_DB.database}"`);
      console.log(`[localdb] created database "${LOCAL_DB.database}"`);
    }
  } finally {
    await client.end();
  }
}

async function start() {
  if (!(await probe())) {
    if (!isInitialised()) initialise();

    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    // Detach with no inherited stdio: the server process outlives this script,
    // and keeping its handles would block us from ever exiting.
    const child = spawn(
      bin('pg_ctl'),
      ['-D', dataDir, '-l', logFile, '-o', `-p ${LOCAL_DB.port} -h ${LOCAL_DB.host}`, 'start'],
      { detached: true, stdio: 'ignore', env: { ...process.env, PGPASSWORD: LOCAL_DB.password } },
    );
    child.unref();

    if (!(await waitForPort())) {
      throw new Error(`PostgreSQL did not accept connections in time. See ${logFile}.`);
    }
  }

  await ensureDatabase();
  console.log(`[localdb] running on ${LOCAL_DB.host}:${LOCAL_DB.port}`);
}

async function stop() {
  if (!isInitialised()) {
    console.log('[localdb] no cluster to stop');
    return;
  }
  const result = run('pg_ctl', ['-D', dataDir, '-m', 'fast', '-w', 'stop']);
  console.log(result.status === 0 ? '[localdb] stopped' : '[localdb] not running');
}

async function status() {
  const up = await probe();
  console.log(`[localdb] ${up ? 'running' : 'stopped'} (${LOCAL_DB.host}:${LOCAL_DB.port})`);
  if (!up) process.exitCode = 1;
}

async function reset() {
  await stop();
  fs.rmSync(path.join(root, '.localdb'), { recursive: true, force: true });
  console.log('[localdb] cluster removed');
  await start();
}

async function url() {
  console.log(LOCAL_DATABASE_URL);
}

const actions = { start, stop, status, reset, url };
const command = process.argv[2] ?? 'start';

if (!actions[command]) {
  console.error(`Unknown command "${command}". Use: ${Object.keys(actions).join(' | ')}`);
  process.exit(1);
}

actions[command]()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((error) => {
    console.error('[localdb] failed:', error?.message ?? error);
    process.exit(1);
  });
