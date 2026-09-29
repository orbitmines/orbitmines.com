'use client';

import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Classes } from './Classes';

export interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
  interactionKind?: 'hover' | 'click' | 'hover-target';
  placement?: 'bottom' | 'top' | 'left' | 'right' | 'auto';
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onInteraction?: (nextOpen: boolean) => void;
  className?: string;
  popoverClassName?: string;
  disabled?: boolean;
  hoverOpenDelay?: number;
  hoverCloseDelay?: number;
  usePortal?: boolean;
}

const VIEWPORT_PADDING = 8;
const OFFSET = 8;

type Position = { top: number; left: number; placement: 'top' | 'bottom' };

const measure = (
  triggerRect: DOMRect,
  popoverEl: HTMLElement,
  preferredPlacement: PopoverProps['placement'],
): Position => {
  const popoverWidth = popoverEl.offsetWidth;
  const popoverHeight = popoverEl.offsetHeight;
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const spaceBelow = viewportHeight - triggerRect.bottom - OFFSET;
  const spaceAbove = triggerRect.top - OFFSET;

  let placement: 'top' | 'bottom';
  if (preferredPlacement === 'top') placement = spaceAbove >= popoverHeight ? 'top' : 'bottom';
  else if (preferredPlacement === 'bottom') placement = spaceBelow >= popoverHeight ? 'bottom' : 'top';
  else placement = spaceBelow >= popoverHeight || spaceBelow >= spaceAbove ? 'bottom' : 'top';

  const top =
    placement === 'bottom'
      ? triggerRect.bottom + OFFSET + window.scrollY
      : triggerRect.top - popoverHeight - OFFSET + window.scrollY;

  // Center horizontally on trigger, clamp to viewport
  let left = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2 + window.scrollX;
  const minLeft = window.scrollX + VIEWPORT_PADDING;
  const maxLeft = window.scrollX + viewportWidth - popoverWidth - VIEWPORT_PADDING;
  left = Math.max(minLeft, Math.min(left, maxLeft));

  return { top, left, placement };
};

export const Popover: React.FC<PopoverProps> = (props) => {
  const {
    content,
    children,
    interactionKind = 'click',
    placement: preferredPlacement = 'auto',
    isOpen: controlledOpen,
    defaultIsOpen = false,
    onInteraction,
    popoverClassName,
    disabled,
    hoverOpenDelay = 100,
    hoverCloseDelay = 100,
    usePortal = true,
  } = props;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultIsOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onInteraction?.(next);
    },
    [controlledOpen, onInteraction],
  );

  const triggerRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [mounted, setMounted] = useState(false);
  const [themeClass, setThemeClass] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimers = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleOpen = () => {
    if (disabled) return;
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), hoverOpenDelay);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), hoverCloseDelay);
  };

  // Compute popover position after layout, and on resize/scroll.
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    // Mirror the trigger's theme ancestor (e.g. bp5-dark) so portaled
    // popovers don't fall back to the default light theme.
    const trigger = triggerRef.current;
    if (trigger) {
      const darkAncestor = trigger.closest('.bp5-dark');
      setThemeClass(darkAncestor ? Classes.DARK : null);
    }
    const compute = () => {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (!trigger || !popover) return;
      setPosition(measure(trigger.getBoundingClientRect(), popover, preferredPlacement));
    };

    // Run twice: first to put it offscreen so we can measure size, then again with size known.
    compute();
    const raf = requestAnimationFrame(compute);

    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [open, preferredPlacement, content]);

  // Click-outside dismiss for click mode.
  useEffect(() => {
    if (!open || interactionKind !== 'click') return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open, interactionKind, setOpen]);

  useEffect(() => () => clearTimers(), []);

  const triggerChild = isValidElement(children) ? children : <span>{children}</span>;
  const childProps = (triggerChild as any).props || {};

  const handlers: React.HTMLAttributes<HTMLElement> = {};
  if (interactionKind === 'hover') {
    handlers.onMouseEnter = (e) => {
      childProps.onMouseEnter?.(e);
      scheduleOpen();
    };
    handlers.onMouseLeave = (e) => {
      childProps.onMouseLeave?.(e);
      scheduleClose();
    };
    handlers.onFocus = (e) => {
      childProps.onFocus?.(e);
      scheduleOpen();
    };
    handlers.onBlur = (e) => {
      childProps.onBlur?.(e);
      scheduleClose();
    };
  } else if (interactionKind === 'click') {
    handlers.onClick = (e) => {
      childProps.onClick?.(e);
      setOpen(!open);
    };
  }

  const setTriggerRef = (node: HTMLElement | null) => {
    triggerRef.current = node;
    const childRef: any = (triggerChild as any).ref;
    if (typeof childRef === 'function') childRef(node);
    else if (childRef && typeof childRef === 'object') childRef.current = node;
  };

  const triggerEl = cloneElement(triggerChild as React.ReactElement, {
    ...handlers,
    ref: setTriggerRef,
    className: classNames(Classes.POPOVER_TARGET, childProps.className),
  });

  const popover = open && !disabled ? (
    <div
      ref={popoverRef}
      className={classNames(themeClass, Classes.POPOVER, popoverClassName)}
      style={{
        position: 'absolute',
        zIndex: 1000,
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        // Hide until measured to avoid a flash at the wrong spot.
        visibility: position ? 'visible' : 'hidden',
      }}
      onMouseEnter={interactionKind === 'hover' ? () => clearTimers() : undefined}
      onMouseLeave={interactionKind === 'hover' ? scheduleClose : undefined}
    >
      <div className={Classes.POPOVER_CONTENT}>{content}</div>
    </div>
  ) : null;

  return (
    <>
      {triggerEl}
      {popover && (usePortal && mounted ? createPortal(popover, document.body) : popover)}
    </>
  );
};

export default Popover;
