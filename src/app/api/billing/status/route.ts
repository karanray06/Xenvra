import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET: Authenticated order status checking endpoint.
 * Only returns status for orders belonging to the authenticated caller.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id") || searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "order_id query parameter is required" }, { status: 400 });
    }

    // Query with user-scoped client to guarantee user only accesses their own payments
    const { data: paymentRecord, error } = await supabase
      .from("payments")
      .select("id, provider_order_id, razorpay_order_id, plan, status, amount_inr, amount_paise, created_at, paid_at, user_id")
      .or(`provider_order_id.eq.${orderId},razorpay_order_id.eq.${orderId}`)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Payment status lookup query error:", error);
      return NextResponse.json({ error: "Failed to retrieve payment status" }, { status: 500 });
    }

    if (!paymentRecord) {
      return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 });
    }

    const isPaid = paymentRecord.status === "paid" || paymentRecord.status === "completed";

    return NextResponse.json({
      orderId,
      status: paymentRecord.status,
      paid: isPaid,
      plan: paymentRecord.plan,
      amount_inr: paymentRecord.amount_inr,
      created_at: paymentRecord.created_at,
      paid_at: paymentRecord.paid_at,
    });
  } catch (err: unknown) {
    console.error("Order status check exception:", err);
    return NextResponse.json({ error: "Failed to retrieve payment status" }, { status: 500 });
  }
}
