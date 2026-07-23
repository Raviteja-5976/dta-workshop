import type { Metadata } from 'next';
import LegalDocument from '@/components/Layout/LegalDocument';
import { readLegalDoc } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Service | Workshop.DevTrackAcademy',
  description:
    'The Terms of Service governing seat reservations and enrollment in DevTrack Academy live, small-batch coding workshops.',
};

export default async function TermsPage() {
  const markdown = await readLegalDoc('terms');
  return <LegalDocument markdown={markdown} />;
}
