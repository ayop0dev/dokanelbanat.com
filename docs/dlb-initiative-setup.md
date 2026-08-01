# DLB Initiative — Deployment Setup

The DLB Initiative runs entirely in the Astro Node application. It does not call WordPress, WooCommerce, or the Commerce Bridge.

## Google Cloud and Google Sheets

1. Create or select a Google Cloud project.
2. Enable the Google Sheets API.
3. Create a Service Account and generate JSON credentials.
4. Create the spreadsheet named `dlb-initiative-2026`.
5. Create a worksheet named `submissions`.
6. Leave row 1 completely empty. On the first real submission, the server writes the exact header row to columns A through AB, re-reads it, and verifies the complete schema before checking duplicates or appending applicant data.

If row 1 is populated manually, it must already match the following authoritative header row exactly:

```text
Application ID
Submitted At
Status
Email Status
Name
Age
Governorate
Study / Work Status
Study / Work Details
Proud Achievement
Initiative Reason
Expected Outcome
If Not Accepted
Has Project Idea
Project Idea
Desired Field
Biggest Fear
Failure Story
Idea Change Reaction
Biggest Strength
Trait To Improve
Letter To Future Self
WhatsApp
Email
Privacy Accepted
User Agent
Client IP
Submission Source
```

7. Share the spreadsheet with the Service Account email as **Editor**.

The API initializes headers only when the entire first row is empty. It never overwrites a partial or conflicting row, and it never creates, deletes, clears, or reorders worksheets.

## Hostinger Environment Variables

Configure these variables in the Astro Node.js application. Do not add their values to Git.

```text
GOOGLE_SPREADSHEET_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_PRIVATE_KEY_BASE64
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
SMTP_FROM_NAME
SMTP_FROM_EMAIL
DLB_RATE_LIMIT_MAX
DLB_RATE_LIMIT_WINDOW_SECONDS
```

For the most reliable Hostinger deployment, set `GOOGLE_PRIVATE_KEY_BASE64` to a Base64-encoded UTF-8 PKCS#8 PEM private key. When it is present, it takes priority over `GOOGLE_PRIVATE_KEY`. The server decodes it, normalizes line endings, validates the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` delimiters, and never exposes the value to the browser or logs.

If `GOOGLE_PRIVATE_KEY_BASE64` is not set, `GOOGLE_PRIVATE_KEY` remains supported. It may be stored with escaped newline sequences (`\n`) or as a multiline PEM; the server converts escaped sequences to real newlines, normalizes line endings, and validates the same PKCS#8 PEM delimiters.

For Hostinger production, configure Titan SMTP as follows:

```text
SMTP_HOST=smtp.titan.email
SMTP_PORT=587
```

Port 587 uses STARTTLS. Port 465 remains supported with implicit SSL. The sender is `DokanElbanat.com <info@dokanelbanat.com>`. The administrator notification recipient is fixed by the approved specification.

The two rate-limit variables are optional. Defaults are 5 attempts per client IP per 3600 seconds.

## Production Verification

1. Deploy the Astro application with all required environment variables.
2. Open `/dlb-initiative` and submit one real application.
3. Confirm a new row appears in `submissions` with all 28 columns in the documented order.
4. Confirm the generated ID uses the `DLB-2026-0001` format and matches the page and emails.
5. Confirm the applicant receives the HTML and plain-text capable confirmation email.
6. Confirm `dlb.egy@gmail.com` receives the administrator notification.
7. Confirm `Email Status` becomes `Sent`; test an SMTP failure separately and confirm it becomes `Failed` without losing the row.
8. Submit again with the same email and then the same WhatsApp number; confirm both are rejected without new rows or emails.
9. Confirm six attempts from one client IP within an hour produce HTTP 429 with default settings.
10. Inspect browser network traffic and confirm no Google or SMTP credentials or applicant data are sent anywhere except the first-party `/api/dlb-initiative` endpoint.
11. Inspect received-message headers and verify SPF, DKIM, and DMARC alignment for `info@dokanelbanat.com`.
