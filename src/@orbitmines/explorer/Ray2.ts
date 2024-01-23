import _ from "lodash";
import {NotImplementedError, PreventsImplementationBug} from "./errors/errors";
import {InterfaceOptions} from "./OrbitMinesExplorer";
import JS from "./JS";

const opposite = (boundary: Boundary): Boundary => boundary === RayType.INITIAL ? RayType.TERMINAL : RayType.INITIAL;

/**
 * https://en.wikipedia.org/wiki/Homoiconicity
 */
export interface PossiblyHomoiconic<T extends PossiblyHomoiconic<T>> {
  get self(): T;
  is_reference: () => boolean
  as_reference: () => T
}

// TODO: better debug
export type DebugResult = { [label: string]: DebugRay }
export type DebugRay = {
  label: string,
  initial: string,
  vertex: string,
  terminal: string,
  is_initial: boolean,
  is_vertex: boolean,
  is_terminal: boolean,
  type: RayType,
  _dirty_store: any
}

/**
 * JavaScript wrapper for a mutable value. It is important to realize that this is merely some simple JavaScript abstraction, and anything is assumed to be inherently mutable.
 *
 * TODO:
 * - Homotopy equivalence merely as some direction/reversibility constraint on some direction, ignoring additional structure (or incorporating it into the equiv) at the vertices. (Could be loosened where certain vertex-equivalences are also part of the homotopy)
 * - Induced ignorance/equivalence along arbitrary rays.
 * - Usual way of thinking about vertices is what the coninuations are here - phrase that somewhjere
 *
 * TODO: Any javascript class, allow warpper of function names around any ray, as a possible match
 * TODO: All the methods defined here should be implemented in some Ray structure at some point
 *
 * TODO: Maybe want a way to destroy from one end, so that if other references try to look, they won't find additional structure. - More as a javascript implementation quirck if anything?
 *
 * TODO: Can do some workaround overloading through properties, at least for +/-
 *
 * TODO: Singlke keybind for now to show/hide the ray disambiguation or 'dead edges/..'/
 *
 *
 *
 * TODO: All methods to 'step' variant - and an intuitive way to switch between modes
 *  - Through better Ray.___func
 *  - Transform all functions on Ray to that. (Perhaps use JavaScript generators by default (more intuitively?) - Just convert using JS.Generator)
 *  - No assumption of halting
 *  - Perhaps locally cache (for stuff like count?) - no way to ensure globally coherence
 *
 * TODO: SWITCH/MATCH
 *   // TODO; Maybe replace switch with 'zip'?, What are the practical differences?
 *   // TODO: switch/match Should be abstracted into Ray?
 *
 * TODO: Stylistic
 *  - Consistency of Arbitrary vs non-arbitrary.
 *  - Reorder methods in a sensible way.
 *
 */
