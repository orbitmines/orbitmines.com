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
  // export type Constructor<T> = new (...args: any[]) => T;
  export type FunctionImpl<T> = (ref: T) => T;
  export type Recursive<T> = (T | Recursive<T | T[]>)[];

  /**
   * Slightly more beautiful abstraction on top of JavaScript's proxy.
   */
  export namespace Class {
    export type Handler<T> = {
      apply?(self: T, args: any[]): any;
      construct?(self: T, args: any[]): object;
      // defineProperty?(self: T, property: string | symbol, attributes: PropertyDescriptor): boolean;
      deleteProperty?(self: T, property: string | symbol): boolean;
      get?(self: T, property: string | symbol): any;
      // getOwnPropertyDescriptor?(self: T, property: string | symbol): PropertyDescriptor | undefined;
      // getPrototypeOf?(self: T): object | null;
      has?(self: T, property: string | symbol): boolean;
      // isExtensible?(self: T): boolean;
      // ownKeys?(self: T): ArrayLike<string | symbol>;
      // preventExtensions?(self: T): boolean;
      set?(self: T, property: string | symbol, value: any): boolean;
      // setPrototypeOf?(self: T, v: object | null): boolean;
    }

    export type Constructor<T extends object> = { proxy: ProxyHandler<T> }
    
    export const Handler = <T extends object>(handler: JS.Class.Handler<T>): ProxyHandler<T> => ({
      get: (___proxy_function: any, property: string | symbol, self: T): any => handler.get(self, property),
      apply: (___proxy_function: any, thisArg: Ray, argArray: any[]): any => handler.apply(thisArg ?? ___proxy_function.___instance.proxy, argArray), /** thisArg can be undefined. TODO: What's the use-case of us actually using it? */
      set: (___proxy_function: any, property: string | symbol, newValue: any, self: T): boolean => handler.set(self, property, newValue),
      deleteProperty: (___proxy_function: any, property: string | symbol): boolean => handler.deleteProperty(___proxy_function.___instance.proxy, property),
      has(___proxy_function: any, property: string | symbol): boolean { return handler.has(___proxy_function.___instance.proxy, property); },
      construct(___proxy_function: any, argArray: any[], self: Function): object { return handler.construct(self as T, argArray); },
    })
    
    export abstract class Instance<T extends object> {

      protected readonly _proxy: T;

      get proxy(): T { return this._proxy; }

      protected constructor(constructor: Constructor<T>) {
        /**
         * Need a function here to tell the JavaScript runtime we can use it as a function & constructor.
         * Doesn't really matter, since we're just catching everything in the proxy anyway.
         */
        function ___proxy_function() { }
        ___proxy_function.___instance = this;

        this._proxy = new Proxy<T>(___proxy_function as any, constructor.proxy);
      }
    }
  }

  // TODO: NEVER DIRECTLY EXECUTE, ONLY AFTER CHAIN OF FUNCS, possibly arbitrarily LAZY

  export type Enum<T extends Array<string>> = {
    [TKey in T[number]]: JS.Function.Constructor
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

    /** {T} is just an example/desired use case. But it generalizes to any function. */
    export type Type<T> = T | Function.Constructor;

    /** From which perspective the Function is implemented. */
    enum Perspective {
      None,
      Self,
      // Ref,
    }

    export class Constructor {

      readonly perspective: Perspective;
      readonly impl: (...params: Ray[]) => Ray;

      constructor({ perspective, impl }: Pick<Function.Constructor, 'perspective' | 'impl'>) {
        this.perspective = perspective;
        this.impl = impl;
      }

      as_method = ({ self, property }: Pick<JS.Method, 'self' | 'property'>): Method => {
        const method: Method = (...params) => {
          self.on({ event: 'METHOD.CALL', context: { method, params } });
          return this.impl(self);
        }
        method.constructor = this;
        method.self = self;
        method.property = property;

        self.on({ event: 'METHOD.GET', context: { method } });

        return method;
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
       *    - a.orbit() -> a.orbit(a)
       *
       * TODO: Testing
       *  - Test if references hold after equivalence/composition...
       *
       * TODO: After initial demo:
       *  - Allow mapping/finding of other implementations regarding some equiv funcs (like different ways of implementing using NAND etc...)
       */
    }

    export namespace None {

      export const Impl = (impl: () => Ray): Function.Constructor => {
        return new Function.Constructor({ perspective: Perspective.None, impl });
      }


    }

    //   /**
    //    * Implement a function from the perspective of 'this' for 'this.self'.
    //    */
    //   // static Ref = <TResult>(impl: (ref: Ray) => TResult): Function<TResult> => JS.Function.Self(self => impl(self.as_reference()));

    /**
     * Implement a function from the perspective of 'this'.
     */
    export namespace Self {
      export const Impl = (impl: Rays.Op.Unary | ((self: Ray) => Ray)): Function.Constructor => {
        return new Function.Constructor({ perspective: Perspective.Self, impl });
      }

      export const Binary = (impl: Rays.Op.Binary | ((a: Ray, b: Ray) => Ray)): Function.Constructor => {
        return new Function.Constructor({ perspective: Perspective.Self, impl }); // TODO: Good way to deal with arity
      }

      export const If = (impl: (self: Ray) => Ray): Function.Constructor => {
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
      export const Match = (cases: MatchCases): Function.Constructor => {
        return Impl(self => self); // TODO
      }
    }

  }
  //   // static CachedAfterUse = <TResult>(constructor: FunctionConstructor<TResult>): FunctionConstructor<TResult> => {
  //   //   return constructor;
  //   // }


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