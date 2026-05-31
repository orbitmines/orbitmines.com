import React, {useState} from 'react';
import {CopyIcon, ForkIcon, GitIcon, PlayIcon} from './icons';
import {getCurrentPlayer} from './storage';

interface ClonePopupProps {
  canonicalPath: string;
  open: boolean;
  onClose: () => void;
}

const ClonePopup: React.FC<ClonePopupProps> = ({canonicalPath, open}) => {
  const etherCmd = `ether clone ${canonicalPath}`;
  const gitCmd = `git clone git@ether.orbitmines.com:${canonicalPath}`;

  const slashIdx = canonicalPath.indexOf('/');
  const forkUser = `@${getCurrentPlayer()}/`;
  const forkRepoName = slashIdx >= 0 ? canonicalPath.slice(slashIdx + 1) : canonicalPath;
  const forkPlaceholder = canonicalPath.startsWith('@ether') ? canonicalPath : `@ether/${forkRepoName}`;

  return (
    <div className={`popup${open ? ' open' : ''}`}>
      <div className="popup-ether-block">
        <div className="popup-ether-icon">
          <img src="/E.svg" alt="Ether" />
        </div>
        <div className="popup-ether-lines">
          <div className="popup-ether-line">
            <div className="popup-code">{etherCmd}</div>
            <CopyButton text={etherCmd} />
            <button className="popup-play-btn" title="Run" type="button">
              <PlayIcon />
            </button>
          </div>
          <div className="popup-ether-line">
            <span className="popup-fork-icon">
              <ForkIcon />
            </span>
            <span className="popup-fork-prefix">{forkUser}</span>
            <input className="popup-fork-input" placeholder={forkPlaceholder} />
            <span className="popup-fork-suffix">% @me</span>
          </div>
        </div>
      </div>
      <div className="popup-row" style={{marginTop: 12}}>
        <div className="popup-row-icon">
          <GitIcon />
        </div>
        <div className="popup-code">{gitCmd}</div>
        <CopyButton text={gitCmd} />
      </div>
    </div>
  );
};

const CopyButton: React.FC<{text: string}> = ({text}) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`copy-btn${copied ? ' copied' : ''}`}
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      <CopyIcon />
    </button>
  );
};

export default ClonePopup;
