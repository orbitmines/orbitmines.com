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

export const entryOf = (id: string) =>
  REPORT_TYPED.entries.find(e => e.id === id)
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
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(sig - 1);
  return v.toPrecision(sig).replace(/\.?0+$/, "");
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
  return <span style={{ color: good ? "#6fd39b" : "#e0b45f" }}>
    {good ? "within" : `${f.verdict} by ${(100 * (f.by ?? 0)).toFixed(1)}%`}
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
      `fold ${h.fold?.mode}/${h.fold?.degree} · p ${h.expansion} · N ${h.N} · ` +
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
    <div style={{ ...MONO, whiteSpace: "pre-wrap", marginBottom: 6 }}>
      {e.findings.filter(f => f.value != null && isFinite(f.value)).map(f =>
        `${f.name.padEnd(38)}${fmt(f.value, 5)}${typeof f.err === "number" && isFinite(f.err) ? ` ± ${fmt(f.err, 2)}` : ""}` +
        `${f.verdict ? `   ${f.verdict === "within" ? "within" : `${f.verdict} by ${(100 * (f.by ?? 0)).toFixed(1)}%`}` : ""}`
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
    return judged.every(f => f.verdict === "within") ? "holds" : "outside";
  };
  const w = Math.max(...ids.map(i => i.length)) + 2;
  return <span style={MONO}>
    {"".padEnd(w) + theories.map(t => t.padEnd(20)).join("")}{"\n"}
    {ids.map(id => id.padEnd(w) + theories.map(t => cell(id, t).padEnd(20)).join("")).join("\n")}
  </span>;
};
