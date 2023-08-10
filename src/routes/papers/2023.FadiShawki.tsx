import React from 'react';
import Paper, {
  Arc,
  Author,
  BR,
  PaperView,
  Reference,
  ReferenceProps,
  Section,
  Link,
  TODO,
  Subtitle,
  Title,
  useCounter
} from "../../lib/pdf/paper/Paper";
import fadishawki, {Socials} from "../../lib/profiles/fadishawki";
import JetBrainsMono from "../../lib/font/fonts/JetBrainsMono/JetBrainsMono";
import {Col, Row} from '../../lib/layout/flexbox';
import {Divider, H3, Icon, Intent, Tag} from "@blueprintjs/core";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import {
  ARTICLES_2021,
  ARTICLES_2022, ARTICLES_2023, ATTENDED_EVENTS,


  BOOKS,
  Category,
  ContentFocus,
  FAMILIAR_TOOLS,
  FICTION,
  FORMAL_EDUCATION,
  HISTORY, NON_FICTION,
  Profile
} from "../../profiles/FadiShawki/FadiShawki";
import fadishawki_profile_picture from "../../profiles/FadiShawki/fadishawki.profile-picture.png";
import {useNavigate} from "react-router-dom";
import brands from "../../lib/external/brands";
import _ from "lodash";

export const HUTTER_PRIZE: ReferenceProps = {
  title: "Hutter Prize",
  author: "Hutter, Marcus",
  link: "https://en.wikipedia.org/wiki/Hutter_Prize",
};

const FadiShawki = () => {
  const referenceCounter = useCounter();
  const navigate = useNavigate();


  const OnIntelligibilityReference = <Reference is="reference" index={referenceCounter()} {...ON_INTELLIGIBILITY.reference} />;

  const socials: Socials = _.pickBy(fadishawki, (value, key) => [
    brands.github.key,
    brands.twitter.key,
    brands.discord.key,
    brands.linkedin.key
  ].includes(key));

  const profile: Profile = {
    title: 'Fadi Shawki',
    subtitle: <Row className="child-px-3" middle="xs">
      <Col>
        <a href="mailto:fadi.shawki@orbitmines.com" target="_blank">fadi.shawki@orbitmines.com</a>
      </Col>
      <Col>
        <Divider style={{height: '0.8rem'}}/>
      </Col>
      <Col>
        22 SY old
      </Col>
    </Row>,
    profile_picture: fadishawki_profile_picture,
    socials: socials,

    summary: <span>

    </span>,

    books: BOOKS,
    history: HISTORY,
    formal_education: FORMAL_EDUCATION,
    attended_events: ATTENDED_EVENTS,
    familiar_tools: FAMILIAR_TOOLS,
  }

  return <Paper view={PaperView.Browser} pdf={{
    fonts: [ JetBrainsMono ],
  }} exclude_footnotes={true}>
    <Title>2023. Fadi Shawki</Title>
    <Subtitle>A self-profile by some 23-solar-orbiting explorer.</Subtitle>

    <Row center="xs" middle="xs" className="child-px-20">
      <Col>
        <Author
          title={<a onClick={() => navigate("/profiles/fadi-shawki")}>Fadi Shawki</a>}
          subtitle={<a href="mailto:fadi.shawki@orbitmines.com" target="_blank">fadi.shawki@orbitmines.com</a>}
          socials={socials}
        />
      </Col>
    </Row>

    <Row center="xs" middle="xs" className="child-px-10">
      <Col>
        <H3>August, 2023</H3>
      </Col>
    </Row>
    <Row/>

    <Arc head="Currently...">
      <Section head="Looking for a (Compiler, Chip, Language, ...)-(Research, Design)-related position">
        Feel free to contact me on the socials specified above.
      </Section>
      <Section head="Building a (ray-like hypergraph) graphical interface">
        <Link link="https://github.com/orbitmines/explorer" icon={brands.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />

      </Section>
      <Section head="Modelling WebAssembly">
        <Link link="https://github.com/orbitmines/wasm" icon={brands.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />

      </Section>
      <Section head="Trying to compress enwik9 (Hutter Prize)">
        <Link link="https://github.com/orbitmines/enwik9" icon={brands.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />

      </Section>
      <Section head="Writing a paper on most of the above">
        <Link link="https://orbitmines.com/papers/on-orbits" icon={brands.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />
      </Section>
    </Arc>

    <Arc head="Writings">
      <Section head="Theoretics">
        <a onClick={() => navigate("/papers/on-intelligibility")}>
          <Icon icon="link" /> 2022. On the Intelligibility of (dynamic) Systems and Conceptual Uncertainty
        </a>
      </Section>
    </Arc>

    <Arc head="Formal History">
      <Section head="Projects">
        <Category category={profile.history} archival_functions={false} focus={ContentFocus.FINISHED} />
      </Section>

      <Section head="Formal Education">
        <Category category={profile.formal_education} archival_functions={false} focus={ContentFocus.ALL} />
      </Section>

      <Section head="Attended Events">
        <Category category={profile.attended_events} archival_functions={false} focus={ContentFocus.ALL} />
      </Section>
    </Arc>

    <Arc head="Technology Exposure">
      <Section head="2013 .. 2023">
        <Category category={FAMILIAR_TOOLS} archival_functions focus={ContentFocus.ALL} inline simple />
      </Section>
    </Arc>

    {/* Include things like wikipedia exposure/other things like github ? */}
    <Arc head="Literary Exposure">
      <Section head="2023">
        <Category category={ARTICLES_2023} archival_functions focus={ContentFocus.ALL} inline simple />
      </Section>
      <Section head="2022">
        <Category category={ARTICLES_2022} archival_functions focus={ContentFocus.ALL} inline simple />
      </Section>
      <Section head="2021">
        <Category category={ARTICLES_2021} archival_functions focus={ContentFocus.ALL} inline simple />
      </Section>
    </Arc>
  </Paper>;
}

export default FadiShawki;