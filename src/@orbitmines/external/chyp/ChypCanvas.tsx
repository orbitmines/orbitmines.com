import React from "react";
import IEventListener, {mergeListeners} from "../../../js/react/IEventListener";
import {VisualizationCanvas} from "../../../explorer/Visualization";
import {AutoRenderedRay, BinarySuperposition, Loop, SimpleRenderedRay} from "../../../explorer/OrbitMinesExplorer";
import {RayType} from "../../../explorer/Ray";
import {Center} from "@react-three/drei";

/**
 * TODO: Import .chyp files
 * TODO: Export to .chyp files
 */
const ChypCanvas = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {
  const listener: IEventListener<any> = {

  }

  const scale = 1.5;

  return <div>
    {/*<Row>*/}
    {/*  <Organization {...ORGANIZATIONS.chyp} only_logo />*/}
    {/*  <Organization {...ORGANIZATIONS.orbitmines_research} only_logo />*/}
    {/*</Row>*/}

    <VisualizationCanvas
      style={{height: '100vh'}}

      {...mergeListeners(...listeners, listener)}
    >
      <Center>

        {/* Iterator */}
        {/*<group>*/}
        {/*  <AutoRenderedRay scale={scale} position={[0, 0, 0]} length={5} />*/}
        {/*  <AutoRenderedRay scale={scale} position={[180, 0, 0]} rotation={[0, 0, Math.PI / 2]} length={1} color="#FF5555" />*/}
        {/*</group>*/}

        {/* Grid/Dictionary/... */}
        {/*<group>*/}
        {/*  <AutoRenderedRay scale={scale} position={[0, 0, 0]} length={5}/>*/}
        {/*  <AutoRenderedRay scale={scale} position={[0, 60, 0]} length={5}/>*/}
        {/*  <AutoRenderedRay scale={scale} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} length={5}/>*/}
        {/*  <AutoRenderedRay scale={scale} position={[0, 60, 0]} rotation={[0, 0, Math.PI / 2]} length={5}/>*/}
        {/*  <AutoRenderedRay scale={scale} position={[180, 0, 0]} rotation={[0, 0, Math.PI / 4]} length={1} color="#FF5555"/>*/}
        {/*</group>*/}

        {/* Loop memory */}
        {/*<group>*/}
        {/*  <group scale={scale}> <Loop scale={scale} position={[0, 15, 0]}/></group>*/}
        {/*  <AutoRenderedRay scale={scale} position={[0, 0, 0]} length={4} rotation={[0, 0, 0]} />*/}
        {/*</group>*/}


        {/* Being able to reference any part from within the structure - self-compiling */}
        {/*<group>*/}
        {/*  <AutoRenderedRay scale={scale} position={[0, 0, 0]} length={1}/>*/}
        {/*  <AutoRenderedRay scale={scale} position={[30, 0, 0]} rotation={[0, 0, Math.PI / 2]} length={1}*/}
        {/*                   color="#FF5555"/>*/}
        {/*  /!*<AutoRenderedRay scale={scale} position={[30, 0, 0]} rotation={[0, 0, Math.PI / 4]} length={1} color="#FFFFFF" />*!/*/}
        {/*</group>*/}

        <group>
          <AutoRenderedRay scale={scale} position={[0, 0, 0]} length={1} color="#5555FF"/>

          <AutoRenderedRay scale={scale} position={[60, 60, 0]} length={1} color="#FF5555"/>
          <AutoRenderedRay scale={scale} position={[30, 0, 0]} rotation={[0, 0, Math.PI / 2]} length={1}
                           color="#FF55FF"/>
          <AutoRenderedRay scale={scale} position={[30, 60, 0]} rotation={[0, 0, Math.PI / 2]} length={1}
                           color="#FF55FF"/>
          {/*<AutoRenderedRay scale={scale} position={[30, 0, 0]} rotation={[0, 0, Math.PI / 4]} length={1} color="#FFFFFF" />*/}
        </group>
      </Center>
    </VisualizationCanvas>
  </div>
}

export const ChypExplorer = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {

  const listener: IEventListener<any> = {}

  return <ChypCanvas listeners={[...listeners, listener]}/>
}

export default ChypCanvas;