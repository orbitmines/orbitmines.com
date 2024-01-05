import {Arbitrary, JS, Ray} from "../../../explorer/Ray";
import { NotImplementedError } from "../../../explorer/errors/errors";
import {Option} from "../../../js/utils/Option";

/**
 * An interface from Aleks Kissinger's Chyp (Cospans of HYPergraphs) to Rays.
 * GitHub: https://github.com/akissinger/chyp
 *
 * NOTE:
 * This is just here for reference to the existing Chyp codebase - for anyone who understands that structure, to quickly translate that knowledge into how Rays work. - Other than that functionality, everything here should be considered as deprecated.
 *
 * TODO: There's a lot of duplicate code, unnecessary documentation and non-generality in Chyp. It was probably developed as a proof of concept?
 *
 * TODO: Probably want all these types at runtime, to display them
 *
 * TODO: Graph boundary is automatic with this structure?
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
  get highlight(): Ray { throw new NotImplementedError(); }

  get value(): Ray { throw new NotImplementedError(); }

  /**
   * Integer identifiers of input and output hyperedges of this vertex - useful for finding neighbouring hyperedges.
   *
   * TODO ; // set[int] = set()
   */
  get in_edges(): Ray { throw new NotImplementedError(); }
  get out_edges(): Ray { throw new NotImplementedError(); }

  /**
   * Indices (if any) where this vertex occurs in the input and output lists of the hypergraph.
   */
  get in_indices(): Ray { throw new NotImplementedError(); }
  get out_indices(): Ray { throw new NotImplementedError(); }

  /**
   * Initialize a VData instance.
   */
  __init__ = (): Ray => { throw new NotImplementedError(); }


  is_input = (): Ray => this.in_indices.count() > 0;
  is_output = (): Ray => this.out_indices.count() > 0;
  is_boundary = (): Ray => this.is_input() || this.is_output();

  // TODO: Probably generalizable

  /**
   * Initial
   * @param other
   */
  merge = (other: VData): Ray => {
    // TODO: other is destroyed
    // TODO: Vertices
    // this.initial().force().equivalent(other.initial().force());
    // this.terminal().force().equivalent(other.initial().force());

    throw new NotImplementedError();
  }
}

export class EData extends Ray {

  get s(): Ray { throw new NotImplementedError(); }
  get t(): Ray { throw new NotImplementedError(); }
  get x(): Ray { throw new NotImplementedError(); }
  get y(): Ray { throw new NotImplementedError(); }
  get fg(): Ray { throw new NotImplementedError(); }
  get bg(): Ray { throw new NotImplementedError(); }
  get highlight(): Ray { throw new NotImplementedError(); }
  get hyper(): Ray { throw new NotImplementedError(); }
  get value(): Ray { throw new NotImplementedError(); }

  __init__ = (): Ray => { throw new NotImplementedError(); }
  __repr__ = (): Ray => { throw new NotImplementedError(); }
  box_size = (): Ray => { throw new NotImplementedError(); }

  toString = (): string => this.__repr__().as_string(); // TODO; FOR ALL

  get source() { return this.s };
  get target() { return this.t };

  // TODO: Shouldn't be here, this should either be implemented on Ray if it's general enough, of just remain here as an artifact
  protected ___domain = (ray: Ray) => ray.map(_ => {
    const vertex: VData = _.cast();
    return [vertex.vtype, vertex.size];
  });

  domain = (): Ray => this.___domain(this.source);
  codomain = (): Ray => this.___domain(this.target);

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

  __init__ = (): Ray => { throw new NotImplementedError(); }

  // Implemented on Ray
  // copy = (): Ray => { throw new NotImplementedError(); }

  // TODO .keys
  vertices = (): Ray => this.vdata;
  edges = (): Ray => this.edata;

  // TODO: Shouldn't be here, this should either be implemented on Ray if it's general enough, of just remain here as an artifact
  protected ___domain = (ray: Ray) => ray.map(_ => {
    const vertex: VData = _.cast();
    return [vertex.vtype, vertex.size];
  });

  /**
   * Return the domain of the graph.
   *
   * This consists of a list of pairs (vertex type, register size) corresponding to each input vertex.
   */
  domain = (): Ray => this.___domain(this.inputs());

