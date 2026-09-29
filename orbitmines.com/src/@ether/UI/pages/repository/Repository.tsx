import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import classnames from 'classnames';
import type {RepoParams} from '../../router/types';
import type {FileEntry, Repository as RepoData, TreeEntry} from '../../data';
import {getAPI} from '../../data';
import Markdown from '../../util/MarkdownView';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import FileListing, {findReadmes, FileRow} from './FileListing';
import FileViewer from './FileViewer';
import Sidebar from './Sidebar';
import Profile from './Profile';
import IframeMount from './IframeMount';
import {IDELayout, generateId} from '../../layout';
import type {LayoutNode, PanelDefinition} from '../../layout';
import {buildBasePath, buildCanonicalPath} from './paths';
import {
  buildBreadcrumbItems,
  buildRootStarPath,
  fetchFileContent,
  findIndexRay,
  hrefToFileTreePath,
  loadRepoEntries,
  processPath,
} from './repoResolve';
import {CloneButton} from './ActionButtons';
import {isFollowing, isStarred, getFollowerCount, getStarCount} from './storage';
import {
  CloneIcon,
  DownloadIcon,
  FollowIcon,
  FollowingIcon,
  StarFilledIcon,
  StarOutlineIcon,
} from './icons';
import './Repository.scss';

const Repository: React.FC<{params: RepoParams}> = ({params}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, path, versions, base, hash} = params;

  const resolved = useMemo(() => processPath(user, path, base), [user, path, base]);

  // Resolve synchronously during render so the first paint already has the
  // repository content (the backend is in-memory). loadRepoEntries returns
  // null for a 404, or a { redirect } for an inline file path; the redirect
  // is performed in an effect since navigation can't happen during render.
  const result = useMemo(
    () => loadRepoEntries({user, path, base, versions, hash, ...resolved}),
    [resolved, user, path, base, versions, hash],
  );

  useEffect(() => {
    if (result?.redirect) navigate(result.redirect);
  }, [result, navigate]);

  if (result === null) {
    const target = resolved.effectiveWorld
      ? `#${resolved.effectiveWorld} in @${resolved.effectiveUser}`
      : `@${resolved.effectiveUser}`;
    return (
      <div className="repo-page">
        <div className="repo-404">
          <div className="code">404</div>
          {target} not found
        </div>
      </div>
    );
  }

  if (result.redirect) return <div className="repo-page" />;

  return (
    <RepositoryView
      params={params}
      resolved={resolved}
      repository={result.repository}
      entries={result.entries}
    />
  );
};

interface ViewProps {
  params: RepoParams;
  resolved: ReturnType<typeof processPath>;
  repository: RepoData;
  entries: TreeEntry[];
}

