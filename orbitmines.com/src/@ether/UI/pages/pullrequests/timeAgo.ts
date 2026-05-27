// Relative-time formatter for PR rows. The ray prototype's `formatTime`
// lives in ChatCommon — this is a focused inline copy until Chat lands.

export function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  const wk = 7 * day;

  if (diff < min) return 'just now';
  if (diff < hr) return Math.floor(diff / min) + 'm ago';
  if (diff < day) return Math.floor(diff / hr) + 'h ago';
  if (diff < wk) return Math.floor(diff / day) + 'd ago';
  return new Date(t).toLocaleDateString();
}
