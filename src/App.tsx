import React from 'react';
import {Row} from './lib/layout/flexbox';
import {Route, Routes} from "react-router-dom";
import Root from "./routes/Root";
import Paper from "./routes/Paper";

function App() {
  return (
    <div className="bp4-dark">
      <Row center="xs">

          <Routes>
              <Route path="*" element={<Root/>} errorElement={<Root/>} />
              <Route path="papers">
                  <Route path=":paper" element={<Paper />} />
              </Route>
          </Routes>

      </Row>
    </div>
  );
}

export default App;
