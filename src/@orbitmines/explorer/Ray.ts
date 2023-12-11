import {enumeration, MemberType, none, TaggedUnion} from "../../@orbitmines/js/utils/match";
import {Option} from "../js/utils/Option";
import _ from "lodash";
import {compile} from "sass";

export type ParameterlessFunction<T = any> = () => T;

// /**
//  * Defines some flexibility to ignore a lot of the JavaScript specifics (we're not trying to model JavaScript here).
//  */
// export type ArbitraryObj<T> = {
//   Ref: (ref: Option<T>) => typeof ref,
//   Fn: (fn: ParameterlessFunction<Option<T>>) => typeof fn,
// };
// export type ArbitraryImpl<T> = {
//   none_or: <Result>(or: (obj: T) => Result) => Arbitrary<Result>,
//   resolve: () => Option<T>,
// }
// export type Arbitrary<T> = MemberType<TaggedUnion<ArbitraryObj<T>, ArbitraryImpl<T>>>;
//
// export const Arbitrary = enumeration<ArbitraryObj<any>, ArbitraryImpl<any>>({
//   Ref: (ref: Option<any>) => ref,
//   Fn: (fn: ParameterlessFunction<Option<any>>) => fn,
// }, self => class {
//   resolve = (): any => self.match({
//     Ref: (ref) => ref,
//     Fn: (fn) => fn(),
//   })
//
//   none_or = (or: (obj: any) => any): Arbitrary<any> => self.resolve().match({
//     Some: (obj) => or(obj),
//     None: () => Arbitrary.Ref(Option.None)
//   })
// });

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

export type Arbitrary<T> = () => Option<T>;

/**
 * https://en.wikipedia.org/wiki/Homoiconicity
 */
export interface PossiblyHomoiconic<T extends PossiblyHomoiconic<T>> {
  self: Arbitrary<T>
  is_reference: () => boolean
  as_reference: () => T
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
export class Ray
  implements
      PossiblyHomoiconic<Ray>,

