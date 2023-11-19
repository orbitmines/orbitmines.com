import {Col, Grid, Row} from "../layout/flexbox";
import {Divider, H1, H3, H4, Intent, Tag} from "@blueprintjs/core";
import React from "react";
import {Children, Rendered} from "../typescript/React";
import {getFootnotes} from "./layout/Reference";
import Organization from "./layout/Organization";
import Author from "./layout/Author";
import Link from "./layout/Link";
import ORGANIZATIONS from "../organizations/ORGANIZATIONS";
import Section from "./layout/Section";
import {PaperProps} from "./Paper";
import {PROFILES} from "../../profiles/profiles";
import _ from "lodash";

export const Title = ({children}: Children) => {
  return <Row center="xs">
    <H1>{children}</H1>
  </Row>;
}

export const Subtitle = ({children}: Children) => {
  return <Row center="xs">
    <H4 className="bp5-text-muted" style={{maxWidth: '80%'}}>{children}</H4>
  </Row>
}

export const HorizontalLine = () => <>
  <Row center="xs">
    <Divider style={{width: '80%'}}/>
  </Row>
  <Row/>
</>

const PaperContent = (props: PaperProps) => {
  const {title, subtitle, date, draft, organizations, authors, children, external, exclude_footnotes } = props;

  const {discord} = external || {};

  const external_links = !!discord;

  const Content = <>
    <Title><Rendered renderable={title}/></Title>
    {subtitle ? <Subtitle><Rendered renderable={subtitle}/></Subtitle> : <></>}

    <Row center="xs" middle="xs" className="child-px-20">
      {organizations ? <>
        {organizations.map((organization) => (<Col>
          <Organization {...organization} />
        </Col>))}

        <Col className="hidden-xs hidden-sm hidden-md">
          <Divider style={{height: '80px'}}/>
        </Col>
      </> : <></>}

      {(authors || []).map((author) => (<Col>
        <Author {...author} />

      </Col>))}
    </Row>

    <Row center="xs" middle="xs" className="child-px-10">
      <Col>
        <H3 className="m-0">{new Date(date).toLocaleString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"})}</H3>
      </Col>
      {draft ? <Col>
        <Tag intent={Intent.DANGER} minimal style={{fontSize: '1.1rem'}}>DRAFT: POSSIBLY IMPRACTICALLY VAGUE</Tag>
      </Col> : <></>}
    </Row>

    {external_links ? <Row center="xs" middle="xs" className="child-px-10">
      {discord ? <Col>
        <Link name="Discussion Channel" link={discord.link()} icon={ORGANIZATIONS.discord.key} intent={Intent.PRIMARY} />
      </Col> : <></>}
    </Row> : <></>}

    <HorizontalLine/>

    {children}

    <HorizontalLine/>
  </>

  const footnotes = getFootnotes(Content);

  return <Grid fluid className="py-35 px-50 child-pb-15" style={{
    // border: 'solid rgba(143, 153, 168, 0.15) 2px',
    //     height={1754} width={1240}
    maxWidth: '1240px',
    fontSize: '1.1rem'
  }}>
    {Content}

    {!exclude_footnotes ? <Section head="Footnotes & References">
      {footnotes}
    </Section> : <></>}
  </Grid>
}

export default PaperContent;