import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AccessIcon} from '../../icons';

// Access badge — small icon with hover-tooltip + click-to-edit popup.
// Tooltip is rendered into document.body via a portal-like absolute element
// so it escapes any stacking context, matching the ray prototype.

export type AccessLevel = 'public' | 'local' | 'private' | 'npc' | 'player' | 'everyone';

interface TooltipData {
  label: string;
  color: string;
  desc: string;
}

const ACCESS_DATA: Record<AccessLevel, TooltipData> = {
  public: {label: '@public', color: 'rgba(255,255,255,0.5)', desc: 'Visible to everyone'},
  local: {label: '@local', color: '#f87171', desc: 'Only on your local machine'},
  private: {
    label: '@private',
    color: '#fb923c',
    desc: 'Any machine hosting your character, includes <a class="access-tooltip-link" data-access-link href="/@ether">@ether</a>',
  },
  npc: {label: '@npc', color: 'rgba(255,255,255,0.5)', desc: 'Only visible to NPCs'},
  player: {label: '@player', color: 'rgba(255,255,255,0.5)', desc: 'Only visible to players'},
  everyone: {label: '', color: '#fb923c', desc: ''},
};

export function resolveAccessLevel(value: string): AccessLevel {
  const v = value.trim().toLowerCase();
  if (v === '@local' || v === 'local') return 'local';
  if (v === '@public' || v === 'public') return 'public';
  if (v === '@private' || v === 'private') return 'private';
  if (v === '@npc' || v === 'npc') return 'npc';
  if (v === '@player' || v === 'player') return 'player';
  if (v.endsWith('.@everyone') || v === '@everyone') return 'everyone';
  return 'everyone';
}

export function accessValueForLevel(level: AccessLevel, groupContext: string): string {
  switch (level) {
    case 'local':
      return '@local';
    case 'private':
      return '@private';
    case 'npc':
      return '@npc';
    case 'player':
      return '@player';
    case 'everyone':
      return (groupContext || '@public') + '.@everyone';
    case 'public':
    default:
      return '@public';
  }
}

function colorForLevel(level: AccessLevel): string {
  return ACCESS_DATA[level]?.color || ACCESS_DATA.public.color;
}

export interface AccessBadgeProps {
  level?: AccessLevel;
  /** Custom access value (overrides label/desc) — e.g. "@ether.@everyone". */
  value?: string;
  /** Surrounding group used to resolve "@everyone" labels. */
  groupContext?: string;
  size?: number;
}

const AccessBadge: React.FC<AccessBadgeProps> = ({
  level = 'public',
  value,
  groupContext = '@public',
  size = 12,
}) => {
  const navigate = useNavigate();
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<AccessLevel>(level);
  const [currentValue, setCurrentValue] = useState<string | undefined>(value);

  useEffect(() => setCurrentLevel(level), [level]);
  useEffect(() => setCurrentValue(value), [value]);

  const showTooltip = hovered || editing;

  const data = ACCESS_DATA[currentLevel] || ACCESS_DATA.public;
  let label: string;
  let desc: string;
  if (currentValue) {
    label = currentValue;
    desc = 'Custom access group';
  } else if (currentLevel === 'everyone') {
    const ctx = groupContext || '@public';
    label = ctx + '.@everyone';
    desc = 'Everyone in ' + ctx;
  } else {
    label = data.label;
    desc = data.desc;
  }

  const onTooltipClick = useCallback(
    (e: React.MouseEvent) => {
      const link = (e.target as HTMLElement).closest('[data-access-link]') as HTMLAnchorElement | null;
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        setHovered(false);
        setEditing(false);
        const href = link.getAttribute('href');
        if (href) navigate(href);
      }
    },
    [navigate],
  );

  const onInputBlur = useCallback(() => {
    setEditing(false);
  }, []);

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const raw = (e.target as HTMLInputElement).value.trim();
        if (raw) {
          const newLevel = resolveAccessLevel(raw);
          const standard = accessValueForLevel(newLevel, groupContext);
          setCurrentLevel(newLevel);
          setCurrentValue(raw.toLowerCase() === standard.toLowerCase() ? undefined : raw);
        }
        setEditing(false);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditing(false);
      }
    },
    [groupContext],
  );

  // Position tooltip relative to badge
  const [pos, setPos] = useState<{top: number; left: number} | null>(null);
  useEffect(() => {
    if (!showTooltip || !badgeRef.current) {
      setPos(null);
      return;
    }
    const rect = badgeRef.current.getBoundingClientRect();
    // Initial position; we re-measure after first paint to align right-edge
    let top = rect.top - 30;
    let left = rect.right - 4;
    if (top < 8) top = rect.bottom + 6;
    setPos({top, left});
  }, [showTooltip]);

  return (
    <>
      <span
        ref={badgeRef}
        className="access-badge"
        data-access={currentLevel}
        data-access-value={currentValue}
        onMouseEnter={() => !editing && setHovered(true)}
        onMouseLeave={() => !editing && setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setHovered(false);
          setEditing(true);
        }}
      >
        <AccessIcon level={currentLevel} size={size} />
      </span>
      {showTooltip && pos && (
        <div
          className="access-tooltip visible"
          style={{top: pos.top, left: pos.left}}
          onClick={onTooltipClick}
        >
          {editing ? (
            <input
              autoFocus
              className="access-tooltip-input"
              style={{color: colorForLevel(currentLevel)}}
              defaultValue={currentValue || accessValueForLevel(currentLevel, groupContext)}
              onBlur={onInputBlur}
              onKeyDown={onInputKeyDown}
            />
          ) : (
            <>
              <span className="access-tooltip-label" style={{color: data.color}}>
                {label}
              </span>{' '}
              <span
                className="access-tooltip-desc"
                dangerouslySetInnerHTML={{__html: desc}}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AccessBadge;
