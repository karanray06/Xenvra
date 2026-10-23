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
  CreditCard,
  Sparkles,
  X,
  Briefcase,
  Mail,
  Target,
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
  { href: "/dashboard/applications", label: "Tracker", icon: Briefcase },
  { href: "/dashboard/cover-letters", label: "Cover Letters", icon: Mail },
  { href: "/dashboard/tailor", label: "JD Tailor", icon: Target },
  { href: "/dashboard/templates", label: "Templates", icon: Grid },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unlockToast, setUnlockToast] = useState<string | null>(null);
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

  // Real-time subscription on entitlements for instant plan unlocks
  useEffect(() => {
    if (!user.id) return;

    const channel = supabase
      .channel(`entitlements_realtime_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "entitlements",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRow = payload.new as {
            plan?: string;
            status?: string;
          };
          if (newRow && newRow.status === "active" && newRow.plan !== "free") {
            setUnlockToast(
              `🎉 Plan upgraded to ${newRow.plan?.toUpperCase()}! Pro templates and exports unlocked.`
            );
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user.id, router]);

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
              src="/logos/xenvra-icon.svg"
              alt="Xenvra"
              width={32}
              height={32}
              className="rounded-md shadow-xs"
              priority
            />
            <Image
              src="/logos/xenvra-wordmark.svg"
              alt="Xenvra"
              width={84}
              height={20}
              className="hidden object-contain sm:block"
              priority
            />
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand-50 text-accent"
                      : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-surface p-1.5 pr-3 text-left transition-colors hover:bg-surface-tertiary"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  width={30}
                  height={30}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-xs font-semibold text-accent">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm font-medium text-text-primary sm:block">
                {user.fullName}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-lg animate-scale-in">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-sm font-medium text-text-primary">
                    {user.fullName}
                  </p>
                  <p className="truncate text-xs text-text-tertiary">
                    {user.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                  >
                    <User className="h-4 w-4" />
                    Account Settings
                  </Link>
                  <Link
                    href="/dashboard/billing"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                  >
                    <CreditCard className="h-4 w-4" />
                    Billing & Plans
                  </Link>
                </div>

                <div className="border-t border-border pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger-light"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Real-time Plan Upgrade Toast */}
      {unlockToast && (
        <div className="sticky top-16 z-40 bg-accent text-white px-4 py-2.5 shadow-md flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 shrink-0 text-lav-200" />
            <span>{unlockToast}</span>
          </div>
          <button
            onClick={() => setUnlockToast(null)}
            className="rounded p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