  /**
   * Return the domain of the graph.
   *
   * This consists of a list of pairs (vertex type, register size) corresponding to each output vertex.
   */
  codomain = (): Ray => this.___domain(this.outputs());

  /**
   * Return the :class:`VData` associated with vertex id `v`.
   *
   * @param v Integer identifier of the vertex.
   */
  vertex_data = (v = int): VData => this.vertices().at(v).cast();

  /**
   * Return the :class:`EData` associated with edge id `e`.
   *
   * @param e Integer identifier of the edge.
   */
  edge_data = (e = int): EData => this.edges().at(e).cast();

  add_vertex = (): Ray => { throw new NotImplementedError(); }
  add_edge = (s = list(int), t = list(int)): Ray => { throw new NotImplementedError(); }
  remove_vertex = (v = int): Ray => { throw new NotImplementedError(); }
  remove_edge = (e = int): Ray => { throw new NotImplementedError(); }
  add_inputs = (inp = list(int)): Ray => { throw new NotImplementedError(); }
  add_outputs = (outp = list(int)): Ray => { throw new NotImplementedError(); }
  set_inputs = (inp = list(int)): Ray => { throw new NotImplementedError(); }
  set_outputs = (outp = list(int)): Ray => { throw new NotImplementedError(); }
  // Return the list of vertex ids of the graph inputs.
  inputs = (): Ray => { throw new NotImplementedError(); }
  // Return the list of vertex ids of the graph outputs.
  outputs = (): Ray => { throw new NotImplementedError(); }

  // TODO: These are just one possibly ignorant ray through the initial/terminal ends which aren't matched - could just generate these on the fly, or similar to chyp add when added.
  _inputs = this.inputs;
  _outputs = this.outputs;

  // TODO: Move these to a "reference-like" structure, need to be on VData..

  /**
   * All these are just delegations from some Vertex/Edge structure.
   */
  // .vertices
  num_vertices = (): Ray => this.vertices().count();

  // .edges
  num_edges = (): Ray => this.edges().count();

  // .vertex_data
  is_input = (v = int): Ray => this.vertex_data(v).is_input();
  is_output = (v = int): Ray => this.vertex_data(v).is_output();
  is_boundary = (v = int): Ray => this.vertex_data(v).is_boundary();
  in_edges = (v = int): Ray => this.vertex_data(v).in_edges;
  out_edges = (v = int): Ray => this.vertex_data(v).out_edges;

  // .edge_data
  source = (e = int): Ray => this.edge_data(e).source;
  target = (e = int): Ray => this.edge_data(e).target;
  edge_domain = (edge_id = int): Ray => this.edge_data(edge_id).domain();
  edge_codomain = (edge_id = int): Ray => this.edge_data(edge_id).codomain();


  successors = (vs = Iterable(int)): Ray => { throw new NotImplementedError(); }

  /**
   * Form the quotient of the graph by identifying v with w. Afterwards, the quotiented vertex will be have integer identifier `v`.
   *
   * @param v Integer identifier of the vertex into which to merge `w`.
   * @param w Integer identifier of the vertex to merge into `v`.
   */
  merge_vertices = (v = int, w = int): Ray => this.vertex_data(v).merge(this.vertex_data(w));

  explode_vertex = (v = int): Ray => { throw new NotImplementedError(); }
  insert_id_after = (v = int): Ray => { throw new NotImplementedError(); }
  tensor = (other = Graph): Ray => { throw new NotImplementedError(); }
  __mul__ = (other = Graph): Ray => { throw new NotImplementedError(); }
  compose = (other = Graph): Ray => { throw new NotImplementedError(); }
  __rshift__ = (other = Graph): Ray => { throw new NotImplementedError(); }
  highlight = (vertices = set(int), edges = set(int)): Ray => { throw new NotImplementedError(); }
  unhighlight = (): Ray => { throw new NotImplementedError(); }
}

export class Chyp extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
}

export class CodeView extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
  popup_visible = (): Ray => { throw new NotImplementedError(); }
  set_completions = (completions = Iterable(str)): Ray => { throw new NotImplementedError(); }
  ident_at_cursor = (): Ray => { throw new NotImplementedError(); }
  insert_completion = (completion = str): Ray => { throw new NotImplementedError(); }
  keyPressEvent = (e = QKeyEvent): Ray => { throw new NotImplementedError(); }
  set_current_region = (region = Optional(Tuple(int,int))): Ray => { throw new NotImplementedError(); }
  add_line_below = (text = str): Ray => { throw new NotImplementedError(); }
}

