import {NotImplementedError, PreventsImplementationBug} from "./errors/errors";
import _ from "lodash";
import {AbstractDirectionality, Ray, RayType} from "./Ray";

/**
 *
 * Important to remember this is just one particular structure to which it can be mapped, there are probably many (TODO infinitely?) others.
 *
 * Not to be considered as a perfect mapping of JavaScript functionality - merely a practical one.
 */
namespace JS {
  export type ParameterlessFunction<T = any> = () => T;
  export type ParameterlessConstructor<T> = new () => T;
  export type Constructor<T> = new (...args: any[]) => T;
  export type Implementation<T = Ray> = (ref: T) => T;

  export type Arbitrary<T> = ParameterlessFunction<T>;

  export type Recursive<T = Ray> = (T | Recursive<T | T[]>)[];
  export type Method<T = Ray> = (...other: Recursive<T>) => T;

  /**
   * This allows automatic conversion between "JavaScript functions/.../generators" and Rays.
   *
   * TODO: Is there some equivalent of this in computer science??? category theory??
   */
  export class Function<T extends AbstractDirectionality<T> = Ray> { // TODO: Ray could extend Function

    private readonly step: Implementation<T>;

    constructor(step: JS.Implementation<T>) {
      this.step = step;
    }

    static Any = <T extends AbstractDirectionality<T> = Ray>(...args: any[]): Function<T> => {
      throw new NotImplementedError();
    }

    /**
     * Puts the Ray this is called with on a new Ray [initial = ref, ???, ???]. Then it places any structure it's applying a method to, on the terminal of this new Ray [initial = ref, ???, terminal = any]
     */
    static Ref = <T extends AbstractDirectionality<T> = Ray>(impl: (ref: T) => T): Function<T> => {
      return new Function<T>(impl);
    }

    static Impl = <T extends AbstractDirectionality<T> = Ray>(impl: (initial: T, terminal: T) => T): Function<T> => {
      return Function.Ref((ref: T) => impl(ref.initial, ref.terminal));
    }
    static IgnorantOfInitial = <T extends AbstractDirectionality<T> = Ray>(impl: (terminal: T) => T): Function<T> => Function.Impl((_, terminal) => impl(terminal));
    static IgnorantOfTerminal = <T extends AbstractDirectionality<T> = Ray>(impl: (initial: T) => T): Function<T> => Function.Impl((initial, _) => impl(initial));
    static Ignorant = <T extends AbstractDirectionality<T> = Ray>(impl: ParameterlessFunction<T>): Function<T> => Function.Impl(impl);

