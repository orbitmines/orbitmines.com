import {Arbitrary, empty, JS, Ray} from "../../../explorer/Ray";
import { NotImplementedError } from "../../../explorer/errors/errors";
import {Option} from "../../../js/utils/Option";

/**
 * An interface from Aleks Kissinger's Chyp (Cospans of HYPergraphs) to Rays.
 * GitHub: https://github.com/akissinger/chyp
 *
 * A simple way of phrasing this conversion, is that the concept of a 'Vertex', 'Edge', 'Graph', 'Rule', ..., 'Rewrite' are merged into one thing: a Ray.
 *
 * NOTE:
 * This is just here for reference to the existing Chyp codebase - for anyone who understands that structure, to quickly translate that knowledge into how Rays work. - Other than that functionality, everything here should be considered as deprecated.
 *
 * TODO: There's a lot of duplicate code, unnecessary documentation and non-generality in Chyp. It was probably developed as a proof of concept? - Expecting that to be addressed in the projects Aleks Kissinger is currently setting up.
 *
 * TODO: Probably want all these types at runtime, to display them
 *
 * TODO: Graph boundary is automatic with this structure?
 *
 * TODO: merging vertex, just drawinf that one equivalence between initial/terminal etc..?? just leave the vertex?
 *
 * TODO: Methods, files, as wealonry selectuon along some linez simple name above, ..
 *
 * TODO: Can just move the terminal which holds the oointer to the boundary
 *
 * TODO: Automatically generate visual examples of all the methods
 *
 * TODO: Runtime errors as rays
 *
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

export class ValueError extends Error {}

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
export class GraphError extends Error {}
export class RuleError extends Error {}

/**
 * Used for debugging (the matcher)
 */
const DEBUG = true; // TODO; Generalize
const log = (s: string) => {
  if (!DEBUG)
    return;

  console.log(s);
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
   * TODO ; these are just the initial/terminal sides of a Ray. they're just duplicated
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
  __init__ = (): Ray => {
    this.highlight = bool(False);
    this.in_edges = set(int);
    this.out_edges = set(int);
    this.in_indices = set(int);
    this.out_indices = set(int);
  }


  is_input = (): Ray => this.in_indices.count() > 0;
  is_output = (): Ray => this.out_indices.count() > 0;
  is_boundary = (): Ray => this.is_input() || this.is_output();

  // TODO: Probably generalizable

  /**
   *
   * @param other
   */
  merge = (other: VData): Ray => {
    // TODO: other is destroyed
    // TODO: Vertices
    // this.initial().force().equivalent(other.initial().force());
    // this.terminal().force().equivalent(other.initial().force());

    throw new NotImplementedError();
  }

  fresh = (): VData => {
    // TODO: This is just a copy where this initial/terminal directionlaity is ignored. Only a copy of the vertex.

  }
}

/**
 * Data associated with a single edge.
 */
export class EData extends Ray {

  // TODO: this is just the initial frame
  get s(): Ray { throw new NotImplementedError(); }

  // TODO: this is just the terminal frame
  get t(): Ray { throw new NotImplementedError(); }


  get x(): Ray { throw new NotImplementedError(); }
  get y(): Ray { throw new NotImplementedError(); }
  get fg(): Ray { throw new NotImplementedError(); }
  get bg(): Ray { throw new NotImplementedError(); }
  get highlight(): Ray { throw new NotImplementedError(); }
  get hyper(): Ray { throw new NotImplementedError(); }
  get value(): Ray { throw new NotImplementedError(); }

  __init__ = (): Ray => {
    this.s = empty();
    this.t = empty();
    this.highlight = bool(False);
  }

  __repr__ = (): Ray => { throw new NotImplementedError();
  // TODO:   return f'Edge: {self.value} ({self.x}, {self.y})'
  }

  // TODO: More stuff to relate it to the screen that shouldnt be here.
  /**
   * Return how many width 'units' this box needs to display nicely.
   *
   * This uses a simple rule:
   *  - If the number of inputs and outputs are both <= 1, draw as a small (1 width unit) box.
   *  - Otherwise draw as a larger (size 2) box.
   */
  box_size = (): Ray => (this.s.count() <= 1 && this.t.count() <= 1) ? 1 : 2;

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

