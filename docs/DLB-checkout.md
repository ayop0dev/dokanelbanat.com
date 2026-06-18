Work in the repository ayop0dev/dokanelbanat.com.

Goal:
Convert the current Astro 5 project from static output to production-ready Node.js SSR for deployment as a Hostinger Node.js Web App.

Before editing:
1. Inspect package.json, astro.config.mjs, src/pages, environment variables, current WooCommerce integration, and deployment-related docs.
2. Preserve existing user changes. Do not modify or stage:
   - .claude/settings.local.json
   - .playwright-mcp/
3. Create and switch to a branch named:
   codex/digital-checkout
4. Do not push, deploy, or connect to production yet.

Implementation:
- Install and configure the official Astro Node adapter in standalone mode.
- Configure Astro for server output.
- Add a production start command suitable for Hostinger.
- Keep the existing development workflow working.
- Add GET /api/health returning JSON with:
  - ok
  - service
  - timestamp
  - environment
- Never expose secrets or backend URLs in the health response.
- Update .env.example with server-only variable names, without real values:
  - WOO_BACKEND_URL
  - DB_BRIDGE_SECRET
  - PUBLIC_SITE_URL
- Ensure server-only variables are never imported into client scripts.
- Add docs/hostinger-node-deployment.md covering build command, start command, Node version, environment variables, temporary-domain test, and rollback.

Verification:
- Run the production build.
- Start the built server locally.
- Verify /, /products, and /api/health.
- Report changed files, commands, results, and any Hostinger settings still required.
- Do not commit unless explicitly requested.

Continue in the same branch and repository.

Goal:
Create a production-quality WordPress plugin that acts as the private commerce backend for dokanelbanat.com.

Create:
wordpress-plugin/dokanelbanat-commerce-bridge/

Plugin requirements:
- Plugin name: Dokanelbanat Commerce Bridge
- Text domain: dokanelbanat-commerce-bridge
- Namespaced or uniquely prefixed PHP code.
- No theme dependencies.
- Compatible with modern WooCommerce and HPOS.
- Fail safely when WooCommerce is unavailable.
- Include version constant and structured includes/.
- Include uninstall behavior only for disposable plugin data; never delete WooCommerce orders.
- Do not include secrets in Git.

Authentication:
- Private REST endpoints must require a shared secret.
- Read the secret from wp-config.php or an environment variable.
- Use constant-time comparison.
- Do not accept the secret from browser-side code.
- Return generic production errors without paths, stack traces, WordPress URLs, or internal details.

Initial endpoints:
- GET /wp-json/dokanelbanat/v1/health
- POST /wp-json/dokanelbanat/v1/free-order
- POST /wp-json/dokanelbanat/v1/recover
- GET /wp-json/dokanelbanat/v1/download/{token}

For this prompt:
- Scaffold endpoints and authentication.
- Implement only health fully.
- Leave the other handlers as safe explicit “not implemented” responses.
- Add rate-limit utilities, logging utilities, validation helpers, and URL-sanitization helpers.
- Add wordpress-plugin/dokanelbanat-commerce-bridge/README.md with installation, SFTP path, secret setup, activation, rollback, and testing instructions.
- Add deployment documentation explaining how to package only this plugin folder as a ZIP.

Verification:
- Run PHP syntax checks on every PHP file.
- Review for direct-access protection, escaping, sanitization, capability checks where relevant, and secret leakage.
- Do not connect via SFTP or deploy yet.

Implement the free digital product order flow inside Dokanelbanat Commerce Bridge.

Business rules:
- Guest checkout only.
- Exactly one product per order.
- Only published WooCommerce products are allowed.
- Product must be virtual, downloadable, and have a zero total.
- Required customer fields:
  - first_name
  - email
- Optional:
  - phone
  - marketing_consent
- Do not request or store:
  - last_name
  - company
  - address
  - city
  - state
  - postcode
  - shipping fields
- Never trust product price or product metadata from Astro.

