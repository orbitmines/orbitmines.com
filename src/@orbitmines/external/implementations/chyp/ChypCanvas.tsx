import React from "react";
import IEventListener, {mergeListeners} from "../../../js/react/IEventListener";
import {VisualizationCanvas} from "../../../explorer/Visualization";
import {AutoRenderedRay, SimpleRenderedRay} from "../../../explorer/OrbitMinesExplorer";
import {RayType} from "../../../explorer/Ray";


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
      <AutoRenderedRay scale={scale} position={[0, 0, 0]} />
      <AutoRenderedRay scale={scale} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      <AutoRenderedRay scale={scale} position={[60, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
      <AutoRenderedRay scale={scale} position={[60, 0, 0]} rotation={[0, 0, Math.PI / 4]} />
      <AutoRenderedRay scale={scale} position={[60, 0, 0]} rotation={[0, 0, -(Math.PI / 4)]} />
      <AutoRenderedRay scale={scale} position={[0, -60, 0]} rotation={[0, 0, Math.PI / 2]} />
      <AutoRenderedRay scale={scale} position={[60, 0, 0]} />

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

  const listener: IEventListener<any> = {

  }

  return <ChypCanvas listeners={[...listeners, listener]} />
}

export default ChypCanvas;