  // TODO: Can probably generate these on the fly, or cache them automatically
  get vindex(): Ray { throw new NotImplementedError(); }
  get eindex(): Ray { throw new NotImplementedError(); }

  __init__ = (): Ray => {
    this.vindex = 0;
    this.edindex = 0;
  }

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
  get domain(): Ray { return this.___domain(this.inputs()) };

  /**
   * Return the domain of the graph.
   *
   * This consists of a list of pairs (vertex type, register size) corresponding to each output vertex.
   */
  get codomain(): Ray { return this.___domain(this.outputs()) };

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

  // TODO: Shouldnt be here
  ___next_index = (name = int(-1), index: Ray): Ray => {
    // TODO: This is definitely going to be buggy if '-1' and certain specific values are used. (Hence the note above add_vertex & add_edge)
    const current = name === -1 ? index : Math.max(name, index);
    return current + 1;
  }

  /**
   * Add a new vertex to the graph.
   *
   * @param name The value carried by this vertex (currently unused).
   *   TODO: Generally this is just additional structure at the vertex, rays just implement this generally.
   * @param vertex The integer identifier to use for this vertex. If this is set to -1, the identifier is set automatically. (Note: no checks are currently made to ensure the identifier is not already in use).
   */
  add_vertex = (name = int(-1), vertex: VData): VData => {
    this.vindex = this.___next_index(name, this.vindex);

    this.vdata[this.vindex - 1] = vertex;
    return vertex;
  }

  /**
   * Add a new hyperedge to the graph.
   *
   * @param s
   * @param t
   */
  add_edge = (name = int(-1), edge: EData): EData => {
    this.eindex = this.___next_index(name, this.eindex);

    this.edata[this.eindex - 1] = edge;

    // TODO: Syncs the initial/terminal to the vertices (basically non-ignorant connection)
    // for v in s:
    // self.vdata[v].out_edges.add(e)
    // for v in t:
    // self.vdata[v].in_edges.add(e)

    return edge;
  }
  // add_simple_edge - is automatically handled: Rays can disambiguate between one/multiple values for certain purposes.

  /**
   * Remove a vertex from the graph.
   *
   * This removes a single vertex.
   * - If `strict` is set to True, then the vertex must have no adjacent edges nor be a boundary vertex.
   * - If `strict` is False, then `v` will be removed from the source/target list of all adjacent edges and removed from the boundaries, if applicable.
   *
   * @param v
   * @param strict If True, require the vertex to have no adjacent edges and not be a boundary vertex.
   */
  remove_vertex = (v = int, strict: boolean = false): Ray => {
    // TODO: destroy any reference of it (could just do this lazy)
    // TODO: as delegation

    if (strict) {
      if (this.vertex_data(v).in_edges.count() > 0 || this.vertex_data(v).out_edges > 0) {
        throw new ValueError('Attempting to remove vertex with adjacent'
          + 'edges while strict == True.');
      }

      if (this.inputs().includes(v) || this.outputs.includes(v)) {
        throw new ValueError('Attempting to remove boundary vertex while'
          + 'strict == True.');

      }// TODO CAN BE SIMPLIFIED
    }

    // in/out edges from all vertices
    delete this.vdata[v];
  }

  /**
   * Remove an edge from the graph.
   *
   * @param e Integer identifier of the edge to remove.
   */
  remove_edge = (e = int): Ray => {
    // TODO: destroy any reference of it (could just do this lazy)
    // in/out edges from all vertices
    delete this.edata[e];
  }

  // TODO: Can these be overlaoded in properties using -=, += in TS?

