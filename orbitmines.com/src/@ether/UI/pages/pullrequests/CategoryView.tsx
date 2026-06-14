import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import classnames from 'classnames';
import type {PRParams} from '../../router/types';
import {getAPI} from '../../data';
import type {InlinePR} from '../../data';
import {ArrowLeftIcon, BranchIcon, MergeIcon} from '../../icons';
import Header from './Header';
import {buildPullsUrl, displayPath} from './urls';
import {timeAgo} from './timeAgo';

// `/-/@/pulls` or `/-/~/pulls` — PRs across all sub-paths under that
// category prefix.
const CategoryView: React.FC<{params: PRParams}> = ({params}) => {
  const navigate = useNavigate();
  const [prs, setPrs] = useState<InlinePR[]>([]);
  const [filter, setFilter] = useState<'open' | 'closed'>(() =>
    new URLSearchParams(window.location.search).get('filter') === 'closed' ? 'closed' : 'open',
  );

  useEffect(() => {
    let cancelled = false;
    getAPI()
      .getCategoryPullRequests(params.repoPath, params.category!)
      .then((p) => !cancelled && setPrs(p));
    return () => {
      cancelled = true;
    };
  }, [params.repoPath, params.category]);

  const {open, closed} = useMemo(() => {
    const o = prs.filter(({pr}) => pr.status === 'open');
    const c = prs.filter(({pr}) => pr.status !== 'open');
    return {open: o, closed: c};
  }, [prs]);

  const visible = filter === 'open' ? open : closed;
  const mainList = {...params, category: null as '@' | '~' | null};

  return (
    <div className="pr-page">
      <Header params={params} />

      <a
        className="pr-back-link"
        href={buildPullsUrl(mainList)}
        onClick={(e) => {
          e.preventDefault();
          navigate(buildPullsUrl(mainList));
        }}
      >
        <ArrowLeftIcon /> Back to pull requests
      </a>

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
        {visible.map(({pr, relPath}) => {
          const href = buildPullsUrl(params, String(pr.id));
          const StatusIcon = pr.status === 'merged' ? MergeIcon : BranchIcon;
          return (
            <a
              key={pr.id}
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
                </div>
                <div className="pr-row__meta">
                  #{pr.id} by @{pr.author} · updated {timeAgo(pr.updatedAt)}
                </div>
              </div>
            </a>
          );
        })}
        {visible.length === 0 && <div className="pr-empty">No pull requests in this category.</div>}
      </div>
    </div>
  );
};

export default CategoryView;
