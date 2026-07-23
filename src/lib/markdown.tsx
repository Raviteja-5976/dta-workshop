import React from 'react';

/**
 * A tiny, dependency-free markdown renderer scoped to the exact syntax used by
 * our legal documents (legal/terms.md and legal/privacy.md): H1/H2 headings,
 * horizontal rules, paragraphs, ordered/unordered lists, and inline **bold**,
 * `code`, and *italic*. It is intentionally NOT a general-purpose parser — it
 * only handles what those files contain, styled to match the neo-brutalist UI.
 */

// Renders inline **bold**, `code`, and *italic* within a single line of text.
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Order matters: match the two-asterisk **bold** before the single-asterisk
  // *italic*, and inline `code` on its own.
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key} className="font-bold text-deep-navy">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="font-mono text-sm bg-bg-cream border-2 border-deep-navy rounded-md px-1.5 py-0.5 text-deep-navy break-all"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(
        <em key={key} className="italic text-deep-navy/60">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

const ORDERED = /^\d+\.\s+/;
const UNORDERED = /^[-*]\s+/;

export function renderMarkdown(md: string): React.ReactNode {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Blank line — block separator.
    if (trimmed === '') {
      i++;
      continue;
    }

    // Horizontal rule.
    if (/^-{3,}$/.test(trimmed)) {
      blocks.push(<hr key={key++} className="my-10 border-t-3 border-deep-navy/30" />);
      i++;
      continue;
    }

    // H1.
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1 key={key++} className="font-display font-black text-4xl md:text-5xl text-deep-navy leading-tight mb-4">
          {renderInline(trimmed.slice(2), `h1-${key}`)}
        </h1>
      );
      i++;
      continue;
    }

    // H2.
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2
          key={key++}
          className="font-display font-extrabold text-2xl md:text-3xl text-deep-navy mt-12 mb-4 pb-2 border-b-3 border-deep-navy"
        >
          {renderInline(trimmed.slice(3), `h2-${key}`)}
        </h2>
      );
      i++;
      continue;
    }

    // Ordered list — consume consecutive numbered lines.
    if (ORDERED.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && ORDERED.test(lines[i].trim())) {
        const content = lines[i].trim().replace(ORDERED, '');
        items.push(
          <li key={items.length} className="leading-relaxed pl-1.5">
            {renderInline(content, `ol-${key}-${items.length}`)}
          </li>
        );
        i++;
      }
      blocks.push(
        <ol
          key={key++}
          className="list-decimal list-outside pl-6 space-y-3 my-5 marker:font-bold marker:text-primary-orange text-deep-navy/80 font-medium"
        >
          {items}
        </ol>
      );
      continue;
    }

    // Unordered list — consume consecutive bullet lines ("- " or "*   ").
    if (UNORDERED.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && UNORDERED.test(lines[i].trim())) {
        const content = lines[i].trim().replace(UNORDERED, '');
        items.push(
          <li key={items.length} className="leading-relaxed pl-1.5">
            {renderInline(content, `ul-${key}-${items.length}`)}
          </li>
        );
        i++;
      }
      blocks.push(
        <ul
          key={key++}
          className="list-disc list-outside pl-6 space-y-3 my-5 marker:text-primary-orange text-deep-navy/80 font-medium"
        >
          {items}
        </ul>
      );
      continue;
    }

    // Paragraph — join consecutive plain lines until a blank/special line.
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^-{3,}$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('# ') &&
      !lines[i].trim().startsWith('## ') &&
      !ORDERED.test(lines[i].trim()) &&
      !UNORDERED.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    const paraText = paraLines.join(' ');
    blocks.push(
      <p key={key++} className="leading-relaxed text-deep-navy/80 font-medium my-5">
        {renderInline(paraText, `p-${key}`)}
      </p>
    );
  }

  return blocks;
}
