/**
 * Date helpers for the withdrawal period and the end of a cancelled contract.
 * All dates are calendar dates (YYYY-MM-DD) without time of day.
 */

export interface Period {
  days?: number;
  weeks?: number;
  months?: number;
}

export function toIsoDate(date: Date, timeZone = "Europe/Berlin"): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parse(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`);
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Adds a period. Months follow § 188 Abs. 3 BGB: 31 Jan + 1 month = 28/29 Feb. */
export function addPeriod(start: string, period: Period): string {
  const d = parse(start);
  if (period.months) {
    const day = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + period.months);
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(day, last));
  }
  const days = (period.days ?? 0) + (period.weeks ?? 0) * 7;
  if (days) d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

/** Moves a deadline that ends on a Saturday, Sunday or holiday to the next working day (§ 193 BGB). */
export function nextWorkingDay(date: string, isHoliday?: (isoDate: string) => boolean): string {
  let d = date;
  for (;;) {
    const weekday = parse(d).getUTCDay();
    if (weekday !== 0 && weekday !== 6 && !isHoliday?.(d)) return d;
    d = addPeriod(d, { days: 1 });
  }
}

export interface WithdrawalPeriodOptions {
  /**
   * The day the period starts from: the day the contract was concluded, or for goods the day
   * the consumer received them (or the last item of a split delivery).
   */
  start: string;
  /**
   * `false` if the consumer was not properly informed about the right of withdrawal. The
   * right then expires at the latest 12 months after the end of the regular period.
   * Defaults to `true`.
   */
  informed?: boolean;
  /** Public holidays at the trader's seat, for § 193 BGB. Weekends are always handled. */
  isHoliday?: (isoDate: string) => boolean;
}

/**
 * Last day of the withdrawal period. The day of the event is not counted (§ 187 Abs. 1 BGB),
 * so the 14 days end 14 calendar days later, moved to the next working day if needed.
 */
export function withdrawalDeadline(options: WithdrawalPeriodOptions): string {
  let end = addPeriod(options.start, { days: 14 });
  if (options.informed === false) end = addPeriod(end, { months: 12 });
  return nextWorkingDay(end, options.isHoliday);
}

/**
 * Whether a declaration submitted at `at` is within the period. Using the withdrawal
 * function before the period ends is enough (§ 356a Abs. 5 BGB).
 */
export function isWithinWithdrawalPeriod(
  options: WithdrawalPeriodOptions & { at?: Date; timeZone?: string },
): boolean {
  const day = toIsoDate(options.at ?? new Date(), options.timeZone);
  return day <= withdrawalDeadline(options);
}

export interface ContractEndOptions {
  /** Date the cancellation was received. */
  received: string;
  /** Notice period. Contracts renewed by law after 1 March 2022 allow at most one month. */
  notice: Period;
  /** Last day of the current fixed term, if the contract is still in it. */
  termEnd?: string;
  /** The date the consumer asked for, or `earliest`. */
  requested?: string;
}

/**
 * The day the contract ends: the requested date if it is later than the earliest possible one,
 * otherwise the earliest possible date. Within a fixed term that is the end of the term when
 * the notice period still fits, otherwise the date the notice period runs out.
 */
export function contractEndDate(options: ContractEndOptions): string {
  const afterNotice = addPeriod(options.received, options.notice);
  let earliest = afterNotice;
  if (options.termEnd && afterNotice <= options.termEnd) earliest = options.termEnd;
  const requested = options.requested;
  if (requested && requested !== "earliest" && requested > earliest) return requested;
  return earliest;
}
