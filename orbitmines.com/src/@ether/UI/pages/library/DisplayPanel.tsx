import React from 'react';
import {Circle} from './icons';
import {SOCIALS} from './data';
import Socials from './Socials';

const DisplayPanel: React.FC = () => (
  <div className="lib-display">
    <div className="lib-row lib-row-middle">
      <span className="lib-panel-icon lib-panel-icon--lg">
        <Circle size={18} />
      </span>
      <h2>Ray</h2>
    </div>
    <div className="lib-display__socials">
      <Socials links={SOCIALS} />
    </div>
  </div>
);

export default DisplayPanel;
