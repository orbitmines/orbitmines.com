import _ from "lodash";
import {NotImplementedError, PreventsImplementationBug} from "./errors/errors";
import {InterfaceOptions} from "./OrbitMinesExplorer";


// TODO: SHOULDNT CLASSIFY THESE? (And incorporate in Ray??)
export enum RayType {
  // NONE = '     ',
  REFERENCE = '  |  ',
  INITIAL = '  |-?',
  TERMINAL = '?-|  ',
  VERTEX = '--|--',
}

export type ParameterlessFunction<T = any> = () => T;
export type Arbitrary<T> = (...args: any[]) => T;
export type Constructor<T> = new (...args: any[]) => T;
export type ParameterlessConstructor<T> = new () => T;

// TODO: Merge with Arbitrary.
export type Recursive<T = Ray> = (T | Recursive<T | T[]>)[];
export type Method<T = Ray> = (...other: Recursive<T>) => T;
export type ArbitraryMethod<T = Ray> = (ref: T) => Method<T>;

export type SwitchCases<
  T = Ray,
  SwitchCase extends string | symbol | number = RayType,
  TResult = string | ((self: T) => T)
> = {
  [TCase in SwitchCase]?: TResult
}

export type Implementation<T = Ray> = (ref: T) => T;

/**
 * https://en.wikipedia.org/wiki/Homoiconicity
 */
export interface PossiblyHomoiconic<T extends PossiblyHomoiconic<T>> {
  get self(): T;
  is_reference: () => boolean
  as_reference: () => T
}

export interface AbstractDirectionality<T> { initial: Arbitrary<T>, vertex: Arbitrary<T>, terminal: Arbitrary<T> }

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
 * All the methods defined here should be considered deprecated, are there to help with JavaScript implementation only.
 *
 * TODO:
 * - Homotopy equivalence merely as some direction/reversibility constraint on some direction, ignoring additional structure (or incorporating it into the equiv) at the vertices. (Could be loosened where certain vertex-equivalences are also part of the homotopy)
 * - Induced ignorance/equivalence along arbitrary rays.
 * - Usual way of thinking about vertices is what the coninuations are here - phrase that somewhjere
 *
 * TODO: Any javascript class, allow warpper of function names around any ray, as a possible match
 * TODO: All the methods defined here should be implemented in some Ray structure at some point
 * TODO: Easy method to create initial/terminal, right now it's a bit obscure
 *
 * TODO: Maybe want a way to destroy from one end, so that if other references try to look, they won't find additional structure. - More as a javascript implementation quirck if anything?
 *
 * TODO: Can do some workaround overloading through properties, at least for +/-
 *
 * TODO: Singlke keybind for now to show/hide the ray disambiguation or 'dead edges/..'/
 *
 *
 *
 *
 *
 * TODO: Consistency of Arbitrary vs non-arbitrary.
 */
