// ---------------------------------------------------------------------------
// Registration-deadline date helpers.
//
// Batches run on India time, so admins type a wall-clock deadline in IST while
// the database stores a real instant (timestamptz). These helpers convert
// between the two so "closes 10 Jul, 11:59 PM" means the same moment for the
// admin, the student, and the server-side guard in registerStudentAction.
//
// IST has no DST, so a fixed +05:30 offset is exact.
// ---------------------------------------------------------------------------

export const WORKSHOP_TIME_ZONE = 'Asia/Kolkata';
export const WORKSHOP_TIME_ZONE_LABEL = 'IST';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * `<input type="datetime-local">` value (IST wall clock) -> ISO instant (UTC).
 * Returns null for an empty/unparseable value, which means "no deadline".
 */
export function istInputToISO(value: string | null | undefined): string | null {
  if (!value) return null;
  const wallClock = value.slice(0, 16); // 'YYYY-MM-DDTHH:mm'
  const parsed = new Date(`${wallClock}:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

/**
 * ISO instant (UTC) -> `<input type="datetime-local">` value (IST wall clock).
 */
export function isoToIstInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Date(parsed.getTime() + IST_OFFSET_MS).toISOString().slice(0, 16);
}

/**
 * Human-readable deadline, always rendered in IST so server and client markup
 * match (no hydration drift from the viewer's local timezone).
 */
export function formatDeadline(iso: string | null | undefined): string {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  const formatted = parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: WORKSHOP_TIME_ZONE,
  });
  return `${formatted} ${WORKSHOP_TIME_ZONE_LABEL}`;
}

/** True once the deadline instant has passed. No deadline = never past. */
export function isDeadlinePassed(
  iso: string | null | undefined,
  now: number = Date.now()
): boolean {
  if (!iso) return false;
  const deadline = Date.parse(iso);
  if (Number.isNaN(deadline)) return false;
  return now >= deadline;
}

/**
 * Registrations are closed when the admin switched them off OR the deadline
 * passed. Single source of truth shared by the UI and the server action.
 */
export function isRegistrationClosed(
  batch: { registrationOpen?: boolean; registrationDeadline?: string | null },
  now: number = Date.now()
): boolean {
  if (batch.registrationOpen === false) return true;
  return isDeadlinePassed(batch.registrationDeadline, now);
}

/**
 * Short "time left" label for the countdown shown next to the deadline, e.g.
 * "2d 4h left" / "45m left". Returns '' once the deadline has passed.
 */
export function formatTimeLeft(
  iso: string | null | undefined,
  now: number = Date.now()
): string {
  if (!iso) return '';
  const deadline = Date.parse(iso);
  if (Number.isNaN(deadline)) return '';

  const ms = deadline - now;
  if (ms <= 0) return '';

  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes % 60}m left`;
  return `${Math.max(minutes, 1)}m left`;
}
