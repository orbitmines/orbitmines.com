import React, {useEffect, useMemo, useRef} from 'react';
import classnames from 'classnames';
import type {ModuleInstance, ModuleType, ProgramError} from './types';
import {MODULE_TYPE_MAP, findInstance, findParentList, flattenProgram} from './modules';
import {instanceHasErrors, validateProgram} from './validation';

type Props = {
  program: ModuleInstance[];
  errors: ProgramError[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onProgramChange: (next: ModuleInstance[]) => void;
};

const ProgramPanel: React.FC<Props> = ({
  program,
  errors,
  selectedId,
  onSelect,
  onToggleExpand,
  onProgramChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flat = useMemo(() => flattenProgram(program), [program]);

  // Keyboard nav. Mutates a fresh deep-copy of the program for moves so the
  // parent gets a new reference; selection-only changes go through onSelect.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const idx = flat.findIndex((f) => f.inst.id === selectedId);
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const dir = e.key === 'ArrowUp' ? -1 : 1;
        if (e.ctrlKey && e.shiftKey && selectedId) {
          e.preventDefault();
          const next = clone(program);
          const list = findParentList(next, selectedId);
          if (!list) return;
          const ci = list.findIndex((c) => c.id === selectedId);
          if (ci === -1) return;
          const newIdx = ci + dir;
          if (newIdx < 0 || newIdx >= list.length) return;
          [list[ci], list[newIdx]] = [list[newIdx], list[ci]];
          onProgramChange(next);
        } else {
          e.preventDefault();
          const newIdx = idx + dir;
          if (newIdx >= 0 && newIdx < flat.length) {
            onSelect(flat[newIdx].inst.id);
            requestAnimationFrame(() => {
              el.querySelector(`[data-instance-id="${flat[newIdx].inst.id}"]`)?.scrollIntoView({
                block: 'nearest',
              });
            });
          }
        }
      } else if (e.key === 'ArrowLeft' && selectedId) {
        e.preventDefault();
        const inst = findInstance(program, selectedId);
        if (inst && inst.children.length > 0 && inst.expanded) onToggleExpand(selectedId);
      } else if (e.key === 'ArrowRight' && selectedId) {
        e.preventDefault();
        const inst = findInstance(program, selectedId);
        if (inst && inst.children.length > 0 && !inst.expanded) onToggleExpand(selectedId);
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [program, selectedId, flat, onSelect, onToggleExpand, onProgramChange]);

  const setField = (instId: string, key: string, value: unknown) => {
    const next = clone(program);
    const inst = findInstance(next, instId);
    if (!inst) return;
    inst.config[key] = value;
    inst.isDefault = false;
    onProgramChange(next);
  };

  return (
    <div ref={containerRef} className="program-panel" tabIndex={0}>
      {flat.map(({inst, depth}) => {
        const mtype = MODULE_TYPE_MAP.get(inst.typeId);
        const hasErr = instanceHasErrors(inst, errors);
        const hasChildren = inst.children.length > 0;
        const pad = 16 + depth * 20;
        return (
          <div
            key={inst.id}
            data-instance-id={inst.id}
            className={classnames('prog-line', {
              'prog-line--selected': selectedId === inst.id,
              'prog-line--default': inst.isDefault,
            })}
            style={{paddingLeft: pad}}
            onClick={(e) => {
              const t = e.target as HTMLElement;
              if (t.closest('.prog-field-text, .prog-field-select, .prog-field-toggle, .prog-arrow')) return;
              onSelect(inst.id);
            }}
          >
            {hasChildren ? (
              <button
                type="button"
                className="prog-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(inst.id);
                }}
              >
                {inst.expanded ? '▾' : '▸'}
              </button>
            ) : (
              <span className="prog-arrow" />
            )}
            <span className="prog-display">
              {mtype ? (
                <DisplayLine inst={inst} mtype={mtype} setField={setField} />
              ) : (
                <span className="prog-chrome">{inst.typeId}</span>
              )}
            </span>
            {hasErr && <span className="prog-error-dot" />}
          </div>
        );
      })}
    </div>
  );
};

export default ProgramPanel;

// ---- Display-line renderer ----

const DisplayLine: React.FC<{
  inst: ModuleInstance;
  mtype: ModuleType;
  setField: (instId: string, key: string, value: unknown) => void;
}> = ({inst, mtype, setField}) => {
  const fieldMap = new Map(mtype.fields.map((f) => [f.key, f]));
  const template = mtype.display || mtype.name;

  const out: React.ReactNode[] = [];
  let i = 0;
  let nodeKey = 0;
  while (i < template.length) {
    const open = template.indexOf('{', i);
    if (open === -1) {
      out.push(
        <span className="prog-chrome" key={nodeKey++}>
          {template.slice(i)}
        </span>,
      );
      break;
    }
    if (open > i) {
      out.push(
        <span className="prog-chrome" key={nodeKey++}>
          {template.slice(i, open)}
        </span>,
      );
    }
    const close = template.indexOf('}', open);
    if (close === -1) {
      out.push(
        <span className="prog-chrome" key={nodeKey++}>
          {template.slice(open)}
        </span>,
      );
      break;
    }
    const key = template.slice(open + 1, close);
    const field = fieldMap.get(key);
    if (!field) {
      out.push(
        <span className="prog-chrome" key={nodeKey++}>{`{${key}}`}</span>,
      );
    } else {
      const value = inst.config[key];
      if (field.type === 'select' && field.options) {
        out.push(
          <select
            key={nodeKey++}
            className="prog-field-select"
            value={value ?? ''}
            onChange={(e) => setField(inst.id, key, e.target.value || undefined)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">--</option>
            {field.options.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>,
        );
      } else if (field.type === 'toggle') {
        out.push(
          <input
            key={nodeKey++}
            type="checkbox"
            className="prog-field-toggle"
            checked={value === true || value === 'true'}
            onChange={(e) => setField(inst.id, key, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />,
        );
      } else {
        const str = String(value ?? '');
        const size = Math.max(str.length, field.placeholder?.length || 3, 3);
        out.push(
          <input
            key={nodeKey++}
            type="text"
            className="prog-field-text"
            value={str}
            size={size}
            placeholder={field.placeholder ?? ''}
            onChange={(e) => setField(inst.id, key, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />,
        );
      }
    }
    i = close + 1;
  }
  return <>{out}</>;
};

// ---- Deep copy ----
function clone(program: ModuleInstance[]): ModuleInstance[] {
  return program.map((inst) => ({
    ...inst,
    config: {...inst.config},
    children: clone(inst.children),
  }));
}
