import JS from "./JS";
import {NotImplementedError} from "./errors/errors";

export namespace Rays {

  export type Constructor = {
    initial: JS.FunctionConstructor<Ray>,
    vertex: JS.FunctionConstructor<Ray>,
    terminal: JS.FunctionConstructor<Ray>,
  }

  /**
   * TODO: Shouldn't classify these?
   * TODO: Incorporate into Ray?
   */
  export enum Type {
    REFERENCE = '(REFERENCE: [  |  ])',
    INITIAL     = '(INITIAL: [  |-?]',
    TERMINAL   = '(TERMINAL: [?-|  ])',
    VERTEX       = '(VERTEX: [--|--])',
  }

  export type Boundary = Type.INITIAL | Type.TERMINAL;

  export const New = (constructor?: Rays.Constructor): Ray => Rays.Instance.New(constructor).proxy;

  /**
   * An uninitialized empty Ray, which caches itself once initialized.
   */
  export const None: JS.FunctionConstructor<Ray> = JS.Function.CachedAfterUse(Rays.New);

  export class Instance {

    static New = (constructor?: Rays.Constructor): Rays.Instance => new Rays.Instance(constructor);

    protected readonly _proxy: Ray;

    /** An arbitrary Ray, defining what continuing in the reverse of this direction is equivalent to. */
    get initial(): Ray { return this._initial.call(this.proxy); } set initial(initial: JS.FunctionConstructor<Ray>) { this._initial = JS.Function.New(initial); } protected _initial: JS.Function<Ray>;
    /** An arbitrary Ray, defining what our current position is equivalent to. */
    get self(): Ray { return this._self.call(this.proxy); } set self(self: JS.FunctionConstructor<Ray>) { this._self = JS.Function.New(self); } protected _self: JS.Function<Ray>;
    /** An arbitrary Ray, defining what continuing in this direction is equivalent to. */
    get terminal(): Ray { return this._terminal.call(this.proxy); } set terminal(terminal: JS.FunctionConstructor<Ray>) { this._terminal = JS.Function.New(terminal); } protected _terminal: JS.Function<Ray>;

    get proxy(): Ray { return this._proxy; }

    protected constructor({ initial, vertex, terminal }: Partial<Rays.Constructor> = {}) {
      this._proxy = new Proxy<Ray>(this as unknown as Ray, Rays.ProxyHandler);
      this._initial = JS.Function.New(initial ?? Rays.None);
      this._self = JS.Function.New(vertex ?? this.proxy);
      this._terminal = JS.Function.New(terminal ?? Rays.None);
    }

    /**
     * Used to jump out of the proxy.
     */
    get ___instance(): Instance { return this; }
  }

  export const ProxyHandler: ProxyHandler<Ray> = {
    get: (self: Instance, property: string | symbol, proxy: Ray): any => {
      /** Use any field defined on {Rays.Instance} first. */
      const field = (self as any)[property];
      if (field) { return field; }

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

  export const Function = <
    TProperty extends keyof typeof Rays.Functions
  >(property: string | symbol): (typeof Rays.Functions)[TProperty] | undefined => Rays.Functions[property as TProperty] ?? undefined;

  export namespace Functions {

    /** [  |-?] */ export const is_initial = JS.Function.Self(
      self => self.is_some() && self.initial.is_none()
    );
    /** [--|--] */ export const is_vertex = JS.Function.Self(
      self => !self.is_initial() && !self.is_terminal()
    );
    /** [?-|  ] */ export const is_terminal = JS.Function.Self(
      self => self.is_some() && self.terminal.is_none()
    );
    /** [  |  ] */ export const is_reference = JS.Function.Self(
      self => self.is_initial() && self.is_terminal()
    );
    /** [?-|  ] or [  |-?] */ export const is_boundary = JS.Function.Self(
      self => !self.is_reference() && (self.is_initial() || self.is_terminal())
    );

    export const type = JS.Function.Self(self => {
      /** [  |  ] */ if (self.is_reference()) return Rays.Type.REFERENCE;
      /** [  |-?] */ if (self.is_initial()) return Rays.Type.INITIAL;
      /** [?-|  ] */ if (self.is_terminal()) return Rays.Type.TERMINAL;
      /** [--|--] */ return Rays.Type.VERTEX;
    });

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
     * See more: https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Quite%20similarly%20to%20the%20loops%2C%20I%20could%20be%20ignorant%20of%20additional%20structure%20by%20assuming%20it%27s%20not%20there.
     */
    export const is_none = JS.Function.Self(
      self => self.is_orbit(self.self)
    );
    export const is_some = JS.Function.Self(
      self => !self.is_none()
    );

    /**
     * Concretely, we use here "whatever the JavaScript engine run on" as the thing which has power over the equivalence assumption we use to halt programs. - The asymmetry which allows the engine to make a distinction between each object.
     *
     * @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=And%20there%20we%20have%20it%2C%20an%20infinity%2C%20loop%2C%20...%2C%20orbit%20if%20we%20ignore%20the%20difference.
     */
    export const is_orbit = JS.Function.Two(
      (a, b) => a.___instance === b.___instance
    );

    export const self_reference = JS.Function.Self(
      self => self
    );
  }
}

type Ray = Rays.Instance & {
  [TKey in keyof typeof Rays.Functions]: typeof Rays.Functions[TKey] extends JS.Function<infer TResult>
    ? JS.Method<TResult>
    : never;
}
export default Ray;

/**
 * Other possibly names: "AbstractDirectionality, ..., ???"
 * @alias
 * @deprecated
 */
export type AbstractDirectionality = Ray;