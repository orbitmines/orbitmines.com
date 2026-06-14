import React from 'react';
import {useNavigate} from 'react-router-dom';
import ActionRow, {CloneButton, PrimaryButton} from './ActionButtons';

export interface BreadcrumbItem {
  label: string;
  href: string | null;
}

interface BreadcrumbProps {
  displayVersion: string;
  items: BreadcrumbItem[];
  /** When present, action buttons (star/follow/clone/PR/settings) appear. */
  canonicalPath?: string;
  starPath?: string;
  rootLink?: {label: string; href: string};
  followUser?: string;
  pullsUrl?: string;
  settingsUrl?: string;
  chatUrl?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  displayVersion,
  items,
  canonicalPath,
  starPath,
  rootLink,
  followUser,
  pullsUrl,
  settingsUrl,
  chatUrl,
}) => {
  const navigate = useNavigate();
  return (
    <>
      {canonicalPath && pullsUrl && settingsUrl && chatUrl && (
        <ActionRow
          canonicalPath={canonicalPath}
          starPath={starPath || canonicalPath}
          followUser={followUser}
          pullsUrl={pullsUrl}
          settingsUrl={settingsUrl}
          chatUrl={chatUrl}
        />
      )}
      <div className="repo-breadcrumb">
        {rootLink && (
          <a
            href={rootLink.href}
            style={{color: 'rgba(255,255,255,0.65)', textDecoration: 'none'}}
            onClick={(e) => {
              e.preventDefault();
              navigate(rootLink.href);
            }}
          >
            {rootLink.label}
          </a>
        )}
        <span className="version-badge">{displayVersion}</span>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <span className="sep">/</span>
            {item.href ? (
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href!);
                }}
              >
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            )}
          </React.Fragment>
        ))}
        {canonicalPath && (
          <span className="breadcrumb-actions">
            <span style={{marginLeft: 'auto'}} />
            <PrimaryButton
              canonicalPath={canonicalPath}
              starPath={starPath || canonicalPath}
              followUser={followUser}
            />
            <CloneButton canonicalPath={canonicalPath} />
          </span>
        )}
      </div>
    </>
  );
};

export default Breadcrumb;
