import {HotkeysProvider} from '@blueprintjs/core';
import React from 'react';
import IEventListener from "./@orbitmines/js/react/IEventListener";
import {Navigate, Route, Routes} from 'react-router-dom';
import Profile from "./routes/profiles/Profiles";
import {Helmet} from "react-helmet";
import Modules from "./@orbitmines/js/react/Modules";
import {Children, ThumbnailPage} from "./lib/post/Post";
import Archive from "./routes/Archive";
import Minimap from './routes/Minimap';
import Almanac from "./routes/Almanac";
import IDE from "./routes/IDE";

export const Router = () => {

  return <Routes>
    <Route path="*" element={<Minimap/>} errorElement={<Minimap/>} />
    <Route path="profiles">
      <Route path=":profile" element={<Profile />} />
    </Route>
    <Route path="papers/*" element={<Navigate to={`/archive/${window.location.pathname.replace(/^\/papers\/?/, '')}`} replace />}/>
    <Route path="archive">
      <Route path=":item" element={<Archive />} />
    </Route>
    <Route path="almanac" element={<Almanac />} />
    <Route path="ide" element={<IDE />} />
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

