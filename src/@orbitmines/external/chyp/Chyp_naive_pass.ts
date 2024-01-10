import {JS, Ray} from "../../explorer/Ray";
import {NotImplementedError} from "../../explorer/errors/errors";

/**
 * - The .copy()'s are implemented on Ray.
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
 * TODO: All the more complicated methods should be simply implemented in a ray which walks an arbitary graph
 */
/**
 * TODO: These coordinates used for inferences?
 * - If not then this is probably a hack and should be interpreted as "on another layer of description which is the GUI"
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

export const Color = (t1: Ray = str('')): Ray => { throw new NotImplementedError() };

export class ValueError extends Error {}

/**
 * Non-default vertex types are identified by a string label
 *
 * str() | None() - No overloading in TypeScript ;(
 */
export const VType = JS.Iterable([str, None]);

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
  vtype = this.property('vtype', None);

  // The register size (number of bundled parallel wires) of the vertex.
  size = this.count; // Implemented on Ray.count

  // TODO: These infers will probably be removed?
  // Whether to infer the vertex type during composition. Used for special generators (identities, permutations, redistributers).
  infer_type = this.property('infer_type', bool(False))
  // Whether to infer the vertex size during composition. Used for special generators (identities, permutations,  redistributers).
  infer_size = this.property('infer_size', bool(False))

  // x-coordinate at which to draw the vertex.
  x = this.property('y', int(0))
  // y-coordinate at which to draw the vertex.
  y = this.property('y', int(0))

  highlight = this.property('highlight', bool(False))
  value = this.property('value')

  /**
   * Indices (if any) where this vertex occurs in the input and output lists of the hypergraph.
   */
  get in_indices(): Ray { return this.initial } //
  get out_indices(): Ray { throw new NotImplementedError(); }

  is_input = (): Ray => this.in_indices.count.as_int() > 0;
  is_output = (): Ray => this.out_indices.count.as_int() > 0;
  is_boundary = (): Ray => this.is_input() || this.is_output();

  // TODO: Probably generalizable

  /**
   * Form the quotient of the graph by identifying v with w. Afterwards, the quotiented vertex will be have integer identifier `v`.
   */
  merge = (other: VData): Ray => {
    // TODO: other is destroyed
    // TODO: Vertices
    // this.initial.equivalent(other.initial);
    // this.terminal.equivalent(other.initial);

    /*

            vd = self.vertex_data(v)
        # print("merging %s <- %s" % (v, w))

        # Where vertex `w` occurs as an edge target, replace it with `v`
        for e in self.in_edges(w):
            ed = self.edge_data(e)
            ed.t = [v if x == w else x for x in ed.t]
            vd.in_edges.add(e)

        # Where vertex `w` occurs as an edge source, replace it with `v`
        for e in self.out_edges(w):
            ed = self.edge_data(e)
            ed.s = [v if x == w else x for x in ed.s]
            vd.out_edges.add(e)

        # Wherever `w` occurs on the graph boundary, replace it with `v`
        self.set_inputs([v if x == w else x for x in self.inputs])
        self.set_outputs([v if x == w else x for x in self.outputs])

        # Remove references to `w` from the graph
        self.remove_vertex(w)

     */

    throw new NotImplementedError();
  }

  fresh = (): VData => {
    // TODO: This is just a copy where this initial/terminal directionlaity is ignored. Only a copy of the vertex.

      // vtype=vd.vtype, size=vd.size,
      // x=vd.x, y=vd.y, value=vd.value

  }

  // TODO: Shouldn't be here, this should be implemented on Ray if it's general enough
  get domain(): Ray { return JS.Iterable([this.vtype, this.size]) };

}

export class EData extends Ray {

  fg = this.property('bg', Color());
  bg = this.property('bg', Color());
  x = this.property('y', int(0));
  // y-coordinate at which to draw the vertex.
  y = this.property('y', int(0));
  highlight = this.property('highlight', bool(False))
  hyper = this.property('value', bool(True))
  value = this.property('value')

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
  box_size = (): Ray => JS.Number((this.s.count.as_int() <= 1 && this.t.count.as_int() <= 1) ? 1 : 2);

  domain = (): Ray => this.source.cast<VData>().domain;
  codomain = (): Ray => this.target.cast<VData>().domain;

  toString = (): string => this.__repr__().as_string(); // TODO; FOR ALL
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

  get vindex(): Ray { return this.vdata.index.max(0); }
  get eindex(): Ray { return this.edata.index.max(0); }

  // Mapping from integer identifiers of each vertex to its data.
  vdata = this.property('vertices');
  // Mapping from integer identifiers of each hyperedge to its data.
  edata = this.property('edges');

  // TODO .keys
  vertices = this.property('vertices');
  edges = this.property('edges');

