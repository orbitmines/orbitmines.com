import { ORBITMINES_MINECRAFT_ARCHIVE } from "../references";
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
} from "../../lib/post/Post";
import {
  add,
  CachedVisualizationCanvas,
  CanvasContainer,
  Continuation,
  Line,
  Ray,
  RenderedRay,
  torus
} from "./2023.OnOrbits";
import {ON_ORBITS,_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../references";
import {PROFILES} from "../profiles/profiles";
import {ON_INTELLIGIBILITY} from "../references";
import {Highlight, Prism, themes} from "prism-react-renderer";
import {ImageGallery} from "../../lib/post/ImageGallery";

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
        <Col md={4} sm={12}><img className="orbitmines-staff-img" style={{maxWidth: '100%'}} alt="OrbitMines Staff" src="/archive/the-orbitmines-minecraft-server/orbitmines_staff.png" /></Col>
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

        </Section>

        <ImageGallery
          shuffle={13}
          caption="OrbitMines PvP Worlds (2013)"
          images={[
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_1-1/2026-03-29_17.17.39.jpg', alt: 'pvp 1-1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_1-2/2026-03-31_13.28.00.jpg', alt: 'pvp 1-2'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_1-3/2026-03-31_13.28.50.jpg', alt: 'pvp 1-3'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_1-4/2026-03-31_13.29.51.jpg', alt: 'pvp 1-4'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_1-5/2026-03-31_13.30.34.jpg', alt: 'pvp 1-5'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_1-6/2026-03-31_13.31.25.jpg', alt: 'pvp 1-6'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_1-7/2026-03-31_13.31.49.jpg', alt: 'pvp 1-7'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_1-8/2026-03-31_13.32.31.jpg', alt: 'pvp 1-8'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_2-1/2026-03-31_13.33.17.jpg', alt: 'pvp 2-1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_2-1/2026-03-31_13.33.33.jpg', alt: 'pvp 2-1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_2-2/2026-03-31_13.51.52.jpg', alt: 'pvp 2-2'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_2-3/2026-03-31_13.34.26.jpg', alt: 'pvp 2-3'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_2-4/2026-03-31_13.35.20.jpg', alt: 'pvp 2-4'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_2-5/2026-03-31_13.35.53.jpg', alt: 'pvp 2-5'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_2-6/2026-03-31_13.36.34.jpg', alt: 'pvp 2-6'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_2-7/2026-03-31_13.37.09.jpg', alt: 'pvp 2-7'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_3-1/2026-03-31_13.38.12.jpg', alt: 'pvp 3-1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_3-2/2026-03-31_13.38.57.jpg', alt: 'pvp 3-2'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_3-3/2026-03-31_13.39.42.jpg', alt: 'pvp 3-3'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_3-4/2026-03-31_13.40.22.jpg', alt: 'pvp 3-4'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_3-5/2026-03-31_13.40.50.jpg', alt: 'pvp 3-5'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_3-7/2026-03-31_13.41.56.jpg', alt: 'pvp 3-7'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_3-8/2026-03-31_13.42.36.jpg', alt: 'pvp 3-8'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_4-1/2026-03-31_13.43.28.jpg', alt: 'pvp 4-1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_4-2/2026-03-31_13.44.11.jpg', alt: 'pvp 4-2'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_4-3/2026-03-31_13.44.54.jpg', alt: 'pvp 4-3'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_4-4/2026-03-31_13.46.05.jpg', alt: 'pvp 4-4'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-25_pvp_4-5/2026-03-31_13.46.54.jpg', alt: 'pvp 4-5'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-27_pvp_PvPSelectEarthShip/2026-03-29_16.45.08.jpg', alt: 'PvPSelect EarthShip'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-27_pvp_PvPSelectEarthShip/2026-03-29_16.45.24.jpg', alt: 'PvPSelect EarthShip'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-27_pvp_PvPSelectMarsShip/2026-03-29_16.47.00.jpg', alt: 'PvPSelect MarsShip'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-02-27_pvp_PvPSelectVenusShip/2026-03-29_16.48.10.jpg', alt: 'PvPSelect VenusShip'},
          ]}
        />
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
          <span className="bp5-text-muted" style={{fontSize: '0.7rem'}}>2015</span>
          <img style={{maxWidth: '100%'}} alt="2015-ServerBanner" src="/archive/the-orbitmines-minecraft-server/banners/2015-ServerBanner.gif" />
          <span className="bp5-text-muted" style={{fontSize: '0.7rem'}}>2018</span>
          <img style={{maxWidth: '100%'}} alt="2018-ServerBanner" src="/archive/the-orbitmines-minecraft-server/banners/2018-ServerBanner.jpg" />

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
          }}/> you can see our old website, which ran on <Reference is="reference" simple inline
                                                                    index={referenceCounter()} reference={{
          title: "Webs.com",
          link: "https://en.wikipedia.org/wiki/Webs_(web_hosting)"
        }}/>. Even though the styling there isn't preserved you can get a pretty clear picture of what happened over the
          course of 2014. There's a bunch of update messages there from July 11 2014 - June 2 2015. Let's walk together
          through 2014:
          <BR/>

          The server changed so much during 2014 that it's hard to paint the picture of just how much. Even some maps
          from this early period weren't preserved. We have however a fully functioning backup from 30 April 2014.

          <BR/>

          Originally we had Prison, MiniGames and Survival.

          <BR/>

          Survival, which became the thing which ended up being the thing which ensured a stable playerbase. A
          playerbase who would occasionally together go to the other gamemodes like KitPvP and MiniGames.

          <BR/>

          Prison was something which was never fully fledged out in OrbitMines, certain players enjoyed our versions, I believe our 2nd version was the best, if only because it was the most complete version. We had 3 versions of prison throughout OrbitMines' lifetime and we planned on having a 4th at the end, which never came to be. In 2014, there were two of those versions. The first with the familiar mines laid out circularly, without much uniqueness to them. The 2nd was much more detailed, different builds for each mine, the plot system where people could grow rare crops:
        </Section>
        <ImageGallery
          shuffle={43}
          caption="Prison v1 & v2 (2014)"
          images={[
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PrisonServer/2026-03-29_15.50.43.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PrisonServer/2026-03-29_15.50.45.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PrisonServer/2026-03-29_15.50.58.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PrisonServer/2026-03-29_15.51.09.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PrisonServer/2026-03-29_15.51.23.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PrisonPvPArena/2026-03-29_15.49.09.jpg', alt: 'PrisonPvPArena'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PrisonWorld/2026-03-31_15.51.17.jpg', alt: 'PrisonWorld'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonPlots/2026-03-31_14.52.13.jpg', alt: 'PrisonPlots'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonPlots/2026-03-31_14.52.25.jpg', alt: 'PrisonPlots'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonPlots/2026-03-31_14.52.37.jpg', alt: 'PrisonPlots'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.53.38.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.53.45.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.54.03.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.54.47.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.54.50.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.55.21.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.55.42.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.55.59.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.56.27.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.56.49.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.57.10.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.57.25.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.57.31.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.57.57.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.58.10.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.58.21.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.58.39.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.58.46.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.59.04.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.59.19.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_14.59.38.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_15.00.05.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_15.00.30.jpg', alt: 'PrisonServer'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_PrisonServer/2026-03-31_15.00.50.jpg', alt: 'PrisonServer'},
          ]}
        />
        <Section>

          <BR/>

          MiniGames were originally all over the place, random plugins which I'd collected which all had their own
          system of operating, thrown together in something which worked for the time. We had Hide & Seek, OITC, Color Shuffle, Quake, SkyWars and Paint Ball.
        </Section>
        <ImageGallery
          shuffle={52}
          caption="MiniGames (2014)"
          images={[
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_H&SArena1/2026-03-31_15.38.42.jpg', alt: 'H&S Arena 1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_HideandSeekArena1/2026-03-31_15.44.13.jpg', alt: 'Hide and Seek Arena 1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_HideandSeekArena2/2026-03-31_15.45.56.jpg', alt: 'Hide and Seek Arena 2'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_HideandSeekArena3/2026-03-31_15.44.50.jpg', alt: 'Hide and Seek Arena 3'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_HideAndSeekArena4/2026-03-31_15.27.00.jpg', alt: 'Hide and Seek Arena 4'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_HideandSeekArena5/2026-03-31_15.45.30.jpg', alt: 'Hide and Seek Arena 5'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_HideAndSeekArena6/2026-03-31_15.26.16.jpg', alt: 'Hide and Seek Arena 6'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_HideAndSeekArena7/2026-03-31_15.27.31.jpg', alt: 'Hide and Seek Arena 7'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_OITCArena1/2026-03-31_15.49.54.jpg', alt: 'OITC Arena 1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PaintBallArena1/2026-03-31_15.35.24.jpg', alt: 'PaintBall Arena 1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PaintBallArena2/2026-03-31_15.35.50.jpg', alt: 'PaintBall Arena 2'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PaintBallArena3/2026-03-31_15.25.36.jpg', alt: 'PaintBall Arena 3'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PaintBallArena4/2026-03-31_15.36.17.jpg', alt: 'PaintBall Arena 4'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_PaintBallArena5/2026-03-31_15.34.41.jpg', alt: 'PaintBall Arena 5'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_SkyWarsLobby/2026-03-31_15.33.51.jpg', alt: 'SkyWars Lobby'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_SkyWarsMap1/2026-03-31_15.30.43.jpg', alt: 'SkyWars Map 1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_SkyWarsMap1/2026-03-31_15.30.53.jpg', alt: 'SkyWars Map 1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_SkyWarsMap1/2026-03-31_15.31.08.jpg', alt: 'SkyWars Map 1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_SkyWarsMap1/2026-03-31_15.31.20.jpg', alt: 'SkyWars Map 1'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_SkyWarsMap2/2026-03-31_15.49.12.jpg', alt: 'SkyWars Map 2'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_MiniGames/2026-03-31_15.39.37.jpg', alt: 'MiniGames'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_MiniGames/2026-03-31_15.40.03.jpg', alt: 'MiniGames'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_MiniGames/2026-03-31_15.40.15.jpg', alt: 'MiniGames'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_MiniGames/2026-03-31_15.40.28.jpg', alt: 'MiniGames'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_MiniGames/2026-03-31_15.40.45.jpg', alt: 'MiniGames'},
          ]}
        />
        <Section>

          <BR/>

          By February we had added the first versions of Creative, SkyBlock and KitPvP. We iterated fairly quickly
          through KitPvP maps. One of which didn't survive the backups. KitPvP quickly became one of our most beloved games, and I personally found working on the most fun thing; designing the kits, initially scouring <Reference is="reference" simple inline index={referenceCounter()} reference={{ title: "Spigot",link: "https://www.spigotmc.org/members/fadidev.49372/" }}/> for plugins which added certain abilities to items. Later we would expand this arsenal of kit abilities much further with our own plugin.

          <BR/>
        </Section>
        <ImageGallery
          shuffle={16}
          caption="KitPvP (2014)"
          images={[
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_KitPvP/2026-03-31_15.28.45.jpg', alt: 'KitPvP'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_KitPvP/2026-03-31_15.28.54.jpg', alt: 'KitPvP'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_KitPvP/2026-03-31_15.29.11.jpg', alt: 'KitPvP'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_KitPvP/2026-03-31_15.29.32.jpg', alt: 'KitPvP'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_KitPvP/2026-03-31_15.29.38.jpg', alt: 'KitPvP'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_KitPvP/2026-03-31_15.30.01.jpg', alt: 'KitPvP'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014_KitPvPMap/2026-03-29_15.55.51.jpg', alt: 'KitPvP Map'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014_KitPvPMap/2026-03-29_15.56.02.jpg', alt: 'KitPvP Map'},
            {src: '/archive/the-orbitmines-minecraft-server/screenshots/2014_KitPvPMap/2026-03-29_15.56.23.jpg', alt: 'KitPvP Map'},
          ]}
        />
        <Section>

          <BR/>

          We actually managed to convince the principal at my high school to broadcast the Minecraft server on the
          screens which usually displayed the schedule updates. After a few days I remember someone calling it the
          "Groene Hart Minecraft server", "Groene Hart" being the name of the high school. I don't remember exactly how long it was up there (It must've at least been a week or two), but we got many new players for that. Nor do I remember exactly when this was, it must've been around March; there doesn't exist a backup of the what it looked like on the website. (I made and sent it using school equipment at the time). But it's a fun story nonetheless.

          <BR/>

          Around April we also introduced Pixelmon & Factions, the gamemodes didn't really take off for us, Survival was much more popular.

          <BR/>

          Around May we released the first trailer we made for OrbitMines. I remember having to use my brother's PC for this, since mine wasn't powerful enough for recording at the time. With it, you get some additional feeling of what it was like then, but it's staggering just how much churning had already happened by that time.

          <BR/>

          <iframe width="560" height="315" src="https://www.youtube.com/embed/1jVDb_Uw6qg?si=aH5zKfSgR_awCOdt"
                  title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen style={{maxWidth: '100%'}}></iframe>
        </Section>
      </Arc>
      <Arc head="Arc: Programming (2014-2015)">
        <Section>
          Then came the phase of OrbitMines where I started to program plugins for the server myself, being restricted
          by existing plugins was no longer manageable. So I slowly learned how to program plugins over the course of
          2014, and the results of that are mostly seen at the end of 2014 and beginning of 2015. Which also coincides
          with a remarkable uptick in server quality...

          <BR/>

          During September 2014, we rereleased MiniGames. And then again a rerelease in October as I wasn't happy with
          its current state. Though no backup exists for those variants specifically, they were relatively close to the
          2015 version.
        </Section>
        <ImageGallery
          shuffle={18}
          caption="MiniGames (2015)"
          images={[
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_SurvivalGamesLobby1/2026-03-31_14.32.06.jpg',
              alt: 'Survival Games Lobby'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-10_MiniGamesLobby/2026-03-31_14.24.33.jpg',
              alt: 'MiniGames Lobby'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_AbraxParkSG/2026-03-31_14.22.05.jpg',
              alt: 'AbraxPark SG'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Breeze_Island2/2026-03-31_14.20.30.jpg',
              alt: 'Breeze Island 2'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Candy/2026-03-31_14.15.52.jpg',
              alt: 'Candy'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Citadel/2026-03-31_14.15.14.jpg',
              alt: 'Citadel'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Estyr/2026-03-31_14.19.27.jpg',
              alt: 'Estyr'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_HerobrinesArena/2026-03-29_16.38.30.jpg',
              alt: 'Herobrines Arena'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_LavaIsland/2026-03-29_16.40.11.jpg',
              alt: 'Lava Island'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Mesa/2026-03-31_14.14.37.jpg',
              alt: 'Mesa'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_MiniGamesLobby/2026-03-31_14.23.46.jpg',
              alt: 'MiniGames Lobby'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Rise_of_the_Orient/2026-03-31_14.18.18.jpg',
              alt: 'Rise of the Orient'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Snowy/2026-03-31_14.13.50.jpg',
              alt: 'Snowy'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_TheNetherlands/2026-03-29_16.39.26.jpg',
              alt: 'The Netherlands'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Transparent/2026-03-31_14.12.52.jpg',
              alt: 'Transparent'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-07-29_Village/2026-03-29_16.40.51.jpg',
              alt: 'Village'
            },
          ]}
        />
        <Section>

          <BR/>

          After which our 3rd version of Prison in a year was released in November. It took some time to finalize it,
          but over those few months bleeding into 2015 Prison got its final update:

          <BR/>

        </Section>
        <ImageGallery
          shuffle={18}
          caption="Prison v3 (2015)"
          images={[
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_Prison/2026-03-29_16.26.56.jpg',
              alt: 'Prison'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_Prison/2026-03-29_16.29.33.jpg',
              alt: 'Prison'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_PrisonLobby/2026-03-29_16.37.32.jpg',
              alt: 'Prison Lobby'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_PrisonWorld/2026-03-29_16.35.41.jpg',
              alt: 'Prison World'
            },
          ]}
        />
        <Section>

          <BR/>

          As you can see 2014 was full of churning existing ideas and recreating them in new forms. This would persist
          throughout the entirety of OrbitMines' lifetime, never quite settling on a particular version of something.

          <BR/>

          So it was for our legacy logo which got revised a few years later.

          <BR/>

          Even though slowly starting in 2014, I started creating plugins for small features, a large shift change in
          managing the server happened in the last few weeks of 2014 en the first month of 2015. Coming up on the
          Minecraft 1.8 update, we planned to fully step away from any external plugins; all code created for OrbitMines
          specifically. Eventually 6 February 2015 was the date of that release.

          <BR/>

          That immense update came with our most signature lobby we have had over our lifetime, our Hub. The first image
          here is that Hub, the others are other hubs throughout 2014-2015:
        </Section>
        <ImageGallery
          shuffle={20}
          caption="Hubs (2014-2015)"
          images={[
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_Hub/2026-03-31_15.32.02.jpg',
              alt: 'Hub (2014-04)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-04-30_OrbitMinesHub/2026-03-31_15.37.48.jpg',
              alt: 'OrbitMines Hub (2014-04)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-06-30_OrbitMInesHub/2026-03-31_15.17.06.jpg',
              alt: 'OrbitMines Hub (2014-06)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-10-09_OrbitMinesHub/2026-03-31_15.08.49.jpg',
              alt: 'OrbitMines Hub (2014-10)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2014-10-18_OrbitMinesHub_1Year/2026-03-31_15.07.45.jpg',
              alt: 'OrbitMines Hub 1 Year (2014-10)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_Hub/2026-03-31_14.38.26.jpg',
              alt: 'Hub (2015-02)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-02-06_OrbitMinesHub/2026-03-31_14.45.12.jpg',
              alt: 'OrbitMines Hub (2015-02)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_Hub/2026-03-29_16.23.44.jpg',
              alt: 'Hub (2015-08)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_Hub/2026-03-29_16.24.06.jpg',
              alt: 'Hub (2015-08)'
            },
            {
              src: '/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_Hub/2026-03-29_16.24.24.jpg',
              alt: 'Hub (2015-08)'
            },
          ]}
        />
        <Section>
          All our staff over the years spend a lot of their time in the Hub, mostly because of the fact that we had
          configured their build worlds there: Every design for a new gamemode, every SkyWars cage and pretty much every
          build originated there. Including many projects which never came to full fruition.
        </Section>
        <ImageGallery
          shuffle={42}
          caption="Builder World (2015-08-01)"
          images={[
            '2026-03-29_16.14.06.jpg',
            '2026-03-29_16.14.12.jpg',
            '2026-03-29_16.14.52.jpg',
            '2026-03-29_16.14.53.jpg',
            '2026-03-29_16.15.31.jpg',
            '2026-03-29_16.15.40.jpg',
            '2026-03-29_16.15.53.jpg',
            '2026-03-29_16.15.59.jpg',
            '2026-03-29_16.16.08.jpg',
            '2026-03-29_16.16.18.jpg',
            '2026-03-29_16.16.35.jpg',
            '2026-03-29_16.17.18.jpg',
            '2026-03-29_16.17.24.jpg',
            '2026-03-29_16.17.43.jpg',
            '2026-03-29_16.18.16.jpg',
            '2026-03-29_16.18.28.jpg',
            '2026-03-29_16.18.38.jpg',
            '2026-03-29_16.18.53.jpg',
            '2026-03-29_16.19.04.jpg',
            '2026-03-29_16.20.02.jpg',
            '2026-03-29_16.20.17.jpg',
            '2026-03-29_16.20.27.jpg',
            '2026-03-29_16.20.35.jpg',
            '2026-03-29_16.20.47.jpg',
            '2026-03-29_16.21.18.jpg',
            '2026-03-29_16.21.57.jpg',
            '2026-03-29_16.22.14.jpg',
            '2026-03-29_16.22.34.jpg',
            '2026-03-29_16.22.41.jpg',
          ].map(name => ({
            src: `/archive/the-orbitmines-minecraft-server/screenshots/2015-08-01_BuilderWorld/${name}`,
            alt: 'Builder World',
          }))}
        />
       <Section>
         Towards the end of the year we made our second trailer, which did really well and showcases the server in its
         2015 September-form quite perfectly:

         <BR/>

         <iframe width="560" height="315" src="https://www.youtube.com/embed/j3ginrMO6p8?si=IHfShKC1N5bI-uye"
                 title="YouTube video player" frameBorder="0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                 referrerPolicy="strict-origin-when-cross-origin"
                 allowFullScreen style={{maxWidth: '100%'}}></iframe>
       </Section>
      </Arc>
      <Arc head="Arc: Stability (2016-2017)">
        After this period the server became quite stable. There were times where I worked less on the server, which were
        times where the playercount slowly dropped, and there were times where I was active again.
        <BR/>
        Examples of what happened during this period was switching to Discord instead of Skype, creating our signature
        Discord-Minecraft chat bridge which added much to the community.
        <BR/>
        During this period we tried to bring back the Fractals of the Galaxy (FoG) gamemode, which is what we renamed
        OrbitMines PvP to. Unfortunately backups from this period were not recoverable, but we do have a small video of
        what those worlds looked like:
        <BR/>

        <iframe width="560" height="315" src="https://www.youtube.com/embed/-kR-AFvjlYw?si=S69g5-RZvOspIg0C"
                title="YouTube video player" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen style={{maxWidth: '100%'}}></iframe>

        <BR/>
        I tried my hand and making plugins to sell on <Reference is="reference" simple inline index={referenceCounter()}
                                                                 reference={{
                                                                   title: "Spigot",
                                                                   link: "https://www.spigotmc.org/members/fadidev.49372/"
                                                                 }}/>. Which we tested and had on display on the server.
        One was a popular gamemode Spleef, the other was a version of <Reference is="reference" simple inline
                                                                                 index={referenceCounter()} reference={{
        title: "Splatoon",
        link: "https://en.wikipedia.org/wiki/Splatoon"
      }}/> in Minecraft. I also made a fairly popular free plugin called <Reference is="reference" simple inline
                                                                                    index={referenceCounter()}
                                                                                    reference={{
                                                                                      title: "BungeeMSG",
                                                                                      link: "https://www.spigotmc.org/resources/bungeemsg.4512/"
                                                                                    }}/> during this time.
      </Arc>
      <Arc head="Arc: The last Chapter (2018-2019)">
        <Section>
          After a long time of inactivity it was high time to bring the server back; at least it would last for a few
          months longer. Together with 2 other developers who were community members, we started to rewrite the entirety
          of the source code. Initially just bringing back Survival, and then KitPvP. Our discord server grew to a number of 600 players during this period as an indication of scale.

          <BR/>

          A new chapter needed a new logo, so I set out to find someone who could make them for me. Though I don't know the name of the person who did the original logo (since Skype erased chat history at some point) which was made in 2015:

          <img alt="Legacy Logo" src="/archive/the-orbitmines-minecraft-server/logo/legacy.png" style={{maxWidth: '100%'}}/>

          The new logos were made for for the server itself as for the gamemodes we planned on remaking. By someone named Jess/Genny (I couldn't find a link to her current art profile).
        </Section>
        <div className="bp5-text-muted" style={{textAlign: 'center', fontSize: '0.7rem'}}>Server Icons, Names & Logo</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center', padding: '8px 0'}}>
          {[
            {src: '/logo.png', alt: 'Logo'},
            {src: '/archive/the-orbitmines-minecraft-server/server-icons/fog.png', alt: 'Server Icon - Fog'},
            {src: '/archive/the-orbitmines-minecraft-server/server-icons/fog 2.png', alt: 'Server Icon - Fog 2'},
            {src: '/archive/the-orbitmines-minecraft-server/server-icons/creative.png', alt: 'Server Icon - Creative'},
            {src: '/archive/the-orbitmines-minecraft-server/server-icons/kitpvp.png', alt: 'Server Icon - KitPvP'},
            {src: '/archive/the-orbitmines-minecraft-server/server-icons/minigames.png', alt: 'Server Icon - MiniGames'},
            {src: '/archive/the-orbitmines-minecraft-server/server-icons/prison.png', alt: 'Server Icon - Prison'},
            {src: '/archive/the-orbitmines-minecraft-server/server-icons/skyblock.png', alt: 'Server Icon - SkyBlock'},
            {src: '/archive/the-orbitmines-minecraft-server/server-icons/survival.png', alt: 'Server Icon - Survival'},
            {src: '/archive/the-orbitmines-minecraft-server/server-names/fog.png', alt: 'Server Name - Fog'},
            {src: '/archive/the-orbitmines-minecraft-server/server-names/creative.png', alt: 'Server Name - Creative'},
            {src: '/archive/the-orbitmines-minecraft-server/server-names/kitpvp.png', alt: 'Server Name - KitPvP'},
            {src: '/archive/the-orbitmines-minecraft-server/server-names/minigames.png', alt: 'Server Name - MiniGames'},
            {src: '/archive/the-orbitmines-minecraft-server/server-names/prison.png', alt: 'Server Name - Prison'},
            {src: '/archive/the-orbitmines-minecraft-server/server-names/skyblock.png', alt: 'Server Name - SkyBlock'},
            {src: '/archive/the-orbitmines-minecraft-server/server-names/survival.png', alt: 'Server Name - Survival'},
          ].map((img, i) => (
            <img key={i} src={img.src} alt={img.alt} style={{maxHeight: 80, objectFit: 'contain'}} />
          ))}
        </div>
        <Section>
          New plugins, new logos and also new lobbies:

          <BR/>

          <iframe width="560" height="315" src="https://www.youtube.com/embed/xr8CpLhICkk?si=UE2pr5FdigurUow0"
                  title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen style={{maxWidth: '100%'}}></iframe>

          <BR/>

          The relaunch of OrbitMines was highly anticipated, we had over 30 people ready at its release to join. We
          hyped up the release with constant teasers, one of which was another 'trailer' of our history:

          <BR/>

          <iframe width="560" height="315" src="https://www.youtube.com/embed/jIi7L9o7MRk?si=_4-3v65v_2e_xlJI"
                  title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen style={{maxWidth: '100%'}}></iframe>

          <BR/>

          Then, of course, the release went completely bad, we were one of the first servers to be on Minecraft 1.13 just 4 days after its release (22 July 2018)
          thanks to us setting up a custom Minecraft server runnable which worked for 1.13. And this caused some issues
          which we needed an extra day to resolve. Luckily all those players were patient with us, and were right back
          again the next day for the actual release!

          <BR/>

          We were growing fast again, like back in 2014, just with a minimal set of gamemodes with a steady playerbase.

          <BR/>

          We announced KitPvP re-release again as the 5th anniversary of OrbitMines neared in 2018.

          <BR/>

          Then, unfortunately, after nearly a year or OrbitMines' rebirth. Came the unfortunate news. Minecraft 1.14 had major changes in the chunk system, which made lag unbearable, simultaneously we had some internal issues in the staff team for the first time in OrbitMines' lifetime.

          <BR/>

          Whatever it was, I felt that the chapter of OrbitMines - Minecraft -, was closing. And so it was on 11 June 2019 that I made the terminal decision to close the server:

          <img alt="Terminal discord announcement message" src="/archive/the-orbitmines-minecraft-server/2019_06_11_discord_announcement.png" style={{maxWidth: '100%'}} />
        </Section>
      </Arc>

      <Arc head="Wrapping up">
        It was the end. Throughout most of my teenage years OrbitMines had been THE thing. In spite of it being hard to say goodbye to the server, I felt for the first time that I might turn my eye to a new project. What that project was, I knew not, only tiny fragments of an idea were there since 2017. Which would later flower to the projects OrbitMines currently associates itself with.

        <BR/>

        This is what I want to dedicate this last section to: That while I deeply value OrbitMines Minecraft. (As I hope to demonstrate by the effort put into the archival version.) I want to stress the importance I assign to decision to close down the server; My current projects would not have gotten the time of day if I did not.

        <BR/>

        I hope to once again return to game design: Those fragments became a dream which became a project. A project to turn creative pursuits into a videogame. Whether it is engineering, science or education. That is now OrbitMines' goal; I dream of a world where interfaces and games merge together: where everyone collaboratively plays a videogame and in doing so is contributing to the knowledge of the world.

        <BR/>

        But how to bring about such a future? That is the central question for OrbitMines.

        <BR/>
        Join our new <Reference is="reference" simple inline index={referenceCounter()} reference={{
        title: <span><CustomIcon icon={ORGANIZATIONS.discord.key} size={20}/> Discord Server</span>,
        link: "https://discord.orbitmines.com"
      }}/> for updates and discussion on this project.

      </Arc>
    </Row>
  </Paper>
}

export default MinecraftArchive;

