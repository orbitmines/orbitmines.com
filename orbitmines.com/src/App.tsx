import {HotkeysProvider} from '@blueprintjs/core';
import React from 'react';
import IEventListener from "./@orbitmines/js/react/IEventListener";
import {Children} from "./lib/typescript/React";
import {Route, Routes} from 'react-router-dom';
import Root from "./routes/Root";
import Paper from "./routes/Paper";
import Profile from "./routes/Profiles";
import {Helmet} from "react-helmet";
import Modules from "./@orbitmines/js/react/Modules";
import {ThumbnailPage} from "./lib/paper/Paper";
import Archive from "./routes/Archive";

export const Router = () => {

  return <Routes>
    <Route path="*" element={<Root/>} errorElement={<Root/>} />
    <Route path="papers">
      <Route path=":paper" element={<Paper />} />
    </Route>
    <Route path="profiles">
      <Route path=":profile" element={<Profile />} />
    </Route>
    <Route path="archive">
      <Route path=":item" element={<Archive />} />
    </Route>
    <Route path="thumbnail" element={<ThumbnailPage />} />
  </Routes>
}

export const Metadata = ({children}: Children) => {
  return <>
    <Helmet>
      <meta property="og:site_name" content="OrbitMines" />

      {/* https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards */}
      <meta property="twitter:site" content="@OrbitMines" />
    </Helmet>

    {children}
  </>
}

function App() {
  const listener: IEventListener<any> = {
    onKeyDown: (event): void => {
      console.log(event.key)
    }
  }

  return (
    <Metadata>
      {/*// HotkeysProvider: https://blueprintjs.com/docs/#core/context/hotkeys-provider*/}
      <HotkeysProvider>
        <Modules className="bp5-dark" listeners={[listener]}>
          <Router/>
        </Modules>
      </HotkeysProvider>
    </Metadata>
  );
}

export default App;

