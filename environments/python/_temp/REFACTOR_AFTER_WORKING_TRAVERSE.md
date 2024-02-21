
// NOT NEEDED FOR INITIAL DEMONSTRATION:

```ts
// TODO: For chyp used to compare [vtype, size] as domains, just type matching on the vertex. ; each individually, again, additional structure...

// TODO: Ignore the connection between the two, say a.equiv(b) within some Rule [a,b], ignore the existing of the connection in the Rule? What does it mean not to???
is_vertex_equivalent = (b: Arbitrary.Any) => { # TODO; STUPID NAME dont use

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


  // TODO: FIND OUT IF SOMEONE HAS A NAME FOR THIS
 
// TODO: Combine into generalized [x, min/max()] - preserve terminal/initial structure
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
# Index with respect to 'something' - i.e. distance.
# The problem with index is that this, in respect to the context defined the direction of the Ray. Necessitates a notion of distance, which necessitates the notion of an orbit, ..., loop to be an ignorant one.
          
// TODO: Ray is already an index in the space around that if interpreted like that. In the actual index case, you just want to translate it to another level of description - relate them to each other.
get index(): Ray.Any { throw new NotImplementedError(); }

// TODO: Same with count, it's just translating the traversal to antoher level of descipriton/.
  get count(): Ray.Any { return JS.Number(this.as_array().length); }
  
// TODO: Can probably generate these on the fly, or cache them automatically
// TODO: being called min.x needs to return the min value within that entire structure.
  
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

