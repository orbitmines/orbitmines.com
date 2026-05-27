import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getAPI} from '../../data';
import type {FileEntry} from '../../data';
import {FileIcon} from '../../icons';

type Props = {
  lang: string;
};

// Minimal sidebar: lists files in `@ether/.<lang>/`. The richer file-tree
// component lives in the Repository port — we'll wire that in once the
// Repository page is ported.
const SidebarPanel: React.FC<Props> = ({lang}) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAPI()
      .listDirectory(`@ether/.${lang}`)
      .then((entries) => {
        if (!cancelled) {
          setFiles(entries);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  if (loading) return <div className="lang-sidebar__empty">Loading…</div>;
  if (files.length === 0) {
    return (
      <div className="lang-sidebar__empty">
        No files yet.
        <br />
        Files will appear in
        <br />
        @ether/.{lang}/
      </div>
    );
  }

  return (
    <div className="lang-sidebar">
      {files.map((f) => (
        <div
          key={f.name}
          className="lang-sidebar__file"
          onClick={() => navigate(`/$.${lang}/${f.name}`)}
        >
          <FileIcon name={f.name} isDirectory={f.isDirectory} size={14} />
          {f.name}
        </div>
      ))}
    </div>
  );
};

export default SidebarPanel;
