import Ray, {Rays} from "./Ray";
import JS from "./JS";
import {previous} from "slate";
import {NotImplementedError} from "./errors/errors";
import self_reference = Rays.Functions.self_reference;
import none = Rays.Functions.none;

describe("JS", () => {
  describe(".Function", () => {
    describe(".Instance", () => {

      test(".traverse", () => {
        const events: any[] = [];
        const ray = Rays.New();

        ray.debug(
          (event) => {
            events.push(event);
          },
          () => {
            try{
              ray.compose()
            } catch (e) {}
          }
        );

        expect(events.map(event => ({
          event: event.event, context: { method: { property: event.context.method.property} }
        }))).toBe(false);

      });
      test(".traverse", () => {
        const events: any[] = [];
        const ray = Rays.New();

        ray.debug(
          (event) => {
            events.push(event);
          },
          () => {
            // // Reference
            // ray.initial = none;
            // // ray.self = // SOMETHING
            // ray.terminal = none;
            //
            // // Initial
            // ray.initial = none;
            // ray.self = self_reference;
            // ray.terminal = self_reference;
            //
            // // Vertex:
            // ray.initial = self_reference;
            // ray.self = self_reference;
            // ray.terminal = self_reference;
            //
            // // Terminal
            // ray.initial = self_reference;
            // ray.self = self_reference;
            // ray.terminal = none;
          }
        );

        expect(events.map(event => ({
          event: event.event, context: { method: { property: event.context.method.property} }
        }))).toBe(false);

      });
    })
  })
  // test(".Function.Ref(ref)", () => {
  //   const method = JS.Function.Ref((ref): Ray => new Ray({
  //     initial: ref.self.initial.as_arbitrary(),
  //     terminal: ref.self.terminal.as_arbitrary()
  //   }).o({ js: ref.type })).as_method;
  //
  //   expect(method(Ray.vertex().as_reference().as_reference())().any.js).toBe(RayType.REFERENCE);
  //   expect(method(Ray.vertex().as_reference())().any.js).toBe(RayType.VERTEX);
  //   expect(method(Ray.initial().as_reference())().any.js).toBe(RayType.INITIAL);
  //   expect(method(Ray.terminal().as_reference())().any.js).toBe(RayType.TERMINAL);
  //
  //   const a = Ray.vertex().o({ js: 'A'}).as_reference();
  //   const b = Ray.vertex().o({ js: 'B'}).as_reference();
  //
  //   // TODO What about method(a)(b)(c)... :thinking:
  //   expect(method(a)(b).initial.any.js).toBe('A');
  //   expect(method(a)(b).terminal.any.js).toBe('B');
  //   expect(method(a)(b).type).toBe(RayType.VERTEX);
  // });
  // test(".Function.WithMemory", () => {
  //   const square = JS.Function.WithMemory(
  //     previous => previous.any.js * previous.any.js,
  //   );
  //
  //   let vertex = square.as_ray(Ray.vertex()).self.o({ js: 2 }).as_reference();
  //
  //   expect(vertex.previous().is_none()).toBe(true);
  //
  //   expect(vertex.any.js).toBe(2);
  //   expect(vertex.next().any.js).toBe(4);
  //   expect(vertex.next().next().any.js).toBe(16);
  //   expect(vertex.next().next().previous().any.js).toBe(4);
  //   expect(vertex.next().next().previous().previous().any.js).toBe(2);
  //
  //   expect(vertex.next().next().next().any.js).toBe(256);
  //   expect(vertex.next().next().next().next().any.js).toBe(65536);
  // });
  // test(".Function.Reversible", () => {
  //   const exp2 = JS.Function.Reversible(
  //     previous => Math.log(previous.any.js) / Math.log(2),
  //     previous => Math.pow(previous.any.js, 2),
  //   );
  //
  //   let vertex = exp2.as_ray(Ray.vertex()).self.o({ js: 2 }).as_reference();
  //
  //   expect(vertex.previous().any.js).toBe(1);
  //
  //   expect(vertex.any.js).toBe(2);
  //   expect(vertex.next().any.js).toBe(4);
  //   expect(vertex.next().next().any.js).toBe(16);
  //   expect(vertex.next().next().previous().any.js).toBe(4);
  //   expect(vertex.next().next().previous().previous().any.js).toBe(2);
  //
  //   expect(vertex.next().next().next().any.js).toBe(256);
  //   expect(vertex.next().next().next().next().any.js).toBe(65536);
  // });
  // test(".Object", () => {
  //   const ray = JS.Object({
  //     a: 'b',
  //     position: [0, 1, 2],
  //     func: () => 'c'
  //   });
  //
  //   expect(ray.any.a).toBe('b');
  //   expect(ray.any.undefinedProperty).toBe(undefined);
  //   expect(() => ray.any.undefinedFunction()).toThrow();
  //   expect(ray.any.position).toEqual([0, 1, 2]);
  //   expect(ray.any.func()).toBe('c');
  // });
  // test(".Boolean", () => {
  //   const _false = JS.Boolean(false);
  //   const _true = JS.Boolean(true);
  //
  //   expect(_false.any.js).toBe(false);
  //   expect(_true.any.js).toBe(true);
  //
  //   expect(_false.next().any.js).toBe(true);
  //   expect(_false.previous().is_none()).toBe(true);
  //
  //   expect(_true.next().is_none()).toBe(true);
  //   expect(_true.previous().any.js).toBe(false);
  // });
  // test(".Bit", () => {
  //   const _false = JS.Bit(false);
  //   const _true = JS.Bit(true);
  //
  //   expect(_false.any.js).toBe(false);
  //   expect(_true.any.js).toBe(true);
  //
  //   expect(_false.next().any.js).toBe(true);
  //   expect(_false.previous().is_none()).toBe(true);
  //
  //   expect(_true.next().is_none()).toBe(true);
  //   expect(_true.previous().any.js).toBe(false);
  // });
  // test(".Iterable", () => {
  //   const iterable = JS.Iterable(['A', 'B', 'C', 'D', 'E']);
  //
  //   expect(iterable.type).toBe(RayType.INITIAL);
  //
  //   const A = iterable.follow();
  //
  //   expect(A.any.js).toBe('A');
  //   expect(A.previous().is_none()).toBe(true);
  //
  //   expect(A.next().previous().any.js).toBe('A');
  //   expect(A.next().next().previous().previous().any.js).toBe('A');
  //   expect(A.next().next().next().previous().previous().previous().any.js).toBe('A');
  //   expect(A.next().next().next().next().previous().previous().previous().previous().any.js).toBe('A');
  //
  //   expect(A.next().any.js).toBe('B');
  //   expect(A.next().next().any.js).toBe('C');
  //   expect(A.next().next().next().any.js).toBe('D');
  //   expect(A.next().next().next().next().any.js).toBe('E');
  //
  //   expect(A.next().next().next().next().next().is_none()).toBe(true);
  //
  //   expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
  //   expect([...A.next().next().all().js]).toEqual(['C', 'D', 'E']);
  //   expect([...A.next().next().next().next().all(Ray.directions.previous).js]).toEqual(['E', 'D', 'C', 'B', 'A']);
  // });
  // test(".Generator", () => {
  //   function* generator_function(): Generator<string> {
  //     yield 'A';
  //     yield 'B';
  //     yield 'C';
  //     yield 'D';
  //     yield 'E';
  //   }
  //   const generator = JS.Generator(generator_function());
  //
  //   expect(generator.type).toBe(RayType.INITIAL);
  //
  //   const A = generator.follow();
  //
  //   expect(A.any.js).toBe('A');
  //   expect(A.previous().is_none()).toBe(true);
  //
  //   expect(A.next().previous().any.js).toBe('A');
  //   expect(A.next().next().previous().previous().any.js).toBe('A');
  //   expect(A.next().next().next().previous().previous().previous().any.js).toBe('A');
  //   expect(A.next().next().next().next().previous().previous().previous().previous().any.js).toBe('A');
  //
  //   expect(A.next().any.js).toBe('B');
  //   expect(A.next().next().any.js).toBe('C');
  //   expect(A.next().next().next().any.js).toBe('D');
  //   expect(A.next().next().next().next().any.js).toBe('E');
  //
  //   expect(A.next().next().next().next().next().is_none()).toBe(true);
  //
  //   expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
  //   expect([...A.next().next().all().js]).toEqual(['C', 'D', 'E']);
  //   expect([...A.next().next().next().next().all(Ray.directions.previous).js]).toEqual(['E', 'D', 'C', 'B', 'A']);
  // });
  // test(".Any", () => {
  //
  //   // .Object
  //   {
  //     const ray = JS.Any({
  //       a: 'b',
  //       position: [0, 1, 2],
  //       func: () => 'c'
  //     });
  //
  //     expect(ray.any.a).toBe('b');
  //     expect(ray.any.undefinedProperty).toBe(undefined);
  //     expect(() => ray.any.undefinedFunction()).toThrow();
  //     expect(ray.any.position).toEqual([0, 1, 2]);
  //     expect(ray.any.func()).toBe('c');
  //   }
  //   // .Boolean
  //   {
  //     const _false = JS.Any(false);
  //     const _true = JS.Any(true);
  //
  //     expect(_false.any.js).toBe(false);
  //     expect(_true.any.js).toBe(true);
  //
  //     expect(_false.next().any.js).toBe(true);
  //     expect(_false.previous().is_none()).toBe(true);
  //
  //     expect(_true.next().is_none()).toBe(true);
  //     expect(_true.previous().any.js).toBe(false);
  //   }
  //   // .Iterable
  //   {
  //     const iterable = JS.Any(['A', 'B', 'C', 'D', 'E']);
  //
  //     expect(iterable.type).toBe(RayType.INITIAL);
  //
  //     const A = iterable.follow();
  //
  //     expect(A.any.js).toBe('A');
  //     expect(A.previous().is_none()).toBe(true);
  //
  //     expect(A.next().previous().any.js).toBe('A');
  //     expect(A.next().next().previous().previous().any.js).toBe('A');
  //     expect(A.next().next().next().previous().previous().previous().any.js).toBe('A');
  //     expect(A.next().next().next().next().previous().previous().previous().previous().any.js).toBe('A');
  //
  //     expect(A.next().any.js).toBe('B');
  //     expect(A.next().next().any.js).toBe('C');
  //     expect(A.next().next().next().any.js).toBe('D');
  //     expect(A.next().next().next().next().any.js).toBe('E');
  //
  //     expect(A.next().next().next().next().next().is_none()).toBe(true);
  //
  //     expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
  //     expect([...A.next().next().all().js]).toEqual(['C', 'D', 'E']);
  //     expect([...A.next().next().next().next().all(Ray.directions.previous).js]).toEqual(['E', 'D', 'C', 'B', 'A']);
  //   }
  //   // .Generator
  //   {
  //     function* generator_function(): Generator<string> {
  //       yield 'A';
  //       yield 'B';
  //       yield 'C';
  //       yield 'D';
  //       yield 'E';
  //     }
  //     const generator = JS.Any(generator_function());
  //
  //     expect(generator.type).toBe(RayType.INITIAL);
  //
  //     const A = generator.follow();
  //
  //     expect(A.any.js).toBe('A');
  //     expect(A.previous().is_none()).toBe(true);
  //
  //     expect(A.next().previous().any.js).toBe('A');
  //     expect(A.next().next().previous().previous().any.js).toBe('A');
  //     expect(A.next().next().next().previous().previous().previous().any.js).toBe('A');
  //     expect(A.next().next().next().next().previous().previous().previous().previous().any.js).toBe('A');
  //
  //     expect(A.next().any.js).toBe('B');
  //     expect(A.next().next().any.js).toBe('C');
  //     expect(A.next().next().next().any.js).toBe('D');
  //     expect(A.next().next().next().next().any.js).toBe('E');
  //
  //     expect(A.next().next().next().next().next().is_none()).toBe(true);
  //
  //     expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
  //     expect([...A.next().next().all().js]).toEqual(['C', 'D', 'E']);
  //     expect([...A.next().next().next().next().all(Ray.directions.previous).js]).toEqual(['E', 'D', 'C', 'B', 'A']);
  //   }
  // });
});
