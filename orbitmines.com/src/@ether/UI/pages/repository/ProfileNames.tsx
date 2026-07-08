import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getAPI} from '../../data';
import {
  DRAG_HANDLE_SVG_HTML,
  EMAIL_SVG_HTML,
  ETHER_SVG_HTML,
  WORLD_SVG_HTML,
  getSocialLabel,
  getSocialSvg,
  getSocialUrl,
  matchPlatform,
} from './icons';
import {loadProfile, saveProfile} from './storage';
import type {ProfileSocial} from './storage';
import {groupSocials, nameEntryMode} from './profileGroups';
import type {SocialGroup} from './profileGroups';

interface ProfileNamesProps {
  user: string;
  isOwner: boolean;
  defaults?: ProfileSocial[];
}

// Editable list of social/world/email entries, grouped by platform.
// Drag handles let the owner reorder both within a group and across groups.
const ProfileNames: React.FC<ProfileNamesProps> = ({user, isOwner, defaults}) => {
  const [socials, setSocials] = useState<ProfileSocial[]>(() => {
    const stored = loadProfile(user).socials;
    return stored.length > 0 ? stored : (defaults ?? []);
  });

  useEffect(() => {
    const stored = loadProfile(user).socials;
    setSocials(stored.length > 0 ? stored : (defaults ?? []));
  }, [user, defaults]);

  const persist = useCallback(
    (next: ProfileSocial[]) => {
      setSocials(next);
      const profile = loadProfile(user);
      profile.socials = next;
      saveProfile(user, profile);
    },
    [user],
  );

  const groups = useMemo(() => groupSocials(socials), [socials]);

  // ---- Group-level DnD ----
  const [draggingGroupKey, setDraggingGroupKey] = useState<string | null>(null);
  const [groupDropTarget, setGroupDropTarget] = useState<{key: string; before: boolean} | null>(
    null,
  );

  const onGroupDrop = useCallback(() => {
    if (!draggingGroupKey || !groupDropTarget) {
      setDraggingGroupKey(null);
      setGroupDropTarget(null);
      return;
    }
    if (groupDropTarget.key === draggingGroupKey) {
      setDraggingGroupKey(null);
      setGroupDropTarget(null);
      return;
    }
    const srcGroup = groups.find((g) => g.key === draggingGroupKey);
    const tgtGroup = groups.find((g) => g.key === groupDropTarget.key);
    if (!srcGroup || !tgtGroup) {
      setDraggingGroupKey(null);
      setGroupDropTarget(null);
      return;
    }

    const next = [...socials];
    const srcIndices = srcGroup.entries.map((e) => e.idx).sort((a, b) => b - a);
    const srcItems = srcGroup.entries.map((e) => socials[e.idx]);
    for (const idx of srcIndices) next.splice(idx, 1);

    const tgtFirstIdx = tgtGroup.entries[0].idx;
    let insertAt = tgtFirstIdx;
    const removedBefore = srcIndices.filter((si) => si < tgtFirstIdx).length;
    insertAt -= removedBefore;
    if (!groupDropTarget.before) {
      const tgtLastIdx = tgtGroup.entries[tgtGroup.entries.length - 1].idx;
      insertAt = tgtLastIdx - srcIndices.filter((si) => si < tgtLastIdx).length + 1;
    }
    if (insertAt < 0) insertAt = 0;
    if (insertAt > next.length) insertAt = next.length;
    next.splice(insertAt, 0, ...srcItems);
    persist(next);
    setDraggingGroupKey(null);
    setGroupDropTarget(null);
  }, [draggingGroupKey, groupDropTarget, groups, socials, persist]);

  // ---- Within-group entry DnD ----
  const [draggingEntryIdx, setDraggingEntryIdx] = useState<number | null>(null);
  const [entryDropTarget, setEntryDropTarget] = useState<{idx: number; before: boolean} | null>(
    null,
  );

  const onEntryDrop = useCallback(() => {
    if (draggingEntryIdx === null || !entryDropTarget) {
      setDraggingEntryIdx(null);
      setEntryDropTarget(null);
      return;
    }
    if (draggingEntryIdx === entryDropTarget.idx) {
      setDraggingEntryIdx(null);
      setEntryDropTarget(null);
      return;
    }
    const next = [...socials];
    const [moved] = next.splice(draggingEntryIdx, 1);
    let insertIdx = entryDropTarget.before ? entryDropTarget.idx : entryDropTarget.idx + 1;
    if (draggingEntryIdx < insertIdx) insertIdx--;
    next.splice(insertIdx, 0, moved);
    persist(next);
    setDraggingEntryIdx(null);
    setEntryDropTarget(null);
  }, [draggingEntryIdx, entryDropTarget, socials, persist]);

  // ---- Entry modifications ----
  const removeIdx = useCallback(
    (idx: number) => {
      const next = [...socials];
      next.splice(idx, 1);
      persist(next);
    },
    [socials, persist],
  );

  const updateAt = useCallback(
    (idx: number, partial: Partial<ProfileSocial>) => {
      const next = [...socials];
      if (idx < next.length) {
        next[idx] = {...next[idx], ...partial};
      }
      persist(next);
    },
    [socials, persist],
  );

  const appendSocial = useCallback(
    (s: ProfileSocial) => {
      persist([...socials, s]);
    },
    [socials, persist],
  );

  if (!isOwner && socials.length === 0) return null;

  return (
    <div className="profile-names">
      <div className="profile-names-header">Names</div>
      {groups.map((group) => (
        <GroupBlock
          key={group.key}
          group={group}
          isOwner={isOwner}
          draggingGroupKey={draggingGroupKey}
          groupDropTarget={groupDropTarget}
          onGroupDragStart={(k) => setDraggingGroupKey(k)}
          onGroupDragOver={(k, before) => setGroupDropTarget({key: k, before})}
          onGroupDrop={onGroupDrop}
          onGroupDragEnd={() => {
            setDraggingGroupKey(null);
            setGroupDropTarget(null);
          }}
          draggingEntryIdx={draggingEntryIdx}
          entryDropTarget={entryDropTarget}
          onEntryDragStart={(idx) => setDraggingEntryIdx(idx)}
          onEntryDragOver={(idx, before) => setEntryDropTarget({idx, before})}
          onEntryDrop={onEntryDrop}
          onEntryDragEnd={() => {
            setDraggingEntryIdx(null);
            setEntryDropTarget(null);
          }}
          onRemoveIdx={removeIdx}
          onUpdateAt={updateAt}
          user={user}
        />
      ))}
      {isOwner && (
        <AddRow
          user={user}
          onAdd={appendSocial}
        />
      )}
    </div>
  );
};

