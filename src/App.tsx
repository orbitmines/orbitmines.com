import {HotkeysProvider} from '@blueprintjs/core';
import React, {createContext} from 'react';
import IModule from "./lib/react-hooks/modules/IModule";
import useHoveringModule from "./lib/react-hooks/modules/useHovering";
import useHotkeysModule from "./lib/react-hooks/modules/useHotkeys";
import {mergeListeners} from "./lib/react-hooks/IEventListener";
import Children from "./lib/typescript/Children";
import {Route, Routes} from 'react-router-dom';
import Root from "./routes/Root";
import Paper from "./routes/Paper";
import Profile from "./routes/Profiles";

export const ModulesContext = createContext<IModule<any>[]>([]);

export const Modules = ({children}: Children) => {
  const modules: IModule<any>[] = [
    useHoveringModule(),
    useHotkeysModule({
      combo: "R",
      global: true,
      label: "Refresh data",
      onKeyDown: () => console.info("Refreshing data..."),
    }, {
      combo: "mod + shift + a",
      global: true,
      label: "asd",
      onKeyDown: () => console.info("Holding ctrl..."),
    }, {
      combo: "mod + scroll",
      global: true,
      label: "asd",
      onKeyDown: () => console.info("Holding ctrl + scroll..."),
    })
  ];

  return <ModulesContext.Provider value={modules}>
    <div
      className="bp5-dark"

      tabIndex={0}
      {...mergeListeners(...modules)}
    >
      {children}
    </div>
  </ModulesContext.Provider>
}

export const Router = () => {

  return <Routes>
    <Route path="*" element={<Root/>} errorElement={<Root/>} />
    <Route path="papers">
      <Route path=":paper" element={<Paper />} />
    </Route>
    <Route path="profiles">
      <Route path=":profile" element={<Profile />} />
    </Route>
  </Routes>
}

function App() {
  return (
    // HotkeysProvider: https://blueprintjs.com/docs/#core/context/hotkeys-provider
    <HotkeysProvider>
      <Modules>
        <Router/>
       </Modules>
    </HotkeysProvider>
  );
}

export default App;
