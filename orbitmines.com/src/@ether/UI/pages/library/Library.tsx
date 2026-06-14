import React, {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {IDELayout, generateId} from '../../layout';
import type {LayoutNode, PanelDefinition} from '../../layout';
import {PROJECTS, SOCIALS} from './data';
import type {Entry} from './types';
import {entryKey} from './types';
import ProjectList from './ProjectList';
import SettingsPanel from './SettingsPanel';
import DisplayPanel from './DisplayPanel';
import Socials from './Socials';
import {SelectionProvider} from './SelectionContext';
import {ArrowLeft, Circle, Repo, Settings} from './icons';
import './Library.scss';

// Library page — three-panel IDE layout:
//   * Projects list (left)
//   * Display (center) — opened entries appear here as new tabs
//   * Settings (right)
//
// Selection state is page-scoped via SelectionProvider. Dynamic panels for
// opened entries live in `dynamicPanels` state so they survive layout
// rearrangement.

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [dynamicPanels, setDynamicPanels] = useState<PanelDefinition[]>([]);
  const [layoutVersion, setLayoutVersion] = useState(0);

  const openEntryAsPanel = useCallback((entry: Entry) => {
    const panelId = entry.library
      ? `entry-${entry.library}-${entry.name}`
      : entry.reference
        ? `entry-${entry.name}-${entry.reference.name}`
        : `entry-${entry.name}`;
    setDynamicPanels((prev) => {
      if (prev.some((p) => p.id === panelId)) return prev;
      const isLibrary = entry.type === 'library';
      const defaultIcon = isLibrary ? 'git-repo' : 'circle';
      const iconNode = defaultIcon === 'git-repo' ? <Repo /> : <Circle />;
      const newPanel: PanelDefinition = {
        id: panelId,
        title: entry.name,
        icon: iconNode,
        closable: true,
        content: (
          <div style={{padding: 8}}>
            <ProjectList projects={[entry]} onOpen={openEntryAsPanel} />
          </div>
        ),
      };
      return [...prev, newPanel];
    });
    // Force IDELayout to mount the panel into the widest group.
    setLayoutVersion((n) => n + 1);
  }, []);

  // ---- Static panels ----

  const staticPanels = useMemo<PanelDefinition[]>(
    () => [
      {
        id: 'projects',
        title: 'Projects',
        icon: <Repo />,
        closable: false,
        content: <ProjectList projects={PROJECTS} onOpen={openEntryAsPanel} />,
      },
      {
        id: 'display',
        title: 'Ray',
        icon: <Circle />,
        closable: false,
        content: <DisplayPanel />,
      },
      {
        id: 'settings',
        title: 'Settings',
        icon: <Settings />,
        closable: false,
        content: <SettingsPanel onOpen={openEntryAsPanel} />,
      },
    ],
    [openEntryAsPanel],
  );

  const panels = useMemo(
    () => [...staticPanels, ...dynamicPanels],
    [staticPanels, dynamicPanels],
  );

  const initialLayout = useMemo<LayoutNode>(
    () => ({
      type: 'split',
      id: generateId(),
      direction: 'horizontal',
      children: [
        {type: 'tabgroup', id: generateId(), panels: ['projects'], activeIndex: 0},
        {type: 'tabgroup', id: generateId(), panels: ['display'], activeIndex: 0},
        {type: 'tabgroup', id: generateId(), panels: ['settings'], activeIndex: 0},
      ],
      sizes: [0.25, 0.5, 0.25],
    }),
    [],
  );

  return (
    <SelectionProvider>
      <div className="lib-page">
        <div className="lib-header">
          <div className="lib-header__left">
            <button
              type="button"
              className="lib-btn lib-btn--back"
              onClick={() => navigate('/')}
              aria-label="Back"
            >
              <ArrowLeft />
            </button>
          </div>
          <div className="lib-header__center">
            <h1>Ether Library: The Language Index</h1>
            <Socials links={SOCIALS} />
          </div>
          <div style={{width: 40}} />
        </div>
        <div className="lib-layout-container">
          <IDELayout
            key={layoutVersion}
            panels={panels}
            initialLayout={initialLayout}
            minPanelSize={0.05}
          />
        </div>
      </div>
    </SelectionProvider>
  );
};

export default Library;