  /**
   * Return the domain of the graph.
   *
   * This consists of a list of pairs (vertex type, register size) corresponding to each input vertex.
   */
  // TODO: Domain/Codmain is just the initial/terminal side (possibly typed) where the direction which is what defines what it itself is connected to, is ignored.
  get domain(): Ray { return this.inputs.cast<VData>().domain; };

  /**
   * Return the domain of the graph.
   *
   * This consists of a list of pairs (vertex type, register size) corresponding to each output vertex.
   */
  get codomain(): Ray { return this.outputs.cast<VData>().domain; };

  vertex_data = (v = int): VData => this.vertices().at(v).cast();
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
      if (this.vertex_data(v).in_edges.count.as_int() > 0 || this.vertex_data(v).out_edges > 0) {
        throw new ValueError('Attempting to remove vertex with adjacent'
          + 'edges while strict == True.');
      }

      if (this.inputs.includes(v) || this.outputs.includes(v)) {
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




  // TODO: These are just one possibly ignorant ray through the initial/terminal ends which aren't matched - could just generate these on the fly, or similar to chyp add when added.



  // set function:
  // TODO: Clears the matched in/out indices, then sets them to the ones found in in/outputs
  // inputs =, outputs =
  // for the add functions: // TODO: Perhaps splat
  // also for add   // TODO; these are then again duplicated to    self.vdata[v].out_indices.add(i)


  /**
   * Return vertices that lie on a directed path from any of `vs`.
   * // TODO: Just traverse the rays, deduplicate using the index
   */
  successors = (ray: Ray): Ray => ray.next;

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
    const next_outputs = empty();

    const __temp = ( // TODO This whole bit of code will definitely be reduced to one line at some point in this process
      vertex: VData,
      boundary: (vertex: VData) => Ray,
      next_boundary: Ray
    ) => {
      // TODO: It's just a duplicated process for vertex/edge since their definition is separataed

      // Replace any occurrences of the original vertex in the graph inputs with a new input-like vertex.
      //  self.set_inputs([v1 if v1 != v else fresh(0) for v1 in self.inputs])
      // TODO: Basically a copy, and replace this one vertex

      // Where the original vertex is the target of a hyperedge, replace its occurrence in the hyperedge's target list with a new input-like vertex and register this with the new vertex's data instance.
      boundary(vertex).all(e => {
        const edge: EData = e.cast();

        edge.t = edge.t
          .map(target => {
            if (target === v)
              return target;

            const fresh_vertex = vertex.fresh();
            next_boundary.add(this.add_vertex(fresh_vertex))
            boundary(fresh_vertex).add(edge);
          })
      });

    }

    // TODO: It's always just duplicated for both ends,
    __temp(vertex, (vertex) => vertex.in_edges, next_inputs);
    __temp(vertex, (vertex) => vertex.out_edges, next_outputs);

    // Register the fact that `v` no longer occurs in as a source or target of any hyperedge.
    vertex.in_edges.clear(); // TODO; Should basically just reset initial/terminal
    vertex.out_edges.clear();

    // Remove `v` from the hypergraph, using strict == True to catch any errors (no errors should be raised with current code).
    this.remove_vertex(vertex, true);

    return [next_inputs, next_outputs];
  }


  /**
   * Insert a new identity hyperedge after the given vertex.
   *
   * A new vertex is also created, which replaces the original vertex as the source of any edges in graph as well as any occurrences of the original vertex in the graph outputs.
   *
   * @param reverse
   *  - If `False`, the original vertex becomes the source of the ew identity hyperedge while the new vertex becomes the target.
   *  - If `True`, the source and target of the new identity are flipped. This can be used to break directed cycles, by neffectively introducing a cap and cup.
   */
  insert_id_after = (v = int, reverse = bool(False)): Ray => {
    const vertex = this.vertex_data(v);

    // Create a new vertex with the same vtype and size
    // //TODO ; Which is this .fresh
    const new_vertex = vertex.fresh();
    new_vertex.x += 3;
    // The new vertex is highlighted whenever the orignal vertex is.
    new_vertex.highlight = vertex.highlight; // TODO: This not done by .fresh?

    /**
     * //TODO: BEcause it's inserted after, set the output (generalize to just moving the reference to the terminal.
     *     # Replace any occurences of the original vertex in the graph outputs
     *         # with the new vertex.
     *         self.set_outputs([x if x != v else w for x in self.outputs()])
     */

    // Where the original vertex is the source of a hyperedge, replace it with the new vertex and register this change with the data instance of each vertex
    // TODO syncs the out_edges fields,       wd.out_edges.add(e)  vd.out_edges.clear()
    // TODO replace out_edges.source to new_vertex again

    // Assign the orignal and new vertex as source or target of the new identity edge, based on the `reverse` argument.
      // TODO: Sets reverse just flipping around the initial/terminal..
    // TODO: s, t = ([v], [w]) if not reverse else ([w], [v])

    // Create the new identity edge.
    const edge = this.add_edge() // s, t, 'id', vd.x + 1.5, vd.y)
    edge.hightlight = vertex.highlight; // The new edge is highlighted whenever the original vertex is.

    return edge;
  }

