import type {
  CollapseRecord,
  LayoutNode,
  SplitNode,
  TabGroupNode,
} from './types';

// Pure layout-tree algorithms. No DOM, no React. The component layer drives
// React state through these functions to keep them testable and reusable.
//
// Ported from ray's IDELayout.ts — no behavioural changes.

export function findNode(root: LayoutNode, id: string): LayoutNode | null {
  if (root.id === id) return root;
  if (root.type === 'split') {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParent(
  root: LayoutNode,
  id: string,
): {parent: SplitNode; index: number} | null {
  if (root.type === 'split') {
    for (let i = 0; i < root.children.length; i++) {
      if (root.children[i].id === id) return {parent: root, index: i};
      const found = findParent(root.children[i], id);
      if (found) return found;
    }
  }
  return null;
}

export function replaceNode(
  root: LayoutNode,
  targetId: string,
  replacement: LayoutNode,
): LayoutNode {
  if (root.id === targetId) return replacement;
  if (root.type === 'split') {
    return {
      ...root,
      children: root.children.map((c) => replaceNode(c, targetId, replacement)),
    };
  }
  return root;
}

export function removePanelFromNode(
  root: LayoutNode,
  groupId: string,
  panelId: string,
): LayoutNode {
  if (root.type === 'tabgroup' && root.id === groupId) {
    const newPanels = root.panels.filter((p) => p !== panelId);
    const newActive = Math.min(root.activeIndex, Math.max(0, newPanels.length - 1));
    return {...root, panels: newPanels, activeIndex: newActive};
  }
  if (root.type === 'split') {
    return {
      ...root,
      children: root.children.map((c) => removePanelFromNode(c, groupId, panelId)),
    };
  }
  return root;
}

export function normalizeTree(node: LayoutNode): LayoutNode | null {
  if (node.type === 'tabgroup') {
    return node.panels.length === 0 ? null : node;
  }

  const children: LayoutNode[] = [];
  const sizes: number[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const r = normalizeTree(node.children[i]);
    if (r) {
      children.push(r);
      sizes.push(node.sizes[i]);
    }
  }

  if (children.length === 0) return null;
  if (children.length === 1) return children[0];

  const sum = sizes.reduce((a, b) => a + b, 0);
  const normalized = sizes.map((s) => s / sum);

  // Flatten same-direction nested splits.
  const flatChildren: LayoutNode[] = [];
  const flatSizes: number[] = [];
  for (let i = 0; i < children.length; i++) {
    const c = children[i];
    if (c.type === 'split' && c.direction === node.direction) {
      for (let j = 0; j < c.children.length; j++) {
        flatChildren.push(c.children[j]);
        flatSizes.push(normalized[i] * c.sizes[j]);
      }
    } else {
      flatChildren.push(c);
      flatSizes.push(normalized[i]);
    }
  }

  return {...node, children: flatChildren, sizes: flatSizes};
}

export function findPanelInLayout(
  root: LayoutNode,
  panelId: string,
): {groupId: string; index: number} | null {
  if (root.type === 'tabgroup') {
    const idx = root.panels.indexOf(panelId);
    return idx !== -1 ? {groupId: root.id, index: idx} : null;
  }
  if (root.type === 'split') {
    for (const c of root.children) {
      const f = findPanelInLayout(c, panelId);
      if (f) return f;
    }
  }
  return null;
}

// ---- Responsive collapse helpers ----

export const MIN_COLLAPSE_HORIZONTAL_PX = 120;
export const MIN_COLLAPSE_VERTICAL_PX = 120;
export const RESTORE_HYSTERESIS = 60;
export const HANDLE_SIZE = 4;

function findEdgeTabGroup(
  node: LayoutNode,
  side: 'left' | 'right',
): TabGroupNode | null {
  if (node.type === 'tabgroup') return node;
  if (node.children.length === 0) return null;
  const idx = side === 'left' ? 0 : node.children.length - 1;
  return findEdgeTabGroup(node.children[idx], side);
}

export function findSmallestBelowThreshold(
  node: LayoutNode,
  availWidth: number,
  availHeight: number,
): {childNode: LayoutNode; parentSplit: SplitNode; childIndex: number} | null {
  if (node.type !== 'split') return null;

  const isHoriz = node.direction === 'horizontal';
  const dim = isHoriz ? availWidth : availHeight;
  const threshold = isHoriz ? MIN_COLLAPSE_HORIZONTAL_PX : MIN_COLLAPSE_VERTICAL_PX;
  const contentSpace = dim - (node.children.length - 1) * HANDLE_SIZE;

  for (let i = 0; i < node.children.length; i++) {
    const childDim = contentSpace * node.sizes[i];
    const cw = isHoriz ? childDim : availWidth;
    const ch = isHoriz ? availHeight : childDim;
    const deeper = findSmallestBelowThreshold(node.children[i], cw, ch);
    if (deeper) return deeper;
  }

  if (node.children.length <= 1) return null;

  let smallestIndex = -1;
  let smallestPx = Infinity;
  for (let i = 0; i < node.children.length; i++) {
    const childPx = contentSpace * node.sizes[i];
    if (
      node.children[i].type === 'tabgroup' &&
      childPx < threshold &&
      childPx <= smallestPx
    ) {
      smallestPx = childPx;
      smallestIndex = i;
    }
  }

  if (smallestIndex === -1) return null;
  return {
    childNode: node.children[smallestIndex],
    parentSplit: node,
    childIndex: smallestIndex,
  };
}

export function performSingleCollapse(
  tree: LayoutNode,
  target: {childNode: LayoutNode; parentSplit: SplitNode; childIndex: number},
  containerWidth: number,
  containerHeight: number,
): {tree: LayoutNode; record: CollapseRecord} | null {
  const {childNode, parentSplit, childIndex} = target;
  if (childNode.type !== 'tabgroup') return null;
  if (parentSplit.children.length <= 1) return null;

  let largestIndex = -1;
  let largestSize = -1;
  for (let i = 0; i < parentSplit.children.length; i++) {
    if (i === childIndex) continue;
    if (parentSplit.sizes[i] > largestSize) {
      largestSize = parentSplit.sizes[i];
      largestIndex = i;
    }
  }
  if (largestIndex === -1) return null;

  const isFromLeft = childIndex < largestIndex;
  const targetTabGroup = findEdgeTabGroup(
    parentSplit.children[largestIndex],
    isFromLeft ? 'left' : 'right',
  );
  if (!targetTabGroup) return null;

  const currentTarget = findNode(tree, targetTabGroup.id);
  if (!currentTarget || currentTarget.type !== 'tabgroup') return null;

  const newPanels = isFromLeft
    ? [...childNode.panels, ...currentTarget.panels]
    : [...currentTarget.panels, ...childNode.panels];
  const newActiveIndex = isFromLeft
    ? childNode.panels.length + currentTarget.activeIndex
    : currentTarget.activeIndex;

  let newTree = replaceNode(tree, targetTabGroup.id, {
    ...currentTarget,
    panels: newPanels,
    activeIndex: newActiveIndex,
  });

  const currentParent = findNode(newTree, parentSplit.id);
  if (!currentParent || currentParent.type !== 'split') return null;

  const newChildren = currentParent.children.filter((_, i) => i !== childIndex);
  const newSizes = currentParent.sizes.filter((_, i) => i !== childIndex);
  const sum = newSizes.reduce((a, b) => a + b, 0);
  const normalized = newSizes.map((s) => s / sum);

  newTree = replaceNode(newTree, parentSplit.id, {
    ...currentParent,
    children: newChildren,
    sizes: normalized,
  });

  const dim = parentSplit.direction === 'horizontal' ? containerWidth : containerHeight;

  return {
    tree: newTree,
    record: {
      panels: childNode.panels,
      removedGroupId: childNode.id,
      originalSize: parentSplit.sizes[childIndex],
      originalIndex: childIndex,
      parentSplitId: parentSplit.id,
      targetGroupId: targetTabGroup.id,
      insertPosition: isFromLeft ? 'before' : 'after',
      originalActiveIndex: childNode.activeIndex,
      collapsedAtDim: dim,
      direction: parentSplit.direction,
    },
  };
}

export function tryRestoreRecord(
  tree: LayoutNode,
  record: CollapseRecord,
): LayoutNode | null {
  const parentSplit = findNode(tree, record.parentSplitId);
  if (!parentSplit || parentSplit.type !== 'split') return null;

  const targetGroup = findNode(tree, record.targetGroupId);
  if (!targetGroup || targetGroup.type !== 'tabgroup') return null;

  const panelCount = Math.min(record.panels.length, targetGroup.panels.length - 1);
  if (panelCount <= 0) return null;

  let panelsToRestore: string[];
  let remaining: string[];
  if (record.insertPosition === 'before') {
    panelsToRestore = targetGroup.panels.slice(0, panelCount);
    remaining = targetGroup.panels.slice(panelCount);
  } else {
    panelsToRestore = targetGroup.panels.slice(-panelCount);
    remaining = targetGroup.panels.slice(0, -panelCount);
  }
  if (remaining.length === 0) return null;

  const activePanel = targetGroup.panels[targetGroup.activeIndex];
  let newTargetActive = panelsToRestore.includes(activePanel)
    ? 0
    : remaining.indexOf(activePanel);
  if (newTargetActive < 0) newTargetActive = 0;

  let newTree = replaceNode(tree, targetGroup.id, {
    ...targetGroup,
    panels: remaining,
    activeIndex: newTargetActive,
  });

  const restoredGroup: TabGroupNode = {
    type: 'tabgroup',
    id: record.removedGroupId,
    panels: panelsToRestore,
    activeIndex: Math.min(record.originalActiveIndex, panelsToRestore.length - 1),
  };

  const currentParent = findNode(newTree, record.parentSplitId);
  if (!currentParent || currentParent.type !== 'split') return null;

  const newChildren = [...currentParent.children];
  const newSizes = [...currentParent.sizes];
  const scaleFactor = 1 - record.originalSize;
  for (let i = 0; i < newSizes.length; i++) newSizes[i] *= scaleFactor;

  const insertIdx = Math.min(record.originalIndex, newChildren.length);
  newChildren.splice(insertIdx, 0, restoredGroup);
  newSizes.splice(insertIdx, 0, record.originalSize);

  return replaceNode(newTree, record.parentSplitId, {
    ...currentParent,
    children: newChildren,
    sizes: newSizes,
  });
}
