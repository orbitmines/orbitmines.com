// LCS-based line diff. Pure functions only — rendering lives in DiffView.tsx.

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  oldNum: number | null;
  newNum: number | null;
  text: string;
}

function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const dp = lcsTable(oldLines, newLines);

  const result: DiffLine[] = [];
  let i = oldLines.length;
  let j = newLines.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({type: 'context', oldNum: i, newNum: j, text: oldLines[i - 1]});
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({type: 'add', oldNum: null, newNum: j, text: newLines[j - 1]});
      j--;
    } else {
      result.push({type: 'remove', oldNum: i, newNum: null, text: oldLines[i - 1]});
      i--;
    }
  }

  return result.reverse();
}

/** Pair up adjacent removes/adds into side-by-side rows. */
export type SbsRow = {
  left: {num: number | null; text: string; type: 'context' | 'remove' | 'empty'};
  right: {num: number | null; text: string; type: 'context' | 'add' | 'empty'};
};

export function pairSideBySide(lines: DiffLine[]): SbsRow[] {
  const rows: SbsRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === 'context') {
      rows.push({
        left: {num: line.oldNum, text: line.text, type: 'context'},
        right: {num: line.newNum, text: line.text, type: 'context'},
      });
      i++;
    } else if (line.type === 'remove') {
      const removes: DiffLine[] = [];
      while (i < lines.length && lines[i].type === 'remove') {
        removes.push(lines[i]);
        i++;
      }
      const adds: DiffLine[] = [];
      while (i < lines.length && lines[i].type === 'add') {
        adds.push(lines[i]);
        i++;
      }
      const maxLen = Math.max(removes.length, adds.length);
      for (let k = 0; k < maxLen; k++) {
        rows.push({
          left: k < removes.length
            ? {num: removes[k].oldNum, text: removes[k].text, type: 'remove'}
            : {num: null, text: '', type: 'empty'},
          right: k < adds.length
            ? {num: adds[k].newNum, text: adds[k].text, type: 'add'}
            : {num: null, text: '', type: 'empty'},
        });
      }
    } else {
      rows.push({
        left: {num: null, text: '', type: 'empty'},
        right: {num: line.newNum, text: line.text, type: 'add'},
      });
      i++;
    }
  }
  return rows;
}
