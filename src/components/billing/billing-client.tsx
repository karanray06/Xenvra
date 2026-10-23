"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  Check,
  CreditCard,
  Loader2,
  Sparkles,
  Clock,
  ArrowRight,
  Receipt,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price_inr: number;
  duration_days: number;
  max_resumes: number;
  max_templates: number;
  max_ai_actions_daily: number;
  features: string[];
}

interface Entitlement {
  id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
}

interface Payment {
  id: string;
  razorpay_order_id: string | null;
  plan: string;
  amount_inr: number;
  status: string;
  created_at: string;
}

interface BillingClientProps {
  plans: Plan[];
  entitlement: Entitlement | null;
  payments: Payment[];
  userEmail: string;
  userName: string;
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (res: RazorpayFailureResponse) => void) => void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export function BillingClient({
  plans,
  entitlement,
  payments,
  userEmail,
  userName,
}: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const currentPlanId = entitlement?.status === "active" ? entitlement.plan : "free";
  const beginnerPrice = plans.find((p) => p.id === "beginner")?.price_inr ?? 29;
  const proPrice = plans.find((p) => p.id === "pro")?.price_inr ?? 49;

  const handleUpgrade = async (planId: "beginner" | "pro") => {
    setLoadingPlan(planId);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate checkout");
      }

      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK failed to load. Please refresh and try again.");
      }

      const options = {
        ...data.clientConfig,
        prefill: {
          email: userEmail,
          name: userName,
        },
        theme: {
          color: "#5A4032",
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyRes = await fetch("/api/billing/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setSuccessMessage(
                `🎉 Success! Your account has been upgraded to the ${planId.toUpperCase()} plan.`
              );
              router.refresh();
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Payment verification error");
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: RazorpayFailureResponse) => {
        setError(response.error?.description || "Payment failed. Please try again.");
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Billing & Plans
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your subscription, unlock premium templates, and download receipts.
          </p>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-success/30 bg-success-light p-4 text-sm font-medium text-success animate-slide-down">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-danger/30 bg-danger-light p-4 text-sm font-medium text-danger animate-slide-down">
            {error}
          </div>
        )}

        {/* Current Plan Overview Banner */}
        <div className="mb-10 rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-accent">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-text-primary capitalize">
                    {currentPlanId} Plan
                  </h2>
                  <span className="rounded-full bg-lav-200 px-2.5 py-0.5 text-xs font-bold text-text-primary">
                    {entitlement?.status || "Active"}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {currentPlanId === "free"
                    ? "1 resume, 3 basic templates with watermark"
                    : "Unlimited templates and watermark-free exports"}
                </p>
              </div>
            </div>

            {entitlement?.current_period_end && (
              <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-secondary px-3.5 py-2 rounded-lg border border-border">
                <Clock className="h-4 w-4 text-accent" />
                <span>
                  Expires:{" "}
                  <strong>
                    {new Date(entitlement.current_period_end).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Cards Grid */}
        <h2 className="text-lg font-bold text-text-primary mb-4">Available 30-Day Passes</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
          {/* Free Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary text-base">Free</h3>
                {currentPlanId === "free" && (
                  <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-text-primary">₹0</span>
                <span className="text-xs text-text-tertiary">/forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-text-secondary mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  1 active resume
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  3 templates (Modern, Minimal, ATS)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  A4 PDF export (with watermark)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  Basic ATS score check
                </li>
              </ul>
            </div>
            <button
              disabled
              className="w-full rounded-lg border border-border bg-surface-secondary py-2 text-xs font-semibold text-text-tertiary cursor-default"
            >
              {currentPlanId === "free" ? "Active" : "Included"}
            </button>
          </div>

          {/* Beginner Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary text-base">Beginner</h3>
                {currentPlanId === "beginner" && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-text-primary">₹{beginnerPrice}</span>
                <span className="text-xs text-text-tertiary">/30-day pass</span>
              </div>
              <ul className="space-y-2.5 text-xs text-text-secondary mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  3 active resumes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  All 5 templates unlocked
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  PDF export (NO watermark)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  Full ATS keyword analyzer
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  ~30 AI writing improvements / day
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade("beginner")}
              disabled={loadingPlan !== null}
              className="w-full rounded-lg bg-accent py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loadingPlan === "beginner" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{currentPlanId === "beginner" ? "Extend 30 Days" : "Get Beginner"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Pro Card */}
          <div className="rounded-2xl border-2 border-accent bg-surface p-6 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary text-base flex items-center gap-1.5">
                  Pro
                  <Sparkles className="h-4 w-4 text-accent" />
                </h3>
                {currentPlanId === "pro" && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-text-primary">₹{proPrice}</span>
                <span className="text-xs text-text-tertiary">/30-day pass</span>
              </div>
              <ul className="space-y-2.5 text-xs text-text-secondary mb-6">
                <li className="flex items-center gap-2 font-medium text-text-primary">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  Unlimited resumes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  All templates + Early access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  PDF + DOCX exports (NO watermark)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  Full ATS keyword analyzer
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  Generous AI writing assist
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUpgrade("pro")}
              disabled={loadingPlan !== null}
              className="w-full rounded-lg bg-accent py-2.5 text-xs font-bold text-white shadow-sm hover:bg-accent-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loadingPlan === "pro" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{currentPlanId === "pro" ? "Extend 30 Days" : "Upgrade to Pro"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payment History */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <Receipt className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Payment History</h2>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-tertiary">
              No payment transactions yet. When you purchase a pass, receipts will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-tertiary font-semibold uppercase">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Order ID</th>
                    <th className="pb-2.5">Plan</th>
                    <th className="pb-2.5">Amount</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p.id} className="text-text-secondary">
                      <td className="py-3">
                        {new Date(p.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 font-mono text-[11px]">
                        {p.razorpay_order_id || "N/A"}
                      </td>
                      <td className="py-3 font-medium text-text-primary capitalize">{p.plan}</td>
                      <td className="py-3 font-semibold text-text-primary">₹{p.amount_inr}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            p.status === "completed"
                              ? "bg-success-light text-success"
                              : p.status === "pending"
                              ? "bg-warning-light text-warning"
                              : "bg-danger-light text-danger"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
