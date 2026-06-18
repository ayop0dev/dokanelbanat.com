# Email & SMTP Configuration Checklist

## Sender identity

All outgoing WooCommerce transactional emails are overridden by the Commerce Bridge plugin to:

- **From:** Dokanelbanat <info@dokanelbanat.com>
- **Reply-To:** info@dokanelbanat.com

Never use WordPress default `wordpress@...` or Hostinger's default mailer.

## Authenticated SMTP

Configure WooCommerce to use an authenticated SMTP relay. Recommended plugins: WP Mail SMTP or FluentSMTP.

Settings:
- **SMTP host:** your provider (e.g. smtp.zoho.com, smtp.mailgun.org)
- **Port:** 587 (STARTTLS) or 465 (SSL)
- **Username:** info@dokanelbanat.com
- **Password:** stored in wp-config.php — never in Git

## DNS records required

| Type | Host | Value |
|------|------|-------|
| SPF | @ | `v=spf1 include:<smtp-provider> ~all` |
| DKIM | `<selector>._domainkey` | provided by SMTP provider |
| DMARC | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:info@dokanelbanat.com` |
| Return-Path | mail | SMTP provider's bounce address (MX alignment) |

## Custom tracking domain (optional)

If using Mailgun, SendGrid, or similar:
- Set a custom tracking domain (e.g. `track.dokanelbanat.com`) to avoid open/click tracking URLs revealing third-party domains.

## Email images and logos

- All email logos and images must be hosted at `dokanelbanat.com` URLs.
- Never reference `blog.dokanelbanat.com` in email HTML or image src attributes.
- Use the WordPress Customizer or WooCommerce email template overrides to set logo URL to `https://dokanelbanat.com/logo.png`.

## Verification steps

1. Send a test email from WordPress admin → WooCommerce → Settings → Emails → Preview.
2. Check "View raw source" of the received email:
   - `From:` must be `Dokanelbanat <info@dokanelbanat.com>`
   - `Reply-To:` must be `info@dokanelbanat.com`
   - No links or images pointing to `blog.dokanelbanat.com`
   - Download link must use `https://dokanelbanat.com/download/{token}`
3. Verify SPF, DKIM, DMARC pass using a tool like mail-tester.com.
