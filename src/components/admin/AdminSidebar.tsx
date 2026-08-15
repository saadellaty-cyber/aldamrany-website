'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Activity,
  Building2,
  FolderKanban,
  Gauge,
  Images,
  Inbox,
  Layers,
  LayoutDashboard,
  Link2,
  ListOrdered,
  Menu,
  Milestone,
  Navigation,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavEntry = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Count badge, e.g. unread contact messages. */
  badge?: number;
  adminOnly?: boolean;
};

type NavGroup = { title: string; items: NavEntry[] };

export function AdminSidebar({
  role,
  newMessages,
}: {
  role: 'ADMIN' | 'EDITOR';
  newMessages: number;
}) {
  const pathname = usePathname();

  // The drawer remembers which route it was opened on, so navigating anywhere
  // closes it without an effect that would trigger a second render pass.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  const groups: NavGroup[] = [
    {
      title: 'Overview',
      items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'Work',
      items: [
        { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
        { href: '/admin/content/collections', label: 'Collections', icon: Layers },
        { href: '/admin/media', label: 'Media Library', icon: Images },
      ],
    },
    {
      title: 'Pages',
      items: [
        { href: '/admin/homepage', label: 'Homepage', icon: Gauge },
        { href: '/admin/pages', label: 'Pages & SEO', icon: Building2 },
      ],
    },
    {
      title: 'Content',
      items: [
        { href: '/admin/content/services', label: 'Services', icon: Wrench },
        { href: '/admin/content/sectors', label: 'Sectors', icon: Layers },
        { href: '/admin/content/capabilities', label: 'Capabilities', icon: Wrench },
        { href: '/admin/content/quality', label: 'Quality & Safety', icon: ShieldCheck },
        { href: '/admin/content/risk', label: 'Risk Management', icon: TriangleAlert },
        { href: '/admin/content/timeline', label: 'Timeline', icon: Milestone },
        { href: '/admin/content/statistics', label: 'Statistics', icon: ListOrdered },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { href: '/admin/messages', label: 'Contact Messages', icon: Inbox, badge: newMessages },
        { href: '/admin/settings', label: 'Site Settings', icon: Settings },
        { href: '/admin/social', label: 'Social Links', icon: Link2 },
        { href: '/admin/content/navigation', label: 'Navigation', icon: Navigation },
      ],
    },
    {
      title: 'System',
      items: [
        { href: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
        { href: '/admin/activity', label: 'Activity Log', icon: Activity },
      ],
    },
  ];

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const nav = (
    <nav aria-label="Dashboard sections" className="space-y-6 p-4">
      {groups.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || role === 'ADMIN');
        if (items.length === 0) return null;

        return (
          <div key={group.title}>
            <p className="mb-2 px-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 px-2 py-2 text-sm transition-colors',
                        active
                          ? 'bg-ink text-paper'
                          : 'text-ink/80 hover:bg-black/5 hover:text-ink',
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <span
                          className={cn(
                            'min-w-5 px-1.5 py-0.5 text-center text-[0.625rem] font-semibold',
                            active ? 'bg-paper text-ink' : 'bg-ink text-paper',
                          )}
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpenedOn(pathname)}
        aria-label="Open dashboard menu"
        aria-expanded={open}
        className="inline-flex size-9 items-center justify-center border border-[#d5d4ce] bg-white lg:hidden"
      >
        <Menu className="size-4" aria-hidden="true" />
      </button>

      {/* Desktop rail */}
      <aside className="hidden w-64 shrink-0 border-e border-[#e2e1dc] bg-white lg:block">
        <div className="sticky top-0 max-h-dvh overflow-y-auto">
          <div className="border-b border-[#e2e1dc] px-5 py-5">
            <Link href="/admin" className="block">
              <span className="block text-sm font-semibold tracking-[0.16em]">EL DAMARANY</span>
              <span className="mt-1 block text-[0.5625rem] tracking-[0.22em] text-ink-muted">
                DASHBOARD
              </span>
            </Link>
          </div>
          {nav}
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={() => setOpenedOn(null)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="absolute inset-y-0 start-0 w-72 max-w-[85vw] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e1dc] px-5 py-4">
              <span className="text-sm font-semibold tracking-[0.16em]">EL DAMARANY</span>
              <button
                type="button"
                onClick={() => setOpenedOn(null)}
                aria-label="Close dashboard menu"
                className="inline-flex size-8 items-center justify-center"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </>
  );
}
