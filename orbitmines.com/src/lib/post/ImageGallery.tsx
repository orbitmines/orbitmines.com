import React, {useRef, useState, useCallback, useEffect, useMemo} from 'react';

export type GalleryImage = {
  src: string;
  alt?: string;
};

export type ImageGalleryProps = {
  images: GalleryImage[];
  height?: number;
  caption?: React.ReactNode;
  shuffle?: number | false;
};

const seededRandom = (seed: number) => {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };
};

export const ImageGallery = ({images, height = 450, caption, shuffle}: ImageGalleryProps) => {
  const shuffledImages = useMemo(() => {
    if (shuffle === undefined || shuffle === false) return images;
    const rand = seededRandom(shuffle);
    const arr = [...images];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [images, shuffle]);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const offsetRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [animated, setAnimated] = useState(false);
  const wheelLock = useRef(false);

  // Drag state (refs to avoid stale closures)
  const dragActive = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const dragMoved = useRef(false);
  const dragCaptured = useRef(false);

  const updateOffset = useCallback((val: number) => {
    offsetRef.current = val;
    setOffset(val);
  }, []);

  // Calculate the translateX value that centers item[index] in the container
  const centerOf = useCallback((index: number): number => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return 0;
    const item = track.children[index] as HTMLElement;
    if (!item) return 0;
    return item.offsetLeft + item.offsetWidth / 2 - container.clientWidth / 2;
  }, []);

  const goTo = useCallback((index: number) => {
    const i = Math.max(0, Math.min(index, shuffledImages.length - 1));
    indexRef.current = i;
    setCurrentIndex(i);
    setAnimated(true);
    updateOffset(centerOf(i));
  }, [shuffledImages.length, centerOf, updateOffset]);

  const snapToNearest = useCallback(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;
    const visibleCenter = offsetRef.current + container.clientWidth / 2;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const el = track.children[i] as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - visibleCenter);
      if (d < bestD) { bestD = d; best = i; }
    }
    goTo(best);
  }, [goTo]);

  // Center first image on mount + recalculate on resize
  useEffect(() => {
    const recalc = () => {
      setAnimated(false);
      updateOffset(centerOf(indexRef.current));
    };
    requestAnimationFrame(recalc);
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [centerOf, updateOffset]);

  // Wheel navigation (all screen sizes)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelLock.current) return;
      const d = e.deltaY || e.deltaX;
      if (Math.abs(d) < 5) return;
      goTo(indexRef.current + (d > 0 ? 1 : -1));
      wheelLock.current = true;
      setTimeout(() => { wheelLock.current = false; }, 350);
    };
    el.addEventListener('wheel', handler, {passive: false});
    return () => el.removeEventListener('wheel', handler);
  }, [goTo]);

  // Pointer events for drag/swipe
  const dragLastX = useRef(0);
  const dragLastTime = useRef(0);
  const dragVelocity = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragActive.current = true;
    dragMoved.current = false;
    dragCaptured.current = false;
    dragStartX.current = e.clientX;
    dragStartOffset.current = offsetRef.current;
    dragLastX.current = e.clientX;
    dragLastTime.current = Date.now();
    dragVelocity.current = 0;
    setAnimated(false);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragActive.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 5 && !dragCaptured.current) {
      containerRef.current?.setPointerCapture(e.pointerId);
      dragCaptured.current = true;
      dragMoved.current = true;
    }
    if (dragCaptured.current) {
      const now = Date.now();
      const dt = now - dragLastTime.current;
      if (dt > 0) {
        dragVelocity.current = (e.clientX - dragLastX.current) / dt;
      }
      dragLastX.current = e.clientX;
      dragLastTime.current = now;
      updateOffset(dragStartOffset.current - dx);
    }
  }, [updateOffset]);

  const onPointerUp = useCallback(() => {
    if (!dragActive.current) return;
    dragActive.current = false;
    if (dragMoved.current) {
      const v = dragVelocity.current;
      // If flick velocity is high enough, advance in that direction
      if (Math.abs(v) > 0.05) {
        goTo(indexRef.current + (v < 0 ? 1 : -1));
      } else {
        snapToNearest();
      }
    }
  }, [snapToNearest, goTo]);

  const cls = useRef(`ig-${Math.random().toString(36).slice(2, 7)}`).current;

  return (
    <div style={{width: '100%'}}>
      <style>{`
        .${cls}-img {
          display: block;
          object-fit: cover;
          aspect-ratio: 16 / 9;
          user-select: none;
        }
        @media (max-width: 767px) {
          .${cls}-item { flex: 0 0 85vw !important; }
          .${cls}-img { width: 100%; height: auto; }
        }
        @media (min-width: 768px) {
          .${cls}-img { height: ${height}px; width: auto; }
        }
        .${cls}-nav {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 48px;
          background: rgba(0,0,0,0.0);
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          opacity: 0;
          transition: opacity 0.2s ease, background 0.2s ease;
          z-index: 10;
          pointer-events: auto;
        }
        .${cls}-wrap:hover .${cls}-nav {
          opacity: 1;
        }
        .${cls}-nav:hover {
          background: rgba(0,0,0,0.4);
        }
        .${cls}-nav:disabled {
          opacity: 0 !important;
          cursor: default;
        }
      `}</style>

      {caption && (
        <div className="bp5-text-muted" style={{textAlign: 'center', fontSize: '0.7rem'}}>
          {caption}
        </div>
      )}

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{overflow: 'hidden', touchAction: 'pan-y', cursor: 'grab'}}
      >
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: 12,
            padding: '16px 0',
            transform: `translateX(${-offset}px)`,
            transition: animated ? 'transform 0.4s ease' : 'none',
          }}
        >
          {shuffledImages.map((img, i) => {
            const isActive = i === currentIndex;
            return (
              <div
                key={i}
                className={`${cls}-item`}
                style={{
                  flex: '0 0 auto',
                  borderRadius: 6,
                  overflow: 'hidden',
                  transform: `scale(${isActive ? 1 : 0.85})`,
                  opacity: isActive ? 1 : 0.5,
                  transition: 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: isActive ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
                }}
                onClick={() => { if (!dragMoved.current) goTo(i); }}
              >
                <div className={`${cls}-wrap`} style={{position: 'relative'}}>
                  <img className={`${cls}-img`} src={img.src} alt={img.alt || ''} draggable={false} />
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem',
                      pointerEvents: 'none',
                    }}>
                      {i + 1} / {shuffledImages.length}
                    </div>
                  )}
                  {isActive && currentIndex > 0 && (
                    <button
                      className={`${cls}-nav`}
                      style={{left: 0, borderRadius: '0 4px 4px 0'}}
                      onClick={(e) => { e.stopPropagation(); goTo(currentIndex - 1); }}
                      aria-label="Previous"
                    >{'\u2039'}</button>
                  )}
                  {isActive && currentIndex < shuffledImages.length - 1 && (
                    <button
                      className={`${cls}-nav`}
                      style={{right: 0, borderRadius: '4px 0 0 4px'}}
                      onClick={(e) => { e.stopPropagation(); goTo(currentIndex + 1); }}
                      aria-label="Next"
                    >{'\u203A'}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