const RepositoryView: React.FC<ViewProps> = ({params, resolved, repository, entries}) => {
  const {user, path, versions, base, hash} = params;
  const {
    effectiveUser,
    effectiveWorld,
    effectiveWorldParent,
    treePath,
    treePathStart,
    showUsersListing,
    showWorldsListing,
    hasWildcard,
    headerChain,
  } = resolved;

  // ---- Canonical paths / URL builders ----
  const clonePath = useMemo(() => {
    let p = buildCanonicalPath(effectiveUser, effectiveWorld, treePath);
    if (!base) {
      const prefix = `@${user}/`;
      if (p.startsWith(prefix)) p = p.slice(prefix.length);
    }
    return p;
  }, [effectiveUser, effectiveWorld, treePath, base, user]);

  const rootStarPath = useMemo(
    () => buildRootStarPath(repository, effectiveUser, effectiveWorld, treePath, user, base),
    [repository, effectiveUser, effectiveWorld, treePath, user, base],
  );

  const basePath = useMemo(() => buildBasePath(base, versions, path), [base, versions, path]);
  const displayVersion = versions.length > 0 ? versions[versions.length - 1][1] : 'latest';

  const pullsUrl = useMemo(() => {
    const clean = path.filter((s) => s !== '*' && s !== '**');
    const pathPart = clean.length > 0 ? '/' + clean.join('/') : '';
    return `${base || ''}${pathPart}/-/pulls`;
  }, [base, path]);

  const settingsUrl = useMemo(() => {
    const clean = path.filter((s) => s !== '*' && s !== '**');
    const pathPart = clean.length > 0 ? '/' + clean.join('/') : '';
    return `${base || ''}${pathPart}/.ether/Usage.ray`;
  }, [base, path]);

  const chatUrl = useMemo(() => {
    const b = base || `/@${user}`;
    return `${b}/chat`;
  }, [base, user]);

  // ---- Hash file view mode ----
  if (hash) {
    return (
      <FileViewMode
        params={params}
        resolved={resolved}
        repository={repository}
        entries={entries}
        basePath={basePath}
        clonePath={clonePath}
        rootStarPath={rootStarPath}
        pullsUrl={pullsUrl}
        settingsUrl={settingsUrl}
        chatUrl={chatUrl}
        displayVersion={displayVersion}
      />
    );
  }

  // ---- Iframe mode (index.ray.js) ----
  const indexRay =
    !showUsersListing && !showWorldsListing && !hasWildcard ? findIndexRay(entries) : null;
  if (indexRay && indexRay.content) {
    const canonicalPath = buildCanonicalPath(effectiveUser, effectiveWorld, treePath);
    const headerLabel = headerChain.map((item) => item.label).join(' / ');
    const isPlayerIframe = !effectiveWorld && treePath.length === 0;

    return (
      <div
        className="repo-page"
        style={{position: 'relative', padding: 0, maxWidth: 'none', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}
      >
        <div className="iframe-overlay">
          <span className="overlay-label">{headerLabel}</span>
          <span className="overlay-desc">{repository.description}</span>
          <IframePrimaryButton
            isPlayer={isPlayerIframe}
            followUser={isPlayerIframe ? effectiveUser : undefined}
            starPath={canonicalPath}
          />
          <CloneButton canonicalPath={canonicalPath} />
        </div>
        <IframeMount jsContent={indexRay.content!} canonicalPath={canonicalPath} />
      </div>
    );
  }

  // ---- Profile mode (user root, no index.ray.js) ----
  if (
    treePath.length === 0 &&
    !hasWildcard &&
    !showUsersListing &&
    !showWorldsListing &&
    !effectiveWorld
  ) {
    let profileClonePath = buildCanonicalPath(effectiveUser, null, []);
    if (!base) {
      const prefix = `@${user}/`;
      if (profileClonePath.startsWith(prefix)) profileClonePath = profileClonePath.slice(prefix.length);
    }
    return (
      <Profile
        effectiveUser={effectiveUser}
        repository={repository}
        headerChain={headerChain}
        base={base}
        versions={versions}
        path={path}
        clonePath={profileClonePath}
        rootStarPath={rootStarPath}
        pullsUrl={pullsUrl}
        settingsUrl={settingsUrl}
        chatUrl={chatUrl}
      />
    );
  }

  // ---- Default directory listing ----
  const {rootLink, items: breadcrumbItems} = buildBreadcrumbItems(
    treePath,
    headerChain,
    base,
    versions,
    path,
    treePathStart,
    repository.tree,
  );

  const followUser =
    !effectiveWorld && treePath.length === 0 ? effectiveUser : undefined;

  return (
    <div className="repo-page">
      <Header chain={headerChain} base={base} versions={versions} path={path} />
      <div className="repo-description">{repository.description}</div>
      <Breadcrumb
        displayVersion={displayVersion}
        items={breadcrumbItems}
        canonicalPath={clonePath}
        starPath={rootStarPath}
        rootLink={rootLink}
        followUser={followUser}
        pullsUrl={pullsUrl}
        settingsUrl={settingsUrl}
        chatUrl={chatUrl}
      />
      {showUsersListing ? (
        <FileTableWithContext entries={entries as FileEntry[]} base={base} versions={versions} path={path} parentContext="@" />
      ) : showWorldsListing ? (
        <FileTableWithContext entries={entries as FileEntry[]} base={base} versions={versions} path={path} parentContext="~" />
      ) : (
        <FileListing entries={entries} basePath={basePath} />
      )}
      <ReadmeSection
        entries={entries}
        effectiveUser={effectiveUser}
        effectiveWorld={effectiveWorld}
        effectiveWorldParent={effectiveWorldParent}
        treePath={treePath}
        base={base}
        versions={versions}
        path={path}
      />
    </div>
  );
};

interface FileTableWithContextProps {
  entries: FileEntry[];
  base: string;
  versions: [number, string][];
  path: string[];
  parentContext: '@' | '~';
}

const FileTableWithContext: React.FC<FileTableWithContextProps> = ({
  entries,
  base,
  versions,
  path,
  parentContext,
}) => {
  const subBase =
    buildBasePath(base, versions, path.slice(0, -1)) + '/' + parentContext;
  return (
    <div className="file-table">
      {entries.map((entry, i) => (
        <FileRow
          key={i}
          entry={entry}
          basePath={subBase}
          parentContext={parentContext}
        />
      ))}
    </div>
  );
};

interface ReadmeSectionProps {
  entries: TreeEntry[];
  effectiveUser: string;
  effectiveWorld: string | null;
  effectiveWorldParent: string;
  treePath: string[];
  base: string;
  versions: [number, string][];
  path: string[];
}

const ReadmeSection: React.FC<ReadmeSectionProps> = ({
  entries,
  effectiveUser,
  effectiveWorld,
  effectiveWorldParent,
  treePath,
  base,
  versions,
  path,
}) => {
  const [readmes, setReadmes] = useState<FileEntry[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const found = findReadmes(entries);
    void (async () => {
      for (const r of found) {
        if (!r.content) {
          const apiPath = effectiveWorld
            ? `@${effectiveWorldParent}/~${effectiveWorld}/${
                treePath.length > 0 ? treePath.join('/') + '/' : ''
              }${r.name}`
            : `@${effectiveUser}/${
                treePath.length > 0 ? treePath.join('/') + '/' : ''
              }${r.name}`;
          const fetched = await getAPI().readFile(apiPath);
          if (fetched !== null) r.content = fetched;
        }
      }
      if (cancelled) return;
      setReadmes(found.filter((r) => r.content));
      setActive(0);
    })();
    return () => {
      cancelled = true;
    };
  }, [entries, effectiveUser, effectiveWorld, effectiveWorldParent, treePath]);

  if (readmes.length === 0) return null;
  const allSameName = readmes.every((r) => r.name === readmes[0].name);

  const resolve = (content: string) =>
    content.replace(/href="(?!\/|https?:|#)([^"]+)"/g, (_m, rel) => {
      const segs = (rel as string).split('/').filter(Boolean);
      return `href="${buildBasePath(base, versions, [...path, ...segs])}"`;
    });

  if (readmes.length === 1) {
    return (
      <div className="readme-section">
        <div className="readme-header">README.md</div>
        <Markdown className="readme-body" source={resolve(readmes[0].content!)} />
      </div>
    );
  }

  return (
    <div className="readme-section">
      <div className="readme-tabs">
        {readmes.map((r, i) => (
          <button
            type="button"
            key={i}
            className={classnames('readme-tab', {active: i === active})}
            onClick={() => setActive(i)}
          >
            {allSameName ? `${r.name} (${i + 1})` : r.name}
          </button>
        ))}
      </div>
      {readmes.map((r, i) => (
        <Markdown
          key={i}
          className={classnames('readme-body', {hidden: i !== active})}
          source={resolve(r.content!)}
        />
      ))}
    </div>
  );
};

