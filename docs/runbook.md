# Xenvra Studio — Operations & Incident Runbook

This runbook guides on-call engineers managing the production infrastructure of Xenvra Studio (`https://xenvraresume.vercel.app`).

---

## 1. Secrets Rotation Runbook

### Supabase Service Role Key
1. In **Supabase Dashboard → Settings → API**, scroll to **Project API keys**.
2. Click **Generate new secret key** for `service_role`.
3. Update `SUPABASE_SERVICE_ROLE_KEY` in **Vercel Dashboard → Settings → Environment Variables**.
4. Redeploy the latest production deployment to propagate the new environment variable.
5. In Supabase Dashboard, delete the old service role key after 5 minutes of verification.

### Direct UPI VPA & Merchant Name
1. If changing merchant VPA or merchant name:
   - Update `NEXT_PUBLIC_UPI_VPA` (e.g. `7980398203@fam`) and `NEXT_PUBLIC_MERCHANT_NAME` (`Xenvra`) in **Vercel Dashboard**.
   - Trigger a redeploy to publish the updated dynamic QR code generator.

### CRON_SECRET
1. Generate a new high-entropy string: `openssl rand -hex 32`.
2. Update `CRON_SECRET` in Vercel environment variables.
3. Test cron route authentication:
   ```bash
   curl -H "Authorization: Bearer <NEW_CRON_SECRET>" https://xenvraresume.vercel.app/api/cron/expire
   ```

---

## 2. Refund Handling Flow

All payments are made as 30-day non-renewing passes. When an authorized refund request is received at `xenvra.official@gmail.com`:

1. **Locate Payment Record**:
   - In Supabase Dashboard → Table Editor → `payments`, search by `provider_payment_id` (UTR) or user email.
2. **Execute UPI Refund**:
   - Use your UPI application (FamPay, Google Pay, PhonePe) to refund the ₹29 or ₹49 directly to the payer's VPA.
3. **Database Status Override**:
   ```sql
   UPDATE payments
   SET status = 'refunded',
       raw_event = jsonb_set(coalesce(raw_event, '{}'::jsonb), '{refund_note}', '"Manual UPI refund processed"')
   WHERE provider_payment_id = '<UTR_NUMBER>';
   ```

---

## 3. Incident Response Playbooks

### Incident A: User Reports Paid via UPI but Plan Not Unlocked
- **Resolution**:
  1. Have user visit **Settings → Plan & Billing** (`/dashboard/settings#billing`).
  2. The user can simply enter their 12-digit UPI Reference Number / UTR in the checkout modal to trigger `/api/billing/direct-confirm`.
  3. If manual fulfillment is needed by an administrator in Supabase SQL editor:
     ```sql
     SELECT fulfil_payment(
       p_provider => 'direct_upi',
       p_order_id => '<order_id>',
       p_payment_id => '<12_digit_utr>',
       p_amount_paise => 4900,
       p_raw => '{"manual_override": true, "admin": "karan"}'::jsonb
     );
     ```

### Incident C: Rate Limiter Blocking Legitimate Traffic (429)
- **Symptom**: Users receiving `429 Too Many Requests`.
- **Mitigation**:
  - The rate limiter uses sliding window budgets: Auth 10/min, Billing 10/min, General 120/min.
  - If Upstash Redis is unreachable, the fallback in-memory limiter automatically activates without crashing requests.
