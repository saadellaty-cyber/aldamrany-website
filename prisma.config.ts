import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads .env implicitly — do it here so the CLI (migrate,
// generate, seed) sees DATABASE_URL exactly like the application does.
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    // Missing env file is fine; real deployments inject variables directly.
  }
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
