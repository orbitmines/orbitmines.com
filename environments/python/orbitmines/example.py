from ray import Ray

print('test')

# Target first implementation

@Ray.function
def test() -> Ray:
  a = Ray.boolean
  b = Ray.boolean

  a, b = Ray.boolean * 2

  # TODO: This is only if Ray.boolean is .orbit, otherwise reverse would be different.
  b, a = -(Ray.boolean * 2)

# Compile the function to javascript
print(test.as_javascript())
# Compile the Compiler (i.e. Ray functionality) to javascript
print(Ray.as_javascript()) # Ray.compiler = test.compiler = Ray.compiler.compiler

# test.runtimes.javascript()
test.run(lambda ray: ray)
# Ray.runtime(lambda ray: ray).run(test)

test.compile(lambda ray: ray)
Ray.compile(lambda ray: ray)

# test.compile(python).run(python)
