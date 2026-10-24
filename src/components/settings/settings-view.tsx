"use client";

import { useState, useEffect } from "react";
import { User, CreditCard, Globe, Palette, AlertTriangle } from "lucide-react";
import { PublicProfileCard } from "@/components/settings/public-profile-card";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import {
  BillingClient,
  type Plan,
  type Entitlement,
  type Payment,
} from "@/components/billing/billing-client";

interface UserProfile {
  id?: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface PublicProfileData {
  slug: string;
  visibility: string;
  resume_id: string | null;
}

interface SettingsViewProps {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  profile: UserProfile | null;
  publicProfile: PublicProfileData | null;
  viewsCount: number;
  resumes: Array<{ id: string; title: string }>;
  plans: Plan[];
  entitlement: Entitlement | null;
  payments: Payment[];
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Plan & Billing", icon: CreditCard },
  { id: "public-profile", label: "Public Profile", icon: Globe },
  { id: "brand-kit", label: "Brand Kit", icon: Palette },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsView({
  user,
  profile,
  publicProfile,
  viewsCount,
  resumes,
  plans,
  entitlement,
  payments,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace("#", "") as TabId;
      if (TABS.some((tab) => tab.id === hash)) {
        setActiveTab(hash);
      }
    }

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function handleTabSelect(id: TabId) {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your account, subscription, public portfolio, and design assets.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-border">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Settings Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-3 px-3 sm:px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:border-border hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-xs">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-accent">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Personal Details</h2>
                  <p className="text-xs text-text-tertiary">Your primary identification and login credentials</p>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={profile?.full_name || user.fullName || ""}
                    disabled
                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary cursor-not-allowed opacity-90"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email || ""}
                    disabled
                    className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-tertiary cursor-not-allowed opacity-90"
                  />
                  <p className="mt-1 text-xs text-text-tertiary">
                    Managed by your authentication provider (Google / Email).
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Plan & Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <BillingClient
              plans={plans}
              entitlement={entitlement}
              payments={payments}
              userEmail={user.email}
              userName={user.fullName}
            />
          </div>
        )}

        {/* Public Profile Tab */}
        {activeTab === "public-profile" && (
          <div className="space-y-6">
            <PublicProfileCard
              initialProfile={publicProfile}
              viewsCount={viewsCount}
              resumes={resumes}
            />
          </div>
        )}

        {/* Brand Kit Tab */}
        {activeTab === "brand-kit" && (
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-xs">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-accent">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Xenvra Studio Brand Kit</h2>
                  <p className="text-xs text-text-tertiary">
                    Official palette tokens and typographic hierarchy for your designs
                  </p>
                </div>
              </div>

              {/* Palette Grid */}
              <div className="mb-8">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  Core Brand Palette
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="h-16 w-full bg-[#E6EEF4]" />
                    <div className="p-3 bg-surface">
                      <p className="text-xs font-semibold text-text-primary">Ice Silver</p>
                      <p className="text-[11px] font-mono text-text-tertiary">#E6EEF4</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="h-16 w-full bg-[#5A4032]" />
                    <div className="p-3 bg-surface">
                      <p className="text-xs font-semibold text-text-primary">Mocha Brown</p>
                      <p className="text-[11px] font-mono text-text-tertiary">#5A4032</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="h-16 w-full bg-[#C9CCD1]" />
                    <div className="p-3 bg-surface">
                      <p className="text-xs font-semibold text-text-primary">Platinum Silver</p>
                      <p className="text-[11px] font-mono text-text-tertiary">#C9CCD1</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="h-16 w-full bg-[#DCD3F2]" />
                    <div className="p-3 bg-surface">
                      <p className="text-xs font-semibold text-text-primary">Pale Lavender</p>
                      <p className="text-[11px] font-mono text-text-tertiary">#DCD3F2</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="rounded-lg border border-border bg-surface-secondary/40 p-5">
                <h3 className="mb-2 text-sm font-semibold text-text-primary">Primary UI Font</h3>
                <p className="text-sm text-text-secondary">
                  Plus Jakarta Sans (OFL Self-Hosted) — Modern, clean, geometric sans-serif engineered for digital readability.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <section className="rounded-xl border border-red-200/80 bg-red-50/20 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-danger">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-danger">Danger Zone</h2>
                  <p className="text-xs text-text-tertiary">
                    Irreversible actions that affect your account and data
                  </p>
                </div>
              </div>
              <p className="mb-5 text-sm text-text-secondary">
                Once you delete your account, all your resumes, studio designs, applications, cover letters, and payment records are permanently erased. This cannot be undone.
              </p>
              <DeleteAccountButton />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
