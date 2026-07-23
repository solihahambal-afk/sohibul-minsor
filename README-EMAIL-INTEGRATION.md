# Supabase Edge Functions & Resend Email Integration

This project uses **Supabase Edge Functions** and **Database Webhooks** as a secure, event-driven architecture to send emails automatically. No emails are sent from the frontend.

## 1. Environment Variables & Supabase Secrets

To connect Supabase with Resend, you must store the required environment variables as **Supabase Secrets** so your Edge Function can access them securely.

Run the following Supabase CLI commands (or use the Supabase Dashboard):

```bash
supabase secrets set RESEND_API_KEY="re_your_api_key_here"
supabase secrets set RESEND_FROM_EMAIL="onboarding@resend.dev"
supabase secrets set ADMIN_EMAIL="sohibulminsorhelpdesk@gmail.com"
```

## 2. Deploying the Edge Function

We have created an Edge Function located in `supabase/functions/email-handler/index.ts`. Deploy it using the Supabase CLI:

```bash
supabase functions deploy email-handler --no-verify-jwt
```
> Note: We skip JWT verification because Database Webhooks from Postgres `pg_net` might not always carry the end-user's JWT, but they provide the service role key or are authorized via internal network.

## 3. Deploying the SQL Migrations (Webhooks)

The `email-handler` edge function is triggered by Database Webhooks via the `pg_net` extension.
We have provided a SQL migration file in `supabase/migrations/20260718_email_webhooks.sql` that sets up:
1. The `handle_email_webhooks()` Postgres trigger function.
2. Triggers on `INSERT` and `UPDATE` for all relevant tables (`subscribers`, `messages`, `news`, `scholarships`, `services`, `hajj_umrah_packages`).

To apply the migrations to your remote Supabase project:

```bash
supabase db push
```

Alternatively, you can manually run the SQL from the `supabase/migrations` folder directly in your Supabase SQL Editor.

## 4. How the Email Triggers Work

1. **New Subscriber (`subscribers` table)**
   - Triggered on `INSERT`.
   - Sends a "Welcome" confirmation email using Resend.
  
2. **Contact Form Submission (`messages` table)**
   - Triggered on `INSERT`.
   - Sends an email to the `ADMIN_EMAIL` with the form details.
   - Sends an automated reply back to the visitor confirming receipt.

3. **News & Updates (`news`, `scholarships`, `services`, `hajj_umrah_packages` tables)**
   - Triggered on `INSERT` and `UPDATE`.
   - Checks if the item has been newly published (e.g. `status` changed to 'Published' or 'Active').
   - Broadcasts the update to all Active subscribers using BCC chunks.
  
4. **Password Change Confirmation**
   - Directly invoked by the frontend `AdminProfile` using `supabase.functions.invoke('email-handler', ...)` because auth password changes don't easily trigger standard webhooks with old vs new password comparison in `auth.users`.
   - Sends a security alert confirmation to the user.

## 5. Security & Error Handling

- Emails are only sent **after successful database transactions** (the AFTER trigger fires only when data is securely saved).
- Duplicate emails are prevented by state checking (e.g. comparing `OLD.status` with `NEW.status` in the webhook payload).
- Deno Edge functions provide high scalability and secure isolation for the Resend integration.