export class CodeCompletionModel extends Ray {
  __init__ = (parent = QObject): Ray => { throw new NotImplementedError(); }
  set_completions = (completions = Iterable(str)): Ray => { throw new NotImplementedError(); }
  data = (index = Union(QModelIndex, QPersistentModelIndex)): Ray => { throw new NotImplementedError(); }
  rowCount = (): Ray => { throw new NotImplementedError(); }
}

export class ChypDocument extends Ray {
  __init__ = (parent = QWidget): Ray => { throw new NotImplementedError(); }
  confirm_close = (): Ray => { throw new NotImplementedError(); }
  add_to_recent_files = (file_name = str): Ray => { throw new NotImplementedError(); }
  open = (file_name = str): Ray => { throw new NotImplementedError(); }
  save = (): Ray => { throw new NotImplementedError(); }
  save_as = (): Ray => { throw new NotImplementedError(); }
}

export class Editor extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
  title = (): Ray => { throw new NotImplementedError(); }
  reset_state = (): Ray => { throw new NotImplementedError(); }
  invalidate_text = (): Ray => { throw new NotImplementedError(); }
  next_part = (): Ray => { throw new NotImplementedError(); }
  jump_to_error = (): Ray => { throw new NotImplementedError(); }
  show_errors = (): Ray => { throw new NotImplementedError(); }
  show_at_cursor = (): Ray => { throw new NotImplementedError(); }
  next_rewrite_at_cursor = (): Ray => { throw new NotImplementedError(); }
  repeat_step_at_cursor = (): Ray => { throw new NotImplementedError(); }
  update_state = (): Ray => { throw new NotImplementedError(); }
  import_at_cursor = (): Ray => { throw new NotImplementedError(); }
}

export class CheckThread extends Ray {
  __init__ = (rw = RewriteState): Ray => { throw new NotImplementedError(); }
  run = (): Ray => { throw new NotImplementedError(); }
}

export class ErrorListModel extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
  set_errors = (errors = List(Tuple(str, int, str))): Ray => { throw new NotImplementedError(); }
  data = (index = Union(QModelIndex, QPersistentModelIndex)): Ray => { throw new NotImplementedError(); }
  headerData = (section = int, orientation = Orientation): Ray => { throw new NotImplementedError(); }
  index = (row = int, column = int): Ray => { throw new NotImplementedError(); }
  columnCount = (): Ray => { throw new NotImplementedError(); }
  rowCount = (): Ray => { throw new NotImplementedError(); }
  parent = (): Ray => { throw new NotImplementedError(); }
}

export class EItem extends Ray {
  __init__ = (g = Graph, e = int): Ray => { throw new NotImplementedError(); }
  paint = (painter = QPainter, option = QStyleOptionGraphicsItem): Ray => { throw new NotImplementedError(); }
}

export class VItem extends Ray {
  __init__ = (g = Graph, v = int): Ray => { throw new NotImplementedError(); }
  refresh = (): Ray => { throw new NotImplementedError(); }
}

export class TItem extends Ray {
  __init__ = (vitem = VItem, eitem = EItem, i = int, src = bool): Ray => { throw new NotImplementedError(); }
  refresh = (): Ray => { throw new NotImplementedError(); }
}

export class GraphScene extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
  set_graph = (g = Graph): Ray => { throw new NotImplementedError(); }
  add_items = (): Ray => { throw new NotImplementedError(); }
  mousePressEvent = (e = QGraphicsSceneMouseEvent): Ray => { throw new NotImplementedError(); }
  mouseMoveEvent = (e = QGraphicsSceneMouseEvent): Ray => { throw new NotImplementedError(); }
  mouseReleaseEvent = (_ = QGraphicsSceneMouseEvent): Ray => { throw new NotImplementedError(); }
}

export class GraphView extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
  set_graph = (g = Graph): Ray => { throw new NotImplementedError(); }
}

