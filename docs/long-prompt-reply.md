All 7 defects are fixed. Here is the evidence for
  each:

  ---
  Defect 1 — Checkout URL contract
  woocommerce.js:41 already generated
  ?product=<id>. checkout.astro was treating
  ?product as a slug (via getProductBySlug). Fixed:
  checkout.astro now reads ?product as a numeric
  ID via the new getProductById export. The orphan
  ?id fallback is removed.

  Defect 2 — First-party download URLs in email
  DCB_Email::first_party_download_url() was defined
  but never called. Fixed:
  woocommerce_order_get_downloadable_items filter
  now replaces every download_url in the array with
  an opaque token URL
  (dokanelbanat.com/download/{token}). This fires
  whenever WooCommerce fetches download items —
  including during customer email generation.

  Defect 3 — Download accounting
  wc_downloadable_file_permission() re-granted a
  fresh permission record instead of decrementing.
  Fixed: now loads
  WC_Customer_Download($permission->permission_id),
  calls set_downloads_remaining(remaining - 1) and
  set_download_count(count + 1), then saves.
  Access expiry via access_expires is also now
  checked before serving.

  Defect 4 — Duplicate lifecycle hooks
  payment_complete() + manual
  do_action('woocommerce_order_status_completed')
  created duplicate, wrong-order status events.
  Fixed in DCB_Free_Order: permissions pre-granted,
  then $order->update_status('completed') fires
  WC_Emails through the proper hook
  (woocommerce_order_status_pending_to_completed).
  Fixed in DCB_Recover: replaced
  wc_downloadable_product_permissions($id, true) +
  manual do_action with WC()->mailer()->emails['WC_
  Email_Customer_Completed_Order']->trigger($id,
  $order) — sends exactly one email, no status
  change, no permission re-grant.

  Defect 5 — Privacy acceptance
  privacy_accepted was validated client-side but
  never sent or re-validated server-side. Fixed:
  sent in the JSON body from checkout.astro,
  validated (!== true) in free.ts before
  forwarding, validated again in
  DCB_Free_Order::process(), and stored as
  _dcb_privacy_accepted,
  _dcb_privacy_accepted_timestamp,
  _dcb_privacy_source, _dcb_privacy_policy_version
  on the order.

  Defect 6 — Rate limiting on /free-order
  No rate limiting existed on the free-order
  endpoint. Fixed: 3 orders per 15 minutes per
  SHA-256 hash of (email + IP). Check placed after
  idempotency (so legitimate replays are free) and
  after email validation (so the email is available
  for the hash key).

  Defect 7 — Backend links in email
  remove_order_view_link added a recovery link but
  did not remove native WC View Order/My Account
  links. Fixed with two layers: (1)
  woocommerce_order_get_downloadable_items filter
  replaces download URLs before email composition;
  (2) wp_mail filter at priority 99 strips all HTML
  anchors and bare URLs containing the WordPress
  backend host from the final composed email body —
  regardless of WooCommerce version or template.