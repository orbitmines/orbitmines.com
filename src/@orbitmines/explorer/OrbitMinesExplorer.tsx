import React, {useEffect, useRef, useState} from 'react';
import {empty, empty_vertex, from_boolean, from_iterable, JS, Ray, RayType} from "./Ray";
import {VisualizationCanvas} from "./Visualization";
import {CatmullRomLine, Circle, QuadraticBezierLine, Text, Torus} from "@react-three/drei";
import {GroupProps, useFrame, useThree,} from "@react-three/fiber";
import {useDrag} from "@use-gesture/react";
import {useSpring} from '@react-spring/three'
import {useHotkeys} from "../js/react/hooks/useHotkeys";
import JetBrainsMonoRegular from "../../lib/layout/font/fonts/JetBrainsMono/ttf/JetBrainsMono-Regular.ttf";
import {Box3, SplineCurve, Vector3, WebGLRenderTarget} from "three";
import {Option} from "../js/utils/Option";
import _ from "lodash";
import IEventListener, {mergeListeners} from "../js/react/IEventListener";
import {toJpeg, toPng} from "html-to-image";
import {value} from "../../lib/typescript/React";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";

const add = (a: number[], b: number[]): [number, number, number] => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const torus = {
  // Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
  radius: 3, color: "orange", segments: 200, tube: { width: 1, segments: 200 },
}
const Continuation = ({ color = torus.color, position }: any) =>
  <Torus
    args={[torus.radius, torus.tube.width, torus.segments, torus.tube.segments]}
    material-color={color}
    position={position}
  />

const line = { width: 2,  length: 1,  color: "orange", }
const Line = ({ start, mid, end, scale, color = line.color }: any) =>
  <QuadraticBezierLine
    start={start}
    mid={mid}
    end={end}
    color={color}
    lineWidth={line.width * scale}
  />

const circle = { radius: 3,  color: "orange", segments: 30, }
const Vertex = ({ position }: any) =>
  <Circle position={position} material-color={circle.color} args={[circle.radius, circle.segments]} />

const BinarySuperposition = ({ position }: any) => {
  const halfTorus = (torus.radius + (torus.tube.width / 2));

  const up = add(position, [0, 20 + halfTorus, 0]);
  const down = add(position, [0, -20, 0]);

  const left = add(down, [-halfTorus, 0, 0]);
  const right = add(down, [+halfTorus, 0, 0]);

  return <>
    {/*<CatmullRomLine*/}
    {/*  points={[*/}
    {/*    add(left, [0, torus.radius, 0]),*/}
    {/*    add(left, [0, torus.radius + halfTorus * 2, 0]),*/}
    {/*    position,*/}
    {/*    add(up, [+halfTorus, -(torus.radius + halfTorus * 2), 0]),*/}
    {/*    add(up, [(line.width / 2), 0, 0]),*/}

    {/*    add(up, [-(line.width / 2), 0, 0]),*/}
    {/*    add(up, [-halfTorus, -(torus.radius + halfTorus * 2), 0]),*/}
    {/*    position,*/}
    {/*    add(right, [0, torus.radius + halfTorus * 2, 0]),*/}
    {/*    add(right, [0, torus.radius, 0])*/}
    {/*  ]}*/}
    {/*  color="#FF5555"*/}
    {/*  lineWidth={line.width * 1.5}*/}
    {/*/>*/}

    <CatmullRomLine points={[
      add(left, [0, torus.radius, 0]),
      add(left, [0, torus.radius + halfTorus * 1.5, 0]),
      position,
      add(up, [+halfTorus, -(torus.radius + halfTorus), 0]),
      add(up, [(line.width / 4), 0, 0]),
    ]} color="#FF5555" lineWidth={line.width * 1.5}/>
    <CatmullRomLine points={[
      add(right, [0, torus.radius, 0]),
      add(right, [0, torus.radius + halfTorus * 1.5, 0]),
      position,
      add(up, [-halfTorus, -(torus.radius + halfTorus), 0]),
      add(up, [-(line.width / 4), 0, 0])
    ]} color="#5555FF" lineWidth={line.width * 1.5}/>

    <Circle position={position} material-color={circle.color} args={[circle.radius, circle.segments]}/>
    <Continuation color="#FF5555" position={left} />

    <Continuation color="#5555FF" position={right} />

    <Circle position={up} material-color="#FF55FF" args={[circle.radius / 2, circle.segments]} />
  </>
}

