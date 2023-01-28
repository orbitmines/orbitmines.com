import React from 'react';
import { Row } from './lib/layout/flexbox';
import OnIntelligibility from "./papers/2022.OnIntelligibility";
import OnFunctionalEquivalence from "./papers/2023.OnFunctionalEquivalence";
import FadiShawki from "./profiles/FadiShawki/FadiShawki";

function App() {
  return (
    <div className="bp4-dark">
      <Row center="xs">
        <OnIntelligibility/>
        {/*<OnFunctionalEquivalence/>*/}
        {/*<FadiShawki/>*/}
      </Row>
    </div>
  );
}

export default App;
