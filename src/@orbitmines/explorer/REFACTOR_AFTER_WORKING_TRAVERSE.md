
// NOT NEEDED FOR INITIAL DEMONSTRATION:

```ts
  // TODO; Could return the ignorant reference to both instances, or just the result., ..

/**
 * - The problem with a copy, is that in or to be generalizable, it needs to alter all references to the thing it's copying to itself - this cannot be done with certainty.
 *
 * - Additionally, a copy necessarily has some non-redundancy to it:
 *   @see "A copy is necessarily inconsistent": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=If%20I%20have%20one%20thing%20and%20I%20make%20a%20perfect%20copy
 */
// @alias('duplicate')
copy = (): Ray => {
  // return this.self.as_reference(); // Copies the reference?
  throw new NotImplementedError();

  // const copy = new Ray({
  //   initial: this.self._initial().as_reference().none_or(ref => ref.copy()).as_arbitrary(),
  //   vertex: this.self._vertex().as_reference().none_or(ref => ref.copy()).as_arbitrary(),
  // }).o({ ___dirty_copy_buffer: {} });
  // // copy._initial = () => copy.any.___dirty_copy_buffer._initial ??= this.self._initial().as_reference().copy();
  // // copy._vertex = () => copy.any.___dirty_copy_buffer._vertex ??= this.self._vertex().as_reference().copy();
  // // copy._terminal = () => copy.any.___dirty_copy_buffer._terminal ??= this.self._terminal().as_reference().copy();
  //
  //
  // // TODO: Doesn't copy .any
  //
  // return copy.as_reference();
}


  get count(): Ray { return JS.Number(this.as_array().length); }


// TODO: For chyp used to compare [vtype, size] as domains, just type matching on the vertex. ; each individually, again, additional structure...

// TODO: Ignore the connection between the two, say a.equiv(b) within some Rule [a,b], ignore the existing of the connection in the Rule? What does it mean not to???
is_vertex_equivalent = (b: Ray) => {

}


// none_or = (arbitrary: Implementation): Ray => this.is_none() ? Ray.None() : arbitrary(this);


// TODO: IS JUST .NEXT/.previous (depending on whether its implementation is a modular structure) on boundaries
const opposite = (boundary: Boundary): Boundary => boundary === RayType.INITIAL ? RayType.TERMINAL : RayType.INITIAL;


/**
 * https://en.wikipedia.org/wiki/Homoiconicity
 */
export interface PossiblyHomoiconic<T extends PossiblyHomoiconic<T>> {
  get self(): T;
  is_reference: () => boolean
  as_reference: () => T
}


  // pop = (): Ray => {
// this.last().previous().all.terminal = (ref) => ref.___empty_terminal();
// }
// pop = (): Ray => this.___primitive_switch({
//   [RayType.VERTEX]: () => {
//     const previous_vertex = this.self.initial.follow(Ray.directions.previous);
//
//     if (this.is_none()) {
//       return this; // TODO; Already empty, perhaps throw
//     }
//
//     return previous_vertex.___primitive_switch({
//       [RayType.VERTEX]: () => {
//         console.log(previous_vertex)
//         // TODO: NONHACKY
//
//         previous_vertex.self.terminal = new Ray({ vertex: Ray.None, initial: previous_vertex.self.as_arbitrary() }).o({ debug: 'terminal ref'}).as_arbitrary()
//         return previous_vertex;
//       }
//     });
//   }
// });


  // zip also compose???
  // [a, b, c] zip [d, e, f] zip [g, h, i] ...
  // [[a,d,g],[b,e,h],[c,f,i]]
static zip = JS.Function.Impl((initial, terminal) => {

  if (initial.as_reference().type !== RayType.REFERENCE || terminal.as_reference().type !== RayType.REFERENCE)
    throw new PreventsImplementationBug('TODO: Implement');

  if (initial.type !== RayType.VERTEX || terminal.type !== RayType.VERTEX)
    throw new PreventsImplementationBug('TODO: Implement');

  throw new NotImplementedError();
  // initial.traverse()
  // return new Ray({
  //
  // });
});
zip = Ray.zip.as_method(this);

/**
 * TODO: This should be constructed at the vertex and in general unsolvable
 * 
 * TODO: Setup labels
 * TODO: Use JavaScript engine for generating these for a default impl without someone supplying their own gen func??
 * TODO: + allow for searching/doing stuff based on some label ; this can be arbitrarily through the structure
 */
static _label: number = 0;
get label(): string {
  if (this.any.label !== undefined)
    return this.any.label;

  return this.any.label = `"${Ray._label++} (${this.any.debug?.toString() ?? '?'})})"`;
}

  /**
 * Used for chaining JavaScript-provided properties
 *
 * TODO: DOESNT FOLLOW .ANY PATTERN?
 */
o = (object: { [key: string | symbol]: any }): Ray => {
  _.keys(object).forEach(key => this.proxy()[key] = object[key]); // TODO: Can be prettier, TODO: map to Ray equivalents and add to vertices..
  return this;
}

// All these are dirty
o2 = ({ initial, vertex, terminal }: any): Ray => {
  if (initial) this.initial.o(initial);
  if (vertex) this.o(vertex);
  if (terminal) this.terminal.o(terminal);

  return this;
}

  // TODO: Cast to Any JS Class wrap/cast? + test self-referentially with Rays???
  cast = <T extends Ray>(): T => { throw new NotImplementedError(); } // TODO this.proxy<T>();


  /**
 * JavaScript, possible compilations - TODO: Could have enumeratd possibilities, but just ignore that for now.
 */
// JS.AsyncGenerator
async *[Symbol.asyncIterator](): AsyncGenerator<Ray> { yield *this.traverse(); }
// JS.Generator
*[Symbol.iterator](): Generator<Ray> { yield *this.traverse(); }
// JS.AsyncGenerator
as_async_generator = (): AsyncGenerator<Ray> => this[Symbol.asyncIterator]();
// JS.AsyncIterator
as_async_iterator = (): AsyncIterator<Ray> => this.as_async_generator();
// JS.Iterator
as_generator = (): Generator<Ray> => this[Symbol.iterator]();
// JS.AsyncIterator
as_iterator = (): Iterator<Ray> => this.as_generator();
// JS.Array
as_array = (): Ray[] => [...this];
// JS.String
toString = (): string => this.as_string();
as_string = (): string => this.as_array().map(ref => ref.any.js).join(','); // TODO: PROPER

as_int = (): number => { throw new NotImplementedError(); }
as_number = this.as_int;

  // TODO: FIND OUT IF SOMEONE HAS A NAME FOR THIS
  // apply = (func: Ray) => {

// TODO: Combine into generalized [x, min/max()] - preserve terminal/initial structure
// TODO: ray#apply.
// TODO: FROM COMPOSER
/**
 *  const func = [min(), '', max()]
 *
 *      const [min_x, max_x] = [
 *       // Compute the min x-coordinate of the edges and vertices in the other graph.
 *       compose.terminal.x.min(), // min_other
 *
 *       // Compute the max x-coordinate of the edges and vertices in this graph.
 *       compose.initial.x.max(), // max_self
 *     ]
 */
// }

  // TODO: +default, in the case of Initial/Terminal = Ray.None, to which the default sometimes is nothing. Or in the case of min/max it's 0.

  // [this.vertices().x.max(), this.edges().x.max()].max()
  // [this.vertices().x.min(), this.edges().x.max()].max()
  // TODO: Indicies not corresponding the the directionality defined, are probably on another abstraction layer described this way. More accurately, they're directly connected, and on a separate layer with more stuff in between...
get index(): Ray { throw new NotImplementedError(); }
// TODO: Can probably generate these on the fly, or cache them automatically
// TODO: being called min.x needs to return the min value within that entire structure.

min = (_default: 0): Ray => { throw new NotImplementedError(); }
max = (_default: 0): Ray => { throw new NotImplementedError(); }

  map = (mapping: (ray: Ray) => Ray | any): Ray => { throw new NotImplementedError(); }
// filter = (mapping: (ray: Ray) => Ray | any): Ray => { throw new NotImplementedError(); }

  get clear(): Ray { throw new NotImplementedError(); }

  /**
 * TODO - Better 'value' here. (Use JS.Any??)
 *
 * TODO: All these should accept Ray values.
 *
 * .size, since .length is reserved by JavaScript.
 * TODO: .size could be more tensor-like, arbitrary lengths..
 */
// @alias('length', 'of_length')
static size = (of: number, value: any = undefined): Ray => {
  let ret: Ray | undefined;
  let current: Ray | undefined;
  // TODO: Actual good implementation: Should be lazy
  for (let i = 0; i < of; i++) {
    const vertex = Ray.vertex().o({js: value}).as_reference();

    if (!ret) {
      current = ret = vertex;
    } else {
      current = current?.compose(vertex);
    }
  }

  if (!ret)
    return Ray.None();

  return ret;
}
static at = (index: number, of: number, value: any = undefined): Ray => {
  return Ray.size(of, value).at(index);
}
/**
 * Just uses length/size for permutation. TODO: More complex permutation/enumeration implementation should follow at some point. (@see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=One%20of%20them%20could%20even%20be%20putting%20both%20our%20points%20on%20our%20selection for an example)
 *
 * @see "Combinatorics as Equivalence": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Combinatorics%20%2D%20Combinatorics%20as%20Equivalence
 */
static permutation = (permutation: number | undefined, of: number): Ray => Ray.at(
        // In the case of a bit: 2nd value for '1' (but could be the reverse, if our interpreter does this)
        permutation ?? 0,
        // In the case of a bit: Either |-*-| if no bit or |-*->-*-| if a bit.
        permutation === undefined ? 1 : of
)

at = (steps: number | Ray | JS.ParameterlessFunction<Ray>): Ray => {
  if (!JS.is_number(steps))
    throw new NotImplementedError('Not yet implemented for Rays.');

  // TODO: Actual good implementation - also doesn't support modular like this
  const array = [...this.traverse(
          steps < 0 ? Ray.directions.previous : Ray.directions.next
  )];

  steps = Math.abs(steps);

  return array.length > steps && steps >= 0 ? (
          array[steps] ?? Ray.None() // TODO FIX: Probably a JavaScript quirck with some weird numbers, just failsafe to None.
  ) : Ray.None();
}

// export const hexadecimal = (hexadecimal?: string): Arbitrary<Ray<any>> => permutation(hexadecimal ? parseInt(hexadecimal, 16) : undefined, 16);

```


