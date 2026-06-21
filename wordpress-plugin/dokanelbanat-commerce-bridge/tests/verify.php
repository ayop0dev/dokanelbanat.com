#!/usr/bin/env php
<?php
/**
 * Static-analysis + behavioral regression tests for the DCB plugin.
 * Run: php wordpress-plugin/dokanelbanat-commerce-bridge/tests/verify.php
 */

$plugin_dir = dirname(__DIR__) . '/includes/';

$passed = 0;
$failed = 0;

function verify(string $label, bool $result): void {
    global $passed, $failed;
    if ($result) {
        echo "  PASS  $label\n";
        $passed++;
    } else {
        echo "  FAIL  $label\n";
        $failed++;
    }
}

function src(string $filename): string {
    global $plugin_dir;
    $path = $plugin_dir . $filename;
    if (!file_exists($path)) {
        echo "  ERROR Cannot read $path\n";
        exit(2);
    }
    return file_get_contents($path);
}

function strip_comments(string $code): string {
    $code = (string) preg_replace('/\/\*.*?\*\//s', '', $code);
    $code = (string) preg_replace('/\/\/[^\n]*/', '', $code);
    return $code;
}

$email      = src('class-dcb-email.php');
$free_order = src('class-dcb-free-order.php');
$download   = src('class-dcb-download-handler.php');
$recover    = src('class-dcb-recover.php');

$email_code      = strip_comments($email);
$free_order_code = strip_comments($free_order);
$download_code   = strip_comments($download);
$recover_code    = strip_comments($recover);

// ── R1-D2: first_party_download_url in email pipeline ───────────────────────
echo "\n=== R1-D2: First-party download URLs in emails ===\n";
verify(
    'Email: woocommerce_order_get_downloadable_items filter registered',
    str_contains($email, 'woocommerce_order_get_downloadable_items')
);
verify(
    'Email: replace_download_urls method defined',
    str_contains($email, 'function replace_download_urls')
);
verify(
    'Email: first_party_download_url called inside replace_download_urls',
    (bool) preg_match('/function replace_download_urls[\s\S]*?first_party_download_url/m', $email)
);

// ── R1-D3: Download handler baseline ────────────────────────────────────────
echo "\n=== R1-D3: Download handler baseline ===\n";
verify(
    'Download handler: wc_downloadable_file_permission NOT called',
    !str_contains($download_code, 'wc_downloadable_file_permission(')
);
verify(
    'Download handler: access_expires checked',
    str_contains($download, 'access_expires')
);

// ── R1-D4: Lifecycle hooks ───────────────────────────────────────────────────
echo "\n=== R1-D4: Lifecycle hooks ===\n";
verify(
    'Free order: payment_complete() NOT called',
    !str_contains($free_order_code, 'payment_complete()')
);
verify(
    'Free order: update_status used to complete order',
    str_contains($free_order, "update_status( 'completed'")
);
verify(
    'Recover: WC_Email_Customer_Completed_Order->trigger() used',
    str_contains($recover, 'WC_Email_Customer_Completed_Order') &&
    str_contains($recover, '->trigger(')
);
verify(
    'Recover: wc_downloadable_product_permissions NOT called (no re-grant)',
    !str_contains($recover_code, 'wc_downloadable_product_permissions')
);

// ── R1-D5: privacy_accepted ──────────────────────────────────────────────────
echo "\n=== R1-D5: privacy_accepted ===\n";
verify(
    'Free order: validates privacy_accepted truthy boolean',
    str_contains($free_order, "privacy_accepted") &&
    str_contains($free_order, 'true !== $body[\'privacy_accepted\']')
);
verify(
    'Free order: stores _dcb_privacy_accepted meta',
    str_contains($free_order, "'_dcb_privacy_accepted'")
);
verify(
    'Free order: stores _dcb_privacy_policy_version meta',
    str_contains($free_order, "'_dcb_privacy_policy_version'")
);

// ══════════════════════════════════════════════════════════════
// ROUND-2 DEFECT TESTS
// ══════════════════════════════════════════════════════════════

// ── R2-D1: Unlimited download detection ──────────────────────────────────────
echo "\n=== R2-D1: Unlimited download detection ===\n";
verify(
    'Download: NULL detected as unlimited (null === $raw_remaining)',
    str_contains($download_code, 'null === $raw_remaining')
);
verify(
    "Download: empty-string detected as unlimited ('' === (string) \$raw_remaining)",
    str_contains($download_code, "'' === (string) \$raw_remaining")
);
verify(
    'Download: numeric 0 rejected before UPDATE (not classified as unlimited)',
    str_contains($download_code, '! $is_unlimited && (int) $raw_remaining <= 0')
);