interface IframePrimaryProps {
  isPlayer: boolean;
  followUser?: string;
  starPath: string;
}

const IframePrimaryButton: React.FC<IframePrimaryProps> = ({isPlayer, followUser, starPath}) => {
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  if (isPlayer && followUser) {
    const followed = isFollowing(followUser);
    const count = getFollowerCount(followUser);
    return (
      <button
        type="button"
        className={`action-btn follow-btn${followed ? ' following' : ''}`}
        onClick={() => {
          import('./storage').then((m) => {
            const now = m.toggleFollow(followUser);
            m.setFollowerCount(followUser, count + (now ? 1 : -1));
            refresh();
          });
        }}
      >
        <span className="action-count">{Math.max(0, count)}</span>
        <span className="action-icon">{followed ? <FollowingIcon /> : <FollowIcon />}</span>
        <span className="action-label">{followed ? 'Following' : 'Follow'}</span>
      </button>
    );
  }
  const starred = isStarred(starPath);
  const count = getStarCount(starPath);
  return (
    <button
      type="button"
      className={`action-btn star-btn${starred ? ' starred' : ''}`}
      onClick={() => {
        import('./storage').then((m) => {
          const now = m.toggleStar(starPath);
          m.setStarCount(starPath, count + (now ? 1 : -1));
          refresh();
        });
      }}
    >
      <span className="action-count">{Math.max(0, count)}</span>
      <span className="action-icon">{starred ? <StarFilledIcon /> : <StarOutlineIcon />}</span>
      <span className="action-label">{starred ? 'Starred' : 'Star'}</span>
    </button>
  );
};

