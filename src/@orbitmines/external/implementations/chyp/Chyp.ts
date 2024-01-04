import {JS, Ray} from "../../../explorer/Ray";
import { NotImplementedError } from "../../../explorer/errors/errors";
import {Option} from "../../../js/utils/Option";

/**
 * Probably want all these types at runtime, to display them
 */

export const int = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const list = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Iterable = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const set = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const str = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QKeyEvent = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Optional = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Tuple = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QObject = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Union = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QModelIndex = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QPersistentModelIndex = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QWidget = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const List = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Qt = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Orientation = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QPainter = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QStyleOptionGraphicsItem = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const bool = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const False = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const True = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QGraphicsSceneMouseEvent = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QTextDocument = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const editor = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const QCloseEvent = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Any = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const tuple = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const None = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const state = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Callable = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };
export const Set = (t1?: any, t2?: any, t3?: any): Ray => { throw new NotImplementedError() };

/**
 * Non-default vertex types are identified by a string label
 * 
 * str() | None() - No overloading in TypeScript ;(
 */
export const VType = JS.Iterable([str, None]);

/**
 * An error occurred in the graph backend.
 *
 * TODO probably hooked as a boolean, one successful the other not
 */
export class GraphError extends Ray {
}

/**
 * Data associated with a single vertex.
 */
export class VData extends Ray {

  // The vertex type.
  get vtype(): Ray { throw new NotImplementedError(); }

  /**
   * The register size (number of bundled parallel wires) of the vertex.
   *
   * TODO: Just a counter over a line
   */
  get size(): Ray { throw new NotImplementedError(); }

  /**
   * Whether to infer the vertex type during composition. Used for special generators (identities, permutations, redistributers).
   */
  get infer_type(): Ray { throw new NotImplementedError(); }

  /**
   * Whether to infer the vertex size during composition. Used for special generators (identities, permutations,  redistributers).
   */
  get infer_size(): Ray { throw new NotImplementedError(); }


  /**
   * TODO: These coordinates used for inferences?
   * - If not then this is probably a hack and should be interpreted as "on another layer of description which is the GUI"
   */

  // x-coordinate at which to draw the vertex.
  get x(): Ray { throw new NotImplementedError(); }
  // y-coordinate at which to draw the vertex.
  get y(): Ray { throw new NotImplementedError(); }

  // TODO: Just some boolean
  get hightlight(): Ray { throw new NotImplementedError(); }

  __init__ = (): any => { throw new NotImplementedError(); }

}

export class EData extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  __repr__ = (): any => { throw new NotImplementedError(); }
  box_size = (): any => { throw new NotImplementedError(); }

  toString = (): string => this.__repr__();
}

/**
 * A hypergraph with boundaries.
 *
 *     This is the main data structure used by Chyp. It represents a directed
 *     hypergraph (which we call simply a "graph") as two dictionaries for
 *     vertices and (hyper)edges, respectively. Each vertex is associated with a
 *     `VData` object and edge edge with an `EData` object, which stores
 *     information about adjacency, position, label, etc.
 *
 *     The particular flavor of hypergraphs we use associate to each hyperedge a
 *     list of source vertices and a list of target vertices. The hypergraph
 *     itself also has a list of input vertices and a list of output vertices,
 *     which are used for sequential composition and rewriting.
 */
export class Graph extends Ray {

  // Mapping from integer identifiers of each vertex to its data.
  get vdata(): Ray { throw new NotImplementedError(); }
  // Mapping from integer identifiers of each hyperedge to its data.
  get edata(): Ray { throw new NotImplementedError(); }

  get vindex(): Ray { throw new NotImplementedError(); }
  get eindex(): Ray { throw new NotImplementedError(); }

  __init__ = (): any => { throw new NotImplementedError(); }

  // Implemented on Ray
  // copy = (): any => { throw new NotImplementedError(); }

