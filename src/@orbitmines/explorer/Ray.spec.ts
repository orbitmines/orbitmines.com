import {Ray, RayType} from "./Ray";

describe("Ray", () => {
  test(".___func(ref)", () => {
    const method = Ray.___func((ref: Ray): Ray => new Ray({
      initial: ref.self.initial.as_arbitrary(),
      terminal: ref.self.terminal.as_arbitrary()
    }).o({ js: ref.type })).as_method;

    expect(method(Ray.vertex().as_reference().as_reference())().any.js).toBe(RayType.REFERENCE);
    expect(method(Ray.vertex().as_reference())().any.js).toBe(RayType.VERTEX);
    expect(method(Ray.initial().as_reference())().any.js).toBe(RayType.INITIAL);
    expect(method(Ray.terminal().as_reference())().any.js).toBe(RayType.TERMINAL);

    const a = Ray.vertex().o({ js: 'A'}).as_reference();
    const b = Ray.vertex().o({ js: 'B'}).as_reference();

    // TODO What about method(a)(b)(c)... :thinking:
    expect(method(a)(b).initial.self.any.js).toBe('A');
    expect(method(a)(b).terminal.self.any.js).toBe('B');
    expect(method(a)(b).type).toBe(RayType.VERTEX);
  });
  test("[A, B, C].next()", () => {
    const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
    const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
    const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });

    A.continues_with(B).continues_with(C);

    // let pointer = A.step(Ray.directions.next()(A));

    let pointer = new Ray({
      initial: () => A,
      terminal: () => Ray.directions.next(A),
    });

    /**
     *        ____________
     * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
     *       [--A--]            [--B--]            [--C--]
     */

    expect(pointer.initial.self.any.js).toBe('A');

    expect(pointer.initial.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.type).toBe(RayType.TERMINAL);

    pointer = pointer.step();
    
    /**
     *             ______________
     * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
     *       [--A--]            [--B--]            [--C--]
     */
    expect(pointer.initial.type).toBe(RayType.TERMINAL);
    expect(pointer.terminal.type).toBe(RayType.INITIAL);

    pointer = pointer.step();

    /**
     *                    ____________
     * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
     *       [--A--]            [--B--]            [--C--]
     */
    expect(pointer.initial.type).toBe(RayType.INITIAL);
    expect(pointer.terminal.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.self.any.js).toBe('B');

    pointer = pointer.step();
    
    /**
     *                           ____________
     * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
     *       [--A--]            [--B--]            [--C--]
     */
    expect(pointer.initial.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.type).toBe(RayType.TERMINAL);

    pointer = pointer.step();
    
    /**
     *                                ______________
     * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
     *       [--A--]            [--B--]            [--C--]
     */
    expect(pointer.initial.type).toBe(RayType.TERMINAL);
    expect(pointer.terminal.type).toBe(RayType.INITIAL);

    pointer = pointer.step();
    
    /**
     *                                       ____________
     * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
     *       [--A--]            [--B--]            [--C--]
     */
    expect(pointer.initial.type).toBe(RayType.INITIAL);
    expect(pointer.terminal.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.self.any.js).toBe('C');

    pointer = pointer.step();
    
    /**
     *                                              ____________
     * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
     *       [--A--]            [--B--]            [--C--]
     */
    expect(pointer.initial.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.type).toBe(RayType.TERMINAL);

    pointer = pointer.step();

    /**
     *                                                   _______
     * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
     *       [--A--]            [--B--]            [--C--]
     */
    expect(pointer.initial.type).toBe(RayType.TERMINAL);
    // expect(pointer.terminal.type).toBe(RayType.TERMINAL); ??
    expect(pointer.terminal.is_none()).toBe(true);
  });
  test("[A, B, C].previous()", () => {
    const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
    const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
    const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });

    A.continues_with(B).continues_with(C);

    // let pointer = A.step(Ray.directions.next()(A));

    let pointer = new Ray({
      initial: () => C,
      terminal: () => Ray.directions.previous(C),
    });

    expect(pointer.initial.self.any.js).toBe('C');

    expect(pointer.initial.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.type).toBe(RayType.INITIAL);

    pointer = pointer.step();

    expect(pointer.initial.type).toBe(RayType.INITIAL);
    expect(pointer.terminal.type).toBe(RayType.TERMINAL);

    pointer = pointer.step();

    expect(pointer.initial.type).toBe(RayType.TERMINAL);
    expect(pointer.terminal.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.self.any.js).toBe('B');

    pointer = pointer.step();

    expect(pointer.initial.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.type).toBe(RayType.INITIAL);

    pointer = pointer.step();

    expect(pointer.initial.type).toBe(RayType.INITIAL);
    expect(pointer.terminal.type).toBe(RayType.TERMINAL);

    pointer = pointer.step();

    expect(pointer.initial.type).toBe(RayType.TERMINAL);
    expect(pointer.terminal.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.self.any.js).toBe('A');

    pointer = pointer.step();

    expect(pointer.initial.type).toBe(RayType.VERTEX);
    expect(pointer.terminal.type).toBe(RayType.INITIAL);

    pointer = pointer.step();

    expect(pointer.initial.type).toBe(RayType.INITIAL);
    // expect(pointer.terminal.type).toBe(RayType.TERMINAL); ??
    expect(pointer.terminal.is_none()).toBe(true);
  });
  test("[A, B, C][.has_next(), .has_previous()]", () => {
    const A = Ray.vertex().o({js: 'A'}).as_reference().o({js: 'A.#'});
    const B = Ray.vertex().o({js: 'B'}).as_reference().o({js: 'B.#'});
    const C = Ray.vertex().o({js: 'C'}).as_reference().o({js: 'C.#'});

    A.continues_with(B).continues_with(C);

    expect(A.has_next()).toBe(true);
    expect(A.has_next(Ray.directions.next)).toBe(true);
    expect(A.has_next(Ray.directions.previous)).toBe(false);
    expect(A.has_previous()).toBe(false);
    expect(A.has_previous(Ray.directions.previous)).toBe(false);
    expect(A.has_previous(Ray.directions.next)).toBe(true);

    expect(B.has_next()).toBe(true);
    expect(B.has_next(Ray.directions.next)).toBe(true);
    expect(B.has_next(Ray.directions.previous)).toBe(true);
    expect(B.has_previous()).toBe(true);
    expect(B.has_previous(Ray.directions.previous)).toBe(true);
    expect(B.has_previous(Ray.directions.next)).toBe(true);

    expect(C.has_next()).toBe(false);
    expect(C.has_next(Ray.directions.next)).toBe(false);
    expect(C.has_next(Ray.directions.previous)).toBe(true);
    expect(C.has_previous()).toBe(true);
    expect(C.has_previous(Ray.directions.previous)).toBe(true);
    expect(C.has_previous(Ray.directions.next)).toBe(false);
  });
  test("[A, B, C][.last(), .first()]", () => {
    const A = Ray.vertex().o({js: 'A'}).as_reference().o({js: 'A.#'});
    const B = Ray.vertex().o({js: 'B'}).as_reference().o({js: 'B.#'});
    const C = Ray.vertex().o({js: 'C'}).as_reference().o({js: 'C.#'});

    A.continues_with(B).continues_with(C);

    expect(A.first().self.any.js).toBe('A');
    expect(B.first().self.any.js).toBe('A');
    expect(C.first().self.any.js).toBe('A');

    expect(A.last().self.any.js).toBe('C');
    expect(B.last().self.any.js).toBe('C');
    expect(C.last().self.any.js).toBe('C');
  });
  test("[A, B, C][.at()]", () => {
    const A = Ray.vertex().o({js: 'A'}).as_reference().o({js: 'A.#'});
    const B = Ray.vertex().o({js: 'B'}).as_reference().o({js: 'B.#'});
    const C = Ray.vertex().o({js: 'C'}).as_reference().o({js: 'C.#'});

    A.continues_with(B).continues_with(C);

    expect(A.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
    expect(A.at(-100).is_none()).toBe(true);
    expect(A.at(-1).is_none()).toBe(true);
    expect(A.at(0).self.any.js).toBe('A');
    expect(A.at(1).self.any.js).toBe('B');
    expect(A.at(2).self.any.js).toBe('C');
    expect(A.at(3).is_none()).toBe(true);
    expect(A.at(100).is_none()).toBe(true);
    expect(A.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);

    expect(B.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
    expect(B.at(-100).is_none()).toBe(true);
    expect(B.at(-2).is_none()).toBe(true);
    expect(B.at(-1).self.any.js).toBe('A');
    expect(B.at(0).self.any.js).toBe('B');
    expect(B.at(1).self.any.js).toBe('C');
    expect(B.at(2).is_none()).toBe(true);
    expect(B.at(100).is_none()).toBe(true);
    expect(B.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);

    expect(C.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
    expect(C.at(-100).is_none()).toBe(true);
    expect(C.at(-3).is_none()).toBe(true);
    expect(C.at(-2).self.any.js).toBe('A');
    expect(C.at(-1).self.any.js).toBe('B');
    expect(C.at(0).self.any.js).toBe('C');
    expect(C.at(1).is_none()).toBe(true);
    expect(C.at(100).is_none()).toBe(true);
    expect(C.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);
  });
  test(".permutation", () => {
    const A = Ray.permutation(0, 3);
    const B = Ray.permutation(1, 3);
    const C = Ray.permutation(2, 3);

    expect(A.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
    expect(A.at(-100).is_none()).toBe(true);
    expect(A.at(-1).is_none()).toBe(true);

    expect(A.at(0).is_some()).toBe(true);
    expect(A.at(1).is_some()).toBe(true);
    expect(A.at(2).is_some()).toBe(true);

    expect(A.at(3).is_none()).toBe(true);
    expect(A.at(100).is_none()).toBe(true);
    expect(A.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);


    expect(B.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
    expect(B.at(-100).is_none()).toBe(true);
    expect(B.at(-2).is_none()).toBe(true);

    expect(B.at(-1).is_some()).toBe(true);
    expect(B.at(0).is_some()).toBe(true);
    expect(B.at(1).is_some()).toBe(true);

    expect(B.at(2).is_none()).toBe(true);
    expect(B.at(100).is_none()).toBe(true);
    expect(B.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);


    expect(C.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
    expect(C.at(-100).is_none()).toBe(true);
    expect(C.at(-3).is_none()).toBe(true);

    expect(C.at(-2).is_some()).toBe(true);
    expect(C.at(-1).is_some()).toBe(true);
    expect(C.at(0).is_some()).toBe(true);

    expect(C.at(1).is_none()).toBe(true);
    expect(C.at(100).is_none()).toBe(true);
    expect(C.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);
  });
  test("[A, B, C][.next(), .previous()]", () => {
    const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
    const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
    const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });

    expect(A.next().is_none()).toBe(true);
    expect(A.previous().is_none()).toBe(true);

    A.continues_with(B).continues_with(C);

    expect(A.next().is_none()).toBe(false);
    expect(A.previous().is_none()).toBe(true);

    expect(A.next().next().next().is_none()).toBe(true);

    expect(A.next().type).toBe(RayType.VERTEX);
    // expect(current.next().any.js).toBe('B.#');  TODO, maybe the ref??
    expect(A.next().self.any.js).toBe('B');

    expect(A.next().next().type).toBe(RayType.VERTEX);
    expect(A.next().next().self.any.js).toBe('C');

    expect(A.next().previous().self.any.js).toBe('A');
    expect(A.next().next().previous().self.any.js).toBe('B');
    expect(A.next().next().previous().previous().self.any.js).toBe('A');
    expect(A.next().previous().next().next().previous().self.any.js).toBe('B');
    expect(A.next().previous().next().next().previous().next().self.any.js).toBe('C');
  });
  // test("[A, [X, Y, Z].initial, B, C][.next(), .previous()]", () => {
  //   /**
  //    *         |       |
  //    * |-- A --|       |-- B --|-- C --|
  //    *         |   \   |
  //    *         |-- X --|
  //    *         |   \   |
  //    *         |-- Y --|
  //    *         |   \   |
  //    *         |-- Z --|
  //    *         |   \   |               (Destroys the '\' connections) TODO: This should be optional/more complexly constructed
  //    */
  //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
  //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
  //   const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
  //
  //   const X = Ray.vertex().o({ js: 'X' }).as_reference().o({ js: 'X.#' });
  //   const Y = Ray.vertex().o({ js: 'Y' }).as_reference().o({ js: 'Y.#' });
  //   const Z = Ray.vertex().o({ js: 'Z' }).as_reference().o({ js: 'Z.#' });
  //
  //   X.continues_with(Y).continues_with(Z);
  //
  //   const ret = A.continues_with(X.self.initial.as_reference());
  //
  //   /**
  //    *         |
  //    * |-- A --|
  //    *         |       \  <-- '\' is 'ret'
  //    *         |-- X --|
  //    *         |       \
  //    *         |-- Y --|
  //    *         |       \
  //    *         |-- Z --|
  //    *         |       \
  //    */
  //   expect(ret.type).toBe(RayType.INITIAL);
  //   expect(ret.self.terminal.as_reference().is_none()).toBe(false);
  //   expect([...ret.self.terminal.as_reference()].map(
  //     return_ref => return_ref.type
  //   )).toEqual([RayType.VERTEX, RayType.VERTEX, RayType.VERTEX]);
  //   expect([...ret.self.terminal.as_reference()].map(
  //     return_ref => return_ref.self.type
  //   )).toEqual([RayType.TERMINAL, RayType.TERMINAL, RayType.TERMINAL]);
  //   expect([...ret.self.terminal.as_reference()].map(
  //     return_ref => {
  //       const return_vertex = return_ref.self;
  //       const terminal = return_vertex.self;
  //       const continued_vertex = terminal.initial;
  //
  //       return continued_vertex.any.js;
  //     }
  //   )).toEqual(['X', 'Y', 'Z']);
  //   expect([...ret.self.terminal.as_reference()].map(
  //     return_ref => {
  //       const vertex = return_ref.self;
  //       const terminal = vertex.self;
  //
  //       return terminal.self.as_reference().is_none();
  //     }
  //   )).toEqual([true, true, true]); // From the perspective of the 'terminal' it's ignorant of 'ret'.
  //
  //   expect(A.next().type).toBe(RayType.INITIAL);
  //
  //   /**
  //    *         |       |
  //    * |-- A --|       |-- B --|-- C --|
  //    *         |       |
  //    *         |-- X --|
  //    *         |       |
  //    *         |-- Y --|
  //    *         |       |
  //    *         |-- Z --|
  //    *         |       |
  //    */
  //   ret.continues_with(B).continues_with(C);
  //
  //
  // });
  // test(".as_vertex", () => {
  //   const initial = Ray.terminal().o({js: 'A'}).as_reference().o({js: 'A.#'});
  //   const terminal= Ray.initial().o({js: 'B'}).as_reference().o({js: 'B.#'});
  //
  //   initial.self = terminal.as_arbitrary();
  //   terminal.self = initial.as_arbitrary();
  //
  //   const as_vertex = initial.as_vertex();
  //   expect(as_vertex.self.any.js).toBe('B');
  // });
  test(".#.equivalent(.#)", () => {
    const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
    const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });

    const ret = A.equivalent(B);

    expect(A.self.self.any.js).toBe('B');
    expect(B.self.self.any.js).toBe('A');

    expect(A.self.self.self.any.js).toBe('A');
    expect(B.self.self.self.any.js).toBe('B');

    expect(ret.self.initial.any.js).toBe('A.#');
    expect(ret.self.initial.self.any.js).toBe('A');
    expect(ret.self.initial.self.self.any.js).toBe('B');
    expect(ret.self.initial.self.self.self.any.js).toBe('A');

    expect(ret.self.terminal.any.js).toBe('B.#');
    expect(ret.self.terminal.self.any.js).toBe('B');
    expect(ret.self.terminal.self.self.any.js).toBe('A');
    expect(ret.self.terminal.self.self.self.any.js).toBe('B');
  });
  test("[A, B, C][.as_array, ...]", () => {
    const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
    const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
    const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });

    A.continues_with(B).continues_with(C);

    expect(A.as_array().map(ref => ref.self.any.js)).toEqual(['A', 'B', 'C']);
    expect(B.as_array().map(ref => ref.self.any.js)).toEqual(['B', 'C']); // TODO: This may or may not be expected behavior, you could make a case for saying it should render both sides for .as_array. ???
    expect(C.as_array().map(ref => ref.self.any.js)).toEqual(['C']);

    expect([...A].map(ref => ref.self.any.js)).toEqual(['A', 'B', 'C']);
    expect([...A.traverse()].map(ref => ref.self.any.js)).toEqual(['A', 'B', 'C']);
    expect([...A.as_generator()].map(ref => ref.self.any.js)).toEqual(['A', 'B', 'C']);
    expect(A.as_string()).toBe('A,B,C');

    {

      const iterator = A.as_iterator();

      let array: Ray[] = [];

      while (true) {
        let current = iterator.next();
        if (current.done)
          break;

        array.push(current.value);
      }

      expect(array.map(ref => ref.self.any.js)).toEqual(['A', 'B', 'C']);

    }

    // TODO async_generator / async_iterator / for await *
  });
  test(".next", () => {
    let A = Ray.vertex().o({ js: 'A' }).as_reference();
    let B = Ray.vertex().o({ js: 'B'}).as_reference();

    A.continues_with(B);

    B = A.next();

    expect(B.type).toBe(RayType.VERTEX);
    expect(B.self.any.js).toBe('B');
    expect(B.self
      .initial.self.initial
      .any.js
    ).toBe('A');
    expect(B.self
      .initial.self.initial
      .terminal.self.terminal
      .any.js
    ).toBe('B');
  });
  test(".vertex.#.equivalent(.vertex.#)", () => {
    let A = Ray.vertex().o({js: 'A'})
      .as_reference().o({js: 'A.#'});
    let B = Ray.vertex().o({js: 'B'})
      .as_reference().o({js: 'B.#'});

    expect(A.any.js).toBe('A.#');
    expect(B.any.js).toBe('B.#');

    let ref = A.equivalent(B);

    expect(ref.self.initial).toBe(A);
    expect(ref.self.terminal).toBe(B);
    expect(ref.self.initial.any.js).toBe('A.#');
    expect(ref.self.terminal.any.js).toBe('B.#');

    expect(A.self.any.js).toBe('A');
    expect(B.self.any.js).toBe('B');

    expect(A.self.self).toBe(B.self);
    expect(B.self.self).toBe(A.self);
    expect(A.self.self.any.js).toBe('B');
    expect(B.self.self.any.js).toBe('A');

    expect(B.self.self.self).toBe(B.self);
    expect(B.self.self.self.self).toBe(A.self);
    expect(B.self.self.self.any.js).toBe('B');
    expect(B.self.self.self.self.any.js).toBe('A');
  });
  test(".vertex.#.continues_with(.vertex.#)", () => {
    let A = Ray.vertex().o({ js: 'A' }).as_reference();
    let B = Ray.vertex().o({ js: 'B'}).as_reference();

    B = A.continues_with(B);

    expect(B.type).toBe(RayType.VERTEX);
    expect(B.self.any.js).toBe('B');
    expect(B.self
      .initial.self.initial
      .any.js
    ).toBe('A');
    expect(B.self
      .initial.self.initial
      .terminal.self.terminal
      .any.js
    ).toBe('B');
  });
  test("[.vertex.#, .vertex.#].#.continues_with", () => {
    let A = Ray.vertex().o({ js: 'A' }).as_reference();
    let B = Ray.vertex().o({ js: 'B' }).as_reference();

    B = new Ray({
      initial: A.as_arbitrary(),
      terminal: B.as_arbitrary()
    }).as_reference().continues_with();

    expect(B.type).toBe(RayType.VERTEX);
    expect(B.self.any.js).toBe('B');
    expect(B.self
      .initial.self.initial
      .any.js
    ).toBe('A');
    expect(B.self
      .initial.self.initial
      .terminal.self.terminal
      .any.js
    ).toBe('B');
  });
  // test(".vertex.#.debug", () => {
  //   const a = Ray.vertex().as_reference();
  //   const b = Ray.vertex().as_reference();
  //   a.continues_with(b);
  //
  //   const debug = {};
  //   a.debug(debug);
  //
  //   expect(debug).toEqual('')
  // })
  test(".as_arbitrary", () => {
    expect(Ray.vertex().o({ js: 'A' }).as_arbitrary()().any.js).toBe('A');
  });
  test(".dereference", () => {
    const A = Ray.vertex(
      Ray.vertex().o({ js: "A.vertex" }).as_arbitrary()
    ).o({ js: 'A' }).as_reference();

    expect(A.dereference.self.any.js).toBe('A.vertex');
    expect(A.as_reference().dereference.self.any.js).toBe('A');
    expect(A.as_reference().as_reference().dereference.dereference.self.any.js).toBe('A');
    expect(A.as_reference().as_reference().as_reference().dereference.dereference.dereference.self.any.js).toBe('A');
    expect(A.as_reference().as_reference().as_reference().dereference.dereference.dereference.dereference.self.any.js).toBe('A.vertex');
  });
  test(".o", () => {
    const ray = Ray.vertex().o({
      a: 'b',
      position: [0, 1, 2],
      func: () => 'c'
    });

    expect(ray.any.a).toBe('b');
    expect(ray.any.test).toBe(undefined);
    expect(() => ray.any.undefinedFunction()).toThrow();
    expect(ray.any.position).toEqual([0, 1, 2]);
    expect(ray.any.func()).toBe('c');
  })

  // test(".[vertex, vertex].#.compose", () => {
  //   /** [--|--] */ const vertex = Ray.vertex().as_reference();
  //   vertex.initial.o({ js: 'A' });
  //   vertex.terminal.o({ js: 'B' });
  //
  //   expect(vertex.compose.)
  // });
  test(".vertex.#", () => {
    /** [--|--] */ const vertex = Ray.vertex().as_reference();

    expect(vertex.type).toBe(RayType.VERTEX);

    expect(vertex.is_none()).toBe(false);
    expect(vertex.is_some()).toBe(true);

    expect(vertex.is_initial()).toBe(false);
    expect(vertex.is_vertex()).toBe(true);
    expect(vertex.is_terminal()).toBe(false);
    expect(vertex.is_reference()).toBe(false);

    expect(vertex.self).toBe(vertex.self.initial.terminal);
    expect(vertex.self).toBe(vertex.self.terminal.initial);
    expect(vertex.self).toBe(vertex.self.initial.as_reference().self.terminal);
  });
  test(".vertex.initial.#", () => {
    /** [--|--] */ const vertex = Ray.vertex();
    /** [  |--] */ const initial = vertex.initial.as_reference();

    expect(initial.self.initial.is_none()).toBe(true);
    expect(initial.self).not.toBe(initial.self.self); // If self-referential, that means none.

    expect(initial.self.terminal).toBe(vertex);
    expect(initial.self.terminal.self).not.toBe(vertex);
    expect(initial.self.terminal.initial).toBe(initial.self);

    expect(initial.self.is_none()).toBe(false);
    expect(initial.self.self.is_none()).toBe(true);

    expect(initial.is_some()).toBe(true);
    expect(initial.self.terminal.is_none()).toBe(false);

    expect(initial.is_initial()).toBe(true);
    expect(initial.is_vertex()).toBe(false);
    expect(initial.is_terminal()).toBe(false);
    expect(initial.is_reference()).toBe(false);
    expect(initial.type).toBe(RayType.INITIAL);
  });
  test(".initial.#", () => {
    /** [  |-?] */ const initial = Ray.initial().as_reference();

    expect(initial.self.initial.is_none()).toBe(true);
    expect(initial.self).not.toBe(initial.self.self); // If self-referential, that means none.

    expect(initial.self).toBe(initial.self.terminal.initial);
    expect(initial.self.terminal).toBe(initial.self.terminal.terminal.initial);

    expect(initial.self.terminal.initial).toBe(initial.self);

    expect(initial.self.is_none()).toBe(false);
    expect(initial.self.self.is_none()).toBe(true);

    expect(initial.is_some()).toBe(true);
    expect(initial.self.terminal.is_none()).toBe(false);

    expect(initial.is_initial()).toBe(true);
    expect(initial.is_vertex()).toBe(false);
    expect(initial.is_terminal()).toBe(false);
    expect(initial.is_reference()).toBe(false);
    expect(initial.type).toBe(RayType.INITIAL);
  });
  test(".vertex.terminal.#", () => {
    /** [--|--] */ const vertex = Ray.vertex();
    /** [  |--] */ const terminal = vertex.terminal.as_reference();

    expect(terminal.self.terminal.is_none()).toBe(true);
    expect(terminal.self).not.toBe(terminal.self.self); // If self-referential, that means none.

    expect(terminal.self.initial).toBe(vertex);
    expect(terminal.self.initial.self).not.toBe(vertex);
    expect(terminal.self.initial.terminal).toBe(terminal.self);

    expect(terminal.self.is_none()).toBe(false);
    expect(terminal.self.self.is_none()).toBe(true);

    expect(terminal.is_some()).toBe(true);
    expect(terminal.self.initial.is_none()).toBe(false);

    expect(terminal.is_terminal()).toBe(true);
    expect(terminal.is_vertex()).toBe(false);
    expect(terminal.is_initial()).toBe(false);
    expect(terminal.is_reference()).toBe(false);
    expect(terminal.type).toBe(RayType.TERMINAL);
  });
  test(".terminal.#", () => {
    /** [--|  ] */ const terminal = Ray.terminal().as_reference();

    expect(terminal.self.terminal.is_none()).toBe(true);
    expect(terminal.self).not.toBe(terminal.self.self); // If self-referential, that means none.

    expect(terminal.self).toBe(terminal.self.initial.terminal);
    expect(terminal.self.initial).toBe(terminal.self.initial.initial.terminal);

    expect(terminal.self.initial.terminal).toBe(terminal.self);

    expect(terminal.self.is_none()).toBe(false);
    expect(terminal.self.self.is_none()).toBe(true);

    expect(terminal.is_some()).toBe(true);
    expect(terminal.self.initial.is_none()).toBe(false);

    expect(terminal.is_terminal()).toBe(true);
    expect(terminal.is_vertex()).toBe(false);
    expect(terminal.is_initial()).toBe(false);
    expect(terminal.is_reference()).toBe(false);
    expect(terminal.type).toBe(RayType.TERMINAL);
  });
  test(".None", () => {
    /** [     ] */
    const ray = Ray.None();

    expect(ray.self.is_none()).toBe(true);
    expect(ray.self.is_some()).toBe(false);
    expect(ray.self.initial.is_none()).toBe(true);
    expect(ray.self.vertex.is_none()).toBe(true);
    expect(ray.self.terminal.is_none()).toBe(true);

    expect(ray.is_none()).toBe(true);
    expect(ray.is_some()).toBe(false);

    expect(ray.is_initial()).toBe(false);
    expect(ray.is_vertex()).toBe(true);
    expect(ray.is_terminal()).toBe(false);
    expect(ray.is_reference()).toBe(false);
    expect(ray.type).toBe(RayType.VERTEX);

  });
  test(".None.#", () => {
    /**
     * [  |  ]
     *    |
     * [?????]
    */

    const ray = Ray.None().as_reference();

    expect(ray.self.is_none()).toBe(true);
    expect(ray.self.is_some()).toBe(false);
    expect(ray.self.initial.is_none()).toBe(true);
    expect(ray.self.vertex.is_none()).toBe(true);
    expect(ray.self.terminal.is_none()).toBe(true);

    expect(ray.is_none()).toBe(true);
    expect(ray.is_some()).toBe(false);

    expect(ray.is_initial()).toBe(false);
    expect(ray.is_vertex()).toBe(true);
    expect(ray.is_terminal()).toBe(false);
    expect(ray.is_reference()).toBe(false);
    expect(ray.type).toBe(RayType.VERTEX);

  });
  test(".None.#.#", () => {
    /**
     * [  |  ]
     *    |
     * [  |  ]
     *    |
     * [?????]
     */
    const ray = Ray.None().as_reference().as_reference();

    expect(ray.self.is_none()).toBe(true);
    expect(ray.self.is_some()).toBe(false);

    expect(ray.self.initial.is_none()).toBe(true);
    expect(ray.self.vertex.is_none()).toBe(true);
    expect(ray.self.terminal.is_none()).toBe(true);

    expect(ray.is_none()).toBe(false);
    expect(ray.is_some()).toBe(true);

    expect(ray.is_initial()).toBe(true);
    expect(ray.is_vertex()).toBe(false);
    expect(ray.is_terminal()).toBe(true);
    expect(ray.is_reference()).toBe(true);
    expect(ray.type).toBe(RayType.REFERENCE);
  });
  test(".None.#.#.#", () => {
    /**
     *   ...
     *    |
     * [  |  ]
     *    |
     * [  |  ]
     *    |
     * [  |  ]
     *    |
     * [?????]
     */
    let ray = Ray.None().as_reference().as_reference().as_reference();

    expect(ray.self.is_none()).toBe(false);
    expect(ray.self.is_some()).toBe(true);
    expect(ray.self.initial.is_none()).toBe(true);
    expect(ray.self.vertex.is_none()).toBe(true);
    expect(ray.self.terminal.is_none()).toBe(true);

    expect(ray.is_none()).toBe(false);
    expect(ray.is_some()).toBe(true);

    expect(ray.is_initial()).toBe(true);
    expect(ray.is_vertex()).toBe(false);
    expect(ray.is_terminal()).toBe(true);
    expect(ray.is_reference()).toBe(true);
    expect(ray.type).toBe(RayType.REFERENCE);
  });
  test(".None.#.#.#.#[4-15]", () => {
    /**
     * Basically the empty value is out of scope of our direct drill, and we expect this behavior 'infinitely' up the reference stack.
     *   ...
     * [  |  ]  <-- ray
     *    |
     * [  |  ]  <-- ray.self              - (ray.self.is_none())
     *    |
     * [  |  ]  <-- ray.self.self         - (ray.self.self === ray.self.self.self)
     *    |
     * [  |  ]  <-- ray.self.self.self    - = false
     *    |
     * [?????]
     */
    for (let i = 4; i <= 15; i++) {
      let ray = Ray.None();
      for (let j = 0; j < i; j++) {
        ray = ray.as_reference();
      }

      expect(ray.self.is_none()).toBe(false);
      expect(ray.self.is_some()).toBe(true);
      expect(ray.self.initial.is_none()).toBe(true);
      expect(ray.self.vertex.is_none()).toBe(false);
      expect(ray.self.terminal.is_none()).toBe(true);

      expect(ray.is_none()).toBe(false);
      expect(ray.is_some()).toBe(true);

      expect(ray.is_initial()).toBe(true);
      expect(ray.is_vertex()).toBe(false);
      expect(ray.is_terminal()).toBe(true);
      expect(ray.is_reference()).toBe(true);
      expect(ray.type).toBe(RayType.REFERENCE);
    }
  });
});