POST /free-order must:
1. Authenticate the server request.
2. Validate and normalize the input.
3. Load the product server-side.
4. Reject paid, unpublished, non-virtual, or non-downloadable products.
5. Create a WooCommerce guest order.
6. Add one unit of the product.
7. Store the name in billing first_name.
8. Leave billing last_name empty.
9. Store email and optional phone.
10. Store marketing consent as explicit order metadata with timestamp and source.
11. Complete the zero-value order through appropriate WooCommerce APIs.
12. Grant downloadable product permissions.
13. Trigger the appropriate customer email.
14. Return only safe data:
    - success
    - order_number
    - masked_email
    - public confirmation URL or token
15. Never return WordPress URLs or raw download URLs.

Reliability:
- Accept an idempotency key so double-clicks cannot create duplicate orders.
- Store and reuse a recent result for the same idempotency key.
- Log failures without logging secrets or full personal data.
- Use WooCommerce CRUD APIs and remain HPOS compatible.

Also:
- Add automated tests if the repository has a viable test setup.
- Otherwise create a detailed manual test matrix.
- Add hooks/filters for later paid-order support, but do not integrate Paymob.

Replace the current headless Store API checkout with a first-party Astro SSR checkout that talks only to dokanelbanat.com endpoints.

Critical privacy requirement:
No browser HTML, JavaScript, network request, error, image, link, redirect, or response may expose blog.dokanelbanat.com.