  /**
   * Append `inp` to the inputs of the graph.
   *
   * @param inp The list of vertex integer identifiers of the appended inputs.
   */
  add_inputs = (inp = list(int)): Ray => {
    this.inputs().continues_with(inp); // TODO: Perhaps splat
  }
  /**
   * Append `outp` to the outputs of the graph.
   *
   * @param outp The list of vertex integer identifiers of the appended outputs.
   */
  add_outputs = (outp = list(int)): Ray => {
    this.outputs().continues_with(outp); // TODO: Perhaps splat
  }
  // TODO; these are then again duplicated to    self.vdata[v].out_indices.add(i)


  // TODO: These are just one possibly ignorant ray through the initial/terminal ends which aren't matched - could just generate these on the fly, or similar to chyp add when added.

  // Return the list of vertex ids of the graph inputs.
  get inputs(): Ray { throw new NotImplementedError(); }
  // Return the list of vertex ids of the graph outputs.
  get outputs(): Ray { throw new NotImplementedError(); }

  // TODO: Clears the matched in/out indices, then sets them to the ones found in in/outputs
  set inputs(ray = list(int)) { throw new NotImplementedError(); }
  set outputs(ray = list(int)) { throw new NotImplementedError(); }

  // TODO: Move these to a "reference-like" structure, need to be on VData..

  /**
   * These are all just slightly differently abstracted in TypeScript here to make them a little more native.
   */
  set_inputs = (inp = list(int)): Ray => this.inputs = inp;
  set_outputs = (outp = list(int)): Ray => this.outputs = outp;

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

  /**
   * Return vertices that lie on a directed path from any of `vs`.
   * @param vs
   */
  successors = (vs = Iterable(int)): Ray => {
    // TODO: Just traverse the rays, deduplicate using the index, where vs is one or more (so again which part of the ray is selected).


    throw new NotImplementedError();
  }

  /**
   * Form the quotient of the graph by identifying v with w. Afterwards, the quotiented vertex will be have integer identifier `v`.
   *
   * @param v Integer identifier of the vertex into which to merge `w`.
   * @param w Integer identifier of the vertex to merge into `v`.
   */
  merge_vertices = (v = int, w = int): Ray => this.vertex_data(v).merge(this.vertex_data(w));

  /**
   * Split a vertex into copies for each input, output, and tentacle.
   *
   * This is used for computing pushout complements of rules that aren't left-linear.
   * (See arXiv:2012.01847 Section 3.3 for definition of left-linear).
   *
   * Returns: A pair of lists containing the new input-like and output-like vertices, respectively.
   *
   * @param v Integer identifier of vertex to be exploded.
   */
  explode_vertex = (v = int): Ray => {
    const vertex = this.vertex_data(v);

    // TODO; This just seems like another copy which minor changes

    const next_inputs = empty();
    const next_outputs = empy();

    const fresh = (j: VData) => {

    }

    // Replace any occurrences of the original vertex in the graph inputs with a new input-like vertex.
    //  self.set_inputs([v1 if v1 != v else fresh(0) for v1 in self.inputs()])
    // TODO: Basically a copy, and replace this one vertex

    // Where the original vertex is the target of a hyperedge, replace its occurence in the hyperedge's target list with a new input-like vertex and register this with the new vertex's data instance.

    vertex.in_edges.all(e => {
      const edge: EData = e.cast();

      edge.t = edge.t
        .map(target => {
          if (target === v)
            return target;

          next_inputs.add(this.add_vertex(vertex.fresh()))
          this.vertex_data(target).in_edges.add(edge);
        })
    })

  }


  insert_id_after = (v = int): Ray => { throw new NotImplementedError(); }
  tensor = (other = Graph): Ray => { throw new NotImplementedError(); }
  __mul__ = (other = Graph): Ray => { throw new NotImplementedError(); }
  compose = (other = Graph): Ray => { throw new NotImplementedError(); }
  __rshift__ = (other = Graph): Ray => { throw new NotImplementedError(); }

  /**
   * Set the `highlight` flag for a set of vertices and edges.
   *
   * This tells the GUI to visually highlight a set of vertices/edges, e.g. by drawing them in bold. Any vertices/edges not in the sets provided will be un-highlighted.
   *
   * @param vertices A set of vertices to highlight.
   * @param edges A set of edges to highlight.
   */
  highlight = (vertices = set(int), edges = set(int)): Ray => {
    // TODO Again, these could be merged
    this.vdata
      .filter(vertex => vertices.includes(vertex))
      .all(vertex => vertex.cast<VData>().highlight = bool(true));
    this.edata
      .filter(edge => edges.includes(edge))
      .all(edge => edge.cast<EData>().highlight = bool(true));
  }