  vertices = (): any => { throw new NotImplementedError(); }
  edges = (): any => { throw new NotImplementedError(); }
  num_vertices = (): any => { throw new NotImplementedError(); }
  num_edges = (): any => { throw new NotImplementedError(); }
  domain = (): any => { throw new NotImplementedError(); }
  codomain = (): any => { throw new NotImplementedError(); }
  vertex_data = (v = int): any => { throw new NotImplementedError(); }
  edge_data = (e = int): any => { throw new NotImplementedError(); }
  edge_domain = (edge_id = int): any => { throw new NotImplementedError(); }
  edge_codomain = (edge_id = int): any => { throw new NotImplementedError(); }
  in_edges = (v = int): any => { throw new NotImplementedError(); }
  out_edges = (v = int): any => { throw new NotImplementedError(); }
  source = (e = int): any => { throw new NotImplementedError(); }
  target = (e = int): any => { throw new NotImplementedError(); }
  add_vertex = (): any => { throw new NotImplementedError(); }
  add_edge = (s = list(int), t = list(int)): any => { throw new NotImplementedError(); }
  remove_vertex = (v = int): any => { throw new NotImplementedError(); }
  remove_edge = (e = int): any => { throw new NotImplementedError(); }
  add_inputs = (inp = list(int)): any => { throw new NotImplementedError(); }
  add_outputs = (outp = list(int)): any => { throw new NotImplementedError(); }
  set_inputs = (inp = list(int)): any => { throw new NotImplementedError(); }
  set_outputs = (outp = list(int)): any => { throw new NotImplementedError(); }
  // Return the list of vertex ids of the graph inputs.
  inputs = (): any => { throw new NotImplementedError(); }
  // Return the list of vertex ids of the graph outputs.
  outputs = (): any => { throw new NotImplementedError(); }
  _inputs = this.inputs;
  _outputs = this.outputs;
  is_input = (v = int): any => { throw new NotImplementedError(); }
  is_output = (v = int): any => { throw new NotImplementedError(); }
  is_boundary = (v = int): any => { throw new NotImplementedError(); }
  successors = (vs = Iterable(int)): any => { throw new NotImplementedError(); }
  merge_vertices = (v = int, w = int): any => { throw new NotImplementedError(); }
  explode_vertex = (v = int): any => { throw new NotImplementedError(); }
  insert_id_after = (v = int): any => { throw new NotImplementedError(); }
  tensor = (other = Graph): any => { throw new NotImplementedError(); }
  __mul__ = (other = Graph): any => { throw new NotImplementedError(); }
  compose = (other = Graph): any => { throw new NotImplementedError(); }
  __rshift__ = (other = Graph): any => { throw new NotImplementedError(); }
  highlight = (vertices = set(int), edges = set(int)): any => { throw new NotImplementedError(); }
  unhighlight = (): any => { throw new NotImplementedError(); }
}

export class Chyp extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
}

export class CodeView extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  popup_visible = (): any => { throw new NotImplementedError(); }
  set_completions = (completions = Iterable(str)): any => { throw new NotImplementedError(); }
  ident_at_cursor = (): any => { throw new NotImplementedError(); }
  insert_completion = (completion = str): any => { throw new NotImplementedError(); }
  keyPressEvent = (e = QKeyEvent): any => { throw new NotImplementedError(); }
  set_current_region = (region = Optional(Tuple(int,int))): any => { throw new NotImplementedError(); }
  add_line_below = (text = str): any => { throw new NotImplementedError(); }
}

export class CodeCompletionModel extends Ray {
  __init__ = (parent = QObject): any => { throw new NotImplementedError(); }
  set_completions = (completions = Iterable(str)): any => { throw new NotImplementedError(); }
  data = (index = Union(QModelIndex, QPersistentModelIndex)): any => { throw new NotImplementedError(); }
  rowCount = (): any => { throw new NotImplementedError(); }
}

