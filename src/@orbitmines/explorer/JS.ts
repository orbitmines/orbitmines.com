import {NotImplementedError} from "./errors/errors";
import _ from "lodash";
import Ray, {Rays} from "./Ray";

/**
 * A JavaScript interface for Rays.
 *
 * NOTE:
 *   - Not to be considered as a perfect mapping of JavaScript functionality - merely a practical one.
 *   - Important to remember that this is just one particular mapping, there are probably 'many, ..., infinitely' others.
 */
namespace JS {
  export type ParameterlessFunction<T = any> = () => T;
  export type ParameterlessConstructor<T> = new () => T;
  export type Constructor<T> = new (...args: any[]) => T;
  export type FunctionImpl<T> = (ref: T) => T;
  export type Recursive<T> = (T | Recursive<T | T[]>)[];

  export type Method = (...other: Recursive<Ray>) => Ray;

  //
  // export type FunctionConstructor =
  //   Ray
  //   | ParameterlessFunction<TResult>
  //   | Function<TResult>;

  // export type Interface<T> = {
  //   [TKey in keyof T]: T[TKey] extends JS.Function<infer TResult>
  //     ? JS.Method<TResult>
  //     : never;
  // }

  // TODO: NEVER DIRECTLY EXECUTE, ONLY AFTER CHAIN OF FUNCS, possibly arbitrarily LAZY

  export type Enum<T extends Array<string>> = {
    [TKey in T[number]]: JS.Function.Instance
  }

  /**
   * An Enum(eration) is a (simple) Ray.
   */
  export namespace Enum {

    export const Impl = <T extends Array<string>>(...values: T): Enum<T> => {
      return Object.fromEntries(values.map(value =>
        [value, JS.Function.None.Impl((): Ray => {
          throw new NotImplementedError(); // TODO
        })]
      )) as Enum<T>;
      // TODO: ONE OF 4 SELECTION RAY for the case of type.
    }

  }

  /**
   * This allows automatic conversion between "JavaScript functions/.../generators" and Rays.
   *
   * TODO: Is there some equivalent of this in computer science??? category theory??
   */
  export namespace Function {

    export namespace Traversal {

      export type Callback = (event: { event: Event, func: JS.Function.Instance, traverser: Ray, params?: Recursive<Ray>, name: string | symbol }) => void

      export enum Event {
        GET_METHOD = "GET_METHOD",
        CALL_METHOD = "CALL_METHOD",
      }

    }

    /** {T} is just an example/desired use case. But it generalizes to any function. */
    export type Type<T> = T | Function.Instance;

    /** From which perspective the Function is implemented. */
    enum Perspective {
      None,
      Self,
      // Ref,
    }

    export class Instance {

      readonly perspective: Perspective;
      readonly impl: (...params: Ray[]) => Ray;

      constructor({ perspective, impl }: Pick<Instance, 'perspective' | 'impl'>) {
        this.perspective = perspective;
        this.impl = impl;
      }

      as_method = (self: Ray): Method => {
        return () => { throw new NotImplementedError(); }
        // throw new NotImplementedError();
      }

      traverse = (traverser: Ray, { name, callback }: { name: string | symbol, callback: JS.Function.Traversal.Callback }): Method => {
        callback({ event: JS.Function.Traversal.Event.GET_METHOD, name, func: this, traverser });
        return (...params) => {
          callback({ event: JS.Function.Traversal.Event.CALL_METHOD, name, func: this, traverser, params });
          return this.impl(traverser);
        }
      }

      /**
       * TODO
       *   - Compose empty as first element? Disregard none to first elemn? Or not??
       *
       * TODO; Impl
       *  - Generally, return something which knows where all continuations are.
       *  - Generator/step function/... ; with no assumption of halting, but allow to hook into any step.
       *  - Cache:
       *    - Control of (non-/)lazyness of functions
       *    - None as, first time called, memoize func.
       *    - Perhaps locally cache (for stuff like count?) - no way to ensure globally coherence
       *
       * TODO: Testing
       *  - Test if references hold after equivalence/composition...
       *
       * TODO: After initial demo:
       *  - Allow mapping/finding of other implementations regarding some equiv funcs (like different ways of implementing using NAND etc...)
       */
    }

