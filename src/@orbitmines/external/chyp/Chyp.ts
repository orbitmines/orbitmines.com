import {Arbitrary, initial, Ray, second} from "../../explorer/Ray";

/**
 * An interface from Aleks Kissinger's [Chyp (Cospans of HYPergraphs)](https://github.com/akissinger/chyp) to (OrbitMines') Rays.
 *
 * **What is this?, What are Rays?**
 *
 * See the `README.md` at [github.com/orbitmines/orbitmines.com](https://github.com/orbitmines/orbitmines.com). Or locally: [README.md](../../../../README.md)
 *
 * **Why is this interface here?**
 *
 * Note that this is mainly here for reference to the existing Chyp codebase - for anyone who understands that structure, to quickly translate that knowledge into how Rays work. - Other than that functionality, everything here should be considered as deprecated. Or considered as a legacy translation, which will be accessibly through OrbitMines.
 */

export namespace Chyp {

  export type VData = Vertex; class Vertex extends Ray {

  }

  export type EData = Edge; class Edge extends Ray {

  }

  export class Graph extends Ray {

    /**
     * These are all just slightly differently abstracted in TypeScript here to make them a little more native.
     */
    // Graph.inputs = Ray.initial
      get inputs(): Ray { return this.initial; } set inputs(ray: Arbitrary<Ray>) { this.initial = ray; }
      set_inputs = (ray: Arbitrary<Ray>): Graph => { this.inputs = ray; return this; }
      add_inputs = (ray: Ray): Graph => { this.inputs.continues_with(ray); return this; }
    // Graph.inputs = Ray.terminal
      get outputs(): Ray { return this.terminal; } set outputs(ray: Arbitrary<Ray>) { this.terminal = ray; }
      set_outputs = (ray: Arbitrary<Ray>): Graph => { this.outputs = ray; return this; }
      add_outputs = (ray: Ray): Graph => { this.outputs.continues_with(ray); return this; }

  }

}