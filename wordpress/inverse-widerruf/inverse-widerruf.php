<?php
/**
 * Plugin Name: Inverse Widerruf und Kündigung
 * Description: Withdrawal button (§ 356a BGB) and cancellation button (§ 312k BGB) for WordPress and WooCommerce. Posts to your Inverse handler.
 * Version: 1.0.0
 * License: MIT
 * Requires PHP: 7.4
 *
 * Shortcodes: [inverse_withdrawal], [inverse_cancellation].
 * Settings: Settings > Inverse (handler URL, page paths, script version).
 */

if (!defined('ABSPATH')) {
    exit;
}

const INVERSE_WP_OPTION = 'inverse_widerruf';

function inverse_wp_options(): array
{
    $saved = get_option(INVERSE_WP_OPTION, []);
    return wp_parse_args(is_array($saved) ? $saved : [], [
        'endpoint' => '',
        'withdrawal_path' => '/widerruf',
        'cancellation_path' => '/kuendigen',
        'version' => '1',
        'woocommerce_links' => '1',
    ]);
}

function inverse_wp_script_url(array $o): string
{
    $version = preg_replace('/[^0-9.]/', '', $o['version']);
    return 'https://cdn.jsdelivr.net/npm/@sweberdev/inverse@' . $version . '/dist/inverse.global.js';
}

// Footer links with the statutory labels, on every page, for logged-out visitors too.
add_action('wp_footer', function () {
    $o = inverse_wp_options();
    if ($o['endpoint'] === '') {
        return;
    }
    echo '<nav class="inverse-links" aria-label="Widerruf und Kündigung">';
    echo '<a data-inverse-link="withdrawal" href="' . esc_url(home_url($o['withdrawal_path'])) . '"></a> ';
    echo '<a data-inverse-link="cancellation" href="' . esc_url(home_url($o['cancellation_path'])) . '"></a>';
    echo '</nav>';
    echo '<script src="' . esc_url(inverse_wp_script_url($o)) . '" defer></script>';
});

// Links in the WooCommerce account area and below every order.
add_action('woocommerce_account_dashboard', function () {
    $o = inverse_wp_options();
    if ($o['endpoint'] === '' || $o['woocommerce_links'] !== '1') {
        return;
    }
    echo '<p><a data-inverse-link="withdrawal" href="' . esc_url(home_url($o['withdrawal_path'])) . '"></a></p>';
    echo '<p><a data-inverse-link="cancellation" href="' . esc_url(home_url($o['cancellation_path'])) . '"></a></p>';
});

add_action('woocommerce_order_details_after_order_table', function ($order) {
    $o = inverse_wp_options();
    if ($o['endpoint'] === '' || $o['woocommerce_links'] !== '1') {
        return;
    }
    $url = add_query_arg('order', rawurlencode((string) $order->get_order_number()), home_url($o['withdrawal_path']));
    echo '<a data-inverse-link="withdrawal" href="' . esc_url($url) . '"></a>';
});

foreach (['withdrawal', 'cancellation'] as $inverse_kind) {
    add_shortcode('inverse_' . $inverse_kind, function () use ($inverse_kind) {
        $o = inverse_wp_options();
        if ($o['endpoint'] === '') {
            return current_user_can('manage_options') ? '<p>Inverse: set the handler URL under Settings &gt; Inverse.</p>' : '';
        }
        $ref = '';
        if (isset($_GET['order'])) {
            $ref = ' data-contract-ref="' . esc_attr(sanitize_text_field(wp_unslash($_GET['order']))) . '"';
        }
        return '<div data-inverse-form="' . esc_attr($inverse_kind) . '" data-endpoint="' . esc_url($o['endpoint']) . '"' . $ref . '></div>';
    });
}

// Settings page.
add_action('admin_menu', function () {
    add_options_page('Inverse', 'Inverse', 'manage_options', 'inverse-widerruf', 'inverse_wp_settings_page');
});

add_action('admin_init', function () {
    register_setting('inverse_widerruf_group', INVERSE_WP_OPTION, [
        'type' => 'array',
        'sanitize_callback' => function ($input) {
            $input = is_array($input) ? $input : [];
            return [
                'endpoint' => isset($input['endpoint']) ? esc_url_raw($input['endpoint']) : '',
                'withdrawal_path' => '/' . ltrim(sanitize_text_field($input['withdrawal_path'] ?? '/widerruf'), '/'),
                'cancellation_path' => '/' . ltrim(sanitize_text_field($input['cancellation_path'] ?? '/kuendigen'), '/'),
                'version' => preg_replace('/[^0-9.]/', '', $input['version'] ?? '1'),
                'woocommerce_links' => !empty($input['woocommerce_links']) ? '1' : '0',
            ];
        },
    ]);
});

function inverse_wp_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $o = inverse_wp_options();
    $name = INVERSE_WP_OPTION;
    ?>
    <div class="wrap">
        <h1>Inverse</h1>
        <p>Create two pages with the shortcodes <code>[inverse_withdrawal]</code> and <code>[inverse_cancellation]</code>. The handler (<code>createInverseHandler</code>) runs on your own server; see packages.sweber.dev/inverse/docs.</p>
        <form method="post" action="options.php">
            <?php settings_fields('inverse_widerruf_group'); ?>
            <table class="form-table" role="presentation">
                <tr><th scope="row"><label for="inverse-endpoint">Handler URL</label></th>
                    <td><input id="inverse-endpoint" class="regular-text" type="url" name="<?php echo esc_attr($name); ?>[endpoint]" value="<?php echo esc_attr($o['endpoint']); ?>"></td></tr>
                <tr><th scope="row"><label for="inverse-wp">Withdrawal page path</label></th>
                    <td><input id="inverse-wp" type="text" name="<?php echo esc_attr($name); ?>[withdrawal_path]" value="<?php echo esc_attr($o['withdrawal_path']); ?>"></td></tr>
                <tr><th scope="row"><label for="inverse-cp">Cancellation page path</label></th>
                    <td><input id="inverse-cp" type="text" name="<?php echo esc_attr($name); ?>[cancellation_path]" value="<?php echo esc_attr($o['cancellation_path']); ?>"></td></tr>
                <tr><th scope="row"><label for="inverse-v">Script version</label></th>
                    <td><input id="inverse-v" type="text" name="<?php echo esc_attr($name); ?>[version]" value="<?php echo esc_attr($o['version']); ?>"></td></tr>
                <tr><th scope="row">WooCommerce</th>
                    <td><label><input type="checkbox" name="<?php echo esc_attr($name); ?>[woocommerce_links]" value="1" <?php checked($o['woocommerce_links'], '1'); ?>> Links in the account area and below every order</label></td></tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
