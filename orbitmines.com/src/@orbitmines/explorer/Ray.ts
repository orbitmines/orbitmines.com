import JS from "./JS";
import {NotImplementedError} from "./errors/errors";


namespace Ray {

  export type Any =
    {
      /** Ray is a function (.next) */
      (...other: JS.Recursive<Ray.Any>): Ray.Any,

      /** Ray is a constructor - TODO: Copy? */
      new (...other: JS.Recursive<Ray.Any>): Ray.Any,
    }
    /** JavaScript runtime conversions. */
      & Symbol
      & Iterable<Ray.Any>
      & AsyncIterable<Ray.Any>

    & Pick<Ray.Instance, '___instance' | 'on' | 'debug'>

    & {
      -readonly [TKey in keyof typeof Ray.Function.All]: typeof Ray.Function.All[TKey] extends Ray.Any
        ? Ray.Any
        : never;
    }

  export type Constructor = {
  //   initial?: Ray.FunctionConstructor<Ray.Any>,
  //   self?: Ray.FunctionConstructor<Ray.Any>,
  //   terminal?: Ray.FunctionConstructor<Ray.Any>,
    proxy?: ProxyHandler<Ray.Any>,
    debug?: Debug.Listener,
  }

  export const New = (constructor?: Ray.Constructor): Ray.Any => Ray.Instance.New(constructor).proxy;

  export namespace Debug {
    export type Event = { event: string, self: Ray.Any, context: any };
    export type Listener = (event: Event) => void;
  }

  export type Op = { get: (self: Ray.Any) => Ray.Any, set: (self: Ray.Any) => Ray.Any };
  // export type Ops = {
  //   initial(self: Ray.Any): Ray.Any;
  //   self(self: Ray.Any): Ray.Any;
  //   terminal(self: Ray.Any): Ray.Any;
  //   is_orbit(a: Ray.Any, b: Ray.Any): boolean;
  // }

  /**
   * An uninitialized empty Ray, which caches itself once initialized.
   */
  // export const None: Ray.FunctionConstructor<Ray.Any> = Ray.Function.CachedAfterUse(Ray.New);

  export class Instance extends JS.Class.Instance<Ray.Any> {

    static New = (constructor?: Ray.Constructor): Ray.Instance => new Ray.Instance(constructor);


    listeners: Debug.Listener[];

    // get initial(): Ray.Any { return this._initial.call(this.proxy); } set initial(initial: Ray.FunctionConstructor<Ray.Any>) { this._initial = Ray.Function.New(initial); } protected _initial: Ray.Function<Ray.Any>;
    // get self(): Ray.Any { return this._self.call(this.proxy); } set self(self: Ray.FunctionConstructor<Ray.Any>) { this._self = Ray.Function.New(self); } protected _self: Ray.Function<Ray.Any>;
    // get terminal(): Ray.Any { return this._terminal.call(this.proxy); } set terminal(terminal: Ray.FunctionConstructor<Ray.Any>) { this._terminal = Ray.Function.New(terminal); } protected _terminal: Ray.Function<Ray.Any>;

