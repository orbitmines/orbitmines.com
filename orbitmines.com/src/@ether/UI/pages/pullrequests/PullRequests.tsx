import React from 'react';
import type {PRParams} from '../../router/types';
import ListView from './ListView';
import DetailView from './DetailView';
import NewPRForm from './NewPRForm';
import CategoryView from './CategoryView';
import CommitDiffView from './CommitDiff';
import './PullRequests.scss';

// Dispatch to one of five sub-views based on `prAction`.
const PullRequests: React.FC<{params: PRParams}> = ({params}) => {
  if (params.prAction === 'list') return <ListView params={params} />;
  if (params.prAction === 'new') return <NewPRForm params={params} />;
  if (params.prAction === 'players' || params.prAction === 'worlds') return <CategoryView params={params} />;
  if (params.prAction === 'detail' && params.commitId) return <CommitDiffView params={params} />;
  if (params.prAction === 'detail') return <DetailView params={params} />;
  return <ListView params={params} />;
};

export default PullRequests;
