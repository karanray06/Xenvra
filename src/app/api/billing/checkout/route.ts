import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RazorpayProvider } from "@/lib/payments/razorpay";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["beginner", "pro"]),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = checkoutSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const { plan } = parseResult.data;

    // Fetch plan price and duration server-side (never trust client price)
    const { data: planRecord, error: planError } = await supabase
      .from("plans")
      .select("id, name, price_inr, duration_days")
      .eq("id", plan)
      .maybeSingle();

    if (planError || !planRecord) {
      return NextResponse.json({ error: "Plan configuration not found" }, { status: 404 });
    }

    const razorpay = new RazorpayProvider();
    const order = await razorpay.createOrder({
      userId: user.id,
      plan,
      amountInr: planRecord.price_inr,
    });

    // Record pending payment in database
    const { error: paymentInsertError } = await supabase.from("payments").insert({
      user_id: user.id,
      razorpay_order_id: order.orderId,
      plan,
      amount_inr: planRecord.price_inr,
      status: "pending",
      metadata: {
        userEmail: user.email,
        planName: planRecord.name,
      },
    });

    if (paymentInsertError) {
      console.error("Failed to insert pending payment:", paymentInsertError);
    }

    return NextResponse.json({
      orderId: order.orderId,
      clientConfig: order.clientConfig,
      plan: planRecord,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Checkout initialization failed";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
