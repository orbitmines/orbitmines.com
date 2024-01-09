import {JS, Ray, RayType} from "./Ray";
import {PreventsImplementationBug} from "./errors/errors";

describe("JS", () => {
  test(".Object", () => {
    const ray = JS.Object({
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
});
describe("Ray", () => {
  test(".vertex.#.debug", () => {
    const a = Ray.vertex().as_reference();
    const b = Ray.vertex().as_reference();
    a.continues_with(b);

    const debug = {};
    a.debug(debug);

    expect(debug).toEqual('')
  })
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

  test(".vertex.#", () => {
    /** [--|--] */ const vertex = Ray.vertex().as_reference();

    expect(vertex.type).toBe(RayType.VERTEX);

    expect(vertex.is_none()).toBe(false);
    expect(vertex.is_some()).toBe(true);

    expect(vertex.is_initial()).toBe(false);
    expect(vertex.is_vertex()).toBe(true);
    expect(vertex.is_terminal()).toBe(false);
    expect(vertex.is_reference()).toBe(false);
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

