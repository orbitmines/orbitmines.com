import {enumeration, MemberType, none, TaggedUnion} from "../../@orbitmines/js/utils/match";
import {Option} from "../js/utils/Option";
import _ from "lodash";
import {compile} from "sass";

export type ParameterlessFunction<T = any> = () => T;

/**
 * Defines some flexibility to ignore a lot of the JavaScript specifics (we're not trying to model JavaScript here).
 */
export type ArbitraryObj<T> = {
  Ref: (ref: Option<T>) => typeof ref,
  Fn: (fn: ParameterlessFunction<Option<T>>) => typeof fn,
};
export type ArbitraryImpl<T> = {
  none_or: <Result>(or: (obj: T) => Result) => Arbitrary<Result>,
  resolve: () => Option<T>,
}
export type Arbitrary<T> = MemberType<TaggedUnion<ArbitraryObj<T>, ArbitraryImpl<T>>>;

export const Arbitrary = enumeration<ArbitraryObj<any>, ArbitraryImpl<any>>({
  Ref: (ref: Option<any>) => ref,
  Fn: (fn: ParameterlessFunction<Option<any>>) => fn,
}, self => class {
  resolve = (): any => self.match({
    Ref: (ref) => ref,
    Fn: (fn) => fn(),
  })

  none_or = (or: (obj: any) => any): Arbitrary<any> => self.resolve().match({
    Some: (obj) => or(obj),
    None: () => Arbitrary.Ref(Option.None)
  })
});

/**
 * Replace "Ray" for "AbstractDirectionality" in case "Ray" doesn't suit you.
 */
export interface AbstractDirectionality<T> {
  initial(): T
  vertex(): T
  terminal(): T
}

// SHOULDNT CLASSIFY THESE?
export enum RayType {
  REFERENCE = '  |  ',
  INITIAL = '  |--',
  TERMINAL = '--|  ',
  VERTEX = '--|--',
}

/**
 * JavaScript wrapper for a mutable value. It is important to realize that this is merely some simple JavaScript abstraction, and anything is assumed to be inherently mutable.
 *
 * All the methods defined here should be considered deprecated, are there to help with JavaScript implementation only.
 *
 * TODO:
 * - Homotopy equivalence merely as some direction/reversibility constraint on some direction, ignoring additional structure (or incorporating it into the equiv) at the vertices. (Could be loosened where certain vertex-equivalences are also part of the homotopy)
 * - Induced ignorance/equivalence along arbitrary rays.
 */
export class Ray implements AsyncIterable<Ray> {

  js: () => Option<any>;

  // TODO: Could make a case that setting the terminal is more of a map, defaulting/first checking the terminal before additional functionality is mapped over that.
  initial: () => Option<Ray>;
  vertex: () => Option<Ray>;
  terminal: () => Option<Ray>;

  constructor({
    initial,
    vertex,
    terminal,
    js,
  }: { js?: () => Option<any> } & Partial<AbstractDirectionality<Option<Ray>>> = {}) {
    this.initial = initial ?? (() => Option.None);
    this.vertex = vertex ?? (() => Option.None);
    this.terminal = terminal ?? (() => Option.None);
    this.js = js ?? (() => Option.None);
  }

  continues_with = (continuation: () => Option<Ray>) => {
    if (this.vertex().is_none())
      return;

    // if (this.is_initial())
    //   throw 'Not Implemented: Ambiguity in equivalencing to an Initial.' // This one's a little ambigious what to do; probably better to leave it out of the initial setup.

    if (!this.is_terminal()) {
      this.vertex().force().terminal().force().continues_with(continuation);
      return;
    }

    /**
     * [--|  ]
     *
     * So this could be
     * [--|  ]    [--|  ]    [--|  ]
     * [  |--]    [--|--]    [--|  ]
     *    ^This being the thing deemed as an actual continuation.
     */
    this.vertex().force().terminal = (): Option<Ray> => {
      const reference = continuation();
      if (reference.is_none())
        return Option.None;

      if (reference.force().is_initial()) {
        /**
         * [--|  ]
         * [  |--]
         */
        return reference.force().vertex();
      }

      if (reference.force().is_terminal()) {
        /**
         * [--|  ]
         * [--|  ]
         */

        // No continuation, but just equivalence them anyway. (ambiguity here, could also not do that)
        return reference.force().vertex();
      }

      if (reference.force().is_reference()) {
        /**
         * [--|  ]
         * [  |  ]
         */
        const next = reference.force().vertex().force();
        next.initial = () => this.vertex();

        return next.as_reference().as_option();
      }

      /**
       * [--|  ]
       * [--|--]
       *
       * Again some ambiguity here, just for now ignore
       */
      throw 'Not Implemented: Ambiguity in equivalencing a Terminal and Vertex.'
    };
  }

