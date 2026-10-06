/**
 * Ready-to-paste integrations for shop platforms that cannot use React. Each snippet loads the
 * script-tag build and mounts the forms; the handler stays on your own server.
 */
export const platforms = ["woocommerce", "shopware", "shopify", "wordpress", "html"] as const;
export type Platform = (typeof platforms)[number];

export interface SnippetOptions {
  /** URL of your `createInverseHandler` endpoint. */
  endpoint: string;
  /** Minor version of the script to load, e.g. `0.6`. */
  version?: string;
  /** Page paths of the two forms. */
  paths?: { withdrawal: string; cancellation: string };
}

const SCRIPT = (v: string) =>
  `https://cdn.jsdelivr.net/npm/@sweberdev/inverse@${v}/dist/inverse.global.js`;

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Returns the snippet for a platform, with usage notes as comments. */
export function snippet(platform: Platform, options: SnippetOptions): string {
  const v = options.version ?? "0.6";
  const w = options.paths?.withdrawal ?? "/widerruf";
  const c = options.paths?.cancellation ?? "/kuendigen";
  const endpoint = esc(options.endpoint);
  const script = SCRIPT(v);
  const html = `<a data-inverse-link="withdrawal" href="${w}"></a>
<a data-inverse-link="cancellation" href="${c}"></a>
<script src="${script}" defer></script>`;
  const form = (kind: string) =>
    `<div data-inverse-form="${kind}" data-endpoint="${endpoint}"></div>
<script src="${script}" defer></script>`;
  switch (platform) {
    case "html":
      return `<!-- footer, every page -->
${html}

<!-- page ${w} -->
${form("withdrawal")}

<!-- page ${c} -->
${form("cancellation")}
`;
    case "wordpress":
      return `<?php
// Add to a code-snippets plugin or your child theme's functions.php.
// Create two pages (${w}, ${c}) and put the shortcodes [inverse_withdrawal] and [inverse_cancellation] in them.
add_action('wp_footer', function () {
  echo '<a data-inverse-link="withdrawal" href="${w}"></a> ';
  echo '<a data-inverse-link="cancellation" href="${c}"></a>';
  echo '<script src="${script}" defer></script>';
});
foreach (['withdrawal', 'cancellation'] as $kind) {
  add_shortcode('inverse_' . $kind, function () use ($kind) {
    return '<div data-inverse-form="' . $kind . '" data-endpoint="${endpoint}"></div>';
  });
}
`;
    case "woocommerce":
      return `<?php
// WooCommerce: as the WordPress snippet, plus the buttons in the account area and below every order.
// Add to a code-snippets plugin or your child theme's functions.php.
add_action('wp_footer', function () {
  echo '<script src="${script}" defer></script>';
});
add_action('woocommerce_account_dashboard', function () {
  echo '<p><a data-inverse-link="withdrawal" href="${w}"></a></p>';
  echo '<p><a data-inverse-link="cancellation" href="${c}"></a></p>';
});
add_action('woocommerce_order_details_after_order_table', function ($order) {
  echo '<a data-inverse-link="withdrawal" href="${w}?order=' . esc_attr($order->get_order_number()) . '"></a>';
});
foreach (['withdrawal', 'cancellation'] as $kind) {
  add_shortcode('inverse_' . $kind, function () use ($kind) {
    $ref = isset($_GET['order']) ? ' data-contract-ref="' . esc_attr(wp_unslash($_GET['order'])) . '"' : '';
    return '<div data-inverse-form="' . $kind . '" data-endpoint="${endpoint}"' . $ref . '></div>';
  });
}
`;
    case "shopware":
      return `{# Shopware 6: storefront/layout/footer/footer.html.twig in your theme #}
{% sw_extends '@Storefront/storefront/layout/footer/footer.html.twig' %}

{% block layout_footer_bottom %}
  {{ parent() }}
  <a data-inverse-link="withdrawal" href="{{ seoUrl('frontend.landing.page', { landingPageId: config('YourTheme.config.withdrawalPageId') }) }}"></a>
  <a data-inverse-link="cancellation" href="${c}"></a>
  <script src="${script}" defer></script>
{% endblock %}

{# In the Shopping Experience pages for ${w} and ${c}, add a "Custom HTML" element: #}
{#   <div data-inverse-form="withdrawal" data-endpoint="${endpoint}"></div> #}
{#   <div data-inverse-form="cancellation" data-endpoint="${endpoint}"></div> #}
`;
    case "shopify":
      return `{% comment %} Shopify: snippets/inverse.liquid, then {% render 'inverse' %} in layout/theme.liquid before </body>. {% endcomment %}
<a data-inverse-link="withdrawal" href="${w}"></a>
<a data-inverse-link="cancellation" href="${c}"></a>
<script src="${script}" defer></script>

{% comment %} Pages ${w} and ${c}: a "Custom Liquid" section with: {% endcomment %}
{% comment %} <div data-inverse-form="withdrawal" data-endpoint="${endpoint}" data-contract-ref="{{ customer.last_order.name }}"></div> {% endcomment %}
{% comment %} <div data-inverse-form="cancellation" data-endpoint="${endpoint}"></div> {% endcomment %}
`;
  }
}