export class ChypDocument extends Ray {
  __init__ = (parent = QWidget): any => { throw new NotImplementedError(); }
  confirm_close = (): any => { throw new NotImplementedError(); }
  add_to_recent_files = (file_name = str): any => { throw new NotImplementedError(); }
  open = (file_name = str): any => { throw new NotImplementedError(); }
  save = (): any => { throw new NotImplementedError(); }
  save_as = (): any => { throw new NotImplementedError(); }
}

export class Editor extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  title = (): any => { throw new NotImplementedError(); }
  reset_state = (): any => { throw new NotImplementedError(); }
  invalidate_text = (): any => { throw new NotImplementedError(); }
  next_part = (): any => { throw new NotImplementedError(); }
  jump_to_error = (): any => { throw new NotImplementedError(); }
  show_errors = (): any => { throw new NotImplementedError(); }
  show_at_cursor = (): any => { throw new NotImplementedError(); }
  next_rewrite_at_cursor = (): any => { throw new NotImplementedError(); }
  repeat_step_at_cursor = (): any => { throw new NotImplementedError(); }
  update_state = (): any => { throw new NotImplementedError(); }
  import_at_cursor = (): any => { throw new NotImplementedError(); }
}

export class CheckThread extends Ray {
  __init__ = (rw = RewriteState): any => { throw new NotImplementedError(); }
  run = (): any => { throw new NotImplementedError(); }
}

export class ErrorListModel extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  set_errors = (errors = List(Tuple(str, int, str))): any => { throw new NotImplementedError(); }
  data = (index = Union(QModelIndex, QPersistentModelIndex)): any => { throw new NotImplementedError(); }
  headerData = (section = int, orientation = Orientation): any => { throw new NotImplementedError(); }
  index = (row = int, column = int): any => { throw new NotImplementedError(); }
  columnCount = (): any => { throw new NotImplementedError(); }
  rowCount = (): any => { throw new NotImplementedError(); }
  parent = (): any => { throw new NotImplementedError(); }
}

export class EItem extends Ray {
  __init__ = (g = Graph, e = int): any => { throw new NotImplementedError(); }
  paint = (painter = QPainter, option = QStyleOptionGraphicsItem): any => { throw new NotImplementedError(); }
}

export class VItem extends Ray {
  __init__ = (g = Graph, v = int): any => { throw new NotImplementedError(); }
  refresh = (): any => { throw new NotImplementedError(); }
}

export class TItem extends Ray {
  __init__ = (vitem = VItem, eitem = EItem, i = int, src = bool): any => { throw new NotImplementedError(); }
  refresh = (): any => { throw new NotImplementedError(); }
}

export class GraphScene extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  set_graph = (g = Graph): any => { throw new NotImplementedError(); }
  add_items = (): any => { throw new NotImplementedError(); }
  mousePressEvent = (e = QGraphicsSceneMouseEvent): any => { throw new NotImplementedError(); }
  mouseMoveEvent = (e = QGraphicsSceneMouseEvent): any => { throw new NotImplementedError(); }
  mouseReleaseEvent = (_ = QGraphicsSceneMouseEvent): any => { throw new NotImplementedError(); }
}

export class GraphView extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  set_graph = (g = Graph): any => { throw new NotImplementedError(); }
}

export class ChypHighlighter extends Ray {
  __init__ = (doc = QTextDocument): any => { throw new NotImplementedError(); }
  set_current_region = (region = Optional(Tuple(int,int)), status = int): any => { throw new NotImplementedError(); }
  highlightBlock = (text = str): any => { throw new NotImplementedError(); }
}