Architecture:
Browser -> dokanelbanat.com/api/* -> server-side authenticated request -> WordPress bridge.

Implement:
- POST /api/checkout/free
- Server-side product validation or retrieval as needed.
- Server-only authentication to the WordPress bridge.
- Sanitized timeout and error handling.
- Never forward internal response headers or backend URLs.

Checkout UI:
- Arabic-first RTL.
- Follow the existing dokanelbanat design system.
- One required name field.
- One required email field.
- Optional phone field.
- Required acceptance of privacy/terms for order fulfillment.
- Separate optional marketing consent checkbox.
- Explain that the product and order number will be sent by email.
- Summary for exactly one product.
- No address, billing, shipping, last-name, account, password, or payment fields.
- CTA copy suitable for a free product, not “Pay”.
- Prevent duplicate submissions.
- Generate an idempotency key per checkout attempt.
- Accessible labels, focus states, inline errors, loading state, aria-live feedback, and mobile layout.

Success flow:
- Redirect to a first-party confirmation page.
- Show order number and masked email.
- Explain how to recover the product later.
- Do not expose an internal order key or backend URL.

Remove:
- Direct Store API calls from browser code.
- Cart-Token and Nonce storage in localStorage.
- Direct WooCommerce CORS dependency for checkout.
- Automatic selection of the first payment method.

Verification:
- Build and run in production SSR mode.
- Test missing product, invalid email, optional phone, double submission, backend timeout, successful order, and mobile layout.

Implement the branded email and secure download architecture.

Brand requirement:
Customers must experience only Dokanelbanat and dokanelbanat.com.
No customer-facing email, source, link, image, redirect, or download may reveal blog.dokanelbanat.com.

Email requirements:
- Sender identity:
  Dokanelbanat <info@dokanelbanat.com>
- Reply-To:
  info@dokanelbanat.com
- Do not hardcode SMTP credentials.
- Add an admin/deployment checklist for authenticated SMTP and SPF, DKIM, DMARC, Return-Path alignment, and optional custom tracking domain.
- Customize the relevant customer order email.
- Include:
  - customer name
  - product name
  - order number
  - first-party download link
  - first-party recovery link
  - support email
- Remove native “view order” links that lead to WordPress.
- Ensure all logos and email images use dokanelbanat.com URLs.
- Keep transactional fulfillment email separate from optional marketing consent.

Download architecture:
- Email links must use:
  https://dokanelbanat.com/download/{opaque-token}
- Token must be unguessable, scoped to a valid WooCommerce download permission, and safely expirable or revocable.
- Astro must proxy the download server-to-server.
- Never redirect the browser to WordPress or the original media URL.
- Preserve appropriate filename and content type.
- Prevent path traversal and arbitrary file access.
- Support WooCommerce download limits and logging.
- Do not use insecure “Redirect only”.
- Return generic expired/invalid-link pages without internal details.

Audit:
Search the generated HTML, client bundles, API responses, email templates, redirects, and download responses for:
blog.dokanelbanat.com

Report every source found and eliminate customer-facing occurrences.

Implement self-service digital product recovery.

Public route:
GET /recover-download

Form fields:
- Required order number
- Required email address

Flow:
Browser -> POST /api/recover-download -> Astro server -> authenticated WordPress bridge.

WordPress verification:
- Find the order using WooCommerce CRUD APIs and remain HPOS compatible.
- Confirm the order number and billing email match.
- Confirm it is a guest order containing an eligible downloadable product.
- Confirm download permission exists or safely regenerate it when appropriate.
- Resend the branded download email only to the original billing email.
- Never allow entry of a replacement destination email.
- Never return product, order, or customer information to the browser.

Privacy:
Always display the same public response:
“If the information matches an eligible order, a new email will arrive within a few minutes.”

Security:
- Rate limit by privacy-safe hashes of email, order number, and trusted client IP.
- Add cooldown between resends.
- Log attempts without storing raw secrets or unnecessary personal data.
- Protect against order enumeration and timing leaks.
- Add honeypot protection.
- Structure the code so CAPTCHA can be added later, but do not add a third-party CAPTCHA now.

UX:
- Arabic RTL.
- Explain where to find the order number in the original email.
- Add recovery links to checkout success, product pages, and relevant footer/help areas.
- Include accessible success, error, and loading states.

Perform a complete customer-facing backend-domain exposure audit.

Forbidden customer-facing value:
blog.dokanelbanat.com

Inspect:
- Astro source and built output
- HTML
- hydrated client JavaScript
- data attributes
- source maps
- environment variables
- product API responses
- product image URLs
- Open Graph and structured data
- canonical tags
- checkout requests
- download links
- redirects and Location headers
- WooCommerce emails
- email images
- REST errors
- CORS documentation
- browser localStorage/sessionStorage
- sitemaps and robots files

Implement first-party proxying for any remaining product images or media required by the public site.

Important:
Do not claim that the subdomain is an absolute secret from DNS or certificate-transparency discovery. The acceptance criterion is that normal customers do not encounter it through the website, source, network activity, emails, redirects, or downloads.

Produce:
docs/backend-domain-exposure-audit.md

Include:
- checked surface
- previous exposure
- remediation
- verification method
- remaining infrastructure-level discoverability

Prepare the completed feature for controlled production rollout.

Do not deploy automatically.

Tasks:
1. Run all available builds, syntax checks, and tests.
2. Test Astro in production SSR mode.
3. Validate that no client bundle contains server secrets.
4. Validate that blog.dokanelbanat.com does not appear in customer-facing build output.
5. Create a manual end-to-end test checklist covering:
   - valid free order
   - invalid product
   - paid product rejection
   - non-downloadable product rejection
   - duplicate click/idempotency
   - branded email
   - order number
   - secure download
   - expired/invalid token
   - recovery success
   - recovery mismatch
   - rate limiting
   - mobile and keyboard accessibility
6. Create docs/production-rollout.md covering:
   - Hostinger Node.js Web App setup
   - GitHub branch deployment
   - environment variables
   - temporary-domain smoke test
   - WordPress database/files backup
   - plugin ZIP creation
   - SFTP remote path
   - plugin activation
   - SMTP/DNS checks
   - rollback for Astro
   - rollback for the WordPress plugin
7. List any manual WooCommerce or Hostinger settings that code cannot safely configure.
8. Show git diff and summarize all changes.
9. Do not stage, commit, push, upload by SFTP, activate plugins, or deploy until explicitly authorized.

