import React from 'react';
import {Circle, Edit, Settings} from './icons';
import {PROJECTS} from './data';
import type {Entry} from './types';
import ProjectList from './ProjectList';

type Props = {
  onOpen: (entry: Entry) => void;
};

// "Settings" is more of a kitchen-sink panel in ray — preferences plus a
// secondary project list. Kept intact so the layout's three-pane look is
// preserved.
const SettingsPanel: React.FC<Props> = ({onOpen}) => (
  <div className="lib-settings">
    <div className="lib-row lib-row-middle">
      <span className="lib-panel-icon">
        <Settings />
      </span>
      <h3>Settings</h3>
    </div>

    <div className="lib-settings__section">
      <h4 className="lib-muted">Preferences</h4>

      <div className="lib-settings__group">
        <div className="lib-row lib-row-middle">
          <h4 className="lib-muted">Reference Language</h4>
          <span className="lib-settings__edit">
            <Edit />
          </span>
        </div>
        <button className="lib-btn lib-settings__value" type="button">
          <Circle />{' '}
          <span>
            Ray <span className="lib-muted">v1.0.0</span>
          </span>
        </button>
      </div>

      <div className="lib-settings__group">
        <div className="lib-row lib-row-middle">
          <h4 className="lib-muted">Universal Language</h4>
          <span className="lib-settings__edit">
            <Edit />
          </span>
        </div>
        <button className="lib-btn lib-settings__value" type="button">
          <Circle />{' '}
          <span>
            Ray <span className="lib-muted">v1.0.0</span>
          </span>
        </button>
      </div>

      <div className="lib-settings__divider" />
      <h4 className="lib-muted">Selection</h4>

      <ProjectList projects={PROJECTS} onOpen={onOpen} />
    </div>
  </div>
);

export default SettingsPanel;
