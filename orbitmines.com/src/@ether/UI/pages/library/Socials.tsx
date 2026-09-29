import React from 'react';
import type {SocialLink} from './data';

const Socials: React.FC<{links: SocialLink[]}> = ({links}) => (
  <div className="lib-socials">
    {links.map((s) => (
      <a
        key={s.name}
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        title={s.label}
        className="lib-social-link"
      >
        {s.name}
      </a>
    ))}
  </div>
);

export default Socials;
