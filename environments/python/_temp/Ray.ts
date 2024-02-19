import JS, {NotImplementedError} from "@orbitmines/js";

namespace Ray {

  export type Any =
    {
      /** Ray is a constructor - TODO: Copy? */
      new (...other: JS.Recursive<Ray.Any>): Ray.Any,
    }
    /** JavaScript runtime conversions. */
      & Symbol

    & Pick<Ray.Instance, '___instance' | 'on' | 'debug'>

    /** Preconfigured functions defined for Rays. */
    & {
      -readonly [TKey in keyof typeof Ray.Function.All]: typeof Ray.Function.All[TKey] extends Ray.Any
        ? Ray.Any
        : never;
    }

    /** Storage/Movement operations which need to be implemented. */
    & { [TKey in keyof Ray.Op.Impl<Ray.Any>]: Ray.Any }

  export namespace Debug {
    export type Event = { event: string, self: Ray.Any, context: any };
    export type Listener = (event: Event) => void;
  }

  /** A simplistic compiler for Ray */
  export namespace Compiler { // TODO Ray is Compiler

    /**
     *
     *
     * How about treating something like something which the context says it's not? (Could apply this sort of thing in some fidelity/consistency checking mechanism as a way of fuzzing the fidelity mechanism)
     *
     * TODO: Reference maybe as an orbit at the point is the thing ignorant
     *
     * TODO: Compiler could have things like other composed rays which tell it cares about the other (even if that's correct or not??)
     *
     * TODO: Do I want to keep the is_equiv/is_composed pattern? Or simplify to one of the two?
     *
     *  // TODO: NEVER DIRECTLY EXECUTE, ONLY AFTER CHAIN OF FUNCS, possibly arbitrarily LAZY
     *
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
     * // TODO: Should be automatic? is_orbit() or any method without arguments is a.is_orbit(a.self()) ?? not a.is_orbit(a) ; ???
     *
     *  - .initial/.terminal can be seen as a particular connection on .self, which .self ignores?
     *
     *  TODO: Allow hooking
     *
     * TODO: Testing
     *  - Test if references hold after equivalence/composition...
     *
     * TODO: After initial demo:
     *  - Allow mapping/finding of other implementations regarding some equiv funcs (like different ways of implementing using NAND etc...)
     *
     *  Arbitrary.
     *
     *  TODO Pass a single ray to the runtime, and run that way? Access runtime as variable from ray? That would have programs accessing possible runtimes?
     */
  }

  export type Constructor = { proxy?: ProxyHandler<Ray.Any>, debug?: Debug.Listener, }

  export class Instance extends JS.Class.Instance<Ray.Any> {

    listeners: Debug.Listener[];

    constructor({
      proxy,
      debug,
    }: Ray.Constructor = {}) {
      super({ proxy: proxy ?? Ray.ProxyHandlers.Default });

      this.listeners = debug ? [debug] : [];
    }

    /** Used to jump out of the proxy. */
    get ___instance(): Instance { return this; }

    debug = <T>(
      on: Debug.Listener,
      func: JS.ParameterlessFunction<T>
    ): T => {
      this.listeners.push(on);
      const ret = func();
      this.listeners.pop(); // TODO?

      return ret;
    }

    /** Simple debug/traversal mechanism. */
    on = (event: Omit<Debug.Event, 'self'>) => {
      if (!this.listeners) return;

      this.listeners.forEach(listener => listener({ ...event, self: this.proxy }));
    }

  }

  /** Ray is an Enum(eration) */
  export namespace Enum {

    export type Type<T extends Array<string>> = {
      [TKey in T[number]]: Ray.Any
    }

    export const Impl = <T extends Array<string>>(...enumeration: T): Type<T> => {
      return Object.fromEntries(enumeration.map(value =>
        [value, Ray.Function.None.Impl((): Ray.Any => {
          throw new NotImplementedError(); // TODO
        })]
      )) as Type<T>;
      // TODO: ONE OF 4 SELECTION RAY for the case of type.
    }

  }

  /** Ray is a function (.next) */
  export namespace Function {

    //   /**
    //    * Implement a function from the perspective of 'this' for 'this.self'.
    //    */
    //   // static Ref = <TResult>(impl: (ref: Ray.Any) => TResult): Function<TResult> => Ray.Function.Self(self => impl(self.as_reference()));

    export namespace Self {

      // export const If = (impl: Op.Unary.Type<Ray.Any>): Ray.Any => {
      //   return Impl(impl); // TODO: GENERIC collapse to boolean implemented and overridable
      // }
      // TODO: GENERIC collapse to boolean implemented and overridable

      /**
       * TODO:
       *   - Maybe replace switch with 'zip'?, What are the practical differences?
       */
      // export const Match = (cases: MatchCases): Ray.Any => {
      //   return Impl(self => self); // TODO
      // }
    }
  }
  export const traverse = Ray.Function.Self.Impl(
    (a) => { throw new NotImplementedError(); }
  );

}

export default Ray;