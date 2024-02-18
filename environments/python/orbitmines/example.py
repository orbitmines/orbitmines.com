from ray import Ray

# with python:
a = Ray.boolean
b = Ray.boolean

a, b = Ray.boolean * 2

# TODO: This is only if Ray.boolean is .orbit, otherwise reverse would be different.
b, a = -(Ray.boolean * 2)
