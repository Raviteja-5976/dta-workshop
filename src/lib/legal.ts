import { promises as fs } from 'fs';
import path from 'path';

export type LegalDocName = 'terms' | 'privacy';

/**
 * Reads a legal document (the single source of truth) from the repo's `legal/`
 * folder at build time. Because the legal pages are statically rendered, this
 * read runs during `next build` and the content is baked into the output.
 */
export async function readLegalDoc(name: LegalDocName): Promise<string> {
  const filePath = path.join(process.cwd(), 'legal', `${name}.md`);
  return fs.readFile(filePath, 'utf8');
}