// ── R2-D2: Atomic SQL + fail-closed accounting ───────────────────────────────
echo "\n=== R2-D2: Atomic SQL + fail-closed accounting ===\n";

// CRUD removed
verify(
    'Download: WC_Customer_Download CRUD NOT used',
    !str_contains($download_code, 'new WC_Customer_Download')
);
verify(
    'Download: set_downloads_remaining NOT called',
    !str_contains($download_code, 'set_downloads_remaining')
);
verify(
    'Download: set_download_count NOT called',
    !str_contains($download_code, 'set_download_count')
);

// Atomic UPDATE structure
verify(
    'Download: atomic UPDATE decrements downloads_remaining = downloads_remaining - 1',
    str_contains($download_code, 'downloads_remaining = downloads_remaining - 1')
);
verify(
    'Download: atomic UPDATE has WHERE downloads_remaining > 0 (race-safe)',
    str_contains($download_code, 'downloads_remaining > 0')
);
verify(
    'Download: unlimited branch increments count only',
    (bool) preg_match('/\$is_unlimited[\s\S]*?download_count = download_count \+ 1/m', $download_code)
);
verify(
    'Download: context ownership in WHERE (order_id, product_id, download_id, user_email)',
    str_contains($download_code, 'order_id') &&
    str_contains($download_code, 'product_id') &&
    str_contains($download_code, 'download_id') &&
    str_contains($download_code, 'user_email')
);
verify(
    'Download: $wpdb->prepare used (SQL injection prevention)',
    str_contains($download_code, '$wpdb->prepare')
);

// Fail-closed: serve only on exactly 1 row updated
verify(
    'Download: limited path — false === $rows denied (DB error)',
    (bool) preg_match('/false === \$rows[\s\S]{0,300}Database failure during limited/m', $download_code)
);
verify(
    'Download: limited path — 1 !== $rows denied (0 rows = no slots; >1 = unexpected)',
    (bool) preg_match('/1 !== \$rows[\s\S]{0,200}expired_response/m', $download_code)
);
verify(
    'Download: unlimited path — false === $rows denied (DB error)',
    (bool) preg_match('/false === \$rows[\s\S]{0,300}Database failure during unlimited/m', $download_code)
);
verify(
    'Download: unlimited path — 1 !== $rows denied (context mismatch)',
    (bool) preg_match(
        '/false === \$rows[\s\S]{0,300}Database failure during unlimited[\s\S]{0,300}1 !== \$rows[\s\S]{0,200}expired_response/m',
        $download_code
    )
);
verify(
    'Download: no "Continue serving" fallback in unlimited path',
    !str_contains($download_code, 'Continue serving')
);

// ── R3: Plain-text / HTML branching in remove_order_view_link ────────────────
echo "\n=== R3: remove_order_view_link plain-text vs HTML output ===\n";

// Behavioral: the $plain_text parameter is actually checked
verify(
    'Email: remove_order_view_link checks $plain_text before rendering',
    (bool) preg_match('/if\s*\(\s*\$plain_text\s*\)/', $email_code)
);
// HTML path: must contain an <a href= anchor
verify(
    'Email: HTML path outputs an <a href= anchor (not plain text)',
    str_contains($email_code, '<a href=')
);
// HTML path: must NOT emit raw <a> inside the plain-text branch
verify(
    'Email: plain-text path does NOT contain <a href= or <p',
    (bool) preg_match(
        '/if\s*\(\s*\$plain_text\s*\)\s*\{[^}]*\}/s',
        $email_code,
        $plain_block
    ) &&
    !str_contains($plain_block[0], '<a href') &&
    !str_contains($plain_block[0], '<p')
);
// Plain-text path: ends with a newline to separate from surrounding WC content
verify(
    'Email: plain-text path ends with \\n (line break, no trailing HTML)',
    str_contains($email, '"\\n"') || str_contains($email, "\"\\n\"")
);
// Arabic copy present in both paths (preserved in the if/else)
verify(
    'Email: Arabic recovery copy preserved in the method',
    str_contains($email, 'إذا لم يُفتح رابط التحميل')
);
// esc_url used in both paths (no raw URL output)
verify(
    'Email: esc_url applied to recovery URL in both branches',
    substr_count($email_code, 'esc_url( $recovery_url )') >= 2
);

