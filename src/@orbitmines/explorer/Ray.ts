import JS from "./JS";
import {NotImplementedError} from "./errors/errors";
import Event = JS.Function.Traversal.Event;

export namespace Rays {

  export type Constructor = {
  //   initial?: JS.FunctionConstructor<Ray>,
  //   self?: JS.FunctionConstructor<Ray>,
  //   terminal?: JS.FunctionConstructor<Ray>,
    proxy?: ProxyHandler<Instance>
  }

  /**
   * TODO: Shouldn't classify these?
   */
  export const Type = JS.Enum.Impl('REFERENCE', 'INITIAL', 'TERMINAL', 'VERTEX');

  // export const Boundary = { INITIAL: Type.INITIAL, TERMINAL: Type.TERMINAL }; TODO: LIST O

  export const New = (constructor?: Rays.Constructor): Ray => Rays.Instance.New(constructor).proxy;

  /**
   * An uninitialized empty Ray, which caches itself once initialized.
   */
  // export const None: JS.FunctionConstructor<Ray> = JS.Function.CachedAfterUse(Rays.New);

  export class Instance {

    static New = (constructor?: Rays.Constructor): Rays.Instance => new Rays.Instance(constructor);

    protected readonly _proxy: Ray;

    // get initial(): Ray { return this._initial.call(this.proxy); } set initial(initial: JS.FunctionConstructor<Ray>) { this._initial = JS.Function.New(initial); } protected _initial: JS.Function<Ray>;
    // get self(): Ray { return this._self.call(this.proxy); } set self(self: JS.FunctionConstructor<Ray>) { this._self = JS.Function.New(self); } protected _self: JS.Function<Ray>;
    // get terminal(): Ray { return this._terminal.call(this.proxy); } set terminal(terminal: JS.FunctionConstructor<Ray>) { this._terminal = JS.Function.New(terminal); } protected _terminal: JS.Function<Ray>;

    get proxy(): Ray { return this._proxy; }

    protected constructor({
                            // initial, self, terminal
      proxy
    }: Rays.Constructor = {}) {
      this._proxy = new Proxy<Instance>(this, proxy ?? Rays.ProxyHandlers.Ray) as unknown as Ray;
      // this._initial = JS.Function.New(initial ?? Rays.None);
      // this._self = JS.Function.New(self ?? this.proxy);
      // this._terminal = JS.Function.New(terminal ?? Rays.None);
    }

    /** Used to jump out of the proxy. */
    get ___instance(): Instance { return this; }
  }

  export namespace ProxyHandlers {

    // TODO AS += through property, anything possible
    export const Ray: ProxyHandler<Instance> = {
      get: (self: Instance, property: string | symbol, proxy: Ray): any => {
        // /** Use any field defined on {Rays.Instance} first. */
        // const field = (self as any)[property];
        if (property === '___instance') { return self.___instance; }

        /** Otherwise, switch to functions defined on {Rays.Functions}  */
        const func = Rays.Function(property);
        if (func) { return func.as_method(self.proxy); }

        /** Not implemented. */
        throw new NotImplementedError(`Called property '${String(property)}' on Ray, which has not been implemented.`);
      },

      apply: (self: Instance, thisArg: any, argArray: any[]): any => {
        throw new NotImplementedError();
      },

      set: (self: Instance, property: string | symbol, newValue: any, proxy: Ray): boolean => {
        throw new NotImplementedError();
      },

      deleteProperty: (self: Instance, property: string | symbol): boolean => {
        throw new NotImplementedError();
      }
    }

    export const FunctionTraversal = (
      { callback }: { callback: JS.Function.Traversal.Callback }
    ): ProxyHandler<Instance> => ({
      get: (self: Instance, property: string | symbol, proxy: Ray): any => {
        // /** Use any field defined on {Rays.Instance} first. */
        // const field = (self as any)[property];
        if (property === '___instance') { return self.___instance; }

        /** Otherwise, switch to functions defined on {Rays.Functions}  */
        const func = Rays.Function(property);
        if (func) { return func.traverse(proxy, { name: property, callback }); }

        /** Not implemented. */
        throw new NotImplementedError(`Called property '${String(property)}' on Ray, which has not been implemented.`);
      },

      apply: (self: Instance, thisArg: any, argArray: any[]): any => {
        throw new NotImplementedError();
      },

      set: (self: Instance, property: string | symbol, newValue: any, proxy: Ray): boolean => {
        throw new NotImplementedError();
      },

      deleteProperty: (self: Instance, property: string | symbol): boolean => {
        throw new NotImplementedError();
      }
    });

  }

