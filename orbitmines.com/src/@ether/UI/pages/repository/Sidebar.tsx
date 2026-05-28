import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import classnames from 'classnames';
import {FileIcon} from '../../icons';
import {flattenEntries, getAPI} from '../../data';
import type {FileEntry, TreeEntry} from '../../data';
import {buildEntryHref, displayEntryName} from './paths';
import type {ParentContext} from './paths';
import AccessBadge from './AccessBadge';
import type {AccessLevel} from './AccessBadge';
import {getCurrentPlayer, loadSession, saveSession} from './storage';

interface SidebarProps {
  entries: TreeEntry[];
  basePath: string;
  /** Path to auto-expand on initial mount (matches the file currently open). */
  expandPath: string[];
  /** Resolve a sidebar href into the API listDirectory path for lazy loading. */
  toApiPath: (relPath: string) => string;
  /** Called when a leaf entry is clicked. */
  onFileClick: (href: string) => void;
  /** When clicking a directory header with no children, navigate to it. */
  onDirectoryNavigate?: (href: string) => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const session = loadSession(getCurrentPlayer());
    const set = new Set<string>();
    if (Array.isArray(session.sidebarExpanded)) {
      for (const key of session.sidebarExpanded) set.add(key);
    }
    return set;
  });

  const toggleExpanded = useCallback((key: string, willExpand: boolean) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (willExpand) next.add(key);
      else next.delete(key);
      const session = loadSession(getCurrentPlayer());
      session.sidebarExpanded = [...next];
      saveSession(getCurrentPlayer(), session);
      return next;
    });
  }, []);

  return (
    <SidebarTree
      {...props}
      expanded={expanded}
      onToggle={toggleExpanded}
      depth={0}
      parentContext={null}
    />
  );
};

interface SidebarTreeProps extends SidebarProps {
  expanded: Set<string>;
  onToggle: (key: string, willExpand: boolean) => void;
  depth: number;
  parentContext: ParentContext;
}

const SidebarTree: React.FC<SidebarTreeProps> = ({
  entries,
  basePath,
  expandPath,
  expanded,
  onToggle,
  toApiPath,
  onFileClick,
  onDirectoryNavigate,
  depth,
  parentContext,
}) => {
  const flat = flattenEntries(entries);
  const sorted = [...flat].sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  const seen = new Set<string>();
  const deduped = sorted.filter((e) => {
    if (seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });

  const pad = 8 + depth * 16;

  return (
    <>
      {deduped.map((entry) => {
        const href = buildEntryHref(basePath, entry.name, parentContext);
        const name = displayEntryName(entry.name, parentContext);
        const childContext: ParentContext = entry.name === '@' ? '@' : entry.name === '~' ? '~' : null;
        const isOnPath = expandPath.length > 0 && expandPath[0] === entry.name;

        if (entry.isDirectory) {
          return (
            <DirectoryNode
              key={href}
              entry={entry}
              href={href}
              name={name}
              pad={pad}
              isOnPath={isOnPath}
              expanded={expanded}
              onToggle={onToggle}
              expandPath={expandPath.length > 0 ? expandPath.slice(1) : []}
              basePath={href}
              toApiPath={toApiPath}
              onFileClick={onFileClick}
              onDirectoryNavigate={onDirectoryNavigate}
              depth={depth + 1}
              parentContext={childContext}
            />
          );
        }

        return (
          <FileNode
            key={href}
            entry={entry}
            href={href}
            name={name}
            pad={pad}
            isOnPath={isOnPath}
            expandPath={expandPath.length > 0 ? expandPath.slice(1) : []}
            expanded={expanded}
            onToggle={onToggle}
            onFileClick={onFileClick}
            onDirectoryNavigate={onDirectoryNavigate}
            toApiPath={toApiPath}
            depth={depth + 1}
            parentContext={childContext}
          />
        );
      })}
    </>
  );
};

interface NodeProps {
  entry: FileEntry;
  href: string;
  name: string;
  pad: number;
  isOnPath: boolean;
  expandPath: string[];
  expanded: Set<string>;
  onToggle: (key: string, willExpand: boolean) => void;
  toApiPath: (relPath: string) => string;
  onFileClick: (href: string) => void;
  onDirectoryNavigate?: (href: string) => void;
  basePath?: string;
  depth: number;
  parentContext: ParentContext;
}

const DirectoryNode: React.FC<NodeProps> = ({
  entry,
  href,
  name,
  pad,
  isOnPath,
  expandPath,
  expanded,
  onToggle,
  toApiPath,
  onFileClick,
  onDirectoryNavigate,
  basePath,
  depth,
  parentContext,
}) => {
  // Auto-expand directories that sit on the open file's path
  useEffect(() => {
    if (isOnPath && !expanded.has(href)) {
      onToggle(href, true);
    }
  }, []);

  const isExpanded = expanded.has(href);
  const [fetchedChildren, setFetchedChildren] = useState<TreeEntry[] | null>(null);
  const children = entry.children || fetchedChildren || [];
  const navigate = useNavigate();

  const accessLevel = (entry.access || 'public') as AccessLevel;

  const onHeaderClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!entry.children && !fetchedChildren) {
        // Lazy fetch children on first expand
        const sidebarPrefix = (basePath || '').replace(/\/$/, '');
        const relPath = href.startsWith(sidebarPrefix + '/')
          ? href.slice(sidebarPrefix.length + 1)
          : null;
        if (relPath !== null) {
          getAPI()
            .listDirectory(toApiPath(decodeURIComponent(relPath)))
            .then((fetched) => {
              setFetchedChildren(fetched);
              onToggle(href, true);
            });
          return;
        }
        if (onDirectoryNavigate) onDirectoryNavigate(href);
        else navigate(href);
        return;
      }
      onToggle(href, !isExpanded);
    },
    [
      entry.children,
      fetchedChildren,
      basePath,
      href,
      toApiPath,
      onToggle,
      isExpanded,
      onDirectoryNavigate,
      navigate,
    ],
  );

  return (
    <div className={classnames('sidebar-dir', {expanded: isExpanded})}>
      <div
        className="sidebar-dir-header"
        style={{paddingLeft: pad}}
        onClick={onHeaderClick}
      >
        <span className="sidebar-arrow">{isExpanded ? '▾' : '▸'}</span>
        <AccessBadge level={accessLevel} />
        <FileIcon name={entry.name} isDirectory encrypted={entry.encrypted} />
        <span>{name}</span>
      </div>
      {children.length > 0 && (
        <div className={classnames('sidebar-dir-children', {hidden: !isExpanded})}>
          <SidebarTree
            entries={children}
            basePath={href}
            expandPath={expandPath}
            expanded={expanded}
            onToggle={onToggle}
            toApiPath={toApiPath}
            onFileClick={onFileClick}
            onDirectoryNavigate={onDirectoryNavigate}
            depth={depth}
            parentContext={parentContext}
          />
        </div>
      )}
    </div>
  );
};

