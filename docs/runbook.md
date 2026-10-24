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

### Razorpay Webhook Secret & Key Secret
1. In **Razorpay Dashboard → Settings → Webhooks**, edit the webhook URL:
   - Generate a new 32+ character random alphanumeric secret.
2. In **Vercel Dashboard**, update `RAZORPAY_WEBHOOK_SECRET` and trigger redeploy.
3. If rotating `RAZORPAY_KEY_SECRET`:
   - Generate a new key in **Razorpay → Settings → API Keys**.
   - Update `RAZORPAY_KEY_SECRET` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` simultaneously in Vercel.

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
   - In Supabase Dashboard → Table Editor → `payments`, search by `provider_payment_id` or user email.
2. **Execute Gateway Refund**:
   - In Razorpay Dashboard → **Payments**, search the payment ID.
   - Click **Issue Refund** (Full or Partial amount).
3. **Webhook Automatic Reconciliation**:
   - Razorpay emits a `refund.processed` webhook event to `/api/billing/webhook/razorpay`.
   - The route validates HMAC signatures and marks the payment status as `refunded`.
4. **Manual Status Override (if needed)**:
   ```sql
   UPDATE payments
   SET status = 'refunded',
       raw_event = jsonb_set(coalesce(raw_event, '{}'::jsonb), '{refund_note}', '"Manual refund processed"')
   WHERE provider_payment_id = 'pay_...';
   ```

---

## 3. Incident Response Playbooks

### Incident A: Sudden Spike in Failed Webhooks (400/401)
- **Symptom**: Razorpay webhook delivery fails with `Invalid HMAC signature` or `Stale timestamp`.
- **Cause**: Clock drift between servers (> 5 minutes skew) or mismatched `RAZORPAY_WEBHOOK_SECRET`.
- **Resolution**:
  1. Inspect Vercel runtime logs for `[Security] Webhook rejected: ...`.
  2. Verify that the webhook secret in Razorpay exactly matches `RAZORPAY_WEBHOOK_SECRET` without whitespace.
  3. Verify NTP server synchronization if using an external gateway host.

### Incident B: User Reports Paid but Plan Not Unlocked
- **Resolution**:
  1. Have user visit **Settings → Plan & Billing** (`/dashboard/settings#billing`).
  2. The page initiates an automatic fallback sync with `/api/billing/status?order_id=...`.
  3. If payment row is in `needs_review` or `awaiting_payment`, verify whether bank settlement was received.
  4. To manually fulfill:
     ```sql
     SELECT fulfil_payment(
       p_provider => 'razorpay',
       p_order_id => '<order_id>',
       p_payment_id => '<payment_id>',
       p_amount_paise => 4900,
       p_raw => '{"manual_override": true, "admin": "karan"}'::jsonb
     );
     ```

### Incident C: Rate Limiter Blocking Legitimate Traffic (429)
- **Symptom**: Users receiving `429 Too Many Requests`.
- **Mitigation**:
  - The rate limiter uses sliding window budgets: Auth 10/min, Billing 10/min, General 120/min.
  - If Upstash Redis is unreachable, the fallback in-memory limiter automatically activates without crashing requests.
