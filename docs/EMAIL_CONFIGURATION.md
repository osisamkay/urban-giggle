# ShareSteak Email Configuration Guide

This document explains how to configure custom SMTP for the ShareSteak application to enable reliable email delivery in production.

## Overview

By default, Supabase provides basic email functionality, but it has limitations:
- Rate limits on outgoing emails
- Limited customization options
- Not recommended for production use

For production, you should configure a custom SMTP provider.

## Recommended Email Providers

### 1. Resend (Recommended)
- **Website**: https://resend.com
- **Free tier**: 3,000 emails/month
- **Best for**: Modern developer experience, great deliverability

### 2. SendGrid
- **Website**: https://sendgrid.com
- **Free tier**: 100 emails/day
- **Best for**: High volume, enterprise features

### 3. Mailgun
- **Website**: https://mailgun.com
- **Free tier**: 5,000 emails/month (trial)
- **Best for**: Developer-friendly API, analytics

### 4. Amazon SES
- **Website**: https://aws.amazon.com/ses/
- **Pricing**: Pay-as-you-go (~$0.10/1000 emails)
- **Best for**: AWS infrastructure, cost-effective at scale

---

## Configuration Steps

### Step 1: Choose and Set Up Your Email Provider

#### For Resend:
1. Create an account at https://resend.com
2. Verify your domain (add DNS records)
3. Generate an API key
4. Note your SMTP credentials:
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (TLS)
   - Username: `resend`
   - Password: Your API key

### Step 2: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Auth** → **SMTP Settings**
3. Enable **"Use Custom SMTP"**
4. Fill in your provider's details:
   - **Sender email**: `noreply@yourdomain.com`
   - **Sender name**: `ShareSteak`
   - **Host**: (from your provider)
   - **Port**: (from your provider, usually 465 or 587)
   - **Username**: (from your provider)
   - **Password**: (your API key or password)
5. Click **Save**

### Step 3: Test Email Delivery

1. Try the "password reset" flow in your application
2. Check that emails are being received
3. Monitor your email provider's dashboard for delivery status

---

## Email Templates

Supabase allows customization of email templates for:
- **Confirmation emails** (signup verification)
- **Magic link emails** (passwordless login)
- **Password reset emails**
- **Invite emails** (merchant invitations)

To customize templates:
1. Go to **Settings** → **Auth** → **Email Templates**
2. Modify the HTML/text templates as needed
3. Use template variables like `{{ .ConfirmationURL }}`

### Recommended Template Variables:
- `{{ .ConfirmationURL }}` - Confirmation/magic link URL
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your app's URL

---

## Environment Variables

Ensure these are set in your `.env.local` file:

```env
# Email configuration (for direct API usage if needed)
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=ShareSteak

# If using Resend directly (optional)
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## Troubleshooting

### Emails not being sent
1. Check Supabase SMTP settings are saved correctly
2. Verify your email provider credentials
3. Check for rate limiting
4. Review Supabase logs: **Logs** → **Auth**

### Emails going to spam
1. Set up proper SPF, DKIM, and DMARC records
2. Use a verified domain (not a free email service)
3. Ensure your sender email matches your domain

### Magic link not working
1. Verify `NEXT_PUBLIC_APP_URL` is set correctly
2. Check the redirect URL in Supabase dashboard matches your domain
3. Ensure cookies are being set properly (check HTTPS requirements)

---

## Production Checklist

- [ ] Custom SMTP provider configured
- [ ] Domain verified with email provider
- [ ] SPF, DKIM, DMARC records configured
- [ ] Email templates customized
- [ ] Password reset flow tested
- [ ] Magic link flow tested
- [ ] Merchant invitation flow tested
- [ ] Monitoring/alerting set up for email delivery

---

## Support

For issues with email delivery:
1. Check your email provider's documentation
2. Review Supabase Auth logs
3. Test with a different email address
4. Contact your email provider's support if needed
