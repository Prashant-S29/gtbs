"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpenText,
  Images,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Store,
  Tags,
  UsersRound,
} from "lucide-react";

import AdminLogoutButton from "@/components/admin/login/AdminLogoutButton";

const navigation = [
  {
    key: "overview",
    label: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "products",
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    key: "categories",
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  { key: "blogs", label: "Blogs", href: "/admin/blogs", icon: BookOpenText },
  {
    key: "galleries",
    label: "Gallery",
    href: "/admin/galleries",
    icon: Images,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquareQuote,
  },
  { key: "team", label: "Team", href: "/admin/team", icon: UsersRound },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") {
    return pathname === "/admin" || pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return navigation.map(({ key, label, href, icon: Icon }) => {
    const isActive = isActiveRoute(pathname, href);
    return (
      <Link
        key={key}
        href={href}
        prefetch
        aria-current={isActive ? "page" : undefined}
        className={
          mobile
            ? `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-orange-50 text-orange-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            : `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-orange-600 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
        }
      >
        <Icon size={mobile ? 16 : 18} />
        {label}
      </Link>
    );
  });
}

export default function AdminPanelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-900 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-slate-950 px-4 py-5 text-white lg:flex">
        <Link
          href="/admin/dashboard"
          prefetch
          className="flex items-center gap-3 px-2"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
            <Image
              src="/images/logo/logo.webp"
              alt="GTBS"
              width={38}
              height={38}
              className="h-9 w-9 object-contain"
            />
          </span>
          <span>
            <span className="block text-sm font-bold">GTBS Admin</span>
            <span className="block text-xs text-slate-400">
              Management panel
            </span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1" aria-label="Admin navigation">
          <AdminNavigation />
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Link
              href="/admin/dashboard"
              prefetch
              className="flex items-center gap-2 lg:hidden"
            >
              <Image
                src="/images/logo/logo.webp"
                alt="GTBS"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="text-sm font-bold">GTBS Admin</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open storefront in a new tab"
                className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:flex"
              >
                <Store size={16} />
                Storefront
              </Link>
              <AdminLogoutButton />
            </div>
            <nav
              className="order-4 flex w-full gap-1 overflow-x-auto lg:hidden"
              aria-label="Mobile admin navigation"
            >
              <AdminNavigation mobile />
            </nav>
          </div>
        </header>

        <main className="px-4 py-7 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
