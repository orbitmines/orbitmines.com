import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import type {PRParams} from '../../router/types';
import {getAPI} from '../../data';
import type {FileDiff, PullRequest, PRCommit} from '../../data';
import Header from './Header';
import {ArrowLeftIcon, FileDiffIcon} from '../../icons';
import {buildPullsUrl} from './urls';
import {DiffView} from '../../util';

// `/-/pulls/<id>/commits/<commitId>` — file-by-file diff for one commit.
const CommitDiffView: React.FC<{params: PRParams}> = ({params}) => {
  const navigate = useNavigate();
  const [pr, setPr] = useState<PullRequest | null>(null);
  const [view, setView] = useState<'unified' | 'side-by-side'>('unified');

  useEffect(() => {
    let cancelled = false;
    if (params.prId === null) return;
    getAPI()
      .getPullRequest(params.repoPath, params.prId)
      .then((p) => !cancelled && setPr(p));
    return () => {
      cancelled = true;
    };
  }, [params.repoPath, params.prId]);

  const commit: PRCommit | null = pr?.commits.find((c) => c.id === params.commitId) ?? null;

  return (
    <div className="pr-page">
      <Header params={params} />
      <a
        className="pr-back-link"
        href={buildPullsUrl(params, String(params.prId ?? ''))}
        onClick={(e) => {
          e.preventDefault();
          if (params.prId !== null) navigate(buildPullsUrl(params, String(params.prId)));
        }}
      >
        <ArrowLeftIcon /> Back to pull request
      </a>

      {!commit ? (
        <div className="pr-empty">Commit not found.</div>
      ) : (
        <>
          <h2 style={{fontSize: 16, margin: '8px 0 12px'}}>{commit.message}</h2>
          <div style={{fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 12}}>
            <code style={{color: 'rgba(255,255,255,0.6)'}}>{commit.id.slice(0, 7)}</code>{' '}
            · @{commit.author}
          </div>

          <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
            <button
              type="button"
              className={`pr-form-btn ${view === 'unified' ? 'pr-form-btn--primary' : ''}`}
              onClick={() => setView('unified')}
            >
              Unified
            </button>
            <button
              type="button"
              className={`pr-form-btn ${view === 'side-by-side' ? 'pr-form-btn--primary' : ''}`}
              onClick={() => setView('side-by-side')}
            >
              Side-by-side
            </button>
          </div>

          {commit.diffs.map((d, i) => (
            <FileDiffSection key={i} diff={d} view={view} />
          ))}
        </>
      )}
    </div>
  );
};

const FileDiffSection: React.FC<{diff: FileDiff; view: 'unified' | 'side-by-side'}> = ({
  diff,
  view,
}) => (
  <div style={{marginBottom: 18}}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 8px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderBottom: 'none',
        borderRadius: '6px 6px 0 0',
        fontSize: 13,
      }}
    >
      <FileDiffIcon />
      <span style={{color: 'rgba(255,255,255,0.8)'}}>{diff.path}</span>
      <span
        style={{
          fontSize: 10,
          marginLeft: 6,
          padding: '1px 6px',
          borderRadius: 8,
          background:
            diff.type === 'added'
              ? 'rgba(86,211,100,0.15)'
              : diff.type === 'deleted'
                ? 'rgba(248,81,73,0.15)'
                : 'rgba(255,255,255,0.08)',
          color:
            diff.type === 'added' ? '#56d364' : diff.type === 'deleted' ? '#f85149' : 'rgba(255,255,255,0.6)',
        }}
      >
        {diff.type}
      </span>
    </div>
    <DiffView oldText={diff.oldContent} newText={diff.newContent} view={view} />
  </div>
);

export default CommitDiffView;
