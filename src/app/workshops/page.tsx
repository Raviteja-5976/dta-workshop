import { getWorkshops } from '@/lib/data/workshops';
import WorkshopsCatalog from './WorkshopsCatalog';

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();
  return <WorkshopsCatalog workshops={workshops} />;
}
