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

  /** A simplistic compiler for Ray */
  export namespace Compiler { // TODO Ray is Compiler

    /**
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

}

// TODO

export default Ray;