export class MainWindow extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  remove_empty_editor = (): any => { throw new NotImplementedError(); }
  update_file_name = (): any => { throw new NotImplementedError(); }
  tab_changed = (i = int): any => { throw new NotImplementedError(); }
  update_themes = (): any => { throw new NotImplementedError(); }
  recent_files = (): any => { throw new NotImplementedError(); }
  update_recent_files = (): any => { throw new NotImplementedError(); }
  add_tab = (ed = Editor, title = str): any => { throw new NotImplementedError(); }
  close_tab = (): any => { throw new NotImplementedError(); }
  new = (): any => { throw new NotImplementedError(); }
  open = (): any => { throw new NotImplementedError(); }
  save = (): any => { throw new NotImplementedError(); }
  save_as = (): any => { throw new NotImplementedError(); }
  undo = (): any => { throw new NotImplementedError(); }
  redo = (): any => { throw new NotImplementedError(); }
  show_errors = (): any => { throw new NotImplementedError(); }
  add_rewrite_step = (): any => { throw new NotImplementedError(); }
  repeat_rewrite_step = (): any => { throw new NotImplementedError(); }
  next_rewrite = (): any => { throw new NotImplementedError(); }
  next_part = (): any => { throw new NotImplementedError(); }
  previous_part = (): any => { throw new NotImplementedError(); }
  next_tab = (): any => { throw new NotImplementedError(); }
  previous_tab = (): any => { throw new NotImplementedError(); }
  goto_import = (): any => { throw new NotImplementedError(); }
  closeEvent = (e = QCloseEvent): any => { throw new NotImplementedError(); }
  build_menu = (): any => { throw new NotImplementedError(); }
}

export class Match extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  __str__ = (): any => { throw new NotImplementedError(); }
  copy = (): any => { throw new NotImplementedError(); }
  try_add_vertex = (domain_vertex = int, codomain_vertex = int): any => { throw new NotImplementedError(); }
  try_add_edge = (domain_edge = int, codomain_edge = int): any => { throw new NotImplementedError(); }
  domain_neighbourhood_mapped = (vertex = int): any => { throw new NotImplementedError(); }
  map_scalars = (): any => { throw new NotImplementedError(); }
  more = (): any => { throw new NotImplementedError(); }
  is_total = (): any => { throw new NotImplementedError(); }
  is_surjective = (): any => { throw new NotImplementedError(); }
  is_injective = (): any => { throw new NotImplementedError(); }
  is_convex = (): any => { throw new NotImplementedError(); }
}

export class Matches extends Ray {
  __init__ = (domain = Graph, codomain = Graph): any => { throw new NotImplementedError(); }
  __iter__ = (): any => { throw new NotImplementedError(); }
  __next__ = (): any => { throw new NotImplementedError(); }
}

export class RuleError extends Ray {
}

export class Rule extends Ray {
  get lhs(): Ray { throw new NotImplementedError(); }
  get rhs(): Ray { throw new NotImplementedError(); }

  /**
   * TODO: Put the name on each side of the rule, not the '-' hacky thing
   */
  get name(): Ray { throw new NotImplementedError(); }
  get equiv(): Ray { throw new NotImplementedError(); }

  __init__ = (lhs = Graph, rhs = Graph, name = str(''), equiv = bool(True)): any => { throw new NotImplementedError(); }
  copy = (): any => { throw new NotImplementedError(); }
  converse = (): any => { throw new NotImplementedError(); }
  is_left_linear = (): any => { throw new NotImplementedError(); }
}

export class RewriteState extends Ray {
  __init__ = (sequence = int, state = State): any => { throw new NotImplementedError(); }
  check = (): any => { throw new NotImplementedError(); }
}

