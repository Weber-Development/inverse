---
title: Switzerland
description: A note for shops that sell to customers in Switzerland.
---

The withdrawal function (Article 11a of the Consumer Rights Directive) and the German cancellation button (§ 312k BGB) come from EU and German law. Inverse makes no statement that Swiss law contains an equivalent duty; as far as Inverse's authors know, Swiss law has no general right of withdrawal for online purchases. Rules can change and special cases exist, so ask your counsel or check the current law before you decide.

What this means for the kit:

- If you sell to customers in the EU as well, the German and Austrian duties apply to those sales, wherever your shop is based. Inverse's buttons do not distinguish customers by country: the same buttons serve everyone.
- If you offer a withdrawal or cancellation option to Swiss customers voluntarily, use the same flow. Set `locale` to `de`, `fr` or `it`.
- Inverse does not calculate Swiss periods or holidays. `withdrawalDeadline()` follows the German rules; pass `isHoliday` for your own calendar if you use it for a voluntary option.

Inverse is software, not legal advice. See also [Austria](/inverse/docs/reference/austria) and the [legal status](/inverse/docs/reference/legal-status).
