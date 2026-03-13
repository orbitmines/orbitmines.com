import React from 'react';
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Post, {
  Arc,
  Author, BlueprintIcons16, BlueprintIcons20,
  BR,
  Col,
  CustomIcon, JetBrainsMono,
  PaperProps,
  Reference,
  Row,
  Section,
  useCounter
} from "../../lib/post/Post";
import {PROFILES} from "../profiles/profiles";
import WEBGL from "three/examples/jsm/capabilities/WebGL";
import {CanvasContainer} from "./2023.OnOrbits";

export const _2024_02_ORBITMINES_AS_A_GAME_PROJECT: Content = {
  reference: {
    title: "OrbitMines as a Game Project",
    subtitle: "A comprehensive guide on how to be frustrated with pixels. An open call for funding, collaboration or anyone curious to learn more.",
    draft: false,
    link: 'https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project',
    year: "2024",
    date: "2024-02-22",
    external: {
      discord: {serverId: '1055502602365845534', channelId: '1194769877542649938', link: () => "https://discord.com/channels/1055502602365845534/1194769877542649938/1194769877542649938"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "February, 2024"
}

const _2024_02_OrbitMines_as_a_Game_Project = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ..._2024_02_ORBITMINES_AS_A_GAME_PROJECT.reference,
    subtitle: "A comprehensive guide on how to be frustrated with pixels. An open call for funding, collaboration or anyone curious to learn more.",
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Post
    {...paper}
  >
    <Arc head="Introduction">
      I'm finding myself having to write something along these lines more often recently, so I'm not even sure what a thing like this should be called. Perhaps this is a comprehensive guide on how to be frustrated with pixels. Containing a bit of personal history, a bit of future projections and too many vague ideas which need a practical handle - Ah, that'll be the future projection part.

      <BR/><BR/>

      Perhaps this should make communicating these things easier by just being able to share a link. An online copy of this can be found <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'here', link: 'https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project'}} />.

      <BR/><BR/>

      As a follow up of this <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'post', link: 'https://www.linkedin.com/posts/fadishawki_lookingforwork-looking-funding-activity-7162063253718691840-sf38'}} /> and this <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'other one', link: 'https://www.instagram.com/p/C23KZXOt0Xr/'}} />, this is a letter I've sent to a plentiful of people, which outlines the category of project OrbitMines will be. Please feel to share this with anyone who could help me make these things happen. As with anything with me, this thing is so flexibly general that it should survive any sudden shift in direction I occasionally tend to make.

      <BR/><BR/>

      <Section sub="">
        <span style={{textAlign: 'left', minWidth: '100%'}}>Probably more accurately, this is <b>OrbitMines as a <span className="bp5-text-muted">(Programming) Language, Version Control, Compiler, Browser, Integrated Development Environment (IDE), Operating System, ..., Game</span> Project</b>. Though "OrbitMines as a Game Project" is probably more provocative and more accurately represents the most important part of this project: its (visual) interface.</span>

        <BR/><BR/>

        The very example that all those things are so isolated from each-other as concepts itself shows the entirety of this complex problem. But for a lot of good practical reasons, it is quite understandable that such a thing happens. Simplifying, - compression -, is hard. Exploring, - finding new things -, is hard.

        <BR/><BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>
          A broader interpretation of this approach is probably more along the lines of instead of attacking any single problem directly, or to solve any definite problem. To instead assume we can't actually generally do that, and to find tools as general as possible that can be applied as conveniently as possible. I don't care how its details work, what can you <b>do with it</b>? But not only that, it needs to be satisfying to learn, to explore. The only example I know of which has achieved this for a general audience are video games. Specifically for this category of problem, sandbox video games.
        </span>

        <BR/><BR/>

        Ok, enough abstract vagueness without content, onward! ... to less abstract vagueness:

        <BR/><BR/>

        This problem, though filled with incredible technical complexity, in its essence is a visual design problem: What should it feel like? What should it look like?

        <BR/><BR/>

        That makes our lives in a certain respect much easier. Because it's definitely not remotely like anything I've seen before.
      </Section>

      <CanvasContainer style={{height: '140px'}}>
        <canvas
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/4_bits_grid.png')`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </CanvasContainer>
    </Arc>
    <Arc head="Technical Complexity">
      Though all that might sound interesting, how do you *actually* make that happen? A question which has been digging at me for a long time.
      <BR/><BR/>

      This starts with a few complicated but simple ideas:

      <Section sub={
        <span className="child-px-2">
          See:
           <a href="https://github.com/orbitmines/orbitmines.com/issues/20" target="_blank"><CustomIcon
             icon={ORGANIZATIONS.github.key} size={20}/></a>
           <a href="https://discord.com/channels/1055502602365845534/1200246205473619968" target="_blank"><CustomIcon
             icon={ORGANIZATIONS.discord.key} size={20}/></a>
           <span style={{fontStyle: 'italic'}}>Indexing existing Abstract Models (2024-2025?)</span>
        </span>
      }>
        - Whatever it is (programming) languages are currently doing, they will never get there: This will **never** be
        possible in *just* the textual interface any programmer is familiar with.
        <BR/><BR/>
        - For some reason, it's incredibly hard to apply the mode of thinking which allows for the creation in, ... of a
        programming language, to the interface in which one programs.
        <BR/><BR/>
        - It is incredibly hard to throw away all historical context and actually start from something **new**, while still having a practical handle on anything others have done before. Try doing that, while everyone is doing that.
      </Section>

      <Section sub={
        <span className="child-px-2">
          See:
           <a href="https://github.com/orbitmines/orbitmines.com/issues/15" target="_blank"><CustomIcon
             icon={ORGANIZATIONS.github.key} size={20}/></a>
           <a href="https://discord.com/channels/1055502602365845534/1194769877542649938" target="_blank"><CustomIcon
             icon={ORGANIZATIONS.discord.key} size={20}/></a>
           <span style={{fontStyle: 'italic'}}>OrbitMines as Game Project (2025/2026?)</span>
        </span>
      }>
        - Whatever this interface will look like, it necessitates conveniently being able to change **anything** about how it looks, ..., how it operates *from the interface itself*. This introduces a hard problem on the side of the implementer: How do you possibly account for that? Or perhaps: Why is that a problem in the first case?
        <BR/><BR/>
        - Whatever function it is that platforms and interfaces serve, they will probably converge to being more of a theme applied on a particular type of structure. Only as a supply of resources (access to certain kinds of information/compute) will they persist. They will not persist as separable interfaces.
        <BR/><BR/>
        - Whatever sets up this open world generation must rely on existing structure, information. You can set up something more random, sure. But the only possibility of some feedback on this generation must be some generalization of existing knowledge. Whatever (entropically relevant) information, structure, ..., items have been found.
        <BR/><BR/>
        - This means open world generation must support arbitrary information which will **not** be available in the design of this game/interface.
      </Section>

      <Section sub={
        <Row>
          <Col xs={12}>
            <span className="child-px-2">
              See:
               <a href="https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies" target="_blank"><img
                 key={ORGANIZATIONS.orbitmines_research.key} src={ORGANIZATIONS.orbitmines_research.assets.icon_png}
                 style={{maxWidth: '1rem', verticalAlign: 'middle'}}/></a>
               <a href="https://discord.com/channels/1055502602365845534/1190719376085766195"
                  target="_blank"><CustomIcon
                 icon={ORGANIZATIONS.discord.key} size={20}/></a>
               <span style={{fontStyle: 'italic'}}><Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'On Orbits, Equivalence and Inconsistencies', link: 'https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies'}} /></span>
            </span>
          </Col>
          <Col xs={12}>
            <span className="child-px-2">
              See:
               <a href="https://github.com/orbitmines/orbitmines.com/issues/19" target="_blank"><CustomIcon
                 icon={ORGANIZATIONS.github.key} size={20}/></a>
               <a href="https://discord.com/channels/1055502602365845534/1200225618164461639"
                  target="_blank"><CustomIcon
                 icon={ORGANIZATIONS.discord.key} size={20}/></a>
               <span style={{fontStyle: 'italic'}}>(Hypergraphic) Version Control System through Rays (2024)</span>
            </span>
          </Col>
          <Col xs={12}>
            <span className="child-px-2">
              See:
               <a href="https://github.com/orbitmines/orbitmines.com/issues/16" target="_blank"><CustomIcon
                 icon={ORGANIZATIONS.github.key} size={20}/></a>
               <a href="https://discord.com/channels/1055502602365845534/1200210127358267522" target="_blank"><CustomIcon
                 icon={ORGANIZATIONS.discord.key} size={20}/></a>
               <span style={{fontStyle: 'italic'}}>Rays to GPUs</span>
            </span>
          </Col>
        </Row>
      }>
        - You need to be able to deal in *questions* of different levels of abstraction, description, ..., scales, when
        each layer introduces arbitrary complexity. This is not simple scale invariance.
        <BR/><BR/>
        - Any scale, ..., any language will in some respect introduce this arbitrary complexity. The only way to
        properly deal with that is the possibility of exploration. You cannot have this without an open world generation
        aspect.
        <BR/><BR/>
        - Any translation between any layer necessarily contains something which *cannot* be translated.
        <BR/><BR/>
        - You will have to deal with being able to move in certain data structures for which there might not (yet) be a nice translation to something you can understand.
      </Section>

      <CanvasContainer style={{height: '150px'}}>
        <canvas
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/2_edge_3_fractal_equived_select_1.png')`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </CanvasContainer>
    </Arc>
    <Arc head="A quick step towards Design">
      Though I've not yet gone into a proper research trajectory towards designs. It will come down to generalizations of the patterns found in the following things:
      <BR/><BR/>
      - In broad terms how this game should initially feel: It looks like you're playing something like Minecraft. You might not even realize it can be used as a tool. Then suddenly comes the realization that it can be used to do/create *anything*.
      <BR/><BR/>
      - It should be seamless, you shouldn't even notice that certain things you're doing could be interpreted as science, ..., engineering. The moment you realize you can, you can tap into that more.
      <BR/><BR/>
      - The constraining aspects of the game are not necessarily item collection in the usual game sense: Certain kinds of copying are incredibly easy. The limiting factor is finding a particular kind of resource, or what it can be used for.
      <BR/><BR/>
      - There must be some sense of stability in the interface. Though many interesting things will probably be more visually unstable.
      <BR/><BR/>
      <span style={{textAlign: 'left', minWidth: '100%'}}>- Anything that's <span className="bp5-text-muted">generated, ..., created</span>, which is <span className="bp5-text-muted">accessible, not forgotten and understandable</span> can be visited as a location. This for example includes whatever intro-screen it is that the game has. It can be changed.</span>
      <BR/><BR/>
      <span style={{textAlign: 'left', minWidth: '100%'}}>- A big challenge is probably ignoring an existing generated world and instantiating new generation on that same location. <span className="bp5-text-muted">Superposed, portalled through, ..., forked.</span></span>
      <BR/><BR/>
      - There's something entirely problematic about certain types of convenient solutions. An example of this may be the interface that is the cursor on your computer screen you are familiar with. Though easy to generalize as an interface to any kind of website or application, it heavily steers towards a particular kind of interface which directly goes against what this project is trying to accomplish.
      <BR/>
      Similarly, there's something quite unsatisfying about the keyboard too, though it probably scales better. Its functionality is usually hidden and not easily visualized. It's even harder to ask the question of finding out what possible things you can do with it, let alone to adapt to it yourself: that's hard. A more general pattern along those lines is probably something like this: Once something seemingly convenient is found, it is seriously hard to explore and steer away from that.
      <BR/>
      Enter more interesting tactile interfaces.

      <CanvasContainer style={{height: '150px'}}>
        <canvas
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/2_horizontal_binary_loops.png')`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </CanvasContainer>
    </Arc>
    <Arc head="Something about me">
      Since the target audience for this one will probably be interested in me instead of thinking on these problems: This is making me wish I had already finished my archive project and could just point to <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'that', link: 'https://github.com/orbitmines/orbitmines.com/issues/18'}} />.
      <BR/>
      I recently was in a call with someone going over some of OrbitMines history so that makes this thing a little easier. Let me just list a bunch of tangents of which only the Minecraft server wasn't a complete disaster:
      <BR/>
      - 24 October 2011: I login to <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'DarkOrbit', link: 'https://en.wikipedia.org/wiki/DarkOrbit'}} /> for the first time (Don't remember how we found it).
      <BR/>
      - 31 January 2013: I buy <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Minecraft', link: 'https://www.minecraft.net/'}} /> after seeing <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'my brother', link: 'https://www.linkedin.com/in/benjamin-shawki/'}} /> play Minecraft (hunger/survival)games on <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'MCSG', link: 'https://mcgamer.net/games/mcsg/'}} /> for the first time.
      <BR/>
      - July?-October 2013: I try to figure out how to make a Minecraft server, inspired by <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'one I loved', link: 'https://torchcraft.nl/'}} />.
      <BR/>
      - September?-October 2013: While on the bicycle next to <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'my brother', link: 'https://www.linkedin.com/in/benjamin-shawki/'}} />, discussing whether MineOrbit or OrbitMines is the better name for the server. With the idea to make it like <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'DarkOrbit in Minecraft', link: 'https://www.youtube.com/watch?v=nI8c6yNnbbI'}} /> which we later (2017) dubbed as "Fractals of the Galaxy".
      <BR/>
      - 15 October 2013: orbitmines.com is registered.
      <BR/>
      - 15 October 2013 - 11 June 2019: Insert OrbitMines Minecraft history I want to <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'expand on later', link: 'https://github.com/orbitmines/orbitmines.com/issues/18'}} />. Including other Minecraft <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'disasters', link: 'https://www.spigotmc.org/resources/authors/fadidev.49372/'}} />. Even things along the lines of: Surely you would like to make a Minecraft plugin by decompiling <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Java', link: 'https://en.wikipedia.org/wiki/Java_(programming_language)'}} />/<Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Ruby', link: 'https://en.wikipedia.org/wiki/Ruby_(programming_language)'}} /> and recombining program <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'AST', link: 'https://en.wikipedia.org/wiki/Abstract_syntax_tree'}} />s.
      <BR/>
      - 16 October 2018: First exposed to <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'cellular automata', link: 'https://github.com/FadiShawki/Game_of_Life'}} /> as an exercise given to me by <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'a company', link: 'https://www.mobiel.nl/'}} /> I ended up working at.
      <BR/>
      - 2020: I stop attending <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Leiden University', link: 'https://en.wikipedia.org/wiki/Leiden_University'}} />. If you could call what I did there as attending in the first place. Perhaps more of an (immature) severe disinterest.
      <BR/>
      - 2018 - May 2022: I <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'do work for several companies and attempt to start up several doomed-to-failure project/companies with partners', link: 'https://www.linkedin.com/in/fadishawki/'}} />.
      <BR/>
      - 2021: <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Dune', link: 'https://en.wikipedia.org/wiki/Dune_(2021_film)'}} /> makes me interested to start reading.
      <BR/>
      - 2021-2022: I attempt writing compression algorithms with zero knowledge of established fields. That <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Hutter Prize', link: 'http://prize.hutter1.net/'}} /> sure looks interesting.
      <BR/>
      - December 2022: I try organizing a year of incredible confusions, reading, ..., listening. Which turned into a dabble too close to being a descent into uselessness. I compiled it into a confusing piece of philosophy if you're interested in that sort of thing: <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'On the Intelligibility of (dynamic) Systems and Conceptual Uncertainty', link: 'https://orbitmines.com/archive/on-intelligibility'}} />
      <BR/>
      - January - July 2023: Confusion turns to <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'more interesting confusion', link: 'https://twitter.com/_FadiShawki/status/1664387058721325056'}} />
      <BR/>
      - 26 June 2023: I get <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'a random notification', link: 'https://twitter.com/semf_nexus/status/1673300178986582025'}} /> of this little thing called <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'Society for Multidisciplinary and Fundamental Research (SEMF)', link: 'https://semf.org.es/'}} /> organizing a summer school a few weeks later. Where some of the most interesting people I've ever met seemed to be. And evidently a good place for my confusions.
      <BR/>
      - December 2023: Again the most interesting confusions of the year compiled in a writing: <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'On Orbits, Equivalence and Inconsistencies', link: 'https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies'}} />, this time in a more acceptable form (for now).
      <BR/><BR/><BR/><BR/><BR/>
      - 22 February 2024: And now we're here. I think I finally understand the quest that is this project which at its center must be the tool with which to find new quests.

      <CanvasContainer style={{height: '150px'}}>
        <canvas
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/2_double_expanded_continuation.png')`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </CanvasContainer>

      <Author {...PROFILES.fadi_shawki} filter={(profile) => PLATFORMS.includes(profile.organization.key)}/>
    </Arc>
  </Post>
}

export default _2024_02_OrbitMines_as_a_Game_Project;