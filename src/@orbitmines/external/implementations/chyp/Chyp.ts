
export type int<T1 = any, T2 = any, T3 = any> = any;
export type list<T1 = any, T2 = any, T3 = any> = any;
export type Iterable<T1 = any, T2 = any, T3 = any> = any;
export type set<T1 = any, T2 = any, T3 = any> = any;
export type str<T1 = any, T2 = any, T3 = any> = any;
export type QKeyEvent<T1 = any, T2 = any, T3 = any> = any;
export type Optional<T1 = any, T2 = any, T3 = any> = any;
export type Tuple<T1 = any, T2 = any, T3 = any> = any;
export type QObject<T1 = any, T2 = any, T3 = any> = any;
export type Union<T1 = any, T2 = any, T3 = any> = any;
export type QModelIndex<T1 = any, T2 = any, T3 = any> = any;
export type QPersistentModelIndex<T1 = any, T2 = any, T3 = any> = any;
export type QWidget<T1 = any, T2 = any, T3 = any> = any;
export type List<T1 = any, T2 = any, T3 = any> = any;
export type Qt<T1 = any, T2 = any, T3 = any> = any;
export type Orientation<T1 = any, T2 = any, T3 = any> = any;
export type QPainter<T1 = any, T2 = any, T3 = any> = any;
export type QStyleOptionGraphicsItem<T1 = any, T2 = any, T3 = any> = any;
export type bool<T1 = any, T2 = any, T3 = any> = any;
export type QGraphicsSceneMouseEvent<T1 = any, T2 = any, T3 = any> = any;
export type QTextDocument<T1 = any, T2 = any, T3 = any> = any;
export type editor<T1 = any, T2 = any, T3 = any> = any;
export type QCloseEvent<T1 = any, T2 = any, T3 = any> = any;
export type Any<T1 = any, T2 = any, T3 = any> = any;
export type tuple<T1 = any, T2 = any, T3 = any> = any;
export type None<T1 = any, T2 = any, T3 = any> = any;
export type state<T1 = any, T2 = any, T3 = any> = any;
export type Callable<T1 = any, T2 = any, T3 = any> = any;
export type Set<T1 = any, T2 = any, T3 = any> = any;

export type GraphError = {
}

export type VData = {
  __init__(): any;
}

export type EData = {
  __init__(): any;
  __repr__(): any;
  box_size(): any;
}

export type Graph = {
  __init__(): any;
  copy(): any;
  vertices(): any;
  edges(): any;
  num_vertices(): any;
  num_edges(): any;
  domain(): any;
  codomain(): any;
  vertex_data(v: int): any;
  edge_data(e: int): any;
  edge_domain(edge_id: int): any;
  edge_codomain(edge_id: int): any;
  in_edges(v: int): any;
  out_edges(v: int): any;
  source(e: int): any;
  target(e: int): any;
  add_vertex(): any;
  add_edge(s: list<int>, t: list<int>): any;
  remove_vertex(v: int): any;
  remove_edge(e: int): any;
  add_inputs(inp: list<int>): any;
  add_outputs(outp: list<int>): any;
  set_inputs(inp: list<int>): any;
  set_outputs(outp: list<int>): any;
  inputs(): any;
  outputs(): any;
  is_input(v: int): any;
  is_output(v: int): any;
  is_boundary(v: int): any;
  successors(vs: Iterable<int>): any;
  merge_vertices(v: int, w: int): any;
  explode_vertex(v: int): any;
  insert_id_after(v: int): any;
  tensor(other: Graph): any;
  __mul__(other: Graph): any;
  compose(other: Graph): any;
  __rshift__(other: Graph): any;
  highlight(vertices: set<int>, edges: set<int>): any;
  unhighlight(): any;
}

export type Chyp = {
  __init__(): any;
}

export type CodeView = {
  __init__(): any;
  popup_visible(): any;
  set_completions(completions: Iterable<str>): any;
  ident_at_cursor(): any;
  insert_completion(completion: str): any;
  keyPressEvent(e: QKeyEvent): any;
  set_current_region(region: Optional<Tuple<int,int>>): any;
  add_line_below(text: str): any;
}

export type CodeCompletionModel = {
  __init__(parent: QObject): any;
  set_completions(completions: Iterable<str>): any;
  data(index: Union<QModelIndex, QPersistentModelIndex>): any;
  rowCount(): any;
}

export type ChypDocument = {
  __init__(parent: QWidget): any;
  confirm_close(): any;
  add_to_recent_files(file_name: str): any;
  open(file_name: str): any;
  save(): any;
  save_as(): any;
}

export type Editor = {
  __init__(): any;
  title(): any;
  reset_state(): any;
  invalidate_text(): any;
  next_part(): any;
  jump_to_error(): any;
  show_errors(): any;
  show_at_cursor(): any;
  next_rewrite_at_cursor(): any;
  repeat_step_at_cursor(): any;
  update_state(): any;
  import_at_cursor(): any;
}

export type CheckThread = {
  __init__(rw: RewriteState): any;
  run(): any;
}

