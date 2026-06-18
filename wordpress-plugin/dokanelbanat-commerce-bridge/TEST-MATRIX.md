# Manual Test Matrix — Free Order Endpoint

**Endpoint:** `POST /wp-json/dokanelbanat/v1/free-order`

## Setup

Set the `X-DCB-Secret` header to the value of `DCB_BRIDGE_SECRET` defined in `wp-config.php` for all authenticated tests.

---

## Authentication

| # | Test | Input | Expected |
|---|------|-------|----------|
| A1 | No secret header | No `X-DCB-Secret` | 401 Unauthorized |
| A2 | Wrong secret | `X-DCB-Secret: wrong` | 401 Unauthorized |
| A3 | Correct secret | `X-DCB-Secret: <real-secret>` | Request proceeds |

---

## Input validation

| # | Test | Input | Expected |
|---|------|-------|----------|
| V1 | Missing first_name | `{}` | 400 with message |
| V2 | Blank first_name | `{"first_name":""}` | 400 |
| V3 | Missing email | `{"first_name":"Test"}` | 400 |
| V4 | Invalid email | `{"email":"not-an-email"}` | 400 |
| V5 | Invalid phone | `{"phone":"abc"}` | 400 |
| V6 | Missing product_id | no product_id | 400 |
| V7 | Non-integer product_id | `{"product_id":"abc"}` | 400 |
| V8 | Missing idempotency_key | no key | 400 |
| V9 | Short idempotency_key (<8 chars) | `{"idempotency_key":"abc"}` | 400 |

---

## Product validation (server-side)

| # | Test | Condition | Expected |
|---|------|-----------|----------|
| P1 | Non-existent product | `product_id` not in WooCommerce | 422 |
| P2 | Draft product | product status = draft | 422 |
| P3 | Paid product | product price > 0 | 422 "Only free products" |
| P4 | Non-virtual product | product is not virtual | 422 "Only virtual products" |
| P5 | Non-downloadable product | product is not downloadable | 422 "Only downloadable" |
| P6 | Valid free product | published, virtual, downloadable, price=0 | 201 with order_number |

---

## Successful order

| # | Test | Expected |
|---|------|----------|
| S1 | Valid free product, name + email only | 201, `success:true`, `order_number`, `masked_email` |
| S2 | Optional phone included | 201, phone stored in order billing, not returned |
| S3 | marketing_consent=true | 201, `_dcb_marketing_consent=yes` meta stored |
| S4 | marketing_consent=false | 201, `_dcb_marketing_consent=no` meta stored |
| S5 | Order in WooCommerce admin | Status = Completed, billing first_name set, billing last_name empty |
| S6 | Customer email triggered | Customer receives email from `info@dokanelbanat.com` |
| S7 | Download permission granted | WooCommerce download permissions created for order |
| S8 | masked_email correct format | First 2 chars + `***@domain.com` |

---

## Idempotency

| # | Test | Expected |
|---|------|----------|
| I1 | Same idempotency_key twice, within 1 hour | Second call returns identical 200 response without creating a second order |
| I2 | Different idempotency_keys for same email | Creates two separate orders |
| I3 | Same key after 1 hour | Cache expired, may create new order |

---

## Response safety

| # | Test | Expected |
|---|------|----------|
| R1 | Response body | Must NOT contain `blog.dokanelbanat.com`, WordPress URLs, raw email |
| R2 | Error response body | Must NOT contain PHP paths, stack traces, or internal details |
| R3 | last_name in WooCommerce order | Must be empty string |