  /**
   * Clear the `highlight` flag for all vertices/edges.
   *
   * This is equivalent to calling :func:`highlight` with empty sets of vertices/edges.
   */
  unhighlight = (): Ray => {
    // TODO: These could be merged
    this.vdata
      .all(vertex => vertex.cast<VData>().highlight = bool(false));
    this.edata
      .all(edge => edge.cast<EData>().highlight = bool(false));
  }
}

export class Chyp extends Ray {
  __init__ = (): Ray => { throw new NotImplementedError(); }

  /**
   * Load a .chyp graph file from the given path.
   */
  load_graph = (path = str) => {
    // TODO: From localStorage for now?
    // with open(path) as f:
    // g = graph_from_json(f.read())
  }

  /**
   * Return a graph corresponding to the identity map.
   *
   * This graph has a single vertex which is both an input and an output.
   */
  identity = (vertex: VData): Graph => {
    const graph = new Graph();

    vertex.x = 0; // TODO automatic>?
    vertex.y = 0;
    graph.add_vertex(int(-1), vertex);
    // TODO synce input/output automatically?
    //    g.set_inputs([v])
    //     g.set_outputs([v])

    return graph;
  }


  ___map_domain = (domain: Ray, _default: VData): Ray => {
    return domain.map(([vtype, size], i) => {
      const vertex: VData = _default.copy().cast();
      // TODO: These should be automatic somewhere, again abstract the place where it's displayed elsewhere
      vertex.x = -1.5;
      vertex.y = i - (i-1) / 2;

      return vertex;
    })
  }

  /**
   * Return a graph with one hyperedge and given domain and codomain.
   *
   * @param _default
   * @param domain - A list of pairs (vertex type, register size) corresponding to each input vertex.
   * @param codomain - A list of pairs (vertex type, register size) corresponding to each output vertex.
   */
  gen = (_default: VData, domain: Ray, codomain: Ray): Graph => {
    const graph = new Graph();

    const inputs = this.___map_domain(domain, _default)
      .map(vertex => graph.add_vertex(vertex));
    const outputs = this.___map_domain(codomain, _default)
      .map(vertex => graph.add_vertex(vertex));

    // TODO This is probably automatic at some point, remove
    const edge = new EData();
    edge.s = inputs;
    edge.t = outputs;
    graph.add_edge(int(-1), edge);
    // g.set_inputs(inputs)
    //     g.set_outputs(outputs)

    return graph;
  }

  /**
   * Return a graph corresponding to the given permutation.
   *
   * This takes a permution, given as a list [x0,..,x(n-1)], which is interpreted as the permutation { x0 -> 0, x1 -> 1, ..., x(n-1) -> n-1 }. It produces a graph consisting just of vertices, where input xj is mapped to the same vertex as output j, representing an identity wire connecting input xj to output j.
   *
   * Note this is one of two reasonable conventions for specifying a permutation as a list of numbers. This one has the property, e.g. for graphs aj : 0 -> 1, we have: (a0 * a1 * a2) >> perm([2, 0, 1]) = a2 * a0 * a1.
   *
   * @param p A permutation given as an n-element list of integers from 0 to n-1.
   * @param domain The domain type of the permutation. This consists of a list of pairs (vertex type, register size) corresponding to each input vertex of the edge. If `None`, the domain is assumed to be the  appropriate number of default type vertices all with register size 1.
   */
  perm = (p = list(int), domain: Ray, _default: VData) => {

    const graph = new Graph();
    const num_wires = p.count();

    if (num_wires !== domain.count())
      throw new GraphError(`Domain ${domain} does not match length of permutation.`)

    // TODO use ___map_domain
    const inputs = domain.map(([vtype, size], i) => {
        const vertex: VData = _default.copy().cast();
        // TODO: These should be automatic somewhere, again abstract the place where it's displayed elsewhere
        vertex.x = 0;
        vertex.y = i - (num_wires - 1) / 2;

        return vertex;
      })
      .map(vertex => graph.add_vertex(vertex));
    // const outputs = num_wires.range(i => [inputs[p[i]])

    // TODO Should be automatic
    // g.set_inputs(inputs)
    //  g.set_outputs(outputs)
    return graph;
  }

