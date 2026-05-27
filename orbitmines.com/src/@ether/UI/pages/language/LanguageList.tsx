import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getAPI} from '../../data';
import {FileIcon} from '../../icons';
import './Language.scss';

// `/$` route — lists all language definitions. In the dummy backend there
// aren't any yet, but the page still renders so the user can create one.
const LanguageList: React.FC = () => {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<{ext: string; fileCount: number}[]>([]);
  const [newExt, setNewExt] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const api = getAPI();
      const entries = await api.listDirectory('@ether');
      const skip = new Set(['html', 'intellij', 'ts', 'vite']);
      const out: {ext: string; fileCount: number}[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory || !entry.name.startsWith('.') || entry.name.length <= 1) continue;
        const ext = entry.name.slice(1);
        if (skip.has(ext)) continue;
        const files = await api.listDirectory(`@ether/${entry.name}`);
        out.push({
          ext,
          fileCount: files.filter((f) => !f.isDirectory && f.name.endsWith(`.${ext}`)).length,
        });
      }
      if (!cancelled) setLanguages(out);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitNew = () => {
    const val = newExt.trim();
    if (val && /^[a-zA-Z][a-zA-Z0-9]*$/.test(val)) navigate(`/$.${val}`);
  };

  return (
    <div className="lang-list">
      <div className="lang-list__header">$ Languages</div>
      <div className="lang-list__description">Programming language definitions</div>
      {languages.map((l) => (
        <div
          key={l.ext}
          className="lang-list__row"
          onClick={() => navigate(`/$.${l.ext}`)}
        >
          <span className="lang-list__icon">
            <FileIcon name="folder" isDirectory size={14} />
          </span>
          <span className="lang-list__name">.{l.ext}</span>
          <span className="lang-list__meta">
            {l.fileCount} file{l.fileCount === 1 ? '' : 's'}
          </span>
        </div>
      ))}
      <div className="lang-list__new">
        <span className="lang-list__icon" style={{opacity: 0.35}}>
          <FileIcon name="folder" isDirectory size={14} />
        </span>
        <input
          className="lang-new-input"
          type="text"
          placeholder="new language extension..."
          value={newExt}
          onChange={(e) => setNewExt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitNew();
          }}
        />
      </div>
    </div>
  );
};

export default LanguageList;
