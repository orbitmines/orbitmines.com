import React from 'react';
import {useNavigate} from 'react-router-dom';
import {buildPathPreservingWildcards} from './paths';

export interface HeaderChainItem {
  label: string;
  /** Index into `path` (exclusive end) where this segment lives; -1 = no link. */
  pathEnd: number;
}

interface HeaderProps {
  chain: HeaderChainItem[];
  base: string;
  versions: [number, string][];
  path: string[];
}

// Header chain: a / -separated list of context switches that build the
// repo's title. Each segment is a link to the prefix it represents.
const Header: React.FC<HeaderProps> = ({chain, base, versions, path}) => {
  const navigate = useNavigate();
  return (
    <div className="repo-header">
      {chain.map((item, idx) => {
        const isLast = idx === chain.length - 1;
        const cls = isLast ? 'repo-name' : 'user';
        const sep = idx > 0 ? <span className="sep">/</span> : null;
        if (item.pathEnd >= 0) {
          const href = buildPathPreservingWildcards(base, versions, path, item.pathEnd) || '/';
          return (
            <React.Fragment key={idx}>
              {sep}
              <a
                className={cls}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(href);
                }}
              >
                {item.label}
              </a>
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={idx}>
            {sep}
            <span className={cls}>{item.label}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Header;
