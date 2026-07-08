import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import classnames from 'classnames';
import {
  CollapseRecord,
  DragState,
  DropZone,
  DropZoneType,
  LayoutNode,
  PanelDefinition,
  SplitNode,
  TabGroupNode,
  generateId,
} from './types';
import {
  findNode,
  findParent,
  findPanelInLayout,
  findSmallestBelowThreshold,
  HANDLE_SIZE,
  normalizeTree,
  performSingleCollapse,
  removePanelFromNode,
  replaceNode,
  RESTORE_HYSTERESIS,
  tryRestoreRecord,
} from './tree';
import './IDELayout.scss';

// ---- Public types ----

export type Props = {
  panels: PanelDefinition[];
  initialLayout: LayoutNode;
  minPanelSize?: number;
  onLayoutChange?: (layout: LayoutNode) => void;
  onActiveTabChange?: (panelId: string) => void;
};

export type IDELayoutHandle = {
  getLayout: () => LayoutNode;
  openPanel: (panel: PanelDefinition) => void;
};

// ---- Internal context shared by sub-components ----

interface Ctx {
  layout: LayoutNode;
  panels: Map<string, PanelDefinition>;
  dragState: DragState | null;
  dropZone: DropZone | null;
  setActiveTab: (groupId: string, index: number) => void;
  setDragState: (s: DragState | null) => void;
  setDropZone: (z: DropZone | null) => void;
  movePanelToTabGroup: (
    panelId: string,
    sourceGroupId: string,
    targetGroupId: string,
    insertIndex?: number,
  ) => void;
  splitAndPlace: (
    panelId: string,
    sourceGroupId: string,
    targetGroupId: string,
    edge: 'left' | 'right' | 'top' | 'bottom',
  ) => void;
  closePanel: (groupId: string, panelId: string) => void;
  updateSizes: (splitId: string, sizes: number[]) => void;
  minPanelSize: number;
}

const LayoutCtx = React.createContext<Ctx | null>(null);
const useCtx = () => {
  const c = React.useContext(LayoutCtx);
  if (!c) throw new Error('IDELayout context missing');
  return c;
};

// ============================================================
// IDELayout — top-level component
// ============================================================

