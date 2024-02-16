import { Children } from "../../typescript/React";
import {Row} from "../../layout/flexbox";
import {Divider, H3} from "@blueprintjs/core";
import React from "react";
import Paragraph from "./Paragraph";
import {SectionProps} from "./Section";

const Arc = ({ head, children, buffer = true }: SectionProps & Children & { buffer?: boolean}) => {

  return <>
    <Row center="xs">
      <Row center="xs" className={"mt-12 pb-3"}>
        <H3 className="bp5-text-muted">{head}</H3>
      </Row>

      <Paragraph>{children}</Paragraph>
    </Row>

    {buffer ? <Row center="xs">
      <Divider style={{width: '80%'}}/>
    </Row> : <></>}
  </>;
}

export default Arc;