export class ChypHighlighter extends Ray {
  __init__ = (doc = QTextDocument): Ray => { throw new NotImplementedError(); }
  set_current_region = (region = Optional(Tuple(int,int)), status = int): Ray => { throw new NotImplementedError(); }
  highlightBlock = (text = str): Ray => { throw new NotImplementedError(); }
}

export class MainWindow extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
  remove_empty_editor = (): Ray => { throw new NotImplementedError(); }
  update_file_name = (): Ray => { throw new NotImplementedError(); }
  tab_changed = (i = int): Ray => { throw new NotImplementedError(); }
  update_themes = (): Ray => { throw new NotImplementedError(); }
  recent_files = (): Ray => { throw new NotImplementedError(); }
  update_recent_files = (): Ray => { throw new NotImplementedError(); }
  add_tab = (ed = Editor, title = str): Ray => { throw new NotImplementedError(); }
  close_tab = (): Ray => { throw new NotImplementedError(); }
  new = (): Ray => { throw new NotImplementedError(); }
  open = (): Ray => { throw new NotImplementedError(); }
  save = (): Ray => { throw new NotImplementedError(); }
  save_as = (): Ray => { throw new NotImplementedError(); }
  undo = (): Ray => { throw new NotImplementedError(); }
  redo = (): Ray => { throw new NotImplementedError(); }
  show_errors = (): Ray => { throw new NotImplementedError(); }
  add_rewrite_step = (): Ray => { throw new NotImplementedError(); }
  repeat_rewrite_step = (): Ray => { throw new NotImplementedError(); }
  next_rewrite = (): Ray => { throw new NotImplementedError(); }
  next_part = (): Ray => { throw new NotImplementedError(); }
  previous_part = (): Ray => { throw new NotImplementedError(); }
  next_tab = (): Ray => { throw new NotImplementedError(); }
  previous_tab = (): Ray => { throw new NotImplementedError(); }
  goto_import = (): Ray => { throw new NotImplementedError(); }
  closeEvent = (e = QCloseEvent): Ray => { throw new NotImplementedError(); }
  build_menu = (): Ray => { throw new NotImplementedError(); }
}

export class Match extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
  __str__ = (): Ray => { throw new NotImplementedError(); }

  // Implemented on Ray
  // TODO; doesnt copy the graphs at domain/codomain
  // copy = (): Ray => { throw new NotImplementedError(); }

  try_add_vertex = (domain_vertex = int, codomain_vertex = int): Ray => { throw new NotImplementedError(); }
  try_add_edge = (domain_edge = int, codomain_edge = int): Ray => { throw new NotImplementedError(); }
  domain_neighbourhood_mapped = (vertex = int): Ray => { throw new NotImplementedError(); }
  map_scalars = (): Ray => { throw new NotImplementedError(); }
  more = (): Ray => { throw new NotImplementedError(); }
  is_total = (): Ray => { throw new NotImplementedError(); }
  is_surjective = (): Ray => { throw new NotImplementedError(); }
  is_injective = (): Ray => { throw new NotImplementedError(); }
  is_convex = (): Ray => { throw new NotImplementedError(); }
}

export class Matches extends Ray {
  __init__ = (domain = Graph, codomain = Graph): Ray => { throw new NotImplementedError(); }
  __iter__ = (): Ray => { throw new NotImplementedError(); }
  __next__ = (): Ray => { throw new NotImplementedError(); }
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

  __init__ = (lhs = Graph, rhs = Graph, name = str(''), equiv = bool(True)): Ray => { throw new NotImplementedError(); }
  copy = (): Ray => { throw new NotImplementedError(); }
  converse = (): Ray => { throw new NotImplementedError(); }
  is_left_linear = (): Ray => { throw new NotImplementedError(); }
}

export class RewriteState extends Ray {
  __init__ = (sequence = int, state = State): Ray => { throw new NotImplementedError(); }
  check = (): Ray => { throw new NotImplementedError(); }
}

