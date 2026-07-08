import {ReactNode} from 'react';

export interface SplitNode {
  type: 'split';
  id: string;
  direction: 'horizontal' | 'vertical';
  children: LayoutNode[];
  sizes: number[];
}

export interface TabGroupNode {
  type: 'tabgroup';
  id: string;
  panels: string[];
  activeIndex: number;
}

export type LayoutNode = SplitNode | TabGroupNode;

export interface PanelDefinition {
  id: string;
  title: string;
  icon?: ReactNode;
  closable: boolean;
  /** When the active panel in a tabgroup is sticky, the group becomes
   *  position:sticky and scrolls its content internally. */
  sticky?: boolean;
  content: ReactNode;
}

export type DropZoneType = 'tab' | 'left' | 'right' | 'top' | 'bottom';

export interface DropZone {
  targetId: string;
  type: DropZoneType;
  insertIndex?: number;
}

export interface DragState {
  panelId: string;
  sourceGroupId: string;
}

export interface CollapseRecord {
  panels: string[];
  removedGroupId: string;
  originalSize: number;
  originalIndex: number;
  parentSplitId: string;
  targetGroupId: string;
  insertPosition: 'before' | 'after';
  originalActiveIndex: number;
  collapsedAtDim: number;
  direction: 'horizontal' | 'vertical';
}

let _idCounter = 0;
export function generateId(): string {
  return `ide-${++_idCounter}`;
}