export class Ray // Other possibly names: AbstractDirectionality, ..., ??
  implements
      PossiblyHomoiconic<Ray>,

      AsyncIterable<Ray>,
      Iterable<Ray>
      // Array<Ray>
      // Dict<Ray>
{
  // TODO: Could make a case that setting the terminal is more of a map, defaulting/first checking the terminal before additional functionality is mapped over that.

  protected _initial: Arbitrary<Ray>; get initial(): Ray { return this._initial(); } set initial(initial: Arbitrary<Ray>) { this._initial = initial; }
  protected _vertex: Arbitrary<Ray>; get vertex(): Ray { return this._vertex(); } set vertex(vertex: Arbitrary<Ray>) { this._vertex = vertex; }
  protected _terminal: Arbitrary<Ray>; get terminal(): Ray { return this._terminal(); } set terminal(terminal: Arbitrary<Ray>) { this._terminal = terminal; }

  get self(): Ray { return this.vertex; }; set self(self: Arbitrary<Ray>) { this.vertex = self; }

  [index: number]: Ray;

  constructor({ initial, vertex, terminal, }: Partial<AbstractDirectionality<Ray>> = {}) {
    this._initial = initial ?? Ray.None;
    this._vertex = vertex ?? this.self_reference; // TODO: None, could also self-reference the ray on which it's defining to be None. Now it's just an ignorant loop.
    this._terminal = terminal ?? Ray.None;
  }

  /** [  |-?] */ is_initial = (): boolean => this.is_some() && this.self.initial.is_none();
  /** [--|--] */ is_vertex = (): boolean => !this.is_initial() && !this.is_terminal();
  /** [?-|  ] */ is_terminal = (): boolean => this.is_some() && this.self.terminal.is_none();
  /** [  |  ] */ is_reference = (): boolean => this.is_initial() && this.is_terminal();

  get type(): RayType {
    /** [  |  ] */ if (this.is_reference()) return RayType.REFERENCE;
    /** [  |-?] */ if (this.is_initial()) return RayType.INITIAL;
    /** [?-|  ] */ if (this.is_terminal()) return RayType.TERMINAL;
    // /** [     ] */ if (this.is_empty()) return RayType.NONE;
    /** [--|--] */ return RayType.VERTEX;
  }

  /**
   * This is basically what breaks the recursive structure. Imagine a Ray like this: [|--|--|]. There are several ways of interpreting it, either there's a boolean on initial, vertex, terminal; Some 'false' value, says there's nothing there. Some true value says there's something there. - Basically an Option, ..., Maybe as in certain languages.
   *
   * ---
   *
   * Another way of interpreting a possible way of implementing it, is no matter how much more detail we would like to ask, the only thing we ever see is the same structure again (if we ignore the difference of us asking about that additional structure, that's still a possible handle on some difference).
   *
   * As a way of saying/.../assuming: I only 'infinitely' assume it's only this structure, "it seems to halt here". Note that this is necessarily an assumption. No guarantee of this can be made. This is necessarily an equivalence, ..., ignorance.
   *
   * See more: https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Quite%20similarly%20to%20the%20loops%2C%20I%20could%20be%20ignorant%20of%20additional%20structure%20by%20assuming%20it%27s%20not%20there.
   *
   * ---
   *
   * Concretely, we use here "whatever the JavaScript engine run on" as the thing which has power over the equivalence assumption we use to halt programs. - The asymmetry which allows the engine to make a distinction between each object.
   */
  is_none = (): boolean => this.is_orbit(this.self, this.self.self);

  protected is_orbit = (a: Ray, b: Ray) => a === b; // is, ..., appears equal.
  protected self_reference = () => this;

  is_some = (): boolean => !this.is_none();

  /** [     ] */ static None = () => new Ray({ }).o({ });
  /** [--?--] */ static vertex = (value: Arbitrary<Ray> = Ray.None) => {
    // /** [?????] -> [  ???] */ as_initial = () => new Ray({ vertex: () => this.initial, terminal: this.as_arbitrary(), js: () => 'initial ref' });
    // /** [?????] -> [???  ] */ as_terminal = () =>
    //   new Ray({ initial: this.as_arbitrary(), vertex: () => this.terminal, js: () => 'terminal ref' }); // TODO: These fields as DEBUG

    /** [     ] */ const vertex = Ray.None();
    /** [--   ] */ vertex.initial = new Ray({ vertex: Ray.None, terminal: vertex.as_arbitrary() }).o({ debug: 'initial ref'}).as_arbitrary();
    /** [  ?  ] */ vertex.vertex = value;
    /** [   --] */ vertex.terminal = new Ray({ vertex: Ray.None, initial: vertex.as_arbitrary() }).o({ debug: 'terminal ref'}).as_arbitrary()

    /** [--?--] */ return vertex;
  }
  /** [  |-?] */ static initial = () => Ray.vertex().initial;
  /** [?-|  ] */ static terminal = () => Ray.vertex().terminal;

  static size = (of: number, value: any = undefined): Ray => {
    let current = Ray.vertex().as_reference(); // TODO; This sort of thing should be lazy
    for (let i = 0; i < of; i++) {
      current = current.continues_with(Ray.vertex(JS.Any(value).as_arbitrary()).as_reference());
    }

    return current;
  }

  /** A ray whose vertex references this Ray (ignorantly - 'this' doesn't know about it). **/
  /** [?????] -> [  |  ] */ as_reference = (): Ray => new Ray({ vertex: this.as_arbitrary() });


  // as_option = (): Ray => Option.Some(this);
  as_arbitrary = (): Arbitrary<Ray> => () => this;

  // TODO: Should also be abstracted into the Ray
  // TODO: Automatic opposite for initial/terminaL??
  switch = (cases: SwitchCases): Ray => {
    const _case = cases[this.type];

    if (_case === undefined || _.isString(_case))
      throw new PreventsImplementationBug(_case ?? `?? ${this.type}`);

    return _case(this);
  }

  /**
   * Constructs a function accepting arbitrary structure based on one implementation of it.
   *
   * TODO: Is there some equivalent of this in computer science??? category theory??
   *
   * a.compose(b).compose(c) = [a, b, c].compose = abc.compose = [[a1, a2], b, c].compose = [[a1, a2], b, [c1, c2]].compose = [[a1, [[[a2]]], [[[[]]], []]], b, [[[]], [], [c]]].compose = ...
   */
  static ___func = (
    func: Implementation
  ): ArbitraryMethod => {

    /**
     * Puts the Ray this is called with on a new Ray [initial = ref, ???, ???]. Then it places any structure it's applying a method to, on the terminal of this new Ray [initial = ref, ???, terminal = any]
     */
    return (ref: Ray): Method => (...any: Recursive): Ray => {
      // TODO: This can be much better...
      const first = (recursive?: Recursive): Ray | undefined => {
        if (recursive === undefined) return;
        // if (_.isObject(recursive)) return recursive as unknown as Ray;

        for (let r of recursive) {
          if (r === undefined) continue;
          if (_.isObject(r)) return r as unknown as Ray;

          // if (r instanceof Ray)
          //   throw new PreventsImplementationBug();

          // @ts-ignore
          const _first = first(r);
          if (_first)
            return _first;
        }
      }

      const _first = first(any);

      if (_first === undefined)
        return func(ref);

      // TODO: ANY CASE
      // if (any.length === 1) {
        return func(new Ray({
          initial: ref.as_arbitrary(),
          terminal: _first.as_arbitrary() // TODO Can be lazy./.., generalize this to some way >
        }).as_reference()); // TODO; ref here necessary? Probably...
      // }
      //
      // throw new NotImplementedError();
    }
  }

  static equivalent= Ray.___func(ref => {
    const { initial, terminal } = ref.self;

    return initial.switch({
      [RayType.REFERENCE]: () => terminal.switch({
        [RayType.REFERENCE]: () => {
          // TODO: IS THIS EVEN HOW THIS SHOULD WORK?? - Now just takes the pointer and assumes that as its own
          initial.self = terminal.as_arbitrary();
          terminal.self = initial.as_arbitrary();

          return ref;
        }
      }),
      [RayType.VERTEX]: () => terminal.switch({
        [RayType.VERTEX]: () => {
          // TODO: COULD ADD?? - probably the case for all these equivalences.
          initial.self.self = terminal.self.as_arbitrary();
          terminal.self.self = initial.self.as_arbitrary();

          return ref;
        }
      })
    });

    // TODO: Returns the ref, since it still holds the information on how they're not the same??? - Need some intuitive way of doing this?
    // TODO a.equivalent(b).equivalent(c), in this case would be [[a, b]].equivalent(c) not [a, b, c].equivalent ???
  });
  equivalent = Ray.equivalent(this);
  // protected equivalent = (b: Ray) => { // TODO: Generic, now just ignorantly sets the vertices to eachother

  // TODO AS += through property
  static continues_with = Ray.___func(ref => {
    // TODO: contiues_with is just composing vertices..
    // TODO: Should be: ([this, self_reference, b] as Ray).compose/../merge, dropping this middle vertex, connecting initial/terminal
    // TODO: Or otherwise: take everything at the vertex, compose it together??>?

    const { initial, terminal } = ref.self;

    // TODO; Maybe replace switch with 'zip'?, What are the practical differences?
    return initial.switch({
      [RayType.REFERENCE]:
      "We could either go inside the reference and continue there, or expand the direction of reference." +
      "We could move when a reference is on the vertex, set the type to vertex from the perspective of the reference",
      [RayType.TERMINAL]: "",
      [RayType.INITIAL]: "Could be each element found in this direction, or continue *after* the entire direction",
      [RayType.VERTEX]: (): Ray => {
        // const next_vertex = b; // TODO: Could be a reference too, now just force as a next element

        if (initial.is_none()) {
          // 'Empty' vertex from this perspective.

          initial.vertex = terminal.as_arbitrary();
          console.log('first element');
          return terminal; // TODO: Generally, return something which knows where all continuations are.
        }

        return terminal.switch({
          [RayType.VERTEX]: () => {
            initial.self.terminal.equivalent(terminal.self.initial);
            return terminal;
          }
        });
      }
    });
  });
  continues_with = Ray.continues_with(this);

  // @alias('merge') ?? TODO
  static compose = Ray.___func(ref => {
    const { initial, terminal } = ref.self;

    return initial.switch({
      [RayType.VERTEX]: () => {
        const vertex = initial.self;

        // TODO; Implement as restrictive case for Chyp
        {
          // if (this.self.initial.count.as_int() !== this.terminal.count.as_int())
          //   throw new NotImplementedError(`Initial (Graph.Domain) does not match Terminal (Graph.Codomain)`);

          // Check that codomain of this graph matches the domain of the other: this is required for valid sequential composition.
          // if (this.self.initial.is_equivalent(this.self.terminal))
          //   throw new NotImplementedError('Initial (Graph.Domain) does not match Terminal (Graph.Codomain) types.'); // TODO; Should take care of vtype/size matches at input/output
        }

        /**
         * A simple case of what we want to solve here.
         *
         * Initial         Terminal
         *   ...             ...
         * [--|  ]         [  |--]
         * [--|  ]         [  |--]
         * [--|  ]         [  |--]
         * [  |--] [--|--] [--|  ]
         *         vertex
         *
         * And recursively (arbitrarily) match initial/terminal structures.
         */

        throw new NotImplementedError();
      }
    })
  });
  compose = Ray.compose(this);

  // zip also compose???
  // [a, b, c] zip [d, e, f] zip [g, h, i] ...
  // [[a,d,g],[b,e,h],[c,f,i]]
  zip = (): Ray => { throw new NotImplementedError(); }

  /**
   * Compose structures defined at .initial with those at .terminal, dropping the vertex. ; or if done non-ignorantly. Composing them on another level, ignoring to this vertex. TODO: Allow this freedom
   */
  get merge(): Ray {
    // concat initial.a + initial.b, terminal.a + terminal.b
    // then: either destroy a/b, merge structure... etc..
    // Chyp: destroy b

    // this.initial.equivalent(other.initial);
    // this.terminal.equivalent(other.terminal);

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

  pop = (): Ray => this.switch({
    [RayType.VERTEX]: () => {
      const previous_vertex = this.self.initial.self.initial.as_reference();

      if (this.is_none()) {
        return this; // TODO; Already empty, perhaps throw
      }

      return previous_vertex.switch({
        [RayType.VERTEX]: () => {
          console.log(previous_vertex)
          // TODO: NONHACKY

          previous_vertex.self.terminal = new Ray({ vertex: Ray.None, initial: previous_vertex.self.as_arbitrary() }).o({ debug: 'terminal ref'}).as_arbitrary()
          return previous_vertex;
        }
      });
    }
  });

  /**
   * next = (): Option<Ray> => JS.Iterable(this.traverse({ steps: 1 })).as_ray();
   * previous = (): Option<Ray> => JS.Iterable(this.traverse({ steps: 1, direction: { reverse: true } })).as_ray();
   */
  // TODO: These necessarily rever to something which allows you to ask the question of 'next' again. It could return many values (initial/terminal?), a single one: vertex; on which again more structure like a list or something could be defined...
  get previous(): Ray { throw new NotImplementedError(); }

  /**
   *
   * @param direction Generalized as 'some function'.
   */
  static ___next = (direction: (ray: Ray) => Ray) => {
    const method = Ray.___func(ref => {
      const { initial, terminal } = ref.self;

      return initial.switch({
        [RayType.VERTEX]: () => terminal.switch({

          // Many possible continuations
          [RayType.VERTEX]: () => {
            throw new NotImplementedError()
          },

          // No continuations, either a self-reference, or different ways of halting.
          [RayType.TERMINAL]: () => Ray.None(),

          // A possible continuation
          [RayType.INITIAL]: (ref) =>
            direction(ref).as_reference() // TODO Why is this reference needed?
              .switch({ // TODO: This is applying the function again, should be separate?
            // Found a next Vertex.
            [RayType.VERTEX]: (self) => self,
            // [RayType.VERTEX]: (self) => { throw new NotImplementedError(); },

            // TODO: Same, but defined a step further
            // [RayType.TERMINAL]: () => Ray.None(),
            [RayType.TERMINAL]: () => { throw new NotImplementedError(); },

            // TODO: This switch could repeat infinitely, we need a way to hook into each step..
            [RayType.INITIAL]: () => { throw new NotImplementedError(); },

            // TODO: Similar to Initial, probably follow the reference, possibly infintely...
            [RayType.REFERENCE]: (ref) => {
              // throw new NotImplementedError(`${ref.type}/${ref.self.type} - ${ref.any.js}/${ref.self.any.js}`);
              //
              // if (ref.self.type === RayType.VERTEX)
              //   return ref.self;

              throw new NotImplementedError(`${ref.type} ${ref.self.type}`);
            }
          }),

          // TODO: Possibly follow infintely
          [RayType.REFERENCE]: () => { throw new NotImplementedError(); }

        })
      })
    });

    // TODO Implemented as ___func, indicating terminal as the direction of next? as in 'this.next(this => this.self.terminal)' as default, basically, .next is generalizable to any function...

    return (ref: Ray) => method(ref)(direction(ref)); // TODO: Merge __next into __func, make this cleaner...
  }

  get next() { return Ray.___next(ref => ref.self.terminal)(this) }
  // TODO: Could need equivalence/skip logic, "already was here", or say, necessarily, it should get visited again, ... again this thing is hard to say generally.
  // TODO: This is the same with rewrite/compile/compose/dpo ...

  // TODO NEEDS TO CHECK IF THERE'S SOME INITIAL DEFIEND ; for defining if it has halted

  get first(): Ray { throw new NotImplementedError(); }
  get last(): Ray { throw new NotImplementedError(); }

  // TODO: I Don't like this name, but it needs to get across that any equivalency, or any equivalency check for that necessarily, is local. And I want more equivalences, I run more of this method.
  // TODO: For chyp used to compare [vtype, size] as domains, just type matching on the vertex.
  is_vertex_equivalent = (b: Ray) => {
    // TODO; in the case of a list, each individually, again, additional structure...
  }
  // TODO: Ignore the connection between the two, say a.equiv(b) within some Rule [a,b], ignore the existing of the connection in the Rule? What does it mean not to???
  is_equivalent = (b: Ray): boolean => { return false; } // TODOl: Current references assume you can't go inside vertex..
  // TODO implement .not??

  // TODO: Perhaps locally cache count?? - no way to ensure globally coherenct
  get count(): Ray { throw new NotImplementedError() }

  // TODO; Could return the ignorant reference to both instances, or just the result., ..
  copy = (): Ray => { throw new NotImplementedError() }

  // @alias('converse', 'opposite', 'swap')
  get reverse(): Ray {
    const copy = this;//TODO.copy();

    // TODO: Do we do this lazy by default? Just using refs??? - Or abstract this elsewhere to decide what to do
    const swap = copy.initial;
    copy.initial = copy.terminal.as_arbitrary();
    copy.terminal = swap.as_arbitrary();
    // TODO: This doesn't actually work

    return copy;
  }

  // export const at = (index: number, of: number, value: any = undefined): Arbitrary<Ray<any>> => {
//   return Arbitrary.Fn(() => length(of, value).resolve().at_terminal(index));
// }
//
  // step = this.at; ???
  at = (steps: number | Ray | Arbitrary<Ray>): Ray => { throw new NotImplementedError(); }
  //
// export const permutation = (permutation: number | undefined, of: number): Arbitrary<Ray<any>> => at(
//   // In the case of a bit: 2nd value for '1' (but could be the reverse, if our interpreter does this)
//   permutation ?? 0,
//   // In the case of a bit: Either |-*-| if no bit or |-*->-*-| if a bit.
//   permutation === undefined ? 1 : of
// )
//
  // export const hexadecimal = (hexadecimal?: string): Arbitrary<Ray<any>> => permutation(hexadecimal ? parseInt(hexadecimal, 16) : undefined, 16);

  // TODO: Should give the program that does the mapping, not the result, and probably implemented as 'compile/traverse'
  map = (mapping: (ray: Ray) => Ray | any): Ray => { throw new NotImplementedError(); }
  all = (mapping: (ray: Ray) => Ray | any): Ray => { throw new NotImplementedError(); }
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
  apply = (func: Ray) => {

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
  }

  // ___compute = ()

  *traverse(): Generator<Ray> {}

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
    as_array = (): any[] => [...this];
    // JS.String
    toString = (): string => this.as_array().toString();
    as_string = () => this.toString();

    as_int = (): number => { throw new NotImplementedError(); }
    as_number = this.as_int;

  /**
   * Move to a JavaScript object, which will handle any complexity of existing JavaScript objects, and allows one to abstract any values contained in the {vertex} to the usual JavaScript interface. - More usual to how one thinks about functions, ..., properties.
   */
  get any(): { [key: string | symbol]: Ray } & any { return this.proxy(); }
  cast = <T extends Ray>(): T => this.proxy<T>();

  /**
   * Used for chaining JavaScript-provided properties
   */
  o = (object: { [key: string | symbol]: any }): Ray => {
    _.keys(object).forEach(key => this.any[key] = object[key]); // TODO: Can be prettier, TODO: map to Ray equivalents and add to vertices..
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
  protected proxy = <T = any>(constructor?: ParameterlessConstructor<T>): T & { [key: string | symbol]: Ray } => { // TODO:
    // TODO: IMPLEMENT SPLAT... {...ray.any}
    return this._proxy ??= new Proxy<Ray>(this, {
      get(self: Ray, p: string | symbol, receiver: any): any {

        // throw new NotImplementedError();
        return self._dirty_store[p];
        // return self.as_arbitrary();
      },
      set(self: Ray, p: string | symbol, newValue: any, receiver: any): boolean {
        // throw new NotImplementedError();
        self._dirty_store[p] = newValue;

        return true;
      }

      // TODO: What do these other methods on Proxy do???
    }) as T;
  }

  get delete(): Ray {
    this.self = Ray.None; // TODO; I made a lazy delete comment somewhere?
    return this;
  }

  //TODO USED FOR DEBUG NOW
  move = (func: (self: Ray) => Ray, memory: boolean, Interface: Ray): Ray => {
    const target_ray = func(this.self);

    const target = target_ray.as_reference().o({
      ...this._dirty_store,
      position:
        target_ray.any.position
        ?? this.self.any.position
        ?? Ray.POSITION_OF_DOOM
    });
    console.log('move', `${this.self.label.split(' ')[0]} -> ${target.self.label.split(' ')[0]}`);

    if (memory) {
      if (!target_ray.any.traversed) {
        Interface.any.rays.push(target);
        target_ray.any.traversed = true;
      }
    } else {
      Interface.any.rays = [target];
    }

    return target;
  }

  static POSITION_OF_DOOM = [0, 100, 0]

  // TODO: Abstract away as compilation
  get render_options(): Required<InterfaceOptions> {
    return ({
      position:
        this.self.any.position
        ?? (this.is_none() ? Ray.POSITION_OF_DOOM : Ray.POSITION_OF_DOOM),
      rotation:
        this.self.any.rotation
        ?? [0, 0, 0],
      scale:
        this.self.any.scale
        ?? (this.is_none() ? 1.5 : 1.5),
      color:
        this.self.any.color
        ?? (this.is_none() ? 'red' : {
            [RayType.VERTEX]: 'orange',
            [RayType.TERMINAL]: '#FF5555',
            [RayType.INITIAL]: '#5555FF',
            [RayType.REFERENCE]: '#555555',
          }[this.type]
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

  push_back = (ray: Ray) => { throw new NotImplementedError(); }
  push_front = (ray: Ray) => { throw new NotImplementedError(); }

  // length: number;
  //
  // concat(...items: ConcatArray<Ray>[]): Ray[];
  // concat(...items: (ConcatArray<Ray> | Ray)[]): Ray[];
  // concat(...items: (ConcatArray<Ray> | Ray)[]): Ray[] {
  //   return [];
  // }
  //
  // copyWithin(target: number, start: number, end?: number): this {
  //   return undefined;
  // }
  //
  // entries(): IterableIterator<[number, Ray]> {
  //   return undefined;
  // }
  //
  // every<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): this is S[];
  // every(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): boolean;
  // every(predicate, thisArg?: any): any {
  // }
  //
  // fill(value: Ray, start?: number, end?: number): this {
  //   return undefined;
  // }
  //
  // filter<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): S[];
  // filter(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): Ray[];
  // filter(predicate, thisArg?: any): any {
  // }
  //
  // find<S extends Ray>(predicate: (value: Ray, index: number, obj: Ray[]) => value is S, thisArg?: any): S | undefined;
  // find(predicate: (value: Ray, index: number, obj: Ray[]) => unknown, thisArg?: any): Ray | undefined;
  // find(predicate, thisArg?: any): any {
  // }
  //
  // findIndex(predicate: (value: Ray, index: number, obj: Ray[]) => unknown, thisArg?: any): number {
  //   return 0;
  // }
  //
  // forEach(callbackfn: (value: Ray, index: number, array: Ray[]) => void, thisArg?: any): void {
  // }
  //
  // indexOf(searchElement: Ray, fromIndex?: number): number {
  //   return 0;
  // }
  //
  // join(separator?: string): string {
  //   return "";
  // }
  //
  // keys(): IterableIterator<number> {
  //   return undefined;
  // }
  //
  // lastIndexOf(searchElement: Ray, fromIndex?: number): number {
  //   return 0;
  // }
  //
  // map<U>(callbackfn: (value: Ray, index: number, array: Ray[]) => U, thisArg?: any): U[] {
  //   return [];
  // }
  //
  // pop(): Ray | undefined {
  //   return undefined;
  // }
  //
  // push(...items: Ray[]): number {
  //   return 0;
  // }
  //
  // reduce(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray): Ray;
  // reduce(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray, initialValue: Ray): Ray;
  // reduce<U>(callbackfn: (previousValue: U, currentValue: Ray, currentIndex: number, array: Ray[]) => U, initialValue: U): U;
  // reduce(callbackfn, initialValue?): any {
  // }
  //
  // reduceRight(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray): Ray;
  // reduceRight(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray, initialValue: Ray): Ray;
  // reduceRight<U>(callbackfn: (previousValue: U, currentValue: Ray, currentIndex: number, array: Ray[]) => U, initialValue: U): U;
  // reduceRight(callbackfn, initialValue?): any {
  // }
  //
  // reverse(): Ray[] {
  //   return [];
  // }
  //
  // shift(): Ray | undefined {
  //   return undefined;
  // }
  //
  // slice(start?: number, end?: number): Ray[] {
  //   return [];
  // }
  //
  // some(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): boolean {
  //   return false;
  // }
  //
  // sort(compareFn?: (a: Ray, b: Ray) => number): this {
  //   return undefined;
  // }
  //
  // splice(start: number, deleteCount?: number): Ray[];
  // splice(start: number, deleteCount: number, ...items: Ray[]): Ray[];
  // splice(start: number, deleteCount?: number, ...items: Ray[]): Ray[] {
  //   return [];
  // }
  //
  // unshift(...items: Ray[]): number {
  //   return 0;
  // }
  //
  // values(): IterableIterator<Ray> {
  //   return undefined;
  // }
  //
  // findLast<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): S | undefined;
  // findLast(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): Ray | undefined;
  // findLast(predicate, thisArg?: any): any {
  // }
  //
  // findLastIndex(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): number {
  //   return 0;
  // }
  //
  // flat<A, D = 1 extends number>(depth?: D): FlatArray<A, D>[] {
  //   return [];
  // }
  //
  // flatMap<U, This = undefined>(callback: (this: This, value: Ray, index: number, array: Ray[]) => (ReadonlyArray<U> | U), thisArg?: This): U[] {
  //   return [];
  // }
  //
  includes(searchElement: Ray, fromIndex?: number): boolean {
    return false;
  }
  //
  // toReversed(): Ray[] {
  //   return [];
  // }
  //
  // toSorted(compareFn?: (a: Ray, b: Ray) => number): Ray[] {
  //   return [];
  // }
  //
  // toSpliced(start: number, deleteCount: number, ...items: Ray[]): Ray[];
  // toSpliced(start: number, deleteCount?: number): Ray[];
  // toSpliced(start: number, deleteCount?: number, ...items: Ray[]): Ray[] {
  //   return [];
  // }
  //
  // with(index: number, value: Ray): Ray[] {
  //   return [];
  // }


}
//     force = (): any => self.match({
//         Some: (a) => a,
//         None: () => { throw new Error('Expected Some(value) to be present but found None.') }
//     });
//
//     default = (fn: () => any): any => self.match({
//         Some: (a) => a,
//         None: () => fn()
//     })
//
//     none_or = (or: (obj: any) => any): Option<any> => {
//       return self.match({
//         Some: (some: any) => Option.Some(or(some)),
//         None: () => Ray.None
//       })
//     }

/**
 *
 * Important to remember this is just one particular structure to which it can be mapped, there are probably many (infinitely?) others.
 *
 * Not to be considered as a perfect mapping of JavaScript functionality - merely a practical one.
 */

  // Number: (number: number) => typeof number,
  // Function: (func: ParameterlessFunction) => typeof func,

  // Number: (number: number) => number,
  // Function: (func: ParameterlessFunction) => func,


export namespace JS {
  export const Boolean = (boolean: boolean): Ray => {
    // |-false->-true-| (could of course also be reversed)
    const _false = Ray.vertex().o({ js: false });
    const _true = Ray.vertex().o({ js: true });
    _false.continues_with(_true);

    return (boolean ? _true : _false).as_reference();
  }
  // export const bit = (bit?: boolean): Arbitrary<Ray<any>> => permutation(bit ? 1 : 0, 2);
  export const Bit = Boolean;

  export const Iterable = <T = any>(iterable: Iterable<T>): Ray => JS.Iterator(iterable[Symbol.iterator]());

  export const Iterator = <T = any>(iterator: Iterator<T>): Ray => {
    // [  |--]

    const next = (initial: Ray): Ray => {
      const iterator_result = iterator.next();
      const is_terminal = iterator_result.done === true;

      if (is_terminal) {
        // We're done, this is the end of the iterator

        // vertex: could have something at the vertex which defines the "end of the iterator" - but we don't here.
        const terminal = new Ray({
          initial: () => initial
        });
        // initial.continues_with(() => terminal.as_reference());

        // if (initial.is_some())
        //   initial.terminal = () => terminal; // TODO REPEAT FROM BELOW

        return terminal;
      }

      const current: Ray = new Ray({
        // initial: () => new Ray(),
        initial: () => initial,
        vertex: () => JS.Any(iterator_result.value),
        terminal: () => next(current)
      }).o({js: iterator_result.value});

      // initial.continues_with(() => current.as_reference());
      if (initial.is_some())
        initial.terminal = () => current;

      return current;
    }

    const ray_iterator = Ray.None().o({ js: iterator });
    ray_iterator.terminal = () => next(ray_iterator);

    // This indicates we're passing a reference, since traversal logic will be defined at its vertex - what it's defining.
    return ray_iterator.as_reference();
  }

  export const Generator = <T = any>(generator: Generator<T>): Ray => JS.Iterable(generator);

  // export const AsyncGenerator = <T = any>(generator: AsyncGenerator<T>): Ray => {
  //   // [  |--]
  //   return JS.Iterable(generator);
  // }

  export const Number = (number: number): Ray => {
    throw new NotImplementedError();
  }

  export const Function = (func: Arbitrary<any>): Ray => {
    throw new NotImplementedError();
  }

  export const Object = (object: object): Ray => Ray.vertex().o(object);

  export const Any = (any: any): Ray => {
    if (any === null || any === undefined) return JS.Any(any);
    if (JS.is_boolean(any)) return JS.Boolean(any);
    if (JS.is_number(any)) return JS.Number(any);
    if (JS.is_iterable(any)) return JS.Iterable(any); // || is_array(any))
    if (JS.is_function(any)) return JS.Function(any);
    if (JS.is_object(any)) return JS.Object(any);

    // TODO
    // return JS.Any(any);
    return Ray.vertex().o({js: any});
  }

  export const is_boolean = (_object: any): _object is boolean => _.isBoolean(_object);
  export const is_number = (_object: any): _object is number => _.isNumber(_object);
  export const is_object = (_object: any): _object is object => _.isObject(_object);
  export const is_iterable = <T = any>(_object: any): _object is Iterable<T> => Symbol.iterator in Object(_object);
  export const is_async_iterable = <T = any>(_object: any): _object is AsyncIterable<T> => Symbol.asyncIterator in Object(_object);
  export const is_array = <T = any>(_object: any): _object is T[] => _.isArray(_object);
  export const is_async = (_object: any) => _.has(_object, 'then') && is_function(_.get(_object, 'then')); // TODO, Just an ugly check

  export const is_error = (_object: any): _object is Error => _.isError(_object);
  export const is_function = (_object: any): _object is ((...args: any[]) => any) => _.isFunction(_object);
}