import React, {useCallback, useEffect, useMemo, useReducer, useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Torus} from '@react-three/drei';
import {ACESFilmicToneMapping, SRGBColorSpace} from 'three';
import {Vertex, Continuation, Line, torus, add, line} from './archive/2023.OnOrbits';
import WEBGL from 'three/examples/jsm/capabilities/WebGL';

const HAS_WEBGL = WEBGL.isWebGLAvailable();

// ─── Constants ──────────────────────────────────────────────────────────────

const SCALE = 1.5;
const SPACING_X = 40;
const BRANCH_SPACING = 50;
const CONT_OFFSET = 20;
const VERT_AMP = 3; // Amplify vertical component for torus clip points

// ─── Types ──────────────────────────────────────────────────────────────────

type NodeId = string;
type ContId = string;
type EdgeId = string;
type Vec3 = [number, number, number];

interface GraphNode {
  id: NodeId;
  col: number;
  color: string;
  initialCont: ContId;
  terminalCont: ContId;
}

interface Cont {
  id: ContId;
  nodeId: NodeId;
  side: 'initial' | 'terminal';
  connectedEdges: EdgeId[];
}

interface Edge {
  id: EdgeId;
  from: ContId;
  to: ContId;
  color: string;
}

interface Cursor {
  target: NodeId;
  isPrimary: boolean;
}

type Interaction =
  | { mode: 'normal' }
  | { mode: 'selecting'; start: Vec3; current: Vec3 }
  | { mode: 'dragging'; startPos: Vec3; nodeStartPositions: Record<NodeId, Vec3> }
  | { mode: 'cont_dragging'; contKey: string; startPos: Vec3; startContPos: Vec3 };

interface GraphState {
  nodes: Record<NodeId, GraphNode>;
  continuations: Record<ContId, Cont>;
  edges: Record<EdgeId, Edge>;
  cursors: Cursor[];
  selected: Set<string>;
  interaction: Interaction;
  positionOverrides: Record<NodeId, Vec3>;
  contPositionOverrides: Record<string, Vec3>;
  nextId: number;
}

// ─── Layout ─────────────────────────────────────────────────────────────────

// Only follows forward edges (target col > source col) for tree layout
const getChildNodeIds = (nodeId: NodeId, state: GraphState): NodeId[] => {
  const node = state.nodes[nodeId];
  if (!node) return [];
  const termCont = state.continuations[node.terminalCont];
  if (!termCont) return [];
  return termCont.connectedEdges
    .map(edgeId => {
      const edge = state.edges[edgeId];
      if (!edge) return null;
      const targetContId = edge.from === node.terminalCont ? edge.to : edge.from;
      const targetCont = state.continuations[targetContId];
      if (!targetCont) return null;
      const targetNode = state.nodes[targetCont.nodeId];
      if (!targetNode || targetNode.col <= node.col) return null;
      return targetCont.nodeId;
    })
    .filter((id): id is NodeId => id !== null && id !== nodeId);
};

const getParentNodeId = (nodeId: NodeId, state: GraphState): NodeId | null => {
  const node = state.nodes[nodeId];
  if (!node) return null;
  const initCont = state.continuations[node.initialCont];
  if (!initCont || initCont.connectedEdges.length === 0) return null;
  for (const edgeId of initCont.connectedEdges) {
    const edge = state.edges[edgeId];
    if (!edge) continue;
    const parentContId = edge.from === node.initialCont ? edge.to : edge.from;
    const parentCont = state.continuations[parentContId];
    if (!parentCont) continue;
    const parentNode = state.nodes[parentCont.nodeId];
    if (parentNode && parentNode.col < node.col) return parentCont.nodeId;
  }
  return null;
};

const getDescendants = (nodeId: NodeId, state: GraphState): Set<NodeId> => {
  const result = new Set<NodeId>();
  const queue: NodeId[] = getChildNodeIds(nodeId, state);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (result.has(current)) continue;
    result.add(current);
    queue.push(...getChildNodeIds(current, state));
  }
  return result;
};

interface SubtreeLayout {
  positions: Record<NodeId, number>;
  height: number;
}

