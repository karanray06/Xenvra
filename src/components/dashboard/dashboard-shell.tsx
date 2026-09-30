"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  FileText,
  Grid,
  Settings,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DashboardUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

interface DashboardShellProps {
  user: DashboardUser;
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/builder", label: "Builder", icon: FileText },
  { href: "/dashboard/templates", label: "Templates", icon: Grid },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/logos/xenvra-icon.png"
              alt="Xenvra"
              width={32}
              height={32}
              className="rounded-md"
            />
            <Image
              src="/logos/xenvra-wordmark.png"
              alt="Xenvra"
              width={80}
              height={20}
              className="hidden object-contain sm:block"
            />
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-accent"
                      : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-tertiary"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-accent">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm font-medium text-text-primary sm:block">
                {user.fullName}
              </span>
              <ChevronDown className="h-4 w-4 text-text-tertiary" />
            </button>

            {userMenuOpen && (
              <div className="animate-scale-in absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                <div className="border-b border-border px-3 pb-3 pt-2">
                  <p className="text-sm font-medium text-text-primary">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-text-tertiary">{user.email}</p>
                </div>
                <div className="pt-1.5">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger-light"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-1 md:hidden">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
