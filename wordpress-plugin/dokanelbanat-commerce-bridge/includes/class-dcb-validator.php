<?php
defined( 'ABSPATH' ) || exit;

class DCB_Validator {

    public static function email( string $value ): string|false {
        $sanitized = sanitize_email( $value );
        return is_email( $sanitized ) ? $sanitized : false;
    }

    public static function name( string $value, int $max = 100 ): string|false {
        $sanitized = sanitize_text_field( $value );
        if ( '' === $sanitized || mb_strlen( $sanitized ) > $max ) {
            return false;
        }
        return $sanitized;
    }

    public static function phone( string $value ): string|false {
        $stripped = preg_replace( '/[^\d\+\-\(\)\s]/', '', $value );
        if ( null === $stripped ) {
            return false;
        }
        $stripped = trim( $stripped );
        if ( '' === $stripped || mb_strlen( $stripped ) > 30 ) {
            return false;
        }
        return $stripped;
    }

    public static function product_id( mixed $value ): int|false {
        $id = (int) $value;
        return $id > 0 ? $id : false;
    }

    public static function idempotency_key( string $value ): string|false {
        $sanitized = preg_replace( '/[^a-zA-Z0-9\-_]/', '', $value );
        if ( null === $sanitized ) {
            return false;
        }
        $len = mb_strlen( $sanitized );
        return ( $len >= 8 && $len <= 128 ) ? $sanitized : false;
    }

    public static function order_number( string $value ): string|false {
        $sanitized = preg_replace( '/[^\d]/', '', $value );
        if ( null === $sanitized ) {
            return false;
        }
        $len = mb_strlen( $sanitized );
        return ( $len >= 1 && $len <= 20 ) ? $sanitized : false;
    }
}