  graph_from_json = (json_string = str): Graph => {
    const json = JSON.parse(json_string().as_string()); // TODO

    const graph = new Graph();

    // TODO: Don't do this so naively
    //         g.add_vertex(x=float(vd["x"] if "x" in vd else 0.0),
    //                      y=float(vd["y"] if "y" in vd else 0.0),
    //                      value=vd["value"] if "value" in vd else "",
    //                      name=int(v))
    //     for e, ed in j["edges"].items():
    //         g.add_edge(s=[int(v) for v in ed["s"]],
    //                    t=[int(v) for v in ed["t"]],
    //                    value=ed["value"] if "value" in ed else "",
    //                    x=float(ed["x"]) if "x" in ed else 0.0,
    //                    y=float(ed["y"]) if "y" in ed else 0.0,
    //                    hyper=bool(ed["hyper"]) if "hyper" in ed else True,
    //                    name=int(e))
    //
    //     g.set_inputs([int(v) for v in j["inputs"]])
    //     g.set_outputs([int(v) for v in j["outputs"]])
    // json.vertices.forEach(((vertex, i) => graph.add_vertex(
    //   i,
    //   new VData()
    // ));

    return graph;
  }

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

// TODO ISNT A MATCH JUST AN IGNORANT COPY ON BOTH SIDES???
export class Match extends Ray {

  get domain(): Graph { throw new NotImplementedError(); }
  get codomain(): Graph { throw new NotImplementedError(); }
  get vertex_map(): Ray { throw new NotImplementedError(); }
  get vertex_image(): Ray { throw new NotImplementedError(); }
  get edge_map(): Ray { throw new NotImplementedError(); }
  get edge_image(): Ray { throw new NotImplementedError(); }

  __init__ = (): Ray => { throw new NotImplementedError(); }
  __str__ = (): Ray => {
    // (f'\tVertex map: {str(self.vertex_map)}'
    //                 + f'\n\tEdge map: {str(self.edge_map)}')
    // TODO
    throw new NotImplementedError(); }

  // Implemented on Ray
  // TODO; doesnt copy the graphs at domain/codomain
  // copy = (): Ray => { throw new NotImplementedError(); }

