
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
copy = (): Ray.Any => {
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


  get count(): Ray.Any { return JS.Number(this.as_array().length); }


// TODO: For chyp used to compare [vtype, size] as domains, just type matching on the vertex. ; each individually, again, additional structure...

// TODO: Ignore the connection between the two, say a.equiv(b) within some Rule [a,b], ignore the existing of the connection in the Rule? What does it mean not to???
is_vertex_equivalent = (b: Ray.Any) => {

}


// none_or = (arbitrary: Implementation): Ray.Any => this.is_none() ? Ray.None() : arbitrary(this);


/**
 * https://en.wikipedia.org/wiki/Homoiconicity
 */
export interface PossiblyHomoiconic<T extends PossiblyHomoiconic<T>> {
  get self(): T;
  is_reference: () => boolean
  as_reference: () => T
}


  // zip also compose???
  // [a, b, c] zip [d, e, f] zip [g, h, i] ...
  // [[a,d,g],[b,e,h],[c,f,i]]
static zip = Ray.Function.Impl((initial, terminal) => {

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
o = (object: { [key: string | symbol]: any }): Ray.Any => {
  _.keys(object).forEach(key => this.proxy()[key] = object[key]); // TODO: Can be prettier, TODO: map to Ray equivalents and add to vertices..
  return this;
}

// All these are dirty
o2 = ({ initial, vertex, terminal }: any): Ray.Any => {
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
async *[Symbol.asyncIterator](): AsyncGenerator<Ray.Any> { yield *this.traverse(); }
// JS.Generator
*[Symbol.iterator](): Generator<Ray.Any> { yield *this.traverse(); }
// JS.AsyncGenerator
as_async_generator = (): AsyncGenerator<Ray.Any> => this[Symbol.asyncIterator]();
// JS.AsyncIterator
as_async_iterator = (): AsyncIterator<Ray.Any> => this.as_async_generator();
// JS.Iterator
as_generator = (): Generator<Ray.Any> => this[Symbol.iterator]();
// JS.AsyncIterator
as_iterator = (): Iterator<Ray.Any> => this.as_generator();
// JS.Array
as_array = (): Ray.Any[] => [...this];
// JS.String
toString = (): string => this.as_string();
as_string = (): string => this.as_array().map(ref => ref.any.js).join(','); // TODO: PROPER

as_int = (): number => { throw new NotImplementedError(); }
as_number = this.as_int;

  // TODO: FIND OUT IF SOMEONE HAS A NAME FOR THIS
  // apply = (func: Ray.Any) => {

// TODO: Combine into generalized [x, min/max()] - preserve terminal/initial structure
// TODO: Ray.Any#apply.
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
get index(): Ray.Any { throw new NotImplementedError(); }
// TODO: Can probably generate these on the fly, or cache them automatically
// TODO: being called min.x needs to return the min value within that entire structure.

min = (_default: 0): Ray.Any => { throw new NotImplementedError(); }
max = (_default: 0): Ray.Any => { throw new NotImplementedError(); }

  map = (mapping: (ray: Ray.Any) => Ray.Any | any): Ray.Any => { throw new NotImplementedError(); }
// filter = (mapping: (ray: Ray.Any) => Ray.Any | any): Ray.Any => { throw new NotImplementedError(); }

// @alias('length', 'of_length')
static size = (of: number, value: any = undefined): Ray.Any => {
  let ret: Ray.Any | undefined;
  let current: Ray.Any | undefined;
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
static at = (index: number, of: number, value: any = undefined): Ray.Any => {
  return Ray.size(of, value).at(index);
}
/**
 * Just uses length/size for permutation. TODO: More complex permutation/enumeration implementation should follow at some point. (@see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=One%20of%20them%20could%20even%20be%20putting%20both%20our%20points%20on%20our%20selection for an example)
 *
 * @see "Combinatorics as Equivalence": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Combinatorics%20%2D%20Combinatorics%20as%20Equivalence
 */
static permutation = (permutation: number | undefined, of: number): Ray.Any => Ray.Any.at(
        // In the case of a bit: 2nd value for '1' (but could be the reverse, if our interpreter does this)
        permutation ?? 0,
        // In the case of a bit: Either |-*-| if no bit or |-*->-*-| if a bit.
        permutation === undefined ? 1 : of
)

at = (steps: number | Ray | JS.ParameterlessFunction<Ray.Any>): Ray.Any => {
  if (!JS.is_number(steps))
    throw new NotImplementedError('Not yet implemented for Ray.');

  // TODO: Actual good implementation - also doesn't support modular like this
  const array = [...this.traverse(
          steps < 0 ? Ray.directions.previous : Ray.Any.directions.next
  )];

  steps = Math.abs(steps);

  return array.length > steps && steps >= 0 ? (
          array[steps] ?? Ray.None() // TODO FIX: Probably a JavaScript quirck with some weird numbers, just failsafe to None.
  ) : Ray.Any.None();
}

// export const hexadecimal = (hexadecimal?: string): Arbitrary<Ray<any>> => permutation(hexadecimal ? parseInt(hexadecimal, 16) : undefined, 16);

```


export class Ray
  // implements
  // AsyncIterable<Ray.Any>,
  // Iterable<Ray.Any>
  // Array<Ray.Any>
  // Dict??
{

  /**
   * JavaScript Array
   */
  // [n: number]: Ray.Any;
  //
  // readonly [Symbol.unscopables]: { [K in keyof any[]]?: boolean };
  // length: number;
  //
  // [Symbol.iterator](): IterableIterator<Ray.Any> {
  //   return undefined;
  // }
  //
  // at(index: number): Ray.Any | undefined {
  //   return undefined;
  // }
  //
  // concat(...items: ConcatArray<Ray.Any>[]): Ray.Any[];
  // concat(...items: (ConcatArray<Ray.Any> | Ray)[]): Ray.Any[];
  // concat(...items: (ConcatArray<Ray.Any> | Ray)[]): Ray.Any[] {
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
  // every<S extends Ray>(predicate: (value: Ray.Any, index: number, array: Ray.Any[]) => value is S, thisArg?: any): this is S[];
  // every(predicate: (value: Ray.Any, index: number, array: Ray.Any[]) => unknown, thisArg?: any): boolean;
  // every(predicate, thisArg?: any): any {
  // }
  //
  // fill(value: Ray.Any, start?: number, end?: number): this {
  //   return undefined;
  // }
  //
  // filter<S extends Ray>(predicate: (value: Ray.Any, index: number, array: Ray.Any[]) => value is S, thisArg?: any): S[];
  // filter(predicate: (value: Ray.Any, index: number, array: Ray.Any[]) => unknown, thisArg?: any): Ray.Any[];
  // filter(predicate, thisArg?: any): any {
  // }
  //
  // find<S extends Ray>(predicate: (value: Ray.Any, index: number, obj: Ray.Any[]) => value is S, thisArg?: any): S | undefined;
  // find(predicate: (value: Ray.Any, index: number, obj: Ray.Any[]) => unknown, thisArg?: any): Ray.Any | undefined;
  // find(predicate, thisArg?: any): any {
  // }
  //
  // findIndex(predicate: (value: Ray.Any, index: number, obj: Ray.Any[]) => unknown, thisArg?: any): number {
  //   return 0;
  // }
  //
  // findLast<S extends Ray>(predicate: (value: Ray.Any, index: number, array: Ray.Any[]) => value is S, thisArg?: any): S | undefined;
  // findLast(predicate: (value: Ray.Any, index: number, array: Ray.Any[]) => unknown, thisArg?: any): Ray.Any | undefined;
  // findLast(predicate, thisArg?: any): any {
  // }
  //
  // findLastIndex(predicate: (value: Ray.Any, index: number, array: Ray.Any[]) => unknown, thisArg?: any): number {
  //   return 0;
  // }
  //
  // flat<A, D = 1 extends number>(depth?: D): FlatArray<A, D>[] {
  //   return [];
  // }
  //
  // flatMap<U, This = undefined>(callback: (this: This, value: Ray.Any, index: number, array: Ray.Any[]) => (ReadonlyArray<U> | U), thisArg?: This): U[] {
  //   return [];
  // }
  //
  // forEach(callbackfn: (value: Ray.Any, index: number, array: Ray.Any[]) => void, thisArg?: any): void {
  // }
  //
  // includes(searchElement: Ray.Any, fromIndex?: number): boolean {
  //   return false;
  // }
  //
  // indexOf(searchElement: Ray.Any, fromIndex?: number): number {
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
  // lastIndexOf(searchElement: Ray.Any, fromIndex?: number): number {
  //   return 0;
  // }
  //
  // map<U>(callbackfn: (value: Ray.Any, index: number, array: Ray.Any[]) => U, thisArg?: any): U[] {
  //   return [];
  // }
  //
  // pop(): Ray.Any | undefined {
  //   return undefined;
  // }
  //
  // push(...items: Ray.Any[]): number {
  //   return 0;
  // }
  //
  // reduce(callbackfn: (previousValue: Ray.Any, currentValue: Ray.Any, currentIndex: number, array: Ray.Any[]) => Ray.Any): Ray.Any;
  // reduce(callbackfn: (previousValue: Ray.Any, currentValue: Ray.Any, currentIndex: number, array: Ray.Any[]) => Ray.Any, initialValue: Ray.Any): Ray.Any;
  // reduce<U>(callbackfn: (previousValue: U, currentValue: Ray.Any, currentIndex: number, array: Ray.Any[]) => U, initialValue: U): U;
  // reduce(callbackfn, initialValue?): any {
  // }
  //
  // reduceRight(callbackfn: (previousValue: Ray.Any, currentValue: Ray.Any, currentIndex: number, array: Ray.Any[]) => Ray.Any): Ray.Any;
  // reduceRight(callbackfn: (previousValue: Ray.Any, currentValue: Ray.Any, currentIndex: number, array: Ray.Any[]) => Ray.Any, initialValue: Ray.Any): Ray.Any;
  // reduceRight<U>(callbackfn: (previousValue: U, currentValue: Ray.Any, currentIndex: number, array: Ray.Any[]) => U, initialValue: U): U;
  // reduceRight(callbackfn, initialValue?): any {
  // }
  //
  // reverse(): Ray.Any[] {
  //   return [];
  // }
  //
  // shift(): Ray.Any | undefined {
  //   return undefined;
  // }
  //
  // slice(start?: number, end?: number): Ray.Any[] {
  //   return [];
  // }
  //
  // some(predicate: (value: Ray.Any, index: number, array: Ray.Any[]) => unknown, thisArg?: any): boolean {
  //   return false;
  // }
  //
  // sort(compareFn?: (a: Ray.Any, b: Ray.Any) => number): this {
  //   return undefined;
  // }
  //
  // splice(start: number, deleteCount?: number): Ray.Any[];
  // splice(start: number, deleteCount: number, ...items: Ray.Any[]): Ray.Any[];
  // splice(start: number, deleteCount?: number, ...items: Ray.Any[]): Ray.Any[] {
  //   return [];
  // }
  //
  // toReversed(): Ray.Any[] {
  //   return [];
  // }
  //
  // toSorted(compareFn?: (a: Ray.Any, b: Ray.Any) => number): Ray.Any[] {
  //   return [];
  // }
  //
  // toSpliced(start: number, deleteCount: number, ...items: Ray.Any[]): Ray.Any[];
  // toSpliced(start: number, deleteCount?: number): Ray.Any[];
  // toSpliced(start: number, deleteCount?: number, ...items: Ray.Any[]): Ray.Any[] {
  //   return [];
  // }
  //
  // unshift(...items: Ray.Any[]): number {
  //   return 0;
  // }
  //
  // values(): IterableIterator<Ray.Any> {
  //   return undefined;
  // }
  //
  // with(index: number, value: Ray.Any): Ray.Any[] {
  //   return [];
  // }

}

