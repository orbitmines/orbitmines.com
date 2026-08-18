#!/usr/bin/env bash
# Run one test, or all of them.
#
#   ./run.sh                 every test, in order, stopping on the first failure
#   ./run.sh combined        just that one
#   ./run.sh --list          what there is
#
# Everything here is standalone TypeScript with no imports — each file carries
# its own constants and its own copy of whatever geometry it needs, so a test
# can be read, run and edited without touching the article.

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../../../.." && pwd)"
TS="$ROOT/node_modules/.bin/ts-node"
OPTS='{"module":"commonjs","target":"es2020"}'

[ -x "$TS" ] || { echo "ts-node not found at $TS"; exit 1; }

# rough order: the force law, the cosmology, dark matter, closure, then
# electromagnetism
ORDER=(
  three combined
  frontcheck sne
  caught arms
  rootm rootm2 feed selfcon fixedpoint speedloop drivers
  galaxy_sc perm vmass sens sign
  transport expand polarity pol2
  genzel empty spacing
  blocking redo shape quant steps joint
  recon which138 accum accumulate asym
  pulses magnets coulomb moment dipole poles ordering
  departure divp escape aggregate
  domains domainsize response align exchange feedback torque afm neel contact permute extrapolate
  screen signs scales confirm texture
  benchmark laws
  creation vacsign pernode consume vacrate mfp signed front
  budget tradeoff scale ceiling maxwell
  nopolarity
  ring holonomy bloch matter bound harmony spin spinor cover degree handle sufficient lock contain quotient emit chiral repair rules clock species field automaton layered magnetic relax faraday fork acts induce shine lorenz pulse sound vector regime hex fcc exact geometry switched vacgeom charged ampere potential wires forces repel push signlaw induction rounded
  turns ways veins cones veined lattices wave gas vacuum pure sphere
)

if [ "${1:-}" = "--list" ]; then printf '%s\n' "${ORDER[@]}"; exit 0; fi

run_one() {
  local n="$1"
  [ -f "$HERE/$n.ts" ] || { echo "  no such test: $n"; return 1; }
  echo "═══ $n ═══"
  "$TS" --compiler-options "$OPTS" "$HERE/$n.ts" || { echo "  FAILED: $n"; return 1; }
  echo
}

if [ $# -gt 0 ]; then run_one "$1"; exit $?; fi

fail=0
for n in "${ORDER[@]}"; do
  [ -f "$HERE/$n.ts" ] || continue
  run_one "$n" || fail=1
done
exit $fail
