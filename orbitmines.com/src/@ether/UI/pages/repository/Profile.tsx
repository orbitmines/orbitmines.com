import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Markdown from '../../util/MarkdownView';
import {getAPI} from '../../data';
import type {Repository as RepoData} from '../../data';
import {EditIcon} from './icons';
import {DEFAULT_AVATAR_SVG_HTML} from './icons';
import type {HeaderChainItem} from './Header';
import Breadcrumb from './Breadcrumb';
import {buildBasePath, buildCanonicalPath} from './paths';
import {findReadmes} from './FileListing';
import {getCurrentPlayer, loadProfile, saveProfile} from './storage';
import ProfileNames from './ProfileNames';
import {getUserContent, getProfileDefaults, externalToSocials, ProfileMeta} from './userDefaults';

interface ProfileProps {
  effectiveUser: string;
  repository: RepoData;
  headerChain: HeaderChainItem[];
  base: string;
  versions: [number, string][];
  path: string[];
  clonePath: string;
  rootStarPath: string;
  pullsUrl: string;
  settingsUrl: string;
  chatUrl: string;
}

const Profile: React.FC<ProfileProps> = ({
  effectiveUser,
  repository,
  headerChain,
  base,
  versions,
  path,
  clonePath,
  rootStarPath,
  pullsUrl,
  settingsUrl,
  chatUrl,
}) => {
  const currentPlayer = getCurrentPlayer();
  const isOwner = effectiveUser === currentPlayer;
  const defaults = useMemo(() => getProfileDefaults(effectiveUser), [effectiveUser]);
  const defaultSocials = useMemo(
    () => (defaults ? externalToSocials(defaults.external) : undefined),
    [defaults],
  );
  const userContent = useMemo(() => getUserContent(effectiveUser), [effectiveUser]);
  const [profile, setProfile] = useState(() => loadProfile(effectiveUser));

  // Refresh local state if we switched to a different user
  useEffect(() => {
    setProfile(loadProfile(effectiveUser));
  }, [effectiveUser]);

  const displayName = profile.displayName || defaults?.name || effectiveUser;
  const displayVersion = versions.length > 0 ? versions[versions.length - 1][1] : 'latest';

  // ---- Avatar URL ----
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaults?.picture ?? null);
  useEffect(() => {
    let cancelled = false;
    setAvatarUrl(defaults?.picture ?? null);
    void (async () => {
      const repo = await getAPI().getRepository(effectiveUser);
      if (!repo || cancelled) return;
      const names = ['2d-square.svg', '2d-square.png', '2d-square.jpeg'];
      for (const name of names) {
        const flat = repo.tree.flatMap((e) =>
          'children' in e ? (e as {children?: unknown[]}).children || [] : [e],
        );
        // best-effort check; ignore type complaints from the flat any[]
        const hit = (flat as {name?: string}[]).some((entry) => entry.name === name);
        if (hit) {
          setAvatarUrl(`/**/@${effectiveUser}/avatar/${name}`);
          return;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveUser, defaults]);

  // ---- README ----
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const readmes = findReadmes(repository.tree);
    void (async () => {
      for (const readme of readmes) {
        if (!readme.content) {
          const fetched = await getAPI().readFile(`@${effectiveUser}/${readme.name}`);
          if (fetched !== null) readme.content = fetched;
        }
      }
      const withContent = readmes.filter((r) => r.content);
      if (cancelled) return;
      if (withContent.length > 0) {
        const content = withContent[0].content!;
        const resolved = content.replace(/href="(?!\/|https?:|#)([^"]+)"/g, (_m, rel) => {
          const segs = (rel as string).split('/').filter(Boolean);
          return `href="${buildBasePath(base, versions, [...path, ...segs])}"`;
        });
        setReadmeContent(resolved);
      } else {
        setReadmeContent('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repository, effectiveUser, base, versions, path]);

  return (
    <div className="repo-page">
      {defaults ? <ProfileMeta profile={defaults} user={effectiveUser} /> : null}
      <div className="profile-layout">
        <div className="profile-readme">
          {userContent ? (
            <div className="profile-user-content">{userContent}</div>
          ) : readmeContent ? (
            <div className="readme-section">
              <div className="readme-header">README.md</div>
              <Markdown className="readme-body" source={readmeContent} />
            </div>
          ) : null}
        </div>
        <div className="profile-card">
          <Avatar effectiveUser={effectiveUser} avatarUrl={avatarUrl} isOwner={isOwner} />
          <DisplayName
            displayName={displayName}
            isOwner={isOwner}
            user={effectiveUser}
            onChange={(name) =>
              setProfile((p) => {
                const next = {...p, displayName: name};
                saveProfile(effectiveUser, next);
                return next;
              })
            }
          />
          <Username effectiveUser={effectiveUser} isOwner={isOwner} displayVersion={displayVersion} />
          <Breadcrumb
            displayVersion={displayVersion}
            items={[]}
            canonicalPath={clonePath}
            starPath={rootStarPath}
            followUser={effectiveUser}
            pullsUrl={pullsUrl}
            settingsUrl={settingsUrl}
            chatUrl={chatUrl}
          />
          <ProfileNames user={effectiveUser} isOwner={isOwner} defaults={defaultSocials} />
        </div>
      </div>
    </div>
  );
};

interface AvatarProps {
  effectiveUser: string;
  avatarUrl: string | null;
  isOwner: boolean;
}

const Avatar: React.FC<AvatarProps> = ({effectiveUser, avatarUrl, isOwner}) => (
  <div className="profile-avatar-wrap">
    <div className={`profile-avatar${isOwner ? ' editable' : ''}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={`@${effectiveUser}`} />
      ) : (
        <span dangerouslySetInnerHTML={{__html: DEFAULT_AVATAR_SVG_HTML}} />
      )}
      {isOwner && (
        <div className="profile-avatar-overlay">
          <EditIcon />
        </div>
      )}
    </div>
  </div>
);

interface DisplayNameProps {
  displayName: string;
  isOwner: boolean;
  user: string;
  onChange: (name: string) => void;
}

const DisplayName: React.FC<DisplayNameProps> = ({displayName, isOwner, onChange}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayName);
  useEffect(() => setValue(displayName), [displayName]);

  if (editing && isOwner) {
    return (
      <div className="profile-name-row">
        <input
          autoFocus
          className="profile-display-name-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setEditing(false);
            const next = value.trim();
            if (next !== displayName) onChange(next);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              setEditing(false);
              const next = value.trim();
              if (next !== displayName) onChange(next);
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              setValue(displayName);
              setEditing(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="profile-name-row">
      <h1
        className="profile-display-name"
        style={isOwner ? {cursor: 'text'} : undefined}
        onClick={() => isOwner && setEditing(true)}
      >
        {displayName}
      </h1>
      {isOwner && (
        <button
          type="button"
          className="profile-hover-edit"
          title="Edit name"
          onClick={() => setEditing(true)}
        >
          <EditIcon />
        </button>
      )}
    </div>
  );
};

interface UsernameProps {
  effectiveUser: string;
  isOwner: boolean;
  displayVersion: string;
}

const Username: React.FC<UsernameProps> = ({effectiveUser, isOwner, displayVersion}) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(`@${effectiveUser}`);
  useEffect(() => setValue(`@${effectiveUser}`), [effectiveUser]);

  const commit = useCallback(() => {
    setEditing(false);
    const next = value.replace(/^@/, '').trim();
    if (next && next !== effectiveUser) {
      localStorage.setItem('ether:name', next);
      const profile = loadProfile(effectiveUser);
      saveProfile(next, profile);
      navigate(`/@${next}`);
    } else {
      setValue(`@${effectiveUser}`);
    }
  }, [value, effectiveUser, navigate]);

  if (editing && isOwner) {
    return (
      <div className="profile-username-row">
        <input
          autoFocus
          className="profile-username-input"
          value={value}
          onChange={(e) => {
            let v = e.target.value;
            if (!v.startsWith('@') && v.length > 0) v = '@' + v;
            setValue(v);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              setValue(`@${effectiveUser}`);
              setEditing(false);
            }
            if (e.key === 'Backspace' && value === '@') e.preventDefault();
          }}
        />
        <span className="version-badge">{displayVersion}</span>
      </div>
    );
  }

  return (
    <div className="profile-username-row">
      <span
        className={`profile-username${isOwner ? ' editable' : ''}`}
        onClick={() => isOwner && setEditing(true)}
      >
        @{effectiveUser}
      </span>
      {isOwner && (
        <button
          type="button"
          className="profile-hover-edit"
          title="Edit username"
          onClick={() => setEditing(true)}
        >
          <EditIcon />
        </button>
      )}
      <span className="version-badge">{displayVersion}</span>
    </div>
  );
};

export default Profile;
