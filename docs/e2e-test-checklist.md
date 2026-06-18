# End-to-End Manual Test Checklist

Run against the Hostinger temporary domain before switching to production.

---

## Setup

- [ ] Plugin activated and health endpoint returns `{"ok":true,"woocommerce":true}`
- [ ] SMTP configured; test email received from `Dokanelbanat <info@dokanelbanat.com>`
- [ ] At least one published, virtual, downloadable, zero-price product in WooCommerce

---

## TC-01: Valid free order (happy path)

1. [ ] Navigate to `/products` — product listing renders, no `blog.dokanelbanat.com` in DevTools Network tab
2. [ ] Click "احصلي عليه" on a free product → arrive at `/checkout`
3. [ ] Product summary shown in sidebar with correct name and "مجاني" price
4. [ ] Fill: Name = "Test User", Email = `test@example.com`
5. [ ] Check privacy checkbox
6. [ ] Click "احصلي على المنتج مجانًا"
7. [ ] Loading state visible, button disabled during submission
8. [ ] Redirected to `/order-confirmation?order=XXXX&email=te***@example.com`
9. [ ] Order number displayed; masked email shown
10. [ ] Recovery link present on confirmation page
11. [ ] Check WooCommerce admin: order exists, status = Completed, billing_last_name = empty
12. [ ] Customer email received within 2 minutes
13. [ ] Email from: `Dokanelbanat <info@dokanelbanat.com>`
14. [ ] Email contains order number, product name, first-party download link
15. [ ] Download link format: `https://dokanelbanat.com/download/{64-char-hex}`
16. [ ] Click download link → file downloads successfully
17. [ ] DevTools: download request goes to `dokanelbanat.com`, never to `blog.dokanelbanat.com`

---

## TC-02: Invalid product

1. [ ] Call `POST /api/checkout/free` with a non-existent `product_id`
2. [ ] Response: `{"success":false,"message":"Product not available."}`
3. [ ] No WordPress URL or path in the error

---

## TC-03: Paid product rejection

1. [ ] Create a WooCommerce product with price > 0
2. [ ] Attempt checkout with that product_id
3. [ ] Response: error about paid product, order NOT created

---

## TC-04: Non-downloadable product rejection

1. [ ] Create a product that is virtual but NOT downloadable
2. [ ] Attempt checkout with that product_id
3. [ ] Response: error about non-downloadable product, order NOT created

---

## TC-05: Duplicate click / idempotency

1. [ ] Simulate two rapid POST requests to `/api/checkout/free` with the same `idempotency_key`
2. [ ] Second request returns identical 200 response (not 201)
3. [ ] Only ONE order created in WooCommerce admin

---

## TC-06: Branded email

1. [ ] Complete a valid order (TC-01)
2. [ ] Check raw email source: `From:` = `Dokanelbanat <info@dokanelbanat.com>`
3. [ ] `Reply-To:` = `info@dokanelbanat.com`
4. [ ] No "View Order" link pointing to `blog.dokanelbanat.com`
5. [ ] No image `src` attributes containing `blog.dokanelbanat.com`
6. [ ] Recovery link points to `dokanelbanat.com/recover-download`

---

## TC-07: Order number display

1. [ ] Order number on confirmation page matches WooCommerce order number
2. [ ] Order number in recovery form (TC-10) resolves the same order

---

## TC-08: Secure download

1. [ ] Use download link from email
2. [ ] File downloads with correct filename and content type
3. [ ] URL: `dokanelbanat.com/download/{token}` — no WordPress URL visible in browser
4. [ ] After download limit reached: link returns 410 error page (no internal details)
5. [ ] Invalid token: 410 error page shown, no internal details
6. [ ] Expired token (7 days): 410 error page

---

## TC-09: Expired / invalid token

1. [ ] Navigate to `/download/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
2. [ ] Shown: expired/invalid Arabic message, link to `/recover-download`
3. [ ] No `blog.dokanelbanat.com` in response HTML

---

## TC-10: Recovery success

1. [ ] Navigate to `/recover-download`
2. [ ] Enter the order number and email from TC-01
3. [ ] Submit form
4. [ ] Message: "إذا كانت المعلومات صحيحة، ستصل رسالة إلكترونية جديدة خلال دقائق."
5. [ ] New email received (same branded format as TC-06)
6. [ ] New download link in email works

---

## TC-11: Recovery mismatch

1. [ ] Navigate to `/recover-download`
2. [ ] Enter a valid order number but wrong email
3. [ ] Response: identical public message ("إذا كانت المعلومات صحيحة...")
4. [ ] No indication of whether order number exists (no enumeration)
5. [ ] No new email sent

---

## TC-12: Rate limiting

1. [ ] Submit recovery form 4+ times with same data within 10 minutes
2. [ ] All responses return the same public message (no error revealed to user)
3. [ ] Check WooCommerce logs: rate limit warning logged after threshold
4. [ ] Wait cooldown period (5 minutes) and try again — succeeds

---

## TC-13: Mobile and keyboard accessibility

1. [ ] Load `/checkout` on a 375px viewport — layout stacks, form is usable
2. [ ] Tab through all form fields in order: name → email → phone → privacy checkbox → marketing checkbox → submit
3. [ ] Focus states visible on all interactive elements
4. [ ] Submit with missing required fields: inline error messages appear near the field
5. [ ] `aria-live` region announces loading state during submission
6. [ ] Screen reader announces "جارٍ المعالجة..." when loading
7. [ ] After error: focus moves to first error field or error message
8. [ ] Load `/recover-download` on mobile — form usable, RTL correct

---

## TC-14: Backend timeout handling

1. [ ] Simulate a slow WordPress bridge (>10 seconds response)
2. [ ] Checkout shows: "الطلب استغرق وقتًا طويلًا، يرجى المحاولة مرة أخرى."
3. [ ] No internal details or WordPress URL in error message

---

## TC-15: Optional phone field

1. [ ] Complete checkout without entering phone — order succeeds
2. [ ] Complete checkout with phone `+201234567890` — order succeeds, phone stored in WooCommerce billing
3. [ ] Invalid phone characters (letters) — checkout form prevents submission

---

## TC-16: Marketing consent

1. [ ] Complete checkout with marketing checkbox unchecked
2. [ ] WooCommerce order meta `_dcb_marketing_consent` = `no`
3. [ ] Complete checkout with marketing checkbox checked
4. [ ] WooCommerce order meta `_dcb_marketing_consent` = `yes`, timestamp and source present