interface GroupBlockProps {
  group: SocialGroup;
  isOwner: boolean;
  draggingGroupKey: string | null;
  groupDropTarget: {key: string; before: boolean} | null;
  onGroupDragStart: (key: string) => void;
  onGroupDragOver: (key: string, before: boolean) => void;
  onGroupDrop: () => void;
  onGroupDragEnd: () => void;
  draggingEntryIdx: number | null;
  entryDropTarget: {idx: number; before: boolean} | null;
  onEntryDragStart: (idx: number) => void;
  onEntryDragOver: (idx: number, before: boolean) => void;
  onEntryDrop: () => void;
  onEntryDragEnd: () => void;
  onRemoveIdx: (idx: number) => void;
  onUpdateAt: (idx: number, partial: Partial<ProfileSocial>) => void;
  user: string;
}

const GroupBlock: React.FC<GroupBlockProps> = ({
  group,
  isOwner,
  draggingGroupKey,
  groupDropTarget,
  onGroupDragStart,
  onGroupDragOver,
  onGroupDrop,
  onGroupDragEnd,
  draggingEntryIdx,
  entryDropTarget,
  onEntryDragStart,
  onEntryDragOver,
  onEntryDrop,
  onEntryDragEnd,
  onRemoveIdx,
  onUpdateAt,
  user,
}) => {
  const isDragging = draggingGroupKey === group.key;
  const isDropBefore = groupDropTarget?.key === group.key && groupDropTarget.before;
  const isDropAfter = groupDropTarget?.key === group.key && !groupDropTarget.before;

  const className = [
    'profile-name-group',
    isDragging ? 'dragging' : '',
    isDropBefore ? 'drag-over-top' : '',
    isDropAfter ? 'drag-over-bottom' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      onDragOver={(e) => {
        if (!draggingGroupKey) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        onGroupDragOver(group.key, before);
      }}
      onDrop={(e) => {
        if (!draggingGroupKey) return;
        e.preventDefault();
        e.stopPropagation();
        onGroupDrop();
      }}
    >
      {group.entries.map((e, ei) => (
        <EntryRow
          key={e.idx}
          group={group}
          entryIdx={e.idx}
          social={e.social}
          isFirst={ei === 0}
          isOwner={isOwner}
          onGroupDragStart={onGroupDragStart}
          onGroupDragEnd={onGroupDragEnd}
          draggingEntryIdx={draggingEntryIdx}
          entryDropTarget={entryDropTarget}
          onEntryDragStart={onEntryDragStart}
          onEntryDragOver={onEntryDragOver}
          onEntryDrop={onEntryDrop}
          onEntryDragEnd={onEntryDragEnd}
          onRemove={() => onRemoveIdx(e.idx)}
          onUpdate={(partial) => onUpdateAt(e.idx, partial)}
          user={user}
        />
      ))}
    </div>
  );
};

