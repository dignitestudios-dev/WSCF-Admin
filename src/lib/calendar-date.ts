/**
 * Dates that are days, not moments — a birth date is 23 June wherever you are
 * standing, with no time and no timezone.
 *
 * The API stores one as midnight UTC and returns it as an ISO string. Rendering
 * that instant in the browser's timezone moves the day for anyone west of
 * Greenwich (midnight UTC on the 23rd is the evening of the 22nd at UTC-6). So
 * nothing here converts: both shapes we deal with,
 *
 *   "2018-06-23"                  what the date picker produces and the API accepts
 *   "2018-06-23T00:00:00.000Z"    what the API returns
 *
 * begin with the calendar day we want, which is read straight off the front of
 * the string and rebuilt as local midnight. Same approach as the player app.
 */

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

/** The calendar day a stored value means, as a local Date. Null if unusable. */
export function parseCalendarDate(value?: string | Date | null): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const match = String(value).match(CALENDAR_DATE);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * The wire format the API expects: the calendar day, no time, no offset.
 * `toISOString()` is avoided on purpose — it converts to UTC and can move the
 * day.
 */
export function toCalendarDateString(date?: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
