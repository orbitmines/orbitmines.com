import React from 'react';
import {useNavigate} from 'react-router-dom';
import type {PRParams} from '../../router/types';
import {displaySegment} from './urls';

// Breadcrumb chain at the top of every PR view:
//   @user / repo / sub / path
// Each segment links to that level's PR list.
const Header: React.FC<{params: PRParams}> = ({params}) => {
  const navigate = useNavigate();
  const base = params.base || '';

  return (
    <div className="repo-header">
      {base && (
        <a
          className="user"
          href={`${base}/-/pulls`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`${base}/-/pulls`);
          }}
        >
          @{params.user}
        </a>
      )}
      {params.path.map((seg, i) => {
        const isLast = i === params.path.length - 1;
        const segPath = params.path.slice(0, i + 1).join('/');
        const segPullsUrl = `${base}/${segPath}/-/pulls`;
        const cls = isLast ? 'repo-name' : 'user';
        return (
          <React.Fragment key={i}>
            {(base || i > 0) && <span className="sep">/</span>}
            <a
              className={cls}
              href={segPullsUrl}
              onClick={(e) => {
                e.preventDefault();
                navigate(segPullsUrl);
              }}
            >
              {displaySegment(seg)}
            </a>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Header;