const IDELayout = forwardRef<IDELayoutHandle, Props>(function IDELayout(
  {panels, initialLayout, minPanelSize = 0.05, onLayoutChange, onActiveTabChange},
  ref,
) {
  const [layout, setLayout] = useState<LayoutNode>(initialLayout);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropZone, setDropZone] = useState<DropZone | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const collapseStackRef = useRef<CollapseRecord[]>([]);
  const collapseGraceRef = useRef(false);

  // Panel registry keyed by id. Memoized so panel-render functions can be
  // looked up cheaply during render without rebuilding the map.
  const panelRegistry = useMemo(() => {
    const m = new Map<string, PanelDefinition>();
    for (const p of panels) m.set(p.id, p);
    return m;
  }, [panels]);

  // Commit layout changes, then notify the parent.
  const commit = useCallback(
    (next: LayoutNode) => {
      setLayout(next);
      onLayoutChange?.(next);
    },
    [onLayoutChange],
  );

  // ---- Actions ----

  const setActiveTab = useCallback(
    (groupId: string, index: number) => {
      const node = findNode(layout, groupId);
      if (!node || node.type !== 'tabgroup') return;
      const next = replaceNode(layout, groupId, {...node, activeIndex: index});
      commit(next);
      if (onActiveTabChange && node.panels[index]) {
        onActiveTabChange(node.panels[index]);
      }
    },
    [layout, commit, onActiveTabChange],
  );

  const movePanelToTabGroup = useCallback(
    (panelId: string, sourceGroupId: string, targetGroupId: string, insertIndex?: number) => {
      if (sourceGroupId === targetGroupId) {
        const group = findNode(layout, sourceGroupId);
        if (!group || group.type !== 'tabgroup') return;
        const newPanels = group.panels.filter((p) => p !== panelId);
        const idx = insertIndex !== undefined ? Math.min(insertIndex, newPanels.length) : newPanels.length;
        newPanels.splice(idx, 0, panelId);
        commit(
          replaceNode(layout, sourceGroupId, {...group, panels: newPanels, activeIndex: idx}),
        );
      } else {
        collapseStackRef.current = [];
        let tree = removePanelFromNode(layout, sourceGroupId, panelId);
        const target = findNode(tree, targetGroupId);
        if (!target || target.type !== 'tabgroup') return;
        const newPanels = [...target.panels];
        const idx = insertIndex !== undefined ? Math.min(insertIndex, newPanels.length) : newPanels.length;
        newPanels.splice(idx, 0, panelId);
        tree = replaceNode(tree, targetGroupId, {...target, panels: newPanels, activeIndex: idx});
        commit(normalizeTree(tree) || tree);
      }
    },
    [layout, commit],
  );

  const splitAndPlace = useCallback(
    (
      panelId: string,
      sourceGroupId: string,
      targetGroupId: string,
      edge: 'left' | 'right' | 'top' | 'bottom',
    ) => {
      collapseStackRef.current = [];
      let tree = removePanelFromNode(layout, sourceGroupId, panelId);

      const newGroup: TabGroupNode = {
        type: 'tabgroup',
        id: generateId(),
        panels: [panelId],
        activeIndex: 0,
      };

      const target = findNode(tree, targetGroupId);
      if (!target) return;

      const direction: 'horizontal' | 'vertical' =
        edge === 'left' || edge === 'right' ? 'horizontal' : 'vertical';
      const newFirst = edge === 'left' || edge === 'top';

      const parentInfo = findParent(tree, targetGroupId);
      if (parentInfo && parentInfo.parent.direction === direction) {
        const {parent, index: targetIndex} = parentInfo;
        const newChildren = [...parent.children];
        const newSizes = [...parent.sizes];
        const targetSize = newSizes[targetIndex];
        const insertIdx = newFirst ? targetIndex : targetIndex + 1;
        newChildren.splice(insertIdx, 0, newGroup);
        newSizes[targetIndex] = targetSize / 2;
        newSizes.splice(insertIdx, 0, targetSize / 2);
        tree = replaceNode(tree, parent.id, {...parent, children: newChildren, sizes: newSizes});
      } else {
        const newSplit: SplitNode = {
          type: 'split',
          id: generateId(),
          direction,
          children: newFirst ? [newGroup, target] : [target, newGroup],
          sizes: [0.5, 0.5],
        };
        tree = replaceNode(tree, targetGroupId, newSplit);
      }

      commit(normalizeTree(tree) || tree);
    },
    [layout, commit],
  );

  const closePanel = useCallback(
    (groupId: string, panelId: string) => {
      collapseStackRef.current = [];
      const tree = removePanelFromNode(layout, groupId, panelId);
      commit(normalizeTree(tree) || tree);
    },
    [layout, commit],
  );

  const updateSizes = useCallback(
    (splitId: string, sizes: number[]) => {
      const node = findNode(layout, splitId);
      if (!node || node.type !== 'split') return;
      commit(replaceNode(layout, splitId, {...node, sizes}));
    },
    [layout, commit],
  );

  // ---- Imperative ref API ----

  useImperativeHandle(
    ref,
    () => ({
      getLayout: () => layout,
      openPanel: (panel: PanelDefinition) => {
        // Caller must keep the panel in `panels` prop too; here we just
        // insert the id into the widest visible tab group.
        const existing = findPanelInLayout(layout, panel.id);
        if (existing) {
          setActiveTab(existing.groupId, existing.index);
          return;
        }
        const c = containerRef.current;
        if (!c) return;
        const tabGroupEls = c.querySelectorAll<HTMLElement>('.ide-tabgroup[data-group-id]');
        let widestId = '';
        let widestWidth = 0;
        tabGroupEls.forEach((el) => {
          const gid = el.getAttribute('data-group-id');
          if (!gid) return;
          const w = el.getBoundingClientRect().width;
          if (w > widestWidth) {
            widestWidth = w;
            widestId = gid;
          }
        });
        if (!widestId) return;
        const group = findNode(layout, widestId);
        if (!group || group.type !== 'tabgroup') return;
        const newPanels = [...group.panels];
        const insertIdx = group.activeIndex;
        newPanels.splice(insertIdx, 0, panel.id);
        commit(replaceNode(layout, widestId, {...group, panels: newPanels, activeIndex: insertIdx}));
        if (onActiveTabChange) onActiveTabChange(panel.id);
      },
    }),
    [layout, commit, setActiveTab, onActiveTabChange],
  );

  // ---- Responsive collapse ----

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let prevW = 0;
    let prevH = 0;
    let rafId = 0;

    const handle = (width: number, height: number) => {
      let tree = layout;
      let changed = false;

      // Phase 1 — restore.
      let didRestore = false;
      let didChange = true;
      while (didChange && collapseStackRef.current.length > 0) {
        didChange = false;
        const record = collapseStackRef.current[collapseStackRef.current.length - 1];
        const dim = record.direction === 'horizontal' ? width : height;
        if (dim >= record.collapsedAtDim + RESTORE_HYSTERESIS) {
          const result = tryRestoreRecord(tree, record);
          if (result) {
            tree = result;
            collapseStackRef.current.pop();
            didChange = true;
            didRestore = true;
            changed = true;
          } else {
            collapseStackRef.current.pop();
            didChange = true;
          }
        }
      }

      // Phase 2 — collapse.
      const skipCollapse = didRestore || collapseGraceRef.current;
      collapseGraceRef.current = didRestore;
      if (!skipCollapse) {
        let collapsed = true;
        while (collapsed) {
          collapsed = false;
          const target = findSmallestBelowThreshold(tree, width, height);
          if (target && target.parentSplit.children.length > 1) {
            const result = performSingleCollapse(tree, target, width, height);
            if (result) {
              tree = result.tree;
              if (
                !collapseStackRef.current.some(
                  (r) => r.removedGroupId === result.record.removedGroupId,
                )
              ) {
                collapseStackRef.current.push(result.record);
              }
              collapsed = true;
              changed = true;
            }
          }
        }
      }

      if (changed) commit(tree);
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const {width, height} = entry.contentRect;
      if (Math.abs(width - prevW) < 1 && Math.abs(height - prevH) < 1) return;
      prevW = width;
      prevH = height;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => handle(width, height));
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [layout, commit]);

  // ---- Context value ----

  const ctxValue: Ctx = {
    layout,
    panels: panelRegistry,
    dragState,
    dropZone,
    setActiveTab,
    setDragState,
    setDropZone,
    movePanelToTabGroup,
    splitAndPlace,
    closePanel,
    updateSizes,
    minPanelSize,
  };

  // ---- Render ----

  const hasSplits = layout.type === 'split';

  return (
    <LayoutCtx.Provider value={ctxValue}>
      <div
        ref={containerRef}
        className={classnames('ide-layout', {'ide-layout--contained': hasSplits})}
      >
        <NodeRenderer node={layout} />
      </div>
    </LayoutCtx.Provider>
  );
});

