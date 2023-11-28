import React from 'react';
import JetBrainsMono from "../../lib/layout/font/fonts/JetBrainsMono/JetBrainsMono";
import {Row} from '../../lib/layout/flexbox';
import ORGANIZATIONS from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {PaperProps, PView} from "../../lib/paper/Paper";
import BR from "../../lib/paper/layout/BR";
import Section from "../../lib/paper/layout/Section";
import Reference, {useCounter} from "../../lib/paper/layout/Reference";
import {PROFILES} from "../../profiles/profiles";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import Arc from "../../lib/paper/layout/Arc";
import TODO from "../../lib/paper/layout/TODO";
import Link from "../../lib/paper/layout/Link";
import {renderable} from "../../lib/typescript/React";

const OnOrbits = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const OnIntelligibilityReference = <Reference is="footnote" index={referenceCounter()} reference={{...ON_INTELLIGIBILITY.reference}} />;

  const paper: Omit<PaperProps, 'children'> = {
    title: renderable<string>("On Orbits:"),
    subtitle: renderable<string>("", (value: any) => <>
      Originally intended as a more technical continuation of earlier thoughts on intelligibility {OnIntelligibilityReference}.
    </>),
    draft: true,
    date: "2023-12-31",
    view: PView.Browser,
    pdf: {
      fonts: [ JetBrainsMono ],
    },
    external: {
      // TODO;
      // discord: {serverId: '1055502602365845534', channelId: '1105246681915732108', link: () => "https://discord.com/channels/1055502602365845534/1105246681915732108/1105246681915732108"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => [
        ORGANIZATIONS.github.key,
        ORGANIZATIONS.twitter.key,
        ORGANIZATIONS.discord.key,
      ].includes(profile.organization.key))
    }],
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Paper {...paper}>
    <Row center="xs">
      <Section head="A quick Introduction">

      </Section>
    </Row>

    <Arc head="Arc: Theoretics">
      <Section head="Violating Assumptions" sub="Unknown inconsistencies and enforcing global coherence">

      </Section>
      <Section head="Compression">

      </Section>
    </Arc>
    <Arc head="Arc: Interface">

    </Arc>
    <Arc head="Arc: Category Theory">
      <Link link="https://github.com/orbitmines/category-theory" icon={ORGANIZATIONS.github.key}/>

    </Arc>
    <Arc head="Arc: Homotopy Type Theory">
      <Link link="https://github.com/orbitmines/homotopy-type-theory" icon={ORGANIZATIONS.github.key}/>

    </Arc>
    <Arc head="Arc: ZX-Calculus">

    </Arc>
    <Arc head="Arc: WebAssembly">
      <Link link="https://github.com/orbitmines/wasm" icon={ORGANIZATIONS.github.key}/>

      <Section head="Why WebAssembly?" sub="A broader perspective">

      </Section>

      <Section head={<>
        <Reference
          index={referenceCounter()}
          reference={{
            title: "LEB128",
            link: "https://en.wikipedia.org/wiki/LEB128"
          }}
          simple inline
        />
      </>} sub="Little Endian Base 128 encoding">
        <TODO> </TODO>
      </Section>

      <Section head={<>
        <Reference index={referenceCounter()} reference={{title: "Unicode", link: "https://www.unicode.org/versions/latest/"}} simple inline />
      </>} sub="UTF-8 encoding">
        {/*Before getting further complexity in, it will probably help to construct the interface by which characters will be used, so we can use more familiar text-like symbols in the structures. For historical reasons and the choice of WebAssembly, I'll initially use UTF-8 for this. Just to simplify, I'll for now ignore the visualization of the Unicode scalar values.*/}

        {/*<BR/>*/}

        <TODO> </TODO>
      </Section>

      <Section head={<>
        <Reference
          simple
          inline
          index={referenceCounter()}
          reference={{
            title: "IEEE 754",
            link: "https://ieeexplore.ieee.org/document/8766229",
            published: [{name: 'IEEE Std 754-2019 (Revision of IEEE 754-2008)'} as any],
            year: "2019",
            pointer: "1-84"
          }}
        />
      </>} sub="Floating-Point Arithmetic">
        <TODO> </TODO>
      </Section>
    </Arc>
    <Arc head="Arc: Timeline">
      <Section head="A quick journey of getting here">

      </Section>
    </Arc>

    <Arc head="Wrapping up">
      <Section head="On self-publishing and referencing" sub="Edited personal journeys/histories/... and literary exposure">
        I suspect that this sort of self-(reporting/publishing), necessitates the highlighting of its possible adversarial/game-theoretic properties. With myself and my archives possibly being forgetful or deceitful players, this certainly makes for an interesting dynamic. Consider this quick paragraph as an acknowledgement that I am aware of that, and that I think my attempts aim for accuracy - whether that's actually successful or not -.

        <BR/>

        Similarly, it's worth admitting that I do not necessarily understand/have access to how certain interactions come together in my explorations. I document how I find certain kinds of information in some detail, though this is likely far from exhaustive.

        <BR/>

        I might also fail to mention relevant works (or personal interactions) which have either had impact on my line of thinking more non-trivially, or whose ideas aren't mentioned here, or in my other writing, directly. My current practical approach to this has therefore been to publish many kinds of information I expose myself to (during the time I'm working on these projects). Which hopefully support the more explicit referencing done here. I hope to further expand on this concept in future works.
      </Section>
    </Arc>
  </Paper>;
}

export default OnOrbits;