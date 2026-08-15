import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { LoginForm } from '@/app/admin/login/LoginForm';
import { FormMessage } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (user) redirect('/admin');

  const params = await searchParams;
  const next = typeof params.next === 'string' ? params.next : undefined;

  // A brand-new installation has no administrator yet; tell the operator how
  // to create one rather than leaving them at an unusable form.
  const userCount = await prisma.user.count();

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-9 text-center">
          <p className="text-lg font-semibold tracking-[0.18em]">EL DAMARANY</p>
          <p className="mt-2 text-[0.625rem] tracking-[0.3em] text-ink-muted">DASHBOARD</p>
        </div>

        <div className="border border-[#e2e1dc] bg-white p-6 md:p-7">
          {userCount === 0 ? (
            <div className="space-y-4">
              <FormMessage tone="info">
                No administrator account exists yet. Create the first one by running{' '}
                <code className="bg-[#f2f1ee] px-1">npm run admin:create</code> in the project
                directory, then sign in here.
              </FormMessage>
            </div>
          ) : (
            <LoginForm next={next} />
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Authorised access only. All activity is recorded.
        </p>
      </div>
    </main>
  );
}
