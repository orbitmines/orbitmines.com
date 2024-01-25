import JS, {NotImplementedError} from "@orbitmines/js";

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

    /** Preconfigured functions defined for Rays. */
    & {
      -readonly [TKey in keyof typeof Ray.Function.All]: typeof Ray.Function.All[TKey] extends Ray.Any
        ? Ray.Any
        : never;
    }

    /** Storage/Movement operations which need to be implemented. */
    & { [TKey in keyof Ray.Op.Impl<Ray.Any>]: Ray.Any }

  export type Constructor = {
    initial?: Ray.Any,
    self?: Ray.Any,
    terminal?: Ray.Any,

    proxy?: ProxyHandler<Ray.Any>,
    debug?: Debug.Listener,
  }

  export const New = (constructor?: Ray.Constructor): Ray.Any => Ray.Instance.New(constructor).proxy;

  export namespace Debug {
    export type Event = { event: string, self: Ray.Any, context: any };
    export type Listener = (event: Event) => void;
  }

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
     */

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

  export namespace Op {

    export type Impl<T> =
      { [TKey in keyof (typeof Op.Zeroary.All)]: Op.Zeroary.Type<T> }
      & { [TKey in keyof (typeof Op.Unary.All)]: Op.Unary.Type<T> }
      & { [TKey in keyof (typeof Op.Binary.All)]: Op.Binary.Type<T> }

    export const all = <TOps extends {
      [op: string]: string
    }>(ops: TOps): {
      [TOP in keyof TOps]: Ray.Any
    } => ({});

    export namespace Zeroary {
      export type Type<T> = () => T;
      export type Any<T> = (keyof typeof Op.Zeroary.All) | Type<T>;

      // TODO: set = none;
      // TODO: Destroy the current thing, connect .initial & .terminal ? (can do just direct connection, preserves 'could have been something here') - then something like [self.initial, self, self.terminal].pop().
      // TODO: Leave behind --] [-- or connect them basically..
      export const All = Op.all({
        // @alias('alloc', 'new', 'create', 'initialize')
        none: 'none',
      });
    }
    export namespace Unary {
      export type Type<T> = (a: T) => T;
      export type Any<T> = (keyof typeof Op.Unary.All) | Type<T>;

      export const All = Op.all({

        // @alias('free', 'destroy', 'clear', 'delete', 'pop')
        free: 'free',

        /** An arbitrary Ray, defining what continuing in the reverse of this direction is equivalent to. */
        initial: 'initial',   // a.initial

        /**
         * An arbitrary Ray, defining what our current position is equivalent to.
         *
         * Moving to the intersecting Ray at `.self` - as a way of going an abstraction layer (lower), and asking what's inside.
         */
        // @alias('dereference', 'self')
        self: 'self',         // a.self

        /** An arbitrary Ray, defining what continuing in this direction is equivalent to. */
        terminal: 'terminal', // a.terminal
      });
    }
    export namespace Binary {
      export type Type<T> = (a: T, b: T) => T;
      export type Any<T> = (keyof typeof Op.Binary.All) | Type<T>;

      export const All = Op.all({
        initial: 'initial',   // a.initial = b
        self: 'self',         // a.self = b
        terminal: 'terminal', // a.terminal = b

        /**
         * Concretely, we use here "whatever the JavaScript engine run on" as the thing which has power over the equivalence assumption we use to halt programs. - The asymmetry which allows the engine to make a distinction between each object.
         *
         * @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=And%20there%20we%20have%20it%2C%20an%20infinity%2C%20loop%2C%20...%2C%20orbit%20if%20we%20ignore%20the%20difference.
         */
        // @alias('is_none')
        is_orbit: 'is_orbit', // a.___instance === b.___instance
      });
    }
  }

  export namespace Function {
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
      export const is_none = Ray.Op.Binary.All.is_orbit;
      export const is_some = Ray.Function.Self.Impl(
        self => self.is_none().not()
      );

      export const self_reference = Ray.Function.Self.Impl(
        self => self
      );

      /**
       * @see "Continuations as Equivalence (can often be done in parallel - not generally)": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Continuations%20%2D%20Continuations%20as%20Equivalence
       */
        // @alias('merge, 'continues_with', 'compose')
      export const compose = Ray.Function.Self.Binary(
          (a, b) => a.terminal().equivalent(b.initial())
        );

      /**
       * "Composing an terminal & initial boundary"
       * - TODO: Note that an orbit is reversibility. ?
       * - TODO: Could represent this abstraction in another layer what we want to accomplish while the actual search is still taking place.
       *
       * - Like with 'copy' and all concepts: Note that we're only after reversibility after ignoring some difference.
       *
       * @see "Reversibility is necessarily inconsistent": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Another%20example%20of%20this%20is%20reversibility
       */
      // @alias('modular', 'modulus', 'orbit', 'circle', 'repeats', 'infinitely')
      export const orbit = Ray.Function.Self.Binary(
        /**
         * - TODO: If we're only doing one end: This already assumes they are connected on the other end.
         * - TODO: should be a connection here, with is_composed ; or "reference.is_equivalent" so that you can drop one of the sides, or both.
         */
        (a, b) => ( b.last().compose(a.first()) ).and( a.first().compose(b.last()) )
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
       * If there exists an orbit between A & B anywhere on their equivalency functions - or: their .self - (except for the directions through which we're referencing them)
       *
       * Note the connection between 'is_orbit' vs 'is_equivalence'. They're essentially the same thing, but:
       *    - in the case of 'is_equivalence' we directly have access to their difference but are explicitly ignoring them - in the context in which this functionality is called.
       *    - in the case of 'is_orbit', we might need to do more complicated things to acknowledge their differences - we don't have direct access to them.
       *
       * TODO: (so dually connected, what if only one is aware??) Or basically just ; the answer in this particular instance is just if either end can find the other only once. Consistency of it defined on a more abstract level...
       */
        // @alias('includes', 'contains') ; (slightly different variants?)
      export const is_equivalent = Ray.Function.Self.Binary(
          (a, b) => a.self().traverse().is_orbit(b.self().traverse())
        );
      // TODO: Either is_equiv or is_composed will likely change?.
      export const is_composed = Ray.Function.Self.Binary(
        (a, b) => a.traverse().is_orbit(b.traverse()) // Basically: does there exist a single connection between the two?
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

      /**
       * Performing a copy (realizing it) can be conceptualized as traversing the entire structure. (Where the 'entire structure' means the current instantiation of it - with many ignorances attached)
       *
       * - A problem with a copy, is that in or to be generalizable, it needs to alter all references to the thing it's copying to itself - this cannot be done with certainty.
       *    - This copy does not do that. Instead, it is ignorant of other things referencing the thing it's copying.
       * - Additionally, a copy necessarily has some non-redundancy to it:
       *
       * @see "A copy is necessarily inconsistent": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=If%20I%20have%20one%20thing%20and%20I%20make%20a%20perfect%20copy
       */
      // @alias('clone', 'duplicate')
      export const copy = Ray.Function.Self.Impl(
        // or
        // (self) => self.self.copy.reference()
        (self) => none().self = self.self.copy()

          // TODO Relies heavily on the execution layer to copy initial/terminal etc... ; and an is_orbit check before calling copy again. - Then again on the execution layer it can lazily do this copy (by not evaluating (i.e.) traversing everywhere), or it first does this traversing directly.
      );

      export const none = Ray.Op.Zeroary.All.none; // TODO FOR ALL OPS, ? automatic, or just put them here.

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

    }
  }

  /** JavaScript runtime conversions */
    export const array = <T = any>(array: T[]): Ray.Any => Ray.iterable(array);
    export const iterable = <T = any>(iterable: Iterable<T>): Ray.Any => Ray.iterator(iterable[Symbol.iterator]());
    export const async_iterable = <T = any>(async_iterable: AsyncIterable<T>): Ray.Any => Ray.async_iterator(async_iterable[Symbol.asyncIterator]());
    export const iterator = <T = any>(iterator: Iterator<T>): Ray.Any => { throw new NotImplementedError(); }
    export const async_iterator = <T = any>(async_iterator: AsyncIterator<T>): Ray.Any => { throw new NotImplementedError(); }
    export const generator = <T = any>(generator: Generator<T>): Ray.Any => Ray.iterator(generator);
    export const async_generator = <T = any>(generator: AsyncGenerator<T>): Ray.Any => Ray.async_iterator(generator);

    export const number = (number: number) => { throw new NotImplementedError(); }

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