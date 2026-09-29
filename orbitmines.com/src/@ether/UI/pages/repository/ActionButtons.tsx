import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getAPI} from '../../data';
import {
  CloneIcon,
  DownloadIcon,
  FollowIcon,
  FollowingIcon,
  PullRequestIcon,
  SettingsIcon,
  StarFilledIcon,
  StarOutlineIcon,
  ChatIcon,
} from './icons';
import ClonePopup from './ClonePopup';
import {
  getCurrentPlayer,
  getFollowerCount,
  getStarCount,
  isFollowing,
  isStarred,
  setFollowerCount,
  setStarCount,
  toggleFollow,
  toggleStar,
} from './storage';

interface PrimaryButtonProps {
  canonicalPath: string;
  starPath: string;
  followUser?: string;
}

// Star or follow button — mutually exclusive (follow takes precedence when present).
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({starPath, followUser}) => {
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  if (followUser) {
    const followed = isFollowing(followUser);
    const count = getFollowerCount(followUser);
    return (
      <button
        type="button"
        className={`action-btn follow-btn${followed ? ' following' : ''}`}
        onClick={() => {
          const nowFollowing = toggleFollow(followUser);
          setFollowerCount(followUser, count + (nowFollowing ? 1 : -1));
          refresh();
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
        const nowStarred = toggleStar(starPath);
        setStarCount(starPath, count + (nowStarred ? 1 : -1));
        refresh();
      }}
    >
      <span className="action-count">{Math.max(0, count)}</span>
      <span className="action-icon">{starred ? <StarFilledIcon /> : <StarOutlineIcon />}</span>
      <span className="action-label">{starred ? 'Starred' : 'Star'}</span>
    </button>
  );
};

interface CloneButtonProps {
  canonicalPath: string;
}

export const CloneButton: React.FC<CloneButtonProps> = ({canonicalPath}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={`popup-backdrop${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <button
        type="button"
        className="action-btn clone-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span className="action-icon action-icon-default">
          <CloneIcon />
        </span>
        <span className="action-icon action-icon-small">
          <DownloadIcon />
        </span>
        <span className="action-label">Download</span>
      </button>
      <ClonePopup canonicalPath={canonicalPath} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

interface ActionRowProps {
  canonicalPath: string;
  starPath: string;
  followUser?: string;
  /** Builder for the /-/pulls URL (called with the current canonical path). */
  pullsUrl: string;
  /** Builder for the .ether/Usage.ray URL. */
  settingsUrl: string;
  chatUrl: string;
}

// Renders both the mobile nav-row (with icon buttons) and the breadcrumb
// row's action buttons (visible inline on desktop).
const ActionRow: React.FC<ActionRowProps> = ({
  canonicalPath,
  starPath,
  followUser,
  pullsUrl,
  settingsUrl,
  chatUrl,
}) => {
  const navigate = useNavigate();
  const [prCount, setPrCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getAPI()
      .getOpenPRCount(canonicalPath)
      .then(async (count) => {
        if (cancelled) return;
        if (count > 0) {
          setPrCount(count);
          return;
        }
        // clonePath strips the @user/ prefix for root users; retry with it
        if (!canonicalPath.startsWith('@')) {
          const player = getCurrentPlayer();
          const retry = await getAPI().getOpenPRCount(`@${player}/${canonicalPath}`);
          if (!cancelled) setPrCount(retry);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [canonicalPath]);

  return (
    <>
      <div className="repo-nav-row">
        <span className="nav-actions">
          <span style={{marginLeft: 'auto'}} />
          <PrimaryButton canonicalPath={canonicalPath} starPath={starPath} followUser={followUser} />
          <CloneButton canonicalPath={canonicalPath} />
        </span>
        <button
          type="button"
          className="action-btn icon-btn"
          title="Chat"
          onClick={() => navigate(chatUrl)}
        >
          <span className="action-icon">
            <ChatIcon />
          </span>
        </button>
        <button
          type="button"
          className="action-btn icon-btn"
          title="Pull requests"
          onClick={() => navigate(pullsUrl)}
        >
          <span className="action-count">{prCount}</span>
          <span className="action-icon">
            <PullRequestIcon />
          </span>
        </button>
        <button
          type="button"
          className="action-btn icon-btn"
          title="Settings"
          onClick={() => navigate(settingsUrl)}
        >
          <span className="action-icon">
            <SettingsIcon />
          </span>
        </button>
      </div>
    </>
  );
};

export default ActionRow;