  /**
   * Take the monoidal product of this graph in-place with another.
   *
   * Calling g.tensor(h) will turn g into g ⊗ h, performing the operation in-place. Use the infix version `g @ h` to simply return the tensor product without changing g.
   *
   * @param other
   * @param layout If `True`, compute new y-coordinates of the vertices and edges of the resulting graph so that the two graphs in the tensor product are adjacent with no overlap in the y-direction.
   */
  tensor = (other: Graph, layout: boolean = true): Ray => {

    const a = this;
    const b = other;

    const tensor: Ray = new Ray(); // TODO: [initial = a.outputs, terminal = b.inputs]

    tensor.initial.any.y -=
      tensor.initial.any.y.max(); // max_self

    tensor.terminal.any.y -=
      (layout ? tensor.terminal.any.y.min() : 0) + 1; // min_other TODO: Why + 1 ?

    /**
     *         # self.set_inputs(self.inputs + [vmap[v] for v in other.inputs])
     *         # self.set_outputs(self.outputs + [vmap[v] for v in other.outputs])
     *
     *         # Add the inputs and outputs of the other graph to this one.
     *         self.add_inputs([vmap[v] for v in other.inputs])
     *         self.add_outputs([vmap[v] for v in other.outputs])
     */
    // TODO: Add equivalence/reference on the inputs/output extremes.
  }

  /**
   * Sequentially compose this graph in-place with another.
   *
   * Calling g.compose(h) will turn g into g ; h, performing the operation in-place. Use the infix version `g >> h` to simply return the sequential composition without changing g.
   */
  compose = (other: Graph): Ray => {
    // TODO Just matching outputs and inputs..

    const a = this;
    const b = other;

    // TODO: Simply visualized, as a single thing "us composing this thing", where on the initial side, we have the outputs of one thing, which we're trying to one-to-one match to the terminal side"
    const compose: Ray = new Ray(); // TODO: [initial = a.outputs, terminal = b.inputs]

    // Check that codomain of this graph matches the domain of the other: this is required for valid sequential composition.

    // TODO: This is just again an equivalence type check on the ends of the ray

    // TODO: min/max needs to be on vertices/edges. Not necessarilyt outputs/inputs

    {
      if (compose.initial.count.as_int() !== compose.terminal.count.as_int())
        throw new GraphError(`Codomain ${a.codomain()} does not match domain ${b.domain()}`); // TODO ; a/b ref will be removed

      /**
       *      for output_id, input_id in zip(self_outputs, other_inputs):
       *             output_data = self.vertex_data(output_id)
       *             input_data = other.vertex_data(input_id)
       *             if output_data.vtype != input_data.vtype:
       *                 if not (output_data.infer_type or input_data.infer_type):
       *                     raise GraphError(
       *                         f'Codomain {self.codomain()} does not '
       *                         + f'match domain {other.domain()}'
       *                     )
       *             if output_data.size != input_data.size:
       *                 if not (output_data.infer_size or input_data.infer_size):
       *                     raise GraphError(
       *                         f'Codomain {self.codomain()} does not '
       *                         + f'match domain {other.domain()}'
       *                     )
       */
    }

    /**
     * Basically, seeing the {compose} line x=0, and them moving outputs (left) to the negative x. And moving the inputs (right) to the positive x.
     */

    // Compute the max x-coordinate of the edges and vertices in this graph.

    // TODO: Again, recursively going through everything defined on the initial side (outputs)
    // Shift all vertices and edges of this graph below the x-axis.
    compose.initial.any.x -=
      compose.initial.any.x.max(); // max_self

    // TODO: It's indeed copying here, as b_copy, abstract this away [SHOULD BE A COPY]
    compose.terminal.any.x -=
      compose.terminal.any.x.min(); // min_other

    // TODO: This check in the Chyp code is just done after the [terminal].copy() which we haven't implemented yet.
    /**
     * plug1 = self.outputs
     * plug2 = [vmap[v] for v in other.inputs]
     *
     * if len(plug1) != len(plug2):
     *             raise GraphError(f'Attempting to plug a graph with {len(plug1)} '
     *                              + f'outputs into one with {len(plug2)} inputs')
     *
     *   self.set_outputs([vmap[v] for v in other.outputs])
     */

    // [outputs to inputs]
    // Go through pairs of vertices from each plug
    compose.zip().all(([input, output]) => {
      /**
       * While vertex currently assigned to p1 has already been merged into another vertex, repeatedly replace it with the vertex it was merged into until p1 is a vertex that has not already been merged. Vice versa for p2.
       */

      // TODO: does this ever happen???
      // while p1 in quotient:
      // p1 = quotient[p1]
      // while p2 in quotient:
      // p2 = quotient[p2]


      // TODO, Again the same equivalence check for loops etc..
      {
        // If the resulting p1 and p2 are not the same vertex, merge them.
        if (input === output)
          return;

        // TODO; DO this on the vertices;
        // data_1 = self.vertex_data(p1) data_2 = self.vertex_data(p2)

        // If both vertices have flexible types that are not equal, raise an error due to ambiguity.
        // TODO: Basically, if we're assuming there could be ignorance here, which we wouldn't do on the types. Again, the types necessarily have ambiguity as well, it's just ignored in that instance.


        // TODO: From here assumes same types, now just checking size (size should again be generalized to type), it's just structure.

        ['vtype', 'size'].forEach(structure => {
          const infer = `infer_${structure}`;

          if (input[infer] && output[infer] && input[structure] !== output[structure]) {
            throw GraphError(`Ambiguous vertex ${structure} during composition.`)

          } else if (input[infer]) {
            // Otherwise, if one vertex has a flexible type, ensure the vertex types match.
            // TODO: Infer type = true, basically means, ignorant ambiguous type, which will just change to whatever it matched to it
            // TODO: Again both sides same thing..
            input[structure] = output[structure]; // TODO: Generalized structure
            input[infer] = false;
          } else if (output.infer_type) {
            output[structure] = input[structure];
            output[infer] = false;
          }
        });

        input.merge(output);
      // # Register than p2 has been merged into p1.
      //   quotient[p2] = p1
      }
    });
  }

