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

# rough order: the force law, then the cosmology, then dark matter, then closure
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
