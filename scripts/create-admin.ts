/**
 * Creates (or updates) an administrator account.
 *
 *   npm run admin:create
 *   npm run admin:create -- --email you@example.com --name "Your Name"
 *
 * Credentials are read from the command line, then from ADMIN_* environment
 * variables, and finally by prompting. No password is ever written to source.
 */
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { hashPassword, validatePasswordStrength } from '../src/lib/auth/password';

for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    /* environment may be injected directly */
  }
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];

  const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return inline ? inline.slice(name.length + 3) : undefined;
}

async function prompt(question: string, hidden = false): Promise<string> {
  if (!stdin.isTTY) {
    throw new Error(
      `Cannot prompt for "${question}" — no interactive terminal. ` +
        'Pass it as a flag or set the matching ADMIN_* environment variable.',
    );
  }

  const rl = readline.createInterface({ input: stdin, output: stdout, terminal: true });
  try {
    if (!hidden) return (await rl.question(question)).trim();

    // Suppress echo while a password is typed.
    const output = rl as unknown as { output?: { write: (chunk: string) => void } };
    const originalWrite = output.output?.write;
    let muted = false;
    if (output.output && originalWrite) {
      output.output.write = (chunk: string) => {
        if (!muted) originalWrite.call(output.output, chunk);
      };
    }

    const answer = rl.question(question);
    muted = true;
    const value = await answer;
    muted = false;
    stdout.write('\n');
    return value.trim();
  } finally {
    rl.close();
  }
}

async function main() {
  const email = (readFlag('email') ?? process.env.ADMIN_EMAIL ?? (await prompt('Email: ')))
    .trim()
    .toLowerCase();

  if (!email.includes('@')) throw new Error('That does not look like an email address.');

  const name =
    readFlag('name') ?? process.env.ADMIN_NAME ?? (await prompt('Name: ')) ?? 'Administrator';

  const password =
    readFlag('password') ?? process.env.ADMIN_PASSWORD ?? (await prompt('Password: ', true));

  const weakness = validatePasswordStrength(password);
  if (weakness) throw new Error(weakness);

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await hashPassword(password);

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'ADMIN', isActive: true, name: name || existing.name },
    });
    // Any existing sessions belong to the old password.
    await prisma.session.deleteMany({ where: { userId: existing.id } });
    console.log(`\nUpdated the existing administrator ${email}.`);
  } else {
    await prisma.user.create({
      data: { email, name: name || 'Administrator', role: 'ADMIN', passwordHash },
    });
    console.log(`\nCreated administrator ${email}.`);
  }

  console.log('Sign in at /admin/login\n');
}

main()
  .catch((error) => {
    console.error(`\nFailed: ${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
