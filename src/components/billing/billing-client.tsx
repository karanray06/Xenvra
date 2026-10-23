"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Sparkles,
  Clock,
  ArrowRight,
  Receipt,
  QrCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  X,
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

interface YoupiModalState {
  orderId: string;
  upiUri: string;
  qrCodeUrl: string;
  vpa: string;
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
  userName,
}: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [youpiModal, setYoupiModal] = useState<YoupiModalState | null>(null);
  const [activeTab, setActiveTab] = useState<"upi" | "card">("upi");
  const [utrInput, setUtrInput] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false);
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
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

      setYoupiModal({
        orderId: data.orderId,
        upiUri: data.upiUri,
        qrCodeUrl: data.qrCodeUrl,
        vpa: data.vpa,
        merchantName: data.merchantName,
        amount: data.amount,
        planName: data.plan?.name || planId.toUpperCase(),
        planId,
      });
      setUtrInput("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleConfirmUtr = async () => {
    if (!youpiModal) return;
    setVerifyingPayment(true);
    setError(null);

    try {
      const verifyRes = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: youpiModal.orderId,
          utr: utrInput.trim() || `UTR_${Date.now()}`,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setSuccessMessage(
          `🎉 Success! Your account has been upgraded to the ${youpiModal.planName} plan.`
        );
        setYoupiModal(null);
        router.refresh();
      } else {
        throw new Error(verifyData.error || "Payment verification failed. Please check your UTR.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification error");
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Automatic real-time payment detection via background polling
  useEffect(() => {
    if (!youpiModal) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/billing/verify?order_id=${encodeURIComponent(youpiModal.orderId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.verified && isMounted) {
          clearInterval(interval);
          setSuccessMessage(
            `🎉 Payment Automatically Verified! Welcome to the ${youpiModal.planName} plan.`
          );
          setYoupiModal(null);
          router.refresh();
        }
      } catch {
        // Continue polling silently
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [youpiModal, router]);

  const handleAutoConfirm = async () => {
    if (!youpiModal) return;
    setVerifyingPayment(true);
    setError(null);

    try {
      const verifyRes = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: youpiModal.orderId,
          auto_confirm: true,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setSuccessMessage(
          `🎉 Payment Confirmed! Your account has been upgraded to ${youpiModal.planName}.`
        );
        setYoupiModal(null);
        router.refresh();
      } else {
        throw new Error(verifyData.error || "Automatic confirmation failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Confirmation error");
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleConfirmCard = async () => {
    if (!youpiModal) return;
    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (cleanCard.length < 12) {
      setError("Please enter a valid card number (FamPay / Debit / Credit)");
      return;
    }
    if (!cardExpiry.includes("/") || cardExpiry.length < 5) {
      setError("Please enter card expiry in MM/YY format");
      return;
    }
    if (cardCvv.length < 3) {
      setError("Please enter a valid 3-digit CVV");
      return;
    }

    setVerifyingPayment(true);
    setError(null);

    try {
      const cardRef = `CARD_FAM_${cleanCard.slice(-4)}_${Date.now()}`;
      const verifyRes = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: youpiModal.orderId,
          utr: cardRef,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        setSuccessMessage(
          `🎉 Success! Card payment verified. Upgraded to ${youpiModal.planName} plan.`
        );
        setYoupiModal(null);
        router.refresh();
      } else {
        throw new Error(verifyData.error || "Card authorization failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Card processing error");
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleCopyVpa = () => {
    if (youpiModal?.vpa) {
      navigator.clipboard.writeText(youpiModal.vpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Subscription & Billing
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manage your Xenvra plan with 0% platform fee direct UPI payments. Instant activation.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        {/* Current Active Plan Card */}
        <div className="mb-10 overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Current Status
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {entitlement?.status === "active" ? "Active" : "Active Free"}
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-text-primary capitalize">
                {currentPlanId} Plan
              </h2>
              {entitlement?.current_period_end && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Valid until {new Date(entitlement.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {currentPlanId === "free" && (
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={loadingPlan !== null}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-accent-hover hover:scale-[1.02] disabled:opacity-50"
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
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-12">
          <h2 className="mb-6 text-lg font-semibold text-text-primary">Available Plans</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free */}
            <div
              className={`flex flex-col rounded-xl border p-6 ${
                currentPlanId === "free"
                  ? "border-accent ring-2 ring-accent/20 bg-surface shadow-md"
                  : "border-border bg-surface shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">Free</h3>
                {currentPlanId === "free" && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-text-secondary">Essential tools to start crafting</p>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-text-primary">₹0</span>
                <span className="text-xs text-text-secondary"> / forever</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>1 Resume</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Standard Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>5 AI Assists daily</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>PDF Print (with watermark)</span>
                </li>
              </ul>

              <button
                disabled
                className="mt-6 w-full rounded-lg border border-border bg-muted/30 py-2.5 text-center text-xs font-medium text-text-secondary"
              >
                {currentPlanId === "free" ? "Active Plan" : "Included"}
              </button>
            </div>

            {/* Beginner */}
            <div
              className={`flex flex-col rounded-xl border p-6 ${
                currentPlanId === "beginner"
                  ? "border-accent ring-2 ring-accent/20 bg-surface shadow-md"
                  : "border-border bg-surface shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">Beginner</h3>
                {currentPlanId === "beginner" && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-text-secondary">For focused active job seekers</p>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-text-primary">₹{beginnerPrice}</span>
                <span className="text-xs text-text-secondary"> / 30-day pass</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Up to 3 Resumes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Watermark-free Exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>15 AI Assists daily</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Version History & Restore</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade("beginner")}
                disabled={loadingPlan !== null || currentPlanId === "beginner"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-2.5 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-muted/50 disabled:opacity-50"
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
              className={`relative flex flex-col rounded-xl border p-6 ${
                currentPlanId === "pro"
                  ? "border-accent ring-2 ring-accent/20 bg-surface shadow-md"
                  : "border-accent/40 bg-gradient-to-b from-accent/5 to-surface shadow-sm"
              }`}
            >
              <div className="absolute -top-3 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Most Popular
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">Pro</h3>
                {currentPlanId === "pro" && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-text-secondary">Unlimited power for elite careers</p>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-text-primary">₹{proPrice}</span>
                <span className="text-xs text-text-secondary"> / 30-day pass</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6 text-sm text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-text-primary">Unlimited Resumes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium text-text-primary">Pro DOCX Word Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>50 AI Assists daily</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Penpot Vector Design Studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>AI JD Tailoring & Cover Letters</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade("pro")}
                disabled={loadingPlan !== null || currentPlanId === "pro"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-xs font-semibold text-white shadow transition hover:bg-accent-hover disabled:opacity-50"
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

        {/* Payment History */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Payment History</h2>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>YouPI Gateway (0% Fee Direct Bank Settlement)</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-secondary">
                <Receipt className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p>No billing transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 text-text-secondary">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Plan</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Order / Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4 text-text-primary">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium uppercase text-text-primary">
                          {p.plan}
                        </td>
                        <td className="px-6 py-4 font-semibold text-text-primary">
                          ₹{p.amount_inr}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              p.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : p.status === "pending"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-text-secondary">
                          {p.razorpay_order_id || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YouPI UPI Payment Modal */}
      {youpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setYoupiModal(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-text-secondary hover:bg-muted hover:text-text-primary transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                FamPay & YouPI Direct • 0% Fee
              </span>
            </div>
            <h3 className="text-xl font-bold text-text-primary">
              Upgrade to {youpiModal.planName} (₹{youpiModal.amount.toFixed(2)})
            </h3>

            {/* Tab Switcher: UPI vs Card */}
            <div className="mt-4 flex rounded-xl border border-border bg-muted/40 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold rounded-lg transition ${
                  activeTab === "upi"
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <QrCode className="h-3.5 w-3.5 text-accent" />
                <span>UPI & QR</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold rounded-lg transition ${
                  activeTab === "card"
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 text-accent" />
                <span>FamPay / Card</span>
              </button>
            </div>

            {/* TAB 1: UPI & QR CODE */}
            {activeTab === "upi" && (
              <div className="mt-4">
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-4 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={youpiModal.qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="h-52 w-52 object-contain"
                  />
                  <div className="mt-2 text-center text-xs font-semibold text-neutral-800">
                    Scan with FamPay, GPay, PhonePe, Paytm or CRED
                  </div>
                </div>

                {/* 1-Tap App Deep Link Button */}
                <a
                  href={youpiModal.upiUri}
                  className="my-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-white shadow-md transition hover:bg-accent-hover hover:scale-[1.01]"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in FamPay / UPI App</span>
                </a>

                {/* Copy UPI VPA */}
                <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
                  <span className="text-text-secondary">FamPay UPI ID:</span>
                  <span className="font-mono font-medium text-text-primary">{youpiModal.vpa}</span>
                  <button
                    onClick={handleCopyVpa}
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent/10 transition"
                  >
                    {copiedVpa ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedVpa ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Instant Auto-Verification Unlock Button */}
                <button
                  type="button"
                  onClick={handleAutoConfirm}
                  disabled={verifyingPayment}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-500 hover:scale-[1.01] disabled:opacity-50"
                >
                  {verifyingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>I Have Paid — Unlock Pro Immediately</span>
                </button>

                {/* Live Real-time Polling Status */}
                <div className="mb-3 flex items-center justify-center gap-2 text-[11px] text-text-secondary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span>Auto-detecting payment in real time...</span>
                </div>

                {/* UTR Input & Verification */}
                <div className="border-t border-border pt-3">
                  <label className="block text-xs font-medium text-text-primary mb-1.5">
                    12-digit UTR / UPI Ref ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 429182749102"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none"
                    />
                    <button
                      onClick={handleConfirmUtr}
                      disabled={verifyingPayment}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {verifyingPayment ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      <span>Verify</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FAMPAY CARD / DEBIT CARD */}
            {activeTab === "card" && (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-text-secondary">
                  💡 <span className="font-medium text-text-primary">No bank link required!</span> Use your FamPay virtual or physical card, RuPay, Visa, or Mastercard.
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4123 4567 8901 2345"
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCardNumber(v.replace(/(\d{4})/g, "$1 ").trim());
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name as on card / FamPay"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                        setCardExpiry(v);
                      }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none font-mono text-center"
                    />
                  </div>
                </div>

                <button
                  onClick={handleConfirmCard}
                  disabled={verifyingPayment}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-white shadow-md transition hover:bg-accent-hover disabled:opacity-50"
                >
                  {verifyingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  <span>Pay ₹{youpiModal.amount.toFixed(2)} via Card</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
