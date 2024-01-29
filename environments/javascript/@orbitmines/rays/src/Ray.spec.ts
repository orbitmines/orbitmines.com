import Ray from "./Ray";

describe("Ray", () => {

  describe(".Function", () => {
    describe(".Instance", () => {
      test(".te", () => {
        {
          // "new Ray.vertex()()" vs "new Ray.vertex()"
          const A = new Ray.vertex();
          const B = new Ray.vertex();

          A.compose(B);
        }
        {
          const ray = Ray.size(2);
        }
        {
          const ray = Ray.array([undefined, undefined]);

        }
        {
          const ray = Ray.boolean();
        }

      });
      test(".traverse", () => {
        const events: any[] = [];
        const ray = Ray.array([]);

        // const b = ray in ray;

        // ray()()()()();
        //
        ray.debug(
          (event: Ray.Debug.Event) => {
            events.push(event);
          },
          () => {
            try{
              if (ray) {
                ray.is_orbit();

              }
              new ray.initial;

              // ray.initial = new ray();
              // ray.initial = ray.terminal();
              // ray.initial = (self): Ray.Any => {}
              // ray.initial = Ray.Function.Self.Impl((self) => {})

            } catch (e) {}
          }
        );

        expect(events.map(event => ({
          event: event.event, context: event.context
        }))).toBe(false);

      });
    })
  })






















  // test(".is_orbit", () => {
  //   const a = Ray.New();
  //   const b = Ray.New();
  //
  //   expect(a.is_orbit(a)).toBe(true);
  //   expect(b.is_orbit(b)).toBe(true);
  //   expect(a.is_orbit(b)).toBe(false);
  // });
  test(".dereference", () => {


    // expect(a.dereference()).toBe(true);
  });

//   test("[A, B, C].copy", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//
//     A.compose(B).compose(C);
//
//     expect(() => A.copy()).toThrow(); //TODO
//     // const copy = A.copy();
//     // expect(A.has_previous()).toBe(false);
//
//     // expect(copy.has_previous()).toBe(false);
//   });
//   // test("[A, [B, C]]", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //   const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//   //
//   //   /**
//   //    * [--A--] [--|  ]
//   //    *         [  |--] [--B--]
//   //    */
//   //   A.compose(B);
//   //
//   //   /**
//   //    * [--A--] [--|  ]
//   //    *         [  |--] [--B--]
//   //    *            |
//   //    *         [  |--] [--C--]
//   //    */
//   //   A.compose(C);
//   //
//   //   expect(A.follow().type).toEqual(RayType.TERMINAL);
//   //   expect(A.follow().dereference.type).toEqual(RayType.VERTEX);
//   //   expect([...A.follow().dereference].map(ref => ref.self.follow_direction().any.js)).toEqual(['A', 'B', 'C']);
//   //   expect([...A.all().js]).toEqual(['A', 'B', 'C']);
//   //   // expect([...A].map(ref => ref.any.js)).toEqual(['A', 'B', 'C']);
//   //
//   //
//   // });
//   test(".vertex.#.delete", () => {
//     const A_vertex = Ray.vertex().o({ js: 'A' });
//     const A_ref = A_vertex.as_reference().o({ js: 'A.#' });
//
//     expect(A_vertex.is_none()).toBe(false);
//     expect(Ray.directions.next(A_ref).is_none()).toBe(false);
//     expect(Ray.directions.previous(A_ref).is_none()).toBe(false);
//     expect(A_ref.any.js).toBe('A');
//     expect(A_ref.is_none()).toBe(false);
//
//     A_ref.delete();
//
//     expect(A_vertex.is_none()).toBe(true);
//     expect(Ray.directions.next(A_vertex).is_none()).toBe(true);
//     expect(Ray.directions.previous(A_vertex).is_none()).toBe(true);
//     expect(A_vertex.any.js).toBe(undefined);
//     expect(A_ref.is_none()).toBe(true);
//   });
//   test("[A, B, C, D, E].all().js", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//     const D = Ray.vertex().o({ js: 'D' }).as_reference().o({ js: 'D.#' });
//     const E = Ray.vertex().o({ js: 'E' }).as_reference().o({ js: 'E.#' });
//
//     A.compose(B).compose(C).compose(D).compose(E);
//
//     expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
//   });
//   test("[A, B, C, D, E].all() ; -= / +=", () => {
//     const A = Ray.vertex().o({ js: 'A', value: 0 }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B', value: 1 }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C', value: 2 }).as_reference().o({ js: 'C.#' });
//     const D = Ray.vertex().o({ js: 'D', value: 3 }).as_reference().o({ js: 'D.#' });
//     const E = Ray.vertex().o({ js: 'E', value: 4 }).as_reference().o({ js: 'E.#' });
//
//     A.compose(B).compose(C).compose(D).compose(E);
//
//     A.all().value = (value: number) => value - 3;
//     expect([...A.all().value]).toEqual([-3, -2, -1, 0, 1]);
//
//     C.all().value = (value: number) => value + 10;
//     expect([...A.all().value]).toEqual([-3, -2, 9, 10, 11]);
//
//     D.all(Ray.directions.previous).value = (value: number) => value - 50;
//     expect([...A.all().value]).toEqual([-53, -52, -41, -40, 11]);
//   });
//   test("[A, B, C, D, E].___next()", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//     const D = Ray.vertex().o({ js: 'D' }).as_reference().o({ js: 'D.#' });
//     const E = Ray.vertex().o({ js: 'E' }).as_reference().o({ js: 'E.#' });
//
//     A.compose(B).compose(C).compose(D).compose(E);
//
//     expect([...A.___next()].map(ref => ref.any.js)).toEqual(['A', 'B', 'C', 'D', 'E']);
//     expect(A.last().any.js).toEqual('E');
//     expect(D.first().any.js).toEqual('A');
//   });
//   test("[A, B, C, D, E].traverse()", () => {
//     const A = Ray.vertex().o2({ initial: { js: 'A.<<' }, vertex: { js: 'A' },
//       terminal: { js: 'A.>>' } }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o2({ initial: { js: 'B.<<' }, vertex: { js: 'B' },
//       terminal: { js: 'B.>>' } }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o2({ initial: { js: 'C.<<' }, vertex: { js: 'C' },
//       terminal: { js: 'C.>>' } }).as_reference().o({ js: 'C.#' });
//     const D = Ray.vertex().o2({ initial: { js: 'D.<<' }, vertex: { js: 'D' },
//       terminal: { js: 'D.>>' } }).as_reference().o({ js: 'D.#' });
//     const E = Ray.vertex().o2({ initial: { js: 'E.<<' }, vertex: { js: 'E' },
//       terminal: { js: 'E.>>' } }).as_reference().o({ js: 'E.#' });
//
//     A.compose(B).compose(C).compose(D).compose(E);
//
//     const branch = Ray.step_function(Ray.directions.next);
//
//     let step: Ray.Any = branch.as_ray(A);
//
//     expect([step.previous(), step].map(ray =>
//       [ray.dereference.is_some(), ray.dereference.type, ray.dereference.any.js])
//     ).toEqual(
//       [[false, RayType.VERTEX, undefined], [true, RayType.VERTEX, 'A']]
//     );
//
//     expect(step.previous().is_none()).toBe(true)
//
//     step = step.next();
//
//     expect([step.previous(), step].map(ray =>
//       [ray.dereference.is_some(), ray.dereference.type, ray.dereference.any.js])
//     ).toEqual(
//       [[true, RayType.VERTEX, 'A'], [true, RayType.TERMINAL, 'A.>>']]
//     );
//
//     step = step.next();
//
//     expect([step.previous(), step].map(ray =>
//       [ray.dereference.is_some(), ray.dereference.type, ray.dereference.any.js])
//     ).toEqual(
//       [[true, RayType.TERMINAL, 'A.>>'], [true, RayType.INITIAL, 'B.<<']]
//     );
//
//     step = step.next();
//
//     expect([step.previous(), step].map(ray =>
//       [ray.dereference.is_some(), ray.dereference.type, ray.dereference.any.js])
//     ).toEqual(
//       [[true, RayType.INITIAL, 'B.<<'], [true, RayType.VERTEX, 'B']]
//     );
//
//   });
//   // test("[A, B, C, D, E].___traverse()", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //   const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//   //   const D = Ray.vertex().o({ js: 'D' }).as_reference().o({ js: 'D.#' });
//   //   const E = Ray.vertex().o({ js: 'E' }).as_reference().o({ js: 'E.#' });
//   //
//   //   A.compose(B).compose(C).compose(D).compose(E);
//   //
//   //   expect([...A.___traverse()].map(pointer =>
//   //     [pointer.terminal.is_none(), pointer.initial.type, pointer.terminal.type, pointer.initial.any.js]
//   //   )).toEqual([
//   //     [false, RayType.VERTEX, RayType.TERMINAL, 'A'],
//   //     [false, RayType.TERMINAL, RayType.INITIAL, undefined],
//   //     [false, RayType.INITIAL, RayType.VERTEX, undefined],
//   //     [false, RayType.VERTEX, RayType.TERMINAL, 'B'],
//   //     [false, RayType.TERMINAL, RayType.INITIAL, undefined],
//   //     [false, RayType.INITIAL, RayType.VERTEX, undefined],
//   //     [false, RayType.VERTEX, RayType.TERMINAL, 'C'],
//   //     [false, RayType.TERMINAL, RayType.INITIAL, undefined],
//   //     [false, RayType.INITIAL, RayType.VERTEX, undefined],
//   //     [false, RayType.VERTEX, RayType.TERMINAL, 'D'],
//   //     [false, RayType.TERMINAL, RayType.INITIAL, undefined],
//   //     [false, RayType.INITIAL, RayType.VERTEX, undefined],
//   //     [false, RayType.VERTEX, RayType.TERMINAL, 'E'],
//   //     [true, RayType.TERMINAL, RayType.VERTEX, undefined], // vertex is Ray.None
//   //   ]);
//   // });
//   // test("[A, [B, C, D]].___traverse()", () => {
//   //   // const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   // const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //   // const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//   //   //
//   //   // A.compose(B);
//   //   // A.compose(C);
//   //
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const A_terminal = A.follow();
//   //   const B_initial = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' }).follow(Ray.directions.previous);
//   //   const C_initial = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' }).follow(Ray.directions.previous);
//   //   const D_initial = Ray.vertex().o({ js: 'D' }).as_reference().o({ js: 'D.#' }).follow(Ray.directions.previous);
//   //
//   //   A_terminal.equivalent(B_initial);
//   //   A_terminal.equivalent(C_initial);
//   //   A_terminal.equivalent(D_initial);
//   //
//   //   expect([...A.___traverse()].map(pointer =>
//   //     [pointer.terminal.is_none(), pointer.initial.type, pointer.terminal.type, pointer.terminal.is_boundary() ? pointer.terminal.follow_direction().any.js : undefined]
//   //   )).toEqual([
//   //     [false, RayType.VERTEX, RayType.TERMINAL, 'A'],
//   //     [false, RayType.TERMINAL, RayType.VERTEX, undefined],
//   //     // [true, RayType.VERTEX, RayType.VERTEX, undefined],
//   //   ]);
//   // });
//   // test("[A, B, C].next()", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //   const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//   //
//   //   A.compose(B).compose(C);
//   //
//   //   // let pointer = A.step(Ray.directions.next()(A));
//   //
//   //   let pointer = new Ray({
//   //     initial: () => A,
//   //     terminal: () => Ray.Any.directions.next(A),
//   //   });
//   //
//   //   /**
//   //    *        ____________
//   //    * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
//   //    *       [--A--]            [--B--]            [--C--]
//   //    */
//   //
//   //   expect(pointer.initial.any.js).toBe('A');
//   //
//   //   expect(pointer.initial.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.type).toBe(RayType.TERMINAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   /**
//   //    *             ______________
//   //    * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
//   //    *       [--A--]            [--B--]            [--C--]
//   //    */
//   //   expect(pointer.initial.type).toBe(RayType.TERMINAL);
//   //   expect(pointer.terminal.type).toBe(RayType.INITIAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   /**
//   //    *                    ____________
//   //    * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
//   //    *       [--A--]            [--B--]            [--C--]
//   //    */
//   //   expect(pointer.initial.type).toBe(RayType.INITIAL);
//   //   expect(pointer.terminal.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.any.js).toBe('B');
//   //
//   //   pointer = pointer.step();
//   //
//   //   /**
//   //    *                           ____________
//   //    * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
//   //    *       [--A--]            [--B--]            [--C--]
//   //    */
//   //   expect(pointer.initial.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.type).toBe(RayType.TERMINAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   /**
//   //    *                                ______________
//   //    * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
//   //    *       [--A--]            [--B--]            [--C--]
//   //    */
//   //   expect(pointer.initial.type).toBe(RayType.TERMINAL);
//   //   expect(pointer.terminal.type).toBe(RayType.INITIAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   /**
//   //    *                                       ____________
//   //    * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
//   //    *       [--A--]            [--B--]            [--C--]
//   //    */
//   //   expect(pointer.initial.type).toBe(RayType.INITIAL);
//   //   expect(pointer.terminal.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.any.js).toBe('C');
//   //
//   //   pointer = pointer.step();
//   //
//   //   /**
//   //    *                                              ____________
//   //    * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
//   //    *       [--A--]            [--B--]            [--C--]
//   //    */
//   //   expect(pointer.initial.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.type).toBe(RayType.TERMINAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   /**
//   //    *                                                   _______
//   //    * [  |--]     [--|  ][  |--]     [--|  ][  |--]     [--|  ]
//   //    *       [--A--]            [--B--]            [--C--]
//   //    */
//   //   expect(pointer.initial.type).toBe(RayType.TERMINAL);
//   //   // expect(pointer.terminal.type).toBe(RayType.TERMINAL); ??
//   //   expect(pointer.terminal.is_none()).toBe(true);
//   // });
//   // test("[A, B, C].previous()", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //   const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//   //
//   //   A.compose(B).compose(C);
//   //
//   //   // let pointer = A.step(Ray.directions.next()(A));
//   //
//   //   let pointer = new Ray({
//   //     initial: () => C,
//   //     terminal: () => Ray.Any.directions.previous(C),
//   //   });
//   //
//   //   expect(pointer.initial.any.js).toBe('C');
//   //
//   //   expect(pointer.initial.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.type).toBe(RayType.INITIAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   expect(pointer.initial.type).toBe(RayType.INITIAL);
//   //   expect(pointer.terminal.type).toBe(RayType.TERMINAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   expect(pointer.initial.type).toBe(RayType.TERMINAL);
//   //   expect(pointer.terminal.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.any.js).toBe('B');
//   //
//   //   pointer = pointer.step();
//   //
//   //   expect(pointer.initial.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.type).toBe(RayType.INITIAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   expect(pointer.initial.type).toBe(RayType.INITIAL);
//   //   expect(pointer.terminal.type).toBe(RayType.TERMINAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   expect(pointer.initial.type).toBe(RayType.TERMINAL);
//   //   expect(pointer.terminal.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.any.js).toBe('A');
//   //
//   //   pointer = pointer.step();
//   //
//   //   expect(pointer.initial.type).toBe(RayType.VERTEX);
//   //   expect(pointer.terminal.type).toBe(RayType.INITIAL);
//   //
//   //   pointer = pointer.step();
//   //
//   //   expect(pointer.initial.type).toBe(RayType.INITIAL);
//   //   // expect(pointer.terminal.type).toBe(RayType.TERMINAL); ??
//   //   expect(pointer.terminal.is_none()).toBe(true);
//   // });
//   test("[A, B, C][.has_next(), .has_previous()]", () => {
//     const A = Ray.vertex().o({js: 'A'}).as_reference().o({js: 'A.#'});
//     const B = Ray.vertex().o({js: 'B'}).as_reference().o({js: 'B.#'});
//     const C = Ray.vertex().o({js: 'C'}).as_reference().o({js: 'C.#'});
//
//     A.compose(B).compose(C);
//
//     expect(A.has_next()).toBe(true);
//     expect(A.has_next(Ray.directions.next)).toBe(true);
//     expect(A.has_next(Ray.directions.previous)).toBe(false);
//     expect(A.has_previous()).toBe(false);
//     expect(A.has_previous(Ray.directions.previous)).toBe(false);
//     expect(A.has_previous(Ray.directions.next)).toBe(true);
//
//     expect(B.has_next()).toBe(true);
//     expect(B.has_next(Ray.directions.next)).toBe(true);
//     expect(B.has_next(Ray.directions.previous)).toBe(true);
//     expect(B.has_previous()).toBe(true);
//     expect(B.has_previous(Ray.directions.previous)).toBe(true);
//     expect(B.has_previous(Ray.directions.next)).toBe(true);
//
//     expect(C.has_next()).toBe(false);
//     expect(C.has_next(Ray.directions.next)).toBe(false);
//     expect(C.has_next(Ray.directions.previous)).toBe(true);
//     expect(C.has_previous()).toBe(true);
//     expect(C.has_previous(Ray.directions.previous)).toBe(true);
//     expect(C.has_previous(Ray.directions.next)).toBe(false);
//   });
//   test("[A, B, C][.last(), .first()]", () => {
//     const A = Ray.vertex().o({js: 'A'}).as_reference().o({js: 'A.#'});
//     const B = Ray.vertex().o({js: 'B'}).as_reference().o({js: 'B.#'});
//     const C = Ray.vertex().o({js: 'C'}).as_reference().o({js: 'C.#'});
//
//     A.compose(B).compose(C);
//
//     expect(A.first().any.js).toBe('A');
//     expect(B.first().any.js).toBe('A');
//     expect(C.first().any.js).toBe('A');
//
//     expect(A.last().any.js).toBe('C');
//     expect(B.last().any.js).toBe('C');
//     expect(C.last().any.js).toBe('C');
//   });
//   test("[A, B, C][.at()]", () => {
//     const A = Ray.vertex().o({js: 'A'}).as_reference().o({js: 'A.#'});
//     const B = Ray.vertex().o({js: 'B'}).as_reference().o({js: 'B.#'});
//     const C = Ray.vertex().o({js: 'C'}).as_reference().o({js: 'C.#'});
//
//     A.compose(B).compose(C);
//
//     expect(A.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
//     expect(A.at(-100).is_none()).toBe(true);
//     expect(A.at(-1).is_none()).toBe(true);
//     expect(A.at(0).any.js).toBe('A');
//     expect(A.at(1).any.js).toBe('B');
//     expect(A.at(2).any.js).toBe('C');
//     expect(A.at(3).is_none()).toBe(true);
//     expect(A.at(100).is_none()).toBe(true);
//     expect(A.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);
//
//     expect(B.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
//     expect(B.at(-100).is_none()).toBe(true);
//     expect(B.at(-2).is_none()).toBe(true);
//     expect(B.at(-1).any.js).toBe('A');
//     expect(B.at(0).any.js).toBe('B');
//     expect(B.at(1).any.js).toBe('C');
//     expect(B.at(2).is_none()).toBe(true);
//     expect(B.at(100).is_none()).toBe(true);
//     expect(B.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);
//
//     expect(C.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
//     expect(C.at(-100).is_none()).toBe(true);
//     expect(C.at(-3).is_none()).toBe(true);
//     expect(C.at(-2).any.js).toBe('A');
//     expect(C.at(-1).any.js).toBe('B');
//     expect(C.at(0).any.js).toBe('C');
//     expect(C.at(1).is_none()).toBe(true);
//     expect(C.at(100).is_none()).toBe(true);
//     expect(C.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);
//   });
//   test(".permutation", () => {
//     const A = Ray.permutation(0, 3);
//     const B = Ray.permutation(1, 3);
//     const C = Ray.permutation(2, 3);
//
//     expect(A.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
//     expect(A.at(-100).is_none()).toBe(true);
//     expect(A.at(-1).is_none()).toBe(true);
//
//     expect(A.at(0).is_some()).toBe(true);
//     expect(A.at(1).is_some()).toBe(true);
//     expect(A.at(2).is_some()).toBe(true);
//
//     expect(A.at(3).is_none()).toBe(true);
//     expect(A.at(100).is_none()).toBe(true);
//     expect(A.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);
//
//
//     expect(B.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
//     expect(B.at(-100).is_none()).toBe(true);
//     expect(B.at(-2).is_none()).toBe(true);
//
//     expect(B.at(-1).is_some()).toBe(true);
//     expect(B.at(0).is_some()).toBe(true);
//     expect(B.at(1).is_some()).toBe(true);
//
//     expect(B.at(2).is_none()).toBe(true);
//     expect(B.at(100).is_none()).toBe(true);
//     expect(B.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);
//
//
//     expect(C.at(Number.MIN_VALUE.valueOf()).is_none()).toBe(true);
//     expect(C.at(-100).is_none()).toBe(true);
//     expect(C.at(-3).is_none()).toBe(true);
//
//     expect(C.at(-2).is_some()).toBe(true);
//     expect(C.at(-1).is_some()).toBe(true);
//     expect(C.at(0).is_some()).toBe(true);
//
//     expect(C.at(1).is_none()).toBe(true);
//     expect(C.at(100).is_none()).toBe(true);
//     expect(C.at(Number.MAX_VALUE.valueOf()).is_none()).toBe(true);
//   });
//   test("[A, B, C][.next(), .previous()]", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//
//     expect(A.next().is_none()).toBe(true);
//     expect(A.previous().is_none()).toBe(true);
//
//     A.compose(B).compose(C);
//
//     expect(A.next().is_none()).toBe(false);
//     expect(A.previous().is_none()).toBe(true);
//
//     expect(A.next().next().next().is_none()).toBe(true);
//
//     expect(A.next().type).toBe(RayType.VERTEX);
//     // expect(current.next().any.js).toBe('B.#');  TODO, maybe the ref??
//     expect(A.next().any.js).toBe('B');
//
//     expect(A.next().next().type).toBe(RayType.VERTEX);
//     expect(A.next().next().any.js).toBe('C');
//
//     expect(A.next().previous().any.js).toBe('A');
//     expect(A.next().next().previous().any.js).toBe('B');
//     expect(A.next().next().previous().previous().any.js).toBe('A');
//     expect(A.next().previous().next().next().previous().any.js).toBe('B');
//     expect(A.next().previous().next().next().previous().next().any.js).toBe('C');
//   });
//   test("[A, B, C], [X, Y, Z] ; C.compose(X)", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//
//     const X = Ray.vertex().o({ js: 'X' }).as_reference().o({ js: 'X.#' });
//     const Y = Ray.vertex().o({ js: 'Y' }).as_reference().o({ js: 'Y.#' });
//     const Z = Ray.vertex().o({ js: 'Z' }).as_reference().o({ js: 'Z.#' });
//
//     A.compose(B).compose(C);
//     X.compose(Y).compose(Z);
//
//     C.compose(X);
//
//     expect([...A.all().js]).toEqual(['A', 'B', 'C', 'X', 'Y', 'Z']);
//     expect([...Z.all(Ray.directions.previous).js]).toEqual(['Z', 'Y', 'X', 'C', 'B', 'A']);
//     expect([...X.all(Ray.directions.previous).js]).toEqual(['X', 'C', 'B', 'A']);
//     expect([...X.all().js]).toEqual(['X', 'Y', 'Z']);
//   });
//   // test("[A, B, C], [X, Y, Z] ; B.compose(X)", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //   const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//   //
//   //   const X = Ray.vertex().o({ js: 'X' }).as_reference().o({ js: 'X.#' });
//   //   const Y = Ray.vertex().o({ js: 'Y' }).as_reference().o({ js: 'Y.#' });
//   //   const Z = Ray.vertex().o({ js: 'Z' }).as_reference().o({ js: 'Z.#' });
//   //
//   //   A.compose(B).compose(C);
//   //   X.compose(Y).compose(Z);
//   //
//   //   B.compose(X);
//   //
//   //   // expect([...A.all().js]).toEqual(['A', 'B', 'C', 'X', 'Y', 'Z']);
//   //   // expect([...Z.all(Ray.directions.previous).js]).toEqual(['Z', 'Y', 'X', 'C', 'B', 'A']);
//   //   // expect([...X.all(Ray.directions.previous).js]).toEqual(['X', 'C', 'B', 'A']);
//   //   // expect([...X.all().js]).toEqual(['X', 'Y', 'Z']);
//   // });
//   test("[A, [X, Y, Z].initial, B, C][.next(), .previous()]", () => {
//     // /**
//     //  *         |       |
//     //  * |-- A --|       |-- B --|-- C --|
//     //  *         |   \   |
//     //  *         |-- X --|
//     //  *         |   \   |
//     //  *         |-- Y --|
//     //  *         |   \   |
//     //  *         |-- Z --|
//     //  *         |   \   |               (Destroys the '\' connections) TODO: This should be optional/more complexly constructed
//     //  */
//     // const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     // const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     // const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//     //
//     // const X = Ray.vertex().o({ js: 'X' }).as_reference().o({ js: 'X.#' });
//     // const Y = Ray.vertex().o({ js: 'Y' }).as_reference().o({ js: 'Y.#' });
//     // const Z = Ray.vertex().o({ js: 'Z' }).as_reference().o({ js: 'Z.#' });
//     //
//     // X.compose(Y).compose(Z);
//     //
//     // const ret = A.compose(X.follow(Ray.directions.previous));
//
//
//
//     // /**
//     //  *         |
//     //  * |-- A --|
//     //  *         |       \  <-- '\' is 'ret'
//     //  *         |-- X --|
//     //  *         |       \
//     //  *         |-- Y --|
//     //  *         |       \
//     //  *         |-- Z --|
//     //  *         |       \
//     //  */
//     // expect(ret.type).toBe(RayType.INITIAL);
//     // expect(ret.follow().is_none()).toBe(false);
//     // expect([...ret.follow()].map(
//     //   return_ref => return_ref.type
//     // )).toEqual([RayType.VERTEX, RayType.VERTEX, RayType.VERTEX]);
//     // expect([...ret.follow()].map(
//     //   return_ref => return_ref.self.type
//     // )).toEqual([RayType.TERMINAL, RayType.TERMINAL, RayType.TERMINAL]);
//     // expect([...ret.follow()].map(
//     //   return_ref => {
//     //     const return_vertex = return_ref.self;
//     //     const terminal = return_vertex.self;
//     //     const continued_vertex = terminal.initial;
//     //
//     //     return continued_vertex.any.js;
//     //   }
//     // )).toEqual(['X', 'Y', 'Z']);
//     // expect([...ret.follow()].map(
//     //   return_ref => {
//     //     const vertex = return_ref.self;
//     //     const terminal = vertex.self;
//     //
//     //     return terminal.self.as_reference().is_none();
//     //   }
//     // )).toEqual([true, true, true]); // From the perspective of the 'terminal' it's ignorant of 'ret'.
//     //
//     // expect(A.next().type).toBe(RayType.INITIAL);
//     //
//     // /**
//     //  *         |       |
//     //  * |-- A --|       |-- B --|-- C --|
//     //  *         |       |
//     //  *         |-- X --|
//     //  *         |       |
//     //  *         |-- Y --|
//     //  *         |       |
//     //  *         |-- Z --|
//     //  *         |       |
//     //  */
//     // ret.compose(B).compose(C);
//     //
//
//   });
//   // test(".None.#.equivalent(.None.#)", () => {
//   //   const A = Ray.None().o({ js: 'A' }).as_reference(); // TODO Tagging the 'NONE' vertices here is incredibly inconsistent, but just to demonstrate the test.
//   //   const B = Ray.None().o({ js: 'B' }).as_reference();
//   //
//   //   expect(A.type).toBe(RayType.VERTEX);
//   //   expect(B.type).toBe(RayType.VERTEX);
//   //
//   //   expect(A.is_none()).toBe(true);
//   //   expect(A.any.js).toBe('A');
//   //   expect(A.self.any.js).toBe('A');
//   //   expect(A.self.self.any.js).toBe('A');
//   //
//   //   expect(B.is_none()).toBe(true);
//   //   expect(B.any.js).toBe('B');
//   //   expect(B.self.any.js).toBe('B');
//   //   expect(B.self.self.any.js).toBe('B');
//   //
//   //   A.equivalent(B);
//   //
//   //   expect(A.type).toBe(RayType.REFERENCE); // Turns A into a reference to B.
//   //   expect(B.type).toBe(RayType.REFERENCE); // Turns B into a reference to A.
//   //
//   //   expect(A.is_none()).toBe(false);
//   //   expect(A.any.js).toBe('A');
//   //   expect(A.self.any.js).toBe('B');
//   //   expect(A.self.self.any.js).toBe('A');
//   //
//   //   expect(B.is_none()).toBe(false);
//   //   expect(B.any.js).toBe('B');
//   //   expect(B.self.any.js).toBe('A');
//   //   expect(B.self.self.any.js).toBe('B');
//   // });
//   test(".vertex.#.equivalent(.vertex.#)", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//
//     expect(A.type).toBe(RayType.VERTEX);
//     expect(B.type).toBe(RayType.VERTEX);
//     expect(A.as_reference().any.js).toBe('A.#');
//     expect(B.as_reference().any.js).toBe('B.#');
//
//     expect(A.is_none()).toBe(false);
//     expect(A.dereference.is_none()).toBe(true);
//
//     expect(B.is_none()).toBe(false);
//     expect(B.dereference.is_none()).toBe(true);
//
//     A.equivalent(B);
//
//     expect(A.type).toBe(RayType.VERTEX);
//     expect(A.self.type).toBe(RayType.VERTEX);
//     expect(A.is_none()).toBe(false);
//     expect(A.any.js).toBe('A');
//     expect(A.self.any.js).toBe('___as_vertex');
//     expect(A.self.self.any.js).toBe('A');
//     expect([...A.self.traverse()].map(ref => ref.self.any.js)).toEqual(['A', 'B']);
//     expect([...A.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['A']);
//
//     expect(B.type).toBe(RayType.VERTEX);
//     expect(B.self.type).toBe(RayType.VERTEX);
//     expect(B.is_none()).toBe(false);
//     expect(B.any.js).toBe('B');
//     expect(B.self.any.js).toBe('___as_vertex');
//     expect(B.self.self.any.js).toBe('B');
//     expect([...B.self.traverse()].map(ref => ref.self.any.js)).toEqual(['B']);
//     expect([...B.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['B', 'A']);
//   });
//   test("([ABC], [XYZ], [IJK], [QRS]) ; B.equiv(Y).equiv(J).equiv(R)", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//
//     const X = Ray.vertex().o({ js: 'X' }).as_reference().o({ js: 'X.#' });
//     const Y = Ray.vertex().o({ js: 'Y' }).as_reference().o({ js: 'Y.#' });
//     const Z = Ray.vertex().o({ js: 'Z' }).as_reference().o({ js: 'Z.#' });
//
//     const I = Ray.vertex().o({ js: 'I' }).as_reference().o({ js: 'I.#' });
//     const J = Ray.vertex().o({ js: 'J' }).as_reference().o({ js: 'J.#' });
//     const K = Ray.vertex().o({ js: 'K' }).as_reference().o({ js: 'K.#' });
//
//     const Q = Ray.vertex().o({ js: 'Q' }).as_reference().o({ js: 'Q.#' });
//     const R = Ray.vertex().o({ js: 'R' }).as_reference().o({ js: 'R.#' });
//     const S = Ray.vertex().o({ js: 'S' }).as_reference().o({ js: 'S.#' });
//
//     A.compose(B).compose(C);
//     X.compose(Y).compose(Z);
//     I.compose(J).compose(K);
//     Q.compose(R).compose(S);
//
//     // BEFORE .equivalent
//       expect([...A.all().js]).toEqual(['A', 'B', 'C']);
//       expect([...A.all(Ray.directions.previous).js]).toEqual(['A']);
//       expect([...B.all().js]).toEqual(['B', 'C']);
//       expect([...B.all(Ray.directions.previous).js]).toEqual(['B', 'A']);
//       expect([...C.all().js]).toEqual(['C']);
//       expect([...C.all(Ray.directions.previous).js]).toEqual(['C', 'B', 'A']);
//
//       expect([...X.all().js]).toEqual(['X', 'Y', 'Z']);
//       expect([...X.all(Ray.directions.previous).js]).toEqual(['X']);
//       expect([...Y.all().js]).toEqual(['Y', 'Z']);
//       expect([...Y.all(Ray.directions.previous).js]).toEqual(['Y', 'X']);
//       expect([...Z.all().js]).toEqual(['Z']);
//       expect([...Z.all(Ray.directions.previous).js]).toEqual(['Z', 'Y', 'X']);
//
//       expect([...I.all().js]).toEqual(['I', 'J', 'K']);
//       expect([...I.all(Ray.directions.previous).js]).toEqual(['I']);
//       expect([...J.all().js]).toEqual(['J', 'K']);
//       expect([...J.all(Ray.directions.previous).js]).toEqual(['J', 'I']);
//       expect([...K.all().js]).toEqual(['K']);
//       expect([...K.all(Ray.directions.previous).js]).toEqual(['K', 'J', 'I']);
//
//       expect([...Q.all().js]).toEqual(['Q', 'R', 'S']);
//       expect([...Q.all(Ray.directions.previous).js]).toEqual(['Q']);
//       expect([...R.all().js]).toEqual(['R', 'S']);
//       expect([...R.all(Ray.directions.previous).js]).toEqual(['R', 'Q']);
//       expect([...S.all().js]).toEqual(['S']);
//       expect([...S.all(Ray.directions.previous).js]).toEqual(['S', 'R', 'Q']);
//
//     /**
//      * Drawing an equivalence between `B -> Y -> J -> R`. (Doesn't need to hold in some more abstract sense, it's just a line)
//      *           |
//      * [--A--][--B--][--C--]
//      *           |
//      * [--X--][--Y--][--Z--]
//      *           |
//      * [--I--][--J--][--K--]
//      *           |
//      * [--Q--][--R--][--S--]
//      *           |
//      */
//     B.equivalent(Y).equivalent(J).equivalent(R);
//
//     // TODO: Bug is from one empty side.
//     // TODO: Still one bug, J.# ->, makes the equiv(R) a parallel composition, so something is TERMINAL/INITIAL -> VERTEX
//
//     // AFTER .equivalent (Ensure the composed vertices didn't change in their respective directions)
//       expect([...A.all().js]).toEqual(['A', 'B', 'C']);
//       expect([...A.all(Ray.directions.previous).js]).toEqual(['A']);
//       expect([...B.all().js]).toEqual(['B', 'C']);
//       expect([...B.all(Ray.directions.previous).js]).toEqual(['B', 'A']);
//       expect([...C.all().js]).toEqual(['C']);
//       expect([...C.all(Ray.directions.previous).js]).toEqual(['C', 'B', 'A']);
//
//       expect([...X.all().js]).toEqual(['X', 'Y', 'Z']);
//       expect([...X.all(Ray.directions.previous).js]).toEqual(['X']);
//       expect([...Y.all().js]).toEqual(['Y', 'Z']);
//       expect([...Y.all(Ray.directions.previous).js]).toEqual(['Y', 'X']);
//       expect([...Z.all().js]).toEqual(['Z']);
//       expect([...Z.all(Ray.directions.previous).js]).toEqual(['Z', 'Y', 'X']);
//
//       expect([...I.all().js]).toEqual(['I', 'J', 'K']);
//       expect([...I.all(Ray.directions.previous).js]).toEqual(['I']);
//       expect([...J.all().js]).toEqual(['J', 'K']);
//       expect([...J.all(Ray.directions.previous).js]).toEqual(['J', 'I']);
//       expect([...K.all().js]).toEqual(['K']);
//       expect([...K.all(Ray.directions.previous).js]).toEqual(['K', 'J', 'I']);
//
//       expect([...Q.all().js]).toEqual(['Q', 'R', 'S']);
//       expect([...Q.all(Ray.directions.previous).js]).toEqual(['Q']);
//       expect([...R.all().js]).toEqual(['R', 'S']);
//       expect([...R.all(Ray.directions.previous).js]).toEqual(['R', 'Q']);
//       expect([...S.all().js]).toEqual(['S']);
//       expect([...S.all(Ray.directions.previous).js]).toEqual(['S', 'R', 'Q']);
//
//     // But they should be connected through their .vertex/.self:
//       expect(B.dereference.is_none()).toBe(false);
//       expect(B.dereference.type).toBe(RayType.VERTEX);
//       expect(B.dereference.self).not.toBe(B.self);
//       expect(B.dereference.self.any.js).toBe('B');
//       expect(B.dereference.any.js).toBe('___as_vertex');
//       expect([...B.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['B']);
//       expect([...B.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['B', 'Y', 'J', 'R']);
//
//       expect(Y.dereference.is_none()).toBe(false);
//       expect(Y.dereference.type).toBe(RayType.VERTEX);
//       expect(Y.dereference.self).not.toBe(Y.self);
//       expect(Y.dereference.self.any.js).toBe('Y');
//       expect(Y.dereference.any.js).toBe('___as_vertex');
//       expect([...Y.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['Y', 'B']);
//       expect([...Y.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['Y', 'J', 'R']);
//
//       expect(J.dereference.is_none()).toBe(false);
//       expect(J.dereference.type).toBe(RayType.VERTEX);
//       expect(J.dereference.self).not.toBe(J.self);
//       expect(J.dereference.self.any.js).toBe('J');
//       expect(J.dereference.any.js).toBe('___as_vertex');
//       expect([...J.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['J', 'Y', 'B']);
//       expect([...J.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['J', 'R']);
//
//       expect(R.dereference.is_none()).toBe(false);
//       expect(R.dereference.type).toBe(RayType.VERTEX);
//       expect(R.dereference.self).not.toBe(R.self);
//       expect(R.dereference.self.any.js).toBe('R');
//       expect(R.dereference.any.js).toBe('___as_vertex');
//       expect([...R.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['R', 'J', 'Y', 'B']);
//       expect([...R.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['R']);
//   });
//   test("([ABC], [XYZ], [IJK]]) ; B.equiv(Y).equiv(J)", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//
//     const X = Ray.vertex().o({ js: 'X' }).as_reference().o({ js: 'X.#' });
//     const Y = Ray.vertex().o({ js: 'Y' }).as_reference().o({ js: 'Y.#' });
//     const Z = Ray.vertex().o({ js: 'Z' }).as_reference().o({ js: 'Z.#' });
//
//     const I = Ray.vertex().o({ js: 'I' }).as_reference().o({ js: 'I.#' });
//     const J = Ray.vertex().o({ js: 'J' }).as_reference().o({ js: 'J.#' });
//     const K = Ray.vertex().o({ js: 'K' }).as_reference().o({ js: 'K.#' });
//
//     A.compose(B).compose(C);
//     X.compose(Y).compose(Z);
//     I.compose(J).compose(K);
//
//     // BEFORE .equivalent
//       expect([...A.all().js]).toEqual(['A', 'B', 'C']);
//       expect([...A.all(Ray.directions.previous).js]).toEqual(['A']);
//       expect([...B.all().js]).toEqual(['B', 'C']);
//       expect([...B.all(Ray.directions.previous).js]).toEqual(['B', 'A']);
//       expect([...C.all().js]).toEqual(['C']);
//       expect([...C.all(Ray.directions.previous).js]).toEqual(['C', 'B', 'A']);
//
//       expect([...X.all().js]).toEqual(['X', 'Y', 'Z']);
//       expect([...X.all(Ray.directions.previous).js]).toEqual(['X']);
//       expect([...Y.all().js]).toEqual(['Y', 'Z']);
//       expect([...Y.all(Ray.directions.previous).js]).toEqual(['Y', 'X']);
//       expect([...Z.all().js]).toEqual(['Z']);
//       expect([...Z.all(Ray.directions.previous).js]).toEqual(['Z', 'Y', 'X']);
//
//       expect([...I.all().js]).toEqual(['I', 'J', 'K']);
//       expect([...I.all(Ray.directions.previous).js]).toEqual(['I']);
//       expect([...J.all().js]).toEqual(['J', 'K']);
//       expect([...J.all(Ray.directions.previous).js]).toEqual(['J', 'I']);
//       expect([...K.all().js]).toEqual(['K']);
//       expect([...K.all(Ray.directions.previous).js]).toEqual(['K', 'J', 'I']);
//
//     /**
//      * Drawing an equivalence between `B -> Y -> J`. (Doesn't need to hold in some more abstract sense, it's just a line)
//      *           |
//      * [--A--][--B--][--C--]
//      *           |
//      * [--X--][--Y--][--Z--]
//      *           |
//      * [--I--][--J--][--K--]
//      *           |
//      */
//     B.equivalent(Y).equivalent(J);
//
//     // AFTER .equivalent (Ensure the composed vertices didn't change in their respective directions)
//       expect([...A.all().js]).toEqual(['A', 'B', 'C']);
//       expect([...A.all(Ray.directions.previous).js]).toEqual(['A']);
//       expect([...B.all().js]).toEqual(['B', 'C']);
//       expect([...B.all(Ray.directions.previous).js]).toEqual(['B', 'A']);
//       expect([...C.all().js]).toEqual(['C']);
//       expect([...C.all(Ray.directions.previous).js]).toEqual(['C', 'B', 'A']);
//
//       expect([...X.all().js]).toEqual(['X', 'Y', 'Z']);
//       expect([...X.all(Ray.directions.previous).js]).toEqual(['X']);
//       expect([...Y.all().js]).toEqual(['Y', 'Z']);
//       expect([...Y.all(Ray.directions.previous).js]).toEqual(['Y', 'X']);
//       expect([...Z.all().js]).toEqual(['Z']);
//       expect([...Z.all(Ray.directions.previous).js]).toEqual(['Z', 'Y', 'X']);
//
//       expect([...I.all().js]).toEqual(['I', 'J', 'K']);
//       expect([...I.all(Ray.directions.previous).js]).toEqual(['I']);
//       expect([...J.all().js]).toEqual(['J', 'K']);
//       expect([...J.all(Ray.directions.previous).js]).toEqual(['J', 'I']);
//       expect([...K.all().js]).toEqual(['K']);
//       expect([...K.all(Ray.directions.previous).js]).toEqual(['K', 'J', 'I']);
//
//     // But they should be connected through their .vertex/.self:
//       expect(B.dereference.is_none()).toBe(false);
//       expect(B.dereference.type).toBe(RayType.VERTEX);
//       expect(B.dereference.self).not.toBe(B.self);
//       expect(B.dereference.self.any.js).toBe('B');
//       expect(B.dereference.any.js).toBe('___as_vertex');
//       expect([...B.dereference.traverse(Ray.directions.previous)].length).toBe(1);
//       expect([...B.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['B', 'Y', 'J']);
//
//       expect(Y.dereference.is_none()).toBe(false);
//       expect(Y.dereference.type).toBe(RayType.VERTEX);
//       expect(Y.dereference.self).not.toBe(Y.self);
//       expect(Y.dereference.self.any.js).toBe('Y');
//       expect(Y.dereference.any.js).toBe('___as_vertex');
//       expect([...Y.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['Y', 'B']);
//       expect([...Y.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['Y', 'J']);
//
//       expect(J.dereference.is_none()).toBe(false);
//       expect(J.dereference.type).toBe(RayType.VERTEX);
//       expect(J.dereference.self).not.toBe(J.self);
//       expect(J.dereference.self.any.js).toBe('J');
//       expect(J.dereference.any.js).toBe('___as_vertex');
//       expect([...J.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['J', 'Y', 'B']);
//       expect([...J.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['J']);
//   });
//   test("([ABC], [XYZ], [IJK], [QRS]) ; B.equiv(Y) ; J.equiv(J) ; Y.equiv(J)", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//
//     const X = Ray.vertex().o({ js: 'X' }).as_reference().o({ js: 'X.#' });
//     const Y = Ray.vertex().o({ js: 'Y' }).as_reference().o({ js: 'Y.#' });
//     const Z = Ray.vertex().o({ js: 'Z' }).as_reference().o({ js: 'Z.#' });
//
//     const I = Ray.vertex().o({ js: 'I' }).as_reference().o({ js: 'I.#' });
//     const J = Ray.vertex().o({ js: 'J' }).as_reference().o({ js: 'J.#' });
//     const K = Ray.vertex().o({ js: 'K' }).as_reference().o({ js: 'K.#' });
//
//     const Q = Ray.vertex().o({ js: 'Q' }).as_reference().o({ js: 'Q.#' });
//     const R = Ray.vertex().o({ js: 'R' }).as_reference().o({ js: 'R.#' });
//     const S = Ray.vertex().o({ js: 'S' }).as_reference().o({ js: 'S.#' });
//
//     A.compose(B).compose(C);
//     X.compose(Y).compose(Z);
//     I.compose(J).compose(K);
//     Q.compose(R).compose(S);
//
//     // BEFORE .equivalent
//       expect([...A.all().js]).toEqual(['A', 'B', 'C']);
//       expect([...A.all(Ray.directions.previous).js]).toEqual(['A']);
//       expect([...B.all().js]).toEqual(['B', 'C']);
//       expect([...B.all(Ray.directions.previous).js]).toEqual(['B', 'A']);
//       expect([...C.all().js]).toEqual(['C']);
//       expect([...C.all(Ray.directions.previous).js]).toEqual(['C', 'B', 'A']);
//
//       expect([...X.all().js]).toEqual(['X', 'Y', 'Z']);
//       expect([...X.all(Ray.directions.previous).js]).toEqual(['X']);
//       expect([...Y.all().js]).toEqual(['Y', 'Z']);
//       expect([...Y.all(Ray.directions.previous).js]).toEqual(['Y', 'X']);
//       expect([...Z.all().js]).toEqual(['Z']);
//       expect([...Z.all(Ray.directions.previous).js]).toEqual(['Z', 'Y', 'X']);
//
//       expect([...I.all().js]).toEqual(['I', 'J', 'K']);
//       expect([...I.all(Ray.directions.previous).js]).toEqual(['I']);
//       expect([...J.all().js]).toEqual(['J', 'K']);
//       expect([...J.all(Ray.directions.previous).js]).toEqual(['J', 'I']);
//       expect([...K.all().js]).toEqual(['K']);
//       expect([...K.all(Ray.directions.previous).js]).toEqual(['K', 'J', 'I']);
//
//       expect([...Q.all().js]).toEqual(['Q', 'R', 'S']);
//       expect([...Q.all(Ray.directions.previous).js]).toEqual(['Q']);
//       expect([...R.all().js]).toEqual(['R', 'S']);
//       expect([...R.all(Ray.directions.previous).js]).toEqual(['R', 'Q']);
//       expect([...S.all().js]).toEqual(['S']);
//       expect([...S.all(Ray.directions.previous).js]).toEqual(['S', 'R', 'Q']);
//
//     /**
//      * Drawing an equivalence between `B -> Y -> J -> R`. (Doesn't need to hold in some more abstract sense, it's just a line)
//      *           |
//      * [--A--][--B--][--C--]
//      *           |
//      * [--X--][--Y--][--Z--]
//      *           |
//      * [--I--][--J--][--K--]
//      *           |
//      * [--Q--][--R--][--S--]
//      *           |
//      */
//     B.equivalent(Y);
//     J.equivalent(R);
//     Y.equivalent(J);
//
//     // AFTER .equivalent (Ensure the composed vertices didn't change in their respective directions)
//       expect([...A.all().js]).toEqual(['A', 'B', 'C']);
//       expect([...A.all(Ray.directions.previous).js]).toEqual(['A']);
//       expect([...B.all().js]).toEqual(['B', 'C']);
//       expect([...B.all(Ray.directions.previous).js]).toEqual(['B', 'A']);
//       expect([...C.all().js]).toEqual(['C']);
//       expect([...C.all(Ray.directions.previous).js]).toEqual(['C', 'B', 'A']);
//
//       expect([...X.all().js]).toEqual(['X', 'Y', 'Z']);
//       expect([...X.all(Ray.directions.previous).js]).toEqual(['X']);
//       expect([...Y.all().js]).toEqual(['Y', 'Z']);
//       expect([...Y.all(Ray.directions.previous).js]).toEqual(['Y', 'X']);
//       expect([...Z.all().js]).toEqual(['Z']);
//       expect([...Z.all(Ray.directions.previous).js]).toEqual(['Z', 'Y', 'X']);
//
//       expect([...I.all().js]).toEqual(['I', 'J', 'K']);
//       expect([...I.all(Ray.directions.previous).js]).toEqual(['I']);
//       expect([...J.all().js]).toEqual(['J', 'K']);
//       expect([...J.all(Ray.directions.previous).js]).toEqual(['J', 'I']);
//       expect([...K.all().js]).toEqual(['K']);
//       expect([...K.all(Ray.directions.previous).js]).toEqual(['K', 'J', 'I']);
//
//       expect([...Q.all().js]).toEqual(['Q', 'R', 'S']);
//       expect([...Q.all(Ray.directions.previous).js]).toEqual(['Q']);
//       expect([...R.all().js]).toEqual(['R', 'S']);
//       expect([...R.all(Ray.directions.previous).js]).toEqual(['R', 'Q']);
//       expect([...S.all().js]).toEqual(['S']);
//       expect([...S.all(Ray.directions.previous).js]).toEqual(['S', 'R', 'Q']);
//
//     // But they should be connected through their .vertex/.self:
//       expect(B.dereference.is_none()).toBe(false);
//       expect(B.dereference.type).toBe(RayType.VERTEX);
//       expect(B.dereference.self).not.toBe(B.self);
//       expect(B.dereference.self.any.js).toBe('B');
//       expect(B.dereference.any.js).toBe('___as_vertex');
//       expect([...B.dereference.traverse(Ray.directions.previous)].length).toBe(1);
//       expect([...B.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['B', 'Y', 'J', 'R']);
//
//       expect(Y.dereference.is_none()).toBe(false);
//       expect(Y.dereference.type).toBe(RayType.VERTEX);
//       expect(Y.dereference.self).not.toBe(Y.self);
//       expect(Y.dereference.self.any.js).toBe('Y');
//       expect(Y.dereference.any.js).toBe('___as_vertex');
//       expect([...Y.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['Y', 'B']);
//       expect([...Y.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['Y', 'J', 'R']);
//
//       expect(J.dereference.is_none()).toBe(false);
//       expect(J.dereference.type).toBe(RayType.VERTEX);
//       expect(J.dereference.self).not.toBe(J.self);
//       expect(J.dereference.self.any.js).toBe('J');
//       expect(J.dereference.any.js).toBe('___as_vertex');
//       expect([...J.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['J', 'Y', 'B']);
//       expect([...J.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['J', 'R']);
//
//       expect(R.dereference.is_none()).toBe(false);
//       expect(R.dereference.type).toBe(RayType.VERTEX);
//       expect(R.dereference.self).not.toBe(R.self);
//       expect(R.dereference.self.any.js).toBe('R');
//       expect(R.dereference.any.js).toBe('___as_vertex');
//       expect([...R.dereference.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['R', 'J', 'Y', 'B']);
//       expect([...R.dereference.traverse()].map(ref => ref.self.any.js)).toEqual(['R']);
//   });
//   // test("(A:terminal.# = B:initial.#) ; A.as_terminal", () => {
//   //   const A_terminal = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' }).follow();
//   //   const B_initial = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' }).follow(Ray.directions.previous);
//   //
//   //   /**
//   //    *    A    ____________    B
//   //    * [--|--][--|  ][  |--][--|--]
//   //    */
//   //   A_terminal.equivalent(B_initial);
//   //
//   //   /**
//   //    *           |
//   //    *        [  |--][--B--]
//   //    *           |
//   //    * [--A--][--|  ]         <--- ret
//   //    *           |
//   //    */
//   //   const ret = A_terminal.as_terminal();
//   //   expect(ret.type).toBe(RayType.TERMINAL);
//   //
//   //   expect([...A_terminal.dereference.all().js]).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...A_terminal.dereference.___map(ref => ref.self.follow_direction().any.js)]).toEqual(['A', 'B']);
//   // });
//   // test("(A:terminal.# = B:initial.# = C:initial.#) ; A.as_terminal", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const A_terminal = A.follow();
//   //   const B_initial = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' }).follow(Ray.directions.previous);
//   //   const C_initial = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' }).follow(Ray.directions.previous);
//   //   const D_initial = Ray.vertex().o({ js: 'D' }).as_reference().o({ js: 'D.#' }).follow(Ray.directions.previous);
//   //
//   //   /**
//   //    *    A    ____________    B
//   //    * [--|--][--|  ][  |--][--|--]
//   //    */
//   //   A_terminal.equivalent(B_initial);
//   //
//   //   expect([...A_terminal.dereference.all().js]).toEqual(['B']);
//   //   expect([...A_terminal.dereference.___map(ref => ref.any.js)]).toEqual(['B']);
//   //
//   //   expect([...B_initial.dereference.all(Ray.directions.previous).js]).toEqual(['A']);
//   //   expect([...B_initial.dereference.___map(ref => ref.any.js, { step: Ray.Any.directions.previous})]).toEqual(['A']);
//   //
//   //   /**
//   //    *           |
//   //    * [--A--][--|  ]
//   //    *           |
//   //    *        [  |--][--B--]
//   //    *           |
//   //    *        [  |--][--C--]
//   //    *           |
//   //    */
//   //   A_terminal.equivalent(C_initial);
//   //
//   //   expect([...A_terminal.dereference.all().js]).toEqual(['___as_vertex', '___as_vertex', '___as_vertex']);
//   //   expect([...A_terminal.dereference.___map(ref => ref.self.follow_direction().any.js)]).toEqual(['A', 'B', 'C']);
//   //
//   //   /**
//   //    *           |
//   //    * [--A--][--|  ]
//   //    *           |
//   //    *        [  |--][--B--]
//   //    *           |
//   //    *        [  |--][--C--]
//   //    *           |
//   //    *        [  |--][--D--]
//   //    *           |
//   //    */
//   //   A_terminal.equivalent(D_initial);
//   //
//   //   expect([...A_terminal.dereference.all().js]).toEqual(['___as_vertex', '___as_vertex', '___as_vertex', '___as_vertex']);
//   //   expect([...A_terminal.dereference.___map(ref => ref.self.follow_direction().any.js)]).toEqual(['A', 'B', 'C', 'D']);
//   //   expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D']);
//   // });
//   // test("(A:vertex.# = B:vertex.#) ; B.as_terminal", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //
//   //   A.equivalent(B);
//   //
//   //   const terminal = B.as_terminal();
//   //
//   //   expect(terminal.type).toBe(RayType.TERMINAL);
//   //
//   //   expect([...terminal.follow(Ray.directions.previous).all(Ray.directions.previous).js]).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...terminal.follow(Ray.directions.previous).traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['B', 'A']);
//   //
//   //   /**
//   //    * These should keep looping...
//   //    * TODO: Better test helper for this
//   //    */
//   //   expect([...terminal.follow(Ray.directions.previous).traverse(Ray.directions.previous)].map(ref => ref.self.self.any.js)).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...terminal.follow(Ray.directions.previous).traverse(Ray.directions.previous)].map(ref => ref.self.self.self.any.js)).toEqual(['B', 'A']);
//   //   expect([...terminal.follow(Ray.directions.previous).traverse(Ray.directions.previous)].map(ref => ref.self.self.self.self.any.js)).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...terminal.follow(Ray.directions.previous).traverse(Ray.directions.previous)].map(ref => ref.self.self.self.self.self.any.js)).toEqual(['B', 'A']);
//   // });
//   // test("(A:vertex.# = B:vertex.#) ; A.as_initial", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //
//   //   A.equivalent(B);
//   //
//   //   const initial = A.as_initial();
//   //
//   //   expect(initial.type).toBe(RayType.INITIAL);
//   //
//   //   expect([...initial.follow().all(Ray.directions.next).js]).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.any.js)).toEqual(['A', 'B']);
//   //
//   //   /**
//   //    * These should keep looping...
//   //    * TODO: Better test helper for this
//   //    */
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.self.any.js)).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.self.self.any.js)).toEqual(['A', 'B']);
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.self.self.self.any.js)).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.self.self.self.self.any.js)).toEqual(['A', 'B']);
//   // });
//   // test("(A:vertex.# = B:vertex.#) ; B.as_initial", () => {
//   //   const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //
//   //   A.equivalent(B);
//   //
//   //   const initial = B.as_initial();
//   //
//   //   expect(initial.type).toBe(RayType.INITIAL);
//   //
//   //   expect([...initial.follow().all(Ray.directions.next).js]).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.any.js)).toEqual(['B', 'A']);
//   //
//   //   /**
//   //    * These should keep looping...
//   //    * TODO: Better test helper for this
//   //    */
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.self.any.js)).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.self.self.any.js)).toEqual(['B', 'A']);
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.self.self.self.any.js)).toEqual(['___as_vertex', '___as_vertex']);
//   //   expect([...initial.follow().traverse(Ray.directions.next)].map(ref => ref.self.self.self.self.self.any.js)).toEqual(['B', 'A']);
//   // });
//   test("A.equiv(B).equiv(C)", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//
//     A.equivalent(B).equivalent(C);
//
//     expect(A.type).toBe(RayType.VERTEX);
//     expect(A.self.type).toBe(RayType.VERTEX);
//
//     expect(A.is_none()).toBe(false);
//     expect(A.any.js).toBe('A');
//     expect(A.self.any.js).toBe('___as_vertex');
//     expect(A.self.self.any.js).toBe('A');
//     expect([...A.self.traverse()].map(ref => ref.self.any.js)).toEqual(['A', 'B', 'C']);
//     expect([...A.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['A']);
//
//     expect(B.type).toBe(RayType.VERTEX);
//     expect(B.self.type).toBe(RayType.VERTEX);
//     expect(B.is_none()).toBe(false);
//     expect(B.any.js).toBe('B');
//     expect(B.self.any.js).toBe('___as_vertex');
//     expect(B.self.self.any.js).toBe('B');
//     expect([...B.self.traverse()].map(ref => ref.self.any.js)).toEqual(['B', 'C']);
//     expect([...B.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['B', 'A']);
//
//     expect(C.type).toBe(RayType.VERTEX);
//     expect(C.self.type).toBe(RayType.VERTEX);
//     expect(C.is_none()).toBe(false);
//     expect(C.any.js).toBe('C');
//     expect(C.self.any.js).toBe('___as_vertex');
//     expect(C.self.self.any.js).toBe('C');
//     expect([...C.self.traverse()].map(ref => ref.self.any.js)).toEqual(['C']);
//     expect([...C.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['C', 'B', 'A']);
//   });
//   test("A.equiv(B).equiv(C).equiv(D).equiv(E).equiv(F) ; different order", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//     const D = Ray.vertex().o({ js: 'D' }).as_reference().o({ js: 'D.#' });
//     const E = Ray.vertex().o({ js: 'E' }).as_reference().o({ js: 'E.#' });
//     const F = Ray.vertex().o({ js: 'F' }).as_reference().o({ js: 'F.#' });
//
//     A.equivalent(B).equivalent(C).equivalent(D);
//     D.equivalent(E).equivalent(F);
//
//
//     expect(A.type).toBe(RayType.VERTEX);
//     expect(A.self.type).toBe(RayType.VERTEX);
//     expect(A.is_none()).toBe(false);
//     expect(A.any.js).toBe('A');
//     expect(A.self.any.js).toBe('___as_vertex');
//     expect(A.self.self.any.js).toBe('A');
//     expect([...A.self.traverse()].map(ref => ref.self.any.js)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
//     expect([...A.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['A']);
//
//     expect(B.type).toBe(RayType.VERTEX);
//     expect(B.self.type).toBe(RayType.VERTEX);
//     expect(B.is_none()).toBe(false);
//     expect(B.any.js).toBe('B');
//     expect(B.self.any.js).toBe('___as_vertex');
//     expect(B.self.self.any.js).toBe('B');
//     expect([...B.self.traverse()].map(ref => ref.self.any.js)).toEqual(['B', 'C', 'D', 'E', 'F']);
//     expect([...B.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['B', 'A']);
//
//     expect(C.type).toBe(RayType.VERTEX);
//     expect(C.self.type).toBe(RayType.VERTEX);
//     expect(C.is_none()).toBe(false);
//     expect(C.any.js).toBe('C');
//     expect(C.self.any.js).toBe('___as_vertex');
//     expect(C.self.self.any.js).toBe('C');
//     expect([...C.self.traverse()].map(ref => ref.self.any.js)).toEqual(['C', 'D', 'E', 'F']);
//     expect([...C.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['C', 'B', 'A']);
//
//     expect(D.type).toBe(RayType.VERTEX);
//     expect(D.self.type).toBe(RayType.VERTEX);
//     expect(D.is_none()).toBe(false);
//     expect(D.any.js).toBe('D');
//     expect(D.self.any.js).toBe('___as_vertex');
//     expect(D.self.self.any.js).toBe('D');
//     expect([...D.self.traverse()].map(ref => ref.self.any.js)).toEqual(['D', 'E', 'F']);
//     expect([...D.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['D', 'C', 'B', 'A']);
//
//     expect(E.type).toBe(RayType.VERTEX);
//     expect(E.self.type).toBe(RayType.VERTEX);
//     expect(E.is_none()).toBe(false);
//     expect(E.any.js).toBe('E');
//     expect(E.self.any.js).toBe('___as_vertex');
//     expect(E.self.self.any.js).toBe('E');
//     expect([...E.self.traverse()].map(ref => ref.self.any.js)).toEqual(['E', 'F']);
//     expect([...E.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['E', 'D', 'C', 'B', 'A']);
//
//     expect(F.type).toBe(RayType.VERTEX);
//     expect(F.self.type).toBe(RayType.VERTEX);
//     expect(F.is_none()).toBe(false);
//     expect(F.any.js).toBe('F');
//     expect(F.self.any.js).toBe('___as_vertex');
//     expect(F.self.self.any.js).toBe('F');
//     expect([...F.self.traverse()].map(ref => ref.self.any.js)).toEqual(['F']);
//     expect([...F.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['F', 'E', 'D', 'C', 'B', 'A']);
//   });
//   test("A.equiv(B).equiv(C).equiv(D).equiv(E).equiv(F)", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//     const D = Ray.vertex().o({ js: 'D' }).as_reference().o({ js: 'D.#' });
//     const E = Ray.vertex().o({ js: 'E' }).as_reference().o({ js: 'E.#' });
//     const F = Ray.vertex().o({ js: 'F' }).as_reference().o({ js: 'F.#' });
//
//     /**
//      *    |
//      * [--A--]
//      *    |
//      * [--B--]
//      *    |
//      * [--C--]
//      *    |
//      * [--D--]
//      *    |
//      * [--E--]
//      *    |
//      * [--F--]
//      *    |
//      */
//     A.equivalent(B).equivalent(C).equivalent(D).equivalent(E).equivalent(F);
//
//     expect(A.type).toBe(RayType.VERTEX);
//     expect(A.self.type).toBe(RayType.VERTEX);
//
//     expect(A.is_none()).toBe(false);
//     expect(A.any.js).toBe('A');
//     expect(A.self.any.js).toBe('___as_vertex');
//     expect(A.self.self.any.js).toBe('A');
//     expect([...A.self.traverse()].map(ref => ref.self.any.js)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
//     expect([...A.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['A']);
//
//     expect(B.type).toBe(RayType.VERTEX);
//     expect(B.self.type).toBe(RayType.VERTEX);
//     expect(B.is_none()).toBe(false);
//     expect(B.any.js).toBe('B');
//     expect(B.self.any.js).toBe('___as_vertex');
//     expect(B.self.self.any.js).toBe('B');
//     expect([...B.self.traverse()].map(ref => ref.self.any.js)).toEqual(['B', 'C', 'D', 'E', 'F']);
//     expect([...B.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['B', 'A']);
//
//     expect(C.type).toBe(RayType.VERTEX);
//     expect(C.self.type).toBe(RayType.VERTEX);
//     expect(C.is_none()).toBe(false);
//     expect(C.any.js).toBe('C');
//     expect(C.self.any.js).toBe('___as_vertex');
//     expect(C.self.self.any.js).toBe('C');
//     expect([...C.self.traverse()].map(ref => ref.self.any.js)).toEqual(['C', 'D', 'E', 'F']);
//     expect([...C.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['C', 'B', 'A']);
//
//     expect(D.type).toBe(RayType.VERTEX);
//     expect(D.self.type).toBe(RayType.VERTEX);
//     expect(D.is_none()).toBe(false);
//     expect(D.any.js).toBe('D');
//     expect(D.self.any.js).toBe('___as_vertex');
//     expect(D.self.self.any.js).toBe('D');
//     expect([...D.self.traverse()].map(ref => ref.self.any.js)).toEqual(['D', 'E', 'F']);
//     expect([...D.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['D', 'C', 'B', 'A']);
//
//     expect(E.type).toBe(RayType.VERTEX);
//     expect(E.self.type).toBe(RayType.VERTEX);
//     expect(E.is_none()).toBe(false);
//     expect(E.any.js).toBe('E');
//     expect(E.self.any.js).toBe('___as_vertex');
//     expect(E.self.self.any.js).toBe('E');
//     expect([...E.self.traverse()].map(ref => ref.self.any.js)).toEqual(['E', 'F']);
//     expect([...E.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['E', 'D', 'C', 'B', 'A']);
//
//     expect(F.type).toBe(RayType.VERTEX);
//     expect(F.self.type).toBe(RayType.VERTEX);
//     expect(F.is_none()).toBe(false);
//     expect(F.any.js).toBe('F');
//     expect(F.self.any.js).toBe('___as_vertex');
//     expect(F.self.self.any.js).toBe('F');
//     expect([...F.self.traverse()].map(ref => ref.self.any.js)).toEqual(['F']);
//     expect([...F.self.traverse(Ray.directions.previous)].map(ref => ref.self.any.js)).toEqual(['F', 'E', 'D', 'C', 'B', 'A']);
//   });
//   // test(".None.#.equivalent(.vertex.#)", () => {
//   //   const A = Ray.None().as_reference();
//   //   const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//   //
//   //   // const ret = A.equivalent(B);
//   //
//   //   // expect()
//   // });
//   test("[A, B, C][.as_array, ...]", () => {
//     const A = Ray.vertex().o({ js: 'A' }).as_reference().o({ js: 'A.#' });
//     const B = Ray.vertex().o({ js: 'B' }).as_reference().o({ js: 'B.#' });
//     const C = Ray.vertex().o({ js: 'C' }).as_reference().o({ js: 'C.#' });
//
//     A.compose(B).compose(C);
//
//     expect(A.as_array().map(ref => ref.any.js)).toEqual(['A', 'B', 'C']);
//     expect(B.as_array().map(ref => ref.any.js)).toEqual(['B', 'C']);
//     expect(C.as_array().map(ref => ref.any.js)).toEqual(['C']);
//
//     expect([...A].map(ref => ref.any.js)).toEqual(['A', 'B', 'C']);
//     expect([...A.all().js]).toEqual(['A', 'B', 'C']);
//     expect([...A.as_generator()].map(ref => ref.any.js)).toEqual(['A', 'B', 'C']);
//     expect(A.as_string()).toBe('A,B,C');
//
//     {
//
//       const iterator = A.as_iterator();
//
//       let array: Ray.Any[] = [];
//
//       while (true) {
//         let current = iterator.next();
//         if (current.done)
//           break;
//
//         array.push(current.value);
//       }
//
//       expect(array.map(ref => ref.any.js)).toEqual(['A', 'B', 'C']);
//
//     }
//
//     // TODO async_generator / async_iterator / for await *
//   });
//   test(".next", () => {
//     let A = Ray.vertex().o({ js: 'A' }).as_reference();
//     let B = Ray.vertex().o({ js: 'B'}).as_reference();
//
//     A.compose(B);
//
//     B = A.next();
//
//     expect(B.type).toBe(RayType.VERTEX);
//     expect(B.any.js).toBe('B');
//     expect(B.self
//       .initial.self.initial
//       .as_reference().any.js
//     ).toBe('A');
//     expect(B.self
//       .initial.self.initial
//       .terminal.self.terminal
//       .as_reference().any.js
//     ).toBe('B');
//   });
//   test(".vertex.#.compose(.vertex.#)", () => {
//     let A = Ray.vertex().o({ js: 'A' }).as_reference();
//     let B = Ray.vertex().o({ js: 'B'}).as_reference();
//
//     B = A.compose(B);
//
//     expect(B.type).toBe(RayType.VERTEX);
//     expect(B.any.js).toBe('B');
//     expect(B.self
//       .initial.self.initial
//       .as_reference().any.js
//     ).toBe('A');
//     expect(B.self
//       .initial.self.initial
//       .terminal.self.terminal
//       .as_reference().any.js
//     ).toBe('B');
//   });
//   // TODO: .compose(), should take everything at the vertex instead.
//   // test("[.vertex.#, .vertex.#].#.compose", () => {
//   //   let A = Ray.vertex().o({ js: 'A' }).as_reference();
//   //   let B = Ray.vertex().o({ js: 'B' }).as_reference();
//   //
//   //   B = new Ray({
//   //     initial: A.as_arbitrary(),
//   //     terminal: B.as_arbitrary()
//   //   }).as_reference().compose();
//   //
//   //   expect(B.type).toBe(RayType.VERTEX);
//   //   expect(B.any.js).toBe('B');
//   //   expect(B.self
//   //     .initial.self.initial
//   //     .as_reference().any.js
//   //   ).toBe('A');
//   //   expect(B.self
//   //     .initial.self.initial
//   //     .terminal.self.terminal
//   //     .as_reference().any.js
//   //   ).toBe('B');
//   // });
//   // test(".vertex.#.debug", () => { TODO
//   //   const a = Ray.vertex().as_reference();
//   //   const b = Ray.vertex().as_reference();
//   //   a.compose(b);
//   //
//   //   const debug = {};
//   //   a.debug(debug);
//   //
//   //   expect(debug).toEqual('')
//   // })
//   test(".as_arbitrary", () => {
//     expect(Ray.vertex().o({ js: 'A' }).as_arbitrary()().as_reference().any.js).toBe('A');
//   });
//   test(".dereference", () => {
//     const A = Ray.vertex(
//       Ray.vertex().o({ js: "A.vertex" }).as_arbitrary()
//     ).o({ js: 'A' }).as_reference();
//
//     expect(A.dereference.any.js).toBe('A.vertex');
//     expect(A.as_reference().dereference.any.js).toBe('A');
//     expect(A.as_reference().as_reference().dereference.dereference.any.js).toBe('A');
//     expect(A.as_reference().as_reference().as_reference().dereference.dereference.dereference.any.js).toBe('A');
//     expect(A.as_reference().as_reference().as_reference().dereference.dereference.dereference.dereference.any.js).toBe('A.vertex');
//   });
//   test(".o", () => {
//     const ray = Ray.vertex().o({
//       a: 'b',
//       position: [0, 1, 2],
//       func: () => 'c'
//     }).as_reference();
//
//     expect(ray.any.a).toBe('b');
//     expect(ray.any.test).toBe(undefined);
//     expect(() => Ray.Any.any.undefinedFunction()).toThrow();
//     expect(ray.any.position).toEqual([0, 1, 2]);
//     expect(ray.any.func()).toBe('c');
//   })
//   test(".vertex.#", () => {
//     /** [--|--] */ const vertex = Ray.vertex().as_reference();
//
//     expect(vertex.type).toBe(RayType.VERTEX);
//
//     expect(vertex.is_none()).toBe(false);
//     expect(vertex.is_some()).toBe(true);
//
//     expect(vertex.is_initial()).toBe(false);
//     expect(vertex.is_vertex()).toBe(true);
//     expect(vertex.is_terminal()).toBe(false);
//     expect(vertex.is_reference()).toBe(false);
//
//     expect(vertex.self).toBe(vertex.self.initial.terminal);
//     expect(vertex.self).toBe(vertex.self.terminal.initial);
//     expect(vertex.self).toBe(Ray.directions.previous(vertex).self.terminal);
//   });
//   test(".vertex.initial.#", () => {
//     /** [--|--] */ const vertex = Ray.vertex();
//     /** [  |--] */ const initial = vertex.initial.as_reference();
//
//     expect(initial.self.initial.is_none()).toBe(true);
//     expect(initial.self).not.toBe(initial.self.self); // If self-referential, that means none.
//
//     expect(initial.self.terminal).toBe(vertex);
//     expect(initial.self.terminal.self).not.toBe(vertex);
//     expect(initial.self.terminal.initial).toBe(initial.self);
//
//     expect(initial.self.is_none()).toBe(false);
//     expect(initial.self.self.is_none()).toBe(true);
//
//     expect(initial.is_some()).toBe(true);
//     expect(initial.self.terminal.is_none()).toBe(false);
//
//     expect(initial.is_initial()).toBe(true);
//     expect(initial.is_vertex()).toBe(false);
//     expect(initial.is_terminal()).toBe(false);
//     expect(initial.is_reference()).toBe(false);
//     expect(initial.type).toBe(RayType.INITIAL);
//   });
//   test(".initial.#", () => {
//     /** [  |-?] */ const initial = Ray.initial().as_reference();
//
//     expect(initial.self.initial.is_none()).toBe(true);
//     expect(initial.self).not.toBe(initial.self.self); // If self-referential, that means none.
//
//     expect(initial.self).toBe(initial.self.terminal.initial);
//     expect(initial.self.terminal).toBe(initial.self.terminal.terminal.initial);
//
//     expect(initial.self.terminal.initial).toBe(initial.self);
//
//     expect(initial.self.is_none()).toBe(false);
//     expect(initial.self.self.is_none()).toBe(true);
//
//     expect(initial.is_some()).toBe(true);
//     expect(initial.self.terminal.is_none()).toBe(false);
//
//     expect(initial.is_initial()).toBe(true);
//     expect(initial.is_vertex()).toBe(false);
//     expect(initial.is_terminal()).toBe(false);
//     expect(initial.is_reference()).toBe(false);
//     expect(initial.type).toBe(RayType.INITIAL);
//   });
//   test(".vertex.terminal.#", () => {
//     /** [--|--] */ const vertex = Ray.vertex();
//     /** [  |--] */ const terminal = vertex.terminal.as_reference();
//
//     expect(terminal.self.terminal.is_none()).toBe(true);
//     expect(terminal.self).not.toBe(terminal.self.self); // If self-referential, that means none.
//
//     expect(terminal.self.initial).toBe(vertex);
//     expect(terminal.self.initial.self).not.toBe(vertex);
//     expect(terminal.self.initial.terminal).toBe(terminal.self);
//
//     expect(terminal.self.is_none()).toBe(false);
//     expect(terminal.self.self.is_none()).toBe(true);
//
//     expect(terminal.is_some()).toBe(true);
//     expect(terminal.self.initial.is_none()).toBe(false);
//
//     expect(terminal.is_terminal()).toBe(true);
//     expect(terminal.is_vertex()).toBe(false);
//     expect(terminal.is_initial()).toBe(false);
//     expect(terminal.is_reference()).toBe(false);
//     expect(terminal.type).toBe(RayType.TERMINAL);
//   });
//   test(".terminal.#", () => {
//     /** [--|  ] */ const terminal = Ray.terminal().as_reference();
//
//     expect(terminal.self.terminal.is_none()).toBe(true);
//     expect(terminal.self).not.toBe(terminal.self.self); // If self-referential, that means none.
//
//     expect(terminal.self).toBe(terminal.self.initial.terminal);
//     expect(terminal.self.initial).toBe(terminal.self.initial.initial.terminal);
//
//     expect(terminal.self.initial.terminal).toBe(terminal.self);
//
//     expect(terminal.self.is_none()).toBe(false);
//     expect(terminal.self.self.is_none()).toBe(true);
//
//     expect(terminal.is_some()).toBe(true);
//     expect(terminal.self.initial.is_none()).toBe(false);
//
//     expect(terminal.is_terminal()).toBe(true);
//     expect(terminal.is_vertex()).toBe(false);
//     expect(terminal.is_initial()).toBe(false);
//     expect(terminal.is_reference()).toBe(false);
//     expect(terminal.type).toBe(RayType.TERMINAL);
//   });
//   test(".None", () => {
//     /** [     ] */
//     const ray = Ray.None();
//
//     expect(ray.self.is_none()).toBe(true);
//     expect(ray.self.is_some()).toBe(false);
//     expect(ray.self.initial.is_none()).toBe(true);
//     expect(ray.self.vertex.is_none()).toBe(true);
//     expect(ray.self.terminal.is_none()).toBe(true);
//
//     expect(ray.is_none()).toBe(true);
//     expect(ray.is_some()).toBe(false);
//
//     expect(ray.is_initial()).toBe(false);
//     expect(ray.is_vertex()).toBe(true);
//     expect(ray.is_terminal()).toBe(false);
//     expect(ray.is_reference()).toBe(false);
//     expect(ray.type).toBe(RayType.VERTEX);
//
//   });
//   test(".None.#", () => {
//     /**
//      * [  |  ]
//      *    |
//      * [?????]
//     */
//
//     const ray = Ray.None().as_reference();
//
//     expect(ray.self.is_none()).toBe(true);
//     expect(ray.self.is_some()).toBe(false);
//     expect(ray.self.initial.is_none()).toBe(true);
//     expect(ray.self.vertex.is_none()).toBe(true);
//     expect(ray.self.terminal.is_none()).toBe(true);
//
//     expect(ray.is_none()).toBe(true);
//     expect(ray.is_some()).toBe(false);
//
//     expect(ray.is_initial()).toBe(false);
//     expect(ray.is_vertex()).toBe(true);
//     expect(ray.is_terminal()).toBe(false);
//     expect(ray.is_reference()).toBe(false);
//     expect(ray.type).toBe(RayType.VERTEX);
//
//   });
//   test(".None.#.#", () => {
//     /**
//      * [  |  ]
//      *    |
//      * [  |  ]
//      *    |
//      * [?????]
//      */
//     const ray = Ray.None().as_reference().as_reference();
//
//     expect(ray.self.is_none()).toBe(true);
//     expect(ray.self.is_some()).toBe(false);
//
//     expect(ray.self.initial.is_none()).toBe(true);
//     expect(ray.self.vertex.is_none()).toBe(true);
//     expect(ray.self.terminal.is_none()).toBe(true);
//
//     expect(ray.is_none()).toBe(false);
//     expect(ray.is_some()).toBe(true);
//
//     expect(ray.is_initial()).toBe(true);
//     expect(ray.is_vertex()).toBe(false);
//     expect(ray.is_terminal()).toBe(true);
//     expect(ray.is_reference()).toBe(true);
//     expect(ray.type).toBe(RayType.REFERENCE);
//   });
//   test(".None.#.#.#", () => {
//     /**
//      *   ...
//      *    |
//      * [  |  ]
//      *    |
//      * [  |  ]
//      *    |
//      * [  |  ]
//      *    |
//      * [?????]
//      */
//     let ray = Ray.None().as_reference().as_reference().as_reference();
//
//     expect(ray.self.is_none()).toBe(false);
//     expect(ray.self.is_some()).toBe(true);
//     expect(ray.self.initial.is_none()).toBe(true);
//     expect(ray.self.vertex.is_none()).toBe(true);
//     expect(ray.self.terminal.is_none()).toBe(true);
//
//     expect(ray.is_none()).toBe(false);
//     expect(ray.is_some()).toBe(true);
//
//     expect(ray.is_initial()).toBe(true);
//     expect(ray.is_vertex()).toBe(false);
//     expect(ray.is_terminal()).toBe(true);
//     expect(ray.is_reference()).toBe(true);
//     expect(ray.type).toBe(RayType.REFERENCE);
//   });
//   test(".None.#.#.#.#[4-15]", () => {
//     /**
//      * Basically the empty value is out of scope of our direct drill, and we expect this behavior 'infinitely' up the reference stack.
//      *   ...
//      * [  |  ]  <-- ray
//      *    |
//      * [  |  ]  <-- ray.self              - (ray.self.is_none())
//      *    |
//      * [  |  ]  <-- ray.self.self         - (ray.self.self === ray.self.self.self)
//      *    |
//      * [  |  ]  <-- ray.self.self.self    - = false
//      *    |
//      * [?????]
//      */
//     for (let i = 4; i <= 15; i++) {
//       let ray = Ray.None();
//       for (let j = 0; j < i; j++) {
//         ray = ray.as_reference();
//       }
//
//       expect(ray.self.is_none()).toBe(false);
//       expect(ray.self.is_some()).toBe(true);
//       expect(ray.self.initial.is_none()).toBe(true);
//       expect(ray.self.vertex.is_none()).toBe(false);
//       expect(ray.self.terminal.is_none()).toBe(true);
//
//       expect(ray.is_none()).toBe(false);
//       expect(ray.is_some()).toBe(true);
//
//       expect(ray.is_initial()).toBe(true);
//       expect(ray.is_vertex()).toBe(false);
//       expect(ray.is_terminal()).toBe(true);
//       expect(ray.is_reference()).toBe(true);
//       expect(ray.type).toBe(RayType.REFERENCE);
//     }
//   });
});

