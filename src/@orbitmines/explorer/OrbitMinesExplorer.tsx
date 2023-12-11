import React, {useEffect, useRef, useState} from 'react';
import {from_boolean, from_iterable, JS, Ray, RayType} from "./Ray";
import {VisualizationCanvas} from "./Visualization";
import {Circle, QuadraticBezierLine, Text, Torus} from "@react-three/drei";
import {useFrame, useThree, Vector3} from "@react-three/fiber";
import {useDrag} from "@use-gesture/react";
import {useSpring} from '@react-spring/three'
import {useHotkeys} from "../../lib/react-hooks/modules/useHotkeys";
import JetBrainsMonoRegular from "../../lib/layout/font/fonts/JetBrainsMono/ttf/JetBrainsMono-Regular.ttf";
import {WebGLRenderTarget} from "three";
import {Option} from "../js/utils/Option";
import _ from "lodash";

const Test = () => {
  // const set = useContext(context);
  // const state = useMemo(() => ({ position: pos, connectedTo }), [pos, connectedTo])
  // // Register this node on mount, unregister on unmount
  //
  // useLayoutEffect(() => {
  //   set((nodes) => [...nodes, state])
  //   return () => void set((nodes) => nodes.filter((n) => n !== state))
  // }, [state, pos])
  //
  // const [pos, setPos] = useState(() => new THREE.Vector3(...position))
  // const { size, camera } = useThree()
  //
  // const bind = useDrag(({ down, xy: [x, y] }) => {
  //   document.body.style.cursor = down ? 'grabbing' : 'grab'
  //   setPos(new THREE.Vector3((x / size.width) * 2 - 1, -(y / size.height) * 2 + 1, 0).unproject(camera).multiply({ x: 1, y: 1, z: 0 }).clone())
  // });

  const ref = useRef<any>();

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  const [position, setPosition] = useState([0, 0, 0]);
  const [movement, setMovement] = useState([0, 0, 0]);

  // Set the drag hook and define component movement based on gesture data.
  const bind = useDrag(({ down, movement: [mx, my] }) => {
    api.start({ x: down ? mx : 0, y: down ? my : 0, immediate: down });
    if (down) {
      setMovement([x.get(), -y.get(), 0]);
    } else {
      setPosition([position[0] + x.get(), position[1] - y.get(), 0]);
      setMovement([0, 0, 0])
    }
  });

  const circle = {
    radius: 3,
    color: "orange",
    segments: 30,
    position: [0, 0, 0] as [number, number, number]
  }

  const torus = {
    // Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
    radius: 3,
    color: "orange",
    tube: {
      width: 1,
      segments: 200
    },
    segments: 200,

    initial: {
      position: [circle.position[0] - 25 + 5, circle.position[1], circle.position[2]] as [number, number, number]
    },
    terminal: {
      position: [circle.position[0] + 25 - 5, circle.position[1], circle.position[2]] as [number, number, number]
    }
  }
  const line = {
    width: 2,
    length: 1,
    color: "orange",

    initial: {
      position: [torus.initial.position[0] + torus.radius, torus.initial.position[1], torus.initial.position[2]] as [number, number, number]
    },
    vertex: {
      position: circle.position,
    },
    terminal: {
      position: [torus.terminal.position[0] - torus.radius, torus.terminal.position[1], torus.terminal.position[2]] as [number, number, number]
    }
  }

  const scale = 1.5;

  let props: any = {};
  return (
    <group ref={ref} {...bind()} scale={scale} position={[position[0] + movement[0], position[1] + movement[1], position[2] + movement[2]]} {...props}>
      <Torus args={[torus.radius, torus.tube.width, torus.segments, torus.tube.segments]} material-color="orange" position={torus.initial.position} />
      <Circle position={circle.position} material-color={circle.color} args={[circle.radius, circle.segments]} />
      <QuadraticBezierLine start={line.initial.position} mid={line.vertex.position} end={line.terminal.position} color={line.color} lineWidth={line.width * scale} />
      <Torus ref={ref} args={[torus.radius, torus.tube.width, torus.segments, torus.tube.segments]} {...bind()} material-color="orange" position={torus.terminal.position} {...props} />

      {/*<group rotation={[0, 0, Math.PI / 2]}>*/}
      {/*  <Text color="white" font={JetBrainsMonoRegular} anchorX="center" anchorY="middle" scale={30.0}>*/}
      {/*    O*/}
      {/*  </Text>*/}
      {/*</group>*/}
      <group position={[0, 15, 0]}>
        <Text color="white" font={JetBrainsMonoRegular} anchorX="center" anchorY="middle" scale={20.0}>
          O
        </Text>
      </group>
    </group>
  )
}