  /**
   * Return the tensor product of this graph with another.
   *
   * This does not modify either of the original graphs. TODO: Again this sort of thing should be abstracted elsewhere on what to do with them
   */
  __mul__ = (other: Graph): Ray => this.___something_something_copy(other, (a, b) => a.tensor(b));

  /**
   * Return the composition of the current graph with `other`.
   *
   * Composition is done in diagram order (`other` comes after `self`), and neither of the two graphs are modified.
   * @param other
   */
  __rshift__ = (other: Graph): Ray => this.___something_something_copy(other, (a, b) => a.compose(b));

  /**
   * TODO: These are just simple delegations of a single method on copies.. ; requires a nice abstraction layer
   */
  ___something_something_copy = (b: Graph, something: (a: Graph, b: Graph) => void): Ray => {
    const a_copy: Graph = this.copy().cast(); // TODO: Here preferring copy, do this everywhere? / Depending on forgetful preference..
    something(a_copy, b); // TODO: Chyp just assumes b to be copied at the other end here???
    return a_copy; // Could generalize to either end
  }

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
    this.vdata.highlight = false;
    this.edata.highlight = false;
  }

  /**
   * Return matches of domain into codomain.
   */
  match = (other: Graph, convex: boolean = true): Matches => new Matches(this, other, convex);

  /**
   * Return an isomorphism between graphs g and h if found, otherwise `None`.
   *
   * If found, the isomorphism is returned as a :py:class:`Matches` instance, whose vertex and edge maps are bijections.
   */
  find_iso = (other: Graph): Match => { // TODO | NONE

    // TODO: Again, more equivalence checks
    // First, check the domains and codomains are equal between the two graphs.
    if (this.domain !== other.domain || this.codomain !== other.codomain)
      return None; //TODO

    // Try to find an initial match mapping one of the boundary vertices of the  domain graph to the corresponding boundary vertex (the vertex in the same input/output location) of the codomain graph. If no initial match is found, return `None`.
    const initial_match = new Match(this, other);

    const ___temp = (func: (ray: Graph) => Ray) => {
      ([func(this), func(other)] as Ray).zip(([initial, terminal]) => {
        if (!initial_match.try_add_vertex(initial, terminal))
          return None; //TODO, DOESNT ACTUALLY RETURN THE FUNCTION HERE. Wait till matcher is abstracted to fix this
      });
    }

    ___temp(ray => ray.inputs);
    ___temp(ray => ray.outputs); // TODO: See again, the same pattern over and over again, same on both sides.

    // If an initial match is found, try to find a total and surjective match of the domain graph into the codomain graph.

    return new Matches(this, other, initial_match, false)
      .filter(match => match.is_surjective()); // TODO; With this filter it should allow you to keep looking

    // TODO::: Automatic??
    //  If a total surjective match is not found, return `None`.
    return None;
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
    const num_wires = p.count.as_int();

    if (num_wires !== domain.count.as_int())
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

  /**
   * # def wide_id() -> Graph:
   * #     return gen("id", 1, 1)
   *
   * # def id_perm(p: List[int]) -> Graph:
   * #     g = Graph()
   * #     size = len(p)
   * #     inputs = [g.add_vertex(-1.5, i - (size-1)/2) for i in range(size)]
   * #     outputs = [g.add_vertex(1.5, i - (size-1)/2) for i in range(size)]
   *
   * #     for i in range(size):
   * #         y = i - (size-1)/2
   * #         g.add_edge([inputs[i]], [outputs[p[i]]], "id", 0, y)
   *
   * #     g.set_inputs(inputs)
   * #     g.set_outputs(outputs)
   *
   * #     return g
   */

  /**
   * Return a graph corresponding to a vertex size redistribution.
   *
   * A specific case of this family of graphs are 'dividers', which split a vertex of some type and size into multiple size 1 vertices of the same type. Conversely, 'gatherers' bundle multiple vertices of the same type into a single vertex of the same type and size the sum of the individual input vertex sizes.
   *
   * More generally, a conversion can be done between different lists of sizes, for some vertex type.
   *
   * @param domain A list of pairs (vertex type, register size) corresponding to each input vertex.
   * @param codomain A list of pairs (vertex type, register size) corresponding to each output vertex.
   */
  redistributer = (domain = list, codomain = list) => {
    /**
     *     vtypes = set(vtype for vtype, _ in domain)
     *     vtypes.update(vtype for vtype, _ in codomain)
     *     if len(vtypes) > 1:
     *         raise GraphError('Size conversion cannot mix vertex types.')
     *
     *     # Raise error if size conservation is violated
     *     domain_size = sum(size for _, size in domain)
     *     codomain_size = sum(size for _, size in codomain)
     *     if domain_size != codomain_size:
     *         raise GraphError(f'Sum of domain sizes ({domain_size}) does not equal'
     *                          + f'sum of codomain sizes ({codomain_size}).')
     *
     *     return gen('_redistributer', domain, codomain)
     */

  }

  /**
   * Some more delegations here
   */
  match_graph = (domain: Graph, codomain: Graph, convex: boolean = true): Matches => domain.match(codomain, convex);
  match_rule = (rule: Rule, codomain: Graph, convex: boolean = true): Matches => rule.match(codomain, convex);
  find_iso = (domain: Graph, codomain: Graph): Match => domain.find_iso(codomain);
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

  get vertex_map(): Ray { throw new NotImplementedError(); }
  get vertex_image(): Ray { throw new NotImplementedError(); }
  get edge_map(): Ray { throw new NotImplementedError(); }
  get edge_image(): Ray { throw new NotImplementedError(); }

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
      if (domain_vertex.in_edges.count.as_int() !== codomain_vertex.in_edges.count.as_int()) {
        log('Vertex failed: in_edges cannot satisfy gluing conditions.')
        return bool(False)
      }
      if (domain_vertex.out_edges.count.as_int() !== codomain_vertex.out_edges.count.as_int()) {
        log('Vertex failed: in_edges cannot satisfy gluing conditions.')
        return bool(False)
      }
    }

    // If a new consistent map is added that satisfies the gluing conditions, we are successful.
    log('Vertex success.')
    return bool(True);
  }

  /**
   * Try to map `domain_edge` to `codomain_edge`.
   *
   * This must satisfy certain conditions, such as being injective and having consistency with the vertex map.
   *
   * @param domain_edge
   * @param codomain_edge
   *
   * `True` if a consistent match is found mapping `domain_edge` to `codomain_edge`, otherwise `False`.
   */
  try_add_edge = (initial: EData, terminal: EData): Ray => {
    log(`Trying to add edge ${initial} -> ${terminal} to match:`);
    log(this.toString());

    // TODO: Again an equivalence
    // Check the values of the domain and codomain edges match.
    if (initial.value !== terminal.value) {
      log(`Edge failed: values ${initial.value} != ${terminal.value}`)
      return false;
    }

    // The edge map must be injective.
    if (this.edge_image.includes(terminal)) {
      console.log('Edge failed: the map would become non-injective.');
      return false;
    }

    // If the values match and the codomain edge has not already been mapped to, map domain edge to codomain edge.
    this.edge_map[initial] = terminal;
    this.edge_image.add(terminal);

    // Domain sources must match codomain sources and domain targets must match codomain targets.

    // TODO: Again more equivalences, just to log - debug mode
    {
      // initial = preimg
      // terminal = image

      // Domain sources must match codomain sources and domain targets must match codomain targets.
      if (initial.domain !== terminal.domain) {
        log(`Edge domain ${initial.domain} does not match image domain ${terminal.domain}.`);
      }

      // TODO, again both sides
      if (initial.codomain !== terminal.codomain) {
        log(`Edge codomain ${initial.codomain} does not match image codomain ${terminal.codomain}.`);
      }
    }

    // TODO: This too probably general pattern to extract
    // Check a vertex map consistent with this edge pairing exists.
    // TODO: + here is just concat, so that zip can easily match it
    ([initial.source + initial.target, terminal.source + terminal.target] as Ray).zip(([initial_vertex, terminal_vertex]) => {
      // Each vertex that is already mapped needs to be consistent.
      // TODO: More equivlaency, could be on the vertecies themselves
      if (this.vertex_map.includes(initial_vertex) && this.vertex_image[initial_vertex] !== terminal_vertex) {
        log('Edge failed: inconsistent with previously mapped vertex.');
        return false; // TODO: NOT RETURNING AGAIN
      }

      // Otherwise, a consistent match must be found vertex for unmapped source and target vertices.

      if (!this.try_add_vertex(initial_vertex, terminal_vertex)) {
        log('Edge failed: couldn\'t add a source or target vertex.');
        return false;
      }
    });

    log('Edge success.');
    return true;
  }

  /**
   * Return whether all adjacent edges of a domain vertex are mapped.
   */
  domain_neighbourhood_mapped = (vertex: VData): Ray =>
    ([vertex.in_edges + vertex.out_edges] as Ray).all(edge => this.edge_map.includes(edge));

  /**
   *     # def cod_nhd_mapped(self, cod_v: int):
   *     #     """Returns True if nhd(cod_v) is the range of emap"""
   *     #     return (all(e in self.eimg for e in self.cod.in_edges(cod_v)) and
   *     #             all(e in self.eimg for e in self.cod.out_edges(cod_v)))
   */

  /**
   * Try to extend the match by mapping all scalars (i.e. 0 -> 0 edges).
   *
   * Note that any matchings of scalars will yield isomorphic results under rewriting, so we don't return a list of all the possible matchings.
   *
   * Returns: `True` if all scalars in the domain are mapped injectively to scalars in the codomain, otherwise `False`.
   */
  map_scalars = (): Ray => {
    //TODO WHAT'S A SCALAR HERE?
    // TODO: Again same pattern for (co)domain - flipped, two dimensional
    const ___scalars = (domain: Graph, reverse: boolean) => {
      const is = (ray: Ray) => reverse ? ray.count !== 0 : ray.count === 0; // TODO: Should be easier to just .not this

      return domain.edges
        .filter((edge: EData) => this.is(edge.source) && this.is(edge.target));
    }

    const terminal = ___scalars(this.codomain, false);
    const initial = ___scalars(this.domain, true);

    // Greedily try to map scalar edges in the domain to scalar edges in the codomain with the same value.
    initial.all((initial_edge: EData) => {
      // TODO: Put initial/terminal edge on a ray and then apply funcitons

      log(`Trying to map scalar edge ${initial_edge}`)

      let found_match = false;

      // TODO .enumerate??
      terminal.all(([i, terminal_edge]) => {
        if (initial_edge.value !== terminal_edge.value) // ANother equiv
          return; // TODO continue;

        // Map the domain scalar to the first codomain scalar available with the same value.
        this.edge_map[initial_edge] = terminal_edge;
        this.edge_image.add(terminal_edge); // TODO: Again map/image is just initial/terminal.. same as domain/codomain,,

        found_match = true;

        // Since the edge map must be injective, if a scalar in the codomain is mapped to, remove it from the list of candidates for future domain scalars to be mapped to.
        terminal.pop(i); // TODO: ???

        log(`Successfully mapped scalar ${initial_edge} -> ${terminal_edge}`)

        // TODO: BREAK ; any??
      });

      if (!found_match) {
        log(`Match failed: could not map scalar edge ${initial_edge}.`)
        return false; // TODO DOESNT RETURN
      }
    });

    return true;
  }


  // TODO: IF MORE JUST ADDS MORE MATCHES IN THIS DIRECTION, THAT SHOULD BE AUTOMATIC ON .match ...  ?
  /**
   * Return any matches extending `self` by a single vertex or edge.
   */
  more = (): Ray => {
    // First, try to add an edge adjacent to any domain vertices that have already been matched.
    this.vertex_map
      // If all the edges adjacent to the current vertex have already been matched, continue. TODO: Could just be on the .vertex
      .filter(initial_vertex => this.domain_neighbourhood_mapped(initial_vertex))
      .all((initial_vertex: VData) => {
        // TODO: AS ZIp or something
        const terminal_vertex = this.vertex_map[initial_vertex];

        const ___test = (boundary: (ray: Graph) => Ray): Ray => {
          // Try to extend the match by mapping an adjacent source edge.
          boundary(this.domain) // TODO: AGAIN SAME THING
            // If the edge has already been matched, continue.
            .filter(edge => !this.edge_map.includes(edge))
            .all((initial_edge: EData) => {

              // Otherwise, try to map this edge into the codomain graph.
              return boundary(this.codomain).map(terminal_edge => {
                const potential_new_match = this.copy();

                // If the edge is successfully mapped to an edge in the codomain graph, extend the match with this mapping.
                if (potential_new_match.try_add_edge(initial_edge, terminal_edge))
                  return potential_new_match;

                return NONE;//todo
              }); // TODO REMOVE NON-ADDED_ONES, doesnt actually reutn either
            })

        }

        ___test(ray => ray.in_edges);
        ___test(ray => ray.out_edges);

      });

    // If all domain edges adjacent to matched domain vertices have already been matched, try to match an unmatched domain vertex.
    this.domain.vertices
      // If the vertex has already been matched into the codomain graph, continue. (Note we have looked at the edge-neighbourhood of these vertices above)
      .filter(initial_vertex => this.vertex_map.includes(initial_vertex)) // TODO: THIS THING IS JUST A COPY, AGAIN FROM THE VERTEX/EDGE DIFFERENTIATION FROM ABOVE
      .all(initial_vertex => {

        // Try to map the current domain vertex to any of the codomain vertices, extending the current match with this map when successful.
        return this.codomain.vertices.map((terminal_vertex: VData) => {
          const potential_new_match = this.copy();

          // If the edge is successfully mapped to an edge in the codomain graph, extend the match with this mapping.
          if (potential_new_match.try_add_vertex(initial_edge, terminal_edge))
            return potential_new_match;

          return NONE;//todo
        }); // TODO: AGAIN DOESNT RETURN
      })

    return [];
  }

  // TODO: Total=surjective on another level of description ???
  ___defuq = (string: 'image' | 'map', domain) =>
    this[`vertex_${string}`].count === domain.vertices.count
    && this[`edge_${string}`].count === domain.edges.count; // TODO: Again vertex/edge pattern, just collapse to one check

  /**
   * Return whether all domain vertices and edges have been mapped.
   */
  is_total = (): Ray => this.___defuq('map', this.domain);
  /**
   * Return whether the vertex and edge maps are surjective.
   */
  is_surjective = (): Ray => this.___defuq('image', this.codomain);

  /**
   * Return whether the vertex and edge maps are injective.
   */
  is_injective = (): Ray => {
    // Since the edge map is always injective, we only need to check the vertex map is injective. TODO (GENERALIZE)
    return this.vertex_map.count === this.vertex_image.count;
  }

  /**
   * Return whether this match is convex.
   *
   * A match is convex if:
   * - It is injective.
   * - Its image in the codomain hypergraph is a convex sub-hypergraph. This means that for any two nodes in the sub-hypergraph and any path between these two nodes, every hyperedge along the path is also in the sub-hypergraph.
   *
   * TODO: Just no overlap??
   */
  is_convex = (): Ray => {
    if (!this.is_injective()) { //TODO: WHY?
      return false;
    }


    // Check that the image sub-hypergraph is convex. Get all successors of vertices in the image of the output of the domain graph.
    const output_image_successors = this.codomain.successors(
      this.domain.outputs
        .filter(vertex => this.vertex_map[vertex]) // TODO INCLUDES
    ); // TODO, Why search in codomain fromi these, ?? this must be easier

    // Check there is no path from any vertices in the image of the domain outputs to a vertex in the image of the domain inputs.
    this.domain.inputs
      .filter(vertex => this.vertex_map.includes(vertex) && output_image_successors.includes(this.vertex_map[vertex]))
      .any(() => { return false }) // TODO DOESNT ACTUALLY RETURNM

    return true;
  }

  /**
   * TODO Not implemented;;
   *     # def cod_nhd_mapped(self, cod_v: int):
   *     #     """Returns True if nhd(cod_v) is the range of emap"""
   *     #     return (all(e in self.eimg for e in self.cod.in_edges(cod_v)) and
   *     #             all(e in self.eimg for e in self.cod.out_edges(cod_v)))
   */
}

