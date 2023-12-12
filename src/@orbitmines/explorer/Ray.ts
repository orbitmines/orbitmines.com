import {enumeration, MemberType, none, TaggedUnion} from "../../@orbitmines/js/utils/match";
import {Option} from "../js/utils/Option";
import _ from "lodash";
import {compile} from "sass";

export type ParameterlessFunction<T = any> = () => T;

// /**
//  * Defines some flexibility to ignore a lot of the JavaScript specifics (we're not trying to model JavaScript here).
//  */
// export type ArbitraryObj<T> = {
//   Ref: (ref: Option<T>) => typeof ref,
//   Fn: (fn: ParameterlessFunction<Option<T>>) => typeof fn,
// };
// export type ArbitraryImpl<T> = {
//   none_or: <Result>(or: (obj: T) => Result) => Arbitrary<Result>,
//   resolve: () => Option<T>,
// }
// export type Arbitrary<T> = MemberType<TaggedUnion<ArbitraryObj<T>, ArbitraryImpl<T>>>;
//
// export const Arbitrary = enumeration<ArbitraryObj<any>, ArbitraryImpl<any>>({
//   Ref: (ref: Option<any>) => ref,
//   Fn: (fn: ParameterlessFunction<Option<any>>) => fn,
// }, self => class {
//   resolve = (): any => self.match({
//     Ref: (ref) => ref,
//     Fn: (fn) => fn(),
//   })
//
//   none_or = (or: (obj: any) => any): Arbitrary<any> => self.resolve().match({
//     Some: (obj) => or(obj),
//     None: () => Arbitrary.Ref(Option.None)
//   })
// });

/**
 * Replace "Ray" for "AbstractDirectionality" in case "Ray" doesn't suit you.
 */
export interface AbstractDirectionality<T> {
  initial(): T
  vertex(): T
  terminal(): T
}

// SHOULDNT CLASSIFY THESE?
export enum RayType {
  REFERENCE = '  |  ',
  INITIAL = '  |--',
  TERMINAL = '--|  ',
  VERTEX = '--|--',
}

export type Arbitrary<T> = () => Option<T>;

/**
 * https://en.wikipedia.org/wiki/Homoiconicity
 */
export interface PossiblyHomoiconic<T extends PossiblyHomoiconic<T>> {
  self: Arbitrary<T>
  is_reference: () => boolean
  as_reference: () => T
}

/**
 * JavaScript wrapper for a mutable value. It is important to realize that this is merely some simple JavaScript abstraction, and anything is assumed to be inherently mutable.
 *
 * All the methods defined here should be considered deprecated, are there to help with JavaScript implementation only.
 *
 * TODO:
 * - Homotopy equivalence merely as some direction/reversibility constraint on some direction, ignoring additional structure (or incorporating it into the equiv) at the vertices. (Could be loosened where certain vertex-equivalences are also part of the homotopy)
 * - Induced ignorance/equivalence along arbitrary rays.
 */
