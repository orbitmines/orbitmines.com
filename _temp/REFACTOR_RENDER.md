

```ts

//TODO USED FOR DEBUG NOW
move = (func: (self: Ray.Any) => Ray.Any, memory: boolean, Interface: Ray.Any): Ray.Any => {
  const target_ray = func(this.self);

  const target = target_ray.as_reference().o({
    ...this._dirty_store,
    position:
      target_ray.any.position
      ?? this.any.position
      ?? Ray.POSITION_OF_DOOM
  });
  console.log('move', `${this.self.label.split(' ')[0]} -> ${target.self.label.split(' ')[0]}`);

  if (memory) {
    if (!target_ray.any.traversed) {
      Interface.any.Ray.compose(target);
      target_ray.any.traversed = true;
    }
  } else {
    Interface.any.rays = [target];
  }

  return target;
}

static POSITION_OF_DOOM = [0, 100, 0]

// TODO: Abstract away as compilation
render_options = (Interface: Ray.Any): Required<InterfaceOptions> => {
  return ({
    position:
      this.any.position
      ?? (this.is_none() ? Ray.POSITION_OF_DOOM : Ray.Any.POSITION_OF_DOOM),
    rotation:
      this.any.rotation
      ?? [0, 0, 0],
    scale:
      this.any.scale
      ?? (this.is_none() ? 1.5 : 1.5),
    color:
      (Ray.is_orbit(Interface.any.selection.self, this.self) && Interface.any.cursor.tick) ? '#AAAAAA' // TODO: Should do lines as well, line render should prefer based on level of description.. (flat line only vertices, then render for the vertex?)
        : (
          this.any.color
          ?? (this.is_none() ? 'red' : {
              [RayType.VERTEX]: 'orange',
              [RayType.TERMINAL]: '#FF5555',
              [RayType.INITIAL]: '#5555FF',
              [RayType.REFERENCE]: '#555555',
            }[this.type]
          )
        )
  });
}

```