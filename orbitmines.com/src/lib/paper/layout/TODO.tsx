import { Children } from "../../typescript/React";
import {Row} from "../../layout/flexbox";
import React from "react";

const TODO = ({ children }: Children) => {
  return (
    <Row className="bp5-text-muted" start="xs">TODO: [{children}]</Row>
  )
}

export default TODO;