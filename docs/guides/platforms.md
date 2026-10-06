---
title: WooCommerce, Shopware and Shopify
description: Add the withdrawal and cancellation buttons to a shop platform with a ready-to-paste snippet.
---

Most online shops run on a platform, not on React. For these, Inverse ships a snippet per platform. It loads the [script-tag build](/inverse/docs/guides/plain-html) and posts to a [handler](/inverse/docs/reference/handler) on your own server, so set that up first. For a handler on another domain, switch on the `cors` option.

```sh
npx @sweberdev/inverse snippet woocommerce --endpoint https://api.example.com/inverse
```

Platforms: `woocommerce`, `shopware`, `shopify`, `wordpress`, `html`. The command prints the snippet with notes on where it goes. Pin the script version by editing the `@0.6` part of the URL.

## What each snippet does

| Platform | Footer links | Forms | Extra |
|---|---|---|---|
| WooCommerce | account area and every order | shortcodes `[inverse_withdrawal]`, `[inverse_cancellation]` | the order number is prefilled from `?order=` |
| Shopware 6 | theme footer block | "Custom HTML" element in a Shopping Experience page | |
| Shopify | `snippets/inverse.liquid`, rendered in the theme | "Custom Liquid" section | the last order name is prefilled |
| WordPress | `wp_footer` | shortcodes | |
| HTML | paste into the footer | paste into the two pages | |

The links get the statutory labels ("Vertrag widerrufen", "Verträge hier kündigen") in the page's language. Where the buttons have to appear (every page, logged out, without extra steps) is described in [Legal background](/inverse/docs/reference/legal); `inverse check <url>` verifies your live pages.

The snippets are starting points. Platform versions and themes differ, so test the result in your theme and with `inverse check`.
