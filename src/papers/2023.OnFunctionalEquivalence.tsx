import React from 'react';
import Paper, {
  Author,
  Organization,
  PaperView,
  Reference,
  Section,
  Subtitle,
  Title,
  useCounter
} from "../lib/pdf/paper/Paper";
import fadishawki from "../lib/profiles/fadishawki";
import logo from "../lib/images/orbitmines/logo/orbitmines.logo.3000x1000.png";
import JetBrainsMono from "../lib/font/fonts/JetBrainsMono/JetBrainsMono";
import {Col, Row} from '../lib/layout/flexbox';
import {Divider, H3} from "@blueprintjs/core";


const OnFunctionalEquivalence = () => {
  const referenceCounter = useCounter();

  const HutterPrizeReference = <Reference is="reference" title="Hutter Prize" author="Hutter, Marcus" index={referenceCounter()} link="https://en.wikipedia.org/wiki/Hutter_Prize" inline />;

  return <Paper view={PaperView.Browser} pdf={{
    fonts: [ JetBrainsMono ],
  }}>
    <Title>On Functional Equivalence and Compression</Title>
    <Subtitle>A {HutterPrizeReference} Submission</Subtitle>

    <Row center="xs" middle="xs" className="child-px-20">
      <Col>
        <Organization name="OrbitMines Research" logo={logo} />
      </Col>
      <Col className="hidden-xs hidden-sm hidden-md">
        <Divider style={{height: '80px'}}/>
      </Col>
      <Col>
        <Author
          title="Fadi Shawki"
          subtitle={<a href="mailto:shawkifadi@gmail.com" target="_blank">shawkifadi@gmail.com</a>}
          socials={fadishawki}
        />
      </Col>
    </Row>

    <Row center="xs" middle="xs" className="child-px-10">
      <Col>
        <H3>??, 2023</H3>
      </Col>
    </Row>

    <Row center="xs">
      <Divider style={{width: '80%'}}/>
    </Row>
    <Row/>

    <Row center="xs">
      <Section head="Abstract">

      </Section>
      <Section head="Wrapping up">

      </Section>
    </Row>
  </Paper>;
}

export default OnFunctionalEquivalence;