export class Ray
  implements
      AbstractDirectionality<Ray>,
      PossiblyHomoiconic<Ray>,

      AsyncIterable<Ray>,
      Iterable<Ray>
      // Array<Ray>
      // Dict<Ray>
{
  // /**
  //  * Moves `this.self` and `this.self.self` to a new line.
  //  *
  //  * [  |--] this.self ----- this.self.self [--|--]
  //  * ______ (<- initial pointer)
  //  */
  // as_initial = (): Ray => {
  //   if (this.is_none()) {
  //     throw new PreventsImplementationBug('Should be implemented at some point ; Just return an empty vertex');
  //   }
  //   if (this.dereference.is_none()) {
  //     // TODO: Need some intuition for this check
  //     const vertex = this.___as_vertex();
  //
  //     if (vertex.type !== RayType.VERTEX)
  //       throw new PreventsImplementationBug();
  //
  //     return vertex.follow(Ray.directions.previous);
  //   }
  //
  //   const [terminal_vertex, initial_vertex] = this.___as_vertices();
  //
  //   if (initial_vertex.type !== RayType.VERTEX)
  //     throw new PreventsImplementationBug();
  //   if (terminal_vertex.type !== RayType.VERTEX)
  //     throw new PreventsImplementationBug();
  //
  //   initial_vertex.compose(terminal_vertex);
  //
  //   // TODO BETTER DEBUG
  //
  //   return initial_vertex.follow(Ray.directions.previous);
  // }
  /**
   * Moves `this.self` and `this.self.self` to a new line.
   *
   * [  |--] this.self.self ----- this.self [--|--]
   *                                         _____ (<- terminal pointer)
   */
  as_terminal = (): Ray => {
    if (this.is_none()) {
      throw new PreventsImplementationBug('Should be implemented at some point ; Just return an empty vertex');
    }
    if (this.dereference.is_none()) {
      throw new PreventsImplementationBug();
    }

    const [terminal_vertex, initial_vertex] = this.___as_vertices();

    if (initial_vertex.type !== RayType.VERTEX)
      throw new PreventsImplementationBug();
    if (terminal_vertex.type !== RayType.VERTEX)
      throw new PreventsImplementationBug();

    initial_vertex.compose(terminal_vertex);

    // TODO BETTER DEBUG

    return Ray.directions.next(terminal_vertex);
  }
  private ___as_vertices = (): [Ray, Ray] => {
    if (!Ray.is_orbit(this.self, this.self.self.self))
      throw new PreventsImplementationBug('Is there a use-case for this? Probably not?'); //TODO

    // TODO NOTE: THE ORDER OF `this.self` first matters here.
    return [this.self.___as_vertex(), this.___as_vertex()];
  }
  private ___as_vertex = (): Ray => {
    const vertex = Ray.vertex().o({ js: '___as_vertex' }).as_reference().o({ js: '___as_vertex.#' });

    return this.___ignorantly_equivalent(vertex);
  }
  ___ignorantly_equivalent = (ref: Ray): Ray => {
    ref.self.self = this.self.as_arbitrary();
    this.self.self = ref.self.as_arbitrary();

    return ref;
  }

  /** [     ] */ static None = () => new Ray({ });
  /** [--?--] */ static vertex = (value: JS.ParameterlessFunction<Ray> = Ray.None) => {
    /** [     ] */ const vertex = Ray.None();
    /** [--   ] */ vertex.initial = vertex.___empty_initial();
    /** [  ?  ] */ vertex.vertex = value;
    /** [   --] */ vertex.terminal = vertex.___empty_terminal();

    /** [--?--] */ return vertex;
  }
  /** [  |-?] */ static initial = () => Ray.vertex().initial;
  /** [?-|  ] */ static terminal = () => Ray.vertex().terminal;

  // TODO; Temp placeholders for now - & BETTER DEBUG
  ___empty_initial = () => new Ray({ vertex: Ray.None, terminal: this.as_arbitrary() }).o({ debug: 'initial ref'}).as_arbitrary();
  ___empty_terminal = () => new Ray({ vertex: Ray.None, initial: this.as_arbitrary() }).o({ debug: 'terminal ref'}).as_arbitrary();




  // TODO: Returns the ref, since it still holds the information on how they're not the same??? - Need some intuitive way of doing this?


  /**
   *
   */
  static equivalent = JS.Function.Impl((initial, terminal) => {

    /**
     * The simplest case, is where both sides are only aware of themselves (on .vertex). The only thing we need to do is turn an Orbit, to an Orbit which repeats every 2 steps, the intermediate step being the other thing.
     *
     * Or in textual terms something like:
     *  - A single Orbit:  `(A.self = A) | (B.self = B)`  (i.e. A.is_none && B.is_none)
     *  -             To:  `(A.self = B) | (B.self = A)`
     *
     * Basically turns `A` into a reference to `B`, and `B` into a reference to `A`.
     */
    const ignorant_equivalence = (): Ray => {
      return initial.___ignorantly_equivalent(terminal);
    }

    // 2x Ray.None -> Turn into 2 empty references, referencing each-other.
    if (
      initial.dereference.is_none() && terminal.dereference.is_none()
      && !(initial.type === RayType.VERTEX && terminal.type === RayType.VERTEX)
    ) {
      // throw new PreventsImplementationBug(`${initial.type} / ${terminal.type}`)
      return ignorant_equivalence();
    }

    // Two structures, which have `ref.self = Ray.None` -> Turn into two structures which are on a line in between them.
    if (initial.dereference.is_none()) {
      const vertex = Ray.vertex().o({ js: '___as_vertex' }).as_reference().o({ js: '___as_vertex.#' });
      vertex.self.self = initial.self.as_arbitrary();
      initial.self.self = vertex.self.as_arbitrary();

      // initial.equivalent(terminal);
      // return terminal;
    }
    if (terminal.dereference.is_none()) {
      const vertex = Ray.vertex().o({ js: '___as_vertex' }).as_reference().o({ js: '___as_vertex.#' });
      vertex.self.self = terminal.self.as_arbitrary();
      terminal.self.self = vertex.self.as_arbitrary();

      // initial.equivalent(terminal.___as_vertex());
      // return terminal;
    }

    if (initial.is_boundary() && initial.dereference.is_boundary()) {
      throw new NotImplementedError();
      initial.as_terminal();
      //.follow(Ray.directions.previous).compose(terminal.dereference);
      // return terminal;
    }

    if (
      initial.dereference.type !== RayType.VERTEX
      || terminal.dereference.type !== RayType.VERTEX
      || initial.dereference.self === initial.self
      || terminal.dereference.self === terminal.self
    ) {
      throw new PreventsImplementationBug(`[${initial.type}]`)
    }

    if (Ray.directions.next(initial).type !== RayType.TERMINAL || Ray.directions.previous(terminal).type !== RayType.INITIAL) {
      throw new NotImplementedError();
      initial.dereference.push_back(terminal.dereference); // TODO: NON-PUSH-BACK VARIANT? (Just local splits?)
      return terminal;
      // throw new PreventsImplementationBug(`
      //   [${initial.type}](${initial.follow_direction().any.js})
      //   / [${initial.dereference.type}] {${[...initial.dereference.traverse()].map(ref => ref.self.follow_direction().any.js)}}
      //   -> ${terminal.type} (${terminal.follow_direction().any.js})
      //   / [${terminal.dereference.type}]`)
    }

    // if (terminal.self.any.js === 'D')
    //   throw new PreventsImplementationBug();

    initial.dereference.compose(terminal.dereference);

    return terminal;

    // initial.dereference.compose()
    // return terminal;
  });
  equivalent = Ray.equivalent.as_method(this);

  // zip also compose???
  // [a, b, c] zip [d, e, f] zip [g, h, i] ...
  // [[a,d,g],[b,e,h],[c,f,i]]
  static zip = JS.Function.Impl((initial, terminal) => {

    if (initial.as_reference().type !== RayType.REFERENCE || terminal.as_reference().type !== RayType.REFERENCE)
      throw new PreventsImplementationBug('TODO: Implement');

    if (initial.type !== RayType.VERTEX || terminal.type !== RayType.VERTEX)
      throw new PreventsImplementationBug('TODO: Implement');

    throw new NotImplementedError();
    // initial.traverse()
    // return new Ray({
    //
    // });
  });
  zip = Ray.zip.as_method(this);

  // pop = (): Ray => {
    // this.last().previous().all.terminal = (ref) => ref.___empty_terminal();
  // }
  // pop = (): Ray => this.___primitive_switch({
  //   [RayType.VERTEX]: () => {
  //     const previous_vertex = this.self.initial.follow(Ray.directions.previous);
  //
  //     if (this.is_none()) {
  //       return this; // TODO; Already empty, perhaps throw
  //     }
  //
  //     return previous_vertex.___primitive_switch({
  //       [RayType.VERTEX]: () => {
  //         console.log(previous_vertex)
  //         // TODO: NONHACKY
  //
  //         previous_vertex.self.terminal = new Ray({ vertex: Ray.None, initial: previous_vertex.self.as_arbitrary() }).o({ debug: 'terminal ref'}).as_arbitrary()
  //         return previous_vertex;
  //       }
  //     });
  //   }
  // });

    static follow_direction = {
      [RayType.INITIAL]: Ray.directions.next,
      [RayType.TERMINAL]: Ray.directions.previous
    }

    /**
     * .next
     */
      next = (step: JS.FunctionImpl = Ray.directions.next): Ray => {
        if (step(this).self.self.is_none())
          return Ray.None();

        let current = true;
        for (let ray of this.traverse(step)) {
          if (current) {
            current = false;
            continue;
          }
          return ray;
        }
        // return [...this.traverse(step)][1] ?? Ray.None(); // TODO BAD
        return Ray.None();
      }
      has_next = (step: JS.FunctionImpl = Ray.directions.next): boolean => this.next(step).is_some();
      // @alias('end', 'result', 'back')
      last = (step: JS.FunctionImpl = Ray.directions.next): Ray => {
        const next = this.next(step);
        return next.is_some() ? next.last(step) : this;
      }
    /**
     * .previous (Just .next with a `Ray.directions.previous` default)
     */
      previous = (step: JS.FunctionImpl = Ray.directions.previous): Ray => this.next(step);
      has_previous = (step: JS.FunctionImpl = Ray.directions.previous): boolean => this.has_next(step);
      // @alias('beginning', 'front')
      first = (step: JS.FunctionImpl = Ray.directions.previous): Ray => this.last(step);
  
  // TODO: I Don't like this name, but it needs to get across that any equivalency, or any equivalency check for that necessarily, is local. And I want more equivalences, I run more of this method.
  // TODO: For chyp used to compare [vtype, size] as domains, just type matching on the vertex.
  is_vertex_equivalent = (b: Ray) => {
    // TODO; in the case of a list, each individually, again, additional structure...
  }
  // TODO: Ignore the connection between the two, say a.equiv(b) within some Rule [a,b], ignore the existing of the connection in the Rule? What does it mean not to???

  // TODO: Whether the thing is referenced on the vertex: do their vertices have some connection onm this direction?

  get count(): Ray { return JS.Number(this.as_array().length); }

  // TODO; Could return the ignorant reference to both instances, or just the result., ..

  /**
   * TODO: Need more control over the (non-/)lazyness of copy.
   *
   * - The problem with a copy, is that in or to be generalizable, it needs to alter all references to the thing it's copying to itself - this cannot be done with certainty.
   *
   * - Additionally, a copy necessarily has some non-redundancy to it:
   *   @see "A copy is necessarily inconsistent": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=If%20I%20have%20one%20thing%20and%20I%20make%20a%20perfect%20copy
   */
  // @alias('duplicate')
  copy = (): Ray => {
    // return this.self.as_reference(); // Copies the reference?
    throw new NotImplementedError();

    // const copy = new Ray({
    //   initial: this.self._initial().as_reference().none_or(ref => ref.copy()).as_arbitrary(),
    //   vertex: this.self._vertex().as_reference().none_or(ref => ref.copy()).as_arbitrary(),
    // }).o({ ___dirty_copy_buffer: {} });
    // // copy._initial = () => copy.any.___dirty_copy_buffer._initial ??= this.self._initial().as_reference().copy();
    // // copy._vertex = () => copy.any.___dirty_copy_buffer._vertex ??= this.self._vertex().as_reference().copy();
    // // copy._terminal = () => copy.any.___dirty_copy_buffer._terminal ??= this.self._terminal().as_reference().copy();
    //
    //
    // // TODO: Doesn't copy .any
    //
    // return copy.as_reference();
  }

  // none_or = (arbitrary: Implementation): Ray => this.is_none() ? Ray.None() : arbitrary(this);

  get reverse(): Ray {
    const copy = this;//TODO.copy();

    // TODO: Do we do this lazy by default? Just using refs??? - Or abstract this elsewhere to decide what to do
    const swap = copy.initial;
    copy.initial = copy.terminal.as_arbitrary();
    copy.terminal = swap.as_arbitrary();
    // TODO: This doesn't actually work

    return copy;
  }

  /**
   * TODO - Better 'value' here. (Use JS.Any??)
   *
   * TODO: All these should accept Ray values.
   *
   * .size, since .length is reserved by JavaScript.
   * TODO: .size could be more tensor-like, arbitrary lengths..
   */
  // @alias('length', 'of_length')
  static size = (of: number, value: any = undefined): Ray => {
    let ret: Ray | undefined;
    let current: Ray | undefined;
    // TODO: Actual good implementation: Should be lazy
    for (let i = 0; i < of; i++) {
      const vertex = Ray.vertex().o({js: value}).as_reference();

      if (!ret) {
        current = ret = vertex;
      } else {
        current = current?.compose(vertex);
      }
    }

    if (!ret)
      return Ray.None();

    return ret;
  }
  static at = (index: number, of: number, value: any = undefined): Ray => {
    return Ray.size(of, value).at(index);
  }
  /**
   * Just uses length/size for permutation. TODO: More complex permutation/enumeration implementation should follow at some point. (@see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=One%20of%20them%20could%20even%20be%20putting%20both%20our%20points%20on%20our%20selection for an example)
   *
   * @see "Combinatorics as Equivalence": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Combinatorics%20%2D%20Combinatorics%20as%20Equivalence
   */
  static permutation = (permutation: number | undefined, of: number): Ray => Ray.at(
    // In the case of a bit: 2nd value for '1' (but could be the reverse, if our interpreter does this)
    permutation ?? 0,
    // In the case of a bit: Either |-*-| if no bit or |-*->-*-| if a bit.
    permutation === undefined ? 1 : of
  )

  at = (steps: number | Ray | JS.ParameterlessFunction<Ray>): Ray => {
    if (!JS.is_number(steps))
      throw new NotImplementedError('Not yet implemented for Rays.');

    // TODO: Actual good implementation - also doesn't support modular like this
    const array = [...this.traverse(
      steps < 0 ? Ray.directions.previous : Ray.directions.next
    )];

    steps = Math.abs(steps);

    return array.length > steps && steps >= 0 ? (
      array[steps] ?? Ray.None() // TODO FIX: Probably a JavaScript quirck with some weird numbers, just failsafe to None.
    ) : Ray.None();
  }

  // export const hexadecimal = (hexadecimal?: string): Arbitrary<Ray<any>> => permutation(hexadecimal ? parseInt(hexadecimal, 16) : undefined, 16);

  // TODO: Should give the program that does the mapping, not the result, and probably implemented as 'compile/traverse'
  map = (mapping: (ray: Ray) => Ray | any): Ray => { throw new NotImplementedError(); }
  // filter = (mapping: (ray: Ray) => Ray | any): Ray => { throw new NotImplementedError(); }
  get clear(): Ray { throw new NotImplementedError(); }

  // TODO: Generalize these functions to:
  //
  // TODO: +default, in the case of Initial/Terminal = Ray.None, to which the default sometimes is nothing. Or in the case of min/max it's 0.


  // TODO: being called min.x needs to return the min value within that entire structure.

  // [this.vertices().x.max(), this.edges().x.max()].max()
  // [this.vertices().x.min(), this.edges().x.max()].max()
  // TODO: Indicies not corresponding the the directionality defined, are probably on another abstraction layer described this way. More accurately, they're directly connected, and on a separate layer with more stuff in between...
  get index(): Ray { throw new NotImplementedError(); }
  // TODO: Can probably generate these on the fly, or cache them automatically
  min = (_default: 0): Ray => { throw new NotImplementedError(); }
  max = (_default: 0): Ray => { throw new NotImplementedError(); }

  // TODO: FIND OUT IF SOMEONE HAS A NAME FOR THIS
  // apply = (func: Ray) => {

    // TODO: Combine into generalized [x, min/max()] - preserve terminal/initial structure
    // TODO: ray#apply.
    // TODO: FROM COMPOSER
    /**
     *  const func = [min(), '', max()]
     *
     *      const [min_x, max_x] = [
     *       // Compute the min x-coordinate of the edges and vertices in the other graph.
     *       compose.terminal.x.min(), // min_other
     *
     *       // Compute the max x-coordinate of the edges and vertices in this graph.
     *       compose.initial.x.max(), // max_self
     *     ]
     */
  // }

  // ___compute = ()

  *traverse(step: JS.FunctionImpl = Ray.directions.next): Generator<Ray> {
    // TODO: Also to ___func??

    if (this.type !== RayType.VERTEX)
      throw new NotImplementedError(`[${this.type}]`);

    yield *this.___next({step});
  }

  *___next({
    step = Ray.directions.next,
  } = {}): Generator<Ray> {
    for (let current of Ray.traverse({
      initial: this.as_arbitrary(),
      step
    })) {

      // TODO: You can do this non-locally with a pass over the history. This way it's local, but we''ll have to find a good example of why this might not go that well. (As this would match to any empty vertices, and maybe more)

      // TODO: Could also check for none..
      const previous = current.previous();

      if (previous.is_vertex() && !Ray.is_orbit(previous.self, current)) {
        yield previous;
      }
    }
  }
  *___map<T>(map: (vertex: Ray) => T, {
    step = Ray.directions.next,
  } = {}): Generator<T> {
    for (let vertex of this.___next({step})) {
      yield map(vertex);
    }
  }

  static step_function = (
    step: JS.FunctionImpl
  ): JS.Function => {
    const step_from_boundary = (from: Ray, to: Ray): Ray => {
      switch (to.type) {
        /**
         * Dereferencing is likely in many cases quickly subject to infinite stepping (similar to INITIAL -> INITIAL, TERMINAL -> TERMINAL, VERTEX -> VERTEX. (Could be that this means that there's no continuation, a self-reference defined here, or it's some mechanism of halting.)
         *
         * - TODO: Simple example of infinitely finding terminals, or a reference to 'nothing - infinitely'.
         * - TODO: If both are references, allow deref of both?
         */
        case RayType.REFERENCE: {
          throw new NotImplementedError();
        }

        /**
         * A possible continuation
         * INITIAL/TERMINAL -> possible previous  - TERMINAL.self.initial   (pass to step)
         * TERMINAL/INITIAL -> possible next      - INITIAL.self.terminal   (pass to step)
         */
        case RayType.TERMINAL: {
          return Ray.follow_direction[RayType.TERMINAL](to);
        }
        case RayType.INITIAL: {
          return Ray.follow_direction[RayType.INITIAL](to);
        }

        /**
         * This is the most interesting case: Many possible continuations (from the perspective of a boundary (INITIAL/TERMINAL)).
         *
         * NOTE:
         * - There are many ways of actually implementing this. This is one which ensures the checks needed to traverse arbitrary continuations is always local (with the trade-off that you can't disambiguate between structure on edges vs structure on vertices by default). Though this can be imposed with something else. (TODO)
         *
         * @see = TODO
         */
        case RayType.VERTEX: {
          // TODO: Could check if self.self is Orbit.

          /**
           * Simplest check, ensure we're coming from some place which splits into many branches
           * @see = TODO
           */
          if (Ray.is_orbit(from.self, to.self.self)) {
            // TODO: Branch to previous.next
            // this.next_pointer(Ray.directions.previous), this.next_pointer(Ray.directions.next)

            throw new NotImplementedError();
          }

          /**
           * This is the one which disallows structure on edges, and assumes a vertex it finds, necessarily as additional vertices we're looking for. (But we don't need to keep track of where we are like this ; TODO: Implement variant which checks back over branch.previous() to allow for this)
           * @see = TODO
           */
          if (
            to.dereference.is_boundary() // Whether there's a continuation defined on the vertex.
            && Ray.is_orbit(to.self, to.self.self.self)
          ) {
            // default pointer
            // const default_pointer = (): Ray[] => {
            //           return pointer.terminal.is_none() ? [] : [pointer];
            //         }
            // TODO: Split of options.step(terminal) & new Ray({
            //                     initial: terminal.as_arbitrary(),
            //                     vertex: pointer.as_arbitrary(),
            //                     terminal: () => terminal.dereference
            //                   })
            throw new NotImplementedError();
          }

          return step(to);
        }
      }
    }

    return JS.Function.WithMemory(
      to_step => {
        const to = to_step.dereference;

        throw new NotImplementedError();
        /**
         * Cannot determine what to do without context of where we are.
         */
        if (to.is_none()) {
          return Ray.None();
        }

        const from_step = to_step.previous(); // TODO ONLY NEEDS ONE-STEP MEMORY ; Or could be implemented as two values as each step, or???

        const from = from_step.dereference;

        switch (from.type) {
          case RayType.REFERENCE: {
            throw new NotImplementedError();//  previous.dereference,
          }
          case RayType.INITIAL:
          case RayType.TERMINAL: {
            return step_from_boundary(from, to);
          }
          case RayType.VERTEX: {
            return step(to);
          }
        }
      }
    );
  }

  static *traverse(options = {
    initial: Ray.None,
    step: Ray.directions.next,
    // branch: {
    //   // @alias('pruning', 'mapping', 'filtering')
    //   prune: (branches: Ray): Ray => branches,
    //   // @alias('next', 'selection', 'tactic', 'strategy')
    //   next: (branches: Ray): Ray => branches.first(),
    // }
  }): Generator<Ray> {

    /**
     * An arbitrary Ray of (accessible) (possible) next steps to perform in traversal.
     */
    // @alias('cursor(s)', 'branch(es)', 'selection(s)')
    let branches: Ray = Ray.step_function(options.step).as_ray(options.initial()); // TODO; This can be used to copy?
    let branch = branches;

    while (true) {
    //   /**
    //    * Branch *Pruning, Mapping, ..., Filtering*
    //    */
    //     branches = options.branch.prune(branches); // TODO: Could hold history
    //
    //   /**
    //    * Branch *Selection, Tactic, ..., Strategy*
    //    */
    //
    //     /**
    //      * An arbitrary Ray of (requested) next steps to perform in parallel/.../superposition (with respect to all the other branches).
    //      */
    //     const branches_to_traverse: Ray = options.branch.next(branches);
    //
    //     /**
    //      * Make copies of our traversal for each selected branch
    //      */
    //     // TODO
    //
    //     /**
    //      * Split off traversal to each branch, selecting their respective .
    //      */
    //
    //   let branch: Ray = branches_to_traverse; //TODO

      branch.self = branch.next().as_arbitrary();

      yield branch;

      if (branch.self.is_terminal())
        break;

      // After step, if IS_TERMINAL, nothing. assume halting (!!!at prune step ?)

      // const terminal = branch.follow();

      // branch.self = terminal;

      /**
       * if (branches.length === 0) {
       *           remove(pointers); // pointer,
       *         } else {
       *           ref.self = branches[0].as_arbitrary();
       *
       *           if (branches.length !== 1) {
       *             pointers.push(...branches.slice(1).map(b => Ray.vertex(b.as_arbitrary())));
       *           }
       *         }
       */
    }

    // if (pointers.length !== 0)
    //   throw new PreventsImplementationBug(`${pointers.length} left`)
  }


  /**
   * JavaScript, possible compilations - TODO: Could have enumeratd possibilities, but just ignore that for now.
   */
    // JS.AsyncGenerator
    async *[Symbol.asyncIterator](): AsyncGenerator<Ray> { yield *this.traverse(); }
    // JS.Generator
    *[Symbol.iterator](): Generator<Ray> { yield *this.traverse(); }
    // JS.AsyncGenerator
    as_async_generator = (): AsyncGenerator<Ray> => this[Symbol.asyncIterator]();
    // JS.AsyncIterator
    as_async_iterator = (): AsyncIterator<Ray> => this.as_async_generator();
    // JS.Iterator
    as_generator = (): Generator<Ray> => this[Symbol.iterator]();
    // JS.AsyncIterator
    as_iterator = (): Iterator<Ray> => this.as_generator();
    // JS.Array
    as_array = (): Ray[] => [...this];
    // JS.String
    toString = (): string => this.as_string();
    as_string = (): string => this.as_array().map(ref => ref.any.js).join(','); // TODO: PROPER

    as_int = (): number => { throw new NotImplementedError(); }
    as_number = this.as_int;

  /**
   *
   * TODO:
   *   - This needs something much smarter at some point...
   */
  all = (step: JS.FunctionImpl = Ray.directions.next): { [key: string | symbol]: Ray } & any => {
    return new Proxy<Ray>(this, {

      get(self: Ray, p: string | symbol, receiver: any): any {

        // TODO: Could return arbitrary structure (or in other method than .all?)
        return self.___map(ref => ref.any[p], {step});
      },

      /**
       * Can't overload things like '-=' for anything but things that return numbers... ; So just apply a general function instead.
       */
      set(self: Ray, p: string | symbol, newValue: any, receiver: any): boolean {
        for (let ref of self.___next({step})) { // TODO; This needs to either be dynamically, or just a simple shut-off for circular ones.
          ref.any[p] = JS.is_function(newValue) ? newValue(ref.any[p]) : newValue;
        }

        return true;
      },


      deleteProperty(self: Ray, p: string | symbol): boolean {
        throw new NotImplementedError();

        return true;
      }
      // TODO: What do these other methods on Proxy do???
    });

  }

  /**
   * Move to a JavaScript object, which will handle any complexity of existing JavaScript objects, and allows one to abstract any values contained in the {vertex} to the usual JavaScript interface. - More usual to how one thinks about functions, ..., properties.
   */
  get any(): { [key: string | symbol]: Ray } & any { return this.self.proxy(); }
  get ___any(): { [key: string | symbol]: Ray } & any { return this.proxy(); }
  cast = <T extends Ray>(): T => { throw new NotImplementedError(); } // TODO this.proxy<T>();

  /**
   * Used for chaining JavaScript-provided properties
   *
   * TODO: DOESNT FOLLOW .ANY PATTERN?
   */
  o = (object: { [key: string | symbol]: any }): Ray => {
    _.keys(object).forEach(key => this.proxy()[key] = object[key]); // TODO: Can be prettier, TODO: map to Ray equivalents and add to vertices..
    return this;
  }

  // All these are dirty
  o2 = ({ initial, vertex, terminal }: any): Ray => {
    if (initial) this.initial.o(initial);
    if (vertex) this.o(vertex);
    if (terminal) this.terminal.o(terminal);

    return this;
  }

  protected property = (property: string | symbol, _default?: any): any => this.any[property] ??= (_default ?? Ray.None()); // TODO: Can this be prettier??

  protected _proxy: any;
  protected _dirty_store: { [key: string | symbol]: object } = {}
  protected proxy = <T = any>(constructor?: JS.ParameterlessConstructor<T>): T & { [key: string | symbol]: Ray } => { // TODO:
    // TODO: IMPLEMENT SPLAT... {...ray.any}
    return this._proxy ??= new Proxy<Ray>(this, {

      get(self: Ray, p: string | symbol, receiver: any): any {

        // throw new NotImplementedError();
        return self._dirty_store[p];
        // return self.as_arbitrary();
      },
      set(self: Ray, p: string | symbol, newValue: any, receiver: any): boolean {
        // TODO:
        // self._dirty_store[p] = JS.is_function(newValue) ? newValue(self._dirty_store[p]) : newValue;
        // throw new NotImplementedError();
        self._dirty_store[p] = newValue;

        return true;
      },

      deleteProperty(self: Ray, p: string | symbol): boolean {
        if (!(p in self._dirty_store)) {
          return false;
        }

        delete self._dirty_store[p];
        return true;
      }
      // TODO: What do these other methods on Proxy do???
    }) as T;
  }

  /**
   *
   * - Don't assume we can track back any reference to this thing. Just destroy it, set everything to None. And let anything else deal with the consequences of the deletion.
   *
   * TODO:
   *   - Could lazily try to find references.
   *   - Implement on proxy for 'delete ray'
   */
  delete = (): Ray => {
    this.self.initial = Ray.None;
    this.self.self = this.self.self_reference;
    this.self.terminal = Ray.None;
    // TODO: REMOVE THESE
    this.self._proxy = undefined;
    this.self._dirty_store = {};

    // Removes the current reference to it.
    this.self = this.self_reference;

    return this;
  }

  //TODO USED FOR DEBUG NOW
  move = (func: (self: Ray) => Ray, memory: boolean, Interface: Ray): Ray => {
    const target_ray = func(this.self);

    const target = target_ray.as_reference().o({
      ...this._dirty_store,
      position:
        target_ray.any.position
        ?? this.any.position
        ?? Ray.POSITION_OF_DOOM
    });
    console.log('move', `${this.self.label.split(' ')[0]} -> ${target.self.label.split(' ')[0]}`);

    if (memory) {
      if (!target_ray.any.traversed) {
        Interface.any.rays.compose(target);
        target_ray.any.traversed = true;
      }
    } else {
      Interface.any.rays = [target];
    }

    return target;
  }

  static POSITION_OF_DOOM = [0, 100, 0]

  // TODO: Abstract away as compilation
  render_options = (Interface: Ray): Required<InterfaceOptions> => {
    return ({
      position:
        this.any.position
        ?? (this.is_none() ? Ray.POSITION_OF_DOOM : Ray.POSITION_OF_DOOM),
      rotation:
        this.any.rotation
        ?? [0, 0, 0],
      scale:
        this.any.scale
        ?? (this.is_none() ? 1.5 : 1.5),
      color:
        (Ray.is_orbit(Interface.any.selection.self, this.self) && Interface.any.cursor.tick) ? '#AAAAAA' // TODO: Should do lines as well, line render should prefer based on level of description.. (flat line only vertices, then render for the vertex?)
          : (
            this.any.color
            ?? (this.is_none() ? 'red' : {
                [RayType.VERTEX]: 'orange',
                [RayType.TERMINAL]: '#FF5555',
                [RayType.INITIAL]: '#5555FF',
                [RayType.REFERENCE]: '#555555',
              }[this.type]
            )
          )
    });
  }

  ___dirty_all(c: Ray[]): Ray[] {
    if (c.filter(a => a.label === this.label).length !== 0) {
      return c;
    }

    c.push(this);

    if (this.initial.as_reference().is_some())
      this.initial.___dirty_all(c);
    if (this.vertex.as_reference().is_some())
      this.vertex.___dirty_all(c);
    if (this.terminal.as_reference().is_some())
      this.terminal.___dirty_all(c);

    return c;
  }

  // TODO: DOESNT DO ON .SELF
  debug = (c: DebugResult): DebugRay => {
    if (c[this.label] !== undefined)
      return c[this.label]!;

    const of = (ray: Ray): string => {
      if (ray.as_reference().is_none()) return 'None';

      ray.debug(c);
      return ray.label;
    }

    const obj: any = { label: this.label };
    c[this.label] = obj;

    obj.label = this.label;
    obj.initial = of(this.initial);
    obj.vertex = of(this.vertex);
    obj.terminal = of(this.terminal);
    obj.type = this.as_reference().type;
    obj.is_initial = this.as_reference().is_initial();
    obj.is_vertex = this.as_reference().is_vertex();
    obj.is_terminal = this.as_reference().is_terminal();
    obj._dirty_store = this._dirty_store;

    return obj;
  }

  /**
   * TODO: This should be constructed at the vertex and in general unsolvable
   */
  static _label: number = 0;
  get label(): string {
    if (this.any.label !== undefined)
      return this.any.label;

    return this.any.label = `"${Ray._label++} (${this.any.debug?.toString() ?? '?'})})"`;
  }

}

//     default = (fn: () => any): any => self.match({
//         Some: (a) => a,
//         None: () => fn()
//     })
//

