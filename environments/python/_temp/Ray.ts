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

  /**
   * An uninitialized empty Ray, which caches itself once initialized.
   */
  // export const None: Ray.FunctionConstructor<Ray.Any> = Ray.Function.CachedAfterUse(Ray.New);

  // export class Object {
  //
  //   // TODO: Could copy?
  //   get initial(): Ray.Any { return this._initial(); } set initial(initial: Ray.Any) { this._initial = initial; } protected _initial: Ray.Any;
  //   get self(): Ray.Any { return this._self(); } set self(self: Ray.Any) { this._self = self; } protected _self: Ray.Any;
  //   get terminal(): Ray.Any { return this._terminal(); } set terminal(terminal: Ray.Any) { this._terminal = terminal; } protected _terminal: Ray.Any;
  //
  //   protected constructor({ initial, self, terminal }: { initial?: Ray.Any, self?: Ray.Any, terminal?: Ray.Any } = {}) {
  //
  //     this._initial = initial ?? Ray.none.memoized;
  //     this._self = self ?? Ray.self_reference;
  //     this._terminal = terminal ?? Ray.none.memoized;
  //   }
  // }

  /** A simplistic compiler for Ray */
  export namespace Compiler { // TODO Ray is Compiler

    /**
     * In the case of Rays, whether something is a vertex/initial/terminal is only inferred from surrounding context. And these checks only need to happen locally in order to decide how to traverse arbitrary structure (as in - I only need to check the presence of something next to me, not traverse the whole direction recursively in order to decide what to do).
     *
     * How about treating something like something which the context says it's not? (Could apply this sort of thing in some fidelity/consistency checking mechanism as a way of fuzzing the fidelity mechanism)
     *
     * TODO: Reference maybe as an orbit at the point is the thing ignorant
     *
     * TODO: Compiler could have things like other composed rays which tell it cares about the other (even if that's correct or not??)
     *
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


  export namespace ProxyHandlers {

    export const Default: ProxyHandler<Ray.Any> = JS.Class.Handler<Ray.Any>({
      /** ray.property */
      get: (self: Ray.Any, instance: Ray.Instance, property: string | symbol): any => {
        instance.on({ event: 'PROXY.GET', context: { property } });

        /** Use any field on {Ray.Instance}, which we want to delegate to, first. */
        if (property === '___instance' || property === 'debug' || property === 'on') { return instance[property]; }

        /** Otherwise, switch to functions defined on {Ray.Functions}  */
        const func = Ray.Function.Get(property as any);
        if (func) { return func.as_method({ self, property }); }

        if (property === Symbol.toPrimitive)
          return (hint: string) => { return 100; }; // TODO: Can be used to setup label generation through javascript objects if we want to ? + allow search on this
        // throw new NotImplementedError(``);

        /** Not implemented. */
        throw new NotImplementedError(`Called property '${String(property)}' on Ray, which has not been implemented.`);
      },

      /** ray.property = something; */
      set: (self: Ray.Any, instance: Ray.Instance, property: string | symbol, value: any): boolean => {
        instance.on({ event: 'PROXY.SET', context: { property, value } });

        throw new NotImplementedError();
      },

      /** delete ray.property; */
      deleteProperty: (self: Ray.Any, instance: Ray.Instance, property: string | symbol): boolean => {
        instance.on({ event: 'PROXY.DELETE', context: { property } });

        throw new NotImplementedError();
      },

      /** ray() is called. */
      apply: (self: Ray.Any, instance: Ray.Instance, args: any[]): any => {
        instance.on({ event: 'PROXY.APPLY', context: { args } });

        throw new NotImplementedError(`${self}`);
      },

      /** new ray() */
      construct: (self: Ray.Any, instance: Ray.Instance, args: any[]): object => {
        instance.on({ event: 'PROXY.NEW', context: { args } });

        throw new NotImplementedError(`${args.length} ${self}`);
      },

      /** property in ray; */
      has: (self: Ray.Any, instance: Ray.Instance, property: string | symbol): boolean => {
        instance.on({ event: 'PROXY.HAS', context: { property } });

        throw new NotImplementedError(`${String(property)}`);
      },
    });
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

    /** {T} is just an example/desired use case. But it generalizes to any function. */
    export type Type<T> = T | Ray.Any;

    /** From which perspective the Function is implemented. */
    enum Perspective {
      None, Self, /** Ref, */
    }

    //   /**
    //    * Implement a function from the perspective of 'this' for 'this.self'.
    //    */
    //   // static Ref = <TResult>(impl: (ref: Ray.Any) => TResult): Function<TResult> => Ray.Function.Self(self => impl(self.as_reference()));

    /** Implement a function from no (or: an ignorant) perspective. */
    export namespace None {

      export const Impl = (impl: Op.Zeroary.Type<Ray.Any>): Ray.Any => {
        throw new NotImplementedError();
        // return new Ray.Any({ perspective: Perspective.None, impl });
      }

    }

    /** Implement a function from the perspective of 'this' */
    export namespace Self {
      export const Impl = (impl: Op.Unary.Type<Ray.Any>): Ray.Any => {
        throw new NotImplementedError();
        // return new Ray.Any({ perspective: Perspective.Self, impl });
      }

      export const Binary = (impl: Op.Binary.Type<Ray.Any>): Ray.Any => {
        throw new NotImplementedError();
        // return new Ray.Any({ perspective: Perspective.Self, impl }); // TODO: Good way to deal with arity
      }

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

  export namespace Function {
    export const Get = <TProperty extends keyof (typeof Ray.Function.All)>(
      property: TProperty
    ): (typeof Ray.Function.All)[TProperty] | undefined => Ray.Function.All[property as TProperty] ?? undefined;

    export namespace All {

      export const traverse = Ray.Function.Self.Impl(
        (a) => { throw new NotImplementedError(); }
      );

      // export const not = Ray.Function.Self.Impl(self => );
      // self.terminal = self.initial();
      // self.initial = self.terminal();
      // self.not().not() = self
      // TODO: What's the difference in context between stepping after not / or not doing so.
      // TODO; OR BINARY? - "It's just always .next from some perspective?"
      // TODO: Level at which "not" is applied.
      export const not = Ray.Function.Self.Binary((a, b) => b);

      /**
       * Placing existing structure on a new Reference, Boundary or Vertex:
       */
        // TODO: These should allow as_vertex as zero-ary, but that means self = self_reference, not none. ?
        /**
         * Moving `self` to `.self` on an abstraction layer (higher). As a way of being able to describe `self`.
         *
         * TODO: the .reference might need two levels of abstraction higher, one to put it at the .self, another to reference that thing? (Depends a bit on the execution layer)
         */
        export const as_reference = Ray.Function.Self.Impl(
          self => none().self = self
        );

        // TODO as_reference.as_vertex instead of as_vertex ignorant by default?

        export const as_vertex = Ray.Function.Self.Impl((self) => {
          const vertex = Ray.Op.Zeroary.All.none();
          vertex.initial = self_reference;
          vertex.terminal = self_reference;
          vertex.self = self; // TODO: Like this, ignorant vs non-ignorant? What to do here?

          return vertex;
        });
        export const as_terminal = Ray.Function.Self.Impl((self) => {
          const terminal = Ray.Op.Zeroary.All.none();
          terminal.initial = self_reference;
          // terminal.terminal = none;
          terminal.self = self;

          return terminal;
        });
        export const as_initial = Ray.Function.Self.Impl((self) => {
          const initial = Ray.Op.Zeroary.All.none();
          // initial.initial = none;
          initial.terminal = self_reference;
          initial.self = self;

          return initial;
        });

      /**
       * Any arbitrary direction, where .not (or reversing the direction) relies on some memory mechanism
       */
      export const memoized = Ray.Function.Self.Impl(
        self => { throw new NotImplementedError(); }
      );
    }
  }

  export const self_reference = Ray.Function.Self.Impl(
    self => self
  );

  // export const Boundary = { INITIAL: Type.INITIAL, TERMINAL: Type.TERMINAL }; TODO: LIST O

}

export default Ray;