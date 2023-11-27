import React from 'react';
import {Icon, Intent, Tag} from "@blueprintjs/core";
import {
  ARTICLES_2021,
  ARTICLES_2022,
  ARTICLES_2023,
  Category,
  ContentFocus,
  FAMILIAR_TOOLS
} from "../../profiles/FadiShawki/FadiShawki";
import ORGANIZATIONS from "../../lib/organizations/ORGANIZATIONS";
import Section from "../../lib/paper/layout/Section";
import Arc from "../../lib/paper/layout/Arc";
import Link from '../../lib/paper/layout/Link';
import {PROFILES} from "../../profiles/profiles";
import Profile from "../../profiles/Profile";
import BR from "../../lib/paper/layout/BR";
import {Reference2} from "../../lib/paper/layout/Reference";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import Col from "../../lib/layout/flexbox/Col";
import {Row} from "../../lib/layout/flexbox";

const FadiShawki = () => {
  const profile = PROFILES.fadi_shawki;

  return <Profile profile={profile}>
    <Arc head="Currently...">
      <Section head="Looking for a (Compiler, Chip, Language, ...)-(Research, Design)-related position">
        Feel free to contact me on the socials specified above.
      </Section>
      <Section head="Building a (ray-like hypergraph) graphical interface">
        <Link
          link="https://github.com/orbitmines/orbitmines.com/pull/1"
          name={<span>
        OrbitMines Explorer - <Tag intent={Intent.WARNING} minimal multiline style={{fontSize: '1rem', paddingTop: '0px', paddingBottom: '0px'}}>WIP</Tag> Preliminary Technical Implementation/Exploration
      </span>}
          icon={ORGANIZATIONS.github.key} />
      </Section>
      <Section head="Modelling WebAssembly">
        <Link link="https://github.com/orbitmines/wasm" icon={ORGANIZATIONS.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />

      </Section>
      <Section head="Trying to compress enwik9 (Hutter Prize)">
        <Link link="https://github.com/orbitmines/enwik9" icon={ORGANIZATIONS.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />

      </Section>
      <Section head="Writing a paper on most of the above">
        <Link link="https://orbitmines.com/papers/on-orbits" intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />
      </Section>
    </Arc>

    <Arc head="Writings">
      <Section head="Theoretics">
        <Reference2 index={0} {...ON_INTELLIGIBILITY.reference} start="xs" style={{
          // maxWidth: '600px',
          fontSize: '0.8rem'
        }} />
      </Section>
    </Arc>

    <Arc head="Formal History">
      <Section head="Projects">
        <Category category={profile.content.history} archival_functions={false} focus={ContentFocus.FINISHED} />
      </Section>

      <Section head="Formal Education">
        <Category category={profile.content.formal_education} archival_functions={false} focus={ContentFocus.ALL} />
      </Section>

      <Section head="Attended Events">
        <Category category={profile.content.attended_events} archival_functions={false} focus={ContentFocus.ALL} />
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
  </Profile>;
}

export default FadiShawki;