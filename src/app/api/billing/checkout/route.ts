import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { YoupiGatewayProvider } from "@/lib/payments/youpi";
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

    // Fetch plan price and duration server-side
    const { data: planRecord, error: planError } = await supabase
      .from("plans")
      .select("id, name, price_inr, duration_days")
      .eq("id", plan)
      .maybeSingle();

    if (planError || !planRecord) {
      return NextResponse.json({ error: "Plan configuration not found" }, { status: 404 });
    }

    const orderId = `YOUPI_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const youpi = new YoupiGatewayProvider();
    const session = await youpi.createPaymentSession({
      orderId,
      amount: planRecord.price_inr,
      plan,
      userId: user.id,
      customerEmail: user.email,
    });

    // Record pending payment in database using service role (bypass user RLS)
    const adminSupabase = createAdminClient();
    const { error: paymentInsertError } = await adminSupabase.from("payments").insert({
      user_id: user.id,
      razorpay_order_id: session.orderId,
      plan,
      amount_inr: planRecord.price_inr,
      status: "pending",
      metadata: {
        provider: "youpi",
        vpa: session.vpa,
        upiUri: session.upiUri,
        userEmail: user.email,
        planName: planRecord.name,
      },
    });

    if (paymentInsertError) {
      console.error("Failed to insert pending payment:", paymentInsertError);
    }

    return NextResponse.json({
      orderId: session.orderId,
      upiUri: session.upiUri,
      qrCodeUrl: session.qrCodeUrl,
      vpa: session.vpa,
      merchantName: session.merchantName,
      amount: session.amount,
      expiresAt: session.expiresAt,
      plan: planRecord,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Checkout initialization failed";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
