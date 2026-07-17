import { getWorkshops } from '@/lib/data/workshops';
import { getMyRegistrations } from '@/lib/data/registrations';
import WorkshopsCatalog from './WorkshopsCatalog';

// getWorkshops reads cookies via the Supabase server client, so render per-request.
export const dynamic = 'force-dynamic';

export default async function WorkshopsPage() {
  const [workshops, registeredBatches] = await Promise.all([
    getWorkshops(),
    getMyRegistrations(),
  ]);
  return (
    <WorkshopsCatalog workshops={workshops} registeredBatches={registeredBatches} />
  );
}
