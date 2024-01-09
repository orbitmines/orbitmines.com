import _ from "lodash";
import {NotImplementedError, PreventsImplementationBug} from "./errors/errors";


// SHOULDNT CLASSIFY THESE?
export enum RayType {
  // NONE = '     ',
  REFERENCE = '  |  ',
  INITIAL = '  |-?',
  TERMINAL = '?-|  ',
  VERTEX = '--|--',
}

export type ParameterlessFunction<T = any> = () => T;
export type Arbitrary<T> = (...args: any[]) => T;

/**
 * https://en.wikipedia.org/wiki/Homoiconicity
 */
export interface PossiblyHomoiconic<T extends PossiblyHomoiconic<T>> {
  get self(): T;
  is_reference: () => boolean
  as_reference: () => T
}

export interface AbstractDirectionality<T> { initial: Arbitrary<T>, vertex: Arbitrary<T>, terminal: Arbitrary<T> }

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
 */
export class Ray // Other possibly names: AbstractDirectionality, ..., ??
  implements
      PossiblyHomoiconic<Ray>,

      AsyncIterable<Ray>,
      Iterable<Ray>,
      Array<Ray>
      // Dict<Ray>
{

  js: Arbitrary<any>

  // TODO: Could make a case that setting the terminal is more of a map, defaulting/first checking the terminal before additional functionality is mapped over that.

  protected _initial: Arbitrary<Ray>; get initial(): Ray { return this._initial(); } set initial(initial: Arbitrary<Ray>) { this._initial = initial; }
  protected _vertex: Arbitrary<Ray>; get vertex(): Ray { return this._vertex(); } set vertex(vertex: Arbitrary<Ray>) { this._vertex = vertex; }
  protected _terminal: Arbitrary<Ray>; get terminal(): Ray { return this._terminal(); } set terminal(terminal: Arbitrary<Ray>) { this._terminal = terminal; }

  get self(): Ray {
    // if (!this.vertex.is_none())
    //   throw new PreventsImplementationBug('Preventing bugs, .self is used for the assumption of a reference..');
    //
    return this.vertex;
  };
  set self(self: Arbitrary<Ray>) {
    // if (!this.is_reference())
    //   throw new PreventsImplementationBug('Preventing bugs, .self is used for the assumption of a reference..');
    //
    this.vertex = self;
  }

  [index: number]: Ray;

  constructor({ initial, vertex, terminal,
    js,
  }: { js?: Arbitrary<any> } & Partial<AbstractDirectionality<Ray>> = {}) {
    this._initial = initial ?? Ray.None;
    this._vertex = vertex ?? this.self_reference; // TODO: None, could also self-reference the ray on which it's defining to be None. Now it's just an ignorant loop.
    this._terminal = terminal ?? Ray.None;
    this.js = js ?? Ray.None;
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
  is_none = (): boolean => this.self === this.self.self;

  protected self_reference = () => this;

  is_some = (): boolean => !this.is_none();

  /** [     ] */ static None = () => new Ray({ });
  /** [--?--] */ static vertex = (value: Arbitrary<Ray> = Ray.None) => {
    // /** [?????] -> [  ???] */ as_initial = () => new Ray({ vertex: () => this.initial, terminal: this.as_arbitrary(), js: () => 'initial ref' });
    // /** [?????] -> [???  ] */ as_terminal = () =>
    //   new Ray({ initial: this.as_arbitrary(), vertex: () => this.terminal, js: () => 'terminal ref' }); // TODO: These fields as DEBUG

    /** [     ] */ const vertex = Ray.None();
    /** [--   ] */ vertex.initial = new Ray({ vertex: Ray.None, terminal: vertex.as_arbitrary(), js: () => 'initial ref' }).as_arbitrary();
    /** [  ?  ] */ vertex.vertex = value;
    /** [   --] */ vertex.terminal = new Ray({ vertex: Ray.None, initial: vertex.as_arbitrary(), js: () => 'terminal ref' }).as_arbitrary()

    /** [--?--] */ return vertex;
  }
  static js = (value: any) => { const vertex = Ray.vertex(); vertex.js = () => value; return vertex; }

  static size = (of: number, value: any = undefined): Ray => {
    let current = Ray.vertex().as_reference(); // TODO; This sort of thing should be lazy
    for (let i = 0; i < of; i++) {
      current = current.continues_with(Ray.js(value).as_reference());
    }

    return current;
  }

  /** A ray whose vertex references this Ray (ignorantly - 'this' doesn't know about it). **/
  /** [?????] -> [  |  ] */ as_reference = (): Ray => new Ray({ vertex: this.as_arbitrary() });

  // as_option = (): Ray => Option.Some(this);
  as_arbitrary = (): Arbitrary<Ray> => () => this;

  continues_with = (b: Ray): Ray => {
    // TODO: contiues_with is just composing vertices..

    switch (this.type) {
      case RayType.REFERENCE: {
        // TODO: We could either go inside the reference and continue there, or expand the direction of reference
        // TODO: We could move when a reference is on the vertex, set the type to vertex from the perspective of the reference
        throw new PreventsImplementationBug();
      }
      case RayType.TERMINAL:
      case RayType.INITIAL: {
        // TODO: Could be each element found in this direction, or continue *after* the entire direction
        throw new PreventsImplementationBug();
      }
      case RayType.VERTEX: {
        const next_vertex = Ray.vertex(b.as_arbitrary()); // TODO: Could be a reference too, now just force as a next element

        if (this.is_none()) {
          // 'Empty' vertex from this perspective.

          this.vertex = next_vertex.as_arbitrary();
          console.log('first element');
          return next_vertex.as_reference(); // TODO: Generally, return something which knows where all continuations are.
        }

        // this.self.terminal = next_vertex.initial; equivalence#

        // switch (b.type) {
        //   case RayType.REFERENCE:
        //     break;
        //   case RayType.INITIAL:
        //     break;
        //   case RayType.TERMINAL:
        //     break;
        //   case RayType.VERTEX:
        //     break;
        // }

        return next_vertex.as_reference();
      }
    }
  }

  // TODO NEEDS TO CHECK IF THERE'S SOME INITIAL DEFIEND ; for defining if it has halted

  equivalent = (other: Ray) => { throw new NotImplementedError(); }

  // TODO: Perhaps locally cache count?? - no way to ensure globally coherenct
  count = (): Ray => { throw new NotImplementedError() }

  // TODO; Could return the ignorant reference to both instances, or just the result., ..
  copy = (): Ray => { throw new NotImplementedError() }

  // export const at = (index: number, of: number, value: any = undefined): Arbitrary<Ray<any>> => {
//   return Arbitrary.Fn(() => length(of, value).resolve().force().at_terminal(index));
// }
//
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

  /**
   * Cast to some JavaScript object
   */
  cast = <T extends Ray>(): T => { throw new NotImplementedError(); };

  // TODO: Should give the program that does the mapping, not the result, and probably implemented as 'compile/traverse'
  map = (mapping: (ray: Ray) => Ray | JS | any): Ray => { throw new NotImplementedError(); }
  all = (mapping: (ray: Ray) => Ray | JS | any): Ray => { throw new NotImplementedError(); }
  filter = (mapping: (ray: Ray) => Ray | JS | any): Ray => { throw new NotImplementedError(); }
  clear = (): Ray => { throw new NotImplementedError(); }

  // TODO: Generalize these functions to:
  //
  // TODO: +default, in the case of Initial/Terminal = Ray.None, to which the default sometimes is nothing. Or in the case of min/max it's 0.


  // TODO: being called min.x needs to return the min value within that entire structure.

  // [this.vertices().x.max(), this.edges().x.max()].max()
  // [this.vertices().x.min(), this.edges().x.max()].max()
  // TODO: Indicies not corresponding the the directionality defined, are probably on another abstraction layer described this way. More accurately, they're directly connected, and on a separate layer with more stuff in between...
  index = (): Ray => { throw new NotImplementedError(); }
  min = (_default: 0): Ray => { throw new NotImplementedError(); }
  max = (_default: 0): Ray => { throw new NotImplementedError(); }

  // [a, b, c] zip [d, e, f] zip [g, h, i] ...
  // [[a,d,g],[b,e,h],[c,f,i]]
  zip = (): Ray => { throw new NotImplementedError(); }

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

  *traverse(): Generator<Ray> {}

  /**
   * JavaScript, possible compilations
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

  /**
   * Quick dirty compilation
   */
  static dirty_store: { [label: string]: object } = {}
  get store(): any { return Ray.dirty_store[this.label] ??= {} }

  debug = (c: { [label: string]: object | undefined }): object => {
    if (c[this.label] !== undefined)
      return c[this.label]!;

    const of = (ray: Ray): string => {
      if (ray.is_none()) return 'None';

      ray.debug(c);
      return ray.label;
    }

    const obj: any = { label: this.label };
    c[this.label] = obj;

    obj.initial = of(this.initial);
    obj.vertex = of(this.vertex);
    obj.terminal = of(this.terminal);
    obj.type = this.as_reference().type;

    return obj;
  }
  to_wolfram_language = (): string => {
    const hyperEdges: string[][] = [];
    const options: any = {};

    const debug = {};
    this.debug(debug);

    const vertexStyle = (ray: any): string => {
      switch (ray.type) {
        case RayType.INITIAL:{
          return 'Darker@Red'
        }
        case RayType.TERMINAL: {
          return 'Lighter@Red'
        }
        case RayType.REFERENCE: {
          if (ray.vertex === 'None') // empty reference
            return 'Lighter@Orange';

          return 'Orange'
        }
        case RayType.VERTEX: {
          return 'Lighter@Blue'
        }
        default: {
          throw '??'
        }
      }
    }

    _.valuesIn(debug).forEach((ray: any) => {
      console.log(ray)

      if (ray.initial !== 'None' && ray.terminal !== 'None') {
        const edge: string[] = [ray.initial, ray.label, ray.terminal].filter(vertex => vertex !== 'None');
        hyperEdges.push(edge);
      }

      if (ray.vertex !== 'None') {
        hyperEdges.push([ray.label, ray.vertex]);

        (options['EdgeStyle'] ??= {})[`{${[ray.label, ray.vertex].join(',')}}`] = 'Orange'
      }

      (options['VertexStyle'] ??= {})[ray.label] = vertexStyle(ray);
    })

    return `ResourceFunction["WolframModelPlot"][{${hyperEdges
      .filter(hyperEdge => hyperEdge.length !== 0)
      .map(hyperEdge =>
        `{${hyperEdge.join(',')}}`
      ).join(',')}},VertexLabels->All,${
      _.map(options, (mapping, option) =>
        `${option} -> <|${
          _.map(mapping, (value, key) => `${key} -> ${value}`)
            .join(',')}|>`)
        .join(',')}]`;
  }

  /**
   * TODO: This should be constructed at the vertex and in general unsolvable
   */
  static _label: number = 0;
  __label: string | undefined;
  get label(): string {
    if (this.__label !== undefined)
      return this.__label;

    return this.__label = `"${Ray._label++} (${this.js()?.toString() ?? '?'})})"`;
  }

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
    const _false = Ray.js(false);
    const _true = Ray.js(true);
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
        // initial.force().continues_with(() => terminal.as_reference());

        // if (initial.is_some())
        //   initial.force().terminal = () => terminal; // TODO REPEAT FROM BELOW

        return terminal;
      }

      const current: Ray = new Ray({
        js: () => iterator_result.value,
        // initial: () => new Ray(),
        initial: () => initial,
        vertex: () => from_any(iterator_result.value).as_ray(),
        terminal: () => next(current)
      });

      // initial.force().continues_with(() => current.force().as_reference());
      if (initial.is_some())
        initial.terminal = () => current;

      return current;
    }

    const ray_iterator = new Ray({ js: () => Option.Some(iterator)});
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

  export const Object = (object: object): Ray => {
    throw new NotImplementedError();
  }

  export const Any = (any: any): Ray => {
    if (any === null || any === undefined) return JS.Any(any);
    if (JS.is_boolean(any)) return JS.Boolean(any);
    if (JS.is_number(any)) return JS.Number(any);
    if (JS.is_iterable(any)) return JS.Iterable(any); // || is_array(any))
    if (JS.is_function(any)) return JS.Function(any);
    if (JS.is_object(any)) return JS.Object(any);

    return JS.Any(any);
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