    export namespace None {

      export const Impl = (impl: () => Ray): Function.Instance => {
        return new Function.Instance({ perspective: Perspective.None, impl });
      }

    }

    /**
     * Implement a function from the perspective of 'this'.
     */
    export namespace Self {
      export const Impl = (impl: (self: Ray) => Ray): Function.Instance => {
        return new Function.Instance({ perspective: Perspective.Self, impl });
      }

      export const Two = (impl: (a: Ray, b: Ray) => Ray): Function.Instance => {
        return new Function.Instance({ perspective: Perspective.Self, impl }); // TODO: Good way to deal with arity
      }

      export const If = (impl: (self: Ray) => Ray): Function.Instance => {
        return Impl(impl); // TODO: GENERIC collapse to boolean implemented and overridable
      }

      export type MatchCase = [
        Function.Type<typeof Function.Self.If>,
        Function.Type<typeof Function.Self.Impl | typeof Function.None.Impl>
      ];

      export type MatchCases = [...MatchCase[], /** 'else, ... default' **/ Function.Type<typeof Function.None.Impl>];

      /**
       * TODO:
       *   - Maybe replace switch with 'zip'?, What are the practical differences?
       */
      export const Match = (cases: MatchCases): Function.Instance => {
        return Impl(self => self); // TODO
      }
    }

  }
  // export class Function { // TODO: Ray could extend Function
  //
  //   // static New = (constructor: FunctionConstructor) => new Function(constructor);
  //
  //
  //   /**
  //    * Implement a function from the perspective of 'this' for 'this.self'.
  //    */
  //   // static Ref = <TResult>(impl: (ref: Ray) => TResult): Function<TResult> => JS.Function.Self(self => impl(self.as_reference()));
  //
  //   static Two = (impl: (a: Ray, b: Ray) => Ray): Function => {
  //     return Function.New(() => {
  //       throw new NotImplementedError();
  //     });
  //   }
  //
  //   /**
  //    *
  //    */
  //   // static CachedAfterUse = <TResult>(constructor: FunctionConstructor<TResult>): FunctionConstructor<TResult> => {
  //   //   return constructor;
  //   // }
  //
  //   // protected constructor(constructor: FunctionConstructor<TResult>) {
  //   //
  //   // }
  //
  //   call = (self: Ray) => {
  //     throw new NotImplementedError();
  //   }
  //
  //   as_method = <TResult>(self: Ray): Method<TResult> => {
  //     throw new NotImplementedError();
  //   }
  //
  // }

  /**
   * JavaScript runtime type checks
   *
   * TODO: Copy from lodash
   */
    export const is_boolean = (_object: any): _object is boolean => _.isBoolean(_object);
    export const is_number = (_object: any): _object is number => _.isNumber(_object);
    export const is_object = (_object: any): _object is object => _.isObject(_object);
    export const is_iterable = <T = any>(_object: any): _object is Iterable<T> => Symbol.iterator in Object(_object) && is_function(_object[Symbol.iterator]);
    export const is_async_iterable = <T = any>(_object: any): _object is AsyncIterable<T> => Symbol.asyncIterator in Object(_object) && is_function(_object[Symbol.asyncIterator]);
    export const is_array = <T = any>(_object: any): _object is T[] => _.isArray(_object);
    export const is_async = (_object: any) => _.has(_object, 'then') && is_function(_.get(_object, 'then')); // TODO, Just an ugly check

    export const is_error = (_object: any): _object is Error => _.isError(_object);
    export const is_function = (_object: any): _object is ((...args: any[]) => any) => _.isFunction(_object);
}

export default JS;