const layoutSubtree = (nodeId: NodeId, state: GraphState, visited: Set<NodeId>): SubtreeLayout => {
  if (visited.has(nodeId)) return {positions: {}, height: 0};
  visited.add(nodeId);

  const children = getChildNodeIds(nodeId, state).filter(c => !visited.has(c));

  if (children.length === 0) {
    return {positions: {[nodeId]: 0}, height: 1};
  }

  const childLayouts = children.map(c => ({
    id: c,
    layout: layoutSubtree(c, state, new Set(visited))
  }));

  const totalHeight = childLayouts.reduce((sum, cl) => sum + cl.layout.height, 0);
  const positions: Record<NodeId, number> = {};

  let currentOffset = -totalHeight / 2;
  for (const {layout: childLayout} of childLayouts) {
    const childCenter = currentOffset + childLayout.height / 2;
    for (const [id, relY] of Object.entries(childLayout.positions)) {
      positions[id] = childCenter + relY;
    }
    currentOffset += childLayout.height;
  }

  const childYs = children.map(c => positions[c] ?? 0);
  const centerY = (Math.min(...childYs) + Math.max(...childYs)) / 2;
  for (const id of Object.keys(positions)) {
    positions[id] -= centerY;
  }

  positions[nodeId] = 0;
  return {positions, height: Math.max(totalHeight, 1)};
};

const computeLayout = (state: GraphState): Record<NodeId, Vec3> => {
  const roots = Object.values(state.nodes).filter(n => {
    const initCont = state.continuations[n.initialCont];
    return !initCont || initCont.connectedEdges.length === 0;
  });

  const result: Record<NodeId, Vec3> = {};
  let rootOffset = 0;

  for (const root of roots) {
    const {positions, height} = layoutSubtree(root.id, state, new Set());
    for (const [id, relY] of Object.entries(positions)) {
      const node = state.nodes[id];
      if (node) {
        result[id] = [node.col * SPACING_X, -(relY + rootOffset) * BRANCH_SPACING, 0];
      }
    }
    rootOffset += height + 0.5;
  }

  for (const node of Object.values(state.nodes)) {
    if (!result[node.id]) {
      result[node.id] = [node.col * SPACING_X, -rootOffset * BRANCH_SPACING, 0];
      rootOffset++;
    }
  }

  // Apply position overrides from dragging
  for (const [id, pos] of Object.entries(state.positionOverrides)) {
    result[id] = pos;
  }

  return result;
};

// ─── Initial state ──────────────────────────────────────────────────────────

const createInitialState = (): GraphState => {
  const nodeId = 'n0';
  const initContId = 'c0';
  const termContId = 'c1';
  return {
    nodes: {
      [nodeId]: {id: nodeId, col: 0, color: 'orange', initialCont: initContId, terminalCont: termContId}
    },
    continuations: {
      [initContId]: {id: initContId, nodeId, side: 'initial', connectedEdges: []},
      [termContId]: {id: termContId, nodeId, side: 'terminal', connectedEdges: []}
    },
    edges: {},
    cursors: [{target: nodeId, isPrimary: true}],
    selected: new Set(),
    interaction: {mode: 'normal'},
    positionOverrides: {},
    contPositionOverrides: {},
    nextId: 2,
  };
};

// ─── Reducer ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_VERTEX_RIGHT' }
  | { type: 'ADD_VERTEX_BRANCH' }
  | { type: 'MOVE_CURSOR'; direction: 'left' | 'right' | 'up' | 'down' }
  | { type: 'SET_CURSOR_AT'; nodeId: NodeId }
  | { type: 'ADD_CURSOR_AT'; nodeId: NodeId }
  | { type: 'START_SELECTION'; pos: Vec3 }
  | { type: 'UPDATE_SELECTION'; pos: Vec3 }
  | { type: 'FINISH_SELECTION' }
  | { type: 'START_DRAG'; pos: Vec3; clickedNodeId?: NodeId }
  | { type: 'UPDATE_DRAG'; pos: Vec3 }
  | { type: 'FINISH_DRAG' }
  | { type: 'START_CONT_DRAG'; contKey: string; contPos: Vec3; pos: Vec3 }
  | { type: 'UPDATE_CONT_DRAG'; pos: Vec3 }
  | { type: 'FINISH_CONT_DRAG' };

