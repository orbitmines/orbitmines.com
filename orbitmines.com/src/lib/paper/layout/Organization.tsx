import {Col, Row} from "../../layout/flexbox";
import _ from "lodash";
import {H3} from "@blueprintjs/core";
import React from "react";
import {AllowReact} from "../../typescript/React";
import {TOrganization} from "../../organizations/ORGANIZATIONS";

const Organization = (props: AllowReact<TOrganization> & { only_logo?: boolean }) => {
  const { name, assets } = props;
  const { logo } = assets;

  return <Col>
    <Row center="xs">
      <img src={logo} alt={_.isString(name) ? name : 'logo'} style={{maxWidth: '200px'}}/>
    </Row>
    {props.only_logo ? <></> : <H3>{name}</H3>}
  </Col>
}

export default Organization;