class InterfaceObject {


  // position = (): Vector3 => {}
  //
  // pixels = (): Vector3 => {}

  /**
   * As long as the setup cannot itself render objects and have access to that level of the stack, it will merely be an inaccessible translation layer between the two.
   */
  render = () => {
    // Translates to ThreeJS (
  }

  /**
   * - ThreeJS layer
   * - 3D layer
   * - camera position
   *
   * Generalize these
   * - Any layer
   * - Any "camera"/observer, different rays.
   */


}

const Co = () => {
  const { gl: renderer, camera, scene, raycaster } = useThree();

  const renderTarget = new WebGLRenderTarget(renderer.domElement.width, renderer.domElement.height);

  // From a position, retrieve a directionality which defines what is at that position.
  // const position = (position: Vector3): Extreme> => {
  //   // const ray = new Raycaster(new THREEVector3(0, 0, 0), new THREEVector3(0, 0, 1))
  //   // const intersections = ray.intersectObjects(scene.children, true);
  //   // console.log(intersections.length)
  //   // intersections.forEach(intersection => console.log(intersection.object.id))
  //
  //   return Arbitrary.Ref(Option.None);
  // }
  //
  // useFrame(() => {
  //   renderer.setRenderTarget(renderTarget);
  //   renderer.render(scene, camera)
  //   renderer.setRenderTarget(null)
  //
  //   const canvasX = (0 + 1) / 2 * renderTarget.width;
  //   const canvasY = (-0 + 1) / 2 * renderTarget.height;
  //
  //   const pixelBuffer = new Uint8Array(4);
  //   renderer.readRenderTargetPixels(renderTarget, canvasX, canvasY, 1, 1, pixelBuffer);
  //
  //   // Access pixel values
  //   const red = pixelBuffer[0];
  //   const green = pixelBuffer[1];
  //   const blue = pixelBuffer[2];
  //   const alpha = pixelBuffer[3];
  //
  //   const pos = position([0, 0, 0]);
  // });

  return <>
  </>
}

// declare namespace OrbitMines {