    protected constructor({
                            // initial, self, terminal
      proxy,
      debug,
    }: Ray.Constructor = {}) {
      super({ proxy: proxy ?? Ray.ProxyHandlers.Default });

      this.listeners = debug ? [debug] : [];

      // this._initial = Ray.Function.New(initial ?? Ray.None);
      // this._self = Ray.Function.New(self ?? this.proxy);
      // this._terminal = Ray.Function.New(terminal ?? Ray.None);
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

  export class Compiler { // Ray is Compiler

    /**
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
     *
     * TODO: Testing
     *  - Test if references hold after equivalence/composition...
     *
     * TODO: After initial demo:
     *  - Allow mapping/finding of other implementations regarding some equiv funcs (like different ways of implementing using NAND etc...)
     */

  }

  export namespace Op {
    export enum New { NONE, INITIAL, VERTEX, TERMINAL }
    export enum Zeroary {

    }
    // Should not need anything elese ; so could be any one thing?
    export enum Unary {
      INITIAL,
      SELF, // TODO .as_reference? Basically, Ray.directions
      TERMINAL
    }
    export enum Binary {
      IS_ORBIT // a.___instance === b.___instance
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
          return (hint: string) => { return 100; };
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

  export type Enum<T extends Array<string>> = {
    [TKey in T[number]]: Ray.Any
  }
  /** Ray is an Enum(eration) */
  export namespace Enum {

    export const Impl = <T extends Array<string>>(...values: T): Enum<T> => {
      return Object.fromEntries(values.map(value =>
        [value, Ray.Function.None.Impl((): Ray.Any => {
          throw new NotImplementedError(); // TODO
        })]
      )) as Enum<T>;
      // TODO: ONE OF 4 SELECTION RAY for the case of type.
    }

  }
  /** Ray is a function (.next) */
  export namespace Function {

    /** {T} is just an example/desired use case. But it generalizes to any function. */
    export type Type<T> = T | Ray.Any;

    /** From which perspective the Function is implemented. */
    enum Perspective { None, Self, /** Ref, */ } // TODO Ray.Enum? or not.

    //   /**
    //    * Implement a function from the perspective of 'this' for 'this.self'.
    //    */
    //   // static Ref = <TResult>(impl: (ref: Ray.Any) => TResult): Function<TResult> => Ray.Function.Self(self => impl(self.as_reference()));

    //   // static CachedAfterUse = <TResult>(constructor: FunctionConstructor<TResult>): FunctionConstructor<TResult> => {
    //   //   return constructor;
    //   // }


    /** Implement a function from no (or: an ignorant) perspective. */
    export namespace None {

      export const Impl = (impl: () => Ray.Any): Ray.Any => {
        throw new NotImplementedError();
        // return new Ray.Any({ perspective: Perspective.None, impl });
      }

    }

    /** Implement a function from the perspective of 'this' */
    export namespace Self {
      export const Impl = (impl: Ray.Op.Unary | ((self: Ray.Any) => Ray.Any)): Ray.Any => {
        throw new NotImplementedError();
        // return new Ray.Any({ perspective: Perspective.Self, impl });
      }

      export const Binary = (impl: Ray.Op.Binary | ((a: Ray.Any, b: Ray.Any) => Ray.Any)): Ray.Any => {
        throw new NotImplementedError();
        // return new Ray.Any({ perspective: Perspective.Self, impl }); // TODO: Good way to deal with arity
      }

      export const If = (impl: (self: Ray.Any) => Ray.Any): Ray.Any => {
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
      export const Match = (cases: MatchCases): Ray.Any => {
        return Impl(self => self); // TODO
      }
    }

    export const Get = <TProperty extends keyof (typeof Ray.Function.All)>(
      property: TProperty
    ): (typeof Ray.Function.All)[TProperty] | undefined => Ray.Function.All[property as TProperty] ?? undefined;

    export namespace All {

      /** [  |-?] */ export const is_initial = Ray.Function.Self.Impl(
        self => self.initial().is_none()
      );
      /** [--|--] */ export const is_vertex = Ray.Function.Self.Impl(
        self => self.is_initial().nor(self.is_terminal())
      );
      /** [?-|  ] */ export const is_terminal = Ray.Function.Self.Impl(
        self => self.terminal().is_none()
      );
      /** [  |  ] */ export const is_reference = Ray.Function.Self.Impl(
        self => self.is_initial().and(self.is_terminal())
      );
      /** [?-|  ] or [  |-?] */ export const is_boundary = Ray.Function.Self.Impl(
        self => self.is_initial().xor(self.is_terminal())
      );

      export const type = Ray.Function.Self.Match([
        /** [  |  ] */ [is_reference, Ray.Type.REFERENCE],
        /** [  |-?] */ [is_initial, Ray.Type.INITIAL],
        /** [?-|  ] */ [is_terminal, Ray.Type.TERMINAL],
        /** [--|--] */ Ray.Type.VERTEX
      ]);

      /**
       * This is basically what breaks the recursive structure.
       *
       * Tries for "global coherence", practically this just means self-reference, were no change is (inconsistently) assumed...
       *
       * ---
       *
       * Another way of interpreting a possible way of implementing it, is no matter how much more detail we would like to ask, the only thing we ever see is the same structure again (if we ignore the difference of us asking about that additional structure, that's still a possible handle on some difference).
       *
       * As a way of saying/.../assuming: I only 'infinitely' assume it's only this structure, "it seems to halt here". Note that this is necessarily an assumption. No guarantee of this can be made. This is necessarily an equivalence, ..., ignorance.
       *
       * @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Quite%20similarly%20to%20the%20loops%2C%20I%20could%20be%20ignorant%20of%20additional%20structure%20by%20assuming%20it%27s%20not%20there.
       */
      export const is_none = Ray.Function.Self.Impl(
        self => self.is_orbit(self.dereference())
      );
      export const is_some = Ray.Function.Self.Impl(
        self => self.is_none().not()
      );

      /**
       * Concretely, we use here "whatever the JavaScript engine run on" as the thing which has power over the equivalence assumption we use to halt programs. - The asymmetry which allows the engine to make a distinction between each object.
       *
       * @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=And%20there%20we%20have%20it%2C%20an%20infinity%2C%20loop%2C%20...%2C%20orbit%20if%20we%20ignore%20the%20difference.
       */
      export const is_orbit = Ray.Function.Self.Binary(Op.Binary.IS_ORBIT);

      export const self_reference = Ray.Function.Self.Impl(
        self => self
      );

      // TODO: set = none;
      // TODO: Destroy the current thing, connect .initial & .terminal ? (can do just direct connection, preserves 'could have been something here') - then something like [self.initial, self, self.terminal].pop().
      // TODO: Leave behind --] [-- or connect them basically..

      // @alias('destroy', 'clear', 'delete', 'pop')
      export const none = Ray.Function.Self.Impl( // TODO FROM REF SPEC?
        self => self.self = Op.New.NONE // TODO self: self_reference
      );

      /** An arbitrary Ray, defining what continuing in this direction is equivalent to. */
      export const terminal = Ray.Function.Self.Impl(Op.Unary.TERMINAL);
      /** An arbitrary Ray, defining what continuing in the reverse of this direction is equivalent to. */
      export const initial = Ray.Function.Self.Impl(Op.Unary.INITIAL);
      /**
       * An arbitrary Ray, defining what our current position is equivalent to.
       *
       * Moving to the intersecting Ray at `.self` - as a way of going an abstraction layer (lower), and asking what's inside.
       */
        // @alias('dereference', 'self')
      export const dereference = Ray.Function.Self.Impl(Op.Unary.SELF);
      export const self = dereference;

      /**
       * Moving `self` to `.self` on an abstraction layer (higher). As a way of being able to describe `self`.
       *
       * TODO: the .reference might need two levels of abstraction higher, one to put it at the .self, another to reference that thing? (Depends a bit on the execution layer)
       */
      export const reference = Ray.Function.Self.Impl(
        self => Ray.New({ self: self })
      );

      /**
       * @see "Continuations as Equivalence (can often be done in parallel - not generally)": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Continuations%20%2D%20Continuations%20as%20Equivalence
       */
        // @alias('merge, 'continues_with', 'compose')
      export const compose = Ray.Function.Self.Binary(
          (a, b) => a.terminal().equivalent(b.initial())
        );

      // @alias('modular', 'modulus', 'orbit')
      export const orbit = Ray.Function.Self.Binary(
        (a, b) => a.first().initial().compose(b.last().terminal())
      );

      /**
       * Equivalence as "Composition of Ray."
       *
       * NOTE:
       *  - An equivalence, is only a local equivalence, no global coherence of it can be guaranteed. And it is expensive work to edge towards global coherence.
       *  - Though changes are only applied locally, their effects can be global (Take for instance, the example of adding to one Ray, which changes the perspective of everything connected to that Ray if they were to traverse the connection).
       *
       * @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=On%20Equivalences%20%26%20Inconsistencies
       */
      export const equivalent = Ray.Function.Self.Binary(
        (a, b) => {
          // throw new NotImplementedError();

          // TODO: This is close but not quite, use the shifting thing I wrote down a few days ago: (And then use something to break the self-reference) - Either on this side. compose, or outside the definitions
          // This one harder to do in parallel?
          return a.self().compose(b.self());
        });

      /**
       * If there exists an orbit between A & B, anywhere (so dually connected, what if only one is aware??).
       */
        // @alias('includes', 'contains') ; (slightly different variants?)
      export const is_equivalent = Ray.Function.Self.Binary(
          (a, b) => a.self().traverse().is_orbit(b.self().traverse()) // Basically: does there exist a single connection between the two?
        );

      export const traverse = Ray.Function.Self.Impl(
        (a) => { throw new NotImplementedError(); }
      );


      // TODO: .next but arbitrary step??
      export const next = Ray.Function.Self.Impl((self) => {
        throw new NotImplementedError();
        return self;
      });
      export const has_next = Ray.Function.Self.Impl((self) => self.next().is_some());
      // @alias('end', 'result', 'back', 'output')
      export const last = Ray.Function.Self.Impl((self) => {
        throw new NotImplementedError();
        return self;
      });

      export const previous = Ray.Function.Self.Impl((self) => self.not().next());
      // @alias()
      export const has_previous = Ray.Function.Self.Impl((self) => self.not().has_next());
      // @alias('beginning', 'front')
      export const first = Ray.Function.Self.Impl((self) => self.not().last());

      // @alias('not', 'reverse', 'swap', 'converse', 'negative', 'neg')
      // export const not = Ray.Function.Self.Impl(self => );
      // self.terminal = self.initial();
      // self.initial = self.terminal();
      // self.not().not() = self
      // TODO: What's the difference in context between stepping after not / or not doing so.
      // TODO; OR BINARY? - "It's just always .next from some perspective?"
      // TODO: Level at which "not" is applied.
      export const not = Ray.Function.Self.Binary((a, b) => b);

      export const and = Ray.Function.Self.Binary((a, b) => { throw new NotImplementedError();
      } );
      export const or = Ray.Function.Self.Binary((a, b) => {
        throw new NotImplementedError();
        return self;
      });
      export const xor = Ray.Function.Self.Binary((a, b) => a.xnor(b).not());
      export const xnor = Ray.Function.Self.Binary((a, b) => a.is_orbit(b)); // TODO: Could be 'is_equivalent' too?
      export const nand = Ray.Function.Self.Binary((a, b) => a.and(b).not());
      export const nor = Ray.Function.Self.Binary((a, b) => a.or(b).not());


      // @alias(`push_{last.alias}`)
      export const push_back = Ray.Function.Self.Binary(
        (a, b) => a.last().compose(b)
      );
      // @alias(`push_{first.alias}`)
      export const push_front = Ray.Function.Self.Binary(
        (a, b) => b.compose(a.first())
      );
    }
  }

  /** JavaScript runtime conversions */
    export const iterable = <T = any>(iterable: Iterable<T>): Ray.Any => Ray.iterator(iterable[Symbol.iterator]());
    export const async_iterable = <T = any>(async_iterable: AsyncIterable<T>): Ray.Any => Ray.async_iterator(async_iterable[Symbol.asyncIterator]());
    export const iterator = <T = any>(iterator: Iterator<T>): Ray.Any => { throw new NotImplementedError(); }
    export const async_iterator = <T = any>(async_iterator: AsyncIterator<T>): Ray.Any => { throw new NotImplementedError(); }
    export const generator = <T = any>(generator: Generator<T>): Ray.Any => Ray.iterator(generator);
    export const async_generator = <T = any>(generator: AsyncGenerator<T>): Ray.Any => Ray.async_iterator(generator);

    export const number = (number: number) => { throw new NotImplementedError(); }


  /** TODO: Shouldn't classify these? */
  export const Type = Ray.Enum.Impl('REFERENCE', 'INITIAL', 'TERMINAL', 'VERTEX');

  // export const Boundary = { INITIAL: Type.INITIAL, TERMINAL: Type.TERMINAL }; TODO: LIST O

  // TODO CAN ALSO BE ZERO-ARY..
  // @alias('resize', 'size', 'structure', 'length', 'duplicate', 'copy') -> Should be generalized as any kind of structure, but with this thing repeated on it. ; use traversal or ...
  export const size = Ray.Function.Self.Binary(
    (a, size) => { throw new NotImplementedError(); }
  );
  // @alias('bit')
  // export const boolean = size(2);

}

export default Ray;