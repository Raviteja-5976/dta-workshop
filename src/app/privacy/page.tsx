import type { Metadata } from 'next';
import LegalDocument from '@/components/Layout/LegalDocument';
import { readLegalDoc } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy | Workshop.DevTrackAcademy',
  description:
    'How DevTrack Academy collects, uses, and protects your personal data under the DPDP Act 2023 when you join our live workshops.',
};

export default async function PrivacyPage() {
  const markdown = await readLegalDoc('privacy');
  return <LegalDocument markdown={markdown} />;
}
