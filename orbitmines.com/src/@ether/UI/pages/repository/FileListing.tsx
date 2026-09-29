import React from 'react';
import {useNavigate} from 'react-router-dom';
import {FileIcon} from '../../icons';
import {flattenEntries, isCompound} from '../../data';
import type {CompoundEntry, FileEntry, TreeEntry} from '../../data';
import AccessBadge from './AccessBadge';
import type {AccessLevel} from './AccessBadge';
import {buildEntryHref, displayEntryName} from './paths';
import type {ParentContext} from './paths';

interface FileListingProps {
  entries: TreeEntry[];
  basePath: string;
}

const FileListing: React.FC<FileListingProps> = ({entries, basePath}) => {
  const sortKey = (entry: TreeEntry): {isDir: boolean; name: string} => {
    if (isCompound(entry)) {
      const leaf = firstLeaf(entry);
      return leaf ? {isDir: leaf.isDirectory, name: leaf.name} : {isDir: false, name: ''};
    }
    return {isDir: entry.isDirectory, name: entry.name};
  };

  const sorted = [...entries].sort((a, b) => {
    const ka = sortKey(a);
    const kb = sortKey(b);
    if (ka.isDir !== kb.isDir) return ka.isDir ? -1 : 1;
    return ka.name.localeCompare(kb.name);
  });

  return (
    <div className="file-table">
      {sorted.map((entry, i) =>
        isCompound(entry) ? (
          <CompoundRow key={i} compound={entry} basePath={basePath} />
        ) : (
          <FileRow key={i} entry={entry} basePath={basePath} />
        ),
      )}
    </div>
  );
};

interface FileRowProps {
  entry: FileEntry;
  basePath: string;
  compoundSize?: number;
  parentContext?: ParentContext;
}

export const FileRow: React.FC<FileRowProps> = ({
  entry,
  basePath,
  compoundSize,
  parentContext = null,
}) => {
  const navigate = useNavigate();
  const href = entry.isDirectory
    ? buildEntryHref(basePath, entry.name, parentContext)
    : basePath + '#' + entry.name;
  const displayName = displayEntryName(entry.name, parentContext);
  const accessLevel = (entry.access || 'public') as AccessLevel;

  return (
    <a
      className="file-row"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if (entry.externalRoute) navigate(entry.externalRoute);
        else navigate(href);
      }}
    >
      <div className="file-access">
        <AccessBadge level={accessLevel} />
      </div>
      <div className="file-icon">
        <FileIcon name={entry.name} isDirectory={entry.isDirectory} encrypted={entry.encrypted} />
      </div>
      <div className="file-name">
        {displayName}
        {compoundSize ? <span className="compound-count"> ({compoundSize})</span> : null}
      </div>
      <div className="file-modified">{entry.modified}</div>
    </a>
  );
};

interface CompoundRowProps {
  compound: CompoundEntry;
  basePath: string;
}

const CompoundRow: React.FC<CompoundRowProps> = ({compound, basePath}) => {
  const count = flattenEntries(compound.entries).length;
  if (compound.op === '|') {
    // OR: show only the first entry with the count badge
    const first = compound.entries[0];
    if (isCompound(first)) return <CompoundRow compound={first} basePath={basePath} />;
    return <FileRow entry={first} basePath={basePath} compoundSize={count} />;
  }
  return (
    <div className="compound-group compound-and">
      {compound.entries.map((e, i) =>
        isCompound(e) ? (
          <CompoundRow key={i} compound={e} basePath={basePath} />
        ) : (
          <FileRow key={i} entry={e} basePath={basePath} compoundSize={count} />
        ),
      )}
    </div>
  );
};

function firstLeaf(entry: TreeEntry): FileEntry | null {
  if (!isCompound(entry)) return entry;
  for (const child of entry.entries) {
    const leaf = firstLeaf(child);
    if (leaf) return leaf;
  }
  return null;
}

export function findReadmes(entries: TreeEntry[]): FileEntry[] {
  const result: FileEntry[] = [];
  for (const entry of entries) {
    if (isCompound(entry)) {
      result.push(...findReadmes(entry.entries));
    } else if (entry.name === 'README.md' && !entry.isDirectory) {
      result.push(entry);
    }
  }
  return result;
}

export default FileListing;
