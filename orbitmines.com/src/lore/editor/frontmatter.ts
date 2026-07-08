'use client';

// A small frontmatter reader/writer for the structured editor form. It targets
// the simple-YAML subset the lore schema uses (scalars, inline `[a, b]` lists,
// and block `- item` lists). The authoritative parse is still the server's
// gray-matter; this is only to drive form controls and rewrite the block.

export type FM = Record<string, unknown>;

export interface Split {
  fm: FM;
  raw: string;   // original frontmatter text (without delimiters)
  body: string;  // everything after the closing ---
  hasFm: boolean;
}

export function splitFrontmatter(text: string): Split {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, raw: '', body: text, hasFm: false };
  return { fm: parseYaml(m[1]), raw: m[1], body: m[2], hasFm: true };
}

function parseScalar(v: string): unknown {
  const s = v.trim();
  if (s === '') return '';
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((x) => parseScalar(x));
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s === 'true') return true;
  if (s === 'false') return false;
  return s;
}

export function parseYaml(src: string): FM {
  const out: FM = {};
  const lines = src.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) { i++; continue; }
    const key = m[1];
    const rest = m[2];
    if (rest.trim() === '') {
      // maybe a block list on following indented lines
      const items: unknown[] = [];
      let j = i + 1;
      while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
        items.push(parseScalar(lines[j].replace(/^\s*-\s+/, '')));
        j++;
      }
      out[key] = items.length || /^\s*-\s+/.test(lines[i + 1] || '') ? items : '';
      i = j;
    } else {
      out[key] = parseScalar(rest);
      i++;
    }
  }
  return out;
}

function needsQuote(s: string): boolean {
  return /[:#\[\]{}",]|^\s|\s$|^\[/.test(s) || s === '';
}
function scalarStr(v: unknown): string {
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v ?? '');
  return needsQuote(s) ? JSON.stringify(s) : s;
}

export function stringifyYaml(fm: FM): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(fm)) {
    if (Array.isArray(value)) {
      if (value.length === 0) { lines.push(`${key}: []`); continue; }
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${scalarStr(item)}`);
    } else {
      lines.push(`${key}: ${scalarStr(value)}`);
    }
  }
  return lines.join('\n');
}

// Rebuild a document from an edited frontmatter object + unchanged body.
export function withFrontmatter(fm: FM, body: string): string {
  const fmText = stringifyYaml(fm);
  const trimmedBody = body.replace(/^\r?\n/, '');
  return `---\n${fmText}\n---\n${trimmedBody ? '\n' + trimmedBody : ''}`;
}