interface EntryRowProps {
  group: SocialGroup;
  entryIdx: number;
  social: ProfileSocial;
  isFirst: boolean;
  isOwner: boolean;
  onGroupDragStart: (key: string) => void;
  onGroupDragEnd: () => void;
  draggingEntryIdx: number | null;
  entryDropTarget: {idx: number; before: boolean} | null;
  onEntryDragStart: (idx: number) => void;
  onEntryDragOver: (idx: number, before: boolean) => void;
  onEntryDrop: () => void;
  onEntryDragEnd: () => void;
  onRemove: () => void;
  onUpdate: (partial: Partial<ProfileSocial>) => void;
  user: string;
}

const EntryRow: React.FC<EntryRowProps> = ({
  group,
  entryIdx,
  social,
  isFirst,
  isOwner,
  onGroupDragStart,
  onGroupDragEnd,
  draggingEntryIdx,
  entryDropTarget,
  onEntryDragStart,
  onEntryDragOver,
  onEntryDrop,
  onEntryDragEnd,
  onRemove,
  onUpdate,
  user,
}) => {
  const isWorld = group.key.startsWith('world:');
  const mode = nameEntryMode(social.platform);
  const firstIdx = group.entries[0].idx;

  let displayPlatform = '';
  let displayUsername = '';
  if (mode === 'world') {
    displayPlatform = social.platform;
    displayUsername = social.username ? `@${social.username}` : '';
  } else if (mode === 'email') {
    displayPlatform = social.platform;
  } else {
    displayPlatform = social.platform ? `@${getSocialLabel(social.platform)}` : '';
    displayUsername = social.username ? `@${social.username}` : '';
  }

  const modeClass = mode !== 'platform' && social.platform ? ` mode-${mode}` : '';
  const isBeingDragged = draggingEntryIdx === entryIdx;
  const isDropBefore = entryDropTarget?.idx === entryIdx && entryDropTarget.before;
  const isDropAfter = entryDropTarget?.idx === entryIdx && !entryDropTarget.before;
  const dragClass = [
    isBeingDragged ? 'dragging' : '',
    isDropBefore ? 'drag-over-top' : '',
    isDropAfter ? 'drag-over-bottom' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const [draggable, setDraggable] = useState(false);

  return (
    <div
      className={`profile-name-group-row${modeClass}${dragClass ? ' ' + dragClass : ''}`}
      draggable={draggable}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('input, button, a, [contenteditable], [data-group-drag]')) return;
        setDraggable(true);
      }}
      onMouseUp={() => setDraggable(false)}
      onDragStart={(e) => {
        if (!draggable) {
          e.preventDefault();
          return;
        }
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(entryIdx));
        onEntryDragStart(entryIdx);
      }}
      onDragOver={(e) => {
        if (draggingEntryIdx === null) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        onEntryDragOver(entryIdx, before);
      }}
      onDrop={(e) => {
        if (draggingEntryIdx === null) return;
        e.preventDefault();
        e.stopPropagation();
        onEntryDrop();
      }}
      onDragEnd={() => {
        setDraggable(false);
        onEntryDragEnd();
      }}
    >
      {isOwner && isFirst ? (
        <span
          className="profile-name-group-drag"
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', group.key);
            onGroupDragStart(group.key);
          }}
          onDragEnd={onGroupDragEnd}
          dangerouslySetInnerHTML={{__html: DRAG_HANDLE_SVG_HTML}}
        />
      ) : isOwner ? (
        <span
          className="profile-name-group-drag"
          style={{visibility: 'hidden'}}
          dangerouslySetInnerHTML={{__html: DRAG_HANDLE_SVG_HTML}}
        />
      ) : null}

      {isFirst ? (
        <span className="profile-name-group-icon" dangerouslySetInnerHTML={{__html: group.icon}} />
      ) : (
        <span className="profile-name-group-icon-spacer" />
      )}

      {group.label ? (
        isFirst ? (
          <span className="profile-name-group-label">{group.label}</span>
        ) : (
          <span className="profile-name-group-label-spacer" />
        )
      ) : null}

      {!isOwner ? (
        <span className="profile-name-group-value">
          {isWorld ? (
            <WorldPathValue social={social} />
          ) : group.key === 'ether' ? (
            <a href={`/@${social.username}`}>@{social.username}</a>
          ) : group.key === 'domain' ? (
            <a href={`https://${social.username}`} target="_blank" rel="noopener noreferrer">
              {social.username}
            </a>
          ) : group.key === 'email' ? (
            <a href={`mailto:${social.platform}`}>{social.platform}</a>
          ) : (
            <PlatformValue social={social} />
          )}
        </span>
      ) : isWorld ? (
        <WorldEditor
          social={social}
          user={user}
          displayPlatform={displayPlatform}
          displayUsername={displayUsername}
          onUpdate={onUpdate}
        />
      ) : group.key === 'email' ? (
        <EmailEditor social={social} onUpdate={onUpdate} />
      ) : (
        <UsernameEditor
          social={social}
          displayUsername={displayUsername}
          user={user}
          onUpdate={onUpdate}
        />
      )}

      <span
        className="profile-name-verified"
        dangerouslySetInnerHTML={{
          __html:
            '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
        }}
      />

      {isOwner && (
        <button type="button" className="profile-name-entry-remove" onClick={onRemove}>
          &times;
        </button>
      )}
    </div>
  );
};

