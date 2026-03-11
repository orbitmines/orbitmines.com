import React, {ReactNode} from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {
  Arc,
  Block,
  BlueprintIcons16,
  BlueprintIcons20,
  BR,
  Children, Col,
  CustomIcon,
  JetBrainsMono,
  PaperProps,
  Reference,
  renderable,
  Row,
  Section,
  useCounter
} from "../../lib/paper/Paper";
import {
  add,
  CachedVisualizationCanvas,
  CanvasContainer,
  Continuation,
  Line,
  ON_ORBITS,
  Ray,
  RenderedRay,
  torus
} from "./2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../archive/2024.02.OrbitMines_as_a_Game_Project";
import {PROFILES} from "../profiles/profiles";
import {ON_INTELLIGIBILITY} from "./2022.OnIntelligibility";
import {Highlight, Prism, themes} from "prism-react-renderer";

export const ORBITMINES_MINECRAFT_ARCHIVE: Content = {
  reference: {
    title: "The OrbitMines Minecraft Server (2013-2019)",
    subtitle: "A trip back into the past, a piece of OrbitMines history when it was a Minecraft server. And a look at the OrbitMines Minecraft Archive which includes a remastered version of the server through its lifetime!",
    draft: true,
    link: 'https://orbitmines.com/archive/the-orbitmines-minecraft-server',
    year: "2016",
    date: "2026-06-31",
    external: {
      discord: {
        serverId: '1055502602365845534',
        channelId: '1455223851825762475',
        link: () => "https://discord.com/channels/1055502602365845534/1455223851825762475" // TODO
      }
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2026", viewed_at: "December, 2026"
}

const MinecraftArchive = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...ORBITMINES_MINECRAFT_ARCHIVE.reference,
    subtitle: renderable<string>("", (value: any) => <>
      A trip back into the past, a piece of OrbitMines history when it was a Minecraft server. And a look at the <Reference is="reference" simple inline index={referenceCounter()} reference={{
      title: 'OrbitMines Minecraft Archive', link: 'https://github.com/orbitmines/minecraft-archive', authors: [{
        ...PROFILES.fadi_shawki
      }], organizations: [ORGANIZATIONS.github]
    }}/> which includes a remastered version of the server through its lifetime!
    </>),
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Paper
    {...paper}
    // header={}
  >
    <style>{`@media only screen and (min-width: 768px) { .orbitmines-staff-img { margin-top: -100px; } }`}</style>
    <Row center="xs" style={{overflow: 'visible'}}>
      <Section head="Introduction">
      </Section>
      <Row style={{overflow: 'visible'}}>
        <Col md={8} sm={12}>
          <div className="pb-5" style={{textAlign: 'left'}}>
            At long last, it's time for a quick trip back into OrbitMines history. It's now been 7 years since the Minecraft server shut down... I've moved to working on other projects, all our community members have gone off to do their own thing. But the OrbitMines Minecraft server will always hold a special place in our hearts. And so to honor that, it is high time that a proper (playable) archive be put into place. I have gathered a few scraps of backups, lost some others and put together something which can survive time a little longer. You can find and download the archive on <Reference is="reference" simple inline index={referenceCounter()} reference={{
              title: 'GitHub', link: 'https://github.com/orbitmines/minecraft-archive', authors: [{
                ...PROFILES.fadi_shawki
              }], organizations: [ORGANIZATIONS.github]
            }}/>, or you can join us online, @ the reinstated <strong>hub.orbitmines.com</strong>
          </div>
        </Col>
        <Col md={4} sm={12}><img className="orbitmines-staff-img" style={{maxWidth: '600px'}} alt="OrbitMines Staff" src="/archive/the-orbitmines-minecraft-server/orbitmines_staff.png" /></Col>
      </Row>

      <Arc head="Arc: The Ray Programming Language">
        <Section head="A new language">

        </Section>
      </Arc>
    </Row>
  </Paper>
}

export default MinecraftArchive;

