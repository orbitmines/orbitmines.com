// Writes ready-to-go A5 PDFs to public/lore-assets/pdf/ for every book (or one,
// if an id is passed). Files are named "{site} - {book}.pdf" (book.pdfName) so
// the production URL/download has a proper name. Wired into prebuild; also
// runnable via `npm run lore:pdf`.
//
//   node scripts/lore/gen-pdf.mjs [bookId]
import fs from 'node:fs';
import path from 'node:path';
import { buildLore, ROOT } from './lore-core.mjs';
import { generateBookPdfFile } from './lore-pdf.mjs';

const OUT_DIR = path.join(ROOT, 'public', 'lore-assets', 'pdf');
const only = process.argv[2];

const { data } = buildLore({ write: false });
const ids = (only ? [only] : Object.keys(data.books)).filter((id) => {
  if (!data.books[id]) { console.warn('lore:pdf: unknown book', id); return false; }
  return true;
});

// Start clean so renamed/removed books don't leave stale PDFs behind.
if (!only) fs.rmSync(OUT_DIR, { recursive: true, force: true });

for (const id of ids) {
  const out = path.join(OUT_DIR, `${data.books[id].pdfName}.pdf`);
  await generateBookPdfFile(id, out, data);
  console.log('lore:pdf ->', path.relative(ROOT, out));
}
