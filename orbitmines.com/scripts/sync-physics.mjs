/**
 * MATERIALISE `@orbitmines/physics` INSIDE THIS REPOSITORY, instead of linking out to it.
 *
 * The package is a `file:` dependency during development, which npm installs as a SYMLINK
 * pointing at `../../physics/languages/.ts`. Turbopack will not follow a symlink out of its
 * filesystem root, so the root had to be widened to the folder holding both repositories -
 * and that folder is three hundred gigabytes across seventeen repositories, most of it
 * archives. Turbopack watches its whole root, so the dev server was opening file handles for
 * all of it until Node's async-hooks map hit its ceiling and the process died with
 * `RangeError: Map maximum size exceeded`.
 *
 * NEXT HAS NO WATCH IGNORE for Turbopack - `watchOptions` carries a poll interval and nothing
 * else - so the root cannot be kept and narrowed. It has to become this repository, which
 * means the package has to BE here rather than point away.
 *
 * SO THE SYMLINK IS REPLACED BY A COPY, of exactly what the package's own `files` field says
 * it ships. Nothing else changes: the import specifier, `transpilePackages` and the type
 * resolution all work on a real directory in `node_modules` the way they worked on a link,
 * and the watched tree is this repository alone.
 *
 * IT IS A COPY, SO IT GOES STALE. Run it again after editing the package - `npm run
 * sync:physics`, which `predev` and `prebuild` already do - or `npm run dev:physics` to have
 * it re-copied whenever a source file there changes.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, watch } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const from = resolve(here, "../../../physics/languages/.ts");
const to = resolve(here, "../node_modules/@orbitmines/physics");

if (!existsSync(from)) {
  console.error(`sync:physics - no package at ${from}`);
  process.exit(1);
}

/* what the package says it ships, plus the manifest that says it */
const ships = () => [
  ...JSON.parse(readFileSync(join(from, "package.json"), "utf8")).files ?? [],
  "package.json",
];

const sync = () => {
  /* a symlink is removed rather than written through, or the copy lands in the other repo */
  if (existsSync(to) || lstatSync(to, { throwIfNoEntry: false })) rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  for (const f of ships()) {
    const src = join(from, f);
    if (existsSync(src)) cpSync(src, join(to, f), { recursive: true });
  }
  console.log(`sync:physics - ${ships().length} entries -> node_modules/@orbitmines/physics`);
};

sync();

if (process.argv.includes("--watch")) {
  let queued = null;
  console.log(`sync:physics - watching ${from}`);
  watch(from, { recursive: true }, (_, file) => {
    if (file?.startsWith("node_modules") || file?.startsWith(".git")) return;
    clearTimeout(queued);
    queued = setTimeout(sync, 150);
  });
}
