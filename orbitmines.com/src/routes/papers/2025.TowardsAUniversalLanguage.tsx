import React from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {
  Arc,
  Block,
  BlueprintIcons16,
  BlueprintIcons20,
  BR, Col,
  HorizontalLine,
  JetBrainsMono,
  PaperProps,
  Reference,
  renderable,
  Row,
  Section,
  TODO,
  useCounter
} from "../../lib/paper/Paper";
import {CanvasContainer, ON_ORBITS} from "./2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../archive/2024.02.OrbitMines_as_a_Game_Project";
import {PROFILES} from "../profiles/profiles";
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";
import _ from "lodash";

export const TOWARDS_A_UNIVERSAL_LANGUAGE: Content = {
  reference: {
    title: "Towards A Universal Language",
    subtitle: "",
    draft: true,
    link: 'https://orbitmines.com/papers/towards-a-universal-language',
    year: "2025",
    date: "2025-12-31",
    external: {
      // TODO
      discord: {serverId: '1055502602365845534', channelId: '1200194437314261002', link: () => "https://discord.com/channels/1055502602365845534/1200194437314261002"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2025", viewed_at: "December, 2025"
}

const AUniversalLanguage = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...TOWARDS_A_UNIVERSAL_LANGUAGE.reference,
    subtitle: renderable<string>("", (value: any) => <>
       <Reference is="footnote" index={referenceCounter()} reference={{title: 'github.com/orbitmines/ray', link: 'https://github.com/orbitmines/ray', authors: [{
        ...PROFILES.fadi_shawki}], organizations: [ORGANIZATIONS.github]}} />: A Universal Language.
    </>),
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Paper
    {...paper}
  >

    {/* TODO: In place dynamic implementation here; remove from ?generate= */}
    {/*<div style={{*/}
    {/*  position: 'fixed',*/}
    {/*  bottom: 0,*/}
    {/*  left: 0,*/}
    {/*  right: 0,*/}
    {/*  width: '100%',*/}
    {/*  zIndex: 9999,*/}
    {/*}}>*/}
    {/*  <Row center="xs">*/}
    {/*    <Col xs={10} style={{backgroundColor: '#1c2127'}}>*/}
    {/*      <Block style={{width: '100%'}}>*/}
    {/*        /!*<CachedVisualizationCanvas alt="empty_vertex" context={ON_ORBITS}>*!/*/}
    {/*        /!*  <group scale={1.5}></group>*!/*/}
    {/*        /!*</CachedVisualizationCanvas>*!/*/}
    {/*        <CanvasContainer style={{height: '150px'}}>*/}
    {/*          <canvas*/}
    {/*              style={{*/}
    {/*                width: '100%',*/}
    {/*                height: '100%',*/}
    {/*                backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/2_double_expanded_continuation.png')`,*/}
    {/*                backgroundPosition: 'center center',*/}
    {/*                backgroundRepeat: 'no-repeat'*/}
    {/*              }}*/}
    {/*          />*/}
    {/*        </CanvasContainer>*/}
    {/*      </Block>*/}
    {/*    </Col>*/}
    {/*  </Row>*/}
    {/*</div>*/}

    <Row center="xs">
      <Section head="Introduction">

      </Section>

      <Arc head="Arc: Where to start...">
        <Section head="Compression" sub="Generalization of (perceived, ..., partial) geodesics">
            a
        </Section>
      </Arc>

      <Arc head="Wrapping up">
        <Section head="Future inquiries">

          A

          <span style={{textAlign: 'left', minWidth: '100%'}}>- Expanding the <Reference is="reference" index={referenceCounter()} reference={{link: "https://github.com/orbitmines/library", title: "OrbitMines Library"}} simple inline /> project. Providing steps towards <span
              className="bp5-text-muted">language, ..., platform</span> interoperability <Reference is="footnote" index={referenceCounter()} reference={{title: "Whatever function it is that platforms and interfaces serve, they will probably converge to being more of a theme applied on a particular type of structure. Only as a supply of resources (access to certain kinds of information/compute) will they persist. They will not persist as separable interfaces.", link: "https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project/#:~:text=Whatever%20sets%20up,have%20been%20found.", organizations: [ORGANIZATIONS.orbitmines_research]}}/> <Reference is="footnote" index={referenceCounter()} reference={{title: "This would have to include higher-order version control, keeping track of causal histories. And constantly reprogramming the renderer on the fly. Before a thing like this becomes even remotely practical.\n\nBut all these intermediate things are all practical tools for a smaller audience anyway.", link: 'https://x.com/_FadiShawki/status/1790005202084335947', authors: [{name: 'Fadi Shawki'}], date: '2024-05-13', organizations: [ORGANIZATIONS.twitter]}} />.</span>

          <BR/>

        </Section>
      </Arc>
    </Row>
  </Paper>
}

export default AUniversalLanguage;


/**
 * Rays: A Universal Language
 * @see https://github.com/orbitmines/ray
 */






