// In principle, this should be anything, this is just for the initial setup
const RenderedRay = (
  props: { reference: Option<Ray> } & { position?: [number, number, number], scale?: number, }
) => {
  const {
    position = [0, 0, 0],
    reference,
    scale = 1
  } = props;

  if (reference.is_none() || reference.force().self().is_none())
    return <></>

  const vertex = reference.force().self().force();

  const Rendered = () => {


    const type = vertex.as_reference().type();
    switch (type) {
      case RayType.INITIAL: {
        /**
         * [  |--]
         */
        if (vertex.vertex().is_none()) {
          return <Continuation color="orange" position={position} />
        } else {
          const possible_continuations = vertex.vertex().force();

          if (!possible_continuations.as_reference().is_terminal())
            return <Continuation color="orange" position={position} />
          //
          // if (vertex.terminal().force().store.rendered)
          //   return <></>

          return <RenderedRay
            {...props}
            reference={possible_continuations.initial().force().as_reference().as_option()}
          />
        }
      }
      case RayType.TERMINAL: {
        if (vertex.vertex().is_none()) {
          return <Continuation color="orange" position={position} />
        } else {
          const possible_continuations = vertex.vertex().force();

          // if (!possible_continuations.as_reference().is_initial())
          //   return <Continuation color="orange" position={position} />
          return <></>

          // return <RenderedRay
          //   {...props}
          //   reference={possible_continuations.terminal().force().as_reference().as_option()}
          // />
        }
      }
      case RayType.REFERENCE: {
        if (vertex.is_empty()) // empty reference
          return <Continuation color="red" position={position} />

        // throw 'Not Implemented'
        return <RenderedRay {...props} reference={vertex.self().match({ Some: (ray) => ray.as_reference().as_option(), None: () => Option.None })} />
      }
      case RayType.VERTEX: {
        const left = add(position, [-20, 0, 0]);
        const right = add(position, [20, 0, 0]);

        return <>
          <RenderedRay reference={vertex.initial().force().as_reference().as_option()} position={left} />

          {/* Line now starts in the center of the torus tube */}
          <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} />
          <Vertex position={position} />
          {/*<BinarySuperposition position={position} />*/}
          <Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} />
          <RenderedRay reference={vertex.terminal().force().as_reference().as_option()} position={right} />

          {/*<Torus*/}
          {/*  args={[15, torus.tube.width, torus.segments, torus.tube.segments]}*/}
          {/*  material-color="orange"*/}
          {/*  position={add(position, [0, 15, 0])}*/}
          {/*/>*/}
          {/*<Torus*/}
          {/*  args={[15, torus.tube.width, torus.segments, torus.tube.segments]}*/}
          {/*  material-color="orange"*/}
          {/*  position={add(position, [0, -15, 0])}*/}
          {/*/>*/}
          {/* SHOULD BE SMOOTH */}
          {/*<CatmullRomLine points={[*/}
          {/*  position,*/}
          {/*  add(position, [12.5, -12.5, 0]),*/}
          {/*  add(position, [0, -25, 0]),*/}
          {/*  add(position, [-12.5, -12.5, 0]),*/}
          {/*  position,*/}
          {/*]} color="orange" lineWidth={line.width * 1.5}/>*/}

        </>
      }
    }
  }

  const render = <Rendered/>
  vertex.store.rendered = render;
  return render;
}