// Deduplicate cursors that ended up at the same node
const dedupCursors = (cursors: Cursor[]): Cursor[] => {
  const seen = new Set<NodeId>();
  const result = cursors.filter(c => {
    if (seen.has(c.target)) return false;
    seen.add(c.target);
    return true;
  });
  if (result.length > 0 && !result.some(c => c.isPrimary)) {
    result[0] = {...result[0], isPrimary: true};
  }
  return result;
};

const reducer = (state: GraphState, action: Action): GraphState => {
  switch (action.type) {
    case 'ADD_VERTEX_RIGHT': {
      // Process ALL cursors (right-to-left so col shifts don't interfere)
      const uniqueTargets = [...new Set(state.cursors.map(c => c.target))];
      const sorted = uniqueTargets
        .map(t => ({target: t, col: state.nodes[t]?.col ?? 0}))
        .sort((a, b) => b.col - a.col);

      let currentState = state;
      let nextId = state.nextId;
      const newCursorTargets: NodeId[] = [];

      for (const {target} of sorted) {
        const currentNode = currentState.nodes[target];
        if (!currentNode) continue;

        const nodeId = `n${nextId++}`;
        const initContId = `c${nextId++}`;
        const termContId = `c${nextId++}`;
        const edgeId = `e${nextId++}`;
        const termCont = currentState.continuations[currentNode.terminalCont];
        const children = getChildNodeIds(currentNode.id, currentState);

        const newNodes = {...currentState.nodes};
        const newConts = {...currentState.continuations};
        const newEdges = {...currentState.edges};

        // Only shift descendants of the current node, not all nodes with higher col
        const descendants = getDescendants(currentNode.id, currentState);
        for (const descId of descendants) {
          const n = newNodes[descId] ?? currentState.nodes[descId];
          if (n) {
            newNodes[n.id] = {...n, col: n.col + 1};
          }
        }

        newNodes[nodeId] = {
          id: nodeId, col: currentNode.col + 1, color: 'orange',
          initialCont: initContId, terminalCont: termContId
        };

        if (children.length > 0) {
          const forwardEdgeIds = termCont.connectedEdges.filter(eid => {
            const e = currentState.edges[eid];
            if (!e) return false;
            const targetContId = e.from === currentNode.terminalCont ? e.to : e.from;
            const targetCont = currentState.continuations[targetContId];
            if (!targetCont) return false;
            const targetNode = currentState.nodes[targetCont.nodeId];
            return targetNode && targetNode.col > currentNode.col;
          });

          newConts[currentNode.terminalCont] = {
            ...termCont,
            connectedEdges: termCont.connectedEdges.filter(eid => !forwardEdgeIds.includes(eid)).concat(edgeId)
          };

          const termEdgeIds: EdgeId[] = [];
          for (const feid of forwardEdgeIds) {
            const oldEdge = currentState.edges[feid];
            if (!oldEdge) continue;
            const childContId = oldEdge.from === currentNode.terminalCont ? oldEdge.to : oldEdge.from;
            const newEdgeId = `e${nextId++}`;
            newEdges[newEdgeId] = {id: newEdgeId, from: termContId, to: childContId, color: 'orange'};
            termEdgeIds.push(newEdgeId);
            const childCont = newConts[childContId] || currentState.continuations[childContId];
            newConts[childContId] = {
              ...childCont,
              connectedEdges: childCont.connectedEdges.filter(eid => eid !== feid).concat(newEdgeId)
            };
            delete newEdges[feid];
          }

          newConts[initContId] = {id: initContId, nodeId, side: 'initial', connectedEdges: [edgeId]};
          newConts[termContId] = {id: termContId, nodeId, side: 'terminal', connectedEdges: termEdgeIds};
        } else {
          newConts[currentNode.terminalCont] = {...termCont, connectedEdges: [...termCont.connectedEdges, edgeId]};
          newConts[initContId] = {id: initContId, nodeId, side: 'initial', connectedEdges: [edgeId]};
          newConts[termContId] = {id: termContId, nodeId, side: 'terminal', connectedEdges: []};
        }

        newEdges[edgeId] = {id: edgeId, from: currentNode.terminalCont, to: initContId, color: 'orange'};

        currentState = {...currentState, nodes: newNodes, continuations: newConts, edges: newEdges};
        newCursorTargets.push(nodeId);
      }

      return {
        ...currentState,
        cursors: newCursorTargets.map((t, i) => ({target: t, isPrimary: i === 0})),
        selected: new Set(),
        interaction: {mode: 'normal'},
        nextId,
      };
    }

    case 'ADD_VERTEX_BRANCH': {
      // Process ALL cursors
      let currentState = state;
      let nextId = state.nextId;
      const newCursorTargets: NodeId[] = [];

      for (const cursor of state.cursors) {
        const currentNode = currentState.nodes[cursor.target];
        if (!currentNode) continue;

        const parentId = getParentNodeId(currentNode.id, currentState);
        const branchFromNode = parentId ? currentState.nodes[parentId] : currentNode;
        if (!branchFromNode) continue;

        const nodeId = `n${nextId++}`;
        const initContId = `c${nextId++}`;
        const termContId = `c${nextId++}`;
        const edgeId = `e${nextId++}`;
        const termCont = currentState.continuations[branchFromNode.terminalCont];

        currentState = {
          ...currentState,
          nodes: {
            ...currentState.nodes,
            [nodeId]: {id: nodeId, col: branchFromNode.col + 1, color: 'orange', initialCont: initContId, terminalCont: termContId}
          },
          continuations: {
            ...currentState.continuations,
            [branchFromNode.terminalCont]: {...termCont, connectedEdges: [...termCont.connectedEdges, edgeId]},
            [initContId]: {id: initContId, nodeId, side: 'initial', connectedEdges: [edgeId]},
            [termContId]: {id: termContId, nodeId, side: 'terminal', connectedEdges: []}
          },
          edges: {
            ...currentState.edges,
            [edgeId]: {id: edgeId, from: branchFromNode.terminalCont, to: initContId, color: 'orange'}
          },
        };
        newCursorTargets.push(nodeId);
      }

      return {
        ...currentState,
        cursors: newCursorTargets.map((t, i) => ({target: t, isPrimary: i === 0})),
        selected: new Set(),
        interaction: {mode: 'normal'},
        nextId,
      };
    }

    case 'MOVE_CURSOR': {
      // Move ALL cursors, then deduplicate (merge at same node / boundaries)
      let newCursors: Cursor[] = [];

      for (const cursor of state.cursors) {
        const node = state.nodes[cursor.target];
        if (!node) { newCursors.push(cursor); continue; }

        if (action.direction === 'right') {
          const children = getChildNodeIds(cursor.target, state);
          if (children.length === 0) {
            newCursors.push(cursor); // Stay at boundary
          } else {
            for (const child of children) {
              newCursors.push({target: child, isPrimary: false});
            }
          }
        } else if (action.direction === 'left') {
          const parentId = getParentNodeId(cursor.target, state);
          if (parentId) {
            newCursors.push({target: parentId, isPrimary: false});
          } else {
            newCursors.push(cursor); // Stay at boundary
          }
        } else {
          const parentId = getParentNodeId(cursor.target, state);
          if (parentId) {
            const siblings = getChildNodeIds(parentId, state);
            const idx = siblings.indexOf(cursor.target);
            if (idx >= 0) {
              const newIdx = action.direction === 'up'
                ? Math.max(0, idx - 1)
                : Math.min(siblings.length - 1, idx + 1);
              newCursors.push({target: siblings[newIdx], isPrimary: false});
            } else {
              newCursors.push(cursor);
            }
          } else {
            newCursors.push(cursor);
          }
        }
      }

      newCursors = dedupCursors(newCursors);
      if (newCursors.length === 0) return state;
      return {...state, cursors: newCursors, selected: new Set()};
    }

    case 'SET_CURSOR_AT':
      return {...state, cursors: [{target: action.nodeId, isPrimary: true}], selected: new Set()};

    case 'ADD_CURSOR_AT':
      if (state.cursors.some(c => c.target === action.nodeId)) return state;
      return {...state, cursors: [...state.cursors, {target: action.nodeId, isPrimary: false}]};

    case 'START_SELECTION':
      return {...state, interaction: {mode: 'selecting', start: action.pos, current: action.pos}, selected: new Set()};

    case 'UPDATE_SELECTION': {
      if (state.interaction.mode !== 'selecting') return state;
      const {start} = state.interaction;
      const current = action.pos;
      const layout = computeLayout(state);

      const minX = Math.min(start[0], current[0]);
      const maxX = Math.max(start[0], current[0]);
      const minY = Math.min(start[1], current[1]);
      const maxY = Math.max(start[1], current[1]);

      const selected = new Set<string>();
      for (const n of Object.values(state.nodes)) {
        const pos = layout[n.id];
        if (pos && pos[0] >= minX && pos[0] <= maxX && pos[1] >= minY && pos[1] <= maxY) {
          selected.add(n.id);
        }
      }

      return {...state, interaction: {...state.interaction, current}, selected};
    }

    case 'FINISH_SELECTION': {
      const selectedNodes = [...state.selected];
      const cursors = selectedNodes.map((id, i) => ({target: id, isPrimary: i === 0}));
      return {
        ...state,
        interaction: {mode: 'normal'},
        cursors: cursors.length > 0 ? cursors : state.cursors,
      };
    }

    case 'START_DRAG': {
      const layout = computeLayout(state);
      let nodesToDrag: NodeId[];
      let newState = state;

      if (action.clickedNodeId) {
        const isTargeted = state.selected.has(action.clickedNodeId) || state.cursors.some(c => c.target === action.clickedNodeId);
        if (!isTargeted) {
          newState = {...state, cursors: [{target: action.clickedNodeId, isPrimary: true}], selected: new Set()};
          nodesToDrag = [action.clickedNodeId];
        } else {
          nodesToDrag = state.selected.size > 0 ? [...state.selected] : state.cursors.map(c => c.target);
        }
      } else {
        nodesToDrag = state.selected.size > 0 ? [...state.selected] : state.cursors.map(c => c.target);
      }

      const nodeStartPositions: Record<NodeId, Vec3> = {};
      for (const nid of nodesToDrag) {
        if (layout[nid]) nodeStartPositions[nid] = layout[nid];
      }
      return {
        ...newState,
        interaction: {mode: 'dragging', startPos: action.pos, nodeStartPositions},
      };
    }

    case 'UPDATE_DRAG': {
      if (state.interaction.mode !== 'dragging') return state;
      const {startPos, nodeStartPositions} = state.interaction;
      const dx = action.pos[0] - startPos[0];
      const dy = action.pos[1] - startPos[1];
      // Merge with existing overrides instead of replacing
      const overrides: Record<NodeId, Vec3> = {...state.positionOverrides};
      for (const [nid, startNodePos] of Object.entries(nodeStartPositions)) {
        overrides[nid] = [startNodePos[0] + dx, startNodePos[1] + dy, 0];
      }
      return {...state, positionOverrides: overrides};
    }

    case 'FINISH_DRAG':
      return {...state, interaction: {mode: 'normal'}};

    case 'START_CONT_DRAG':
      return {
        ...state,
        interaction: {mode: 'cont_dragging', contKey: action.contKey, startPos: action.pos, startContPos: action.contPos},
      };

    case 'UPDATE_CONT_DRAG': {
      if (state.interaction.mode !== 'cont_dragging') return state;
      const {contKey, startPos, startContPos} = state.interaction;
      const dx = action.pos[0] - startPos[0];
      const dy = action.pos[1] - startPos[1];
      return {
        ...state,
        contPositionOverrides: {
          ...state.contPositionOverrides,
          [contKey]: [startContPos[0] + dx, startContPos[1] + dy, 0],
        },
      };
    }

    case 'FINISH_CONT_DRAG':
      return {...state, interaction: {mode: 'normal'}};

    default:
      return state;
  }
};

