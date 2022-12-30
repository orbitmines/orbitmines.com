import React from 'react';
import { Row } from './lib/layout/flexbox';
import OnIntelligibility from "./papers/2022.OnIntelligibility";

function App() {
  return (
    <div className="bp4-dark">
      <Row center="xs">
        <OnIntelligibility/>
      </Row>
    </div>
  );
}

export default App;
