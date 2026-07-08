import React, {createContext} from "react";
import IModule from "./IModule";
import useHoveringModule from "./hooks/useHovering";
import useHotkeysModule from "./hooks/useHotkeys";
import IEventListener, {mergeListeners} from "./IEventListener";
import {Children} from "../../../lib/post/Post";

export const ModulesContext = createContext<IModule<any>[]>([]);

const Modules = (
  {
    children,
    listeners = [],
    ...props
  }: React.HTMLAttributes<HTMLElement> & Children & {
    listeners?: IEventListener<any, any>[],
  }) => {
  const modules: IModule<any>[] = [
    useHoveringModule(),
    useHotkeysModule(
      // {
      //   combo: "R",
      //   global: true,
      //   label: "Refresh data",
      //   onKeyDown: () => console.info("Refreshing data..."),
      // }, {
      //   combo: "mod + shift + a",
      //   global: true,
      //   label: "asd",
      //   onKeyDown: () => console.info("Holding ctrl..."),
      // }, {
      //   combo: "mod + scroll",
      //   global: true,
      //   label: "asd",
      //   onKeyDown: () => console.info("Holding ctrl + scroll..."),
      // }
    ),
  ];

  return <>
    <ModulesContext.Provider value={modules}>
      <div
        tabIndex={0}
        {...mergeListeners(...modules, ...listeners)}
        {...props}
      >
        {children}
      </div>
    </ModulesContext.Provider>
  </>
}

export default Modules;