export class State extends Ray {
  __init__ = (): any => { throw new NotImplementedError(); }
  part_with_index_at = (pos = int): any => { throw new NotImplementedError(); }
  part_at = (pos = int): any => { throw new NotImplementedError(); }
  var = (items = List(Any)): any => { throw new NotImplementedError(); }
  module_name = (items = List(Any)): any => { throw new NotImplementedError(); }
  num = (items = List(Any)): any => { throw new NotImplementedError(); }
  type_element = (items = list(Any)): any => { throw new NotImplementedError(); }
  type_term = (items = list(JS.Iterable([tuple(JS.Iterable([str, None]), int), None]))): any => { throw new NotImplementedError(); }
  id = (items = list(Any)): any => { throw new NotImplementedError(); }
  id0 = (_ = List(Any)): any => { throw new NotImplementedError(); }
  eq = (_ = List(Any)): any => { throw new NotImplementedError(); }
  le = (_ = List(Any)): any => { throw new NotImplementedError(); }
  perm_indices = (items = list(int)): any => { throw new NotImplementedError(); }
  size_list = (items = list(int)): any => { throw new NotImplementedError(); }
  par = (items = List(Any)): any => { throw new NotImplementedError(); }
  gen_color = (items = List(Any)): any => { throw new NotImplementedError(); }
  color = (items = List(Any)): any => { throw new NotImplementedError(); }
  import_let = (items = List(Any)): any => { throw new NotImplementedError(); }
  tactic = (items = List(Any)): any => { throw new NotImplementedError(); }
  nested_term = (items = List(Any)): any => { throw new NotImplementedError(); }
}

export class Tactic extends Ray {
  __init__ = (local_state = RewriteState, args = List(str)): any => { throw new NotImplementedError(); }
  repeat = (rw = Callable([str], bool), rules = List(str)): any => { throw new NotImplementedError(); }
  error = (message = str): any => { throw new NotImplementedError(); }
  has_goal = (): any => { throw new NotImplementedError(); }
  global_rules = (): any => { throw new NotImplementedError(); }
  lookup_rule = (rule_expr = str): any => { throw new NotImplementedError(); }
  add_refl_to_context = (graph = Graph, ident = str): any => { throw new NotImplementedError(); }
  add_rule_to_context = (rule_name = str): any => { throw new NotImplementedError(); }
  __lhs = (target = str): any => { throw new NotImplementedError(); }
  __rhs = (target = str): any => { throw new NotImplementedError(); }
  __set_lhs = (target = str, graph = Graph): any => { throw new NotImplementedError(); }
  __set_rhs = (target = str, graph = Graph): any => { throw new NotImplementedError(); }
  rewrite_lhs = (rule_expr = str): any => { throw new NotImplementedError(); }
  rewrite_rhs = (rule_expr = str): any => { throw new NotImplementedError(); }
  rewrite_lhs1 = (rule_expr = str): any => { throw new NotImplementedError(); }
  rewrite_rhs1 = (rule_expr = str): any => { throw new NotImplementedError(); }
  validate_goal = (): any => { throw new NotImplementedError(); }
  lhs = (): any => { throw new NotImplementedError(); }
  rhs = (): any => { throw new NotImplementedError(); }
  lhs_size = (): any => { throw new NotImplementedError(); }
  rhs_size = (): any => { throw new NotImplementedError(); }
  highlight_lhs = (vertices = Set(int), edges = Set(int)): any => { throw new NotImplementedError(); }
  highlight_rhs = (vertices = Set(int), edges = Set(int)): any => { throw new NotImplementedError(); }
  __reset = (): any => { throw new NotImplementedError(); }
  next_rhs = (current = str): any => { throw new NotImplementedError(); }
  run_check = (): any => { throw new NotImplementedError(); }
  name = (): any => { throw new NotImplementedError(); }
  check = (): any => { throw new NotImplementedError(); }
  make_rhs = (): any => { throw new NotImplementedError(); }
}

export class RuleTac extends Ray {
  name = (): any => { throw new NotImplementedError(); }
  make_rhs = (): any => { throw new NotImplementedError(); }
  check = (): any => { throw new NotImplementedError(); }
}

export class SimpTac extends Ray {
  name = (): any => { throw new NotImplementedError(); }
  __prepare_rules = (): any => { throw new NotImplementedError(); }
  make_rhs = (): any => { throw new NotImplementedError(); }
  check = (): any => { throw new NotImplementedError(); }
}

