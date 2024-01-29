import React from 'react';
import JetBrainsMono from "../../lib/layout/font/fonts/JetBrainsMono/JetBrainsMono";
import ORGANIZATIONS, {Content, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {PaperProps} from "../../lib/paper/Paper";
import Reference, {useCounter} from "../../lib/paper/layout/Reference";
import {PROFILES} from "../../profiles/profiles";
import {renderable} from "../../lib/typescript/React";
import {ON_ORBITS} from "./2023.OnOrbits";

export const REWRITING_RAYS: Content = {
  reference: {
    title: "Traversing and Rewriting of Arbitrary Rays",
    subtitle: "",
    draft: true,
    link: 'https://orbitmines.com/papers/traversing-and-rewriting-of-arbitrary-rays',
    year: "2024",
    date: "2024-03-31",
    external: {
      // TODO
      // discord: {serverId: '1055502602365845534', channelId: '1190719376085766195', link: () => "https://discord.com/channels/1055502602365845534/1190719376085766195/1190719376085766195"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => [
        ORGANIZATIONS.github.key,
        ORGANIZATIONS.twitter.key,
        ORGANIZATIONS.discord.key,
        ORGANIZATIONS.orcid.key,
      ].includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "March, 2024"
}

const RewritingRays = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...REWRITING_RAYS.reference,
    subtitle: renderable<string>("", (value: any) => <>
      A technical deep dive into Rays {<Reference is="footnote" index={referenceCounter()} reference={{...ON_ORBITS.reference}}/>}. Demonstrated by an implementation of <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Aleks Kissinger\'s Chyp (Cospans of HYPergraphs)', link: 'https://github.com/akissinger/chyp', authors: [{name: 'Aleks Kissinger'}]}} />.
    </>),
    pdf: {
      fonts: [JetBrainsMono],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Paper
    {...paper}
  >
  </Paper>
}

export default RewritingRays;