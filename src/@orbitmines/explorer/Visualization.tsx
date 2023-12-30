import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Canvas} from "@react-three/fiber";
import {ACESFilmicToneMapping, SRGBColorSpace} from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL";
import {Children, value} from "../../lib/typescript/React";
import isWebGLAvailable = WEBGL.isWebGLAvailable;
import {Ray} from "./Ray";
import {useSearchParams} from "react-router-dom";
import {PaperProps} from "../../lib/paper/Paper";
import {toJpeg, toPng} from "html-to-image";
import {Col, Row} from "../../lib/layout/flexbox";
import {Button} from "@blueprintjs/core";

export const NoWebGL = () => {
  return <div>No WebGL</div>
}

export type VisualizationProps = {
  context: Omit<PaperProps, 'children'>,
  alt: string,
}

const Visualization = ({ray}: { ray: Ray }) => {
  return <VisualizationCanvas>

  </VisualizationCanvas>
}

export const CachedVisualizationCanvas = (
  {
    alt,
    context,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & Children & VisualizationProps
) => {
  const ref = useRef<any>(null);
  const [useImage, setUseImage] = useState<boolean>(true);
  let generate;
  try {
    const [params] = useSearchParams();

    generate = params.get('generate');
  } catch (e) {
    generate = 'pdf';
  }

  const exportPng = useCallback(() => {
    if (ref === null)
      return;

    toPng(ref.current, {
      cacheBust: true,
      // backgroundColor: '#1C2127'
    })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${alt}.png`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      });
  }, [ref]);

  if (context.link === undefined)
    throw 'Cannot have the paper\'s link be undefined when using a cached canvas.'

  const canvasUrl = `${context.link.replace("https://orbitmines.com", "")}/images/${alt}.png`;

  useEffect(() => {
    // Just a quick hack to check if it's loaded (could draw it on the canvas from here, ?)

    const img = new Image();
    img.src = canvasUrl;
    img.onerror = () => {
      setUseImage(false);
    };
  }, []);

  if (useImage) {
    return <CanvasContainer {...props}>
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('${canvasUrl}')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </CanvasContainer>
  }

  return <div>
    <div ref={ref}>
      <CanvasContainer {...props}>
        <ThreeJS>{children}</ThreeJS>
      </CanvasContainer>
    </div>
    {generate === 'canvas' ? <Row end="xs">
      {/* eslint-disable-next-line react/jsx-no-undef */}
      <Col> <Button text=".png" icon="media" minimal onClick={exportPng}/></Col>
    </Row> : <></>}
  </div>
}

export const CanvasContainer = ({
                           children,
                           ...props
                         }: React.HTMLAttributes<HTMLElement> & Children) => (<div
  {...{
    id: 'canvas-container',
    ...props,
    style: {
      width: '100%',
      height: '30px', // Height needs to be set (probably because three-fiber checks if there's a value here to resize the canvas dynamically)
      // minHeight: '100vh',
      ...(props.style || {})
    }
    // className="py-20"
  }}
>
  {children}
</div>)

export const ThreeJS = ({ref, children}: Children & { ref?: React.MutableRefObject<any>}) => {
  // https://threejs.org/docs/#manual/en/introduction/WebGL-compatibility-check
  if (!isWebGLAvailable())
    return <NoWebGL/>;

  // console.log('webgl2', isWebGLAvailable());

  /*
    https://docs.pmnd.rs/react-three-fiber/api/canvas
    - Sets up a Scene and a Camera, the basic building blocks necessary for rendering
    - Renders our scene every frame, you do not need a traditional render-loop

    - Canvas is responsive to fit the parent node, so you can control how big it is by changing the parents width and height, in this case #canvas-container.
  */
  return <Canvas
    ref={ref}

    // WebGL
    // - https://threejs.org/docs/#api/en/renderers/WebGLRenderer
    // - https://www.khronos.org/registry/webgl/specs/latest/1.0/#5.2
    gl={{
      antialias: true,
      // stencil: false, depth: false,

      // Controls the default clear alpha value. When set to true, the value is 0 Otherwise it's 1.
      alpha: true,

      // Provides a hint to the user agent indicating what configuration of GPU is suitable for this WebGL context. Can be "high-performance", "low-power" or "default". Default is "default"
      powerPreference: 'high-performance',

      // precision: 'highp'

      // https://threejs.org/docs/#manual/en/introduction/Color-management
      outputColorSpace: SRGBColorSpace,

      // https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer.toneMapping
      toneMapping: ACESFilmicToneMapping,

      // https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer.shadowMap
      // shadowMap: {
      //     enabled: false,
      //     type: PCFShadowMap
      // }

      // fixes: https://github.com/niklasvh/html2canvas/issues/1311
      preserveDrawingBuffer: true
    }}

    // https://threejs.org/docs/#api/en/cameras/Camera
    camera={{
      // field of view. FOV is the extent of the scene that is seen on the display at any given moment. The value is in degrees.
      fov: 70,

      // objects further away from the camera than the value of `far` or closer than `near` won't be rendered
      near: 0.1,
      far: 1000,

      position: [0, 0, 1000]
    }}

    // https://threejs.org/docs/#api/en/scenes/Scene
    scene={{}}

    // https://threejs.org/docs/#api/en/core/Raycaster
    raycaster={{}}

    // https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance#:~:text=set%20the%20canvas-,frameloop,-prop%20to%20demand
    frameloop="always"

    // https://github.com/pmndrs/react-use-measure#api
    resize={{scroll: true, debounce: {scroll: 50, resize: 0}}}

    // https://threejs.org/docs/#api/en/cameras/OrthographicCamera
    // In this projection mode, an object's size in the rendered image stays constant regardless of its distance from the camera.
    orthographic={true}

    // Device pixel ratio (https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
    dpr={[1, 2]}

    // true = Switch off automatic sRGB color space and gamma correction
    linear={false}

    // Configuration for the event manager, as a function of state
    // events={}
    // The source where events are being subscribed to, HTMLElement
    // eventSource={}
    // Callback after the canvas has rendered (but not yet committed)
    // onCreated={}
    // Response for pointer clicks that have missed any target
    // onPointerMissed={}

    // The event prefix that is cast into canvas pointer x/y events
    eventPrefix={'offset'}

  >
    {children}

    {/*/!* https://threejs.org/docs/#api/en/objects/Mesh *!/*/}
    {/*<mesh>*/}
    {/*    /!**/}
    {/*    https://threejs.org/docs/#api/en/lights/AmbientLight*/}
    {/*    - This light globally illuminates all objects in the scene equally.*/}
    {/*    - This light cannot be used to cast shadows as it does not have a direction.*/}
    {/*    *!/*/}

    {/*    /!* https://threejs.org/docs/#api/en/lights/DirectionalLight *!/*/}
    {/*    /!*<directionalLight color="red" position={[0, 0, 5]} />*!/*/}

    {/*    /!* https://threejs.org/docs/#api/en/geometries/BoxGeometry *!/*/}
    {/*    <boxGeometry args={[1, 1, 1]}/>*/}

    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="orange" />*/}
    {/*</mesh>*/}

    {/*<pointLight position={[-10, -10, -10]} />*/}

    {/* https://docs.pmnd.rs/react-postprocessing/selection */}
    {/*<Selection>*/}
    {/*  /!* https://docs.pmnd.rs/react-postprocessing/effect-composer *!/*/}
    {/*  <EffectComposer multisampling={8} autoClear={false}>*/}
    {/*    <Outline blur={false} visibleEdgeColor="white" edgeStrength={100} height={2000} width={3000} />*/}
    {/*  </EffectComposer>*/}
    {/*</Selection>*/}

    {/*<Wasm/>*/}

    {/*<Test/>*/}

    {/*<Ray_3*/}
    {/*    scale={5.0}*/}
    {/*    position={[0, -40, 0]}*/}
    {/*    terminal={[10, 0, 0]}*/}
    {/*    ray={ray([0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0,])}*/}
    {/*/>*/}

    {/*<OrbitControls />*/}

    {/*<Box args={[20, 20, 0]} position={[20, 0, 0]}>*/}
    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="black" />*/}
    {/*</Box>*/}
    {/*<Box args={[20, 20, 0]} position={[40, 0, 0]}>*/}
    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="white" />*/}
    {/*</Box>*/}
    {/*<Box args={[20, 20, 0]} position={[60, 0, 0]}>*/}
    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="black" />*/}
    {/*</Box>*/}

    {/*<Box args={[40, 40, 0]} position={[0, 0, 0]}>*/}
    {/*    /!* https://threejs.org/docs/#api/en/materials/MeshStandardMaterial *!/*/}
    {/*    <meshStandardMaterial color="white" />*/}
    {/*</Box>*/}

    {/*<Line points={[[-10, 0, 0], [0, 10, 0], [10, 0, 0]]} color="orange" lineWidth={1} />*/}

  </Canvas>
}

export const VisualizationCanvas = (
  {
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & Children
) => {

  return (
    // ThreeJS: https://threejs.org/
    // React Three Fiber: https://docs.pmnd.rs/react-three-fiber/api/objects
    //                    https://github.com/pmndrs/drei#readme
    <CanvasContainer {...props}>
      <ThreeJS>{children}</ThreeJS>
    </CanvasContainer>
  );
};

export default Visualization;