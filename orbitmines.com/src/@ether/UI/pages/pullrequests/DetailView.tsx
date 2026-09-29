import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import type {PRParams} from '../../router/types';
import {getAPI} from '../../data';
import type {PullRequest} from '../../data';
import {ArrowLeftIcon, BranchIcon, MergeIcon} from '../../icons';
import Header from './Header';
import {buildPullsUrl} from './urls';
import {timeAgo} from './timeAgo';
import {MarkdownView} from '../../util';

const DetailView: React.FC<{params: PRParams}> = ({params}) => {
  const navigate = useNavigate();
  const [pr, setPr] = useState<PullRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (params.prId === null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAPI()
      .getPullRequest(params.repoPath, params.prId)
      .then((p) => {
        if (cancelled) return;
        setPr(p);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.repoPath, params.prId]);

  if (loading) {
    return (
      <div className="pr-page">
        <Header params={params} />
        <div className="pr-empty">Loading…</div>
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="pr-page">
        <Header params={params} />
        <a
          className="pr-back-link"
          href={buildPullsUrl(params)}
          onClick={(e) => {
            e.preventDefault();
            navigate(buildPullsUrl(params));
          }}
        >
          <ArrowLeftIcon /> Back to pull requests
        </a>
        <div className="pr-empty">Pull request not found.</div>
      </div>
    );
  }

  const StatusIcon = pr.status === 'merged' ? MergeIcon : BranchIcon;

  return (
    <div className="pr-page pr-detail">
      <div className="pr-detail__sticky">
        <Header params={params} />
        <div className="pr-detail__title">
          <StatusIcon />
          <span>{pr.title}</span>
          <span className={`pr-status-badge ${pr.status}`}>{pr.status}</span>
        </div>
        <div className="pr-detail__meta">
          #{pr.id} by @{pr.author} · {timeAgo(pr.createdAt)} · {pr.sourceLabel} → {pr.targetLabel}
        </div>
      </div>

      <div className="pr-detail__body">
        <a
          className="pr-back-link"
          href={buildPullsUrl(params)}
          onClick={(e) => {
            e.preventDefault();
            navigate(buildPullsUrl(params));
          }}
        >
          <ArrowLeftIcon /> Back to pull requests
        </a>

        <div className="pr-detail__section">
          <div className="pr-detail__section-title">Description</div>
          <div className="pr-detail__section-body">
            {pr.description ? <MarkdownView source={pr.description} /> : <em>No description.</em>}
          </div>
        </div>

        <div className="pr-detail__section">
          <div className="pr-detail__section-title">Commits ({pr.commits.length})</div>
          <div className="pr-detail__section-body">
            {pr.commits.length === 0 ? (
              <em>No commits yet.</em>
            ) : (
              pr.commits.map((c) => (
                <div key={c.id} style={{marginBottom: 6}}>
                  <code style={{color: 'rgba(255,255,255,0.55)'}}>{c.id.slice(0, 7)}</code>{' '}
                  {c.message}{' '}
                  <span style={{color: 'rgba(255,255,255,0.4)'}}>
                    · @{c.author} · {timeAgo(c.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pr-detail__section">
          <div className="pr-detail__section-title">Activity ({pr.activity.length})</div>
          <div className="pr-detail__section-body">
            {pr.activity.length === 0 ? (
              <em>No activity yet — comment thread will land with the Chat port.</em>
            ) : (
              pr.activity.map((a, i) => (
                <div key={i} style={{marginBottom: 4, color: 'rgba(255,255,255,0.6)'}}>
                  · {a.type} {('author' in a ? `by @${a.author}` : '')} ·{' '}
                  {timeAgo(a.createdAt)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
