/**
 * WHERE THE ARTICLE GETS ITS NUMBERS — from the run, and only from the run.
 *
 * Every figure in the prose used to be typed in by hand from a terminal, which
 * means a number and the code that produced it could drift apart silently. They
 * did: four files ran a vacuum a fifth of the derived density with a turn that did
 * nothing, and the article quoted their output for months.
 *
 * So the article does not contain numbers. It contains REFERENCES to findings, and
 * this resolves them against `REPORT.json` — which `RUN.ts` writes. A reference to a
 * finding that no longer exists renders as a visible complaint rather than as
 * stale text, so a measurement that has been removed or renamed cannot go on being
 * quoted.
 *
 *   <M of="electrostatics/coulomb · gravity+magnetism" is="falloff exponent" />
 *   <Recorded of="magnetostatics/neutral-wire · labelled" />
 *   <Ran of="gravity/inverse-square · gravity" />
 *
 * `Ran` prints the configuration a number was measured under — geometry, theory,
 * turn, vacuum occupancy, box, seeds — which the geometry sections say every result
 * in this book owes and none of them carried.
 */

import REPORT from "../REPORT.json";

type Finding = {
  /** `value` is null wherever the run recorded a NaN, since JSON cannot carry one */
  name: string; value: number | null; err?: number; units?: string;
  verdict?: string; by?: number; note?: string;
  expect?: { of: string; want: number; tolerance: number; because: string };
};
type Entry = {
  id: string; what: string;
  header: Record<string, unknown>;
  findings: Finding[];
  table?: { columns: string[]; rows: (string | number)[][] };
};

const REPORT_TYPED = REPORT as unknown as { title: string; generated: string; entries: Entry[] };

/**
 * An entry that records only that the claim COULD NOT BE ASKED under some theory — the
 * suite writes one per declared-unaskable theory, carrying a single "not applicable"
 * finding and no measurement.
 */
const notApplicable = (e: { findings: { value: unknown }[] }) =>
  e.findings.length > 0 && e.findings.every(f => f.value === null);

/**
 * A citation resolves EXACTLY first, then by prefix — and the prefix fallback SKIPS the
 * not-applicable stubs before it will settle for one.
 *
 * Without that skip a bare `of="magnetism/no-free-angle"` lands on `· gravity`, which
 * exists only to record that gravity's rays are neutral so nothing ever turns. It carries
 * no findings, so every `<M is="…">` under it renders as missing and the live
 * `· gravity+magnetism` entry is never consulted — the article silently losing a whole
 * result to an entry whose entire content is "not this one".
 *
 * The stubs stay findable, since a section that wants to say a theory cannot be asked
 * should be able to cite that, so they are ordered LAST rather than filtered out.
 */
export const entryOf = (id: string) =>
  REPORT_TYPED.entries.find(e => e.id === id)
  ?? REPORT_TYPED.entries.find(e => e.id.startsWith(id) && !notApplicable(e))
  ?? REPORT_TYPED.entries.find(e => e.id.startsWith(id));

export const findingOf = (id: string, name: string) => {
  const e = entryOf(id);
  return e?.findings.find(f => f.name === name);
};

const Missing = ({ what }: { what: string }) => <span style={{
  background: "#5c1f1f", color: "#ffd7d7", padding: "0 0.35em", borderRadius: 3,
  fontFamily: "ui-monospace, monospace", fontSize: "0.85em",
}}>NOT IN THE REPORT: {what}</span>;

/**
 * How a number is written when it came from a measurement rather than from a person.
 *
 * IT HAS TO SURVIVE NULL, because JSON has no NaN: a finding that carries a marker
 * rather than a value — a note, a "QUICK RUN" stamp — is written as `NaN` and comes
 * back as `null`, and `null.toPrecision` is what the article threw on. Anything that
 * is not a finite number is a dash.
 */
