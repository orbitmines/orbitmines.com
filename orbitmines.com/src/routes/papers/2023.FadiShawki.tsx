import React from 'react';
import {Intent, Tag} from "@blueprintjs/core";
import REFERENCES, {
  ARTICLES_2021,
  ARTICLES_2022,
  ARTICLES_2023,
  ARTICLES_2024,
  FAMILIAR_TOOLS
} from "../../profiles/FadiShawki/FadiShawki";
import ORGANIZATIONS, {Viewed} from "../../lib/organizations/ORGANIZATIONS";
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
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../archive/2024.02.OrbitMines_as_a_Game_Project";

const FadiShawki = () => {
  const profile = PROFILES.fadi_shawki;

  return <Profile profile={profile}>
    <Arc head={<span>
      TGBG but the solution to TGBG is TGBG.🤔
    </span>} buffer={false}>
      {/*<Section head="Looking for a (Compiler, Chip, Language, ...)-(Research, Design)-related position">*/}
      {/*  Feel free to contact me on the socials specified above.*/}
      {/*</Section>*/}
      <Section head="Looking for funding, collaboration or anyone curious to learn more">
        Feel free to contact me on the socials specified above.
      </Section>

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

      <Section head="Ongoing Projects">
        <Category category={{
          name: '2013 .. 2024',
          items: [
            _2024_02_ORBITMINES_AS_A_GAME_PROJECT,
            {
              reference: {
                title: "Writing 2024. A Universal Language",
                organizations: [ORGANIZATIONS.github],
                year: "2024",
                link: "https://github.com/orbitmines/orbitmines.com/pull/28"
              }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
            },
            {
              reference: {
                title: "Project - (Hypergraphic) Version Control System through Rays",
                organizations: [ORGANIZATIONS.github],
                year: "2024",
                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20(Hypergraphic)%20Version%20Control%20System%20through%20Rays%20(2024).md"
              }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
            },
            {
              reference: {
                title: "Project - Implementing Aleks Kissinger's Chyp (Cospans of HYPergraphs) through Rays",
                organizations: [ORGANIZATIONS.github],
                year: "2024",
                link: "https://github.com/orbitmines/orbitmines.com/issues/14"
              }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
            },
            {
              reference: {
                title: "Project - Compute - Rays to GPUs",
                organizations: [ORGANIZATIONS.github],
                year: "2024?",
                link: "https://github.com/orbitmines/archive/tree/main/projects#:~:text=Project%20%2D-,Compute%20(2024%3F)%20%2D%20Rays%20to%20GPUs.md,-Entries%20%3C%202024%2D03"
              }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
            },
            {
              reference: {
                title: "Project - Indexing existing Abstract Models",
                organizations: [ORGANIZATIONS.github],
                year: "2024-2025?",
                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Indexing%20existing%20Abstract%20Models%20(2024-2025%3F).md"
              }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
            },
            {
              reference: {
                title: "Project - Compression (2025?)",
                organizations: [ORGANIZATIONS.github],
                year: "2025?",
                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Compression%20(2025%3F).md"
              }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
            },
            {
              reference: {
                title: "Project - Archive - \"OrbitMines' Journey\"",
                organizations: [ORGANIZATIONS.github],
                year: "2025-2026?",
                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Archive%20-%20%22OrbitMines'%20Journey%22%20(2025-2026%3F).md"
              }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
            }
          ]
        }} focus={ContentFocus.ALL} />
      </Section>

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


    <Arc head="Writings" buffer={false}>
      <Section head="Theoretics">
        {[_2024_02_ORBITMINES_AS_A_GAME_PROJECT, ON_ORBITS, ON_INTELLIGIBILITY].map((paper, i) => (
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

      <Section head="Attended Events">
        <Category category={profile.content!.attended_events} focus={ContentFocus.ALL} />
      </Section>

      <Section head="Formal Education">
        <Category category={profile.content!.formal_education} focus={ContentFocus.ALL} />
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