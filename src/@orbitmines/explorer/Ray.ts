import {makeTaggedUnion, MemberType, none, TaggedUnion} from "../../@orbitmines/js/utils/match";
import {Option} from "../js/utils/Option";
import _, {initial} from "lodash";


export type ParameterlessFunction<T = any> = () => T;

/**
 * Defines some flexibility to ignore a lot of the JavaScript specifics (we're not trying to model JavaScript here).
 */
export type Arbitrary<T> = MemberType<
  TaggedUnion<{
    Ref: (ref: Option<T>) => typeof ref,
    Fn: (fn: ParameterlessFunction<Option<T>>) => typeof fn,
  }, {
    none_or: <Result = T>(or: (obj: T) => Result) => Arbitrary<Result>,
    resolve: () => Option<T>,
  }>
>;
export const Arbitrary = makeTaggedUnion<{
  Ref: (ref: Option<any>) => typeof ref,
  Fn: (fn: ParameterlessFunction<Option<any>>) => typeof fn,
}, {
  none_or: (or: (obj: any) => any) => any,
  resolve: () => Option<any>,
}>({
  Ref: (ref: Option<any>) => ref,
  Fn: (fn: ParameterlessFunction<Option<any>>) => fn,
}, {
  resolve: (obj: Arbitrary<any>): any => obj.match({
    Ref: (ref) => ref,
    Fn: (fn) => fn(),
  }),
  none_or: (obj: Arbitrary<any>, or: (obj: any) => any): Arbitrary<any> => obj.resolve().match({
    Some: (obj) => or(obj),
    None: () => Arbitrary.Ref(Option.None)
  }),
});

/**
 * TODO; This is now just basically a reference to the method on Ray, without resolving it. (And of course, this could generally be implemented as more Rays, this is just for the JavaScript interface anyway.
 */
export type Extreme = MemberType<
  TaggedUnion<{
    Initial: (ray: Ray) => typeof ray,
    Vertex: (ray: Ray) => typeof ray,
    Terminal: (ray: Ray) => typeof ray,
  }, {
    resolve: () => Ray,
  }>
>;
export const Extreme = makeTaggedUnion<{
  Initial: (ray: Ray) => typeof ray,
  Vertex: (ray: Ray) => typeof ray,
  Terminal: (ray: Ray) => typeof ray,
}, {
  resolve: () => Ray,
}>({
  Initial: (ray: Ray) => ray,
  Vertex: (ray: Ray) => ray,
  Terminal: (ray: Ray) => ray,
}, {
  resolve: (obj: Extreme): Ray => obj.match({
    Initial: (ray) => ray,
    Vertex: (ray) => ray,
    Terminal: (ray) => ray,
  }),
});

/**
 * Replace "Ray" for "AbstractDirectionality" in case "Ray" doesn't suit you.
 */
export interface AbstractDirectionality<T> {
  get initial(): T
  get vertex(): T
  get terminal(): T
}

/**
 * JavaScript wrapper for a mutable value. It is important to realize that this is merely some simple JavaScript abstraction, and anything is assumed to be inherently mutable.
 *
 * All the methods defined here should be considered deprecated, are there to help with JavaScript implementation only.
 */