export class State extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }
  part_with_index_at = (pos = int): Ray => { throw new NotImplementedError(); }
  part_at = (pos = int): Ray => { throw new NotImplementedError(); }
  var = (items = List(Any)): Ray => { throw new NotImplementedError(); }
  module_name = (items = List(Any)): Ray => { throw new NotImplementedError(); }
  num = (items = List(Any)): Ray => { throw new NotImplementedError(); }
  type_element = (items = list(Any)): Ray => { throw new NotImplementedError(); }
  type_term = (items = list(JS.Iterable([tuple(JS.Iterable([str, None]), int), None]))): Ray => { throw new NotImplementedError(); }
  id = (items = list(Any)): Ray => { throw new NotImplementedError(); }
  id0 = (_ = List(Any)): Ray => { throw new NotImplementedError(); }
  eq = (_ = List(Any)): Ray => { throw new NotImplementedError(); }
  le = (_ = List(Any)): Ray => { throw new NotImplementedError(); }
  perm_indices = (items = list(int)): Ray => { throw new NotImplementedError(); }
  size_list = (items = list(int)): Ray => { throw new NotImplementedError(); }
  par = (items = List(Any)): Ray => { throw new NotImplementedError(); }
  gen_color = (items = List(Any)): Ray => { throw new NotImplementedError(); }
  color = (items = List(Any)): Ray => { throw new NotImplementedError(); }
  import_let = (items = List(Any)): Ray => { throw new NotImplementedError(); }
  tactic = (items = List(Any)): Ray => { throw new NotImplementedError(); }
  nested_term = (items = List(Any)): Ray => { throw new NotImplementedError(); }
}

export class Tactic extends Ray {
  __init__ = (local_state = RewriteState, args = List(str)): Ray => { throw new NotImplementedError(); }
  repeat = (rw = Callable([str], bool), rules = List(str)): Ray => { throw new NotImplementedError(); }
  error = (message = str): Ray => { throw new NotImplementedError(); }
  has_goal = (): Ray => { throw new NotImplementedError(); }
  global_rules = (): Ray => { throw new NotImplementedError(); }
  lookup_rule = (rule_expr = str): Ray => { throw new NotImplementedError(); }
  add_refl_to_context = (graph = Graph, ident = str): Ray => { throw new NotImplementedError(); }
  add_rule_to_context = (rule_name = str): Ray => { throw new NotImplementedError(); }
  __lhs = (target = str): Ray => { throw new NotImplementedError(); }
  __rhs = (target = str): Ray => { throw new NotImplementedError(); }
  __set_lhs = (target = str, graph = Graph): Ray => { throw new NotImplementedError(); }
  __set_rhs = (target = str, graph = Graph): Ray => { throw new NotImplementedError(); }
  rewrite_lhs = (rule_expr = str): Ray => { throw new NotImplementedError(); }
  rewrite_rhs = (rule_expr = str): Ray => { throw new NotImplementedError(); }
  rewrite_lhs1 = (rule_expr = str): Ray => { throw new NotImplementedError(); }
  rewrite_rhs1 = (rule_expr = str): Ray => { throw new NotImplementedError(); }
  validate_goal = (): Ray => { throw new NotImplementedError(); }
  lhs = (): Ray => { throw new NotImplementedError(); }
  rhs = (): Ray => { throw new NotImplementedError(); }
  lhs_size = (): Ray => { throw new NotImplementedError(); }
  rhs_size = (): Ray => { throw new NotImplementedError(); }
  highlight_lhs = (vertices = Set(int), edges = Set(int)): Ray => { throw new NotImplementedError(); }
  highlight_rhs = (vertices = Set(int), edges = Set(int)): Ray => { throw new NotImplementedError(); }
  __reset = (): Ray => { throw new NotImplementedError(); }
  next_rhs = (current = str): Ray => { throw new NotImplementedError(); }
  run_check = (): Ray => { throw new NotImplementedError(); }
  name = (): Ray => { throw new NotImplementedError(); }
  check = (): Ray => { throw new NotImplementedError(); }
  make_rhs = (): Ray => { throw new NotImplementedError(); }
}

export class RuleTac extends Ray {
  name = (): Ray => { throw new NotImplementedError(); }
  make_rhs = (): Ray => { throw new NotImplementedError(); }
  check = (): Ray => { throw new NotImplementedError(); }
}

export class SimpTac extends Ray {
  name = (): Ray => { throw new NotImplementedError(); }
  __prepare_rules = (): Ray => { throw new NotImplementedError(); }
  make_rhs = (): Ray => { throw new NotImplementedError(); }
  check = (): Ray => { throw new NotImplementedError(); }
}

