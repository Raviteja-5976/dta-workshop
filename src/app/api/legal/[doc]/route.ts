import { readLegalDoc, type LegalDocName } from '@/lib/legal';

// Prerendered at build for each doc below — the markdown is read at build time
// and served as a static asset, so there is no runtime filesystem access.
export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ doc: 'terms' }, { doc: 'privacy' }];
}

export async function GET(_req: Request, { params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  if (doc !== 'terms' && doc !== 'privacy') {
    return new Response('Not found', { status: 404 });
  }
  const markdown = await readLegalDoc(doc as LegalDocName);
  return new Response(markdown, {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
}