// Compute clip point on torus: amplify vertical component so angled connections
// clip near top/bottom of the torus, horizontal ones stay at the side.
const torusClip = (contPos: Vec3, nodePos: Vec3, fallbackDirX = 1): Vec3 => {
  const dx = contPos[0] - nodePos[0];
  const dy = (contPos[1] - nodePos[1]) * VERT_AMP;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const dirX = dist > 0 ? dx / dist : fallbackDirX;
  const dirY = dist > 0 ? dy / dist : 0;
  return [contPos[0] - dirX * torus.radius, contPos[1] - dirY * torus.radius, 0];
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const CursorIndicator = ({position, isPrimary}: { position: Vec3; isPrimary: boolean }) => {
  const ref = useRef<any>(null);
  useFrame(({clock, invalidate}) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
      ref.current.scale.set(s, s, s);
      invalidate();
    }
  });
  return (
    <Torus
      ref={ref}
      args={[8, 0.5, 16, 64]}
      material-color={isPrimary ? '#FFFFFF' : '#AAAAAA'}
      position={position}
    />
  );
};

const SelectionBox = ({start, current}: { start: Vec3; current: Vec3 }) => {
  const cx = (start[0] + current[0]) / 2;
  const cy = (start[1] + current[1]) / 2;
  const w = Math.abs(current[0] - start[0]);
  const h = Math.abs(current[1] - start[1]);
  if (w < 1 && h < 1) return null;
  return (
    <mesh position={[cx, cy, -0.5]} raycast={() => null}>
      <planeGeometry args={[w, h]}/>
      <meshBasicMaterial color="#4488FF" transparent opacity={0.15}/>
    </mesh>
  );
};

