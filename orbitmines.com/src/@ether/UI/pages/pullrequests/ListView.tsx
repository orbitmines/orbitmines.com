import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import classnames from 'classnames';
import type {PRParams} from '../../router/types';
import {getAPI} from '../../data';
import type {CategoryPRSummary, InlinePR} from '../../data';
import {
  ArrowLeftIcon,
  BranchIcon,
  MergeIcon,
  PullRequestIcon,
} from '../../icons';
import Header from './Header';
import {buildPullsUrl, buildRepoUrl, displayPath} from './urls';
import {timeAgo} from './timeAgo';

const ListView: React.FC<{params: PRParams}> = ({params}) => {
  const navigate = useNavigate();
  const [inline, setInline] = useState<InlinePR[]>([]);
  const [playerSummary, setPlayerSummary] = useState<CategoryPRSummary | null>(null);
  const [worldSummary, setWorldSummary] = useState<CategoryPRSummary | null>(null);
  const [filter, setFilter] = useState<'open' | 'closed'>(() => {
    return new URLSearchParams(window.location.search).get('filter') === 'closed' ? 'closed' : 'open';
  });

  useEffect(() => {
    let cancelled = false;
    const api = getAPI();
    Promise.all([
      api.getInlinePullRequests(params.repoPath),
      api.getCategoryPRSummary(params.repoPath, '@'),
      api.getCategoryPRSummary(params.repoPath, '~'),
    ]).then(([prs, p, w]) => {
      if (cancelled) return;
      setInline(prs);
      setPlayerSummary(p);
      setWorldSummary(w);
    });
    return () => {
      cancelled = true;
    };
  }, [params.repoPath]);

  const {open, closed} = useMemo(() => {
    const o = inline
      .filter(({pr}) => pr.status === 'open')
      .sort((a, b) => new Date(b.pr.updatedAt).getTime() - new Date(a.pr.updatedAt).getTime());
    const c = inline
      .filter(({pr}) => pr.status !== 'open')
      .sort((a, b) => new Date(b.pr.updatedAt).getTime() - new Date(a.pr.updatedAt).getTime());
    return {open: o, closed: c};
  }, [inline]);

  const visiblePRs = filter === 'open' ? open : closed;
  const isEmpty = inline.length === 0 && !playerSummary && !worldSummary;

  return (
    <div className="pr-page">
      <Header params={params} />

      <a
        className="pr-back-link"
        href={buildRepoUrl(params)}
        onClick={(e) => {
          e.preventDefault();
          navigate(buildRepoUrl(params));
        }}
      >
        <ArrowLeftIcon /> Back to code
      </a>

      <div className="pr-list-header">
        <span style={{fontSize: 16, fontWeight: 'bold'}}>Pull Requests</span>
        <a
          className="pr-new-btn"
          href={buildPullsUrl(params, 'new')}
          onClick={(e) => {
            e.preventDefault();
            navigate(buildPullsUrl(params, 'new'));
          }}
        >
          <PullRequestIcon /> New Pull Request
        </a>
      </div>

      <div className="pr-filter-tabs">
        <button
          type="button"
          className={classnames('pr-filter-tab', {'pr-filter-tab--active': filter === 'open'})}
          onClick={() => setFilter('open')}
        >
          Open <span className="pr-filter-count">{open.length}</span>
        </button>
        <button
          type="button"
          className={classnames('pr-filter-tab', {'pr-filter-tab--active': filter === 'closed'})}
          onClick={() => setFilter('closed')}
        >
          Closed <span className="pr-filter-count">{closed.length}</span>
        </button>
      </div>

      <div className="pr-list">
        {playerSummary && <CategoryRow summary={playerSummary} prefix="@" params={params} filter={filter} />}
        {worldSummary && <CategoryRow summary={worldSummary} prefix="~" params={params} filter={filter} />}
        {visiblePRs.map(({pr, relPath}) => (
          <PRRow key={pr.id} pr={pr} relPath={relPath} params={params} />
        ))}
        {isEmpty && <div className="pr-empty">No pull requests yet.</div>}
      </div>
    </div>
  );
};

export default ListView;

const PRRow: React.FC<{pr: InlinePR['pr']; relPath: string; params: PRParams}> = ({pr, relPath, params}) => {
  const navigate = useNavigate();
  const href = buildPullsUrl(params, String(pr.id));
  const StatusIcon = pr.status === 'merged' ? MergeIcon : BranchIcon;
  return (
    <a
      className="pr-row"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      <span className={`pr-row__icon pr-row__icon--${pr.status}`}>
        <StatusIcon />
      </span>
      <div className="pr-row__body">
        <div className="pr-row__title">
          {relPath && <span className="pr-row__path">{displayPath(relPath)}</span>}
          {pr.title}
          <span className={`pr-status-badge ${pr.status}`}>{pr.status}</span>
        </div>
        <div className="pr-row__meta">
          #{pr.id} opened by @{pr.author} · updated {timeAgo(pr.updatedAt)}
        </div>
      </div>
    </a>
  );
};

const CategoryRow: React.FC<{
  summary: CategoryPRSummary;
  prefix: '@' | '~';
  params: PRParams;
  filter: 'open' | 'closed';
}> = ({summary, prefix, params, filter}) => {
  const navigate = useNavigate();
  const count = filter === 'open' ? summary.openCount : summary.closedCount;
  if (count === 0) return null;
  const label = prefix === '@' ? '@{: String}' : '#{: String}';
  const kindLabel =
    prefix === '@'
      ? summary.itemCount === 1 ? 'Player' : 'Players'
      : summary.itemCount === 1 ? 'World' : 'Worlds';
  const verb = filter === 'open' ? 'open across' : 'closed in';
  const base = params.base || '';
  const pathPart = params.path.length > 0 ? '/' + params.path.join('/') : '';
  const href = `${base}${pathPart}/-/${prefix}/pulls${filter === 'closed' ? '?filter=closed' : ''}`;

  return (
    <a
      className="pr-category"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      <span className="pr-category__icon">
        <PullRequestIcon />
      </span>
      <div className="pr-category__body">
        <div className="pr-category__name">{label}</div>
        <div className="pr-category__meta">
          {count} {verb} {summary.itemCount} {kindLabel}
        </div>
      </div>
    </a>
  );
};
