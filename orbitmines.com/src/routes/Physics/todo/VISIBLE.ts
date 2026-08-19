/**
 * Runs something while an element is worth drawing, and stops it when it is
 * not.
 *
 * An article like this one is thirty-odd universes stacked up a page, of
 * which at most two are on screen. Every one of them left running is a frame
 * loop, a tick, and a canvas the size of the viewport being filled sixty
 * times a second for nobody — which is most of what the page costs, and the
 * reason it got slower the further down it went.
 *
 * A margin, so that a view is going by the time it is looked at rather than
 * starting the moment it is — and a small one, because arrangements are now
 * drawn two and three abreast. A margin is a multiplier on how many views run
 * at once: at half a screen, a block of three canvases starts running while
 * the block above it is still going, which is six heavy things at once for a
 * reader looking at two. A fifth is still ahead of the scroll at any speed a
 * page is read at.
 */
export const whileOnScreen = (el: Element, show: (visible: boolean) => void) => {
  if (typeof IntersectionObserver === "undefined") {
    // Nothing to watch with: the old behaviour, which is to run regardless.
    show(true);

    return () => { };
  }

  const watcher = new IntersectionObserver(
    entries => show(entries[entries.length - 1].isIntersecting),
    { rootMargin: "20% 0px" },
  );

  watcher.observe(el);

  return () => watcher.disconnect();
};
