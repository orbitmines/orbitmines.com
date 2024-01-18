import {Ray} from "../../explorer/Ray";
import {Chyp} from "./Chyp";

describe("Chyp", () => {
  describe(".Graph", () => {
    test(".set_inputs", () => {
      const graph = Chyp.Graph.new()
        .set_inputs(Ray.vertex().o({ js: 'B' }).as_arbitrary())
        .set_inputs(Ray.vertex().o({ js: 'A' }).as_arbitrary());

      expect(graph.inputs.any.js).toBe('A');
      expect(graph.initial.any.js).toBe('A');
      expect(graph.inputs.any.js).toBe(graph.initial.any.js);
      expect(graph.inputs).toBe(graph.initial);
    });

  });
  describe(".Rule", () => {
    test(".name", () => {
      let rule = Chyp.Rule.new();
      rule.name = 'test';

      expect(rule.name).toBe('test');
      expect(rule.reverse.any.name).toBe('-test');
      // expect(rule.reverse.reverse.any.name).toBe('test');

    });
  });
});