const FileNode: React.FC<NodeProps> = ({
  entry,
  href,
  name,
  pad,
  isOnPath,
  expandPath,
  expanded,
  onToggle,
  onFileClick,
  onDirectoryNavigate,
  toApiPath,
  depth,
  parentContext,
}) => {
  const isActive = isOnPath && expandPath.length === 0;
  const accessLevel = (entry.access || 'public') as AccessLevel;
  const fileChildren = entry.children || [];

  useEffect(() => {
    if (isOnPath && fileChildren.length > 0 && !expanded.has(href)) {
      onToggle(href, true);
    }
  }, []);

  if (fileChildren.length === 0) {
    return (
      <div
        className={classnames('file-view-sidebar-entry', {active: isActive})}
        style={{paddingLeft: pad}}
        onClick={(e) => {
          e.preventDefault();
          onFileClick(href);
        }}
      >
        <span className="sidebar-arrow-spacer" />
        <AccessBadge level={accessLevel} />
        <FileIcon name={entry.name} isDirectory={false} encrypted={entry.encrypted} />
        <span>{name}</span>
      </div>
    );
  }

  const isExpanded = expanded.has(href);

  return (
    <div className={classnames('sidebar-dir', {expanded: isExpanded})}>
      <div
        className={classnames('file-view-sidebar-entry', {active: isActive})}
        style={{paddingLeft: pad}}
        onClick={(e) => {
          e.preventDefault();
          onFileClick(href);
        }}
      >
        <span
          className="sidebar-arrow"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(href, !isExpanded);
          }}
        >
          {isExpanded ? '▾' : '▸'}
        </span>
        <AccessBadge level={accessLevel} />
        <FileIcon name={entry.name} isDirectory={false} encrypted={entry.encrypted} />
        <span>{name}</span>
      </div>
      <div className={classnames('sidebar-dir-children', {hidden: !isExpanded})}>
        <SidebarTree
          entries={fileChildren}
          basePath={href}
          expandPath={expandPath}
          expanded={expanded}
          onToggle={onToggle}
          toApiPath={toApiPath}
          onFileClick={onFileClick}
          onDirectoryNavigate={onDirectoryNavigate}
          depth={depth}
          parentContext={parentContext}
        />
      </div>
    </div>
  );
};

export default Sidebar;
