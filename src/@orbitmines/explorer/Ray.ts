import JS from "./JS";
import {NotImplementedError} from "./errors/errors";

type Ray =
  {
    /** Ray is a function (.next) */
    (...other: JS.Recursive<Ray>): Ray,

    /** Ray is a constructor - TODO: Copy? */
    new (...other: JS.Recursive<Ray>): Ray,
  }
  /** JavaScript runtime conversions. */
    & Symbol
    & Iterable<Ray>
    & AsyncIterable<Ray>

  & Pick<Rays.Instance, '___instance' | 'on' | 'debug'>

  & {
    -readonly [TKey in keyof typeof Rays.Functions]: typeof Rays.Functions[TKey] extends JS.Function.Constructor
      ? Ray
      : never;
  }

export default Ray;

export namespace Rays {

  export type Constructor = {
  //   initial?: JS.FunctionConstructor<Ray>,
  //   self?: JS.FunctionConstructor<Ray>,
  //   terminal?: JS.FunctionConstructor<Ray>,
    proxy?: ProxyHandler<Ray>,
    debug?: Debug.Listener,
  }

  /**
   * TODO: Shouldn't classify these?
   */
  export const Type = JS.Enum.Impl('REFERENCE', 'INITIAL', 'TERMINAL', 'VERTEX');

  // export const Boundary = { INITIAL: Type.INITIAL, TERMINAL: Type.TERMINAL }; TODO: LIST O

  export const New = (constructor?: Rays.Constructor): Ray => Rays.Instance.New(constructor).proxy;

  export namespace Debug {
    export type Event = { event: string, self: Ray, context: any };
    export type Listener = (event: Event) => void;
  }

  export type Op = { get: (self: Ray) => Ray, set: (self: Ray) => Ray };
  // export type Ops = {
  //   initial(self: Ray): Ray;
  //   self(self: Ray): Ray;
  //   terminal(self: Ray): Ray;
  //   is_orbit(a: Ray, b: Ray): boolean;
  // }

  /**
   * An uninitialized empty Ray, which caches itself once initialized.
   */
  // export const None: JS.FunctionConstructor<Ray> = JS.Function.CachedAfterUse(Rays.New);

  export class Instance extends JS.Class.Instance<Ray> {

    static New = (constructor?: Rays.Constructor): Rays.Instance => new Rays.Instance(constructor);


    listeners: Debug.Listener[];

    // get initial(): Ray { return this._initial.call(this.proxy); } set initial(initial: JS.FunctionConstructor<Ray>) { this._initial = JS.Function.New(initial); } protected _initial: JS.Function<Ray>;
    // get self(): Ray { return this._self.call(this.proxy); } set self(self: JS.FunctionConstructor<Ray>) { this._self = JS.Function.New(self); } protected _self: JS.Function<Ray>;
    // get terminal(): Ray { return this._terminal.call(this.proxy); } set terminal(terminal: JS.FunctionConstructor<Ray>) { this._terminal = JS.Function.New(terminal); } protected _terminal: JS.Function<Ray>;

    protected constructor({
                            // initial, self, terminal
      proxy,
      debug,
    }: Rays.Constructor = {}) {
      super({ proxy: proxy ?? ProxyHandlers.Ray });

      this.listeners = debug ? [debug] : [];

      // this._initial = JS.Function.New(initial ?? Rays.None);
      // this._self = JS.Function.New(self ?? this.proxy);
      // this._terminal = JS.Function.New(terminal ?? Rays.None);
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

    export const Ray: ProxyHandler<Ray> = JS.Class.Handler<Ray>({
      /** ray.property */
      get: (self: Ray, property: string | symbol): any => {
        // self.on({ event: 'PROXY.GET', context: {  } });

        /** Use any field on {Rays.Instance}, which we want to delegate to, first. */
        if (property === '___instance' || property === 'debug' || property === 'on') { return self.___instance[property]; }

        /** Otherwise, switch to functions defined on {Rays.Functions}  */
        const func = Rays.Function(property);
        if (func) { return func.as_method({ self, property }); }

        if (property === Symbol.toPrimitive)
          return (hint: string) => { return 100; };
        // throw new NotImplementedError(``);

        /** Not implemented. */
        throw new NotImplementedError(`Called property '${String(property)}' on Ray, which has not been implemented.`);
      },

      /** ray.property = something; */
      set: (self: Ray, property: string | symbol, value: any): boolean => {
        throw new NotImplementedError();
      },

      /** delete ray.property; */
      deleteProperty: (self: Ray, property: string | symbol): boolean => {
        throw new NotImplementedError();
      },

      /** ray() is called. */
      apply: (self: Ray, args: any[]): any => {

        throw new NotImplementedError(`${self}`);
      },

      /** new ray() */
      construct: (self: Ray, args: any[]): object => {
        throw new NotImplementedError(`${args.length} ${self}`);
      },

      /** property in ray; */
      has: (self: Ray, property: string | symbol): boolean => {
        throw new NotImplementedError(`${String(property)}`);
      },
    });
  }