export default class Ray
  implements
    AbstractDirectionality<Arbitrary<Extreme>>,
    AsyncIterable<Ray>
{

  /**
   * These fields reference the {AbstractDirectionality} we're currently headed towards.
   */
  initial: Arbitrary<Extreme>;
  vertex: Arbitrary<Extreme>;
  terminal: Arbitrary<Extreme>;

  constructor({initial, vertex, terminal}: Ray) {
    this.initial = initial;
    this.vertex = vertex;
    this.terminal = terminal;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<Ray> {

  }

  traverse = async () => {
    this.terminal.none_or(terminal => terminal.match({
      // direct connect to the next ray
      Initial: (next_vertex) => Arbitrary.Ref(Option.Some(Extreme.Vertex(next_vertex))),

      // More structure defined here, traverse that. - If this was realized as self-referential, this could mean a fixed point or basically None - but both behaviors should be allowed in some sense. But this iteration is now just for being practical.
      // If it is deemed as equivalent in this content, ignore any difference, move in both next/previous directions
      // This is what it could mean to ignore the directionality??
      // Basically: "I don't care where it's defined just get me all next possible traversals
      // TODO: Need to make it possible to explore any particular path separately/join already explored ones, since in some sense these could be infinitely non-halting.
      Vertex: (equivalent_directionality) => equivalent_directionality.traverse({
        ...options,
        // TODO BOTH UP & DOWN - The directionality is ignored - hence interpreted as equivalent, though this currently still indicates some level of distinguishability, just not for this traversal.
      }),

      // just another ray which ends up at the same point ; TODO or it should be interpreted as a reversed directionality, and interpret any forward going ones as initial.?? - one would need distinguishability there, just ignore for now? - one could setup way in which this could be the case.
      Terminal: (some_other_terminal) => Arbitrary.Ref(Option.None),
    }))
  }

  // traverse = (options: {
  //   steps?: number,
  //   // filter
  //   //
  //   direction: Arbitrary<Extreme> // TODO: That I'm using this here perhaps indicates I need to switch up the Ray/Arbitrary<Extreme> setup a bit. - perhaps that *this* as ray, necessarily already is the direction?
  // }): Arbitrary<Extreme> => {
  //   const { steps, direction } = options;
  //
  //   // previous: Assuming we can reverse the direction. - this is a bit complicated and needs to be phrased properly, but for now just assume we can.
  //
  //   // TODO, RESTRUCTURE: This shows that this method would be defined at "Arbitrary<Extreme>"
  //   return direction.none_or((extreme) => extreme.match({
  //       // opposite of terminal one
  //       Initial: (ray) => {},
  //
  //       Vertex: (ray) => { throw '' },
  //         // ray.vertex.resolve().none_or(vertex => vertex.match({
  //         //   Initial: () => {},
  //         //   Vertex: () => {}, // same
  //         //   Terminal: () => {},
  //         // })),
  //
  //       Terminal: (ray) =>
  //     }),
  //   );
  // }

  previous = (options?: {
    steps?: number,
  }): Arbitrary<Extreme> => this.traverse({...options, direction: this.initial_ref() });

  next = (options?: {
    steps?: number,
  }): Arbitrary<Extreme> => this.traverse({...options, direction: this.terminal_ref() });

  // TODO: What's the best name for traversing the structure of the vertex ? - Superposition/context/definition/structure/value/node/.. ; basically different directionalities which define what this thing means>?
  // next = (options: {
  //   steps?: number,
  // }): Arbitrary<Extreme> => this.traverse({...options, direction: this.vertex_ref() });

  initial_ref = (): Arbitrary<Extreme> => Arbitrary.Ref(Option.Some(Extreme.Initial(this)));
  vertex_ref = (): Arbitrary<Extreme> => Arbitrary.Ref(Option.Some(Extreme.Vertex(this)));
  terminal_ref = (): Arbitrary<Extreme> => Arbitrary.Ref(Option.Some(Extreme.Terminal(this)));

  is_empty = (): boolean => this.is_initial() && this.is_terminal();
  is_initial = (): boolean => this.previous().resolve().match({ Some: (_) => false, None: () => true });
  is_terminal = (): boolean => this.next().resolve().match({ Some: (_) => false, None: () => true });

  loop = (next: (current: Arbitrary<Extreme>) => Arbitrary<Extreme>) => {
    let current: Arbitrary<Extreme> = this.vertex_ref();

    let _next: Arbitrary<Extreme>;
    while ((_next = next(current)).resolve().is_some()) {
      _next.resolve().force().match({
        Initial: (ray) => ray,
        Vertex: (ray) => ray,
        Terminal: (ray) => ray,
      })
      current = _next;
    }

    return current;
  }

}

/**
 *
 * Important to remember this is just one particular structure to which it can be mapped, there are probably many (infinitely?) others.
 *
 * Not to be considered as a perfect mapping of JavaScript functionality - merely a practical one.
 */
export type JS<Target = Arbitrary<Extreme>> = MemberType<
  TaggedUnion<{
    Iterable: <T>(iterable: Iterable<T>) => typeof iterable,
    Iterator: <T>(iterator: Iterator<T>) => typeof iterator,
    Boolean: (boolean: boolean) => typeof boolean,
    Number: (number: number) => typeof number,
    Function: (func: ParameterlessFunction) => typeof func,
    Object: (object: object) => typeof object,
    None: typeof none;
  }, {
    as_ray: () => Target,
  }>
>;

export const JS = makeTaggedUnion<{
  Iterable: <T>(iterable: Iterable<T>) => typeof iterable,
  Iterator: <T>(iterator: Iterator<T>) => typeof iterator,
  // AsyncGenerator
  // ..
  Boolean: (boolean: boolean) => typeof boolean,
  Number: (number: number) => typeof number,
  Function: (func: ParameterlessFunction) => typeof func,
  Object: (object: object) => typeof object,
  None: typeof none;
}, {
  as_ray: () => Arbitrary<Extreme>,
}>({
  Iterable: <T>(iterable: Iterable<T>) => iterable,
  Iterator: <T>(iterator: Iterator<T>) => iterator,
  Boolean: (boolean: boolean) => boolean,
  Number: (number: number) => number,
  Function: (func: ParameterlessFunction) => func,
  Object: (object: object) => object,
  None: none,
}, {
  as_ray: (js: JS): Arbitrary<Extreme> => js.match({
    Iterable: <T>(iterable: Iterable<T>): Arbitrary<Extreme> => from_iterable(iterable),
    Iterator: <T>(iterator: Iterator<T>): Arbitrary<Extreme> => from_iterator(iterator),
    Boolean: (boolean: boolean): Arbitrary<Extreme> => from_boolean(boolean),
    Number: (number: number): Arbitrary<Extreme> => from_number(number),
    Function: (func: ParameterlessFunction): Arbitrary<Extreme> => from_function(func),
    Object: (object: object): Arbitrary<Extreme> => from_object(object),
    None: (): Arbitrary<Extreme> => Arbitrary.Ref(Option.None)
  })
});

/**
 *
 */

export const from_any = (any: any): JS => {
  if (any === null || any === undefined)
    return JS.None;

  if (is_boolean(any))
    return JS.Boolean(any);
  if (is_number(any))
    return JS.Number(any);
  if (is_iterable(any))// || is_array(any))
    return JS.Iterable(any);
  if (is_function(any))
    return JS.Function(any);
  if (is_object(any))
    return JS.Object(any);

  return JS.None;
}

export const from_iterable = <T = any>(iterable: Iterable<T>): Arbitrary<Extreme> => from_iterator(iterable[Symbol.iterator]());
export const from_iterator = <T = any>(iterator: Iterator<T>): Arbitrary<Extreme> => {
  const next = (previous_result: Option<Ray>): Arbitrary<Extreme> => {
    const iterator_result = iterator.next();
    const is_last_element = iterator_result.done === true;

    if (is_last_element)
      return Arbitrary.Ref(Option.None); // Already not coherent, should return the extreme reference on the right

    //todo iterate at the frames
    const current = new Ray({
      initial: previous_result.match({
        Some: (previous) => Arbitrary.Ref(Option.Some(Extreme.Terminal(previous))),
        None: () => Arbitrary.Ref(Option.None)
      }),
      vertex: from_any(iterator_result.value).as_ray(),
      terminal: is_last_element
        ? Arbitrary.Ref(Option.None) // Last element, so assume there's no more going in this direction.
        : Arbitrary.Fn((): Option<Extreme> => {
          const next_ray: Option<Extreme> = next(Option.Some(current)).resolve();

          const next_extreme: Option<Extreme> = next_ray.match({
            Some: (extreme) => Option.Some(Extreme.Initial(extreme.resolve())), // Use historical value from here on instead ; basically forcing some coherence.
            None: () => Option.None // done = true
          });
          current.terminal = Arbitrary.Ref(next_extreme);

          return next_extreme;
        }),
    });

    return Arbitrary.Ref(Option.Some(current));
  }

  return next(Option.None);
}

export const empty = (): Ray => ({ initial: Arbitrary.Ref(Option.None), vertex: Arbitrary.Ref(Option.None), terminal: Arbitrary.Ref(Option.None) });

export const length = (of: number, value: any = undefined): Arbitrary<Extreme> => {
  return from_iterable(Array(of).fill(value));
}
export const at = (index: number, of: number, value: any = undefined): Arbitrary<Ray<any>> => {
  return Arbitrary.Fn(() => length(of, value).resolve().force().at_terminal(index));
}

export const from_boolean = (boolean: boolean): Arbitrary<Option<Extreme> => {
  const false = empty();
  const true = empty();
}
export const from_number = (number: number): Arbitrary<Option<Extreme> => {

}
export const from_function = (func: ParameterlessFunction): Arbitrary<Option<Extreme> => {

}
export const from_object = (object: object): Arbitrary<Option<Extreme> => {

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