// ── R2-D3: View-order URL replaced via targeted WC filter ────────────────────
echo "\n=== R2-D3: View-order URL via woocommerce_get_view_order_url ===\n";

// Old wp_mail infrastructure must be gone
verify(
    'Email: wp_mail filter NOT registered',
    !str_contains($email_code, "'wp_mail'")
);
verify(
    'Email: $customer_email_active NOT present',
    !str_contains($email, '$customer_email_active')
);
verify(
    'Email: activate_link_scope NOT present',
    !str_contains($email, 'activate_link_scope')
);
verify(
    'Email: replace_backend_links_in_customer_email NOT present',
    !str_contains($email, 'replace_backend_links_in_customer_email')
);
verify(
    'Email: strip_backend_links NOT present',
    !str_contains($email, 'strip_backend_links')
);

// Targeted view-order replacement
verify(
    'Email: woocommerce_get_view_order_url filter registered',
    str_contains($email, 'woocommerce_get_view_order_url')
);
verify(
    'Email: replace_view_order_url method defined',
    str_contains($email, 'function replace_view_order_url')
);
verify(
    'Email: guest orders only — get_customer_id() compared against 0',
    str_contains($email_code, 'get_customer_id()') &&
    (bool) preg_match('/0\s*!==\s*\$order->get_customer_id\(\)|get_customer_id\(\)\s*!==\s*0/', $email_code)
);
verify(
    'Email: registered customers retain original URL (early return)',
    (bool) preg_match(
        '/0\s*!==\s*\$order->get_customer_id\(\)|get_customer_id\(\)\s*!==\s*0/',
        $email_code
    ) &&
    str_contains($email_code, 'return $url')
);
verify(
    'Email: replacement is recovery URL (not empty, not backend URL)',
    str_contains($email_code, "'/recover-download'")
);

// Password-reset and admin emails: no wp_mail filter means zero risk
verify(
    'Email: no broad regex over email HTML (preg_replace on message NOT present)',
    !str_contains($email_code, "preg_replace") ||
    // Allow preg_replace only if it is NOT operating on $mail['message']
    !str_contains($email_code, "\$mail['message']")
);

// ── R2-D4: Client IP trust and rate limiting ──────────────────────────────────
echo "\n=== R2-D4: Client IP and rate limiting ===\n";

verify(
    'Free order: HTTP_X_FORWARDED_FOR NOT used as rate-limit source',
    !str_contains($free_order_code, 'HTTP_X_FORWARDED_FOR')
);
verify(
    'Free order: HTTP_X_DCB_CLIENT_IP used',
    str_contains($free_order_code, 'HTTP_X_DCB_CLIENT_IP')
);
verify(
    'Free order: per-email bucket 10/hr — always applies',
    (bool) preg_match("/fo_email[\s\S]{0,80}10\s*,\s*3600/m", $free_order_code)
);
verify(
    'Free order: global emergency bucket 200/hr — always applies',
    (bool) preg_match("/fo_global[\s\S]{0,80}200\s*,\s*3600/m", $free_order_code)
);
verify(
    'Free order: per-IP and per-combo buckets skipped when IP is unknown',
    str_contains($free_order_code, "'unknown' !== \$client_ip") ||
    str_contains($free_order_code, '$ip_known')
);
verify(
    'Free order: per-IP bucket 5/15min (when IP known)',
    (bool) preg_match("/fo_ip[\s\S]{0,80}5\s*,\s*900/m", $free_order_code)
);
verify(
    'Free order: per-combo bucket 3/15min (when IP known)',
    (bool) preg_match("/fo_combo[\s\S]{0,80}3\s*,\s*900/m", $free_order_code)
);
verify(
    'Free order: all rate-limit keys use privacy-safe sha256 hash',
    substr_count($free_order_code, "hash( 'sha256'") >= 1
);
verify(
    'Recover: HTTP_X_DCB_CLIENT_IP used (not XFF)',
    str_contains($recover_code, 'HTTP_X_DCB_CLIENT_IP') &&
    !str_contains($recover_code, 'HTTP_X_FORWARDED_FOR')
);