const WorldPathValue: React.FC<{social: ProfileSocial}> = ({social}) => {
  const segments = social.platform.split('.');
  return (
    <span className="profile-name-world-path">
      {segments.map((seg, s) => {
        const indent = s > 0 ? {paddingLeft: s * 12} : undefined;
        if (seg.startsWith('@')) {
          const playerName = seg.slice(1);
          return (
            <span key={s} className="profile-name-path-line" style={indent}>
              <a href={`/@${playerName}`}>{seg}</a>
            </span>
          );
        }
        return (
          <span key={s} className="profile-name-path-line" style={indent}>
            {seg}
          </span>
        );
      })}
      {social.username && (
        <span
          className="profile-name-path-line"
          style={{paddingLeft: segments.length * 12}}
        >
          <a href={`/@${social.username}`}>@{social.username}</a>
        </span>
      )}
    </span>
  );
};

const PlatformValue: React.FC<{social: ProfileSocial}> = ({social}) => {
  const url = getSocialUrl(social.platform, social.username);
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        @{social.username}
      </a>
    );
  }
  return <>@{social.username}</>;
};

interface EditorProps {
  social: ProfileSocial;
  onUpdate: (partial: Partial<ProfileSocial>) => void;
}

const EmailEditor: React.FC<EditorProps> = ({social, onUpdate}) => {
  const [value, setValue] = useState(social.platform);
  return (
    <span className="profile-name-field-wrap" data-name-platform-wrap>
      <input
        className="profile-name-field-value"
        value={value}
        placeholder="email"
        spellCheck={false}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          const next = value.trim();
          if (next !== social.platform) onUpdate({platform: next, username: ''});
        }}
      />
    </span>
  );
};

interface UsernameEditorProps extends EditorProps {
  displayUsername: string;
  user: string;
}

const UsernameEditor: React.FC<UsernameEditorProps> = ({social, displayUsername, onUpdate}) => {
  const [value, setValue] = useState(displayUsername);
  useEffect(() => setValue(displayUsername), [displayUsername]);
  return (
    <span className="profile-name-field-wrap" data-name-value-wrap>
      <input
        className="profile-name-field-value"
        value={value}
        placeholder="@username"
        spellCheck={false}
        onChange={(e) => {
          let v = e.target.value;
          if (!v.startsWith('@') && v.length > 0) v = '@' + v;
          setValue(v);
        }}
        onBlur={() => {
          const next = value.replace(/^@/, '').trim();
          if (next !== social.username) onUpdate({username: next});
        }}
      />
    </span>
  );
};

