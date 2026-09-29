import React from 'react';
import type {Entry} from './types';
import EntryView from './EntryView';

type Props = {
  projects: Entry[];
  onOpen: (entry: Entry) => void;
};

const ProjectList: React.FC<Props> = ({projects, onOpen}) => (
  <div className="lib-project-list">
    {projects.map((p) => (
      <EntryView key={p.name} entry={p} isTopLevel onOpen={onOpen} />
    ))}
  </div>
);

export default ProjectList;
