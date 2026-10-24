"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Check,
  Loader2,
  Clock,
  ArrowRight,
  Receipt,
  Copy,
  ExternalLink,
  ShieldCheck,
  X,
  Sparkles,
  AlertCircle,
  Download,
  Mail,
  RefreshCw,
} from "lucide-react";

export interface Plan {
  id: string;
  name: string;
  price_inr: number;
  duration_days: number;
  max_resumes: number;
  max_templates: number;
  max_ai_actions_daily: number;
  features: string[];
}

export interface Entitlement {
  id?: string;
  plan: string;
  status: string;
  current_period_end: string | null;
}

export interface Payment {
  id: string;
  provider_order_id?: string | null;
  razorpay_order_id?: string | null;
  plan: string;
  amount_inr: number;
  status: string;
  created_at: string;
}

interface BillingClientProps {
  plans: Plan[];
  entitlement: Entitlement | null;
  payments: Payment[];
  userEmail?: string;
  userName?: string;
}

interface CheckoutModalState {
  orderId: string;
  providerOrderId: string;
  provider: string;
  upiUri?: string;
  qrCodeUrl?: string;
  vpa?: string;
  merchantName: string;
  amount: number;
  planName: string;
  planId: string;
}

export function BillingClient({
  plans,
  entitlement,
  payments,
  userEmail,
}: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<CheckoutModalState | null>(null);
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [utrInput, setUtrInput] = useState<string>("");
  const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [trackingState, setTrackingState] = useState<
    "created" | "awaiting_payment" | "confirming" | "paid" | "failed" | "expired"
  >("created");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 min countdown
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

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

      setCheckoutModal({
        orderId: data.orderId,
        providerOrderId: data.providerOrderId || data.orderId,
        provider: data.provider || "direct_upi",
        upiUri: data.upiUri,
        qrCodeUrl: data.qrCodeUrl,
        vpa: data.vpa,
        merchantName: data.merchantName,
        amount: data.amount,
        planName: data.plan?.name || planId.toUpperCase(),
        planId,
      });
      setTrackingState("awaiting_payment");
      setSecondsRemaining(900);
      setUtrInput("");
      setUtrError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleConfirmUtr = async (utrValue: string) => {
    if (!checkoutModal) return;
    setIsSubmittingUtr(true);
    setUtrError(null);
    try {
      const res = await fetch("/api/billing/direct-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: checkoutModal.providerOrderId || checkoutModal.orderId,
          utr: utrValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm payment");
      }
      setTrackingState("paid");
      setSuccessMessage(`Payment confirmed! Your account is now active on the ${checkoutModal.planName} plan.`);
      setTimeout(() => {
        setCheckoutModal(null);
        router.refresh();
      }, 1800);
    } catch (err: unknown) {
      setUtrError(err instanceof Error ? err.message : "UTR verification failed");
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  // 15-minute countdown timer
  useEffect(() => {
    if (!checkoutModal || trackingState === "paid" || trackingState === "expired") return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTrackingState("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [checkoutModal, trackingState]);

  // Server-authoritative polling helper
  const checkStatus = useCallback(async () => {
    if (!checkoutModal || trackingState === "paid") return;
    try {
      const queryId = checkoutModal.providerOrderId || checkoutModal.orderId;
      const res = await fetch(`/api/billing/status?order_id=${encodeURIComponent(queryId)}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.paid) {
        setTrackingState("paid");
        setSuccessMessage(`Payment confirmed! Your account is now active on the ${checkoutModal.planName} plan.`);
        setTimeout(() => {
          setCheckoutModal(null);
          router.refresh();
        }, 1800);
      } else if (data.status === "processing" || data.status === "confirming") {
        setTrackingState("confirming");
      } else if (data.status === "failed") {
        setTrackingState("failed");
      } else if (data.status === "expired") {
        setTrackingState("expired");
      }
    } catch {
      // Continue polling silently
    }
  }, [checkoutModal, trackingState, router]);

  // 1. Supabase Realtime subscription on caller's payments row
  useEffect(() => {
    if (!checkoutModal) return;

    const supabase = createClient();
    const queryId = checkoutModal.providerOrderId || checkoutModal.orderId;

    const channel = supabase
      .channel(`payment_tracker_${checkoutModal.orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "payments",
        },
        (payload) => {
          const updated = payload.new as {
            provider_order_id?: string;
            razorpay_order_id?: string;
            status: string;
          };
          if (
            updated.provider_order_id === queryId ||
            updated.razorpay_order_id === queryId
          ) {
            if (updated.status === "paid" || updated.status === "completed") {
              setTrackingState("paid");
              setSuccessMessage(`Payment confirmed! Your account is now active on the ${checkoutModal.planName} plan.`);
              setTimeout(() => {
                setCheckoutModal(null);
                router.refresh();
              }, 1800);
            } else if (updated.status === "processing") {
              setTrackingState("confirming");
            } else if (updated.status === "failed") {
              setTrackingState("failed");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkoutModal, router]);

  // 2. 3-second polling fallback
  useEffect(() => {
    if (!checkoutModal || trackingState === "paid" || trackingState === "expired") return;
    const interval = setInterval(() => {
      checkStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [checkoutModal, trackingState, checkStatus]);

  // 3. visibilitychange re-sync: when user switches back from UPI app on mobile/desktop
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [checkStatus]);

  const handleCopyVpa = () => {
    if (checkoutModal?.vpa) {
      navigator.clipboard.writeText(checkoutModal.vpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-[#C9CCD1] pb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1 rounded-full bg-[#E6EEF4] px-2.5 py-0.5 text-[11px] font-bold text-[#5A4032]">
              <ShieldCheck className="h-3 w-3" /> Bank-Grade Verified Checkout
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#241915] sm:text-3xl">
            Plan & Billing
          </h1>
          <p className="mt-1 text-xs text-[#5E534D]">
            Manage your Xenvra Studio passes, vector export allowances, storage quotas, and payment receipts.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Active Plan Card */}
        <div className="rounded-2xl border border-[#C9CCD1] bg-[#FAF8F5] p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A8F98]">
                  Current Status
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {entitlement?.status === "active" ? "Active Subscription" : "Free Tier"}
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold text-[#241915] capitalize">
                {currentPlanId} Plan
              </h2>
              {entitlement?.current_period_end ? (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#5E534D]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Active through {new Date(entitlement.current_period_end).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })} (30-day non-renewing pass)
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-[#5E534D]">
                  Free standard tier with watermark export and basic resume templates.
                </p>
              )}
            </div>

            {currentPlanId === "free" ? (
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={loadingPlan !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5A4032] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#3D2B22] disabled:opacity-50 cursor-pointer"
              >
                {loadingPlan === "pro" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Upgrade to Pro — ₹{proPrice}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={loadingPlan !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#C9CCD1] bg-white px-4 py-2 text-xs font-semibold text-[#241915] hover:bg-[#F6F1EE] transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Extend 30 Days (₹{proPrice})</span>
              </button>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#241915]">Choose Your Plan</h2>
            <p className="text-xs text-[#5E534D]">30-day non-renewing passes. Zero hidden auto-debits. Activate in seconds.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free */}
            <div
              className={`flex flex-col rounded-2xl border p-6 bg-white shadow-xs ${
                currentPlanId === "free" ? "border-[#5A4032] ring-1 ring-[#5A4032]" : "border-[#C9CCD1]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#241915]">Free</h3>
                {currentPlanId === "free" && (
                  <span className="rounded-full bg-[#E6EEF4] px-2.5 py-0.5 text-[10px] font-bold text-[#5A4032]">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#5E534D]">Essential career tools</p>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-[#241915]">₹0</span>
                <span className="text-xs text-[#8A8F98]"> / forever</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 border-t border-[#C9CCD1] pt-6 text-xs text-[#5E534D]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>3 Active Design Documents</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Standard Resume Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>PDF Print (with &quot;Made with Xenvra&quot; watermark)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>50 MB Private Asset Storage</span>
                </li>
              </ul>

              <button
                disabled
                className="mt-6 w-full rounded-xl border border-[#C9CCD1] bg-[#F6F1EE] py-2.5 text-center text-xs font-semibold text-[#8A8F98]"
              >
                {currentPlanId === "free" ? "Active" : "Included"}
              </button>
            </div>

            {/* Beginner */}
            <div
              className={`flex flex-col rounded-2xl border p-6 bg-white shadow-xs ${
                currentPlanId === "beginner" ? "border-[#5A4032] ring-1 ring-[#5A4032]" : "border-[#C9CCD1]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#241915]">Beginner</h3>
                {currentPlanId === "beginner" && (
                  <span className="rounded-full bg-[#E6EEF4] px-2.5 py-0.5 text-[10px] font-bold text-[#5A4032]">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#5E534D]">For active campus & job seekers</p>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-[#241915]">₹{beginnerPrice}</span>
                <span className="text-xs text-[#8A8F98]"> / 30-day pass</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 border-t border-[#C9CCD1] pt-6 text-xs text-[#5E534D]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-[#241915]">Watermark-Free Exports (PDF, PNG)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>36+ Presentation Decks & Graphics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>50 AI Writing & Tailor Actions / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>25 Tracked Job Applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>500 MB Asset Storage</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade("beginner")}
                disabled={loadingPlan !== null || currentPlanId === "beginner"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] hover:bg-[#F6F1EE] py-2.5 text-xs font-bold text-[#241915] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingPlan === "beginner" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : currentPlanId === "beginner" ? (
                  "Active Plan"
                ) : (
                  <>
                    <span>Choose Beginner</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Pro */}
            <div
              className={`relative flex flex-col rounded-2xl border p-6 bg-gradient-to-b from-[#FAF8F5] to-white shadow-xs ${
                currentPlanId === "pro"
                  ? "border-[#5A4032] ring-2 ring-[#5A4032]"
                  : "border-[#5A4032]/40"
              }`}
            >
              <div className="absolute -top-3 right-4 rounded-full bg-[#5A4032] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                Most Popular
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#241915]">Pro Flagship</h3>
                {currentPlanId === "pro" && (
                  <span className="rounded-full bg-[#DCD3F2] px-2.5 py-0.5 text-[10px] font-bold text-[#5A4032]">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#5E534D]">Complete studio & career velocity</p>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-[#241915]">₹{proPrice}</span>
                <span className="text-xs text-[#8A8F98]"> / 30-day pass</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 border-t border-[#C9CCD1] pt-6 text-xs text-[#5E534D]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-[#241915]">Editable PPTX, Vector PDF & SVG</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-[#241915]">Unlimited Watermark-Free Exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>200 AI Writing & Tailor Actions / mo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Unlimited Job Tracker Kanban & Match Scores</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>2 GB Asset Storage Quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>30-Snapshot Version History</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade("pro")}
                disabled={loadingPlan !== null || currentPlanId === "pro"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5A4032] py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#3D2B22] disabled:opacity-50 cursor-pointer"
              >
                {loadingPlan === "pro" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : currentPlanId === "pro" ? (
                  "Active Plan"
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Get Pro Access</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Payment History & Invoices */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#241915]">Payment History & Receipts</h2>
            <div className="flex items-center gap-1.5 text-xs text-[#5E534D]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct Payment Gateway Verification</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#C9CCD1] bg-white shadow-xs">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8A8F98]">
                <Receipt className="mx-auto mb-2 h-7 w-7 opacity-30" />
                <p>No billing transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#C9CCD1] bg-[#FAF8F5] text-[#5E534D]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Plan</th>
                      <th className="px-5 py-3 font-semibold">Amount</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Order ID</th>
                      <th className="px-5 py-3 font-semibold text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9CCD1]">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                        <td className="px-5 py-3.5 text-[#241915]">
                          {new Date(p.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-bold uppercase text-[#5A4032]">
                          {p.plan}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#241915]">
                          ₹{p.amount_inr}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              p.status === "completed" || p.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : p.status === "awaiting_payment" || p.status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[10px] text-[#5E534D]">
                          {p.provider_order_id || p.razorpay_order_id || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setReceiptPayment(p)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A4032] hover:underline cursor-pointer"
                          >
                            <Download className="h-3 w-3" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Support & Legal Notes */}
        <div className="border-t border-[#C9CCD1] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5E534D] gap-2">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            <span>Need billing support? Email us at <a href="mailto:xenvra.official@gmail.com" className="font-semibold text-[#5A4032] underline">xenvra.official@gmail.com</a></span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/refund" className="hover:text-[#241915] underline">Refund Policy</a>
            <a href="/terms" className="hover:text-[#241915] underline">Terms of Service</a>
            <a href="/privacy" className="hover:text-[#241915] underline">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* Live Tracking Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
          <div className="relative w-full max-w-md rounded-2xl border border-[#C9CCD1] bg-white p-6 shadow-2xl animate-fade-in">
            {/* Close button */}
            <button
              onClick={() => setCheckoutModal(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-[#8A8F98] hover:bg-[#F6F1EE] hover:text-[#241915] transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E6EEF4] px-2.5 py-0.5 text-[11px] font-bold text-[#5A4032]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live Payment Tracking
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-[#241915]">
              Upgrade to {checkoutModal.planName} (₹{checkoutModal.amount.toFixed(2)})
            </h3>

            {/* Order Details & Countdown */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] px-3.5 py-2 text-xs">
              <span className="text-[#5E534D]">
                Order: <span className="font-mono font-bold text-[#241915]">{checkoutModal.orderId}</span>
              </span>
              <span className="flex items-center gap-1 font-mono font-bold text-[#5A4032]">
                <Clock className="h-3.5 w-3.5" />
                {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, "0")}
              </span>
            </div>

            {/* 4-State Live Tracking Indicator */}
            <div className="mt-4">
              {trackingState === "awaiting_payment" && (
                <div className="space-y-3.5">
                  {checkoutModal.qrCodeUrl && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-[#C9CCD1] bg-white p-3 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={checkoutModal.qrCodeUrl}
                        alt="UPI Payment QR Code"
                        className="h-44 w-44 object-contain"
                      />
                      <div className="mt-1.5 text-center text-[11px] font-semibold text-[#241915]">
                        Scan with GPay, PhonePe, Paytm, FamPay or any UPI App
                      </div>
                    </div>
                  )}

                  {/* Copy UPI VPA */}
                  {checkoutModal.vpa && (
                    <div className="flex items-center justify-between rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] px-3 py-2 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#8A8F98]">Direct Merchant VPA:</span>
                        <span className="font-mono font-bold text-[#241915]">{checkoutModal.vpa}</span>
                      </div>
                      <button
                        onClick={handleCopyVpa}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#E6EEF4] px-2.5 py-1 text-[11px] font-bold text-[#5A4032] hover:bg-[#DCD3F2] transition cursor-pointer"
                      >
                        {copiedVpa ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedVpa ? "Copied" : "Copy UPI ID"}</span>
                      </button>
                    </div>
                  )}

                  {/* 1-Tap Mobile UPI App Triggers */}
                  {checkoutModal.upiUri && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8F98]">
                        Tap to Pay with App:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                        <a
                          href={checkoutModal.upiUri.replace("upi://", "gpay://upi/")}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#C9CCD1] bg-white py-2 text-[#241915] shadow-2xs hover:bg-[#F6F1EE] transition"
                        >
                          <span>Google Pay</span>
                          <ExternalLink className="h-3 w-3 text-[#8A8F98]" />
                        </a>
                        <a
                          href={checkoutModal.upiUri.replace("upi://", "phonepe://")}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#C9CCD1] bg-white py-2 text-[#241915] shadow-2xs hover:bg-[#F6F1EE] transition"
                        >
                          <span>PhonePe</span>
                          <ExternalLink className="h-3 w-3 text-[#8A8F98]" />
                        </a>
                        <a
                          href={checkoutModal.upiUri.replace("upi://", "paytmmp://")}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#C9CCD1] bg-white py-2 text-[#241915] shadow-2xs hover:bg-[#F6F1EE] transition"
                        >
                          <span>Paytm</span>
                          <ExternalLink className="h-3 w-3 text-[#8A8F98]" />
                        </a>
                        <a
                          href={checkoutModal.upiUri}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#5A4032] py-2 text-white shadow-2xs hover:bg-[#3D2B22] transition"
                        >
                          <span>FamPay / Other</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Manual UTR Reference Input */}
                  <div className="rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#241915]">
                        Paid? Enter 12-Digit UTR / Ref No.
                      </span>
                      <span className="text-[10px] text-[#8A8F98]">Instant Verification</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={12}
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 428901234567"
                        className="flex-1 rounded-lg border border-[#C9CCD1] bg-white px-3 py-1.5 text-xs font-mono font-semibold text-[#241915] focus:outline-none focus:ring-1 focus:ring-[#5A4032]"
                      />
                      <button
                        onClick={() => handleConfirmUtr(utrInput)}
                        disabled={isSubmittingUtr || utrInput.length !== 12}
                        className="rounded-lg bg-[#5A4032] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#3D2B22] disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmittingUtr ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify"}
                      </button>
                    </div>
                    {utrError && <p className="text-[11px] font-medium text-red-600">{utrError}</p>}

                    {/* Instant Demo Test Unlock Shortcut */}
                    <div className="pt-2 border-t border-[#C9CCD1]/50 flex items-center justify-between text-[11px]">
                      <span className="text-[#8A8F98]">Testing without real payment?</span>
                      <button
                        type="button"
                        onClick={() => handleConfirmUtr(`DEMO_${Date.now()}`)}
                        disabled={isSubmittingUtr}
                        className="font-bold text-[#5A4032] underline hover:text-[#3D2B22] cursor-pointer"
                      >
                        ⚡ 1-Click Demo Unlock
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] p-2.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-[#5E534D]">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5A4032] opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5A4032]"></span>
                      </span>
                      <span>Listening for transaction... Confirms automatically in Realtime</span>
                    </div>
                  </div>
                </div>
              )}

              {trackingState === "confirming" && (
                <div className="py-8 text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#5A4032] mx-auto" />
                  <p className="text-sm font-bold text-[#241915]">Payment Received!</p>
                  <p className="text-xs text-[#5E534D]">Confirming cryptographic transaction on ledger...</p>
                </div>
              )}

              {trackingState === "paid" && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6" />
                  </div>
                  <p className="text-base font-bold text-[#241915]">Plan Activated!</p>
                  <p className="text-xs text-[#5E534D]">All Studio features and quotas have been unlocked.</p>
                </div>
              )}

              {trackingState === "expired" && (
                <div className="py-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Clock className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-[#241915]">Order Window Expired</p>
                  <p className="text-xs text-[#5E534D]">No payment was captured. Orders expire after 15 minutes for your security.</p>
                  <button
                    onClick={() => handleUpgrade(checkoutModal.planId as "beginner" | "pro")}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#5A4032] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2B22]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Create New Order</span>
                  </button>
                </div>
              )}

              {trackingState === "failed" && (
                <div className="py-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-[#241915]">Payment Failed</p>
                  <p className="text-xs text-[#5E534D]">The gateway reported a payment failure. Please try again or contact support.</p>
                  <button
                    onClick={() => setCheckoutModal(null)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-[#C9CCD1] bg-white px-4 py-2 text-xs font-bold text-[#241915]"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
          <div className="relative w-full max-w-md rounded-2xl border border-[#C9CCD1] bg-white p-6 shadow-2xl">
            <button
              onClick={() => setReceiptPayment(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-[#8A8F98] hover:text-[#241915]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-[#C9CCD1] pb-4 mb-4">
              <h3 className="text-lg font-extrabold text-[#241915]">Payment Receipt</h3>
              <p className="text-[11px] text-[#5E534D]">Xenvra Design Studio · Official Transaction Record</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#C9CCD1]/50">
                <span className="text-[#8A8F98]">Receipt ID:</span>
                <span className="font-mono font-bold text-[#241915]">{receiptPayment.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#C9CCD1]/50">
                <span className="text-[#8A8F98]">Order Ref:</span>
                <span className="font-mono text-[#241915]">{receiptPayment.provider_order_id || receiptPayment.razorpay_order_id || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#C9CCD1]/50">
                <span className="text-[#8A8F98]">Plan Pass:</span>
                <span className="font-bold uppercase text-[#5A4032]">{receiptPayment.plan} (30 Days)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#C9CCD1]/50">
                <span className="text-[#8A8F98]">Amount Paid:</span>
                <span className="font-extrabold text-[#241915]">₹{receiptPayment.amount_inr}.00 INR</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#C9CCD1]/50">
                <span className="text-[#8A8F98]">Status:</span>
                <span className="font-bold text-emerald-700 capitalize">{receiptPayment.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#C9CCD1]/50">
                <span className="text-[#8A8F98]">Date:</span>
                <span className="text-[#241915]">{new Date(receiptPayment.created_at).toLocaleString("en-IN")}</span>
              </div>
              {userEmail && (
                <div className="flex justify-between py-1">
                  <span className="text-[#8A8F98]">Billed To:</span>
                  <span className="text-[#241915]">{userEmail}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#C9CCD1] flex items-center justify-between">
              <span className="text-[10px] text-[#8A8F98]">xenvra.official@gmail.com</span>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5A4032] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#3D2B22] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