const EventPlane = ({dispatch, state, layout}: {
  dispatch: React.Dispatch<Action>;
  state: GraphState;
  layout: Record<NodeId, Vec3>;
}) => {
  const pendingRef = useRef<{
    type: 'node' | 'cont';
    nodeId?: NodeId;
    contKey?: string;
    contPos?: Vec3;
    startPos: Vec3;
  } | null>(null);
  const dragStarted = useRef(false);
  const isSelecting = useRef(false);
  const DRAG_THRESHOLD = 3;

  const toLocal = useCallback((point: { x: number; y: number }): Vec3 => {
    return [point.x / SCALE, point.y / SCALE, 0];
  }, []);

  const findNodeAtPos = useCallback((pos: Vec3): GraphNode | undefined => {
    const hitRadius = 12;
    for (const node of Object.values(state.nodes)) {
      const nodePos = layout[node.id];
      if (!nodePos) continue;
      const dx = pos[0] - nodePos[0];
      const dy = pos[1] - nodePos[1];
      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) return node;
    }
    return undefined;
  }, [state.nodes, layout]);

  const findContAtPos = useCallback((pos: Vec3): { key: string; pos: Vec3 } | undefined => {
    const hitRadius = 10;
    let best: { key: string; pos: Vec3 } | undefined;
    let bestDist = hitRadius;

    // Check dangling continuations
    for (const cont of Object.values(state.continuations)) {
      if (cont.connectedEdges.length > 0) continue;
      const nodePos = layout[cont.nodeId];
      if (!nodePos) continue;
      const offset = cont.side === 'initial' ? -CONT_OFFSET : CONT_OFFSET;
      const defaultPos: Vec3 = [nodePos[0] + offset, nodePos[1], 0];
      const contPos = state.contPositionOverrides[cont.id] ?? defaultPos;
      const dx = pos[0] - contPos[0];
      const dy = pos[1] - contPos[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = {key: cont.id, pos: contPos};
      }
    }

    // Check edge midpoint continuations
    for (const edge of Object.values(state.edges)) {
      const fromCont = state.continuations[edge.from];
      const toCont = state.continuations[edge.to];
      if (!fromCont || !toCont) continue;
      const fromNodePos = layout[fromCont.nodeId];
      const toNodePos = layout[toCont.nodeId];
      if (!fromNodePos || !toNodePos) continue;
      const defaultPos: Vec3 = [(fromNodePos[0] + toNodePos[0]) / 2, (fromNodePos[1] + toNodePos[1]) / 2, 0];
      const contPos = state.contPositionOverrides[edge.id] ?? defaultPos;
      const dx = pos[0] - contPos[0];
      const dy = pos[1] - contPos[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = {key: edge.id, pos: contPos};
      }
    }

    return best;
  }, [state.continuations, state.edges, state.contPositionOverrides, layout]);

  return (
    <mesh
      position={[0, 0, 1]}
      onPointerDown={(e) => {
        e.stopPropagation();
        const localPos = toLocal(e.point);

        if (e.nativeEvent.altKey) {
          const node = findNodeAtPos(localPos);
          if (node) {
            dispatch({type: 'ADD_CURSOR_AT', nodeId: node.id});
            return;
          }
        }

        const node = findNodeAtPos(localPos);
        if (node) {
          pendingRef.current = {type: 'node', nodeId: node.id, startPos: localPos};
          return;
        }

        const cont = findContAtPos(localPos);
        if (cont) {
          pendingRef.current = {type: 'cont', contKey: cont.key, contPos: cont.pos, startPos: localPos};
          return;
        }

        isSelecting.current = true;
        dispatch({type: 'START_SELECTION', pos: localPos});
      }}
      onPointerMove={(e) => {
        const localPos = toLocal(e.point);

        if (pendingRef.current && !dragStarted.current) {
          const dx = localPos[0] - pendingRef.current.startPos[0];
          const dy = localPos[1] - pendingRef.current.startPos[1];
          if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
            dragStarted.current = true;
            if (pendingRef.current.type === 'node') {
              dispatch({type: 'START_DRAG', pos: pendingRef.current.startPos, clickedNodeId: pendingRef.current.nodeId});
            } else {
              dispatch({
                type: 'START_CONT_DRAG',
                contKey: pendingRef.current.contKey!,
                contPos: pendingRef.current.contPos!,
                pos: pendingRef.current.startPos,
              });
            }
          }
          return;
        }

        if (dragStarted.current) {
          if (state.interaction.mode === 'dragging') {
            dispatch({type: 'UPDATE_DRAG', pos: localPos});
          } else if (state.interaction.mode === 'cont_dragging') {
            dispatch({type: 'UPDATE_CONT_DRAG', pos: localPos});
          }
          return;
        }

        if (isSelecting.current && state.interaction.mode === 'selecting') {
          dispatch({type: 'UPDATE_SELECTION', pos: localPos});
        }
      }}
      onPointerUp={() => {
        if (dragStarted.current) {
          dragStarted.current = false;
          if (state.interaction.mode === 'dragging') {
            dispatch({type: 'FINISH_DRAG'});
          } else if (state.interaction.mode === 'cont_dragging') {
            dispatch({type: 'FINISH_CONT_DRAG'});
          }
          pendingRef.current = null;
          return;
        }

        if (pendingRef.current) {
          // Was a click, not a drag
          if (pendingRef.current.type === 'node' && pendingRef.current.nodeId) {
            dispatch({type: 'SET_CURSOR_AT', nodeId: pendingRef.current.nodeId});
          }
          pendingRef.current = null;
          return;
        }

        if (isSelecting.current) {
          isSelecting.current = false;
          dispatch({type: 'FINISH_SELECTION'});
        }
      }}
    >
      <planeGeometry args={[10000, 10000]}/>
      <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
  );
};

