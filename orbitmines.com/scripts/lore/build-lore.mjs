// Parses content/lore/**.md into src/lore/generated/lore.json. Run directly,
// or via the predev/prebuild npm hooks. The parsing lives in lore-core.mjs so
// the dev editor server can reuse it. See content/lore/SCHEMA.md.
import path from 'node:path';
import { buildLore, OUT, ROOT } from './lore-core.mjs';

const { data, warnings } = buildLore({ write: true });

console.log(
  `lore: ${Object.keys(data.books).length} books, ${Object.keys(data.chapters).length} chapters, ` +
  `${Object.keys(data.entities).length} entities, ${data.facts.length} facts -> ${path.relative(ROOT, OUT)}`,
);
if (warnings.length) {
  console.log(`lore: ${warnings.length} warning(s):`);
  for (const w of warnings) console.log('  ! ' + w);
}