const OrbitMinesExplorer = () => {
  // const link = document.createElement('a')
  // link.setAttribute('download', 'canvas.png')
  // link.setAttribute('href', gl.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
  // link.click()

  const ray = JS.Iterable([14, 15, [[6, 7, 8, 9, 10, 11], 100], 1, 2, 3, 4, 5, 16, false]).as_ray();
  // const ray = JS.Iterable([false]).as_ray();
  // const ray = JS.Iterable([1]).as_ray();

  const hyperEdges: string[][] = [];
  const options: any = {};
  let label = 0;

  const vertexStyle = (reference: Option<Ray>): string => {
    switch (reference.force().type()) {
      case RayType.INITIAL:{
        return 'Darker@Red'
      }
      case RayType.TERMINAL: {
        return 'Lighter@Red'
      }
      case RayType.REFERENCE: {
        return 'Orange'
      }
      case RayType.VERTEX: {
        return 'Lighter@Blue'
      }
    }
  }
  const get = (reference: Option<Ray>): Option<string> => {
    const vertex = reference.match({ Some: (ref) => ref.vertex(), None: () => Option.None });
    if (vertex.is_some() && (vertex.force() as any)["__label"] !== undefined)
      return Option.Some((vertex.force() as any)["__label"] as string);

    return Option.None;
  }

  ray.force().compile<string, string[]>({
    directionality: {
      new: () => {
        const edge: string[] = [];
        hyperEdges.push(edge);
        return edge;
      },
      push_back: function (directionality: string[], ray: Option<string>): void {
        if (ray.is_some())
          directionality.push(ray.force());
      }
    },
    convert: function (reference: Option<Ray>): Option<string> {
      const existing = get(reference);
      if (existing.is_some())
        return existing;

      if (reference.is_none() || reference.force().vertex().is_none())
        return Option.None;

      label++;

      const vertex = reference.force().vertex();

      const name: string = `"${vertex.force().js().match({
        Some: (js) => js.toString(),
        None: () => `?`
      })} (${label})"`;

      (options['VertexStyle'] ??= {})[name] = vertexStyle(reference);

      Object.defineProperty(vertex.force(), "__label", {value: name});

      return Option.Some(name);
    },
    get,
  });
  console.log(`ResourceFunction["WolframModelPlot"][{${hyperEdges
    .filter(hyperEdge => hyperEdge.length !== 0)
    .map(hyperEdge =>
      `{${hyperEdge.join(',')}}`
    ).join(',')}},VertexLabels->All,${_.map(options, (mapping, option) => `${option} -> <|${_.map(mapping, (value, key) => `${key} -> ${value}`).join(',')}|>`).join(',')}]`)

  // console.log(ray)
  // useEffect(() => {
  //   for (let vertex of ray.force().traverse()) {
  //     /**
  //      * In this case should be a reference and thus
  //      * [--|--]
  //      *
  //      * So in the case of [0, 1], this would be a reference to the Iterator, in the case of 1/2/3/4/5, a reference to their respective values.
  //      */
  //     const reference = vertex.vertex();
  //
  //     if (reference.is_some()) {
  //       if (reference.force().vertex().is_none())
  //         continue;
  //
  //       // This would be the Iterator, or the numbers respectively.
  //       const dereferenced = reference.force().vertex().force();
  //       /**
  //        * Can again be any of these:
  //        * [--|--]
  //        * [--|  ]
  //        * [  |--]
  //        *
  //        */
  //
  //       console.log('type:', reference.force().type());
  //       console.log('structure at', dereferenced.js().force())
  //
  //       console.log('           traversing nested reference');
  //       for (let nested of reference.force().traverse()) {
  //         const nested_reference = nested.vertex();
  //
  //         if (nested_reference.is_some()) {
  //           if (nested_reference.force().vertex().is_none())
  //             continue;
  //
  //           const nested_dereferenced = nested_reference.force().vertex().force();
  //
  //           console.log('type:', nested_reference.force().toString());
  //           console.log('structure at', nested_dereferenced.js().force())
  //         }
  //       }
  //       console.log('           done');
  //     }
  //   }
  // }, [])

  // One could abstractly realize hotkeys, or any kind of control system as a possible temporal directionality.
  const hotkeys = useHotkeys();

  const [selection, setSelection] = useState<Option<Ray>>(ray.force().next());

  // hotkeys.set(
  //   { combo: "arrowright", global: true, label: "Refresh data", onKeyDown: () => {
  //       selected.next().match({
  //         Some: (ray) => setSelected(ray),
  //         None: () => console.log('no more')
  //       })
  //     }}, { combo: "arrowleft", global: true, label: "Refresh data", onKeyDown: () => {
  //       selected.previous().match({
  //         Some: (ray) => setSelected(ray),
  //         None: () => console.log('no more')
  //       })
  //     }});

  console.log('ray', ray.force().as_array())
  console.log('...', [...selection.force().traverse({ steps: 1 })].map(ray => ray.vertex().force().js().force()))
  console.log('as_array', selection.force().as_array())
  // for (let element of selection.force().traverse()) {
  //
  //   console.log(element.as_array())
  //
  // }

  // visualization_config
  // hotkey/interface_config

  const Test2 = ({ ray, position }: { ray: Ray, position: [number, number, number] }) => {
    const circle = {
      radius: 3,
      color: "orange",
      segments: 30
    }
    const torus = {
      // Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
      radius: 3,
      color: "orange",
      tube: {
        width: 1,
        segments: 200
      },
      segments: 200,
    }

    if (ray.is_terminal() || ray.is_initial()) {
      return (
        <group>
          <Torus args={[torus.radius, torus.tube.width, torus.segments, torus.tube.segments]} material-color="orange" position={position} />
          {[...ray.traverse()].map((vertex, i) => (
            <Test2 key={i} ray={vertex.vertex().force()} position={[position[0] + (20 * (i + 1)), position[1], position[2]]} />
          ))}
        </group>
      )
    }

    return (
      <Circle position={position} material-color={circle.color} args={[circle.radius, circle.segments]} />
    )
  }

  const scale = 1.5;

  return (
    <VisualizationCanvas style={{height: '100vh'}}>
      <Co/>

      <Circle args={[1, 10]} position={[0, 0, 0]} material-color="white" />
      {/*<Test/>*/}
      <group scale={scale}>
        <Test2 ray={ray.force()} position={[0, 0, 0]} />
      </group>

    </VisualizationCanvas>
  );
};

export default OrbitMinesExplorer;