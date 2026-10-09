---
title: Austria
description: What Inverse covers for shops that sell to customers in Austria, and what it does not claim.
---

Directive (EU) 2023/2673 introduced the withdrawal function (Article 11a of the Consumer Rights Directive) for all member states. Germany implemented it in § 356a BGB, in force from 19 June 2026. For Austria, the implementation in the consumer law for distance and off-premises contracts (FAGG) applies from 1 October 2026, according to the information available when this page was written. Check the current text and the date before you rely on this page.

## What Inverse does for Austria

- **Withdrawal button.** The labels of the withdrawal function are taken from Article 11a of the directive, so the German label "Vertrag widerrufen" is the same for Austrian customers. The two-step flow (details, then a confirm button), the receipt with date and time and the downloadable copy follow the same Article. Set `locale` to `de` for Austrian shops; the texts do not use German-only terms.
- **Period.** The withdrawal period is 14 days, as in the directive. `withdrawalDeadline()` calculates it with the weekend and holiday rule of the German BGB (§§ 187, 188, 193 BGB). If you want Austria's holidays, pass an `isHoliday(isoDate)` function; the helper does not know them. Whether the German day-count rule matches the Austrian one is for you or your counsel to confirm.
- **Refund.** The refund within 14 days after receipt of the withdrawal is shown in the Pro team notification and digest; the figure follows the directive.

## What Inverse does not claim

- **Cancellation button.** Inverse's cancellation button follows the German § 312k BGB. Inverse makes no statement that an equivalent duty exists in Austria. If you offer the button to Austrian customers anyway, it does no harm, but it is your decision, not something this page confirms.
- **Section numbers and wording.** This page does not quote Austrian sections, because the implementation text changes. Look them up at the source (RIS, ris.bka.gv.at) or ask your counsel.
- **Your pages.** Where the button has to appear and how your terms describe the process stay your responsibility. `inverse check` verifies that the buttons exist on your pages; it does not judge the law.

When the Austrian rules or the first rulings change something in the texts, the fix ships as a new version, a line in the [legal status](/inverse/docs/reference/legal-status) and a note in the release post. Inverse is software, not legal advice.
