import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../lib/organizations/ORGANIZATIONS";
import {PROFILES} from "./profiles/profiles";
import React from "react";
import Post, {
  Arc,
  BlueprintIcons16,
  BlueprintIcons20,
  JetBrainsMono,
  PaperProps,
  renderable, Section,
  Title,
  useCounter
} from "../lib/post/Post";
import {Button} from "@blueprintjs/core";
import {useSearchParams} from "react-router-dom";

export const ETHERS_ALMANAC: Content = { reference: {
  title: "Ether's Almanac",
  subtitle: "Your handbook for anything Ether, Ray & OrbitMines.",
  draft: true,
  date: "Last update: 2026-12-31",
  year: "2026",
  external: {
    discord: {serverId: '1055502602365845534', channelId: '1463219913044005018', link: () => "https://discord.com/channels/1055502602365845534/1463219913044005018/1463219913044005018"}
  },
  organizations: [ORGANIZATIONS.orbitmines_research],
  authors: [{
    ...PROFILES.fadi_shawki,
    external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
  }],
  published: [ORGANIZATIONS.orbitmines_research],
  link: "https://orbitmines.com/almanac"
}, status: Viewed.VIEWED, found_at: "2026", viewed_at: "December, 2026" }

const Almanac = () => {
  const referenceCounter = useCounter();
  const [params, setParams] = useSearchParams();

  const book: Omit<PaperProps, 'children'> = {
    book: true,
    ...ETHERS_ALMANAC.reference,
    title: renderable<React.ReactNode>((ETHERS_ALMANAC.reference.title as any), (value: any) => <>
      <img src="/Ether.svg" alt="Ether's Almanac" style={{maxWidth: '100%', maxHeight: '100%'}}/>
      <Title>Ether's Almanac</Title>
    </>),
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Post
    {...book}
  >
    <Arc head="Introduction">
    </Arc>
    <Arc head="A. The Ray Programming Language">
      <Section head="§0. For Beginners">
        <span style={{textAlign: 'left'}}>If you're starting out learning a programming language for the first time, great! This section is for you. If not <Button icon="arrow-right" text="Skip ahead to §1" minimal outlined onClick={() => setParams({...params, section: "§1. How to Install"})} />.</span>

        <Section head="§0.1 ">
        </Section>
      </Section>
      <Section head="§1. How to Install">
      </Section>
      <Section head="§2. Programming Fundamentals">
        <Section head="§2.1 Superposing Variables">
        </Section>
        <Section head="§2.2 Graphs & Rays">
        </Section>
        <Section head="§2.3 Numbers">
          {/* Booleans, Numbers, compare i64 and other things */}

        </Section>
        <Section head="§2.4 Types: Patterns">

        </Section>
        <Section head="§2.5 Programs/Functions">

        </Section>
        <Section head="§2.6 Equality & Equivalence">

        </Section>
        <Section head="§2.7 Undecidability">

        </Section>
      </Section>
      <Section head="§3. ">
      </Section>
      <Section head="§4. Ecosystem">
        <Section head="§4.1 Location">

        </Section>
        <Section head="§4.2 Networking">

        </Section>
        <Section head="§4.3 Version Control">

        </Section>
        <Section head="§4.4 Access Permissions">
        </Section>
        <Section head="§4.5 Hosted Variables & Packages">

        </Section>
      </Section>
      <Section head="§5. Features">
        <Section head="§5.1 Probability">

        </Section>
        <Section head="§5.2 Coroutines">

        </Section>
        <Section head="§5.3 Theorem Proving">

        </Section>
        <Section head="§5.4 Geometry">

        </Section>
        <Section head="§5.5 UI">

        </Section>
        <Section head="§5.6 (Unicode) Strings">

        </Section>
      </Section>
      <Section head="§6. The Compiler">
      </Section>
    </Arc>

    <Arc head={<span className="bp5-text-disabled">B. The Ether: IDE (Planned for 2027)</span>}>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">C. Ether Library Project (Planned for 2028)</span>}>
    </Arc>
    <Arc head={<span className="bp5-text-disabled">D. Physics & Game Engine (Planned for 2029)</span>}>
    </Arc>
    <Arc head="Wrapping up">
    </Arc>
  </Post>
}

export default Almanac;