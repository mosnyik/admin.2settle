import { REPORTING_TIME_ZONE } from "./monthly-volume";

const DAY = 86_400_000;
const LAGOS_OFFSET = 3_600_000;

function firstMonday(year: number): number {
  // ISO week 1 is the week containing January 4.
  const january4 = new Date(Date.UTC(year, 0, 4));
  return january4.getTime() - ((january4.getUTCDay() + 6) % 7) * DAY;
}

export function currentReportingWeek(now = new Date()): string {
  const local = new Date(now.getTime() + LAGOS_OFFSET);
  const day = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  const monday = day - ((local.getUTCDay() + 6) % 7) * DAY;
  const weekYear = new Date(monday + 3 * DAY).getUTCFullYear();
  const week = Math.round((monday - firstMonday(weekYear)) / (7 * DAY)) + 1;
  return `${weekYear}-W${String(week).padStart(2, "0")}`;
}

export function weekBounds(week: string) {
  if (!/^[1-9]\d{3}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(week)) {
    throw new Error("Choose a valid week in YYYY-Www format.");
  }
  const [year, weekNumber] = week.split("-W").map(Number);
  const monday = firstMonday(year) + (weekNumber - 1) * 7 * DAY;
  if (monday >= firstMonday(year + 1)) {
    throw new Error("This year does not have week 53.");
  }
  return {
    start: (monday - LAGOS_OFFSET) / 1000,
    end: (monday + 7 * DAY - LAGOS_OFFSET) / 1000,
  };
}

export function weekLabel(week: string): string {
  const { start, end } = weekBounds(week);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: REPORTING_TIME_ZONE,
  });
  return `${formatter.format(new Date(start * 1000))} – ${formatter.format(new Date((end - 1) * 1000))}`;
}