  export const Function = <TProperty extends keyof typeof Rays.Functions>(
    property: string | symbol
  ): (typeof Rays.Functions)[TProperty] | undefined => Rays.Functions[property as TProperty] ?? undefined;

  // TODO CAN ALSO BE ZERO-ARY..
  // @alias('resize', 'size', 'structure', 'length', 'duplicate', 'copy') -> Should be generalized as any kind of structure, but with this thing repeated on it. ; use traversal or ...
  export const size = JS.Function.Self.Binary(
    (a, size) => { throw new NotImplementedError(); }
  );
  // @alias('bit')
  // export const boolean = size(2);

  export namespace Functions {

    /** [  |-?] */ export const is_initial = JS.Function.Self.Impl(
      self => self.initial().is_none()
    );
    /** [--|--] */ export const is_vertex = JS.Function.Self.Impl(
      self => self.is_initial().nor(self.is_terminal())
    );
    /** [?-|  ] */ export const is_terminal = JS.Function.Self.Impl(
      self => self.terminal().is_none()
    );
    /** [  |  ] */ export const is_reference = JS.Function.Self.Impl(
      self => self.is_initial().and(self.is_terminal())
    );
    /** [?-|  ] or [  |-?] */ export const is_boundary = JS.Function.Self.Impl(
      self => self.is_initial().xor(self.is_terminal())
    );

