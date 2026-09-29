import React, {useEffect, useLayoutEffect, useRef, useState, ReactNode} from 'react';
import ReactDOM from 'react-dom';

// Renders a dropdown anchored to a button element. Positioned in fixed
// coordinates beneath the anchor; closes on outside-click and on caller-
// requested close events.

type Props = {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

const Dropdown: React.FC<Props> = ({anchorRef, open, onClose, children}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{top: number; left: number} | null>(null);

  // Position when opened, and again on scroll/resize.
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const a = anchorRef.current;
      if (!a) return;
      const r = a.getBoundingClientRect();
      setPos({top: r.bottom + 2, left: r.left});
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef]);

  // Outside-click close.
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const inside =
        (ref.current && ref.current.contains(e.target as Node)) ||
        (anchorRef.current && anchorRef.current.contains(e.target as Node));
      if (!inside) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, anchorRef, onClose]);

  if (!open || !pos) return null;

  return ReactDOM.createPortal(
    <div
      ref={ref}
      className="lib-dropdown"
      style={{position: 'fixed', top: pos.top, left: pos.left, zIndex: 10000}}
    >
      {children}
    </div>,
    document.body,
  );
};

export default Dropdown;

// ---- Helpers ----

type ItemProps = {
  active?: boolean;
  header?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export const DropdownItem: React.FC<ItemProps> = ({active, header, onClick, children}) => (
  <div
    className={
      'lib-dropdown-item' +
      (active ? ' lib-dropdown-item--active' : '') +
      (header ? ' lib-dropdown-item--header' : '')
    }
    onClick={(e) => {
      if (header) return;
      e.stopPropagation();
      onClick?.();
    }}
  >
    {children}
  </div>
);