export class Ray
  implements
      PossiblyHomoiconic<Ray>,

      AsyncIterable<Ray>,
      Iterable<Ray>
{

  js: () => Option<any>;

  // TODO: Could make a case that setting the terminal is more of a map, defaulting/first checking the terminal before additional functionality is mapped over that.
  initial: () => Option<Ray>;
  vertex: () => Option<Ray>;
  terminal: () => Option<Ray>;

  self = (): Option<Ray> => this.vertex();

  constructor({
    initial,
    vertex,
    terminal,
    js,
  }: { js?: () => Option<any> } & Partial<AbstractDirectionality<Option<Ray>>> = {}) {
    this.initial = initial ?? (() => Option.None);
    this.vertex = vertex ?? (() => Option.None);
    this.terminal = terminal ?? (() => Option.None);
    this.js = js ?? (() => Option.None);
  }

  continues_with = (continues_with: Ray): Ray => {
    if (!this.as_reference().is_reference())
      throw 'NotImplemented: Preventing implementation bug; continues_with not called on a reference';
    if (!continues_with.as_reference().is_reference())
      throw 'NotImplemented: Preventing implementation bug; continues_with not called with a reference';

    if (!continues_with.is_reference())
      throw 'NotImplemented: Preventing implementation bug; continues_with not called as a reference';

    // TODO: For now just puts it at the vertex, could be done more intelligently
    const next_vertex = new Ray({
      initial: empty().as_arbitrary(),
      vertex: () => continues_with.vertex(),
      terminal: empty().as_arbitrary()
    });

    const vertex = this.self().force();

    if (vertex.is_empty()) {
      console.log('first element')
      this.vertex = next_vertex.as_arbitrary();
      return this;
    }

    if (!this.is_vertex())
      throw 'NotImplemented: Preventing implementation bug; continues_with not called on a vertex';

    const terminal = vertex.terminal().force();
    if (!terminal.is_empty())
      throw 'NotImplemented: Preventing implementation bug; continues_with should be added to the vertex';

    // [  |--]
    const connection = new Ray({
      vertex: this.as_arbitrary(),
      terminal: next_vertex.as_arbitrary()
    }).as_arbitrary();

    this.terminal = connection;
    next_vertex.initial = connection;

    console.log('continues')

    return next_vertex.as_reference();
  }

  is_initial = (): boolean => this.self().match({
    Some: (self) => self.initial().is_none(),
    None: () => false
  });
  is_vertex = (): boolean => !this.is_initial() && !this.is_terminal();
  is_terminal = (): boolean => this.self().match({
    Some: (self) => self.terminal().is_none(),
    None: () => false
  });

  is_reference = (): boolean => this.is_initial() && this.is_terminal();

  is_empty = (): boolean => this.self().is_none();

  as_reference = (): Ray => new Ray({ vertex: () => Option.Some(this) }) // A ray whose vertex references this Ray (ignorantly).

  as_option = (): Option<Ray> => Option.Some(this);
  as_arbitrary = (): Arbitrary<Ray> => () => this.as_option();

  // TODO NEEDS TO CHECK IF THERE'S SOME INITIAL DEFIEND ; for defining if it has halted

  type = (): RayType => {
    if (this.is_reference())
      return RayType.REFERENCE;
    if (this.is_initial())
      return RayType.INITIAL;
    if (this.is_terminal())
      return RayType.TERMINAL;

    return RayType.VERTEX;
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

    debug = (c: string[]): string => {
      if (c.includes(this.label))
        return 'circular';

      c.push(this.label)

      return `\n[${[
        this.initial().match({ Some: (ray) => ray.debug(c), None: () => '|' }),
        this.vertex().match({ Some: (ray) => ray.debug(c), None: () => '' }),
        this.terminal().match({ Some: (ray) => ray.debug(c), None: () => '|' }),
      ].join(',')}] -> ${this.js().match({ Some: (ray) => ray.toString(), None: () => '?'})}\n`
    }
  /**
   * Quick dirty compilation
   */

  /**
   * TODO: This should be constructed at the vertex and in general unsolvable
   */
  static _label: number = 0;
  __label: number | undefined;
  get label(): string {
    if (this.__label !== undefined)
      return `${this.__label}`;

    return `${this.__label = Ray._label++}`;
  }

}

/**
 *
 * Important to remember this is just one particular structure to which it can be mapped, there are probably many (infinitely?) others.
 *
 * Not to be considered as a perfect mapping of JavaScript functionality - merely a practical one.
 */
export type JSObj<Target = Option<Ray>> = {
  Iterable: <T>(iterable: Iterable<T>) => typeof iterable,
  Iterator: <T>(iterator: Iterator<T>) => typeof iterator,
  Boolean: (boolean: boolean) => typeof boolean,
  // // AsyncGenerator
  // // ..
  // Number: (number: number) => typeof number,
  // Function: (func: ParameterlessFunction) => typeof func,
  Object: (object: object) => typeof object,
  Any: (any: any) => typeof any,
  None: typeof none;
}
export type JSImpl<Target = Option<Ray>> = {
  as_ray: () => Target,
}
export type JS<Target = Option<Ray>> = MemberType<TaggedUnion<JSObj<Target>, JSImpl<Target>>>;

export const JS = enumeration<JSObj, JSImpl>({
  Iterable: <T>(iterable: Iterable<T>) => iterable,
  Iterator: <T>(iterator: Iterator<T>) => iterator,
  Boolean: (boolean: boolean) => boolean,
  // Number: (number: number) => number,
  // Function: (func: ParameterlessFunction) => func,
  Object: (object: object) => object,
  Any: (any: any) => any,
  None: none,
}, self => class {
  as_ray = (): Option<Ray> => self.match({
    Iterable: <T>(iterable: Iterable<T>): Option<Ray> => from_iterable(iterable),
    Iterator: <T>(iterator: Iterator<T>): Option<Ray> => from_iterator(iterator),
    Boolean: (boolean: boolean): Option<Ray> => from_boolean(boolean),
    // Number: (number: number): Option<Ray> => from_number(number),
    // Function: (func: ParameterlessFunction): Option<Ray> => from_function(func),
    Object: (object: object): Option<Ray> => from_object(object),
    Any: (any: any): Option<Ray> => Option.Some(new Ray({ js: () => Option.Some(any) })),
    None: (): Option<Ray> => Option.None
  })
});

/**
 *
 */

export const from_any = (any: any): JS => {
  if (any === null || any === undefined)
    return JS.Any(any);

  if (is_boolean(any))
    return JS.Boolean(any);
  // if (is_number(any))
  //   return JS.Number(any);
  if (is_iterable(any))// || is_array(any))
    return JS.Iterable(any);
  // if (is_function(any))
  //   return JS.Function(any);
  if (is_object(any))
    return JS.Object(any);

  return JS.Any(any);
}

export const from_iterable = <T = any>(iterable: Iterable<T>): Option<Ray> => from_iterator(iterable[Symbol.iterator]());
export const from_iterator = <T = any>(iterator: Iterator<T>): Option<Ray> => {
  // [  |--]

  const next = (initial: Option<Ray>): Option<Ray> => {
    const iterator_result = iterator.next();
    const is_terminal = iterator_result.done === true;

    if (is_terminal) {
      // We're done, this is the end of the iterator

      // vertex: could have something at the vertex which defines the "end of the iterator" - but we don't here.
      const terminal = new Ray({
        initial: () => initial
      });
      // initial.force().continues_with(() => terminal.as_reference().as_option());

      // if (initial.is_some())
      //   initial.force().terminal = () => terminal; // TODO REPEAT FROM BELOW

      return terminal.as_option();
    }

    const current: Option<Ray> = Option.Some(new Ray({
      js: () => Option.Some(iterator_result.value),
      // initial: () => new Ray().as_option(),
      initial: () => initial,
      vertex: () => from_any(iterator_result.value).as_ray(),
      terminal: () => next(current)
    }));

    // initial.force().continues_with(() => current.force().as_reference().as_option());
    if (initial.is_some())
      initial.force().terminal = () => current;

    return current;
  }

  const ray_iterator = new Ray({ js: () => Option.Some(iterator)});
  ray_iterator.terminal = () => next(ray_iterator.as_option());

  // This indicates we're passing a reference, since traversal logic will be defined at its vertex - what it's defining.
  return ray_iterator.as_reference().as_option();
}
export const from_generator = <T = any>(generator: Generator<T>): Option<Ray> => {
  // [  |--]
  return from_iterable(generator);
}

export const empty = (): Ray => new Ray({ });
export const empty_vertex = (): Ray => {
  const initial = empty();
  const terminal = empty();
  const vertex = new Ray({ initial: initial.as_arbitrary(), terminal: terminal.as_arbitrary() });

  initial.terminal = vertex.as_arbitrary();
  terminal.initial = vertex.as_arbitrary();

  return vertex;
}

export const js = (value: any): Ray => {
  const vertex = empty_vertex();
  vertex.js = () => Option.Some(value);

  return vertex;
}

// export const length = (of: number, value: any = undefined): Option<Ray> => {
//   return from_iterable(Array(of).fill(value));
// }
// export const at = (index: number, of: number, value: any = undefined): Arbitrary<Ray<any>> => {
//   return Arbitrary.Fn(() => length(of, value).resolve().force().at_terminal(index));
// }
//
export const from_boolean = (boolean: boolean): Option<Ray> => {
  // |-false->-true-| (could of course also be reversed)

  // from_iterable([false, true])

  const _false = js(false);
  const _true = js(true);
  // const two = _false.continues_with(_true);

  // _false.as_reference()
  //   .continues_with(() =>
  //     _true.initial().force().as_reference().as_option()
  //   );

  return (boolean ? _true : _false).as_reference().as_option();
}


// // Full permutation
// export const SuperPosition = (ray: Ray<any>) => {
//
// }
//
//
// export const permutation = (permutation: number | undefined, of: number): Arbitrary<Ray<any>> => at(
//   // In the case of a bit: 2nd value for '1' (but could be the reverse, if our interpreter does this)
//   permutation ?? 0,
//   // In the case of a bit: Either |-*-| if no bit or |-*->-*-| if a bit.
//   permutation === undefined ? 1 : of
// )
//
// export const bit = (bit?: boolean): Arbitrary<Ray<any>> => permutation(bit ? 1 : 0, 2);
// export const hexadecimal = (hexadecimal?: string): Arbitrary<Ray<any>> => permutation(hexadecimal ? parseInt(hexadecimal, 16) : undefined, 16);


// export const from_number = (number: number): Option<Ray> => {
//
// }
// export const from_function = (func: ParameterlessFunction): Option<Ray> => {
//
// }
export const from_object = (object: object): Option<Ray> => {

  return Option.None;
}
//
// export const from_async_generator = <T>(generator: AsyncGenerator<T>): Option<Ray> => {}
// export const from_generator = <T>(generator: Generator<T>): Option<Ray> => {}

export const is_boolean = (_object: any): _object is boolean => _.isBoolean(_object);
export const is_number = (_object: any): _object is number => _.isNumber(_object);
export const is_object = (_object: any): _object is object => _.isObject(_object);
export const is_iterable = <T = any>(_object: any): _object is Iterable<T> => Symbol.iterator in Object(_object);
export const is_async_iterable = <T = any>(_object: any): _object is AsyncIterable<T> => Symbol.asyncIterator in Object(_object);
export const is_array = <T = any>(_object: any): _object is T[] => _.isArray(_object);
export const is_async = (_object: any) => _.has(_object, 'then') && is_function(_.get(_object, 'then')); // TODO, Just an ugly check

export const is_error = (_object: any): _object is Error => _.isError(_object);
export const is_function = (_object: any): _object is ((...args: any[]) => any) => _.isFunction(_object);
