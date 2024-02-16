import React from 'react';
import {Intent, Tag} from "@blueprintjs/core";
import {
  ARTICLES_2021,
  ARTICLES_2022,
  ARTICLES_2023,
  ARTICLES_2024,
  FAMILIAR_TOOLS
} from "../../profiles/FadiShawki/FadiShawki";
import ORGANIZATIONS from "../../lib/organizations/ORGANIZATIONS";
import Section from "../../lib/paper/layout/Section";
import Arc from "../../lib/paper/layout/Arc";
import Link from '../../lib/paper/layout/Link';
import {PROFILES} from "../../profiles/profiles";
import Profile from "../../profiles/Profile";
import {Reference} from "../../lib/paper/layout/Reference";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import {Category, ContentFocus} from '../../profiles/FadiShawki/FadiShawki2';
import {ON_ORBITS} from "./2023.OnOrbits";
import {CanvasContainer} from "../../@orbitmines/Visualization";

const FadiShawki = () => {
  const profile = PROFILES.fadi_shawki;

  return <Profile profile={profile}>
    <Arc head="Currently..." buffer={false}>
      <Section head="Looking for a (Compiler, Chip, Language, ...)-(Research, Design)-related position">
        Feel free to contact me on the socials specified above.
      </Section>
      <Section head="Building a (ray-like hypergraph) graphical interface">
        <CanvasContainer style={{height: '140px'}}>
          <canvas
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/header.png')`,
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </CanvasContainer>

        <Link
          link="https://github.com/orbitmines/orbitmines.com"
          name={<span>
        OrbitMines - <Tag intent={Intent.WARNING} minimal multiline style={{fontSize: '1rem', paddingTop: '0px', paddingBottom: '0px'}}>WIP</Tag> Preliminary Technical Implementation/Exploration
      </span>}
          icon={ORGANIZATIONS.github.key} />
      </Section>
      {/*<Section head="Modelling WebAssembly">*/}
      {/*  <Link link="https://github.com/orbitmines/wasm" icon={ORGANIZATIONS.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />*/}

      {/*</Section>*/}
      {/*<Section head="Trying to compress enwik9 (Hutter Prize)">*/}
      {/*  <Link link="https://github.com/orbitmines/enwik9" icon={ORGANIZATIONS.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />*/}

      {/*</Section>*/}
      {/*<Section head="Writing a paper on most of the above">*/}
      {/*  <Link link="https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies" intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />*/}
      {/*</Section>*/}
    </Arc>


    <CanvasContainer style={{height: '110px'}}>
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/branch.png')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </CanvasContainer>

    <Arc head="Writings" buffer={false}>
      <Section head="Theoretics">
        {[ON_ORBITS, ON_INTELLIGIBILITY].map((paper, i) => (
          <Reference index={i} reference={{...paper.reference}} start="xs" style={{fontSize: '0.8rem'}} />
        ))}
      </Section>
    </Arc>

    <CanvasContainer style={{height: '110px'}}>
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/2_edge_3_fractal.png')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </CanvasContainer>

    <Arc head="Formal History" buffer={false}>
      <Section head="Projects">
        <Category category={profile.content!.history} focus={ContentFocus.FINISHED} />
      </Section>

      <Section head="Formal Education">
        <Category category={profile.content!.formal_education} focus={ContentFocus.ALL} inline />
      </Section>

      <Section head="Attended Events">
        <Category category={profile.content!.attended_events} focus={ContentFocus.ALL} />
      </Section>
    </Arc>

    <CanvasContainer style={{height: '150px'}}>
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/2_edge_3_fractal_with_equivs.png')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </CanvasContainer>

    <Arc head="Technology Exposure" buffer={false}>
      <Section head="2013 .. 2023">
        <Category category={FAMILIAR_TOOLS} focus={ContentFocus.ALL} inline simple />
      </Section>
    </Arc>

    <CanvasContainer style={{height: '110px'}}>
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/2_edge_3_fractal_equived.png')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </CanvasContainer>

    {/* Include things like wikipedia exposure/other things like github ? */}
    <Arc head="Literary Exposure">
      <Section head="2024">
        <Category category={ARTICLES_2024} focus={ContentFocus.ALL} />
      </Section>
      <Section head="2023">
        <Category category={ARTICLES_2023} focus={ContentFocus.ALL} />
      </Section>
      <Section head="2022">
        <Category category={ARTICLES_2022} focus={ContentFocus.ALL} />
      </Section>
      <Section head="2021">
        <Category category={ARTICLES_2021} focus={ContentFocus.ALL} />
      </Section>
    </Arc>
  </Profile>;
}

export default FadiShawki;