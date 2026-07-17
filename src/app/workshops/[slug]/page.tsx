import { getWorkshops } from '@/lib/data/workshops';
import { getMyRegistrations } from '@/lib/data/registrations';
import WorkshopDetailClient from './WorkshopDetailClient';

// getWorkshops / getMyRegistrations read cookies via the Supabase server client,
// so this page must render per-request (otherwise instructor + registration
// state can be served stale from the full-route cache).
export const dynamic = 'force-dynamic';

export default async function WorkshopDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [workshops, registrations] = await Promise.all([
    getWorkshops(),
    getMyRegistrations(),
  ]);
  const workshop = workshops.find((w) => w.slug === slug);
  const relatedWorkshops = workshops.filter((w) => w.slug !== slug).slice(0, 2);
  const registrationStatus = workshop?.batchId
    ? registrations[workshop.batchId]
    : undefined;

  return (
    <WorkshopDetailClient
      workshop={workshop}
      relatedWorkshops={relatedWorkshops}
      slug={slug}
      registrationStatus={registrationStatus}
    />
  );
}