const fmt = (v: number | null | undefined, sig = 4) => {
  if (v == null || typeof v !== "number" || !isFinite(v)) return "—";
  /*
   * AND THE DIGIT COUNT IS CLAMPED, because `toPrecision` throws outside 1…100 and
   * `toExponential` outside 0…100 — so a `digits={0}` in the article, meaning "as few as
   * possible", took the whole page down rather than rendering one figure. A formatter is
   * the wrong place to be strict: the article asks for a number and should get one.
   */
  const d = Math.min(21, Math.max(1, Math.round(sig) || 1));
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(d - 1);
  /*
   * TRAILING ZEROS ARE ONLY TRAILING AFTER A DECIMAL POINT, and the version that did not
   * say so ate digits it had no business touching. `/\.?0+$/` matched the whole of "1000"
   * after the leading 1 — so a round thousand rendered as "1" — and matched the whole of
   * "0", so an exact nought rendered as nothing at all. Both were silent: the article
   * showed a plausible wrong number in one case and an empty span in the other, and the
   * empty span is what a page full of exact-zero claims made visible.
   */
  return v.toPrecision(d).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
};

/**
 * One measured number, with its error where it has one.
 *
 * `plain` drops the error for running text; the default carries it, because a
 * number without one is not a measurement.
 */
export const M = ({ of, is, plain, digits = 4 }: {
  of: string; is: string; plain?: boolean; digits?: number;
}) => {
  const f = findingOf(of, is);
  if (!f) return <Missing what={`${of} → ${is}`} />;
  return <span title={f.expect ? `expected ${f.expect.want} — ${f.expect.because}` : f.note}>
    {fmt(f.value, digits)}
    {!plain && typeof f.err === "number" && isFinite(f.err) && f.err > 0 ? ` ± ${fmt(f.err, 2)}` : ""}
    {f.units ? ` ${f.units}` : ""}
  </span>;
};

/** what a measurement did against what was expected of it, in the report's own words */
export const Verdict = ({ of, is }: { of: string; is: string }) => {
  const f = findingOf(of, is);
  if (!f) return <Missing what={`${of} → ${is}`} />;
  if (!f.verdict) return <span style={{ opacity: 0.7 }}>reported without an expectation</span>;
  const good = f.verdict === "within";
  /*
   * UNRESOLVED IS NOT A MISS AND IT IS CERTAINLY NOT A PASS. A quantity the run could
   * not resolve — an exponent fitted over no points that cleared 2σ — used to reach
   * here as "below by 0.0%", which reads as a near miss of a small target.
   */
  const unresolved = f.verdict === "unresolved";
  return <span style={{ color: unresolved ? "#9aa4b2" : good ? "#6fd39b" : "#e0b45f" }}>
    {unresolved ? "DID NOT RESOLVE"
      : good ? "within" : `${f.verdict} by ${(100 * (f.by ?? 0)).toFixed(1)}%`}
    {f.expect ? <span style={{ opacity: 0.75 }}>{` of ${fmt(f.expect.want)} — ${f.expect.of}`}</span> : null}
  </span>;
};

/** a header number, which is also null wherever the run had nothing to report */
const num = (v: unknown, dp = 3) =>
  typeof v === "number" && isFinite(v) ? v.toFixed(dp) : "—";

const MONO: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: "0.82em",
  whiteSpace: "pre", display: "block", lineHeight: 1.55,
};

/** a table exactly as the run recorded it — no transcription step to get wrong */
export const Recorded = ({ of, columns }: { of: string; columns?: string[] }) => {
  const e = entryOf(of);
  if (!e?.table) return <Missing what={`${of} → table`} />;
  const keep = columns
    ? e.table.columns.map((c, i) => [c, i] as const).filter(([c]) => columns.includes(c))
    : e.table.columns.map((c, i) => [c, i] as const);
  const w = keep.map(([c, i]) =>
    Math.max(c.length, ...e.table!.rows.map(r => String(r[i]).length)) + 2);
  const line = (cells: (string | number)[]) =>
    cells.map((x, j) => String(x).padEnd(w[j])).join("");
  return <span style={MONO}>
    {line(keep.map(([c]) => c))}{"\n"}
    {"─".repeat(w.reduce((a, b) => a + b, 0))}{"\n"}
    {e.table.rows.map(r => line(keep.map(([, i]) => r[i]))).join("\n")}
  </span>;
};