const InterfaceObject = ({
  scale = 1,
  ...props
}: any) => {
  const ref = useRef<any>();

  const [selection, setSelection] = useState<Option<Ray>>(
    empty_vertex().as_reference().as_option()
  );
  const [controls, setControls] = useState<Option<Ray>>(
    empty().as_reference().as_option()
  );

  const {
    gl: renderer,
    camera,
    scene,
    raycaster
  } = useThree();

  // One could abstractly realize hotkeys, or any kind of control system as a possible temporal directionality.
  const hotkeys = useHotkeys();
  hotkeys.set(
    {
      combo: "shift + d", global: true, label: "", onKeyDown: () => {
        // const link = document.createElement('a')
        // link.setAttribute('download', `canvas.png`)
        // link.setAttribute('href', renderer.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
        // link.click()

        // const box = new Box3().setFromObject(ref.current);
        // const size = box.getSize(new Vector3());
        //
        // const width = Math.ceil(size.x);
        // const height = Math.ceil(size.y);
        // const width = 500;
        // const height = 500;
        //
        // const renderTarget = new WebGLRenderTarget(renderer.domElement.width, renderer.domElement.height);
        //
        // renderer.setRenderTarget(renderTarget);
        // renderer.render(scene, camera);
        // renderer.setRenderTarget(null);
        //
        // const canvasX = (0 + 1) / 2 * renderTarget.width;
        // const canvasY = (-0 + 1) / 2 * renderTarget.height;
        // // const canvasX = Math.ceil(box.min.x + 1) - Math.ceil(renderTarget.width / 2);
        // // const canvasY = Math.ceil(-box.min.y + 1) - Math.ceil(renderTarget.height / 2);
        //
        // const pixels = new Uint8Array(width * height * 4);
        // renderer.readRenderTargetPixels(renderTarget, canvasX, canvasY, width, height, pixels);
        //
        // const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
        //
        // const image = document.createElement('canvas');
        // image.width = width;
        // image.height = height;
        // image.getContext('2d')!.putImageData(imageData, 0, 0);
        //
        // const link = document.createElement('a')
        // link.download = 'test.png';
        // link.href = image.toDataURL('test.png');
        // link.click();


        toPng(renderer.domElement, {
          cacheBust: true,
          backgroundColor: '#1C2127'
        })
          .then((dataUrl) => {
            const link = document.createElement('a')
            link.download = `${new Date().toISOString()}.png`
            link.href = dataUrl
            link.click()
          })
          .catch((err) => {
            console.log(err)
          });
      }
    }, {
      combo: "arrowright", global: true, label: "", onKeyDown: () => {
        const next = selection.force().continues_with(
          new Ray({ js: () => Option.Some("A") }).as_reference()
        ).as_option();

        setSelection(next)
      }
    }
  );

  const addHotkey = (hotkey: HotkeyConfig) => {

  }

  useEffect(() => {
    console.log(selection.force().to_wolfram_language())
  }, [selection]);

  useEffect(() => {

    // const debug = {};
    // A.as_reference()
    //   .continues_with(new Ray({ js: () => Option.Some("B") }).as_reference())
    //   .continues_with(new Ray({ js: () => Option.Some("C") }).as_reference())
    //   .debug(debug)

    // console.log(debug)

    // console.log(
    //   new Ray({ js: () => Option.Some('empty')})
    //     .as_reference()
    //     .continues_with(new Ray({ js: () => Option.Some("A") }).as_reference())
    //     // .continues_with(new Ray({ js: () => Option.Some("B") }).as_reference())
    //     // .continues_with(new Ray({ js: () => Option.Some("C") }).as_reference())
    //     .to_wolfram_language()
    // )
    //
    // const A = new Ray({ js: () => Option.Some('empty')})
    //   .as_reference()
    //   .continues_with(new Ray({ js: () => Option.Some("A") }).as_reference());
    //
    // A
    //   .continues_with(new Ray({ js: () => Option.Some("B") }).as_reference())
    //   .continues_with(new Ray({ js: () => Option.Some("C") }).as_reference())

    // console.log(
    //   A.to_wolfram_language()
    // )
    // console.log(
    //   new Ray({ js: () => Option.Some('empty')})
    //     .as_reference()
    //     .continues_with(new Ray({ js: () => Option.Some("A") }).as_reference())
    //     .continues_with(new Ray({ js: () => Option.Some("B") }).as_reference())
    //     .continues_with(new Ray({ js: () => Option.Some("C") }).as_reference())
    //     .to_wolfram_language()
    // )

    // console.log(
    //   A.as_reference().to_wolfram_language()
    // )
  }, [])

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

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  const [position, setPosition] = useState([0, 0, 0]);
  const [movement, setMovement] = useState([0, 0, 0]);

  const drag = useDrag(({ down, movement: [mx, my] }) => {
    api.start({ x: down ? mx : 0, y: down ? my : 0, immediate: down });

    document.body.style.cursor = down ? 'grabbing' : 'auto';

    if (down) {
      setMovement([x.get(), -y.get(), 0]);
    } else {
      setPosition([position[0] + x.get(), position[1] - y.get(), 0]);
      setMovement([0, 0, 0])
    }
  });

  useFrame(() => {
    const renderTarget = new WebGLRenderTarget(renderer.domElement.width, renderer.domElement.height);

    // From a position, retrieve a directionality which defines what is at that position.
    // const position = (position: Vector3): Extreme> => {
    //   // const ray = new Raycaster(new THREEVector3(0, 0, 0), new THREEVector3(0, 0, 1))
    //   // const intersections = ray.intersectObjects(scene.children, true);
    //   // console.log(intersections.length)
    //   // intersections.forEach(intersection => console.log(intersection.object.id))

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
  });

  const currentPosition = add(position, movement);

  return (
    <group
      ref={ref}
      {...drag()}
      scale={scale}
      position={currentPosition}

      {...props}
    >
      <RenderedRay reference={selection} scale={scale} />
      {/*<group position={[0, 15, 0]}>*/}
      {/*  <Text color="white" font={JetBrainsMonoRegular} anchorX="center" anchorY="middle" scale={20.0}>*/}
      {/*    O*/}
      {/*  </Text>*/}
      {/*</group>*/}
    </group>
  )
}

class InterfaceObjec {


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

const OrbitMinesExplorer = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {
  // const ray = JS.Iterable([14, 15, [[6, 7, 8, 9, 10, 11], 100], 1, 2, 3, 4, 5, 16, false]).as_ray();
  // console.log(ray.force().to_wolfram_language())

  // visualization_config
  // hotkey/interface_config

  const listener: IEventListener<any> = {

  }

  return (
    <VisualizationCanvas
      style={{height: '100vh'}}

      {...mergeListeners(...listeners, listener)}
    >

      <Circle args={[1, 10]} position={[0, 0, 0]} material-color="white" />
      <InterfaceObject scale={1.5}/>

    </VisualizationCanvas>
  );
};

export default OrbitMinesExplorer;