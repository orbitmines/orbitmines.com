import {Ray} from "../../explorer/Ray";
import {Chyp} from "./Chyp";

describe("Chyp", () => {
  describe(".Graph", () => {
    test(".set_inputs", () => {
      const graph = new Chyp.Graph()
        .set_inputs(Ray.vertex().o({ js: 'B' }).as_arbitrary())
        .set_inputs(Ray.vertex().o({ js: 'A' }).as_arbitrary());

      expect(graph.inputs.any.js).toBe('A');
      expect(graph.initial.any.js).toBe('A');
      expect(graph.inputs.any.js).toBe(graph.initial.any.js);
      expect(graph.inputs).toBe(graph.initial);
    })

  });
});