export default IDELayout;

// ============================================================
// NodeRenderer — dispatches split vs tabgroup
// ============================================================

const NodeRenderer: React.FC<{node: LayoutNode}> = ({node}) =>
  node.type === 'split' ? <SplitView node={node} /> : <TabGroupView node={node} />;

// ============================================================
// SplitView
// ============================================================

const SplitView: React.FC<{node: SplitNode}> = ({node}) => {
  return (
    <div className={`ide-split ide-split--${node.direction}`}>
      {node.children.map((child, i) => {
        const handle = i > 0 ? <ResizeHandle key={`h-${i}`} parent={node} index={i - 1} /> : null;
        const size = node.sizes[i];
        const handleCount = node.children.length - 1;
        const childStyle: React.CSSProperties =
          node.direction === 'vertical'
            ? {
                height: `calc(${(size * 100).toFixed(4)}vh - ${(size * handleCount * HANDLE_SIZE).toFixed(2)}px)`,
                flex: '0 0 auto',
              }
            : {
                flex: `0 0 calc(${size * 100}% - ${(handleCount * HANDLE_SIZE) / node.children.length}px)`,
              };
        const childCls = classnames('ide-split__child', {
          'ide-split__child--v-constrained': node.direction === 'vertical',
        });
        return (
          <React.Fragment key={child.id}>
            {handle}
            <div className={childCls} style={childStyle}>
              <NodeRenderer node={child} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================
// ResizeHandle
// ============================================================

const ResizeHandle: React.FC<{parent: SplitNode; index: number}> = ({parent, index}) => {
  const ctx = useCtx();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setActive(true);

    const direction = parent.direction;
    const startPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const containerEl = ref.current?.parentElement;
    if (!containerEl) return;
    const containerRect = containerEl.getBoundingClientRect();
    const containerSize = direction === 'horizontal' ? containerRect.width : window.innerHeight;
    const startSizes = [...parent.sizes];

    const onMove = (m: MouseEvent) => {
      const cur = direction === 'horizontal' ? m.clientX : m.clientY;
      const deltaPx = cur - startPos;
      const numHandles = startSizes.length - 1;
      const avail = containerSize - numHandles * HANDLE_SIZE;
      const deltaFraction = deltaPx / avail;

      const newSizes = [...startSizes];
      let nl = newSizes[index] + deltaFraction;
      let nr = newSizes[index + 1] - deltaFraction;
      const min = ctx.minPanelSize;
      if (nl < min) {
        const d = min - nl;
        nl = min;
        nr -= d;
      }
      if (nr < min) {
        const d = min - nr;
        nr = min;
        nl -= d;
      }
      newSizes[index] = nl;
      newSizes[index + 1] = nr;
      ctx.updateSizes(parent.id, newSizes);
    };

    const onUp = () => {
      setActive(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div
      ref={ref}
      className={classnames(`ide-resize-handle ide-resize-handle--${parent.direction}`, {
        'ide-resize-handle--active': active,
      })}
      onMouseDown={onMouseDown}
    />
  );
};

// ============================================================
// TabGroupView
// ============================================================

const TabGroupView: React.FC<{node: TabGroupNode}> = ({node}) => {
  const ctx = useCtx();
  const tabBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePanelId = node.panels[node.activeIndex];
  const activePanel = activePanelId ? ctx.panels.get(activePanelId) : undefined;
  const isSticky = !!activePanel?.sticky;

  const onDragOver = (e: React.DragEvent) => {
    if (!ctx.dragState) return;
    if (ctx.dragState.sourceGroupId === node.id && node.panels.length === 1) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const tabBar = tabBarRef.current;
    const container = containerRef.current;
    if (!tabBar || !container) return;

    const zone = detectDropZone(container, tabBar, e.nativeEvent, ctx.dragState.panelId);
    if (zone) {
      const prev = ctx.dropZone;
      if (
        !prev ||
        prev.targetId !== node.id ||
        prev.type !== zone.type ||
        prev.insertIndex !== zone.insertIndex
      ) {
        ctx.setDropZone({targetId: node.id, type: zone.type, insertIndex: zone.insertIndex});
      }
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    const c = containerRef.current;
    if (c && !c.contains(e.relatedTarget as Node)) ctx.setDropZone(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!ctx.dragState || !ctx.dropZone || ctx.dropZone.targetId !== node.id) {
      ctx.setDropZone(null);
      return;
    }
    const {panelId, sourceGroupId} = ctx.dragState;
    if (ctx.dropZone.type === 'tab') {
      ctx.movePanelToTabGroup(panelId, sourceGroupId, node.id, ctx.dropZone.insertIndex);
    } else {
      ctx.splitAndPlace(
        panelId,
        sourceGroupId,
        node.id,
        ctx.dropZone.type as 'left' | 'right' | 'top' | 'bottom',
      );
    }
    ctx.setDropZone(null);
    ctx.setDragState(null);
  };

  const showDropOverlay = ctx.dropZone?.targetId === node.id && ctx.dropZone.type !== 'tab';

  return (
    <div
      ref={containerRef}
      className={classnames('ide-tabgroup', {'ide-tabgroup--sticky': isSticky})}
      data-group-id={node.id}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <TabBar node={node} tabBarRef={tabBarRef} />
      {node.panels.map((pid, i) => {
        const panel = ctx.panels.get(pid);
        if (!panel) return null;
        return (
          <div
            key={pid}
            className={classnames('ide-panel-content', {
              'ide-panel-content--hidden': i !== node.activeIndex,
            })}
            data-panel-id={pid}
          >
            {panel.content}
          </div>
        );
      })}
      {showDropOverlay && <DropOverlay type={ctx.dropZone!.type} />}
    </div>
  );
};

// ============================================================
// TabBar
// ============================================================

const TabBar: React.FC<{node: TabGroupNode; tabBarRef: React.RefObject<HTMLDivElement | null>}> = ({
  node,
  tabBarRef,
}) => {
  const ctx = useCtx();
  const showInsert =
    !!ctx.dropZone &&
    ctx.dropZone.targetId === node.id &&
    ctx.dropZone.type === 'tab' &&
    ctx.dropZone.insertIndex !== undefined;
  const insertAt = ctx.dropZone?.insertIndex ?? -1;

  const items: React.ReactNode[] = [];
  let nonDragIdx = 0;
  for (let i = 0; i < node.panels.length; i++) {
    const panelId = node.panels[i];
    const isDragging = ctx.dragState?.panelId === panelId;

    if (!isDragging) {
      if (showInsert && insertAt === nonDragIdx) {
        items.push(<div key={`ins-${i}`} className="ide-tab-insert-indicator" />);
      }
      nonDragIdx++;
    }

    const panel = ctx.panels.get(panelId);
    if (!panel) continue;

    items.push(
      <Tab
        key={panelId}
        groupId={node.id}
        panelId={panelId}
        index={i}
        active={i === node.activeIndex}
        dragging={!!isDragging}
        panel={panel}
      />,
    );
  }
  if (showInsert && insertAt === nonDragIdx) {
    items.push(<div key="ins-end" className="ide-tab-insert-indicator" />);
  }

  return (
    <div className="ide-tabbar" ref={tabBarRef}>
      {items}
    </div>
  );
};

const Tab: React.FC<{
  groupId: string;
  panelId: string;
  index: number;
  active: boolean;
  dragging: boolean;
  panel: PanelDefinition;
}> = ({groupId, panelId, index, active, dragging, panel}) => {
  const ctx = useCtx();
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', panelId);
    e.dataTransfer.effectAllowed = 'move';
    // setTimeout so the dragstart finishes before we flip state — otherwise
    // browsers can drop the drag image.
    setTimeout(() => ctx.setDragState({panelId, sourceGroupId: groupId}), 0);
  };
  const onDragEnd = () => {
    ctx.setDragState(null);
    ctx.setDropZone(null);
  };
  return (
    <div
      className={classnames('ide-tab', {
        'ide-tab--active': active,
        'ide-tab--dragging': dragging,
      })}
      draggable
      data-panel-id={panelId}
      data-group-id={groupId}
      onClick={() => ctx.setActiveTab(groupId, index)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {panel.icon && <span className="ide-tab__icon">{panel.icon}</span>}
      <span className="ide-tab__title">{panel.title}</span>
      {panel.closable && (
        <button
          type="button"
          className="ide-tab__close"
          onClick={(e) => {
            e.stopPropagation();
            ctx.closePanel(groupId, panelId);
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

// ============================================================
// DropOverlay
// ============================================================

const DropOverlay: React.FC<{type: DropZoneType}> = ({type}) => {
  const style: React.CSSProperties = {};
  switch (type) {
    case 'left':
      Object.assign(style, {top: 0, left: 0, width: '50%', height: '100%'});
      break;
    case 'right':
      Object.assign(style, {top: 0, right: 0, width: '50%', height: '100%'});
      break;
    case 'top':
      Object.assign(style, {top: 0, left: 0, right: 0, height: '50%'});
      break;
    case 'bottom':
      Object.assign(style, {bottom: 0, left: 0, right: 0, height: '50%'});
      break;
  }
  return <div className="ide-drop-indicator" style={style} />;
};

// ============================================================
// Drop-zone detection
// ============================================================

function computeTabInsertIndex(tabBarEl: HTMLElement, clientX: number): number {
  const tabs = tabBarEl.querySelectorAll('.ide-tab:not(.ide-tab--dragging)');
  for (let i = 0; i < tabs.length; i++) {
    const rect = tabs[i].getBoundingClientRect();
    if (clientX < rect.left + rect.width / 2) return i;
  }
  return tabs.length;
}

function detectDropZone(
  containerEl: HTMLElement,
  tabBarEl: HTMLElement,
  e: DragEvent,
  _draggedPanelId: string | null,
): {type: DropZoneType; insertIndex?: number} | null {
  const tabBarRect = tabBarEl.getBoundingClientRect();
  if (e.clientY < tabBarRect.bottom) {
    return {type: 'tab', insertIndex: computeTabInsertIndex(tabBarEl, e.clientX)};
  }

  const rect = containerEl.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const vpH = window.innerHeight;
  const visTop = Math.max(rect.top, 0);
  const visBot = Math.min(rect.bottom, vpH);
  const visH = visBot - visTop;
  const y = visH > 0 ? (e.clientY - visTop) / visH : 0.5;
  const threshold = 0.25;

  if (x < threshold) return {type: 'left'};
  if (x > 1 - threshold) return {type: 'right'};
  if (y < threshold) return {type: 'top'};
  if (y > 1 - threshold) return {type: 'bottom'};
  return {type: 'tab', insertIndex: computeTabInsertIndex(tabBarEl, e.clientX)};
}
