import React from 'react';
import JetBrainsMono from "../../lib/layout/font/fonts/JetBrainsMono/JetBrainsMono";
import ORGANIZATIONS, {Content, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {useNavigate} from "react-router-dom";
import Paper, {PaperProps} from "../../lib/paper/Paper";
import Reference, {useCounter} from "../../lib/paper/layout/Reference";
import {PROFILES} from "../../profiles/profiles";
import {renderable} from "../../lib/typescript/React";
import Section from '../../lib/paper/layout/Section';
import Arc from '../../lib/paper/layout/Arc';
import BR from "../../lib/paper/layout/BR";
import {Row} from "../../lib/layout/flexbox";
import Link from "../../lib/paper/layout/Link";
import REFERENCES from "../../profiles/FadiShawki/FadiShawki";
import BlueprintIcons from "../../lib/layout/font/fonts/blueprintjs/BlueprintIcons";

export const _2024_02_ORBITMINES_AS_A_GAME_PROJECT: Content = {
  reference: {
    title: "OrbitMines as a Game Project",
    subtitle: "A comprehensive guide on how to be frustrated with pixels. An open call for funding, collaboration or anyone curious to learn more.",
    draft: true,
    link: 'https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project',
    year: "2024",
    date: "2024-02-22",
    external: {
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => [
        ORGANIZATIONS.github.key,
        ORGANIZATIONS.twitter.key,
        ORGANIZATIONS.discord.key,
        ORGANIZATIONS.instagram.key,
        ORGANIZATIONS.linkedin.key,
        ORGANIZATIONS.mastodon.key,
        ORGANIZATIONS.orcid.key,
      ].includes(profile.organization.key))
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
      fonts: [JetBrainsMono, BlueprintIcons],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Paper
    {...paper}
  >
    <Arc head="Introduction">
      I'm finding myself having to write something along these lines more often recently, so I'm not even sure what a thing like this should be called. Perhaps this is a comprehensive guide on how to be frustrated with pixels. Containing a bit of personal history, a bit of future projections and too many vague ideas which need a practical handle - Ah, that'll be the future projection part.

      <BR/><BR/>

      Perhaps this should make communicating these things easier by just being able to share a link. An online copy of this can be found <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'here', link: 'https://orbitmines.com/archive/2024-02-orbitmines-as-a-game-project'}} />.

      <BR/><BR/>

      As a follow up of a recent <Reference is="reference" simple inline index={referenceCounter()} reference={{title: 'post', link: 'https://www.linkedin.com/posts/fadishawki_lookingforwork-looking-funding-activity-7162063253718691840-sf38'}} />, this is a letter I've sent to a plentiful of people, which outlines the category of project OrbitMines will be. Please feel to share this with anyone who could help me make these things happen. As with anything with me, this thing is so flexibly general that it should survive any sudden shift in direction I occasionally tend to make.

      <BR/><BR/>

      <Section sub="">
        <span style={{textAlign: 'left', minWidth: '100%'}}>Probably more accurately, this is <b>OrbitMines as a <span className="bp5-text-muted">(Programming) Language, Version Control, Compiler, Browser, Integrated Development Environment (IDE), Operating System, ..., Game</span> Project</b>. Though "OrbitMines as a Game Project" is probably more provocative and more accurately represents the most important part of this project: its (visual) interface.</span>

        <BR/><BR/>

        The very example that all those things are so isolated from each-other as concepts itself is shows the entirety of this complex problem. But for a lot of good practical reasons, it is quite understandable that such a thing happens. Simplifying, - compression -, is hard.

        <BR/><BR/>

        <span style={{textAlign: 'left', minWidth: '100%'}}>
          A broader interpretation of this approach is probably more along the lines of instead of attacking any single problem directly, or to solve any definite problem. To instead assume we can't actually generally do that, and to find tools as generally as possible that can be applied as conveniently as possible. I don't care how its details work, what can you <b>do with it</b>? But not only that, it needs to be satisfying to learn, to explore. The only example I know of which has achieved this for a general audience are video games. Specifically for this category of problem, sandbox video games.
        </span>

        <BR/><BR/>

        Ok, enough abstract vagueness without content, onward! ... to less abstract vagueness:

        <BR/><BR/>

        This problem, though filled with incredible technical complexity, in its essence is a visual design problem: What should it feel like? What should it look like?

        <BR/><BR/>

        That makes our lives in a certain respect much easier. Because it's definitely not remotely like anything I've seen before.
      </Section>
    </Arc>
  </Paper>
}

export default _2024_02_OrbitMines_as_a_Game_Project;