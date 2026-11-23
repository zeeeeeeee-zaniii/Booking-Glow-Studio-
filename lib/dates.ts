/** Small date helpers shared by client and server code. All dates are
 *  handled as local "YYYY-MM-DD" strings so bookings never shift a day
 *  because of time zones. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** 0 = Sunday … 6 = Saturday, from an ISO date string. */
export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function isSunday(iso: string): boolean {
  return weekdayOf(iso) === 0;
}

/** "2026-11-24" -> "Tue 24 Nov 2026" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "2026-11-24" -> "Tue 24" (compact, for the date picker) */
export function formatDateShort(iso: string): { weekday: string; label: string } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
    label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  };
}

/** Hourly appointment start times, 10:00 to 19:00. */
export const TIME_SLOTS: string[] = Array.from({ length: 10 }, (_, i) => {
  const hour = 10 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

/** "13:00" -> "1:00 PM" */
export function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}
