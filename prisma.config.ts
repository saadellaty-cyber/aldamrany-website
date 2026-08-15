import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads .env implicitly — do it here so the CLI (migrate,
// generate, seed) sees DATABASE_URL exactly like the application does.
//
// A DATABASE_URL exported in the shell must win, so that a one-off command can
// target a remote database without the local .env silently redirecting it back
// to the development server.
const explicitDatabaseUrl = process.env.DATABASE_URL;

for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    // Missing env file is fine; real deployments inject variables directly.
  }
}

if (explicitDatabaseUrl) {
  process.env.DATABASE_URL = explicitDatabaseUrl;
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
