import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guard';
import { UsersManager, type UserRow } from '@/components/admin/UsersManager';
import { PageHeading } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'Users' };

export default async function UsersPage() {
  // Only administrators may see or manage accounts.
  const actor = await requireAdmin('/admin/users');

  const users = await prisma.user.findMany({ orderBy: [{ role: 'asc' }, { createdAt: 'asc' }] });

  const rows: UserRow[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    isSelf: user.id === actor.id,
  }));

  return (
    <>
      <PageHeading
        title="Users"
        description="Who can sign in to this dashboard."
        breadcrumbs={[{ label: 'System' }, { label: 'Users' }]}
      />

      <UsersManager users={rows} />
    </>
  );
}
