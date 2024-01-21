import {JS, Ray, RayType} from "./Ray";

describe("JS", () => {
  test(".Object", () => {
    const ray = JS.Object({
      a: 'b',
      position: [0, 1, 2],
      func: () => 'c'
    });

    expect(ray.any.a).toBe('b');
    expect(ray.any.undefinedProperty).toBe(undefined);
    expect(() => ray.any.undefinedFunction()).toThrow();
    expect(ray.any.position).toEqual([0, 1, 2]);
    expect(ray.any.func()).toBe('c');
  });
  test(".Boolean", () => {
    const _false = JS.Boolean(false);
    const _true = JS.Boolean(true);

    expect(_false.any.js).toBe(false);
    expect(_true.any.js).toBe(true);

    expect(_false.next().any.js).toBe(true);
    expect(_false.previous().is_none()).toBe(true);

    expect(_true.next().is_none()).toBe(true);
    expect(_true.previous().any.js).toBe(false);
  });
  test(".Bit", () => {
    const _false = JS.Bit(false);
    const _true = JS.Bit(true);

    expect(_false.any.js).toBe(false);
    expect(_true.any.js).toBe(true);

    expect(_false.next().any.js).toBe(true);
    expect(_false.previous().is_none()).toBe(true);

    expect(_true.next().is_none()).toBe(true);
    expect(_true.previous().any.js).toBe(false);
  });
  test(".Iterable", () => {
    const iterable = JS.Iterable(['A', 'B', 'C', 'D', 'E']);

    expect(iterable.type).toBe(RayType.INITIAL);

    const A = iterable.follow();

    expect(A.any.js).toBe('A');
    expect(A.previous().is_none()).toBe(true);

    expect(A.next().previous().any.js).toBe('A');
    expect(A.next().next().previous().previous().any.js).toBe('A');
    expect(A.next().next().next().previous().previous().previous().any.js).toBe('A');
    expect(A.next().next().next().next().previous().previous().previous().previous().any.js).toBe('A');

    expect(A.next().any.js).toBe('B');
    expect(A.next().next().any.js).toBe('C');
    expect(A.next().next().next().any.js).toBe('D');
    expect(A.next().next().next().next().any.js).toBe('E');

    expect(A.next().next().next().next().next().is_none()).toBe(true);

    expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect([...A.next().next().all().js]).toEqual(['C', 'D', 'E']);
    expect([...A.next().next().next().next().all(Ray.directions.previous).js]).toEqual(['E', 'D', 'C', 'B', 'A']);
  });
  test(".Generator", () => {
    function* generator_function(): Generator<string> {
      yield 'A';
      yield 'B';
      yield 'C';
      yield 'D';
      yield 'E';
    }
    const generator = JS.Generator(generator_function());

    expect(generator.type).toBe(RayType.INITIAL);

    const A = generator.follow();

    expect(A.any.js).toBe('A');
    expect(A.previous().is_none()).toBe(true);

    expect(A.next().previous().any.js).toBe('A');
    expect(A.next().next().previous().previous().any.js).toBe('A');
    expect(A.next().next().next().previous().previous().previous().any.js).toBe('A');
    expect(A.next().next().next().next().previous().previous().previous().previous().any.js).toBe('A');

    expect(A.next().any.js).toBe('B');
    expect(A.next().next().any.js).toBe('C');
    expect(A.next().next().next().any.js).toBe('D');
    expect(A.next().next().next().next().any.js).toBe('E');

    expect(A.next().next().next().next().next().is_none()).toBe(true);

    expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect([...A.next().next().all().js]).toEqual(['C', 'D', 'E']);
    expect([...A.next().next().next().next().all(Ray.directions.previous).js]).toEqual(['E', 'D', 'C', 'B', 'A']);
  });
  test(".Any", () => {

    // .Object
    {
      const ray = JS.Any({
        a: 'b',
        position: [0, 1, 2],
        func: () => 'c'
      });

      expect(ray.any.a).toBe('b');
      expect(ray.any.undefinedProperty).toBe(undefined);
      expect(() => ray.any.undefinedFunction()).toThrow();
      expect(ray.any.position).toEqual([0, 1, 2]);
      expect(ray.any.func()).toBe('c');
    }
    // .Boolean
    {
      const _false = JS.Any(false);
      const _true = JS.Any(true);

      expect(_false.any.js).toBe(false);
      expect(_true.any.js).toBe(true);

      expect(_false.next().any.js).toBe(true);
      expect(_false.previous().is_none()).toBe(true);

      expect(_true.next().is_none()).toBe(true);
      expect(_true.previous().any.js).toBe(false);
    }
    // .Iterable
    {
      const iterable = JS.Any(['A', 'B', 'C', 'D', 'E']);

      expect(iterable.type).toBe(RayType.INITIAL);

      const A = iterable.follow();

      expect(A.any.js).toBe('A');
      expect(A.previous().is_none()).toBe(true);

      expect(A.next().previous().any.js).toBe('A');
      expect(A.next().next().previous().previous().any.js).toBe('A');
      expect(A.next().next().next().previous().previous().previous().any.js).toBe('A');
      expect(A.next().next().next().next().previous().previous().previous().previous().any.js).toBe('A');

      expect(A.next().any.js).toBe('B');
      expect(A.next().next().any.js).toBe('C');
      expect(A.next().next().next().any.js).toBe('D');
      expect(A.next().next().next().next().any.js).toBe('E');

      expect(A.next().next().next().next().next().is_none()).toBe(true);

      expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
      expect([...A.next().next().all().js]).toEqual(['C', 'D', 'E']);
      expect([...A.next().next().next().next().all(Ray.directions.previous).js]).toEqual(['E', 'D', 'C', 'B', 'A']);
    }
    // .Generator
    {
      function* generator_function(): Generator<string> {
        yield 'A';
        yield 'B';
        yield 'C';
        yield 'D';
        yield 'E';
      }
      const generator = JS.Any(generator_function());

      expect(generator.type).toBe(RayType.INITIAL);

      const A = generator.follow();

      expect(A.any.js).toBe('A');
      expect(A.previous().is_none()).toBe(true);

      expect(A.next().previous().any.js).toBe('A');
      expect(A.next().next().previous().previous().any.js).toBe('A');
      expect(A.next().next().next().previous().previous().previous().any.js).toBe('A');
      expect(A.next().next().next().next().previous().previous().previous().previous().any.js).toBe('A');

      expect(A.next().any.js).toBe('B');
      expect(A.next().next().any.js).toBe('C');
      expect(A.next().next().next().any.js).toBe('D');
      expect(A.next().next().next().next().any.js).toBe('E');

      expect(A.next().next().next().next().next().is_none()).toBe(true);

      expect([...A.all().js]).toEqual(['A', 'B', 'C', 'D', 'E']);
      expect([...A.next().next().all().js]).toEqual(['C', 'D', 'E']);
      expect([...A.next().next().next().next().all(Ray.directions.previous).js]).toEqual(['E', 'D', 'C', 'B', 'A']);
    }
  });
});