      AsyncIterable<Ray>,
      Iterable<Ray>
{

  js: () => Option<any>;

  // TODO: Could make a case that setting the terminal is more of a map, defaulting/first checking the terminal before additional functionality is mapped over that.
  initial: () => Option<Ray>;
  vertex: () => Option<Ray>;
  terminal: () => Option<Ray>;

  self = (): Option<Ray> => this.vertex();

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

  next = (): Option<Ray> => JS.Iterable(this.traverse({ steps: 1 })).as_ray();
  previous = (): Option<Ray> => JS.Iterable(this.traverse({ steps: 1, direction: { reverse: true } })).as_ray();

  continues_with = (continuation_reference: () => Option<Ray>): Option<Ray> => {
    if (this.self().is_none())
      return Option.None;

    // if (this.is_initial())
    //   throw 'Not Implemented: Ambiguity in equivalencing to an Initial.' // This one's a little ambigious what to do; probably better to leave it out of the initial setup.

    const self = this.self().force();

    if (!this.is_terminal()) {
      self.terminal().force().as_reference().continues_with(continuation_reference);
      return Option.None;
    }

    /**
     * [--|  ]
     *
     * So this could be
     * [--|  ]    [--|  ]    [--|  ]
     * [  |--]    [--|--]    [--|  ]
     *    ^This being the thing deemed as an actual continuation.
     */
    const possibly_continues_with: Option<Ray> = (() => {
      const possible_reference = continuation_reference();
      if (possible_reference.is_none())
        return Option.None;

      const reference = possible_reference.force();

      if (reference.is_initial()) {
        /**
         * [--|  ]
         * [  |--]
         */
        return reference.vertex();
      }

      if (reference.is_terminal()) {
        /**
         * [--|  ]
         * [--|  ]
         */

        // No continuation, but just equivalence them anyway. (ambiguity here, could also not do that)
        // return reference.vertex();
        throw 'Not Implemented: Ambiguity in equivalencing a Terminal and Terminal.'
      }

      if (reference.is_reference()) {
        /**
         * [--|  ]
         * [  |  ]
         */
        // const next = reference.vertex().force();
        // next.initial = () => this.self();
        //
        // return next.as_reference().as_option();
        throw 'Not Implemented: Ambiguity in equivalencing a Terminal and Reference.'
      }

      /**
       * [--|  ]
       * [--|--]
       *
       * Again some ambiguity here, just for now ignore
       */
      throw 'Not Implemented: Ambiguity in equivalencing a Terminal and Vertex.'
    })();

    if (possibly_continues_with.is_none())
      return Option.None;

    self.terminal = () => possibly_continues_with;
    // two-way

    return possibly_continues_with;
  }

  // push_back = (vertex: Option<Ray>): Option<Ray> => {
  //
  // }

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

  is_initial = (): boolean => this.self().match({
    Some: (self) => self.initial().is_none(),
    None: () => false
  });
  is_vertex = (): boolean => !this.is_initial() && !this.is_terminal();
  is_terminal = (): boolean => this.self().match({
    Some: (self) => self.terminal().is_none(),
    None: () => false
  });

  is_reference = (): boolean => this.is_initial() && this.is_terminal();

  is_empty = (): boolean => this.self().is_none();

  as_reference = (): Ray => new Ray({ vertex: () => Option.Some(this) }) // A ray whose vertex references this Ray (ignorantly).

  as_option = (): Option<Ray> => Option.Some(this);
  as_arbitrary = (): Arbitrary<Ray> => () => this.as_option();

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

  map = (direction?: MapOptions): Option<Ray> => {
    if (direction === undefined)
      return this.as_option();

    // TODO: Any of these options could eventually be encoded at the vertices

    if (is_function(direction))
      return direction(this.as_option());

    if (this.self().is_none())
      return Option.None;

    const originalDirection = this.self().force();

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
      currentInterpretation?: Directionality,
      currentDescription?: Ray
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

    if (!exists) {
      const reference = vertex.vertex();
      if (reference.is_some() && reference.force().vertex().is_some()) {
        // const dereferenced = reference.force().vertex().force();
        //
        // const vertexDirectionality = options.directionality.new();
        // options.directionality.push_back(vertexDirectionality, options.convert(vertex.as_reference().as_option()));
        //
        // dereferenced.as_reference().compile({
        //   ...options,
        //   directionality: {...options.directionality, current: vertexDirectionality},
        //   direction: {reverse: false},
        // });
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

      // description

      const initial = new Ray();
      const vertex2 = new Ray({ initial: () => new Ray().as_option(), terminal: () => new Ray().as_option()});
      const terminal = new Ray();

      if (options.directionality.currentDescription) {
        // options.directionality.push_back(options.directionality.currentDescription, options.convert(initial.as_reference().as_option()));
      }

      // const descriptionEdge = options.directionality.new();
      // const edge = new Ray();
      // options.directionality.push_back(descriptionEdge, options.convert(edge.as_reference().as_option()))
      // options.directionality.push_back(descriptionEdge, options.convert((options.directionality.currentDescription ?? initial).as_reference().as_option()));

      const description = options.directionality.new();
      options.directionality.push_back(description, options.convert((options.directionality.currentDescription ?? initial).as_reference().as_option()));
      // options.directionality.push_back(description, options.convert(vertex.as_reference().as_option()));
      options.directionality.push_back(description, options.convert(vertex2.as_reference().as_option()));
      options.directionality.push_back(description, options.convert(terminal.as_reference().as_option()));

      options.directionality.currentDescription = terminal;

      options.directionality.currentInterpretation ??= options.directionality.new();
      options.directionality.push_back(options.directionality.currentInterpretation, options.convert(vertex.as_reference().as_option()));


      const description2 = options.directionality.new();
      // options.directionality.push_back(description2, options.convert(new Ray().as_reference().as_option()));
      options.directionality.push_back(description2, options.convert(vertex2.as_reference().as_option()));
      // options.directionality.push_back(description2, options.convert(new Ray().as_reference().as_option()));
      options.directionality.push_back(description2, options.convert(vertex.as_reference().as_option()));
      // options.directionality.push_back(description2, options.convert(new Ray().as_reference().as_option()));

      // TODO: Should yield at which step it was found (or only yield through groups ..., depending on one's traversal strategy)
      // console.log(this.type(), 'yielded vertex')

      // if (options.steps !== undefined) {
      //   // Found one in this directionality, remove a step for further traversals.
      //   options.steps -= 1;
      // }
      if (!exists) {
        const reference = vertex.vertex();
        if (reference.is_some() && reference.force().vertex().is_some()) {
          const dereferenced = reference.force().vertex().force();

          reference.force().compile({...options, directionality: { ...options.directionality, currentDescription: undefined, currentInterpretation: description2 }});
        }
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



    // if (this.self().is_none())
    //   return Option.None;

    // const vertex = this.self().force();
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


  /**
   * JavaScript, possible compilations
   */
    // JS.AsyncGenerator
    async *[Symbol.asyncIterator](): AsyncGenerator<Ray> { yield *this.traverse(); }
    // JS.Generator
    *[Symbol.iterator](): Generator<Ray> { yield *this.traverse(); }
    // JS.AsyncGenerator
    as_async_generator = (): AsyncGenerator<Ray> => this[Symbol.asyncIterator]();
    // JS.AsyncIterator
    as_async_iterator = (): AsyncIterator<Ray> => this.as_async_generator();
    // JS.Iterator
    as_generator = (): Generator<Ray> => this[Symbol.iterator]();
    // JS.AsyncIterator
    as_iterator = (): Iterator<Ray> => this.as_generator();
    // JS.Array
    as_array = (): any[] => [...this];
    // JS.String
    toString = (): string => this.as_array().toString();
    as_string = () => this.toString();

  /**
   * Quick dirty compilation
   */
  to_wolfram_language = (): string => {
    const hyperEdges: string[][] = [];
    const options: any = {};
    let label = 0;

    const vertexStyle = (reference: Option<Ray>): string => {
      switch (reference.force().type()) {
        case RayType.INITIAL:{
          return 'Darker@Red'
        }
        case RayType.TERMINAL: {
          return 'Lighter@Red'
        }
        case RayType.REFERENCE: {
          return 'Orange'
        }
        case RayType.VERTEX: {
          return 'Lighter@Blue'
        }
      }
    }
    const get = (reference: Option<Ray>): Option<string> => {
      const vertex = reference.match({ Some: (ref) => ref.vertex(), None: () => Option.None });
      if (vertex.is_some() && (vertex.force() as any)["__label"] !== undefined)
        return Option.Some((vertex.force() as any)["__label"] as string);

      return Option.None;
    }

    this.compile<string, string[]>({
      directionality: {
        new: () => {
          const edge: string[] = [];
          hyperEdges.push(edge);
          return edge;
        },
        push_back: function (directionality: string[], ray: Option<string>): void {
          if (ray.is_some())
            directionality.push(ray.force());
        }
      },
      convert: function (reference: Option<Ray>): Option<string> {
        const existing = get(reference);
        if (existing.is_some())
          return existing;

        if (reference.is_none() || reference.force().vertex().is_none())
          return Option.None;

        label++;

        const vertex = reference.force().vertex();

        const name: string = `"${vertex.force().js().match({
          Some: (js) => js.toString(),
          None: () => `?`
        })} (${label})"`;

        (options['VertexStyle'] ??= {})[name] = vertexStyle(reference);

        Object.defineProperty(vertex.force(), "__label", {value: name});

        return Option.Some(name);
      },
      get,
    });

    return `ResourceFunction["WolframModelPlot"][{${hyperEdges
      .filter(hyperEdge => hyperEdge.length !== 0)
      .map(hyperEdge =>
        `{${hyperEdge.join(',')}}`
      ).join(',')}},VertexLabels->All,${
        _.map(options, (mapping, option) =>
          `${option} -> <|${
            _.map(mapping, (value, key) => `${key} -> ${value}`)
              .join(',')}|>`)
          .join(',')}]`;
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

      // vertex: could have something at the vertex which defines the "end of the iterator" - but we don't here.
      const terminal = new Ray({
        initial: () => initial
      });
      // initial.force().continues_with(() => terminal.as_reference().as_option());

      // if (initial.is_some())
      //   initial.force().terminal = () => terminal; // TODO REPEAT FROM BELOW

      return terminal.as_option();
    }

    const current: Option<Ray> = Option.Some(new Ray({
      js: () => Option.Some(iterator_result.value),
      // initial: () => new Ray().as_option(),
      initial: () => initial,
      vertex: () => from_any(iterator_result.value).as_ray(),
      terminal: () => next(current)
    }));

    // initial.force().continues_with(() => current.force().as_reference().as_option());
    if (initial.is_some())
      initial.force().terminal = () => current;

    return current;
  }

  const ray_iterator = new Ray({ js: () => Option.Some(iterator)});
  ray_iterator.terminal = () => next(ray_iterator.as_option());

  // This indicates we're passing a reference, since traversal logic will be defined at its vertex - what it's defining.
  return ray_iterator.as_reference().as_option();
}
export const from_generator = <T = any>(generator: Generator<T>): Option<Ray> => {
  // [  |--]
  return from_iterable(generator);
}

export const empty = (): Ray => new Ray({ });
export const empty_vertex = (): Ray => {
  const initial = empty();
  const terminal = empty();
  const vertex = new Ray({ initial: initial.as_arbitrary(), terminal: terminal.as_arbitrary() });

  initial.terminal = vertex.as_arbitrary();
  terminal.initial = vertex.as_arbitrary();

  return vertex;
}

export const js = (value: any): Ray => {
  const vertex = empty_vertex();
  vertex.js = () => Option.Some(value);

  return vertex;
}

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

  const _false = js(false);
  const _true = js(true);
  // const two = _false.continues_with(_true);

  _false.as_reference()
    .continues_with(() =>
      _true.initial().force().as_reference().as_option()
    );

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