// ─── GraphRenderer ──────────────────────────────────────────────────────────

const GraphRenderer = ({state, layout}: {
  state: GraphState;
  layout: Record<NodeId, Vec3>;
}) => {
  const scale = SCALE;

  const selectedEdgeIds = useMemo(() => {
    const set = new Set<EdgeId>();
    for (const edge of Object.values(state.edges)) {
      const fromNode = state.continuations[edge.from]?.nodeId;
      const toNode = state.continuations[edge.to]?.nodeId;
      if ((fromNode && state.selected.has(fromNode)) || (toNode && state.selected.has(toNode))) {
        set.add(edge.id);
      }
    }
    return set;
  }, [state.edges, state.continuations, state.selected]);

  return (
    <>
      {/* Render vertices with dangling continuations */}
      {Object.values(state.nodes).map(node => {
        const pos = layout[node.id];
        if (!pos) return null;

        const isSelected = state.selected.has(node.id);
        const nodeColor = isSelected ? '#55FF55' : node.color;

        const initCont = state.continuations[node.initialCont];
        const termCont = state.continuations[node.terminalCont];
        const initDangling = initCont.connectedEdges.length === 0;
        const termDangling = termCont.connectedEdges.length === 0;

        const initColor = isSelected ? '#55FF55' : (initDangling ? '#FF5555' : 'orange');
        const termColor = isSelected ? '#55FF55' : (termDangling ? '#5555FF' : 'orange');

        return (
          <group key={node.id}>
            <Vertex position={pos} color={nodeColor}/>
            {initDangling && (() => {
              const contPos = state.contPositionOverrides[node.initialCont] ?? add(pos, [-CONT_OFFSET, 0, 0]);
              const clipPt = torusClip(contPos, pos, -1);
              return (
                <>
                  <Continuation position={contPos} color={initColor}/>
                  <Line start={clipPt} end={pos} scale={scale} color={initColor}/>
                </>
              );
            })()}
            {termDangling && (() => {
              const contPos = state.contPositionOverrides[node.terminalCont] ?? add(pos, [CONT_OFFSET, 0, 0]);
              const clipPt = torusClip(contPos, pos, 1);
              return (
                <>
                  <Continuation position={contPos} color={termColor}/>
                  <Line start={clipPt} end={pos} scale={scale} color={termColor}/>
                </>
              );
            })()}
          </group>
        );
      })}

      {/* Render edges with continuation at midpoint */}
      {Object.values(state.edges).map(edge => {
        const fromCont = state.continuations[edge.from];
        const toCont = state.continuations[edge.to];
        if (!fromCont || !toCont) return null;

        const fromNodePos = layout[fromCont.nodeId];
        const toNodePos = layout[toCont.nodeId];
        if (!fromNodePos || !toNodePos) return null;

        const isSelected = selectedEdgeIds.has(edge.id);
        const edgeColor = isSelected ? '#55FF55' : edge.color;

        // Continuation at midpoint (or overridden position)
        const defaultContPos: Vec3 = [
          (fromNodePos[0] + toNodePos[0]) / 2,
          (fromNodePos[1] + toNodePos[1]) / 2,
          0,
        ];
        const contPos = state.contPositionOverrides[edge.id] ?? defaultContPos;

        // Clip points on torus — amplified vertical for smooth curve entry
        const clipPt1 = torusClip(contPos, fromNodePos);
        const clipPt2 = torusClip(contPos, toNodePos);

        return (
          <group key={edge.id}>
            <Line start={fromNodePos} end={clipPt1} scale={scale} color={edgeColor}/>
            <Continuation position={contPos} color={edgeColor}/>
            <Line start={toNodePos} end={clipPt2} scale={scale} color={edgeColor}/>
          </group>
        );
      })}

      {/* Render cursors */}
      {state.cursors.map((cursor, i) => {
        const pos = layout[cursor.target];
        if (!pos) return null;
        return <CursorIndicator key={`cursor-${i}`} position={pos} isPrimary={cursor.isPrimary}/>;
      })}

      {/* Selection box */}
      {state.interaction.mode === 'selecting' && (
        <SelectionBox start={state.interaction.start} current={state.interaction.current}/>
      )}
    </>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────

const IDE = () => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const layout = useMemo(
    () => computeLayout(state),
    [state.nodes, state.continuations, state.edges, state.positionOverrides]
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (stateRef.current.interaction.mode === 'normal') {
            if (e.shiftKey) {
              dispatch({type: 'ADD_VERTEX_BRANCH'});
            } else {
              dispatch({type: 'ADD_VERTEX_RIGHT'});
            }
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          dispatch({type: 'MOVE_CURSOR', direction: 'left'});
          break;
        case 'ArrowRight':
          e.preventDefault();
          dispatch({type: 'MOVE_CURSOR', direction: 'right'});
          break;
        case 'ArrowUp':
          e.preventDefault();
          dispatch({type: 'MOVE_CURSOR', direction: 'up'});
          break;
        case 'ArrowDown':
          e.preventDefault();
          dispatch({type: 'MOVE_CURSOR', direction: 'down'});
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!HAS_WEBGL) {
    return <div style={{color: 'white', padding: 20}}>WebGL is not available</div>;
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#1C2127',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          outputColorSpace: SRGBColorSpace,
          toneMapping: ACESFilmicToneMapping,
        }}
        camera={{
          fov: 70,
          near: 0.1,
          far: 2000,
          position: [0, 0, 1000],
        }}
        orthographic
        dpr={[1, 2]}
        linear={false}
        frameloop="demand"
        resize={{scroll: true, debounce: {scroll: 50, resize: 0}}}
        eventPrefix="offset"
      >
        <group scale={SCALE}>
          <GraphRenderer state={state} layout={layout}/>
        </group>
        <EventPlane dispatch={dispatch} state={state} layout={layout}/>
      </Canvas>
    </div>
  );
};

export default IDE;
