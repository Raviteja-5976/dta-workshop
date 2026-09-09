import { isMock } from '@/lib/supabase/config';
import { isRegistrationClosed } from '@/lib/datetime';
import { resolveCoverImage } from '@/lib/images';
import {
  workshopsData as staticWorkshops,
  Workshop,
  SessionDetails,
  FAQItem,
  LearningOutcome,
} from '@/data/workshops';

// ---------------------------------------------------------------------------
// Workshop data access.
//
// These functions are the single source of truth the UI reads from. They query
// Supabase on the server and map the normalized schema (workshops + batches +
// sessions, see supabase/schema.sql) back into the flat `Workshop` shape the
// existing components already expect.
//
// Until real keys are set (or if a query fails / returns nothing) they fall back
// to the bundled static data in src/data/workshops.ts, so the site never breaks.
// ---------------------------------------------------------------------------

// Shape returned by the nested Supabase select below.
type WorkshopRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  about_text: string | null;
  cover_image: string | null;
  difficulty: Workshop['difficulty'];
  category: Workshop['category'];
  highlights: string[] | string | null;
  learning_outcomes: Workshop['learningOutcomes'] | string | null;
  faq: Workshop['faq'] | string | null;
  project_preview_url: string | null;
  project_preview_enabled: boolean | null;
  default_instructor_id: string | null;
  workshop_batches: BatchRow[] | null;
};

type BatchRow = {
  id: string;
  batch_label: string | null;
  status: Workshop['status'];
  date_label: string | null;
  start_date: string | null;
  duration_label: string | null;
  num_sessions: number | null;
  price: number | null;
  original_price: number | null;
  seat_limit: number | null;
  registration_open: boolean | null;
  registration_deadline: string | null;
  batch_sessions: SessionRow[] | null;
};

type SessionRow = {
  session_order: number;
  title: string;
  about: string | null;
  duration_label: string | null;
  scheduled_at: string | null;
  topics: string[] | string | null;
  assignment: string | null;
  resources: string[] | string | null;
};

const WORKSHOP_SELECT = `
  id, slug, title, description, about_text, cover_image, difficulty, category,
  highlights, learning_outcomes, faq,
  project_preview_url, project_preview_enabled,
  default_instructor_id,
  workshop_batches (
    id, batch_label, status, date_label, start_date, duration_label, num_sessions,
    price, original_price, seat_limit, registration_open, registration_deadline,
    batch_sessions ( session_order, title, about, duration_label, scheduled_at, topics, assignment, resources )
  )
`;

function pickPrimaryBatch(batches: BatchRow[] | null): BatchRow | undefined {
  if (!batches || batches.length === 0) return undefined;
  // Prefer the earliest-dated batch; batches without a date sort last.
  return [...batches].sort((a, b) => {
    const da = a.start_date ? Date.parse(a.start_date) : Number.POSITIVE_INFINITY;
    const db = b.start_date ? Date.parse(b.start_date) : Number.POSITIVE_INFINITY;
    return da - db;
  })[0];
}

function safeJsonParse<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch (e) {
      console.error('Failed to parse JSON:', val, e);
      return fallback;
    }
  }
  return val as T;
}

function mapSessions(sessions: SessionRow[] | null): SessionDetails[] {
  if (!sessions) return [];
  return [...sessions]
    .sort((a, b) => a.session_order - b.session_order)
    .map((s) => ({
      num: `Session ${s.session_order}`,
      title: s.title,
      about: s.about ?? '',
      duration: s.duration_label ?? '',
      scheduledAt: s.scheduled_at ?? null,
      topics: safeJsonParse<string[]>(s.topics, []),
      assignment: s.assignment ?? '',
      resources: safeJsonParse<string[]>(s.resources, []),
    }));
}

// Instructors live in `profiles` (role = 'instructor'), which is NOT publicly
// readable — that table holds PII (email/phone). So we resolve instructor names
// on the server with the service-role client and only ever surface the name.
// If the service-role key isn't configured, names fall back to 'DTA Team'.
async function fetchInstructorNames(
  ids: Array<string | null>
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(ids.filter((id): id is string => !!id)));
  const names = new Map<string, string>();
  if (unique.length === 0) return names;

  try {
    const { getAdminClient } = await import('@/lib/supabase/admin');
    const supabase = await getAdminClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', unique);
    for (const p of data ?? []) {
      if (p.full_name) names.set(p.id, p.full_name);
    }
  } catch (e) {
    console.error('fetchInstructorNames failed:', e);
  }
  return names;
}

// Real remaining-seat counts come from the batch_seat_status view (seat_limit
// minus confirmed registrations). Read with the service-role client so RLS on
// registrations doesn't undercount for anonymous/other visitors.
async function fetchSeatsRemaining(
  batchIds: Array<string | null>
): Promise<Map<string, number>> {
  const unique = Array.from(new Set(batchIds.filter((id): id is string => !!id)));
  const remaining = new Map<string, number>();
  if (unique.length === 0) return remaining;

  try {
    const { getAdminClient } = await import('@/lib/supabase/admin');
    const supabase = await getAdminClient();
    const { data } = await supabase
      .from('batch_seat_status')
      .select('batch_id, seats_remaining')
      .in('batch_id', unique);
    for (const s of data ?? []) {
      if (typeof s.seats_remaining === 'number') {
        remaining.set(s.batch_id, s.seats_remaining);
      }
    }
  } catch (e) {
    console.error('fetchSeatsRemaining failed:', e);
  }
  return remaining;
}