export class Ray
  // implements
  // AsyncIterable<Ray>,
  // Iterable<Ray>
  // Array<Ray>
  // Dict??
{

  /**
   * JavaScript Array
   */
  // [n: number]: Ray;
  //
  // readonly [Symbol.unscopables]: { [K in keyof any[]]?: boolean };
  // length: number;
  //
  // [Symbol.iterator](): IterableIterator<Ray> {
  //   return undefined;
  // }
  //
  // at(index: number): Ray | undefined {
  //   return undefined;
  // }
  //
  // concat(...items: ConcatArray<Ray>[]): Ray[];
  // concat(...items: (ConcatArray<Ray> | Ray)[]): Ray[];
  // concat(...items: (ConcatArray<Ray> | Ray)[]): Ray[] {
  //   return [];
  // }
  //
  // copyWithin(target: number, start: number, end?: number): this {
  //   return undefined;
  // }
  //
  // entries(): IterableIterator<[number, Ray]> {
  //   return undefined;
  // }
  //
  // every<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): this is S[];
  // every(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): boolean;
  // every(predicate, thisArg?: any): any {
  // }
  //
  // fill(value: Ray, start?: number, end?: number): this {
  //   return undefined;
  // }
  //
  // filter<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): S[];
  // filter(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): Ray[];
  // filter(predicate, thisArg?: any): any {
  // }
  //
  // find<S extends Ray>(predicate: (value: Ray, index: number, obj: Ray[]) => value is S, thisArg?: any): S | undefined;
  // find(predicate: (value: Ray, index: number, obj: Ray[]) => unknown, thisArg?: any): Ray | undefined;
  // find(predicate, thisArg?: any): any {
  // }
  //
  // findIndex(predicate: (value: Ray, index: number, obj: Ray[]) => unknown, thisArg?: any): number {
  //   return 0;
  // }
  //
  // findLast<S extends Ray>(predicate: (value: Ray, index: number, array: Ray[]) => value is S, thisArg?: any): S | undefined;
  // findLast(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): Ray | undefined;
  // findLast(predicate, thisArg?: any): any {
  // }
  //
  // findLastIndex(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): number {
  //   return 0;
  // }
  //
  // flat<A, D = 1 extends number>(depth?: D): FlatArray<A, D>[] {
  //   return [];
  // }
  //
  // flatMap<U, This = undefined>(callback: (this: This, value: Ray, index: number, array: Ray[]) => (ReadonlyArray<U> | U), thisArg?: This): U[] {
  //   return [];
  // }
  //
  // forEach(callbackfn: (value: Ray, index: number, array: Ray[]) => void, thisArg?: any): void {
  // }
  //
  // includes(searchElement: Ray, fromIndex?: number): boolean {
  //   return false;
  // }
  //
  // indexOf(searchElement: Ray, fromIndex?: number): number {
  //   return 0;
  // }
  //
  // join(separator?: string): string {
  //   return "";
  // }
  //
  // keys(): IterableIterator<number> {
  //   return undefined;
  // }
  //
  // lastIndexOf(searchElement: Ray, fromIndex?: number): number {
  //   return 0;
  // }
  //
  // map<U>(callbackfn: (value: Ray, index: number, array: Ray[]) => U, thisArg?: any): U[] {
  //   return [];
  // }
  //
  // pop(): Ray | undefined {
  //   return undefined;
  // }
  //
  // push(...items: Ray[]): number {
  //   return 0;
  // }
  //
  // reduce(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray): Ray;
  // reduce(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray, initialValue: Ray): Ray;
  // reduce<U>(callbackfn: (previousValue: U, currentValue: Ray, currentIndex: number, array: Ray[]) => U, initialValue: U): U;
  // reduce(callbackfn, initialValue?): any {
  // }
  //
  // reduceRight(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray): Ray;
  // reduceRight(callbackfn: (previousValue: Ray, currentValue: Ray, currentIndex: number, array: Ray[]) => Ray, initialValue: Ray): Ray;
  // reduceRight<U>(callbackfn: (previousValue: U, currentValue: Ray, currentIndex: number, array: Ray[]) => U, initialValue: U): U;
  // reduceRight(callbackfn, initialValue?): any {
  // }
  //
  // reverse(): Ray[] {
  //   return [];
  // }
  //
  // shift(): Ray | undefined {
  //   return undefined;
  // }
  //
  // slice(start?: number, end?: number): Ray[] {
  //   return [];
  // }
  //
  // some(predicate: (value: Ray, index: number, array: Ray[]) => unknown, thisArg?: any): boolean {
  //   return false;
  // }
  //
  // sort(compareFn?: (a: Ray, b: Ray) => number): this {
  //   return undefined;
  // }
  //
  // splice(start: number, deleteCount?: number): Ray[];
  // splice(start: number, deleteCount: number, ...items: Ray[]): Ray[];
  // splice(start: number, deleteCount?: number, ...items: Ray[]): Ray[] {
  //   return [];
  // }
  //
  // toReversed(): Ray[] {
  //   return [];
  // }
  //
  // toSorted(compareFn?: (a: Ray, b: Ray) => number): Ray[] {
  //   return [];
  // }
  //
  // toSpliced(start: number, deleteCount: number, ...items: Ray[]): Ray[];
  // toSpliced(start: number, deleteCount?: number): Ray[];
  // toSpliced(start: number, deleteCount?: number, ...items: Ray[]): Ray[] {
  //   return [];
  // }
  //
  // unshift(...items: Ray[]): number {
  //   return 0;
  // }
  //
  // values(): IterableIterator<Ray> {
  //   return undefined;
  // }
  //
  // with(index: number, value: Ray): Ray[] {
  //   return [];
  // }

}

