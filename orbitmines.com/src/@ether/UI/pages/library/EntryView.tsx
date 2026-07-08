import React, {useEffect, useRef, useState} from 'react';
import classnames from 'classnames';
import {
  Entry,
  LanguageRef,
  LibrariesGroup as LibrariesGroupType,
  TagGroup,
  entryKey,
  isLibrariesGroup,
  resolveLanguage,
} from './types';
import {Add, Branch, CaretDown, iconForName, iconSmallForName} from './icons';
import Dropdown, {DropdownItem} from './Dropdown';
import {useSelection} from './SelectionContext';

// ---- Helpers ----

function getTagGroups(entry: Entry): TagGroup[] {
  if (!entry.versions || entry.versions.length === 0) return [];
  const out: TagGroup[] = [];
  const map = new Map<string, {name: string; icon: string}[]>();
  for (const v of entry.versions) {
    const lang = resolveLanguage(v.language, entry.language);
    if (!map.has(v.tag)) {
      const arr: {name: string; icon: string}[] = [];
      map.set(v.tag, arr);
      out.push({tag: v.tag, langs: arr});
    }
    const arr = map.get(v.tag)!;
    if (!arr.some((l) => l.name === lang.name)) arr.push(lang);
  }
  return out;
}

function selectedVersion(
  entry: Entry,
  selTag: string,
  selLang: string,
) {
  if (!entry.versions || entry.versions.length === 0) return null;
  return (
    entry.versions.find((v) => {
      const lang = resolveLanguage(v.language, entry.language);
      return v.tag === selTag && lang.name === selLang;
    }) || entry.versions[0]
  );
}

// ---- Inline name renderer ----

const EntryName: React.FC<{entry: Entry}> = ({entry}) => {
  const isFile = entry.type === 'file';
  if (entry.library) {
    return (
      <span>
        {entry.library} <span className="lib-muted">//</span>{' '}
        {isFile ? <span className="lib-disabled">{entry.name}</span> : entry.name}
      </span>
    );
  }
  if (entry.reference) {
    return (
      <span className="lib-inline-row">
        {entry.name} <span className="lib-muted">-&gt;</span>{' '}
        {iconSmallForName(entry.reference.icon || 'circle')} {entry.reference.name}
      </span>
    );
  }
  return isFile ? <span className="lib-disabled">{entry.name}</span> : <span>{entry.name}</span>;
};

// ---- Main entry view ----

type Props = {
  entry: Entry;
  isTopLevel?: boolean;
  defaultLanguage?: LanguageRef;
  onOpen: (entry: Entry) => void;
};