// Build a display date range ("18 - 19 Jul", or "18 Jul" for a single day) from
// the actual session schedule, so the workshop date always matches the sessions.
// scheduled_at is a naive wall-clock stored as UTC, so format in UTC to avoid a
// timezone shift (mirrors the session-time rendering on the detail page).
function formatSessionDateRange(sessions: SessionDetails[]): string | undefined {
  const times = sessions
    .map((s) => s.scheduledAt)
    .filter((d): d is string => !!d)
    .map((d) => Date.parse(d))
    .filter((n) => !Number.isNaN(n));
  if (times.length === 0) return undefined;

  const min = new Date(Math.min(...times));
  const max = new Date(Math.max(...times));
  const dayMonth = (d: Date) =>
    d.toLocaleString('en-IN', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  const day = (d: Date) =>
    d.toLocaleString('en-IN', { day: '2-digit', timeZone: 'UTC' });

  const sameDay = min.toISOString().slice(0, 10) === max.toISOString().slice(0, 10);
  return sameDay ? dayMonth(min) : `${day(min)} - ${dayMonth(max)}`;
}

function mapRow(
  row: WorkshopRow,
  instructorNames: Map<string, string>,
  seatsRemaining: Map<string, number>
): Workshop {
  const batch = pickPrimaryBatch(row.workshop_batches);
  const schedule = mapSessions(batch?.batch_sessions ?? null);
  const primaryRemaining = batch ? seatsRemaining.get(batch.id) : undefined;
  const sessionDateRange = formatSessionDateRange(schedule);

  return {
    id: row.id,
    batchId: batch?.id,
    batchLabel: batch?.batch_label ?? undefined,
    title: row.title,
    slug: row.slug,
    coverImage: resolveCoverImage(row.cover_image),
    description: row.description,
    aboutText: row.about_text ?? undefined,
    difficulty: row.difficulty,
    category: row.category,
    duration: batch?.duration_label ?? '',
    sessions: batch?.num_sessions ?? schedule.length,
    price: Number(batch?.price ?? 0),
    originalPrice:
      batch?.original_price != null ? Number(batch.original_price) : undefined,
    // Prefer the real session dates; fall back to the batch's free-text label.
    date: sessionDateRange ?? batch?.date_label ?? 'TBA',
    status: batch?.status ?? 'Upcoming',
    seatLimit: batch?.seat_limit ?? 0,
    // Live remaining seats from batch_seat_status; fall back to the limit only
    // if the view had no row for this batch.
    remainingSeats: primaryRemaining ?? batch?.seat_limit ?? 0,
    registrationOpen: batch?.registration_open ?? true,
    registrationDeadline: batch?.registration_deadline ?? null,
    // Evaluated here (server) so the page renders the right CTA immediately;
    // the client re-checks on a timer to close the form live.
    registrationClosed: isRegistrationClosed({
      registrationOpen: batch?.registration_open ?? true,
      registrationDeadline: batch?.registration_deadline ?? null,
    }),
    instructor:
      (row.default_instructor_id && instructorNames.get(row.default_instructor_id)) ||
      'DTA Team',
    highlights: safeJsonParse<string[]>(row.highlights, []),
    schedule,
    faq: safeJsonParse<FAQItem[]>(row.faq, []),
    learningOutcomes: safeJsonParse<LearningOutcome[]>(row.learning_outcomes, []),
    projectPreviewUrl: row.project_preview_url ?? undefined,
    projectPreviewEnabled: row.project_preview_enabled ?? false,
  };
}

export async function getWorkshops(): Promise<Workshop[]> {
  if (isMock) return staticWorkshops;

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workshops')
      .select(WORKSHOP_SELECT)
      .eq('is_published', true);

    if (error || !data || data.length === 0) {
      if (error) console.error('getWorkshops:', error.message);
      return staticWorkshops;
    }
    const rows = data as unknown as WorkshopRow[];
    const [names, seats] = await Promise.all([
      fetchInstructorNames(rows.map((r) => r.default_instructor_id)),
      fetchSeatsRemaining(rows.map((r) => pickPrimaryBatch(r.workshop_batches)?.id ?? null)),
    ]);
    return rows.map((r) => mapRow(r, names, seats));
  } catch (e) {
    console.error('getWorkshops failed, using static data:', e);
    return staticWorkshops;
  }
}

export async function getWorkshopBySlug(
  slug: string
): Promise<Workshop | undefined> {
  if (isMock) return staticWorkshops.find((w) => w.slug === slug);

  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workshops')
      .select(WORKSHOP_SELECT)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('getWorkshopBySlug:', error.message);
      return staticWorkshops.find((w) => w.slug === slug);
    }
    const row = data as unknown as WorkshopRow;
    const [names, seats] = await Promise.all([
      fetchInstructorNames([row.default_instructor_id]),
      fetchSeatsRemaining([pickPrimaryBatch(row.workshop_batches)?.id ?? null]),
    ]);
    return mapRow(row, names, seats);
  } catch (e) {
    console.error('getWorkshopBySlug failed, using static data:', e);
    return staticWorkshops.find((w) => w.slug === slug);
  }
}
