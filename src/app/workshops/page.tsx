import { getWorkshops } from '@/lib/data/workshops';
import WorkshopsCatalog from './WorkshopsCatalog';

// getWorkshops reads cookies via the Supabase server client, so render per-request.
export const dynamic = 'force-dynamic';

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();
  return <WorkshopsCatalog workshops={workshops} />;
}
