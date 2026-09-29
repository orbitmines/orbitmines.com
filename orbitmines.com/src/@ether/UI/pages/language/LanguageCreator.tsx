import React, {useEffect, useMemo, useState} from 'react';
import {IDELayout, generateId} from '../../layout';
import type {LayoutNode, PanelDefinition} from '../../layout';
import {FileIcon} from '../../icons';
import {expandParents, findInstance} from './modules';
import {validateProgram} from './validation';
import {loadConfig, saveConfig} from './storage';
import type {LangConfig, ModuleInstance} from './types';
import ProgramPanel from './ProgramPanel';
import ErrorsPanel from './ErrorsPanel';
import SidebarPanel from './SidebarPanel';
import './Language.scss';

type Props = {
  lang: string;
};

// `/$.<lang>` view — IDE-style layout with three panels:
//   * sidebar  — files under @ether/.<lang>/
//   * program  — module tree of the language definition
//   * problems — validation errors
//
// The program is the single source of truth here; both the program panel
// and errors panel derive their state from it.
const LanguageCreator: React.FC<Props> = ({lang}) => {
  const [config, setConfig] = useState<LangConfig | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setConfig(null);
    setSelectedId(null);
    loadConfig(lang).then((c) => {
      if (!cancelled) setConfig(c);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // Persist any program mutation.
  useEffect(() => {
    if (config) saveConfig(lang, config);
  }, [config, lang]);

  const errors = useMemo(
    () => (config ? validateProgram(config.program) : []),
    [config],
  );

  const setProgram = (next: ModuleInstance[]) => {
    setConfig((prev) => (prev ? {...prev, program: next} : prev));
  };

  const onToggleExpand = (id: string) => {
    if (!config) return;
    const next = config.program.map(toggleExpandIn(id));
    setProgram(next);
  };

  const onErrorClick = (instanceId: string) => {
    if (!config) return;
    const next = clone(config.program);
    expandParents(next, instanceId);
    setProgram(next);
    setSelectedId(instanceId);
  };

  const panels = useMemo<PanelDefinition[]>(
    () => [
      {
        id: 'lang-sidebar',
        title: `$.${lang}`,
        icon: <FileIcon name="folder" isDirectory size={14} />,
        closable: false,
        sticky: true,
        content: <SidebarPanel lang={lang} />,
      },
      {
        id: 'lang-program',
        title: 'Program',
        closable: false,
        content: config ? (
          <ProgramPanel
            program={config.program}
            errors={errors}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggleExpand={onToggleExpand}
            onProgramChange={setProgram}
          />
        ) : (
          <div style={{padding: 12, color: 'rgba(255,255,255,0.4)'}}>Loading…</div>
        ),
      },
      {
        id: 'lang-errors',
        title: 'Problems',
        closable: false,
        sticky: true,
        content: <ErrorsPanel errors={errors} onSelect={onErrorClick} />,
      },
    ],
    // Intentionally omit handler deps — re-creating panels on every state
    // change is fine; IDELayout uses the latest props on each render.
    [lang, config, errors, selectedId],
  );

  const initialLayout = useMemo<LayoutNode>(
    () => ({
      type: 'split',
      id: generateId(),
      direction: 'horizontal',
      children: [
        {type: 'tabgroup', id: generateId(), panels: ['lang-sidebar'], activeIndex: 0},
        {type: 'tabgroup', id: generateId(), panels: ['lang-program'], activeIndex: 0},
        {type: 'tabgroup', id: generateId(), panels: ['lang-errors'], activeIndex: 0},
      ],
      sizes: [0.18, 0.57, 0.25],
    }),
    [],
  );

  return (
    <div style={{width: '100%', height: '100vh'}}>
      <IDELayout panels={panels} initialLayout={initialLayout} />
    </div>
  );
};

export default LanguageCreator;

// ---- Helpers ----

function toggleExpandIn(id: string) {
  const visit = (inst: ModuleInstance): ModuleInstance => {
    if (inst.id === id) return {...inst, expanded: !inst.expanded};
    return {...inst, children: inst.children.map(visit)};
  };
  return visit;
}

function clone(program: ModuleInstance[]): ModuleInstance[] {
  return program.map((inst) => ({
    ...inst,
    config: {...inst.config},
    children: clone(inst.children),
  }));
}
