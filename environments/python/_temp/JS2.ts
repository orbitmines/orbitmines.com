//
//
//
//     /**
//      * Puts the Ray this is called with on a new Ray [initial = ref, ???, ???]. Then it places any structure it's applying a method to, on the terminal of this new Ray [initial = ref, ???, terminal = any]
//      */
//     static Ref = (impl: Ray.FunctionImpl<Ray.Any>): Function => {
//       return new Function(impl); // TODO: THIS SHOULD CHANGE, TO ON VERTEX.
//     }
//     static Impl = <T = Ray>(impl: (initial: T, terminal: T) => T): Function<T> => {
//       return Function.Ref((ref: T) => impl(ref.initial, ref.terminal));
//     }
//     // static IgnorantOfInitial = <T extends AbstractDirectionality<T> = Ray>(impl: (terminal: T) => T): Function<T> => Function.Impl((_, terminal) => impl(terminal));
//     // static IgnorantOfTerminal = <T extends AbstractDirectionality<T> = Ray>(impl: (initial: T) => T): Function<T> => Function.Impl((initial, _) => impl(initial));
//     // static Ignorant = <T extends AbstractDirectionality<T> = Ray>(impl: ParameterlessFunction<T>): Function<T> => Function.Impl(impl);
//
//     /**
//      * TODO: Reversible through memory...
//      */
//     static WithMemory = <T = Ray>(
//       apply: (previous: Ray.Any) => Ray.Any | any
//     ): Function<T> => {
//       // return Function.Ref((ref: T) => impl(ref.initial, ref.terminal));
//
//       return {
//         as_ray: (ref: Ray.Any = Ray.None()) => {
//           const next = (previous: Ray.Any, first: boolean = false): Ray.Any => {
//             const result = apply(previous);
//             const is_terminal = result instanceof Ray ?
//               result.is_none() || (result.is_terminal() && result.self.is_none())
//               : false;
//
//             // Clear the terminal function attached to the Iterator.
//             // TODO: In case of 'is_terminal = true': Could also leave this be, in case JavaScript allows for adding stuff to the iterator even after .done === true;
//             previous.self.terminal = previous.self.___empty_terminal();
//
//             if (is_terminal) {
//               // We're done, this is the end of the iterator
//
//               return Ray.None();
//             }
//
//             const current = Ray
//               .vertex(() => result instanceof Ray ? result.self : JS.Any(result)) // TODO test
//               .o(result instanceof Ray ? {} : { js: result })
//               .as_reference();
//
//             // Move the iterator to the terminal.
//             current.self.terminal = () => next(current);
//
//             if (first) {
//               // Move the iterator's terminal to current.
//               previous.self.terminal = () => current.self;
//
//               current.self.initial = () => previous.self;
//
//               return current; // Answer to INITIAL.terminal is a VERTEX.
//             }
//
//             // // TODO: This is just compose, but without .type checks.. ; FIX ON COMPOSE END for is_reference etc..
//             // if (previous.follow().type !== RayType.TERMINAL)
//             //   throw new PreventsImplementationBug();
//             // if (current.follow(Ray.directions.previous).type !== RayType.INITIAL)
//             //   throw new PreventsImplementationBug();
//             //
//             // previous.follow().equivalent(current.follow(Ray.directions.previous));
//             previous.compose(current);
//
//             return current.self.initial; // Answer to VERTEX.terminal is an INITIAL.
//           }
//
//           if (ref.is_none()) {
//             const ray: Ray.Any = new Ray({
//               vertex: Ray.Any.None,
//               terminal: () => next(ray, true),
//             }).as_reference();
//
//             return ray;
//           } else {
//             const initial_vertex = Ray.vertex(() => ref.self).as_reference();
//
//             initial_vertex.self.terminal = () => next(initial_vertex);
//
//             return initial_vertex;
//           }
//         }
//       } as Function<T>;
//     }
//
//
//     /**
//      * Constructs a class method accepting arbitrary structure.
//      *
//      * a.compose(b).compose(c) = [a, b, c].compose = abc.compose = [[a1, a2], b, c].compose = [[a1, a2], b, [c1, c2]].compose = [[a1, [[[a2]]], [[[[]]], []]], b, [[[]], [], [c]]].compose = ...
//      */
//     as_method = <TResult>(ref: Ray.Any): Method<Ray, TResult> => ((...any: Recursive<Ray.Any>): TResult => {
//       if (any === undefined || any.length === 0)
//         return this.step(ref);
//
//       // TODO: This can be much better...
//       const first = (recursive?: Recursive<T>): T | undefined => {
//         if (recursive === undefined) return;
//         // if (_.isObject(recursive)) return recursive as unknown as Ray;
//
//         for (let r of recursive) {
//           if (r === undefined) continue;
//           if (_.isObject(r)) return r as unknown as T;
//
//           // if (r instanceof Ray)
//           //   throw new PreventsImplementationBug();
//
//           // @ts-ignore
//           const _first = first(r);
//           if (_first)
//             return _first;
//         }
//       }
//
//       const _first = first(any);
//
//       if (_first === undefined)
//         return this.step(ref);
//
//       const pointer = (new Ray({
//         // @ts-ignore
//         initial: () => ref,
//         // @ts-ignore
//         terminal: () => _first
//       })) as unknown as T;
//
//       return this.step(pointer);
//
//       // TODO: ANY CASE
//       // if (any.length === 1) {
//       // }
//     })
//
//   }
//
//
//
//   export const Iterator = <T = any>(iterator: Iterator<T>): Ray.Any => {
//     // [  |--]
//
//     return Ray.Function.WithMemory(previous => {
//       const iterator_result = iterator.next();
//
//       return iterator_result.done !== true ? iterator_result.value : Ray.Any.None();
//     }).as_ray();
//   }
//
