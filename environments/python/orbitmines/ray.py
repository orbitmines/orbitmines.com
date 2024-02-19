from __future__ import annotations

import inspect
from typing import Iterator, AsyncIterator, Union, Callable, Any, Iterable, AsyncIterable


# TODO: Restrictive cases:
# - TODO: Tensor as restrictive case
#
#

# TODO: Better python solution than just @ray everywhere (for typechecker)

def ray(func: Callable[[Any, ...], Any]) -> Ray: return func

class Ray:
  def __init__(self, *args, **kwargs):
      pass

  #
  # Basic Ray operators
  #

  # TODO: set = none;
  # TODO: Destroy the current thing, connect .initial & .terminal ? (can do just direct connection, preserves 'could have been something here') - then something like [self.initial, self, self.terminal].pop().
  # TODO: Leave behind --] [-- or connect them basically..
  @staticmethod
  @ray
  def none() -> Ray: return -Ray.some
  alloc = new = create = initialize \
    = none
  @staticmethod
  @ray
  def some() -> Ray: return -Ray.none
  self_reference \
    = some

  @ray
  def free(self): raise NotImplementedError
  destroy = clear = delete = pop \
    = free

  # An arbitrary Ray, defining what continuing in the reverse of this direction is equivalent to.
  # TODO: Note that whenever you have a self-reference through operators, that requires an implementation to break this self-reference. For example ray functionality only requires initial + negative, or terminal + negative, or initial + terminal, to make all the other three.
  @ray
  def initial(self) -> Ray: return (-self).terminal
  # An arbitrary Ray, defining what continuing in this direction is equivalent to.
  @ray
  def terminal(self) -> Ray: return (-self).initial

  # @see "Reversibility after ignoring some difference": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Another%20example%20of%20this%20is%20reversibility
  # @see "More accurately phrased as the assumption of Reversibility: with the potential of being violated.": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=On%20Assumptions%20%26%20Assumption%20Violation
  @ray
  def reverse(self) -> Ray:
    return Ray(initial=self.terminal, self=self.self, terminal=self.initial)
  neg = __neg__ = opposite = _not = converse = negative = swap \
    = reverse

  # An arbitrary Ray, defining what our current position is equivalent to.
  # Moving to the intersecting Ray at `.self` - as a way of going an abstraction layer (lower), and asking what's inside.
  @ray
  # @alias('dereference')
  def self(self) -> Ray: raise NotImplementedError

  # TODO: Like this, ignorant vs non-ignorant? What to do here?
  #   return vertex
  # TODO: These are very close to binary ops / makes sense since some/none is a boolean.
  #       /**
  #        * Placing existing structure on a new Reference, Boundary or Vertex:
  #        */
  #         // TODO: These should allow as_vertex as zero-ary, but that means self = self_reference, not none. ?
  #         /**
  #          * Moving `self` to `.self` on an abstraction layer (higher). As a way of being able to describe `self`.
  #          *
  #          * TODO: the .reference might need two levels of abstraction higher, one to put it at the .self, another to reference that thing? (Depends a bit on the execution layer)
  #          */
  #            // TODO as_reference.as_vertex instead of as_vertex ignorant by default?
  def as_reference(self) -> Ray: return Ray(initial=Ray.none, self=self, terminal=Ray.none)
  def as_vertex(self) -> Ray: return Ray(initial=Ray.some, self=self, terminal=Ray.some)
  def as_initial(self) -> Ray: return Ray(initial=Ray.none, self=self, terminal=Ray.some)
  def as_terminal(self) -> Ray: return Ray(initial=Ray.some, self=self, terminal=Ray.none)

  # An arbitrary Ray, defining what continuing in this direction is equivalent to.

  # This is basically what breaks the recursive structure.
  #
  # Tries for "global coherence", practically this just means self-reference, were no change is (inconsistently) assumed...
  #
  # ---
  #
  # Another way of interpreting a possible way of implementing it, is no matter how much more detail we would like to ask, the only thing we ever see is the same structure again (if we ignore the difference of us asking about that additional structure, that's still a possible handle on some difference).
  #
  # As a way of saying/.../assuming: I only 'infinitely' assume it's only this structure, "it seems to halt here". Note that this is necessarily an assumption. No guarantee of this can be made. This is necessarily an equivalence, ..., ignorance.
  #
  # @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Quite%20similarly%20to%20the%20loops%2C%20I%20could%20be%20ignorant%20of%20additional%20structure%20by%20assuming%20it%27s%20not%20there.
  # TODO: is none, ref, init terminal as global equiv check kn the structure? as generalization ; yep, is_orbit.
  #
  # Concretely, we use this as the thing which has power over the equivalence assumption we use to halt programs. - The asymmetry which allows the engine to make a distinction between each object.
  # @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=And%20there%20we%20have%20it%2C%20an%20infinity%2C%20loop%2C%20...%2C%20orbit%20if%20we%20ignore%20the%20difference.
  @ray
  # @alias('is_none')
  def is_orbit(a, b: Arbitrary) -> Ray: raise NotImplementedError # a.___instance === b.___instance
  __eq__ \
    = is_orbit
  @ray # TODO
  def is_none(self) -> Ray: return self.is_orbit(self, self.self)

  #
  # Predefined functionality
  #

  @ray
  # TODO is_initial = return (-self).terminal().is_none ??
  def is_initial(self) -> Ray: return self.initial().is_none
  @ray
  def is_terminal(self) -> Ray: return self.terminal().is_none                    # [?-|  ]
  @ray
  def is_vertex(self) -> Ray: return self.is_initial().nor(self.is_terminal())    # [--|--]
  @ray
  def is_reference(self) -> Ray: return self.is_initial() & self.is_terminal()    # [  |  ]
  @ray
  def is_boundary(self) -> Ray: return self.is_initial() ^ self.is_terminal()     # [?-|  ] or [  |-?]

  # TODO: .terminal/.initial is self() vs self.not()
  @ray
  def next(self) -> Ray: raise NotImplementedError
  forward \
    = next
  @ray
  def has_next(self) -> Ray: return self.next().is_some
  @ray
  def last(self) -> Ray: raise NotImplementedError
  end = result = back = output \
    = last

  # @see "Continuations as Equivalence (can often be done in parallel - not generally)": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Continuations%20%2D%20Continuations%20as%20Equivalence
  @ray
  # @alias('merge',
  def compose(a, b: Arbitrary) -> Ray: return a.terminal().equivalent(b.initial())
  continues_with \
    = compose

  # Equivalence as "Composition of Ray."
  #
  # NOTE:
  #  - An equivalence, is only a local equivalence, no global coherence of it can be guaranteed. And it is expensive work to edge towards global coherence.
  #  - Though changes are only applied locally, their effects can be global (Take for instance, the example of adding to one Ray, which changes the perspective of everything connected to that Ray if they were to traverse the connection).
  #
  # @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=On%20Equivalences%20%26%20Inconsistencies
  @ray
  def equivalent(a, b: Arbitrary) -> Ray:
    # raise NotImplementedError

    # TODO: This is close but not quite, use the shifting thing I wrote down a few days ago: (And then use something to break the self-reference) - Either on this side. compose, or outside the definitions
    # This one harder to do in parallel?
    return a.self().compose(b.self())

  # "Composing an terminal & initial boundary"
  # - TODO: Note that an orbit is reversibility. ?
  # - TODO: Could represent this abstraction in another layer what we want to accomplish while the actual search is still taking place.
  #
  # - Like with 'copy' and all concepts: Note that we're only after reversibility after ignoring some difference.
  #
  # @see "Reversibility is necessarily inconsistent": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Another%20example%20of%20this%20is%20reversibility
  @ray
  #@alias('modular', 'modulus',
  def orbit(a, b: Arbitrary) -> Ray:
    # - TODO: If we're only doing one end: This already assumes they are connected on the other end.
    # - TODO: should be a connection here, with is_composed ; or "reference.is_equivalent" so that you can drop one of the sides, or both.
    b.last().compose(a.first())
    a.first().compose(b.last())

    return a # TODO ?
  circle = repeats = infinitely \
    = orbit

  # "Applying the same thing in a different context"
  # TODO: Somewhat related to Functors?
  @ray
  def from_perspective_of(a, b):
    raise NotImplementedError
  @ray
  def perspective(self) -> Ray: raise NotImplementedError
  # TODO ; is parameters?

  #
  # If there exists an orbit between A & B anywhere on their equivalency functions - or: their .self - (except for the directions through which we're referencing them)
  #
  # Note the connection between 'is_orbit' vs 'is_equivalence'. They're essentially the same thing, but:
  #    - in the case of 'is_equivalence' we directly have access to their difference but are explicitly ignoring them - in the context in which this functionality is called.
  #    - in the case of 'is_orbit', we might need to do more complicated things to acknowledge their differences - we don't have direct access to them.
  #
  # TODO: (so dually connected, what if only one is aware??) Or basically just ; the answer in this particular instance is just if either end can find the other only once. Consistency of it defined on a more abstract level...
  #
  # a.self().traverse().is_orbit(b.self().traverse())
  # @alias('includes', 'contains') ; (slightly different variants?)
  @ray
  def is_equivalent(self) -> Ray: return self.is_composed.from_perspective_of(self.self)

  # TODO: Either is_equiv or is_composed will likely change?.
  # a.traverse().is_orbit(b.traverse()) // Basically: does there exist a single connection between the two?
  @ray
  def is_composed(self) -> Ray: return self.is_orbit.from_perspective_of(self.traverse) # Needs some ref from Ray.Function.Self.

  @staticmethod
  @ray
  def boolean() -> Ray: return Ray.none * 2
  bit \
    = boolean

  # TODO: This should accept Ray: Where 'size' is just a 'shape'
  # @alias('resize', 'size', 'structure', 'length', 'duplicate', 'copy', 'clone', 'times', 'mul', '__mul__') -> Should be generalized as any kind of structure, but with this thing repeated on it. ; use traversal or ...
  #
  # Performing a copy (realizing it) can be conceptualized as traversing the entire structure. (Where the 'entire structure' means the current instantiation of it - with many ignorances attached)
  #
  # - A problem with a copy, is that in or to be generalizable, it needs to alter all references to the thing it's copying to itself - this cannot be done with certainty.
  #    - This copy does not do that. Instead, it is ignorant of other things referencing the thing it's copying.
  # - Additionally, a copy necessarily has some non-redundancy to it:
  #
  # @see "A copy is necessarily inconsistent": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=If%20I%20have%20one%20thing%20and%20I%20make%20a%20perfect%20copy
  @ray
  def size(self, b: Arbitrary) -> Ray:
     # // or
     #    // (self) => self.self.copy.reference()
     #    (self) => none().self = self.self.copy()
     #
     #      // TODO Relies heavily on the execution layer to copy initial/terminal etc... ; and an is_orbit check before calling copy again. - Then again on the execution layer it can lazily do this copy (by not evaluating (i.e.) traversing everywhere), or it first does this traversing directly.

    pass
  # size = length = no params different behavior
  # resize = structure
  mul = __mul__ = times \
    = size
  # duplicate = copy = clone = size.from_perspective_of

  @ray
  def xor(a, b: Arbitrary) -> Ray: return -(a.xnor(b))
  __xor__ \
    = xor
  @ray
  def xnor(a, b: Arbitrary) -> Ray: raise NotImplementedError # TODO: Could be 'is_equivalent' too? or is_orbit
  @ray
  def nand(a, b: Arbitrary) -> Ray: return -(a & b)
  @ray
  def nor(a, b: Arbitrary) -> Ray: return -(a | b)

  @ray
  def add(a, b: Arbitrary) -> Ray: raise NotImplementedError
  __add__ \
    = add

  # TODO: -add = sub & others

  @ray
  def radd(self) -> Ray: return -self.add.perspective
  @ray
  def sub(a, b: Arbitrary) -> Ray: raise NotImplementedError
  __sub__ \
    = sub
  @ray
  def pow(a, b: Arbitrary) -> Ray: raise NotImplementedError
  __pow__ \
    = pow
  @ray
  def div(a, b: Arbitrary) -> Ray: raise NotImplementedError
  __truediv__ \
    = div
  @ray
  def mod(a, b: Arbitrary) -> Ray: raise NotImplementedError
  __mod__ \
    = mod
  @ray
  def matmul(a, b: Arbitrary) -> Ray: raise NotImplementedError
  __matmul__ \
    = matmul

  @ray
  # @alias(f'push_{last.alias}')
  def push_back(a, b: Arbitrary) -> Ray: return a.last().compose(b)

  #
  # Python runtime conversions
  # ; TODO: Could have enumerated possibilities, but just ignore that for now.
  #

  def as_iterator(self) -> Iterator[Ray]: return self
  def as_async_iterator(self) -> AsyncIterator[Ray]: return self
  def as_iterable(self) -> Iterable[Ray]: return self
  def as_async_iterable(self) -> AsyncIterable[Ray]: return self
  def as_string(self) -> str: raise NotImplementedError
  def as_int(self) -> int: raise NotImplementedError
  def as_list(self) -> list: raise NotImplementedError
  def as_tuple(self) -> tuple: raise NotImplementedError
  @staticmethod
  def as_javascript() -> str: raise NotImplementedError

  @staticmethod
  @ray
  def runtimes() -> Ray: raise NotImplementedError

  # TODO: Any function calls which do not return or are convertable to ray, convert as an operator.
  @staticmethod
  @ray
  def compiler() -> Ray: raise NotImplementedError

  # Ray is a function (.next)
  # TODO: In the case of tinygrad this is similar to .realize() ?
  def __call__(self, *args, **kwargs) -> Ray:
    print(f'__call__ {args} {kwargs}')
    # raise NotImplementedError
    return self
  map = render = compile = run \
    = __call__

  def __get__(self, instance, owner) -> Ray:
    print(f'__get__ {instance} {owner}')
    return self
    # raise NotImplementedError
  def __set__(self, instance, value) -> Ray: raise NotImplementedError
  def __delete__(self, instance) -> Ray: raise NotImplementedError

  def __iter__(self) -> Iterator[Ray]: return self.as_iterator()
  def __aiter__(self) -> AsyncIterator[Ray]: return self.as_async_iterator()
  def __next__(self) -> Ray: raise NotImplementedError
  async def __anext__(self) -> Ray: raise NotImplementedError

  # def __str__(self) -> str: return self.as_string()
  # def __repr__(self) -> str: raise NotImplementedError
  # def __hash__(self) -> str: raise NotImplementedError
  # def __bool__(self) -> bool: raise NotImplementedError

  def __and__(a, b: Arbitrary) -> Ray: raise NotImplementedError
  def __or__(a, b: Arbitrary) -> Ray: raise NotImplementedError

  # def __iadd__(a, b: Arbitrary) -> Ray: return a.assign(a.add(b))
  # def __isub__(a, b: Arbitrary) -> Ray: return a.assign(a.sub(b))
  # def __imul__(a, b: Arbitrary) -> Ray: return a.assign(a.mul(b))
  # def __ipow__(a, b: Arbitrary) -> Ray: return a.assign(a.pow(b))
  # def __itruediv__(a, b: Arbitrary) -> Ray: return a.assign(a.div(b))
  # def __imatmul__(a, b: Arbitrary) -> Ray: return a.assign(a.matmul(b))
  # def __ibor__(a, b: Arbitrary) -> Ray: return a.assign(a.bor(b))

  def __enter__(self) -> Ray: raise NotImplementedError
  def __exit__(self, exc_type, exc_val) -> Ray: raise NotImplementedError
  async def __aenter__(self) -> Ray: raise NotImplementedError
  async def __aexit__(self, exc_type, exc_val) -> Ray: raise NotImplementedError

  def __contains__(self, item): raise NotImplementedError
  def __delitem__(self, item): raise NotImplementedError
  def __getitem__(self, item): raise NotImplementedError
  def __setitem__(self, key, value): raise NotImplementedError
  def __floordiv__(self, item): raise NotImplementedError
  def __invert__(self): raise NotImplementedError
  def __lshift__(self, item): raise NotImplementedError
  def __pos__(self): raise NotImplementedError
  def __lt__(a, b: Arbitrary) -> Ray: raise NotImplementedError
  def __gt__(a, b: Arbitrary) -> Ray: raise NotImplementedError
  def __ge__(a, b: Arbitrary) -> Ray: raise NotImplementedError
  def __le__(a, b: Arbitrary) -> Ray: raise NotImplementedError
  def __ne__(a, b: Arbitrary) -> Ray: raise NotImplementedError

  #
  # Opposite aliases
  # TODO: Could just dynamically assign these
  #

  @ray
  def previous(self) -> Ray: return (-self).next
  backward \
    = previous
  @ray
  def has_previous(self) -> Ray: return (-self).has_next
  @ray
  def first(self) -> Ray: return (-self).last
  beginning = front \
    = first
  @ray
  def is_some(self) -> Ray: return (-self).is_none
  @ray
  # @alias(f'push_{first.alias}')
  def push_front(self) -> Ray: return (-self).push_back

  # Several ways of achieving these:
  #   -a.__add__.perspective(b)
  #   Ray(b).__add__(a)
  #   __add__ = -__add__.perspective (if python would allow for this)
  #   ; TODO could be automatic
  def __radd__(a, b: Arbitrary) -> Ray: return Ray(b).__add__(a)
  def __rsub__(a, b: Arbitrary) -> Ray: return Ray(b).__sub__(a)
  def __rmul__(a, b: Arbitrary) -> Ray: return Ray(b).__mul__(a)
  def __rpow__(a, b: Arbitrary) -> Ray: return Ray(b).__pow__(a)
  def __rtruediv__(a, b: Arbitrary) -> Ray: return Ray(b).__truediv__(a)
  def __rmatmul__(a, b: Arbitrary) -> Ray: return Ray(b).__matmul__(a)
  def __rxor__(a, b: Arbitrary) -> Ray: return Ray(b).__xor__(a)
  def __rfloordiv__(a, b: Arbitrary) -> Ray: return Ray(b).__floordiv__(a)

  #
  # Python runtime converters
  #

  @staticmethod
  def function(func: Callable[[Any, ...], Any]) -> Ray:
    return Ray()
  @staticmethod
  def integer(val: int) -> Ray: raise NotImplementedError
  @staticmethod
  def iterator(val: Iterator[Any]) -> Ray: raise NotImplementedError
  @staticmethod
  def iterable(val: Iterable[Any]) -> Ray: raise NotImplementedError
  @staticmethod
  def boolean(val: bool) -> Ray: raise NotImplementedError
  @staticmethod
  @ray
  def false(): return Ray.boolean(False)
  @staticmethod
  @ray
  def true(): return Ray.boolean(True)
  @staticmethod
  def obj(val: object) -> Ray: raise NotImplementedError
  @staticmethod
  def arbitrary(val: Arbitrary) -> Ray: raise NotImplementedError

  @staticmethod
  # - TODO: readonly setup, where only traversal ops are allowed. Of course these are writing in some sense, but those writings aren't directly accessible from this perspective
  def readonly() -> Ray: raise NotImplementedError

  # print(f'{type(func)}')
  # def method(*args, **kwargs) -> Ray:
  #   return Ray()

  # return await func(self, *args, **kwargs)
  # TODO: Binary on self is (a, a) like is_orbit(a, a) ?

  # By default a = -b is -b = a
  # __sub__ = -__add__
  # __add__ = -__sub__

for name, fn in inspect.getmembers(Ray, inspect.isfunction):
  if name.startswith('__'): continue
  print(f'{name}')
  setattr(Ray, name, Ray.function(fn))

# a: Callable[[Ray], Ray] = lambda self: self.is_terminal
setattr(Ray, '__mul__', Ray.function(Ray.size))

Arbitrary = Union[int, Ray]