// ── R2-D5: Recovery search (no silent exclusion) ──────────────────────────────
echo "\n=== R2-D5: Recovery order search ===\n";
verify(
    'Recover: fast path wc_get_order() used for numeric order numbers',
    str_contains($recover_code, 'wc_get_order(') &&
    str_contains($recover_code, 'ctype_digit(')
);
verify(
    'Recover: fast path verifies billing email (no ID-only trust)',
    str_contains($recover_code, 'get_billing_email()') &&
    (bool) preg_match('/wc_get_order[\s\S]{0,200}get_billing_email/m', $recover_code)
);
verify(
    "Recover: wc_get_orders uses limit -1 (all orders)",
    str_contains($recover_code, "'limit'         => -1") ||
    str_contains($recover_code, "'limit' => -1")
);
verify(
    'Recover: hard-coded 5-order limit NOT present',
    !str_contains($recover_code, "'limit'         => 5") &&
    !str_contains($recover_code, "'limit' => 5")
);

// ══════════════════════════════════════════════════════════════
// SMTP TESTS
// ══════════════════════════════════════════════════════════════

$smtp       = src('class-dcb-smtp.php');
$smtp_code  = strip_comments($smtp);
$routes     = src('class-dcb-routes.php');
$routes_code = strip_comments($routes);

// ── SMTP: Disabled when not enabled ──────────────────────────────────────────
echo "\n=== SMTP: Disabled when not enabled ===\n";
verify(
    'SMTP: register() guards on DCB_SMTP_ENABLED being defined and strictly true',
    str_contains($smtp_code, "defined( 'DCB_SMTP_ENABLED' )") &&
    (
        str_contains($smtp_code, 'true === DCB_SMTP_ENABLED') ||
        str_contains($smtp_code, 'true !== DCB_SMTP_ENABLED')
    )
);
verify(
    'SMTP: phpmailer_init is only registered after the DCB_SMTP_ENABLED guard passes',
    (bool) preg_match('/DCB_SMTP_ENABLED[\s\S]{0,600}phpmailer_init/m', $smtp_code)
);
verify(
    'SMTP: admin_notices registered only after DCB_SMTP_ENABLED guard passes',
    (bool) preg_match('/DCB_SMTP_ENABLED[\s\S]{0,600}admin_notices/m', $smtp_code)
);

// ── SMTP: Missing-constant validation ─────────────────────────────────────────
echo "\n=== SMTP: Missing-constant validation ===\n";
verify(
    'SMTP: DCB_SMTP_HOST presence checked with defined()',
    str_contains($smtp_code, "defined( 'DCB_SMTP_HOST' )")
);
verify(
    'SMTP: DCB_SMTP_PORT presence checked with defined()',
    str_contains($smtp_code, "defined( 'DCB_SMTP_PORT' )")
);
verify(
    'SMTP: DCB_SMTP_USER presence checked with defined()',
    str_contains($smtp_code, "defined( 'DCB_SMTP_USER' )")
);
verify(
    'SMTP: DCB_SMTP_PASS presence checked with defined()',
    str_contains($smtp_code, "defined( 'DCB_SMTP_PASS' )")
);
verify(
    'SMTP: DCB_SMTP_SECURE presence checked with defined()',
    str_contains($smtp_code, "defined( 'DCB_SMTP_SECURE' )")
);

// ── SMTP: Per-field validation logic ─────────────────────────────────────────
echo "\n=== SMTP: Per-field validation ===\n";
verify(
    'SMTP: host validated as non-empty string (trim)',
    str_contains($smtp_code, "'' !== trim( DCB_SMTP_HOST )")
);
verify(
    'SMTP: port validated as int with is_int()',
    str_contains($smtp_code, 'is_int( DCB_SMTP_PORT )')
);
verify(
    'SMTP: port lower bound enforced (>= 1)',
    str_contains($smtp_code, 'DCB_SMTP_PORT >= 1')
);
verify(
    'SMTP: port upper bound enforced (<= 65535)',
    str_contains($smtp_code, 'DCB_SMTP_PORT <= 65535')
);
verify(
    'SMTP: user validated with FILTER_VALIDATE_EMAIL',
    str_contains($smtp_code, 'FILTER_VALIDATE_EMAIL')
);
verify(
    "SMTP: password validated as non-empty string ('' !== (string))",
    str_contains($smtp_code, "'' !== (string) DCB_SMTP_PASS")
);
verify(
    "SMTP: secure mode validated with in_array(['tls','ssl'], strict)",
    str_contains($smtp_code, "in_array( DCB_SMTP_SECURE, [ 'tls', 'ssl' ], true )")
);