  // push_back = (vertex: Option<Ray>): Option<Ray> => {
  //
  // }

  /**
   * Returns a reference to a Ray to the first vertex found in the directionality which this Ray defines (as a reference).
   * Note: Returns [  |--] in case of arbitrarily many possible first values - simply call `.traverse` on the reference to traverse possibilities.
   */
  next = (): Option<Ray> => JS.Iterable(this.traverse({ steps: 1 })).as_ray();

  previous = (): Option<Ray> => JS.Iterable(this.traverse({ steps: 1, direction: { reverse: true } })).as_ray();

  *traverse(options: {
    steps?: number

    // filter?: (ray: Ray) => boolean,
    direction?: MapOptions,
  } = {}): Generator<Ray> {
    if (options.steps !== undefined && options.steps === 0) { // TODO: Could also base 'reverse' on a negative number of steps.
      // TODO: Abstractly, one would sometimes yield the current vertex; in the sense of "doing nothing" being someway "the identity". - Important to consider how this 'doing nothing' is inconsistent - and this functionality should be expanded upon later.
      // console.log('no step - no continuation');
      return;
    }

    // TODO Does not by default check for equivalences in the from of "deduplication" - this means without checking this traversal will not halt in circular. - Though circular should also be allowed at some configurable clockcycle/interval - whether some native speed, or a slower one..

    const mapped = this.map(options.direction);

    if (mapped.is_none()) {
      // console.log('Empty reference')
      return;
    }

    const ray = mapped.force();

    // Nothing to traverse.
    if (ray.is_empty()) {
      // console.log('Nothing to traverse')
      return;
    }

    const vertex = ray.vertex().force();

    /**
     * [--|--]
     * [--|  ]
     * [  |--]
     */

    if (vertex.js().is_some()) {
      // console.log('found js value:', vertex.js())
    }

    if (ray.is_terminal()) {
      /**
       * [--|  ]
       *
       * We're basically finding initial matches for our terminal ray at its vertex:
       *
       * [--|  ]
       * Along the '|' -> Find others which match [  |--], wherever they are arbitrarily defined along that 'equivalence frame/ray'.
       *
       *
       *  Up and down the terminal vertex (could be arbitrarily defined, scanning for continuations
       *
       *      |
       *    --|--     (<- Some vertex on our terminal vertex which defines some reference/additional structure,
       *      |           possibly some more continuations hidden in there) ; TODO: This one needs some better defining
       *      |--     (<- A continuation we're looking for)
       *    --|       (<- Our terminal vertex)
       *      |
       *      |--     (<- A continuation we're looking for)
       *      |
       */

      // console.log(this.type(), 'Traversing continuations (both initial&terminal)')
      for (let reference of vertex.traverse({...options, direction: { reverse: false }})) {
        // [  |--]
        if (reference.is_initial())
          yield *reference.traverse(options);
      }
      for (let reference of vertex.traverse({...options, direction: { reverse: true } })) {
        // [  |--]
        if (reference.is_initial())
          yield *reference.traverse(options);
      }
      
      return;
    }

    if (!this.is_initial()) {
      // [--|--]

      yield vertex.as_reference(); // TODO: Should yield at which step it was found (or only yield through groups ..., depending on one's traversal strategy)
      // console.log(this.type(), 'yielded vertex')

      if (options.steps !== undefined) {
        // Found one in this directionality, remove a step for further traversals.
        options.steps -= 1;
      }
    } else {
      // [  |--]
    }

    const terminal = vertex.terminal(); // TODO, LAST TERMINAL MIGHT BE EMPTY OIN CURRENT SETUP

    /**
     * [--|--]
     * [--|  ]
     * [  |--] (- so this one would be negated/impossible if we're assuming consistency)
     *
     * We're moving to the terminal side, which from this perspective means the actual vertex we're interested in.
     *
     * Just loop from back up.
     */
    if (terminal.is_some()) {
      const reference = terminal.force().as_reference();
      // console.log(this.type(), '->', reference.type(), 'moving to terminal as vertex')

      // We could conceptualize that whatever this ray is, is connected to the higher-level reference one. - Basically the path we're taking - assuming that our vertices are ignorant of our traversal.
      // TODO: Could also do a while loop here, and just yield it.
      yield* reference.traverse({...options});
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<Ray> { yield *this.traverse(); }

  is_initial = (): boolean => this.vertex().match({
    Some: (vertex) => vertex.initial().is_none(),
    None: () => false
  });
  is_vertex = (): boolean => !this.is_initial() && !this.is_terminal();
  is_terminal = (): boolean => this.vertex().match({
    Some: (vertex) => vertex.terminal().is_none(),
    None: () => false
  });

  is_reference = (): boolean => this.is_initial() && this.is_terminal();

  is_empty = (): boolean => this.vertex().is_none();

  as_reference = (): Ray => new Ray({ vertex: () => Option.Some(this) }) // A ray whose vertex references this Ray (ignorantly).

  as_option = (): Option<Ray> => Option.Some(this);

  // as_iterable
  // as_async_generator
  // ...

  // TODO NEEDS TO CHECK IF THERE'S SOME INITIAL DEFIEND ; for defining if it has halted

  type = (): RayType => {
    if (this.is_reference())
      return RayType.REFERENCE;
    if (this.is_initial())
      return RayType.INITIAL;
    if (this.is_terminal())
      return RayType.TERMINAL;

    return RayType.VERTEX;
  }

  as_array = (): any[] => [...this.traverse()];

  toString = (): string => {
    return this.as_array().toString()
  }

  map = (direction?: MapOptions): Option<Ray> => {
    if (direction === undefined)
      return this.as_option();

    // TODO: Any of these options could eventually be encoded at the vertices

    if (is_function(direction))
      return direction(this.as_option());

    if (this.vertex().is_none())
      return Option.None;

    const originalDirection = this.vertex().force();

    if (is_object(direction)) {
      const { reverse } = direction;

      if (reverse)
        return new Ray({ initial: originalDirection.terminal, vertex: originalDirection.vertex, terminal: originalDirection.initial }).as_reference().as_option();
    }

    return this.as_option();
  };

  // TODO: Important to easily allow compilation for everything (also I suppose the 2D/3D explorative frames --..
  // TODO: This is just dumb compilation for now, this should be much smarter - spotting infinities, parallel, much more that could be done here
  compile = <
    Vertex,
    Directionality = Vertex, // Though abstractly we're using a construction where we don't differentiate between a Vertex and its Directionality, it's possible to do so, so allow for that construction.
  >(options: {
    directionality: {
      new: () => Directionality,
      push_back: (directionality: Directionality, ray: Option<Vertex>) => void,
      // push_front: (directionality: Directionality, ray: Option<Vertex>) => void,
      current?: Directionality
    },
    get: (vertex: Option<Ray>) => Option<Vertex>,
    convert: (ray: Option<Ray>) => Option<Vertex>,
    direction?: MapOptions,
  }): void => {
    // TODO: Traversal is always a compilation?? (where traversal only 'compiles' the vertices to other vertices)

    // if (options.steps !== undefined && options.steps === 0) { // TODO: Could also base 'reverse' on a negative number of steps.
    //   // TODO: Abstractly, one would sometimes yield the current vertex; in the sense of "doing nothing" being someway "the identity". - Important to consider how this 'doing nothing' is inconsistent - and this functionality should be expanded upon later.
    //   // console.log('no step - no continuation');
    //   return;
    // }

    // TODO Does not by default check for equivalences in the from of "deduplication" - this means without checking this traversal will not halt in circular. - Though circular should also be allowed at some configurable clockcycle/interval - whether some native speed, or a slower one..

    const mapped = this.map(options.direction);

    if (mapped.is_none()) {
      // console.log('Empty reference')
      return;
    }

    const ray = mapped.force();

    // Nothing to traverse.
    if (ray.is_empty()) {
      // console.log('Nothing to traverse')
      return;
    }

    /**
     * [--|--]
     * [--|  ]
     * [  |--]
     */
    const vertex = ray.vertex().force();
    const exists = options.get(vertex.as_reference().as_option()).is_some();

    options.directionality.current ??= options.directionality.new();
    options.directionality.push_back(options.directionality.current, options.convert(vertex.as_reference().as_option()));

    if (!exists) {
      const reference = vertex.vertex();
      if (reference.is_some() && reference.force().vertex().is_some()) {
        const dereferenced = reference.force().vertex().force();

        const vertexDirectionality = options.directionality.new();
        options.directionality.push_back(vertexDirectionality, options.convert(vertex.as_reference().as_option()));

        dereferenced.as_reference().compile({
          ...options,
          directionality: {...options.directionality, current: vertexDirectionality},
          direction: {reverse: false},
        });
        // dereferenced.as_reference().compile({
        //   ...options,
        //   directionality: {...options.directionality, current: vertexDirectionality},
        //   direction: {reverse: true},
        // });
      }
    }

    if (ray.is_terminal()) {
      /**
       * [--|  ]
       *
       * We're basically finding initial matches for our terminal ray at its vertex:
       *
       * [--|  ]
       * Along the '|' -> Find others which match [  |--], wherever they are arbitrarily defined along that 'equivalence frame/ray'.
       *
       *
       *  Up and down the terminal vertex (could be arbitrarily defined, scanning for continuations
       *
       *      |
       *    --|--     (<- Some vertex on our terminal vertex which defines some reference/additional structure,
       *      |           possibly some more continuations hidden in there) ; TODO: This one needs some better defining
       *      |--     (<- A continuation we're looking for)
       *    --|       (<- Our terminal vertex)
       *      |
       *      |--     (<- A continuation we're looking for)
       *      |
       */

      // console.log(this.type(), 'Traversing continuations (both initial&terminal)')

      return;
    }

    if (!this.is_initial()) {
      // [--|--]

      // TODO: Should yield at which step it was found (or only yield through groups ..., depending on one's traversal strategy)
      // console.log(this.type(), 'yielded vertex')

      // if (options.steps !== undefined) {
      //   // Found one in this directionality, remove a step for further traversals.
      //   options.steps -= 1;
      // }
    } else {
      // [  |--]

    }

    const terminal = vertex.terminal(); // TODO, LAST TERMINAL MIGHT BE EMPTY OIN CURRENT SETUP

    /**
     * [--|--]
     * [--|  ]
     * [  |--] (- so this one would be negated/impossible if we're assuming consistency)
     *
     * We're moving to the terminal side, which from this perspective means the actual vertex we're interested in.
     *
     * Just loop from back up.
     */
    if (terminal.is_some()) {
      const reference = terminal.force().as_reference();
      // console.log(this.type(), '->', reference.type(), 'moving to terminal as vertex')

      // We could conceptualize that whatever this ray is, is connected to the higher-level reference one. - Basically the path we're taking - assuming that our vertices are ignorant of our traversal.
      // TODO: Could also do a while loop here, and just yield it.
      reference.compile({...options});
    }

    return;


    // const ray = options.directionality.new();
    // for (let reference of this.traverse()) {
    //   const vertexRay = options.directionality.new();
    //
    //   let existing = options.get(reference.as_option());
    //   options.directionality.push_back(ray,
    //     existing.is_some() ? existing : options.convert(reference.as_option()));
    //
    //   const { initial, terminal } = reference.vertex().force();
    //
    //   // if (initial().is_some() )
    //   //   options.directionality.push_back(vertexRay, options.convert(initial().force().as_reference().as_option()));
    //   options.directionality.push_back(vertexRay, options.get(reference.as_option()));
    //   // if (terminal().is_some())
    //   //   options.directionality.push_back(vertexRay, options.convert(terminal().force().as_reference().as_option()));
    //
    //   if (existing.is_none()) {
    //     const dereferenced = reference.vertex();
    //     const additionalStructureReference = dereferenced.force().vertex();
    //
    //     if (additionalStructureReference.is_some())
    //       additionalStructureReference.force().compile(options)
    //   }
    // }
    //
    // return Option.None;





    // if (this.vertex().is_none())
    //   return Option.None;

    // const vertex = this.vertex().force();
    //
    // const ray = options.directionality.new();
    //
    // const converted = options.get(this.as_option());
    // if (converted.is_some())
    //   return converted;


    // if (!this.is_initial()) {
    //   options.directionality.push_back(ray, vertex.initial().force().as_reference().compile(options));
    // }
    //
    // if (vertex.vertex().is_some())
    //   options.directionality.push_back(ray, vertex.vertex().force().as_reference().compile(options));
    //
    // if (!this.is_terminal()) {
    //   options.directionality.push_back(ray, vertex.terminal().force().as_reference().compile(options));
    // }
    //
    //
    // return options.convert(this.as_option());
  }
}

export type MapOptions = ((direction: Option<Ray>) => Option<Ray>)
  | {
  /**
   * This could be set from within some place which is navigating here? ; Basically just "the reversal of arrows" as referred to in some mathematics - assuming consistency (which is likely garanteed to not generally hold - certainly not in this implementation - which is to say that previous().next() is never actually garanteed to return "the same result" - and if one has some construction like a type that necessarily means it's an assumption: what am I doing to prevent violations of that assumption?).
   */
  reverse?: boolean
}



  // traverse = (options: {
  //   steps?: number,
  //   // filter
  //   //
  //   direction: Option<Ray> // TODO: That I'm using this here perhaps indicates I need to switch up the Ray/Option<Ray> setup a bit. - perhaps that *this* as ray, necessarily already is the direction?
  // }): Option<Ray> => {
  //   const { steps, direction } = options;
  //
  //   // previous: Assuming we can reverse the direction. - this is a bit complicated and needs to be phrased properly, but for now just assume we can.
  //
  //   // TODO, RESTRUCTURE: This shows that this method would be defined at "Option<Ray>"
  //   return direction.none_or((Option<Ray>) => Option<Ray>.match({
  //       // opposite of terminal one
  //       Initial: (ray) => {},
  //
  //       Vertex: (ray) => { throw '' },
  //         // ray.vertex.resolve().none_or(vertex => vertex.match({
  //         //   Initial: () => {},
  //         //   Vertex: () => {}, // same
  //         //   Terminal: () => {},
  //         // })),
  //
  //       Terminal: (ray) =>
  //     }),
  //   );
  // }

  // TODO: What's the best name for traversing the structure of the vertex ? - Superposition/context/definition/structure/value/node/.. ; basically different directionalities which define what this thing means>?
  // next = (options: {
  //   steps?: number,
  // }): Option<Ray> => this.traverse({...options, direction: this.vertex_ref() });

  // loop = (next: (current: Option<Ray>) => Option<Ray>) => {
  //   let current: Option<Ray> = this.vertex_ref();
  //
  //   let _next: Option<Ray>;
  //   while ((_next = next(current)).resolve().is_some()) {
  //     _next.resolve().force().match({
  //       Initial: (ray) => ray,
  //       Vertex: (ray) => ray,
  //       Terminal: (ray) => ray,
  //     })
  //     current = _next;
  //   }
  //
  //   return current;
  // }

/**
 *
 * Important to remember this is just one particular structure to which it can be mapped, there are probably many (infinitely?) others.
 *
 * Not to be considered as a perfect mapping of JavaScript functionality - merely a practical one.
 */
export type JSObj<Target = Option<Ray>> = {
  Iterable: <T>(iterable: Iterable<T>) => typeof iterable,
  Iterator: <T>(iterator: Iterator<T>) => typeof iterator,
  Boolean: (boolean: boolean) => typeof boolean,
  // // AsyncGenerator
  // // ..
  // Number: (number: number) => typeof number,
  // Function: (func: ParameterlessFunction) => typeof func,
  Object: (object: object) => typeof object,
  Any: (any: any) => typeof any,
  None: typeof none;
}
export type JSImpl<Target = Option<Ray>> = {
  as_ray: () => Target,
}
export type JS<Target = Option<Ray>> = MemberType<TaggedUnion<JSObj<Target>, JSImpl<Target>>>;

export const JS = enumeration<JSObj, JSImpl>({
  Iterable: <T>(iterable: Iterable<T>) => iterable,
  Iterator: <T>(iterator: Iterator<T>) => iterator,
  Boolean: (boolean: boolean) => boolean,
  // Number: (number: number) => number,
  // Function: (func: ParameterlessFunction) => func,
  Object: (object: object) => object,
  Any: (any: any) => any,
  None: none,
}, self => class {
  as_ray = (): Option<Ray> => self.match({
    Iterable: <T>(iterable: Iterable<T>): Option<Ray> => from_iterable(iterable),
    Iterator: <T>(iterator: Iterator<T>): Option<Ray> => from_iterator(iterator),
    Boolean: (boolean: boolean): Option<Ray> => from_boolean(boolean),
    // Number: (number: number): Option<Ray> => from_number(number),
    // Function: (func: ParameterlessFunction): Option<Ray> => from_function(func),
    Object: (object: object): Option<Ray> => from_object(object),
    Any: (any: any): Option<Ray> => Option.Some(new Ray({ js: () => Option.Some(any) })),
    None: (): Option<Ray> => Option.None
  })
});

/**
 *
 */

export const from_any = (any: any): JS => {
  if (any === null || any === undefined)
    return JS.Any(any);

  if (is_boolean(any))
    return JS.Boolean(any);
  // if (is_number(any))
  //   return JS.Number(any);
  if (is_iterable(any))// || is_array(any))
    return JS.Iterable(any);
  // if (is_function(any))
  //   return JS.Function(any);
  if (is_object(any))
    return JS.Object(any);

  return JS.Any(any);
}

export const from_iterable = <T = any>(iterable: Iterable<T>): Option<Ray> => from_iterator(iterable[Symbol.iterator]());
export const from_iterator = <T = any>(iterator: Iterator<T>): Option<Ray> => {
  // [  |--]

  const next = (initial: Option<Ray>): Option<Ray> => {
    const iterator_result = iterator.next();
    const is_terminal = iterator_result.done === true;

    if (is_terminal) {
      // We're done, this is the end of the iterator
      return Option.Some(new Ray({
        initial: () => initial
        // vertex: could have something at the vertex which defines the "end of the iterator" - but we don't here.
      }));
    }

    const current: Option<Ray> = Option.Some(new Ray({
      js: () => Option.Some(iterator_result.value),
      initial: () => initial,
      vertex: () => from_any(iterator_result.value).as_ray(),
      terminal: () => next(current)
    }));

    if (initial.is_some())
      initial.force().terminal = () => current;

    return current;
  }

  const ray_iterator = new Ray({ js: () => Option.Some(iterator)});
  ray_iterator.terminal = () => next(Option.Some(ray_iterator));

  // This indicates we're passing a reference, since traversal logic will be defined at its vertex - what it's defining.
  return ray_iterator.as_reference().as_option();
}
export const from_generator = <T = any>(generator: Generator<T>): Option<Ray> => {
  // [  |--]
  return from_iterable(generator);
}

export const empty = (): Option<Ray> => Option.Some(new Ray({ }));

// export const length = (of: number, value: any = undefined): Option<Ray> => {
//   return from_iterable(Array(of).fill(value));
// }
// export const at = (index: number, of: number, value: any = undefined): Arbitrary<Ray<any>> => {
//   return Arbitrary.Fn(() => length(of, value).resolve().force().at_terminal(index));
// }
//
export const from_boolean = (boolean: boolean): Option<Ray> => {
  // |-false->-true-| (could of course also be reversed)

  // from_iterable([false, true])

  const _false = new Ray({ initial: empty, js: () => Option.Some(false) });
  const _true  = new Ray({ terminal: empty, js: () => Option.Some(true) });
  _false.terminal = () => _true.as_option();
  _true.initial = () => _false.as_option();

  return (boolean ? _true : _false).as_reference().as_option();
}


// // Full permutation
// export const SuperPosition = (ray: Ray<any>) => {
//
// }
//
//
// export const permutation = (permutation: number | undefined, of: number): Arbitrary<Ray<any>> => at(
//   // In the case of a bit: 2nd value for '1' (but could be the reverse, if our interpreter does this)
//   permutation ?? 0,
//   // In the case of a bit: Either |-*-| if no bit or |-*->-*-| if a bit.
//   permutation === undefined ? 1 : of
// )
//
// export const bit = (bit?: boolean): Arbitrary<Ray<any>> => permutation(bit ? 1 : 0, 2);
// export const hexadecimal = (hexadecimal?: string): Arbitrary<Ray<any>> => permutation(hexadecimal ? parseInt(hexadecimal, 16) : undefined, 16);


// export const from_number = (number: number): Option<Ray> => {
//
// }
// export const from_function = (func: ParameterlessFunction): Option<Ray> => {
//
// }
export const from_object = (object: object): Option<Ray> => {

  return Option.None;
}
//
// export const from_async_generator = <T>(generator: AsyncGenerator<T>): Option<Ray> => {}
// export const from_generator = <T>(generator: Generator<T>): Option<Ray> => {}

export const is_boolean = (_object: any): _object is boolean => _.isBoolean(_object);
export const is_number = (_object: any): _object is number => _.isNumber(_object);
export const is_object = (_object: any): _object is object => _.isObject(_object);
export const is_iterable = <T = any>(_object: any): _object is Iterable<T> => Symbol.iterator in Object(_object);
export const is_async_iterable = <T = any>(_object: any): _object is AsyncIterable<T> => Symbol.asyncIterator in Object(_object);
export const is_array = <T = any>(_object: any): _object is T[] => _.isArray(_object);
export const is_async = (_object: any) => _.has(_object, 'then') && is_function(_.get(_object, 'then')); // TODO, Just an ugly check

export const is_error = (_object: any): _object is Error => _.isError(_object);
export const is_function = (_object: any): _object is ((...args: any[]) => any) => _.isFunction(_object);
