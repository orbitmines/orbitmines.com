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
  Section, TODO,
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
import {ImageGallery} from "../../lib/paper/ImageGallery";

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

      <Arc head="Arc: The Beginnings (2013-2014)">
        <Section head="A new player and the origins of a new server">
          My first interaction with Minecraft started quite early in its history, back when it used to run in the browser if I recall correctly, where you joined creative worlds listed on some website where everyone could edit the world as they liked. This must've been around 2010.

          <BR/>

          But then I only played it sparingly, I remember quite vividly when I started to play it much more, this was the day I purchased my Minecraft account. I remember my brother playing on <Reference is="reference" simple inline index={referenceCounter()} reference={{ title: "MCSG",link: "https://mcgamer.net/" }}/> and I was spectating the intensity of the game. After watching a few matches I knew I must play this game.

          <BR/>

          And so it was on that fated day that I purchased Minecraft. In the very same year when OrbitMines started itself.

          <img
            alt="email_2013-11-14_16-17-00"
            src="/archive/the-orbitmines-minecraft-server/emails/email_2013-01-31_18-17-00.png" style={{maxWidth: '100%'}}/>

          <BR/>

          That year I turned 13, and I mostly played on the dutch Minecraft server called <Reference is="reference" simple inline
                                                                                         index={referenceCounter()} reference={{
          title: "Torchcraft",
          link: "https://torchcraft.nl/"
        }}/>. After some time I decided - I want something like this for myself too -. But what to build? Before that time I had played a lot of the MMO <Reference is="reference" simple inline index={referenceCounter()} reference={{ title: "DarkOrbit",link: "https://en.wikipedia.org/wiki/DarkOrbit" }}/>. And so I decided that I would make one like it myself. Browsing <Reference is="reference" simple inline index={referenceCounter()} reference={{ title: "Bukkit",link: "https://dev.bukkit.org/members/_forgeuser16475440/projects" }}/> & <Reference is="reference" simple inline index={referenceCounter()} reference={{ title: "Spigot",link: "https://www.spigotmc.org/members/fadidev.49372/" }}/> and YouTube researching what kind of Minecraft plugins exited out in the wild to make that dream a reality. I made the worlds, I made a setup, and there it was in its primitive form; the first inklings of OrbitMines.

          <BR/>

          The name OrbitMines was born: Combining both Minecraft and <Reference is="reference" simple inline index={referenceCounter()} reference={{ title: "DarkOrbit",link: "https://en.wikipedia.org/wiki/DarkOrbit" }}/>. The only decision I needed to make was whether to call it MineOrbit or OrbitMines; luckily the sense of OrbitMines being the better one prevailed.

          <BR/>

          There was a single person whose called slienimon who was there at the origin of the server, someone I had met on <Reference is="reference" simple inline
                                                                                                                                                   index={referenceCounter()} reference={{
          title: "Torchcraft",
          link: "https://torchcraft.nl/"
        }}/>, whom I randomly stumbled into because we built our homes close together there. They helped me test the original idea for OrbitMines, as you can see from the video in a bit.
        </Section>
        <Section head="The Launch">
          Though later we used the date 10 October 2013 as the birthday for OrbitMines, the original launch date the
          16th of November in 2013.

          <BR/>

          I don't remember exactly why this date, the 10th of October was picked by me, the idea of starting the server
          had been brewing before that. It is likely that it was the day I decided on the name OrbitMines.

          <BR/>

          At least from my private archives we can track that the first orbitmines-related email (which was a test
          donation email), was sent on the 13th of October that year. We also know that from the domain registration
          information that orbitmines.com was registered by me on the <Reference is="reference" simple inline
                                                                                 index={referenceCounter()} reference={{
          title: "15th of October (2013)",
          link: "https://ie.godaddy.com/whois/results.aspx?itc=dlp_domain_whois&domain=orbitmines.com#:~:text=Registered%20On,15T15%3A12%3A57Z"
        }}/>.

          <BR/>

          On the 16th we launched the "OrbitMines PvP" for Minecraft 1.6.4, which apparently, though I don't
          recall this, was accompanied with a livestream on my brother's Twitch. Unfortunately twitch nor I have not kept an archival recording of that livestream if it did indeed happen.

          <BR/>

          <img
            alt="email_2013-11-14_16-17-00"
            src="/archive/the-orbitmines-minecraft-server/emails/email_2013-11-14_16-17-00.png" style={{maxWidth: '100%'}}/>

          I spammed out this message on the internet, which like usual spam seems to have actually worked for some
          people as I have records of several players asking about it afterwards.

          <BR/>

          The launch however was a complete disaster, the gamemode wasn't fun, there were too many incomplete things,
          and most of all, a game like that needs active players.

          <BR/>

          Unfortunately no working version of that gamemode survived, though we do have the worlds which were used for
          it. We also have an <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "old video",
          link: "https://www.youtube.com/watch?v=nI8c6yNnbbI"
        }}/> of what it was like from the 5th of November that year.
          <BR/>

          <iframe width="560" height="315" src="https://www.youtube.com/embed/nI8c6yNnbbI?si=UrRKcI2b6qI0SpuP"
                  title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen style={{maxWidth: '100%'}}></iframe>
          <BR/>

          Here are some more pictures of those worlds:

          <TODO/>

        </Section>
        <Section head="Pivot away from OrbitMines PvP">
          Over the next month I decided the <Reference is="reference" simple inline index={referenceCounter()}
                                                       reference={{
                                                         title: "DarkOrbit",
                                                         link: "https://en.wikipedia.org/wiki/DarkOrbit"
                                                       }}/> gamemode wasn't working. I still wanting to run a server. So
          instead I did what most Minecraft servers do: copy existing gamemodes from other servers; though we managed to distinguish ourselves from other servers in important ways which (I believe) is what aided in making players stay.

          <BR/>

          So over that next month I made the following gamemodes at first: Survival, Prison, SkyBlock and our beloved first iteration of KitPvP. We later also added an Arcade (minigames), and things like Creative/Factions/Pixelmon and other things. But for now this was it.

          <BR/>

          By 10 January 2014, we had switched to Minecraft 1.7 which originally released at the end of october in 2013. Thanks to <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "archive.org",
          link: "https://web.archive.org/web/20140110020727/https://serverpact.com/voten.htm?server=8503"
        }}/> we know that in the first 10 days of January, OrbitMines had gathered 440 votes on <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "serverpact.com",
          link: "https://web.archive.org/web/20140110020727/https://serverpact.com/voten.htm?server=8503"
        }}/>. We can reasonably assume that we had at least a playerbase of 40 people throughout the whole day.

          <BR/>

          This influx of people came from the fact that we started advertising on serverpact.com. We at least did so in <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "June",
          link: "https://web.archive.org/web/20140625080501/http://www.serverpact.com/"
        }}/>, <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "July",
          link: "https://web.archive.org/web/20140701152614/http://www.serverpact.com/voten.htm?server=8503"
        }}/> and <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "September",
          link: "https://web.archive.org/web/20140922113915/http://www.serverpact.com/voten.htm?server=8503"
        }}/> 2014 according to archive.org, but there were many more weeks where we did this. Once we had done that a couple of times, the votes gathered for this minecraft server list made new people flow to OrbitMines organically.

          <BR/>

          <span className="bp5-text-muted" style={{fontSize: '0.7rem'}}>January 2014</span>
          <img style={{maxWidth: '100%'}} alt="2014-01-10_ServerBanner" src="/archive/the-orbitmines-minecraft-server/banners/2014-01-10_ServerBanner.jpg" />
          <span className="bp5-text-muted" style={{fontSize: '0.7rem'}}>February 2014</span>
          <img style={{maxWidth: '100%'}} alt="2014-02-08_ServerBanner" src="/archive/the-orbitmines-minecraft-server/banners/2014-02-08_ServerBanner.gif" />
          <span className="bp5-text-muted" style={{fontSize: '0.7rem'}}>March 2014</span>
          <img style={{maxWidth: '100%'}} alt="2014-03-17_ServerBanner" src="/archive/the-orbitmines-minecraft-server/banners/2014-03-17_ServerBanner2.0.gif" />

          <BR/>

          While doing this advertising we can see we reached at least <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "1000",
          link: "https://web.archive.org/web/20140922113915/http://www.serverpact.com/voten.htm?server=8503"
        }}/> votes a month, which is plausible considering my memory that we peaked at 60-70 players during that time. Throughout OrbitMines history we would swing often between having a concurrent 10 players online, and at our peak 60-70 players. I believe the record was in the 80's but no record of that number exists.
        </Section>
        <Section head="The 2014 Minecraft server">
          <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "Here on archive.org",
          link: "https://web.archive.org/web/20150220150911/http://www.orbitmines.com/"
        }}/> you can see our old website, which ran on <Reference is="reference" simple inline index={referenceCounter()} reference={{
          title: "Webs.com",
          link: "https://en.wikipedia.org/wiki/Webs_(web_hosting)"
        }}/>. Even though the styling there isn't preserved you can get a pretty clear picture of what happened over the course of 2014. There's a bunch of update messages there from July 11 2014 - June 2 2015. Let's walk together through 2014:
          <BR/>

          The server changed so much during 2014 that it's hard to paint the picture of just how much. Even some maps from this early period weren't preserved. We have however a fully functioning backup from 30 April 2014.

        </Section>
        <Section head="">

          We actually managed to convince the principal at my high school to broadcast the Minecraft server on the screens which usually displayed the schedule updates. After a few days I remember someone calling it the "Groene Hart Minecraft server", "Groene Hart" being the name of the high school. I don't remember exactly how long it was up there (It must've at least been a week or two), but we got many new players for that.
        </Section>
      </Arc>
      <Arc head="Arc:  (2014-2015)">
        Even though slowly starting in 2014, I started creating plugins for small features, a large shift change in managing the server happened in the last few weeks of 2014 en the first month of 2015. Coming up on the Minecraft 1.8 update, we planned to fully step away from any external plugins; all code created for OrbitMines specifically.

        <ImageGallery
          shuffle={42}
          caption="Builder World (2015-08-01)"
          images={[
            '2026-03-29_16.14.06.png',
            '2026-03-29_16.14.12.png',
            '2026-03-29_16.14.52.png',
            '2026-03-29_16.14.53.png',
            '2026-03-29_16.15.31.png',
            '2026-03-29_16.15.40.png',
            '2026-03-29_16.15.53.png',
            '2026-03-29_16.15.59.png',
            '2026-03-29_16.16.08.png',
            '2026-03-29_16.16.18.png',
            '2026-03-29_16.16.35.png',
            '2026-03-29_16.17.18.png',
            '2026-03-29_16.17.24.png',
            '2026-03-29_16.17.43.png',
            '2026-03-29_16.18.16.png',
            '2026-03-29_16.18.28.png',
            '2026-03-29_16.18.38.png',
            '2026-03-29_16.18.53.png',
            '2026-03-29_16.19.04.png',
            '2026-03-29_16.20.02.png',
            '2026-03-29_16.20.17.png',
            '2026-03-29_16.20.27.png',
            '2026-03-29_16.20.35.png',
            '2026-03-29_16.20.47.png',
            '2026-03-29_16.21.18.png',
            '2026-03-29_16.21.57.png',
            '2026-03-29_16.22.14.png',
            '2026-03-29_16.22.34.png',
            '2026-03-29_16.22.41.png',
          ].map(name => ({
            src: `/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_BuilderWorld/${name}`,
            alt: 'Builder World',
          }))}
        />
      </Arc>
      <Arc head="Arc:  (2016-2017)">

      </Arc>
      <Arc head="Arc:  (2017-2018)">

      </Arc>
      <Arc head="Arc: The last Chapter (2019)">

      </Arc>

      <Arc head="Wrapping up">

      </Arc>
    </Row>
  </Paper>
}

export default MinecraftArchive;