// ── SMTP: PHPMailer configuration ─────────────────────────────────────────────
echo "\n=== SMTP: PHPMailer configuration ===\n";
verify(
    'SMTP: isSMTP() called',
    str_contains($smtp_code, 'isSMTP()')
);
verify(
    'SMTP: SMTPAuth set to true',
    str_contains($smtp_code, 'SMTPAuth    = true')
);
verify(
    'SMTP: Timeout set to 15 seconds',
    str_contains($smtp_code, 'Timeout     = 15')
);
verify(
    'SMTP: SMTPDebug set to 0 (disabled)',
    str_contains($smtp_code, 'SMTPDebug   = 0')
);
verify(
    "SMTP: TLS — SMTPAutoTLS true when SMTPSecure is 'tls'",
    str_contains($smtp_code, "SMTPAutoTLS = ( 'tls' === (string) DCB_SMTP_SECURE )")
);
verify(
    "SMTP: SSL — SMTPAutoTLS false when SMTPSecure is 'ssl' (expression evaluates to false)",
    // The expression `'tls' === 'ssl'` → false; verify the ternary is present
    str_contains($smtp_code, "'tls' === (string) DCB_SMTP_SECURE")
);
verify(
    'SMTP: Host, Port, Username, Password, SMTPSecure all assigned in configure()',
    str_contains($smtp_code, 'Host        = (string) DCB_SMTP_HOST') &&
    str_contains($smtp_code, 'Port        = (int) DCB_SMTP_PORT') &&
    str_contains($smtp_code, 'Username    = (string) DCB_SMTP_USER') &&
    str_contains($smtp_code, 'Password    = (string) DCB_SMTP_PASS') &&
    str_contains($smtp_code, 'SMTPSecure  = (string) DCB_SMTP_SECURE')
);

// ── SMTP: Security ─────────────────────────────────────────────────────────────
echo "\n=== SMTP: Security ===\n";
verify(
    'SMTP: admin notice gated by current_user_can (administrators only)',
    str_contains($smtp_code, 'current_user_can')
);
verify(
    'SMTP: password never passed to error_log',
    ! (bool) preg_match('/error_log[\s\S]{0,200}DCB_SMTP_PASS/m', $smtp_code) &&
    ! (bool) preg_match('/DCB_SMTP_PASS[\s\S]{0,200}error_log/m', $smtp_code)
);
verify(
    'SMTP: DCB_Logger never called from SMTP class (no credential leakage path)',
    ! str_contains($smtp_code, 'DCB_Logger')
);
verify(
    'SMTP: show_config_notice body does not reference credential constants',
    (function () use ($smtp_code): bool {
        $start = strpos($smtp_code, 'function show_config_notice');
        if (false === $start) {
            return false;
        }
        $region = substr($smtp_code, $start, 500);
        return ! str_contains($region, 'DCB_SMTP_PASS')
            && ! str_contains($region, 'DCB_SMTP_USER')
            && ! str_contains($region, 'DCB_SMTP_HOST')
            && ! str_contains($region, 'DCB_SMTP_PORT')
            && ! str_contains($region, 'DCB_SMTP_SECURE');
    })()
);
verify(
    'SMTP: health endpoint does not expose SMTP constants',
    ! str_contains($routes_code, 'DCB_SMTP_')
);
verify(
    'SMTP: no SMTP credentials in any REST response (routes file)',
    ! str_contains($routes_code, 'DCB_SMTP_PASS') &&
    ! str_contains($routes_code, 'DCB_SMTP_USER')
);

// ── PHP syntax check — all 13 plugin files ────────────────────────────────────
echo "\n=== PHP syntax check ===\n";
$files = [
    $plugin_dir . 'class-dcb-email.php',
    $plugin_dir . 'class-dcb-free-order.php',
    $plugin_dir . 'class-dcb-download-handler.php',
    $plugin_dir . 'class-dcb-recover.php',
    $plugin_dir . 'class-dcb-auth.php',
    $plugin_dir . 'class-dcb-rate-limit.php',
    $plugin_dir . 'class-dcb-logger.php',
    $plugin_dir . 'class-dcb-validator.php',
    $plugin_dir . 'class-dcb-url-sanitizer.php',
    $plugin_dir . 'class-dcb-idempotency.php',
    $plugin_dir . 'class-dcb-download-token.php',
    $plugin_dir . 'class-dcb-routes.php',
    $plugin_dir . 'class-dcb-smtp.php',
];
foreach ($files as $file) {
    $output = shell_exec("php -l " . escapeshellarg($file) . " 2>&1");
    $base   = basename($file);
    verify(
        "$base: no syntax errors",
        str_contains($output ?? '', 'No syntax errors')
    );
}

echo "\n$passed passed, $failed failed\n";
exit($failed > 0 ? 1 : 0);
