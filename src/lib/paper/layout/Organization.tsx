import {Col, Row} from "../../layout/flexbox";
import _ from "lodash";
import {H3} from "@blueprintjs/core";
import React from "react";
import {AllowReact} from "../../typescript/React";
import {TOrganization} from "../../organizations/ORGANIZATIONS";

const Organization = (props: AllowReact<TOrganization>) => {
  const { name, assets } = props;
  const { logo } = assets;

  return <Col>
    <Row center="xs">
      <img src={logo} alt={_.isString(name) ? name : 'logo'} width="200px"/>
    </Row>
    <H3>{name}</H3>
  </Col>
}

export default Organization;