const EntryView: React.FC<Props> = ({entry, isTopLevel, defaultLanguage, onOpen}) => {
  const sel = useSelection();
  const key = `entry:${entryKey(entry)}`;
  useEffect(() => sel.registerOrder(key), [key, sel]);

  const tagGroups = getTagGroups(entry);
  const [selTag, setSelTag] = useState(() => tagGroups[0]?.tag || '');
  const [selLang, setSelLang] = useState(() => tagGroups[0]?.langs[0]?.name || '');
  const [versionOpen, setVersionOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const versionRef = useRef<HTMLButtonElement>(null);
  const langRef = useRef<HTMLButtonElement>(null);

  const hasVersions = entry.versions && entry.versions.length > 0;
  const currentGroup = tagGroups.find((g) => g.tag === selTag);
  const currentLang =
    currentGroup?.langs.find((l) => l.name === selLang) ||
    currentGroup?.langs[0] || {name: '', icon: 'circle'};
  const entryLang = entry.language || defaultLanguage;
  const isLibrary = entry.type === 'library';
  const isFile = entry.type === 'file';
  const defaultIcon = isLibrary ? 'git-repo' : 'circle';
  const iconName = entry.icon || defaultIcon;
  const selectedVer = selectedVersion(entry, selTag, selLang);

  const onClick = (e: React.MouseEvent) => {
    sel.select(key, e);
    onOpen(entry);
  };

  return (
    <div className="lib-entry">
      <div
        className={classnames('lib-selectable', {
          'lib-selectable--selected': sel.isSelected(key),
        })}
        onClick={onClick}
      >
        <div className="lib-row lib-row-middle lib-row-between">
          <div className="lib-row lib-row-middle lib-entry-left">
            <span className={isFile && !hasVersions ? 'lib-disabled' : undefined}>
              {iconForName(iconName)}
            </span>
            <span className="lib-entry-name">
              {isTopLevel ? (
                <h3 className="lib-entry-title">{entry.name}</h3>
              ) : (
                <EntryName entry={entry} />
              )}
            </span>
          </div>
          {hasVersions && (
            <div
              className="lib-entry-controls"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="lib-btn lib-btn--icon" title="Add" type="button">
                <Add />
              </button>
              <div className="lib-selectors">
                <button
                  ref={versionRef}
                  className="lib-btn lib-btn--selector"
                  type="button"
                  onClick={() => setVersionOpen((o) => !o)}
                >
                  <Branch /> <span className="lib-muted">{selTag}</span> <CaretDown />
                </button>
                <button
                  ref={langRef}
                  className="lib-btn lib-btn--lang"
                  type="button"
                  onClick={() => setLangOpen((o) => !o)}
                >
                  {iconSmallForName(currentLang.icon)}{' '}
                  <span>{currentLang.name}</span> <CaretDown />
                </button>
              </div>
            </div>
          )}
        </div>
        {entry.snippet && <div className="lib-snippet">{entry.snippet}</div>}
      </div>

      <Dropdown anchorRef={versionRef} open={versionOpen} onClose={() => setVersionOpen(false)}>
        {tagGroups.map(({tag, langs}) => (
          <DropdownItem
            key={tag}
            active={tag === selTag}
            onClick={() => {
              setSelTag(tag);
              setVersionOpen(false);
            }}
          >
            <div className="lib-dropdown-row">
              <Branch /> <span>{tag}</span>
              <span className="lib-dropdown-tags">
                {langs.map((lang) => {
                  const isActive = tag === selTag && lang.name === selLang;
                  return (
                    <button
                      key={lang.name}
                      type="button"
                      className={'lib-tag' + (isActive ? ' lib-tag--active' : '')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelTag(tag);
                        setSelLang(lang.name);
                        setVersionOpen(false);
                      }}
                    >
                      {iconSmallForName(lang.icon)} {lang.name}
                    </button>
                  );
                })}
              </span>
            </div>
          </DropdownItem>
        ))}
      </Dropdown>

      <Dropdown anchorRef={langRef} open={langOpen} onClose={() => setLangOpen(false)}>
        <DropdownItem header>
          <Branch /> <span>{selTag}</span>
        </DropdownItem>
        {currentGroup?.langs.map((lang) => (
          <DropdownItem
            key={lang.name}
            active={lang.name === selLang}
            onClick={() => {
              setSelLang(lang.name);
              setLangOpen(false);
            }}
          >
            <div className="lib-dropdown-row">
              {iconSmallForName(lang.icon)} <span>{lang.name}</span>
            </div>
          </DropdownItem>
        ))}
      </Dropdown>

      {selectedVer?.children && selectedVer.children.length > 0 && (
        <div className="lib-indent">
          {selectedVer.children.map((child, i) =>
            isLibrariesGroup(child) ? (
              <LibrariesGroupView key={`g-${i}`} group={child} onOpen={onOpen} />
            ) : (
              <EntryView
                key={`c-${entryKey(child)}-${i}`}
                entry={child}
                defaultLanguage={entryLang}
                onOpen={onOpen}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default EntryView;

// ---- Libraries Group ----

const LibrariesGroupView: React.FC<{
  group: LibrariesGroupType;
  onOpen: (entry: Entry) => void;
}> = ({group, onOpen}) => {
  const sel = useSelection();
  return (
    <div className="lib-libraries-group">
      <div className="lib-row lib-row-middle">
        {iconForName('git-repo')}{' '}
        <span>
          Libraries
          {group.count !== undefined && (
            <span className="lib-muted"> ({group.count.toLocaleString()})</span>
          )}
        </span>
      </div>
      <div className="lib-indent">
        {group.entries.map((data, i) => {
          const entryForTab: Entry = {
            type: 'library',
            name: data.name,
            icon: data.icon || 'circle',
            reference: data.reference,
            snippet: data.snippet,
          };
          const key = `lib-entry:${entryKey(entryForTab)}-${i}`;
          return (
            <LibraryEntryRow
              key={key}
              entry={entryForTab}
              selKey={key}
              onClick={(e) => {
                sel.select(key, e);
                onOpen(entryForTab);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const LibraryEntryRow: React.FC<{
  entry: Entry;
  selKey: string;
  onClick: (e: React.MouseEvent) => void;
}> = ({entry, selKey, onClick}) => {
  const sel = useSelection();
  useEffect(() => sel.registerOrder(selKey), [selKey, sel]);
  return (
    <div
      className={classnames('lib-selectable', {
        'lib-selectable--selected': sel.isSelected(selKey),
      })}
      onClick={onClick}
    >
      <div className="lib-row lib-row-middle">
        {iconForName(entry.icon)}{' '}
        <span className="lib-entry-name">
          <EntryName entry={entry} />
        </span>
      </div>
      {entry.snippet && <div className="lib-snippet">{entry.snippet}</div>}
    </div>
  );
};
