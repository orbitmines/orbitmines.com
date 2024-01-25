import {Ray} from "../../explorer/Ray";
import {NotImplementedError} from "../../explorer/errors/errors";
import JS from "../../explorer/JS";

/**
 * An interface from Aleks Kissinger's [Chyp (Cospans of HYPergraphs)](https://github.com/akissinger/chyp) to (OrbitMines') Ray.
 *
 * **What is this?, What are Rays?**
 *
 * See the `README.md` at [github.com/orbitmines/orbitmines.com](https://github.com/orbitmines/orbitmines.com). Or locally: [README.md](../../../../README.md)
 *
 * **Why is this interface here?**
 *
 * Note that this is mainly here for reference to the existing Chyp codebase - for anyone who understands that structure, to quickly translate that knowledge into how Rays work. - Other than that functionality, everything here should be considered as deprecated. Or considered as a legacy translation, which will be accessibly through OrbitMines.
 */

/** TODO errors probably hooked as a boolean, one successful the other not */
export class GraphError extends Error {}
export class RuleError extends Error {}
export class RuntimeError extends Error {}
export class StopIteration extends Error {}

export namespace Chyp {

  export type VData = Vertex; export class Vertex extends Ray {

    static new = (): Vertex => {
      return new Vertex();
    }

    protected constructor() {
      super();
    }

    // Vertex.in_edges = Ray.initial
      get in_edges(): Ray.Any { return this.initial; } set in_edges(ray: JS.ParameterlessFunction<Ray.Any>) { this.initial = ray; }

    // Vertex.out_edges = Ray.terminal
      get out_edges(): Ray.Any { return this.terminal; } set out_edges(ray: JS.ParameterlessFunction<Ray.Any>) { this.terminal = ray; }

  }

  export type EData = Edge; export class Edge extends Ray {

    // Edge.source = Ray.initial
      get source(): Ray.Any { return this.initial; } set source(ray: JS.ParameterlessFunction<Ray.Any>) { this.initial = ray; }
      get s(): Ray.Any { return this.initial; } set s(ray: JS.ParameterlessFunction<Ray.Any>) { this.initial = ray; }

    // Edge.targets = Ray.terminal
      get target(): Ray.Any { return this.terminal; } set target(ray: JS.ParameterlessFunction<Ray.Any>) { this.terminal = ray; }
      get t(): Ray.Any { return this.terminal; } set t(ray: JS.ParameterlessFunction<Ray.Any>) { this.terminal = ray; }

  }

  export class Match extends Ray {

    /**
     *                      |            <-- (vertex/edge)_map to (vertex/edge)_image
     *                 _____|_____
     *                /     |     \
     * Domain:    [--|--][--|--][--|--]   <-- Any of the matching structure on 'domain' is '_map'.
     *               |      |      |          (is_total = true, if everything is on '_map')
     *               |      |      |
     * Codomain:  [--|--][--|--][--|--]   <-- Any of the matching structure on 'codomain' is '_image'.
     *               |      |      |          (is_surjective = true, if everything is on '_image')
     */

    static new = (): Match => {
      return new Match();
    }

    protected constructor() {
      super();
    }

    // Match.domain = Ray.initial
      get domain(): Ray.Any { return this.initial; } set domain(ray: JS.ParameterlessFunction<Ray.Any>) { this.initial = ray; }

    // Match.codomain = Ray.terminal
      get codomain(): Ray.Any { return this.terminal; } set codomain(ray: JS.ParameterlessFunction<Ray.Any>) { this.terminal = ray; }

  }

  export class Rule extends Ray {

    static new = (): Rule => {
      return new Rule();
    }

    protected constructor() {
      super();
    }

    // Rule.lhs = Ray.initial
      get lhs(): Ray.Any { return this.initial; } set lhs(ray: JS.ParameterlessFunction<Ray.Any>) { this.initial = ray; }

    // Rule.rhs = Ray.terminal
      get rhs(): Ray.Any { return this.terminal; } set rhs(ray: JS.ParameterlessFunction<Ray.Any>) { this.terminal = ray; }

    /**
     * TODO: We can use the same implementation to rewrite where there's not necessarily a match between initial/terminal side of a rule.
     *
     * TODO: In general, we can just assume each lhs, has some link to some rhs, and not go through 'The Rule', and simply if lhs terminates, it terminates, if additional ones are initialized through rhs, so be it. - Set this up after this implementation where we reference an entire thing from a single perspective.
     */
    validate = () => {
      // TODO: Call from somewhere.

      if (!this.initial.is_equivalent(this.terminal))
        throw new RuleError('LHS (Initial) !== RHS (Terminal)');

      // TODO: Or each check separately
      // if (!this.initial.initial.is_equivalent(this.terminal.initial))
      //   throw new RuleError('Initial.Initial (LHS.Domain) !== Terminal.Initial (RHS.Domain)');
      // if (!this.initial.terminal.is_equivalent(this.terminal.terminal))
      //   throw new RuleError('Initial.Terminal (LHS.Codomain) !== Terminal.Terminal (RHS.Codomain)');
    }

    name = this.property('name', '');

    override get reverse(): Ray.Any {
      // TODO remove this hacky thing - just tries to us -a / a

      const name = this.name.startsWith('-') ? this.name.substring(1) : `-${this.name}`;

      return super.reverse.o({ name });
    }

    dpo = (match: Match): Ray.Any => {
      throw new NotImplementedError();
    }

  }

  export class Graph extends Ray {

    static new = (): Graph => {
      return new Graph();
    }

    protected constructor() {
      super();
    }

    // Graph.inputs = Ray.initial
      get inputs(): Ray.Any { return this.initial; } set inputs(ray: JS.ParameterlessFunction<Ray.Any>) { this.initial = ray; }
      set_inputs = (ray: JS.ParameterlessFunction<Ray.Any>): Graph => { this.inputs = ray; return this; }
      add_inputs = (ray: Ray.Any): Graph => { this.inputs.compose(ray); return this; }
    // Graph.inputs = Ray.terminal
      get outputs(): Ray.Any { return this.terminal; } set outputs(ray: JS.ParameterlessFunction<Ray.Any>) { this.terminal = ray; }
      set_outputs = (ray: JS.ParameterlessFunction<Ray.Any>): Graph => { this.outputs = ray; return this; }
      add_outputs = (ray: Ray.Any): Graph => { this.outputs.compose(ray); return this; }

  }

}