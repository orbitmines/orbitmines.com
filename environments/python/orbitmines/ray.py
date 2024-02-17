from __future__ import annotations

from typing import Iterator, AsyncIterator


def alias(*aliases: str):
  def decorated(func):
    # @functools.wraps(func)
    # async def method(self, *args, **kwargs):
    #     return await func(self, *args, **kwargs)

    return func

  return decorated

# TODO: Restrictive cases:
# - TODO: readonly setup, where only traversal ops are allowed. Of course these are writing in some sense, bit those writings aren't directly accessible from this perspective
# - TODO: Tensor as restrictive case
#
#

# TODO: Better python solution than just @method everywhere (for typechecker)
def method(func) -> Ray:
  # def method(self, *args, **kwargs) -> Ray:
  #   pass
  # return await func(self, *args, **kwargs)
  # TODO: Binary on self is (a, a) like is_orbit(a, a) ?

  return property(func)

class Ray:

  def __init__(self):
      pass


  #
  # Basic Ray operators
  #

  # TODO: set = none;
  # TODO: Destroy the current thing, connect .initial & .terminal ? (can do just direct connection, preserves 'could have been something here') - then something like [self.initial, self, self.terminal].pop().
  # TODO: Leave behind --] [-- or connect them basically..
  @staticmethod
  # @alias('alloc', 'new', 'create', 'initialize')
  def none() -> Ray: pass
  
  @method
  # @alias('free', 'destroy', 'clear', 'delete', 'pop')
  def free(self): pass

  # An arbitrary Ray, defining what continuing in the reverse of this direction is equivalent to.
  @method
  def initial(self) -> Ray: pass
  # An arbitrary Ray, defining what our current position is equivalent to.
  # Moving to the intersecting Ray at `.self` - as a way of going an abstraction layer (lower), and asking what's inside.
  @method
  # @alias('dereference')
  def self(self) -> Ray: pass
  # An arbitrary Ray, defining what continuing in this direction is equivalent to.
  @method
  def terminal(self) -> Ray: pass

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
  @method
  # @alias('is_none')
  def is_orbit(a, b: Ray) -> Ray: pass # a.___instance === b.___instance
  @method
  def is_none(self) -> Ray: return self.is_orbit(self, self.self)

  #
  # Predefined functionality
  #

  @method
  def is_initial(self) -> Ray: return self.initial().is_none                      # [  |-?]
  @method
  def is_terminal(self) -> Ray: return self.terminal().is_none                    # [?-|  ]
  @method
  def is_vertex(self) -> Ray: return self.is_initial().nor(self.is_terminal())    # [--|--]
  @method
  def is_reference(self) -> Ray: return self.is_initial() & self.is_terminal()    # [  |  ]
  @method
  def is_boundary(self) -> Ray: return self.is_initial() ^ self.is_terminal()     # [?-|  ] or [  |-?]

  # TODO: .terminal/.initial is self() vs self.not()
  @method
  def next(self) -> Ray: pass
  @method
  def has_next(self) -> Ray: return self.next().is_some
  @method
  @alias('end', 'result', 'back', 'output')
  def last(self) -> Ray: pass

  # @see "Continuations as Equivalence (can often be done in parallel - not generally)": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Constructing%20Continuations%20%2D%20Continuations%20as%20Equivalence
  @method
  @alias('merge', 'continues_with')
  def compose(a, b: Ray) -> Ray: return a.terminal().equivalent(b.initial())

  # "Composing an terminal & initial boundary"
  # - TODO: Note that an orbit is reversibility. ?
  # - TODO: Could represent this abstraction in another layer what we want to accomplish while the actual search is still taking place.
  #
  # - Like with 'copy' and all concepts: Note that we're only after reversibility after ignoring some difference.
  #
  # @see "Reversibility is necessarily inconsistent": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=Another%20example%20of%20this%20is%20reversibility
  @method
  @alias('modular', 'modulus', 'circle', 'repeats', 'infinitely')
  def orbit(a, b: Ray) -> Ray:
    # - TODO: If we're only doing one end: This already assumes they are connected on the other end.
    # - TODO: should be a connection here, with is_composed ; or "reference.is_equivalent" so that you can drop one of the sides, or both.
    b.last().compose(a.first())
    a.first().compose(b.last())
    
    return a # TODO ?

  # Equivalence as "Composition of Ray."
  #
  # NOTE:
  #  - An equivalence, is only a local equivalence, no global coherence of it can be guaranteed. And it is expensive work to edge towards global coherence.
  #  - Though changes are only applied locally, their effects can be global (Take for instance, the example of adding to one Ray, which changes the perspective of everything connected to that Ray if they were to traverse the connection).
  #
  # @see https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=On%20Equivalences%20%26%20Inconsistencies
  @method
  def equivalent(a, b: Ray) -> Ray:
    # raise NotImplementedError
    
    # TODO: This is close but not quite, use the shifting thing I wrote down a few days ago: (And then use something to break the self-reference) - Either on this side. compose, or outside the definitions
    # This one harder to do in parallel?
    return a.self().compose(b.self())

  # "Applying the same thing in a different context"
  # TODO: Somewhat related to Functors?
  @method
  def from_perspective_of(a, b):
    raise NotImplementedError

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
  @method
  def is_equivalent(self) -> Ray: return self.is_composed.from_perspective_of(self.self)

  # TODO: Either is_equiv or is_composed will likely change?.
  # a.traverse().is_orbit(b.traverse()) // Basically: does there exist a single connection between the two?
  @method
  def is_composed(self) -> Ray: return self.is_orbit.from_perspective_of(self.traverse) # Needs some ref from Ray.Function.Self.

  @method
  @alias('opposite', 'not', 'reverse', 'swap', 'converse', 'negative', 'neg')
  def reverse(self) -> Ray: pass

  @staticmethod
  @alias('bit', 'bool')
  def boolean() -> Ray: return Ray.none().size(2)
  
  # TODO: This should accept Ray: Where 'size' is just a 'shape'
  # @alias('resize', 'size', 'structure', 'length', 'duplicate', 'copy', 'clone') -> Should be generalized as any kind of structure, but with this thing repeated on it. ; use traversal or ...
  # 
  # Performing a copy (realizing it) can be conceptualized as traversing the entire structure. (Where the 'entire structure' means the current instantiation of it - with many ignorances attached)
  #
  # - A problem with a copy, is that in or to be generalizable, it needs to alter all references to the thing it's copying to itself - this cannot be done with certainty.
  #    - This copy does not do that. Instead, it is ignorant of other things referencing the thing it's copying.
  # - Additionally, a copy necessarily has some non-redundancy to it:
  #
  # @see "A copy is necessarily inconsistent": https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies#:~:text=If%20I%20have%20one%20thing%20and%20I%20make%20a%20perfect%20copy
  def size(self, b: int) -> Ray: 
     # // or
     #    // (self) => self.self.copy.reference()
     #    (self) => none().self = self.self.copy()
     #
     #      // TODO Relies heavily on the execution layer to copy initial/terminal etc... ; and an is_orbit check before calling copy again. - Then again on the execution layer it can lazily do this copy (by not evaluating (i.e.) traversing everywhere), or it first does this traversing directly.
 
    pass

  @method
  def xor(a, b: Ray) -> Ray: return -(a.xnor(b))
  @method
  def xnor(a, b: Ray) -> Ray: pass # TODO: Could be 'is_equivalent' too? or is_orbit
  @method
  def nand(a, b: Ray) -> Ray: return -(a & b)
  @method
  def nor(a, b: Ray) -> Ray: return -(a | b)

  @method
  def add(a, b: Ray) -> Ray: pass
  @method
  def sub(a, b: Ray) -> Ray: pass
  @method
  def mul(a, b: Ray) -> Ray: pass
  @method
  def pow(a, b: Ray) -> Ray: pass
  @method
  def div(a, b: Ray) -> Ray: pass
  @method
  def matmul(a, b: Ray) -> Ray: pass

  @method
  # @alias(f'push_{last.alias}')
  def push_back(a, b: Ray) -> Ray: return a.last().compose(b)

  #
  # Python runtime conversions
  # ; TODO: Could have enumerated possibilities, but just ignore that for now.
  #

  def as_iterator(self) -> Iterator[Ray]: return self
  def as_async_iterator(self) -> AsyncIterator[Ray]: return self

  # Ray is a function (.next)
  # TODO: In the case of tinygrad this is similar to .realize() ?
  def __call__(self, *args, **kwargs) -> Ray: pass

  def __get__(self, instance, owner) -> Ray: pass
  def __set__(self, instance, value) -> Ray: pass
  def __delete__(self, instance) -> Ray: pass

  def __iter__(self) -> Iterator[Ray]: return self
  def __aiter__(self) -> AsyncIterator[Ray]: return self
  def __next__(self) -> Ray: return self.next()
  async def __anext__(self) -> Ray: return self.next()

  def __neg__(self) -> Ray: return self.reverse()

  def __and__(a, b: Ray) -> Ray: pass
  def __or__(a, b: Ray) -> Ray: pass

  def __xor__(a, b: Ray) -> Ray: return a.xor(b)
  def __add__(a, b: Ray) -> Ray: return a.add(b)
  def __sub__(a, b: Ray) -> Ray: return a.sub(b)
  def __mul__(a, b: Ray) -> Ray: return a.mul(b)
  def __pow__(a, b: Ray) -> Ray: return a.pow(b)
  def __truediv__(a, b: Ray) -> Ray: return a.div(b)
  def __matmul__(a, b: Ray) -> Ray: return a.matmul(b)

  # def __iadd__(a, b: Ray) -> Ray: return a.assign(a.add(b))
  # def __isub__(a, b: Ray) -> Ray: return a.assign(a.sub(b))
  # def __imul__(a, b: Ray) -> Ray: return a.assign(a.mul(b))
  # def __ipow__(a, b: Ray) -> Ray: return a.assign(a.pow(b))
  # def __itruediv__(a, b: Ray) -> Ray: return a.assign(a.div(b))
  # def __imatmul__(a, b: Ray) -> Ray: return a.assign(a.matmul(b))
  # def __ibor__(a, b: Ray) -> Ray: return a.assign(a.bor(b))

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
  def __mod__(self, other): raise NotImplementedError
  def __pos__(self): raise NotImplementedError
  def __lt__(a, b: Ray) -> Ray: raise NotImplementedError
  def __gt__(a, b: Ray) -> Ray: raise NotImplementedError
  def __ge__(a, b: Ray) -> Ray: raise NotImplementedError
  def __le__(a, b: Ray) -> Ray: raise NotImplementedError
  def __eq__(a, b: Ray) -> Ray: raise NotImplementedError
  def __ne__(a, b: Ray) -> Ray: raise NotImplementedError
  
  #
  # Opposite aliases
  # TODO: Could just dynamically assign these
  #

  @method
  def previous(self) -> Ray: return (-self).next
  @method
  def has_previous(self) -> Ray: return (-self).has_next
  @method
  @alias('beginning', 'front')
  def first(self) -> Ray: return (-self).last
  @method
  def is_some(self) -> Ray: return (-self).is_none
  @method
  # @alias(f'push_{first.alias}')
  def push_front(self) -> Ray: return (-self).push_back

  def __radd__(a, b: Ray) -> Ray: return (-a).__add__(b)
  def __rsub__(a, b: Ray) -> Ray: return (-a).__sub__(b)
  def __rmul__(a, b: Ray) -> Ray: return (-a).__mul__(b)
  def __rpow__(a, b: Ray) -> Ray: return (-a).__pow__(b)
  def __rtruediv__(a, b: Ray) -> Ray: return (-a).__truediv__(b)
  def __rmatmul__(a, b: Ray) -> Ray: return (-a).__matmul__(b)
  def __rxor__(a, b: Ray) -> Ray: return (-a).__xor__(b)