/**
 * An iterator over matches of one graph into another.
 *
 * This class can be used to iterate over total matches of a graph into another, optionally requiring these matches to be convex.
 *
 * TODO: SUPPORT THIS/?:::
 *     A class instance works by keeping a stack of partial or total matches.
 *     When it is iterated over, it pops a match from its match stack if it is
 *     non-empty, otherwise the iteration is stopped. If a match has been popped,
 *     the instance returns the match if it is total (and convex if required).
 *     Otherwise, the instance tries to extend the match and add any extended
 *     matches to the stack, then continues this process of popping off the match
 *     stack and extending if possible until a valid match is found and returned.
 */
export class Matches extends Ray {
  __init__ = (domain = Graph, codomain = Graph): Ray => {
    /**
     * TODO
     *         if initial_match is None:
     *             initial_match = Match(domain=domain, codomain=codomain)
     *         self.convex = convex
     *
     *         # Try to map scalars on the initial match.
     *         if initial_match.map_scalars():
     *             self.match_stack = [initial_match]
     *         # If the scalars could not be mapped, set the match
     *         # stack to be empty. This means that not suitable matches
     *         # will be found by this class instance.
     *         else:
     *             self.match_stack = []
     */
    throw new NotImplementedError(); }
  __iter__ = (): Ray => { throw new NotImplementedError(); }

