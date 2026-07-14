import { getWorkshops } from '@/lib/data/workshops';
import WorkshopDetailClient from './WorkshopDetailClient';

export default async function WorkshopDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const workshops = await getWorkshops();
  const workshop = workshops.find((w) => w.slug === slug);
  const relatedWorkshops = workshops.filter((w) => w.slug !== slug).slice(0, 2);

  return (
    <WorkshopDetailClient
      workshop={workshop}
      relatedWorkshops={relatedWorkshops}
      slug={slug}
    />
  );
}