  /**
   * Try to map `domain_vertex` to `codomain_vertex`.
   *
   * This map must satisfy various conditions, such as only being allowed to be non-injective on the boundary domain vertices.
   *
   * Returns: `True` if either a consistent map from `domain_vertex` to  already exists or the new map is consistent and satisfies the gluing conditions, otherwise `False`.
   */
  try_add_vertex = (domain_vertex: VData, codomain_vertex: VData): Ray => {

    // If the vertex is already mapped, only check the new mapping is consistent with the current match.
    if (this.vertex_map.includes(domain_vertex)) {
      log(`Vertex already mapped to ${this.vertex_map[domain_vertex]}.`)
      return this.vertex_map[domain_vertex] === codomain_vertex;
    }

    // TODO: ALL THESE SHOULD JUST BE AN EQUIVALENCY CHECK, JUST LIKE MATCHING/// - You can't actually guarantee consistency, it's just a simple ignorant check. - We can probably just remove this as soon as the equivalency check is implemented.
    // TODO: This should all be redundant, probably removed ...

    // Ensure the mapping preserves vertex type.
    if (domain_vertex.vtype !== codomain_vertex.vtype) {
      log(`Vertex failed: vtypes ${domain_vertex.vtype} != ${codomain_vertex.vtype} do not match.`);

      return bool(False);
    }

    // Ensure the mapping preserves vertex size.
    if (domain_vertex.size !== codomain_vertex.size) {
      log(`Vertex failed: sizes ${domain_vertex.size} != ${codomain_vertex.size} do not match.`)
      return bool(False);
    }

    // Ensure non-boundary vertices in the domain are not mapped to boundary vertices in the codomain.
    if (!codomain_vertex.is_boundary() && !domain_vertex.is_boundary()) {
      log('Vertex failed: codomain vertex is boundary but domain vertex is not.')
      return bool(False);
    }

    // Matches must be injective everywhere except the boundary, so if the domain vertex is already mapped to another codomain vertex, check whether this non-injective mapping is permitted.
    if (this.vertex_image.includes(codomain_vertex)) {
      // If the domain vertex we are trying to add is not a boundary vertex, it cannot be used in a non-injective mapping.
      if (!domain_vertex.is_boundary()) {
        log('Vertex failed: non-injective on interior vertex.')
        return bool(False);
      }

      // If any vertices already mapped to the codomain vertex, they must also be boundary vertices for an allowed non-injective mapping.
      if (this.vertex_image.any(([mapped_vertex, image_vertex]) =>
        image_vertex === codomain_vertex && !mapped_vertex.is_boundary() // TODO mapped_vertex on domain!!
      )) {
        log('Vertex failed: non-injective on interior vertex.')
        return bool(False);
      }

      return bool(False);
    }

    // If a new and consistent map is found, add it to the vertex map of this match.
    this.vertex_map[domain_vertex] = codomain_vertex
    this.vertex_image.add(codomain_vertex)

    // Unless the domain vertex is a boundary vertex, check that the number of adjacent edges of the codomain vertex is the same as the number for the domain vertex. Because matchings are required to be injective on edges, this will guarantee that the gluing conditions are satisfied.

    if (!domain_vertex.is_boundary()) {
      if (domain_vertex.in_edges.count() !== codomain_vertex.in_edges.count()) {
        log('Vertex failed: in_edges cannot satisfy gluing conditions.')
        return bool(False)
      }
      if (domain_vertex.out_edges.count() !== codomain_vertex.out_edges.count()) {
        log('Vertex failed: in_edges cannot satisfy gluing conditions.')
        return bool(False)
      }
    }

    // If a new consistent map is added that satisfies the gluing conditions, we are successful.
    log('Vertex success.')
    return bool(True);
  }

  try_add_edge = (domain_edge = int, codomain_edge = int): Ray => { throw new NotImplementedError(); }
  domain_neighbourhood_mapped = (vertex = int): Ray => { throw new NotImplementedError(); }
  map_scalars = (): Ray => { throw new NotImplementedError(); }
  more = (): Ray => { throw new NotImplementedError(); }
  is_total = (): Ray => { throw new NotImplementedError(); }
  is_surjective = (): Ray => { throw new NotImplementedError(); }
  is_injective = (): Ray => { throw new NotImplementedError(); }
  is_convex = (): Ray => { throw new NotImplementedError(); }

  /**
   * TODO Not implemented;;
   *     # def cod_nhd_mapped(self, cod_v: int):
   *     #     """Returns True if nhd(cod_v) is the range of emap"""
   *     #     return (all(e in self.eimg for e in self.cod.in_edges(cod_v)) and
   *     #             all(e in self.eimg for e in self.cod.out_edges(cod_v)))
   */
}

export class Matches extends Ray {
  __init__ = (domain = Graph, codomain = Graph): Ray => { throw new NotImplementedError(); }
  __iter__ = (): Ray => { throw new NotImplementedError(); }
  __next__ = (): Ray => { throw new NotImplementedError(); }
}

export class Rule extends Ray {
  get lhs(): Graph { throw new NotImplementedError(); }
  get rhs(): Graph { throw new NotImplementedError(); }

  /**
   * TODO: Put the name on each side of the rule, not the '-' hacky thing
   */
  get name(): Ray { throw new NotImplementedError(); }
  get equiv(): Ray { throw new NotImplementedError(); }