  export const Function = <TProperty extends keyof typeof Rays.Functions>(
    property: string | symbol
  ): (typeof Rays.Functions)[TProperty] | undefined => Rays.Functions[property as TProperty] ?? undefined;

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
    export const is_orbit = JS.Function.Self.Two(
      (a, b) => a.___instance === b.___instance
    );

    export const self_reference = JS.Function.Self.Impl(
      self => self
    );

    /** An arbitrary Ray, defining what continuing in this direction is equivalent to. */
    export const terminal = JS.Function.Self.Impl(
      self => self.___instance.terminal // TODO .as_reference? Basically, Ray.directions
    );
    /** An arbitrary Ray, defining what continuing in the reverse of this direction is equivalent to. */
    export const initial = JS.Function.Self.Impl(
      self => self.___instance.initial // TODO .as_reference?
    );
    /**
     * An arbitrary Ray, defining what our current position is equivalent to.
     *
     * Moving to the intersecting Ray at `.self` - as a way of going an abstraction layer (lower), and asking what's inside.
     */
    // @alias('dereference', 'self')
    export const dereference = JS.Function.Self.Impl(
      self => self.___instance.self // TODO .as_reference?
    );
    export const self = dereference;

    /**
     * Moving `self` to `.self` on an abstraction layer (higher). As a way of being able to describe `self`.
     */
    export const reference = JS.Function.Self.Impl(
      self => Rays.New({ self: self })
    );

    /**
     * @see "Continuations as Equivalence (can often be done in parallel - not generally)": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Continuations%20%2D%20Continuations%20as%20Equivalence
     */
    // @alias('merge, 'continues_with', 'compose')
    export const compose = JS.Function.Self.Two(
      (a, b) => a.terminal().equivalent(b.initial())
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
    export const equivalent = JS.Function.Self.Two(
      (a, b) => {
      // throw new NotImplementedError();

      // TODO: This is close but not quite, use the shifting thing I wrote down a few days ago: (And then use something to break the self-reference) - Either on this side. compose, or outside the definitions
        // This one harder to do in parallel?
      return a.self().compose(b.self());
    });

    export const is_equivalent = JS.Function.Self.Two(
      (a, b) => {
        // TODO: = COMPOSE
      throw new NotImplementedError();
      return true;
    });

    export const next = JS.Function.Self.Impl((self) => {
      throw new NotImplementedError();
      return self;
    });
    export const has_next = JS.Function.Self.Impl((self) => {
      throw new NotImplementedError();
      return true;
    });
    // @alias('end', 'result', 'back', 'output')
    export const last = JS.Function.Self.Impl((self) => {
      throw new NotImplementedError();
      return self;
    });
    export const first = JS.Function.Self.Impl((self) => {
      throw new NotImplementedError();
      return self;
    });

    // @alias('not', 'reverse', 'swap', 'converse')
    export const not = JS.Function.Self.Impl((self) => {
      throw new NotImplementedError();
      return self;
    });
    export const and = JS.Function.Self.Two((a, b) => {
      throw new NotImplementedError();
      return self;
    });
    export const or = JS.Function.Self.Two((a, b) => {
      throw new NotImplementedError();
      return self;
    });
    export const xor = JS.Function.Self.Two((a, b) => {
      throw new NotImplementedError();
      return self;
    });
    export const nand = JS.Function.Self.Two((a, b) => a.and(b).not());
    export const nor = JS.Function.Self.Two((a, b) => a.or(b).not());


    // @alias(`push_{last.alias}`)
    export const push_back = JS.Function.Self.Two(
      (a, b) => a.last().compose(b)
    );
    // @alias(`push_{first.alias}`)
    export const push_front = JS.Function.Self.Two(
      (a, b) => b.compose(a.first())
    );

  }
}

type Ray = Pick<Rays.Instance, '___instance'> & {
  [TKey in keyof typeof Rays.Functions]: typeof Rays.Functions[TKey] extends JS.Function.Instance
    ? JS.Method
    : never;
}
export default Ray;

/**
 * Other possibly names: "AbstractDirectionality, ..., ???"
 * @alias
 * @deprecated
 */
export type AbstractDirectionality = Ray;