  /**
   * Return the next suitable match found.
   *
   * A 'suitable' match is one that is total and, if `self.convex == True`, convex.
   */
  __next__ = (): Ray => {
    // TODO Like expected this, class can probably be dropped this just becomes

    return this.match_stack.dont_check_for_convex_or.is_convex; // TODO: Just generalize these on functions

    /**
     *      while len(self.match_stack) > 0:
     *             # Pop the match at the top of the match stack
     *             m = self.match_stack.pop()
     *             # If the match is total (and convex if required), return it.
     *             if m.is_total():
     *                 match_log("got successful match:\n" + str(m))
     *                 if self.convex:
     *                     if m.is_convex():
     *                         match_log("match is convex, returning")
     *                         return m
     *                     else:
     *                         match_log("match is not convex, dropping")
     *                 else:
     *                     return m
     *             # If the match at the top of the match stack was not total
     *             # (and convex if required), try to extend the match at the
     *             # top of the stack and add the results to the match stack.
     *             else:
     *                 self.match_stack += m.more()
     *         # If a suitable match was not found, stop the iteration.
     *         raise StopIteration
      */
  }
}

export class Rule extends Ray {

  get equiv(): Ray { throw new NotImplementedError(); }


  /**
   * Returns True if boundary on lhs embeds injectively
   */
  is_left_linear = (): Ray => {
    // TODO, needs to implement splat and stuff? or by default, could be done smarter, but again no overloading
    return !JS.Iterable([...this.lhs.inputs, ...this.rhs.outputs]).as_ray()
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
    this.lhs.edges.all(edge => rewritten_graph.remove_edge(match.edge_map(edge)));

    const inputs = [];
    const outputs = [];

    this.lhs.vertices.all(rule_vertex => {
      const match_vertex = match.vertex_map[rule_vertex];

      if (!this.lhs.is_boundary(rule_vertex)) {
        rewritten_graph.remove_vertex(match_vertex);
        return;
      }

      const rule_input = rule_vertex.in_indices;
      const rule_output = rule_vertex.out_indices;

      if (rule_input.count.as_int() === 1 && rule_output === 1) {
        const [match_input, match_output] = rewritten_graph.explode_vertex(match_vertex);

        if (match_input.count.as_int() !== 1 && match_output.count.as_int() !== 1)
          throw new NotImplementedError("Rewriting modulo Frobenius not yet supported.");

        inputs[rule_vertex] = match_input[0];
        outputs[rule_vertex] = match_output[0];
      } else if (rule_input.count.as_int() > 1 || rule_output.count.as_int() > 1) {
        throw new NotImplementedError("Rewriting modulo Frobenius not yet supported.");
      }
    })

    // Embed Rule.rhs into rewritten_graph
    const replacement = new Match(this.rhs, rewritten_graph);

    // TODO: This is probably another of these geeneral patterns, same thing on either ends composed as a single ray.,
    const input = new Ray(); // [this.lhs.inputs, this.rhs.inputs]

    // first map the inputs, using the matching of the lhs
    input.zip().all(([initial, terminal]) => {
      match.vertex_map[terminal] = inputs.includes(initial) ? inputs[initial] : match.vertex_map[initial];
    });

    const output = new Ray(); // [this.lhs.outputs, this.rhs.outputs]

    // next map the outputs. if the same vertex is an input and an output in r.rhs, then merge them in h.
    output.zip().all(([initial, terminal]) => {
      // TODO: Again, both ends are very similar, there should probably be a direct flip in these, small difference at the end
      const temp = outputs.includes(initial) ? outputs[initial] : match.vertex_map[initial];

      if (match.vertex_map.includes(terminal)) {
        rewritten_graph.merge_vertices(match.vertex_map[terminal], temp)
      } else {
        match.vertex_map[terminal] = temp;
      }
    });

    // then map the interior to new, fresh vertices
    this.rhs.vertices
      .filter(vertex => !vertex.is_boundary())
      .all((vertex: VData) => {
        // TODO Again the fresh thing repeated here - just because it's moving between graphs
        const new_vertex = rewritten_graph.add_vertex(vertex.fresh());

        match.vertex_map[vertex] = new_vertex;
        match.vertex_image.add(new_vertex);
      });

    // now add the edges from rhs to h and connect them using vmap1
    // TODO: Again this should be the same thing as the vertices
    this.rhs.edges.
      all((edge: EData) => {
        const new_edge = rewritten_graph.add_edge();
        /**
         *         e1 = h.add_edge([m1.vertex_map[v] for v in ed.s],
         *                         [m1.vertex_map[v] for v in ed.t],
         *                         ed.value, ed.x, ed.y, ed.fg, ed.bg, ed.hyper)
         */

        match.edge_map[edge] = new_edge;
        match.edge_image.add(new_edge);
      })

    return replacement;
  }

  // TODO: Can probably just match Rule=Graph, and use only one of these methods??
  /**
   * Return matches of the left side of `rule` into `graph`.
   */
  match = (other: Graph, convex: boolean = true): Matches => new Matches(this.lhs, other, convex);

  /**
   * Apply the given rewrite r to at match m and return the first result
   *
   * This is a convenience wrapper for `dpo` for when the extra rewrite data isn't needed.
   */
  rewrite = (match: Match): Ray => this.dpo(match).first.terminal; // .first.codomain
  // TODO; Though .first is used here, something like .any is more appropriate in the sense of: Don't care which one first, just something.
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

