import { isMock } from '@/lib/supabase/config';
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
  instructors: { name: string } | null;
  workshop_batches: BatchRow[] | null;
};

type BatchRow = {
  id: string;
  status: Workshop['status'];
  date_label: string | null;
  start_date: string | null;
  duration_label: string | null;
  num_sessions: number | null;
  price: number | null;
  original_price: number | null;
  seat_limit: number | null;
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
  instructors:default_instructor_id ( name ),
  workshop_batches (
    id, status, date_label, start_date, duration_label, num_sessions,
    price, original_price, seat_limit,
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

function mapRow(row: WorkshopRow): Workshop {
  const batch = pickPrimaryBatch(row.workshop_batches);
  const schedule = mapSessions(batch?.batch_sessions ?? null);

  return {
    id: row.id,
    batchId: batch?.id,
    title: row.title,
    slug: row.slug,
    coverImage: row.cover_image ?? undefined,
    description: row.description,
    aboutText: row.about_text ?? undefined,
    difficulty: row.difficulty,
    category: row.category,
    duration: batch?.duration_label ?? '',
    sessions: batch?.num_sessions ?? schedule.length,
    price: Number(batch?.price ?? 0),
    originalPrice:
      batch?.original_price != null ? Number(batch.original_price) : undefined,
    date: batch?.date_label ?? 'TBA',
    status: batch?.status ?? 'Upcoming',
    seatLimit: batch?.seat_limit ?? 0,
    // No registrations wired yet, so remaining == limit. The admin/registration
    // work will swap this for the batch_seat_status view.
    remainingSeats: batch?.seat_limit ?? 0,
    instructor: row.instructors?.name ?? 'DTA Team',
    highlights: safeJsonParse<string[]>(row.highlights, []),
    schedule,
    faq: safeJsonParse<FAQItem[]>(row.faq, []),
    learningOutcomes: safeJsonParse<LearningOutcome[]>(row.learning_outcomes, []),
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
    return (data as unknown as WorkshopRow[]).map(mapRow);
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
    return mapRow(data as unknown as WorkshopRow);
  } catch (e) {
    console.error('getWorkshopBySlug failed, using static data:', e);
    return staticWorkshops.find((w) => w.slug === slug);
  }
}