export type ErrorListModel = {
  __init__(): any;
  set_errors(errors: List<Tuple<str, int, str>>): any;
  data(index: Union<QModelIndex, QPersistentModelIndex>): any;
  headerData(section: int, orientation: Orientation): any;
  index(row: int, column: int): any;
  columnCount(): any;
  rowCount(): any;
  parent(): any;
}

export type EItem = {
  __init__(g: Graph, e: int): any;
  paint(painter: QPainter, option: QStyleOptionGraphicsItem): any;
}

export type VItem = {
  __init__(g: Graph, v: int): any;
  refresh(): any;
}

export type TItem = {
  __init__(vitem: VItem, eitem: EItem, i: int, src: bool): any;
  refresh(): any;
}

export type GraphScene = {
  __init__(): any;
  set_graph(g: Graph): any;
  add_items(): any;
  mousePressEvent(e: QGraphicsSceneMouseEvent): any;
  mouseMoveEvent(e: QGraphicsSceneMouseEvent): any;
  mouseReleaseEvent(_: QGraphicsSceneMouseEvent): any;
}

export type GraphView = {
  __init__(): any;
  set_graph(g: Graph): any;
}

export type ChypHighlighter = {
  __init__(doc: QTextDocument): any;
  set_current_region(region: Optional<Tuple<int,int>>, status: int): any;
  highlightBlock(text: str): any;
}

export type MainWindow = {
  __init__(): any;
  remove_empty_editor(): any;
  update_file_name(): any;
  tab_changed(i: int): any;
  update_themes(): any;
  recent_files(): any;
  update_recent_files(): any;
  add_tab(ed: Editor, title: str): any;
  close_tab(): any;
  new(): any;
  open(): any;
  save(): any;
  save_as(): any;
  undo(): any;
  redo(): any;
  show_errors(): any;
  add_rewrite_step(): any;
  repeat_rewrite_step(): any;
  next_rewrite(): any;
  next_part(): any;
  previous_part(): any;
  next_tab(): any;
  previous_tab(): any;
  goto_import(): any;
  closeEvent(e: QCloseEvent): any;
  build_menu(): any;
}

export type Match = {
  __init__(): any;
  __str__(): any;
  copy(): any;
  try_add_vertex(domain_vertex: int, codomain_vertex: int): any;
  try_add_edge(domain_edge: int, codomain_edge: int): any;
  domain_neighbourhood_mapped(vertex: int): any;
  map_scalars(): any;
  more(): any;
  is_total(): any;
  is_surjective(): any;
  is_injective(): any;
  is_convex(): any;
}

export type Matches = {
  __init__(domain: Graph, codomain: Graph): any;
  __iter__(): any;
  __next__(): any;
}

export type RuleError = {
}

export type Rule = {
  __init__(lhs: Graph, rhs: Graph): any;
  copy(): any;
  converse(): any;
  is_left_linear(): any;
}

export type RewriteState = {
  __init__(sequence: int, state: State): any;
  check(): any;
}

export type State = {
  __init__(): any;
  part_with_index_at(pos: int): any;
  part_at(pos: int): any;
  var(items: List<Any>): any;
  module_name(items: List<Any>): any;
  num(items: List<Any>): any;
  type_element(items: list<Any>): any;
  type_term(items: list<tuple<str | None, int> | None>): any;
  id(items: list<Any>): any;
  id0(_: List<Any>): any;
  eq(_: List<Any>): any;
  le(_: List<Any>): any;
  perm_indices(items: list<int>): any;
  size_list(items: list<int>): any;
  par(items: List<Any>): any;
  gen_color(items: List<Any>): any;
  color(items: List<Any>): any;
  import_let(items: List<Any>): any;
  tactic(items: List<Any>): any;
  nested_term(items: List<Any>): any;
}

export type Tactic = {
  __init__(local_state: RewriteState, args: List<str>): any;
  repeat(rw: Callable<str[], bool>, rules: List<str>): any;
  error(message: str): any;
  has_goal(): any;
  global_rules(): any;
  lookup_rule(rule_expr: str): any;
  add_refl_to_context(graph: Graph, ident: str): any;
  add_rule_to_context(rule_name: str): any;
  __lhs(target: str): any;
  __rhs(target: str): any;
  __set_lhs(target: str, graph: Graph): any;
  __set_rhs(target: str, graph: Graph): any;
  rewrite_lhs(rule_expr: str): any;
  rewrite_rhs(rule_expr: str): any;
  rewrite_lhs1(rule_expr: str): any;
  rewrite_rhs1(rule_expr: str): any;
  validate_goal(): any;
  lhs(): any;
  rhs(): any;
  lhs_size(): any;
  rhs_size(): any;
  highlight_lhs(vertices: Set<int>, edges: Set<int>): any;
  highlight_rhs(vertices: Set<int>, edges: Set<int>): any;
  __reset(): any;
  next_rhs(current: str): any;
  run_check(): any;
  name(): any;
  check(): any;
  make_rhs(): any;
}

export type RuleTac = {
  name(): any;
  make_rhs(): any;
  check(): any;
}

export type SimpTac = {
  name(): any;
  __prepare_rules(): any;
  make_rhs(): any;
  check(): any;
}

