from ray import Ray, ray

print('test')

# Target first implementation

@Ray.function
def test() -> Ray:
  a = Ray.none; b = Ray.none
  a, b = Ray.none * 2
  a, b = Ray.boolean
  *a, b = Ray.boolean
  a, *b = Ray.boolean
  a, *between, b = Ray.boolean
  b, none = -Ray.boolean
  b, a = -Ray.boolean.orbit
  a, b = --Ray.boolean.orbit
  b, a = ---Ray.boolean.orbit
  a, b = --Ray.boolean

  # TODO: Normal way of talking about a boolean, or probably any concept, is that this is always with .orbit on it. And without .orbit it's probably a weird case. We assume modularity of booleans.

  # TODO: This is only if Ray.boolean is .orbit, otherwise reverse would be different.

# Compile the function to javascript
print(test.as_javascript())
# Compile the Compiler (i.e. Ray functionality) to javascript
print(Ray.as_javascript()) # Ray.compiler = test.compiler = Ray.compiler.compiler

# test.runtimes.javascript()
test.run(lambda ray: ray)
# Ray.runtime(lambda ray: ray).run(test)

# class Object(Ray):
#   @property
#   def initial(self) -> Ray: raise NotImplementedError
#   @property
#   def self(self) -> Ray: raise NotImplementedError
#   @property
#   def terminal(self) -> Ray: raise NotImplementedError

test.compile(lambda ray: ray)
Ray.compile(lambda ray: ray)

# test.compile(python).run(python)

# These should be the same
# def add(self) -> Ray: return -self.sub
# def sub(self) -> Ray: return -self.add
# def add(a, b: Arbitrary) -> Ray: return (-self.sub)(b)
# def sub(a, b: Arbitrary) -> Ray: return (-self.add)(b)
# add = -sub
# sub = -add
# [add, sub].orbit