    /**
     * Constructs a class method accepting arbitrary structure.
     *
     * a.compose(b).compose(c) = [a, b, c].compose = abc.compose = [[a1, a2], b, c].compose = [[a1, a2], b, [c1, c2]].compose = [[a1, [[[a2]]], [[[[]]], []]], b, [[[]], [], [c]]].compose = ...
     */
    as_method = (ref: T): Method<T> => ((...any: Recursive<T>): T => {
      if (any === undefined || any.length === 0)
        return this.step(ref);

      // TODO: This can be much better...
      const first = (recursive?: Recursive<T>): T | undefined => {
        if (recursive === undefined) return;
        // if (_.isObject(recursive)) return recursive as unknown as Ray;

        for (let r of recursive) {
          if (r === undefined) continue;
          if (_.isObject(r)) return r as unknown as T;

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
        return this.step(ref);

      const pointer = (new Ray({
        // @ts-ignore
        initial: () => ref,
        // @ts-ignore
        terminal: () => _first
      })) as unknown as T;

      return this.step(pointer);

      // TODO: ANY CASE
      // if (any.length === 1) {
      // }
    })

    as_ray = (): Ray => {
      throw new NotImplementedError();
    }

    as_generator = (): Generator<T> => {
      throw new NotImplementedError();
    }

  }

  export const Boolean = (boolean: boolean): Ray => {
    // TODO: Could be superpose structure instead of length 2;
    // |-false->-true-| (could of course also be reversed)
    const _false = Ray.vertex().o({ js: false }).as_reference();
    const _true = Ray.vertex().o({ js: true }).as_reference();
    _false.compose(_true);

    return (boolean ? _true : _false);
  }
  // export const bit = (bit?: boolean): Arbitrary<Ray<any>> => permutation(bit ? 1 : 0, 2);
  export const Bit = Boolean;

  export const Iterable = <T = any>(iterable: Iterable<T>): Ray => JS.Iterator(iterable[Symbol.iterator]());

  export const Iterator = <T = any>(iterator: Iterator<T>): Ray => {
    // [  |--]

    const next = (previous: Ray, first: boolean = false): Ray => {
      const iterator_result = iterator.next();
      const is_terminal = iterator_result.done === true;

      // Clear the terminal function attached to the Iterator.
      // TODO: In case of 'is_terminal = true': Could also leave this be, in case JavaScript allows for adding stuff to the iterator even after .done === true;
      previous.self.terminal = previous.self.___empty_terminal();

      if (is_terminal) {
        // We're done, this is the end of the iterator

        return Ray.None();
      }

      const current = Ray
        .vertex(() => JS.Any(iterator_result.value))
        .o({js: iterator_result.value})
        .as_reference();

      // Move the iterator to the terminal.
      current.self.terminal = () => next(current);

      if (first) {
        // Move the iterator's terminal to current.
        ray_iterator.self.terminal = () => current.self;

        current.self.initial = () => ray_iterator.self;

        return current; // Answer to INITIAL.terminal is a VERTEX.
      }

      // TODO: This is just compose, but without .type checks.. ; FIX ON COMPOSE END for is_reference etc..
      if (previous.follow().type !== RayType.TERMINAL)
        throw new PreventsImplementationBug();
      if (current.follow(Ray.directions.previous).type !== RayType.INITIAL)
        throw new PreventsImplementationBug();

      previous.follow().equivalent(current.follow(Ray.directions.previous));
      // TODO:
      // previous.compose(current);

      return current.self.initial; // Answer to VERTEX.terminal is an INITIAL.
    }

    const ray_iterator: Ray = new Ray({
      vertex: Ray.None,
      terminal: () => next(ray_iterator, true),
    })
      .o({ js: iterator })
      .as_reference();

    return ray_iterator;
  }

  export const Generator = <T = any>(generator: Generator<T>): Ray => JS.Iterable(generator);

  // TODO Could have parallel threads in general.
  // export const AsyncGenerator = <T = any>(generator: AsyncGenerator<T>): Ray => {
  //   // [  |--]
  //   return JS.Iterable(generator);
  // }

  export const Number = (number: number): Ray => {
    throw new NotImplementedError();
  }

  // TODO
  export const Object = (object: object): Ray => Ray.vertex().o(object).as_reference();

  export const Any = (any: any): Ray => {
    if (any === null || any === undefined) return JS.Any(any);
    if (JS.is_boolean(any)) return JS.Boolean(any);
    if (JS.is_number(any)) return JS.Number(any);
    if (JS.is_iterable(any)) return JS.Iterable(any); // || is_array(any))
    if (JS.is_function(any)) return JS.Function.Any(any).as_ray();
    if (JS.is_object(any)) return JS.Object(any);

    // TODO
    // return JS.Any(any);
    return Ray.vertex().o({js: any}).as_reference();
  }

  export const is_boolean = (_object: any): _object is boolean => _.isBoolean(_object);
  export const is_number = (_object: any): _object is number => _.isNumber(_object);
  export const is_object = (_object: any): _object is object => _.isObject(_object);
  export const is_iterable = <T = any>(_object: any): _object is Iterable<T> => Symbol.iterator in Object(_object) && is_function(_object[Symbol.iterator]);
  export const is_async_iterable = <T = any>(_object: any): _object is AsyncIterable<T> => Symbol.asyncIterator in Object(_object);
  export const is_array = <T = any>(_object: any): _object is T[] => _.isArray(_object);
  export const is_async = (_object: any) => _.has(_object, 'then') && is_function(_.get(_object, 'then')); // TODO, Just an ugly check

  export const is_error = (_object: any): _object is Error => _.isError(_object);
  export const is_function = (_object: any): _object is ((...args: any[]) => any) => _.isFunction(_object);
}

export default JS;