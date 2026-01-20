import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../lib/organizations/ORGANIZATIONS";
import {PROFILES} from "./profiles/profiles";
import React from "react";
import Post, {
  Arc,
  BlueprintIcons16,
  BlueprintIcons20,
  JetBrainsMono,
  PaperProps,
  renderable,
  Title,
  useCounter
} from "../lib/post/Post";

export const ETHERS_ALMANAC: Content = { reference: {
  title: "Ether's Almanac",
  subtitle: "Your handbook for anything Ether, Ray & OrbitMines.",
  draft: true,
  date: "Last update: 2026-12-31",
  year: "2026",
  external: {
    discord: {serverId: '1055502602365845534', channelId: '1105246681915732108', link: () => "https://discord.com/channels/1055502602365845534/1105246681915732108/1105246681915732108"}
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

    </Arc>
  </Post>
}

export default Almanac;