  __init__ = (name = str(''), equiv = bool(True)): Ray => {
    // TODO: Maybe just move exception to a method on this thing

    if (this.lhs.domain !== this.rhs.domain) // TODO: !==
      throw new RuleError(`Inputs must match on LHS and RHS of rule (${this.rhs.domain} != ${this.lhs.domain})`);

    if (this.lhs.codomain !== this.rhs.codomain)
      throw new RuleError(`Outputs must match on LHS and RHS of rule (${this.rhs.codomain} != ${this.lhs.codomain})`)


    throw new NotImplementedError();

  }

  copy = (): Ray => { throw new NotImplementedError(); }

  // TODO: Could put this on ray, generalize to swapping
  converse = (): Rule => {
    // TODO remove this hacky thing - just tries to us -a / a
    const name = this.name.as_string().startsWith('-') ? this.name.substring(1) : `-${this.name}`;

    const converse: Rule = this.copy().cast(); // TODO equiv=True?
    converse.name = name;

    // TODO: Wont work, we just should swap initial/terminal;\
    //swap?? or change direction..
    // const swap = converse.rhs;
    // converse.rhs = converse.lhs;
    // converse.lhs = swap;
    return converse;
  }

  /**
   * Returns True if boundary on lhs embeds injectively
   */
  is_left_linear = (): Ray => {
    // TODO, needs to implement splat and stuff? or by default, could be done smarter, but again no overloading
    return !JS.Iterable([...this.lhs.inputs, ...this.rhs.outputs]).as_ray().force()
      .has_duplicates() // TODO; This thing is basically asking whether any input is used twice, whether any output is used twice, or there's a circle between in/output? Basically: NO SELF-REFERENCE, this should be a very sikmple check whether any frame is used twice here - or some loop is found basically.
  }

  /**
   * Do double-pushout rewriting
   *
   * Given a rule r and match of r.lhs into a graph, return a match of r.rhs into the rewritten graph.
   * @param match
   */
  dpo = (match: Match): Ray => {
    // if (!this.is_left_linear())
    //   throw new NotImplementedError("Only left linear rules are supported for now")

    const rewritten_graph: Graph = match.codomain.copy();

    // TODO: This will definitely be rewritten, this is an ugly implementation. Just draw the lines and be ignorant in that direction ??? Probably just implement it as additional filtering on .copy()???

    // Computes the push complement ?? (just the thing we're replacing right?)
    // TODO: Removes the match from the copy?
    this.lhs.edges().all(edge => rewritten_graph.remove_edge(match.edge_map(edge)));

    const inputs = [];
    const outputs = [];

    this.lhs.vertices().all(rule_vertex => {
      const match_vertex = match.vertex_map[rule_vertex];

      if (!this.lhs.is_boundary(rule_vertex)) {
        rewritten_graph.remove_vertex(match_vertex);
        return;
      }

      const rule_input = this.lhs.vertex_data(rule_vertex).in_indices;
      const rule_output = this.lhs.vertex_data(rule_vertex).out_indices;

      if (rule_input.count() === 1 && rule_output === 1) {
        const [match_input, match_output] = rewritten_graph.explode_vertex(match_vertex);

        if (match_input.count() !== 1 && match_output.count() !== 1)
          throw new NotImplementedError("Rewriting modulo Frobenius not yet supported.");

        inputs[rule_vertex] = match_input[0];
        outputs[rule_vertex] = match_output[0];
      } else if (rule_input.count() > 1 || rule_output.count() > 1) {
        throw new NotImplementedError("Rewriting modulo Frobenius not yet supported.");
      }
    })

    // Embed Rule.rhs into rewritten_graph
    const replacement = new Match(this.rhs, rewritten_graph);

    return replacement;
  }

  /**
   * Apply the given rewrite r to at match m and return the first result
   *
   * This is a convience wrapper for `dpo` for when the extra rewrite data isn't needed.
   */
  rewrite = (match: Match): Graph => {
    // TODO:     except StopIteration:
    //         raise RuntimeError("Rewrite has no valid context")

    const result: Match = this.dpo(match).first().cast();
    return result.codomain;
  }
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