    export const type = JS.Function.Self.Match([
      /** [  |  ] */ [is_reference, Rays.Type.REFERENCE],
      /** [  |-?] */ [is_initial, Rays.Type.INITIAL],
      /** [?-|  ] */ [is_terminal, Rays.Type.TERMINAL],
      /** [--|--] */ Rays.Type.VERTEX
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
    export const is_none = JS.Function.Self.Impl(
      self => self.is_orbit(self.dereference())
    );
    export const is_some = JS.Function.Self.Impl(
      self => self.is_none().not()
    );

    /**
     * Concretely, we use here "whatever the JavaScript engine run on" as the thing which has power over the equivalence assumption we use to halt programs. - The asymmetry which allows the engine to make a distinction between each object.
     *
     * @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=And%20there%20we%20have%20it%2C%20an%20infinity%2C%20loop%2C%20...%2C%20orbit%20if%20we%20ignore%20the%20difference.
     */
    export const is_orbit = JS.Function.Self.Binary(Op.Binary.IS_ORBIT);

    export const self_reference = JS.Function.Self.Impl(
      self => self
    );

    // TODO: set = none;
    // TODO: Destroy the current thing, connect .initial & .terminal ? (can do just direct connection, preserves 'could have been something here') - then something like [self.initial, self, self.terminal].pop().
    // TODO: Leave behind --] [-- or connect them basically..

    // @alias('destroy', 'clear', 'delete', 'pop')
    export const none = JS.Function.Self.Impl( // TODO FROM REF SPEC?
      self => self.self = Op.New.NONE // TODO self: self_reference
    );

    /** An arbitrary Ray, defining what continuing in this direction is equivalent to. */
    export const terminal = JS.Function.Self.Impl(Op.Unary.TERMINAL);
    /** An arbitrary Ray, defining what continuing in the reverse of this direction is equivalent to. */
    export const initial = JS.Function.Self.Impl(Op.Unary.INITIAL);
    /**
     * An arbitrary Ray, defining what our current position is equivalent to.
     *
     * Moving to the intersecting Ray at `.self` - as a way of going an abstraction layer (lower), and asking what's inside.
     */
    // @alias('dereference', 'self')
    export const dereference = JS.Function.Self.Impl(Op.Unary.SELF);
    export const self = dereference;

    /**
     * Moving `self` to `.self` on an abstraction layer (higher). As a way of being able to describe `self`.
     *
     * TODO: the .reference might need two levels of abstraction higher, one to put it at the .self, another to reference that thing? (Depends a bit on the execution layer)
     */
    export const reference = JS.Function.Self.Impl(
      self => Rays.New({ self: self })
    );

    /**
     * @see "Continuations as Equivalence (can often be done in parallel - not generally)": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Continuations%20%2D%20Continuations%20as%20Equivalence
     */
    // @alias('merge, 'continues_with', 'compose')
    export const compose = JS.Function.Self.Binary(
      (a, b) => a.terminal().equivalent(b.initial())
    );

    // @alias('modular', 'modulus', 'orbit')
    export const orbit = JS.Function.Self.Binary(
      (a, b) => a.first().initial().compose(b.last().terminal())
    );

    /**
     * Equivalence as "Composition of Rays."
     *
     * NOTE:
     *  - An equivalence, is only a local equivalence, no global coherence of it can be guaranteed. And it is expensive work to edge towards global coherence.
     *  - Though changes are only applied locally, their effects can be global (Take for instance, the example of adding to one Ray, which changes the perspective of everything connected to that Ray if they were to traverse the connection).
     *
     * @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=On%20Equivalences%20%26%20Inconsistencies
     */
    export const equivalent = JS.Function.Self.Binary(
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
    export const is_equivalent = JS.Function.Self.Binary(
      (a, b) => a.self().traverse().is_orbit(b.self().traverse()) // Basically: does there exist a single connection between the two?
    );

    export const traverse = JS.Function.Self.Impl(
      (a) => { throw new NotImplementedError(); }
    );


    // TODO: .next but arbitrary step??
    export const next = JS.Function.Self.Impl((self) => {
      throw new NotImplementedError();
      return self;
    });
    export const has_next = JS.Function.Self.Impl((self) => self.next().is_some());
    // @alias('end', 'result', 'back', 'output')
    export const last = JS.Function.Self.Impl((self) => {
      throw new NotImplementedError();
      return self;
    });

    export const previous = JS.Function.Self.Impl((self) => self.not().next());
    // @alias()
    export const has_previous = JS.Function.Self.Impl((self) => self.not().has_next());
    // @alias('beginning', 'front')
    export const first = JS.Function.Self.Impl((self) => self.not().last());

    // @alias('not', 'reverse', 'swap', 'converse', 'negative', 'neg')
    // export const not = JS.Function.Self.Impl(self => );
    // self.terminal = self.initial();
    // self.initial = self.terminal();
    // self.not().not() = self
    // TODO: What's the difference in context between stepping after not / or not doing so.
    // TODO; OR BINARY? - "It's just always .next from some perspective?"
    // TODO: Level at which "not" is applied.
    export const not = JS.Function.Self.Binary((a, b) => b);

    export const and = JS.Function.Self.Binary((a, b) => { throw new NotImplementedError();
    } );
    export const or = JS.Function.Self.Binary((a, b) => {
      throw new NotImplementedError();
      return self;
    });
    export const xor = JS.Function.Self.Binary((a, b) => a.xnor(b).not());
    export const xnor = JS.Function.Self.Binary((a, b) => a.is_orbit(b)); // TODO: Could be 'is_equivalent' too?
    export const nand = JS.Function.Self.Binary((a, b) => a.and(b).not());
    export const nor = JS.Function.Self.Binary((a, b) => a.or(b).not());


    // @alias(`push_{last.alias}`)
    export const push_back = JS.Function.Self.Binary(
      (a, b) => a.last().compose(b)
    );
    // @alias(`push_{first.alias}`)
    export const push_front = JS.Function.Self.Binary(
      (a, b) => b.compose(a.first())
    );

  }
}

/**
 * Other possibly names: "AbstractDirectionality, ..., ???"
 * @alias
 * @deprecated
 */
export type AbstractDirectionality = Ray;