/**
 * THE LABEL EVERY RESULT IN THIS BOOK OWES. The geometry sections say it in as many
 * words — several results differ between geometries, so each one should carry the
 * one it was computed on — and until the report existed none of them did.
 */
export const Ran = ({ of }: { of: string }) => {
  const e = entryOf(of);
  if (!e) return <Missing what={of} />;
  const h = e.header as Record<string, any>;
  const quick = e.findings.some(f => f.name === "QUICK RUN");
  return <span style={{ ...MONO, opacity: 0.75, fontSize: "0.76em", whiteSpace: "pre-wrap" }}>
    {`${h.geometry} · DEG ${h.DEG} · SHEET ${h.SHEET} · CYCLE ${h.CYCLE} · ` +
      `${h.veined ? "veined" : "round"} · ${h.theory} · ${h.backend} · ${h.boundary} · ` +
      `fold ${h.fold?.mode}/${h.fold?.degree} · N ${h.N} · ` +
      `${h.ticks} ticks · fill ${num(h.fill)} · ` +
      `scattering ${num(h.scattering)} · ${h.seeds?.length ?? 0} seeds`}
    {quick ? "\n⚠ QUICK RUN — not a quotable number; re-run the suite at full budget" : ""}
  </span>;
};

/** everything the report holds for one claim, for a section that is about that claim */
export const Claim = ({ of }: { of: string }) => {
  const e = entryOf(of);
  if (!e) return <Missing what={of} />;
  return <div style={{ margin: "0.8rem 0" }}>
    {/*
      * EVERY JUDGED FINDING, INCLUDING THE ONES THAT DID NOT RESOLVE.
      *
      * This used to keep only findings with a finite value, which sounds like tidying
      * and is not: a quantity the run could not measure is exactly the one a reader
      * needs told about, and three of them — among them the force exponent under both
      * gravity theories, which is the whole of `gravity/inverse-square` — were failing
      * their expectation and being dropped from the page for it. A marker line with no
      * value (a note, a tier stamp) still has nothing to show and is still skipped.
      */}
    <div style={{ ...MONO, whiteSpace: "pre-wrap", marginBottom: 6 }}>
      {e.findings.filter(f => (f.value != null && isFinite(f.value)) || f.verdict).map(f =>
        `${f.name.padEnd(38)}${fmt(f.value, 5)}${typeof f.err === "number" && isFinite(f.err) ? ` ± ${fmt(f.err, 2)}` : ""}` +
        `${f.verdict ? `   ${f.verdict === "within" ? "within"
          : f.verdict === "unresolved" ? "DID NOT RESOLVE"
          : `${f.verdict} by ${(100 * (f.by ?? 0)).toFixed(1)}%`}` : ""}`
      ).join("\n")}
    </div>
    {e.table ? <Recorded of={of} /> : null}
    <Ran of={of} />
  </div>;
};

/** what the whole suite found, which is the one place to see the shape of it */
export const Matrix = () => {
  const ids = [...new Set(REPORT_TYPED.entries.map(e => e.id.split(" · ")[0]))];
  const theories = [...new Set(REPORT_TYPED.entries.map(e => e.id.split(" · ")[1]).filter(Boolean))];
  const cell = (id: string, th: string) => {
    const e = entryOf(`${id} · ${th}`);
    if (!e) return "—";
    if (e.findings.some(f => f.name === "not applicable")) return "n/a";
    const judged = e.findings.filter(f => f.verdict);
    if (!judged.length) return "—";
    if (judged.every(f => f.verdict === "within")) return "holds";
    return judged.some(f => f.verdict && f.verdict !== "within" && f.verdict !== "unresolved")
      ? "outside" : "unresolved";
  };
  const w = Math.max(...ids.map(i => i.length)) + 2;
  return <span style={MONO}>
    {"".padEnd(w) + theories.map(t => t.padEnd(20)).join("")}{"\n"}
    {ids.map(id => id.padEnd(w) + theories.map(t => cell(id, t).padEnd(20)).join("")).join("\n")}
  </span>;
};
