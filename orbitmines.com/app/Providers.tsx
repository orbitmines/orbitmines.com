'use client';

import React from 'react';
import { HotkeysProvider } from '@blueprintjs/core';
import { EtherOverlay } from '../src/@ether/UI';
import IEventListener from '../src/@orbitmines/js/react/IEventListener';
import Modules from '../src/@orbitmines/js/react/Modules';

const Metadata: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <meta property="og:site_name" content="OrbitMines" />
    {/* https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards */}
    <meta property="twitter:site" content="@OrbitMines" />
    {children}
  </>
);

const Providers: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const listener: IEventListener<any> = {
    onKeyDown: (event): void => {
      console.log(event.key);
    },
  };

  return (
    <Metadata>
      {/* HotkeysProvider: https://blueprintjs.com/docs/#core/context/hotkeys-provider */}
      <HotkeysProvider>
        <Modules className="bp5-dark" listeners={[listener]}>
          {children}
          <EtherOverlay />
        </Modules>
      </HotkeysProvider>
    </Metadata>
  );
};

export default Providers;