// ---- File view mode (hash) — sidebar + file viewer in IDELayout ----

interface FileViewModeProps {
  params: RepoParams;
  resolved: ReturnType<typeof processPath>;
  repository: RepoData;
  entries: TreeEntry[];
  basePath: string;
  clonePath: string;
  rootStarPath: string;
  pullsUrl: string;
  settingsUrl: string;
  chatUrl: string;
  displayVersion: string;
}

const FileViewMode: React.FC<FileViewModeProps> = ({
  params,
  resolved,
  repository,
  entries,
  basePath,
  clonePath,
  rootStarPath,
  pullsUrl,
  settingsUrl,
  chatUrl,
  displayVersion,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {base, versions, path, hash, user} = params;
  const {
    effectiveUser,
    effectiveWorld,
    effectiveWorldParent,
    treePath,
    treePathStart,
    headerChain,
  } = resolved;
  const hashPath = useMemo(() => (hash || '').split('/').filter(Boolean), [hash]);

  // The initially-opened file's content
  const [initialFiles, setInitialFiles] = useState<FileEntry[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const files = await fetchFileContent(
        entries,
        hashPath,
        effectiveWorld,
        effectiveWorldParent,
        effectiveUser,
        treePath,
      );
      if (!cancelled) setInitialFiles(files);
    })();
    return () => {
      cancelled = true;
    };
  }, [entries, hashPath, effectiveWorld, effectiveWorldParent, effectiveUser, treePath]);

  const {rootLink, items: breadcrumbItems} = buildBreadcrumbItems(
    treePath,
    headerChain,
    base,
    versions,
    path,
    treePathStart,
    repository.tree,
  );

  const initialFilePanelId = 'file:' + (hash || '');
  const fileName = hashPath[hashPath.length - 1] || '';

  // Sidebar / lazy file-fetching helpers
  const toApiPath = (relPath: string): string => {
    return effectiveWorld
      ? `@${effectiveWorldParent}/~${effectiveWorld}/${
          treePath.length > 0 ? treePath.join('/') + '/' : ''
        }${relPath}`
      : `@${effectiveUser}/${treePath.length > 0 ? treePath.join('/') + '/' : ''}${relPath}`;
  };

  // Map from panelId -> panel content (for opened file tabs).
  // Each opened file gets its own panel so users can split panes etc.
  const [openedPanels, setOpenedPanels] = useState<PanelDefinition[]>([]);

  const openFileHref = async (href: string) => {
    const segs = hrefToFileTreePath(href, basePath);
    if (!segs || segs.length === 0) {
      navigate(href);
      return;
    }
    const files = await fetchFileContent(
      entries,
      segs,
      effectiveWorld,
      effectiveWorldParent,
      effectiveUser,
      treePath,
    );
    if (files.length === 0) {
      navigate(href);
      return;
    }
    const relHash = segs.map(encodeURIComponent).join('/');
    const panelId = 'file:' + relHash;
    const name = segs[segs.length - 1];
    window.history.replaceState(null, '', location.pathname + '#' + relHash);
    setOpenedPanels((prev) => {
      if (prev.some((p) => p.id === panelId)) return prev;
      return [
        ...prev,
        {
          id: panelId,
          title: name,
          closable: true,
          content: <FileViewer files={files} />,
        },
      ];
    });
  };

  const sidebarPanel: PanelDefinition = useMemo(
    () => ({
      id: 'sidebar',
      title: treePath[0] || (effectiveWorld ? '#' + effectiveWorld : '@' + effectiveUser),
      closable: false,
      sticky: true,
      content: (
        <Sidebar
          entries={entries}
          basePath={basePath}
          expandPath={hashPath}
          toApiPath={toApiPath}
          onFileClick={openFileHref}
          onDirectoryNavigate={(href) => navigate(href)}
        />
      ),
    }),
    // openFileHref captured below; we want stable identity for sidebar
    // panel so we recompute when entries/basePath change.
    [entries, basePath, hashPath.join('/'), effectiveWorld, effectiveUser, treePath.join('/')],
  );

  const filePanel: PanelDefinition | null = useMemo(() => {
    if (!initialFiles) return null;
    return {
      id: initialFilePanelId,
      title: fileName || '404',
      closable: true,
      content:
        initialFiles.length > 0 ? (
          <FileViewer files={initialFiles} />
        ) : (
          <div className="file-view-content">
            <div className="file-view-header">
              <span>{fileName}</span>
            </div>
            <div className="file-no-content">
              <div style={{textAlign: 'center'}}>
                <div className="code" style={{fontSize: 48, color: 'rgba(255,255,255,0.12)', marginBottom: 12}}>
                  404
                </div>
                <div>Path not found</div>
              </div>
            </div>
          </div>
        ),
    };
  }, [initialFiles, initialFilePanelId, fileName]);

  const panels = useMemo(() => {
    const out: PanelDefinition[] = [sidebarPanel];
    if (filePanel) out.push(filePanel);
    for (const p of openedPanels) {
      if (p.id !== initialFilePanelId) out.push(p);
    }
    return out;
  }, [sidebarPanel, filePanel, openedPanels, initialFilePanelId]);

  const initialLayout = useMemo<LayoutNode>(() => {
    const sidebarGroupId = generateId();
    const fileGroupId = generateId();
    return {
      type: 'split',
      id: generateId(),
      direction: 'horizontal',
      children: [
        {type: 'tabgroup', id: sidebarGroupId, panels: ['sidebar'], activeIndex: 0},
        {
          type: 'tabgroup',
          id: fileGroupId,
          panels: [initialFilePanelId],
          activeIndex: 0,
        },
      ],
      sizes: [0.2, 0.8],
    };
  }, [initialFilePanelId]);

  if (!filePanel) return <div className="repo-page file-view-mode" />;

  return (
    <div className="repo-page file-view-mode">
      <div className="file-view-top">
        <Header chain={headerChain} base={base} versions={versions} path={path} />
        <div className="repo-description">{repository.description}</div>
        <Breadcrumb
          displayVersion={displayVersion}
          items={breadcrumbItems}
          canonicalPath={clonePath}
          starPath={rootStarPath}
          rootLink={rootLink}
          followUser={!effectiveWorld && treePath.length === 0 ? effectiveUser : undefined}
          pullsUrl={pullsUrl}
          settingsUrl={settingsUrl}
          chatUrl={chatUrl}
        />
      </div>
      <div className="ide-layout-mount">
        <IDELayout
          panels={panels}
          initialLayout={initialLayout}
          onActiveTabChange={(panelId) => {
            if (panelId.startsWith('file:')) {
              const relHash = panelId.slice(5);
              const target = location.pathname + '#' + relHash;
              if (location.pathname + location.hash !== target) {
                window.history.replaceState(null, '', target);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Repository;
