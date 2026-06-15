# WooCommerce Headless CORS

The headless checkout page at `https://dokanelbanat.com/checkout` talks to the WooCommerce Store API on `https://blog.dokanelbanat.com`.

WooCommerce must allow the main domain to read Store API responses and the cart headers used by the Store API:

- `Nonce`
- `Cart-Token`

Add this as a small WordPress plugin on `blog.dokanelbanat.com` or in a site-specific snippets plugin. Avoid adding it to a theme file if the theme may be changed later.

```php
<?php
/**
 * Plugin Name: Dokanelbanat Headless WooCommerce CORS
 * Description: Allows dokanelbanat.com to use WooCommerce Store API cart and checkout endpoints.
 */

add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
    $origin = get_http_origin();
    $allowed_origins = [
        'https://dokanelbanat.com',
        'https://www.dokanelbanat.com',
    ];

    if ($origin && in_array($origin, $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Nonce, Cart-Token, X-WP-Nonce');
        header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages, Link, Cart-Token, Nonce');
    }

    return $served;
}, 15, 4);
```

For local development, temporarily add `http://127.0.0.1:4321` to `$allowed_origins`, then remove it before production hardening.
