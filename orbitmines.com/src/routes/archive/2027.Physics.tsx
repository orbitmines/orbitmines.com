enum Op {
  Repell,
  Attract,
  Neutral
}

class Universe {
  static _2D = () => Universe.nD_Expanding(2);
  static _3D = () => Universe.nD_Expanding(3);
  static nD_Expanding = (d: number) => {}

  //TODO Should probably be something occilating instead of random
  static random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

class Graph {
  buffer: node[] = []
  elements: node[] = []

  tick() {
    this.buffer = this.elements; //todo copy

    for (const node of this.buffer) {
      const selected = Universe.random(node)
      selected.tick();
    }
  }
}

type node = Ray[]

class Ray {
  boundaries: Boundary[] = []

  tick() {
    for (const boundary of this.boundaries) {
      switch(boundary.op) {
        case Op.Repell: { boundary.repell(); break; }
        case Op.Attract: { boundary.attract(); break; }
      }
    }
  }
}

class Boundary {
  op: Op = Op.Neutral
  
  get source(): Boundary { return Universe.random(this.at.boundaries.filter(x => x !== this)); }
  target?: Boundary
  
  constructor(public at: Ray) {}

  repeller() { this.op = Op.Repell; }
  attractor() { this.op = Op.Attract; }

  repell() {
    
  }
  attract() {
    if (!this.target) return; //TODO What to do at boundaries?
    // if (this.target.op === Op.Attract) {
    //   const source = this.source;
    //   if (source.op === Op.Repell) return this.annihilate();
    //   else return 
    // }
    
  }

  annihilate() {

  }

}