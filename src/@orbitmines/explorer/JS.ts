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

  export type Method<TResult> = (...other: Recursive<Ray>) => TResult;

  export type FunctionConstructor<TResult> =
    Ray
    | ParameterlessFunction<TResult>
    | Function<TResult>;

  export type Interface<T> = {
    [TKey in keyof T]: T[TKey] extends JS.Function<infer TResult>
      ? JS.Method<TResult>
      : never;
  }

  /**
   * This allows automatic conversion between "JavaScript functions/.../generators" and Rays.
   *
   * TODO: Is there some equivalent of this in computer science??? category theory??
   */
  export class Function<TResult> { // TODO: Ray could extend Function

    static New = <TResult>(constructor: FunctionConstructor<TResult>) => new Function(constructor);

    /**
     * Implement a function from the perspective of 'this'.
     */
    static Self = <TResult>(impl: (self: Ray) => TResult): Function<TResult> => {
      return Function.New(() => {
        throw new NotImplementedError();
      });
    }

    /**
     * Implement a function from the perspective of 'this' for 'this.self'.
     */
    // static Ref = <TResult>(impl: (ref: Ray) => TResult): Function<TResult> => JS.Function.Self(self => impl(self.as_reference()));

    static Two = <TResult>(impl: (a: Ray, b: Ray) => TResult): Function<TResult> => {
      return Function.New(() => {
        throw new NotImplementedError();
      });
    }

    /**
     *
     */
    static CachedAfterUse = <TResult>(constructor: FunctionConstructor<TResult>): FunctionConstructor<TResult> => {
      return constructor;
    }

    protected constructor(constructor: FunctionConstructor<TResult>) {

    }

    call = (self: Ray) => { throw new NotImplementedError(); }

    as_method = <TResult>(self: Ray): Method<TResult> => {
      throw new NotImplementedError();
    }

  }

  /**
   * JavaScript runtime type checks
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