interface WorldEditorProps extends EditorProps {
  displayPlatform: string;
  displayUsername: string;
  user: string;
}

const WorldEditor: React.FC<WorldEditorProps> = ({
  social,
  displayPlatform,
  displayUsername,
  onUpdate,
}) => {
  const [platform, setPlatform] = useState(displayPlatform);
  const [username, setUsername] = useState(displayUsername);
  useEffect(() => setPlatform(displayPlatform), [displayPlatform]);
  useEffect(() => setUsername(displayUsername), [displayUsername]);
  return (
    <>
      <span className="profile-name-field-wrap" data-name-platform-wrap>
        <input
          className="profile-name-field"
          value={platform}
          placeholder="#world"
          spellCheck={false}
          onChange={(e) => setPlatform(e.target.value)}
          onBlur={() => {
            const next = platform.trim();
            if (next && next !== social.platform) onUpdate({platform: next});
          }}
        />
      </span>
      <span className="profile-name-field-wrap" data-name-value-wrap>
        <input
          className="profile-name-field-value"
          value={username}
          placeholder="@username"
          spellCheck={false}
          onChange={(e) => {
            let v = e.target.value;
            if (!v.startsWith('@') && v.length > 0) v = '@' + v;
            setUsername(v);
          }}
          onBlur={() => {
            const next = username.replace(/^@/, '').trim();
            if (next !== social.username) onUpdate({username: next});
          }}
        />
      </span>
    </>
  );
};

interface AddRowProps {
  user: string;
  onAdd: (s: ProfileSocial) => void;
}

// Empty row at the bottom that adds a new social entry once both fields have
// values. Used only when the viewer is the profile owner.
const AddRow: React.FC<AddRowProps> = ({onAdd}) => {
  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');

  const mode = nameEntryMode(platform);
  const ghostIcon = useMemo(() => {
    if (mode === 'world') return WORLD_SVG_HTML;
    if (mode === 'email') return EMAIL_SVG_HTML;
    const match = matchPlatform(platform.replace(/^@/, ''));
    return match ? getSocialSvg(match.id) : '';
  }, [platform, mode]);

  const commitIfReady = useCallback(() => {
    const rawPlatform = platform.replace(/^@/, '').trim();
    const rawUsername = username.replace(/^@/, '').trim();
    if (mode === 'world' && rawPlatform) {
      onAdd({platform: rawPlatform, username: rawUsername});
      setPlatform('');
      setUsername('');
      return;
    }
    if (mode === 'email' && rawPlatform) {
      onAdd({platform: rawPlatform, username: ''});
      setPlatform('');
      return;
    }
    if (rawPlatform && rawUsername) {
      const match = matchPlatform(rawPlatform);
      const platformId = match ? match.id : rawPlatform.toLowerCase();
      onAdd({platform: platformId, username: rawUsername});
      setPlatform('');
      setUsername('');
    } else if (!rawPlatform && rawUsername) {
      onAdd({platform: 'ether', username: rawUsername});
      setUsername('');
    }
  }, [platform, username, mode, onAdd]);

  return (
    <div
      className={`profile-name-item${mode !== 'platform' && platform ? ' mode-' + mode : ''}`}
    >
      <span
        className="profile-name-drag"
        style={{visibility: 'hidden'}}
        dangerouslySetInnerHTML={{__html: DRAG_HANDLE_SVG_HTML}}
      />
      <span className="profile-name-icon" dangerouslySetInnerHTML={{__html: ghostIcon}} />
      <span className="profile-name-field-wrap" data-name-platform-wrap>
        <input
          className="profile-name-field"
          value={platform}
          placeholder={mode === 'world' ? '#world' : mode === 'email' ? 'email' : '@platform'}
          spellCheck={false}
          onChange={(e) => setPlatform(e.target.value)}
          onBlur={commitIfReady}
        />
      </span>
      <span className="profile-name-field-wrap" data-name-value-wrap>
        <input
          className="profile-name-field-value"
          value={username}
          placeholder="@username"
          spellCheck={false}
          onChange={(e) => {
            let v = e.target.value;
            if (!v.startsWith('@') && v.length > 0) v = '@' + v;
            setUsername(v);
          }}
          onBlur={commitIfReady}
        />
      </span>
    </div>
  );
};

export default ProfileNames;
