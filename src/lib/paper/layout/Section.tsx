import { Children } from "../../typescript/React";
import React, {ReactNode} from "react";
import {Col, Row} from "../../layout/flexbox";
import {H4, H6} from "@blueprintjs/core";
import Paragraph from "./Paragraph";

export type SectionProps = {
  head: ReactNode
}

const Section = ({ head, sub, children }: SectionProps & Children & { sub?: ReactNode }) => {

  return <>
    <Row center="xs" className={"mt-12 pb-3"}>
      <Col xs={12}><H4>{head}</H4></Col>
      {sub ? <Col xs={12}><H6 className="bp5-text-muted">{sub}</H6></Col> : <></>}
    </Row>

    <Paragraph>{children}</Paragraph>
  </>
}

export default Section;