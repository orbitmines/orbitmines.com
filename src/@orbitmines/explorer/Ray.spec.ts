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
  test("[A, B, C][.next, .previous]", () => {
    const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
    const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
    const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });

    expect(() => A.next).toThrow(); // TODO: Should be empty..
    expect(() => A.previous).toThrow(); // TODO: Should be empty..

    A.continues_with(B).continues_with(C);

    expect(() => A.previous).toThrow(); // TODO: Should be ??..
    expect(() => A.next.next.next).toThrow(); // TODO: Should be ??..

    expect(A.next.type).toBe(RayType.VERTEX);
    // expect(current.next.any.js).toBe('B.#');  TODO, maybe the ref??
    expect(A.next.self.any.js).toBe('B');

    expect(A.next.next.type).toBe(RayType.VERTEX);
    expect(A.next.next.self.any.js).toBe('C');

    expect(A.next.previous.self.any.js).toBe('A');
    expect(A.next.next.previous.self.any.js).toBe('B');
    expect(A.next.next.previous.previous.self.any.js).toBe('A');
    expect(A.next.previous.next.next.previous.self.any.js).toBe('B');
    expect(A.next.previous.next.next.previous.next.self.any.js).toBe('C');
  });
  // test("[A, [X, Y, Z].initial, B, C][.next, .previous]", () => {
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
  //   expect(A.next.type).toBe(RayType.INITIAL);
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
  // test(".next(ref => .continues_with(.vertex.#))", () => {
  //   let A = Ray.vertex().o({ js: 'A' }).as_reference();
  //   let B = Ray.vertex().o({ js: 'B'}).as_reference();
  //
  //   B = A.next(ref => ref.continues_with(B))
  //
  //   expect(B.type).toBe(RayType.VERTEX);
  //   expect(B.self.any.js).toBe('B');
  //   expect(B.self
  //     .initial.self.initial
  //     .any.js
  //   ).toBe('A');
  //   expect(B.self
  //     .initial.self.initial
  //     .terminal.self.terminal
  //     .any.js
  //   ).toBe('B');
  // });
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

