import React from 'react';
import {useLocation} from 'react-router-dom';
import {matchRoute} from './matchRoute';
import Placeholder from '../pages/Placeholder';
import Library from '../pages/library/Library';
import Settings from '../pages/settings/Settings';
import LangPage from '../pages/language/LangPage';
import PullRequests from '../pages/pullrequests/PullRequests';

// Dispatches an ether URL to a page component. Pages are placeholders for
// now — they'll be replaced page-by-page in the next milestones.
const EtherRoutes: React.FC = () => {
  const {pathname} = useLocation();
  const route = matchRoute(pathname);

  switch (route.page) {
    case 'repository':
      return <Placeholder page="repository" params={route.params} />;
    case 'pull-requests':
      return <PullRequests params={route.params} />;
    case 'settings':
      return <Settings params={route.params} />;
    case 'chat':
      return <Placeholder page="chat" params={route.params} />;
    case 'library':
      return <Library />;
    case 'language':
      return <LangPage params={route.params} />;
  }
};

export default EtherRoutes;
