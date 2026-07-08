import React from 'react';
import {useLocation} from 'react-router-dom';
import EtherRoutes from './EtherRoutes';
import Minimap from '../../../routes/Minimap';

// Catch-all that decides whether a path belongs to the ether surface
// (`/@user/...` or `/$...`) or falls back to the orbitmines.com Minimap.
//
// Without this split, react-router would route every unmatched path to
// Minimap, swallowing the ether URL space. Adding ether's URL shapes as
// explicit Route entries isn't possible because v6+ doesn't allow literal
// `@`/`$` prefixes within a dynamic segment.
const EtherOrMinimap: React.FC = () => {
  const {pathname} = useLocation();
  if (pathname.startsWith('/@') || pathname.startsWith('/$')) {
    return <EtherRoutes />;
  }
  return <Minimap />;
};

export default EtherOrMinimap;
