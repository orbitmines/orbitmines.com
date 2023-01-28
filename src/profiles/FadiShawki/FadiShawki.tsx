import React, {ReactNode} from 'react';
import { Row } from '../../lib/layout/flexbox';
import fadishawki, {Socials} from "../../lib/profiles/fadishawki";
import {Col} from "../../lib/layout/flexbox";
import fadishawki_profile_picture from './fadishawki.profile-picture.png'
import Children from "../../lib/typescript/Children";
import classNames from "classnames";
import {Divider, H3, H4, Intent, Tag} from "@blueprintjs/core";
import {Reference, ReferenceProps} from "../../lib/pdf/paper/Paper";

enum Viewed {
  FOUND, IN_PROGRESS, VIEWED
}

export type Content = {
  status: Viewed,
  reference: ReferenceProps,
  archived?: boolean,
  found_at?: string,
  viewed_at?: string,
  description?: string
}

export type ContentCategory = {
  name: string,
  items: Content[]
}

export type Profile = {
  title: ReactNode,
  subtitle: ReactNode,
  profile_picture: string,
  socials: Socials,
  summary: ReactNode
} & {
  [name: string]: ContentCategory
}

export const DUNE = { reference: {
  title: 'Dune',
  author: 'Herbert, Frank',
  journal: 'Ace Books',
  year: '1965',
  link: "https://en.wikipedia.org/wiki/Dune_(novel)"
}, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2021" };
export const DUNE_MESSIAH = { reference: {
  title: 'Dune Messiah',
  author: 'Herbert, Frank',
  journal: 'Ace Books',
  year: '1969',
  link: "https://en.wikipedia.org/wiki/Dune_Messiah"
}, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2021" };
export const CHILDREN_OF_DUNE = { reference: {
  title: 'Children of Dune',
  author: 'Herbert, Frank',
  journal: 'Ace Books',
  year: '1976',
  link: "https://en.wikipedia.org/wiki/Children_of_Dune"
}, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2021" };
export const GOD_EMPEROR_OF_DUNE = { reference: {
  title: 'God Emperor of Dune',
  author: 'Herbert, Frank',
  journal: 'Ace Books',
  year: '1981',
  link: "https://en.wikipedia.org/wiki/God_Emperor_of_Dune"
}, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2022" };
export const HERETICS_OF_DUNE = { reference: {
  title: 'Heretics of Dune',
  author: 'Herbert, Frank',
  journal: 'Ace Books',
  year: '1984',
  link: "https://en.wikipedia.org/wiki/Heretics_of_Dune"
}, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2022" };
export const CHAPTERHOUSE_DUNE = { reference: {
  title: 'Chapterhouse: Dune',
  author: 'Herbert, Frank',
  journal: 'Ace Books',
  year: '1985',
  link: "https://en.wikipedia.org/wiki/Chapterhouse:_Dune"
}, status: Viewed.IN_PROGRESS, found_at: "2021", viewed_at: "2022 - " };

export const FLUID_CONCEPTS_AND_CREATIVE_ANALOGIES = { reference: {
  title: "Fluid concepts and creative analogies: Computer models of the fundamental mechanisms of thought",
  author: "Hofstadter, Douglas R",
  journal: "Basic books",
  year: "1995",
  link: "https://en.wikipedia.org/wiki/Fluid_Concepts_and_Creative_Analogies",
}, status: Viewed.VIEWED, found_at: "January, 2022", viewed_at: "January, 2022 - May, 2022" };

export const GODEL_ESCHER_BACH: Content = { reference: {
  title: "Gödel, escher, bach",
  author: "Hofstadter, Douglas R",
  journal: "New York: Basic books",
  year: "1979",
  link: "https://en.wikipedia.org/wiki/G%C3%B6del,_Escher,_Bach",
}, status: Viewed.IN_PROGRESS, found_at: "March, 2022", viewed_at: "March, 2022 - " };

export const QUANTUM_EINSTEIN_BOHR_AND_THE_GREAT_DEBATE_ABOUT_THE_NATURE_OF_REALITY: Content = { reference: {
  title: "Quantum: Einstein, Bohr and the great debate about the nature of reality",
  author: "Kumar, Manjit",
  journal: "Icon Books Ltd",
  year: "2008",
  link: "https://en.wikipedia.org/wiki/Quantum_(book)",
}, status: Viewed.VIEWED, found_at: "2022", viewed_at: "2022 - October, 2022" }

export const THE_ART_OF_WAR: Content = { reference: {
  title: "The Art of War / Sun Tzu",
  author: "Cleary, Thomas",
  journal: "Thomas Clearly translation. Shambhala Publications",
  year: "6th cent. B.C.",
  link: "https://en.wikipedia.org/wiki/Thomas_Cleary",
}, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "2022", archived: true }

export const _1984: Content = { reference: {
  title: "1984",
  author: "Orwell, George",
  journal: "Secker & Warburg",
  year: "1949",
  link: "https://en.wikipedia.org/wiki/Nineteen_Eighty-Four",
}, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2021" }

export const ANIMAL_FARM: Content = { reference: {
  title: "Animal Farm",
  author: "Orwell, George",
  journal: "Secker & Warburg",
  year: "1945",
  link: "https://en.wikipedia.org/wiki/Animal_Farm",
}, status: Viewed.IN_PROGRESS, found_at: "2021", viewed_at: "2021", archived: true }

export const THE_FUTURE_OF_HUMANITY: Content = { reference: {
  title: "The Future of Humanity: Terraforming Mars, Interstellar Travel, Immortality, and Our Destiny Beyond Earth",
  author: "Kaku, Michio",
  journal: "Doubleday",
  year: "2018",
  link: "https://en.wikipedia.org/wiki/The_Future_of_Humanity",
}, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November, 2022"  };

export const FOUNDATION: Content= { reference: {
  title: "Foundation",
  author: "Asimov, Isaac",
  journal: "Gnome Press",
  year: "1951",
  link: "https://en.wikipedia.org/wiki/Foundation_(Asimov_novel)",
}, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October, 2022"  };

export const SECOND_FOUNDATION: Content= { reference: {
  title: "Second Foundation",
  author: "Asimov, Isaac",
  journal: "Gnome Press",
  year: "1953",
  link: "https://en.wikipedia.org/wiki/Second_Foundation",
}, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October, 2022 - January, 2023"  };

export const FOUNDATION_AND_EMPIRE: Content = { reference: {
  title: "Foundation and Empire",
  author: "Asimov, Isaac",
  journal: "Gnome Press",
  year: "1952",
  link: "https://en.wikipedia.org/wiki/Foundation_and_Empire",
}, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "January, 2023"  };

export const THE_RISE_AND_FALL_OF_THE_THIRD_REICH: Content = { reference: {
  title: "The Rise and Fall of the Third Reich",
  author: "Shirer, William L",
  journal: "Simon & Schuster",
  year: "1960",
  link: "https://en.wikipedia.org/wiki/The_Rise_and_Fall_of_the_Third_Reich",
}, status: Viewed.IN_PROGRESS, found_at: "July, 2022", viewed_at: "September, 2022 - "  };

export const A_PROJECT_TO_FIND_THE_FUNDAMENTAL_THEORY_OF_PHYSICS: Content = { reference: {
  title: "A Project to Find the Fundamental Theory of Physics",
  author: "Wolfram, Stephen",
  journal: "Wolfram Media, Inc.",
  year: "2020",
  link: "https://www.wolframphysics.org/",
}, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "December, 2022 - "  };

export const COMBINATORS_A_CENTENNIAL_VIEW: Content = { reference: {
  title: "Combinators, A Centennial View",
  author: "Wolfram, Stephen",
  journal: "Wolfram Media, Inc.",
  year: "2021",
  link: "https://arxiv.org/pdf/2103.12811.pdf",
}, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December, 2022 - January, 2023"  };

export const BOOKS: ContentCategory = {
  name: 'Reading, Books',
  items: [
    // Science Fiction
    DUNE,
    DUNE_MESSIAH,
    CHILDREN_OF_DUNE,
    GOD_EMPEROR_OF_DUNE,
    HERETICS_OF_DUNE,
    CHAPTERHOUSE_DUNE,

    FOUNDATION,
    FOUNDATION_AND_EMPIRE,
    SECOND_FOUNDATION,

    // History
    THE_RISE_AND_FALL_OF_THE_THIRD_REICH,

    // Science-related books
    THE_FUTURE_OF_HUMANITY,
    FLUID_CONCEPTS_AND_CREATIVE_ANALOGIES,
    GODEL_ESCHER_BACH,
    QUANTUM_EINSTEIN_BOHR_AND_THE_GREAT_DEBATE_ABOUT_THE_NATURE_OF_REALITY,
    A_PROJECT_TO_FIND_THE_FUNDAMENTAL_THEORY_OF_PHYSICS,
    COMBINATORS_A_CENTENNIAL_VIEW,

    // Miscellaneous
    THE_ART_OF_WAR,
    _1984,
    ANIMAL_FARM,

  ]
};

export const SOFTWARE_DEVELOPER_AT_BREACHLOCK_INC: Content = { reference: {
  title: "Software Developer, BreachLock Inc.",
}, status: Viewed.VIEWED, viewed_at: "November, 2021 - May, 2022" };
export const CONTRACTOR_AT_MARTI_ORBAK_SOFTWARE: Content = { reference: {
  title: "Contractor, MartiOrbak Software",
}, status: Viewed.VIEWED, viewed_at: "November, 2020 - March 2021" };
export const BACKEND_DEVELOPER_AT_MOBIEL_NL: Content = { reference: {
  title: "Backend Developer, Mobiel.nl",
}, status: Viewed.VIEWED, viewed_at: "November, 2018 - August, 2019", description: "My first interaction working at a SME." };
export const FOUNDER_AT_ORBITMINES_MINECRAFT: Content = { reference: {
  title: "Founder, OrbitMines Minecraft",
}, status: Viewed.VIEWED, viewed_at: "October, 2013 - May, 2019", description: "I introduced myself to software engineering during this period by designing and maintaining my own Minecraft game server, which had a small community of concurrent players." };

export const HISTORY: ContentCategory = {
  name: 'History',
  items: [
    SOFTWARE_DEVELOPER_AT_BREACHLOCK_INC,
    CONTRACTOR_AT_MARTI_ORBAK_SOFTWARE,
    BACKEND_DEVELOPER_AT_MOBIEL_NL,
    FOUNDER_AT_ORBITMINES_MINECRAFT,
  ]
};

export const LEIDEN_UNIVERSITY: Content = { reference: {
  title: "(Unfinished) Computer Science (BSc), Leiden University",
}, status: Viewed.IN_PROGRESS, viewed_at: "September, 2019 - December, 2020", archived: true };

export const VWO: Content = { reference: {
  title: "VWO / Science & Engineering",
}, status: Viewed.VIEWED, viewed_at: "2012 - 2019" };

export const FORMAL_EDUCATION: ContentCategory = {
  name: 'Formal Education',
  items: [
    LEIDEN_UNIVERSITY,
    VWO,
  ]
};

export const JAVA: Content = { reference: { title: "Java", link: "https://en.wikipedia.org/wiki/Java_(programming_language)" }, status: Viewed.VIEWED, archived: true };
export const RUBY_ON_RAILS: Content = { reference: { title: "Ruby (on Rails)", link: "https://en.wikipedia.org/wiki/Ruby_on_Rails" }, status: Viewed.VIEWED, archived: true };
export const C_SHARP: Content = { reference: { title: "C#", link: "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)" }, status: Viewed.VIEWED, archived: true };
export const DOT_NET: Content = { reference: { title: ".NET", link: "https://en.wikipedia.org/wiki/.NET" }, status: Viewed.VIEWED, archived: true };
export const JAVASCRIPT: Content = { reference: { title: "JavaScript", link: "https://en.wikipedia.org/wiki/JavaScript" }, status: Viewed.VIEWED };
export const CSS: Content = { reference: { title: "CSS", link: "https://en.wikipedia.org/wiki/CSS" }, status: Viewed.VIEWED };
export const SASS: Content = { reference: { title: "SASS", link: "https://en.wikipedia.org/wiki/Sass_(stylesheet_language)" }, status: Viewed.VIEWED };
export const HTML: Content = { reference: { title: "HTML", link: "https://en.wikipedia.org/wiki/HTML" }, status: Viewed.VIEWED };
export const TYPESCRIPT: Content = { reference: { title: "TypeScript", link: "https://en.wikipedia.org/wiki/TypeScript" }, status: Viewed.VIEWED };
export const REACT: Content = { reference: { title: "React", link: "https://en.wikipedia.org/wiki/React_(JavaScript_library)" }, status: Viewed.VIEWED };
export const BLUEPRINT_JS: Content = { reference: { title: "Blueprint.js", link: "https://github.com/palantir/blueprint" }, status: Viewed.VIEWED };
export const SLATE: Content = { reference: { title: "Slate", link: "https://github.com/ianstormtaylor/slate" }, status: Viewed.IN_PROGRESS };
export const WASM: Content = { reference: { title: "WebAssembly", link: "https://en.wikipedia.org/wiki/WebAssembly" }, status: Viewed.IN_PROGRESS };
export const ASSEMBLY_SCRIPT: Content = { reference: { title: "AssemblyScript", link: "https://en.wikipedia.org/wiki/AssemblyScript" }, status: Viewed.IN_PROGRESS };
export const CPP: Content = { reference: { title: "C++", link: "https://en.wikipedia.org/wiki/C%2B%2B" }, status: Viewed.VIEWED };
export const PYTHON: Content = { reference: { title: "Python", link: "https://en.wikipedia.org/wiki/Python_(programming_language)" }, status: Viewed.VIEWED };
export const GO: Content = { reference: { title: "Go", link: "https://en.wikipedia.org/wiki/Go_(programming_language)" }, status: Viewed.VIEWED };
export const HASKELL: Content = { reference: { title: "Haskell", link: "https://en.wikipedia.org/wiki/Haskell" }, status: Viewed.VIEWED };
export const WOLFRAM_LANGUAGE: Content = { reference: { title: "Wolfram Language", link: "https://en.wikipedia.org/wiki/Wolfram_Language" }, status: Viewed.VIEWED };
export const LLVM: Content = { reference: { title: "LLVM", link: "https://en.wikipedia.org/wiki/LLVM" }, status: Viewed.IN_PROGRESS };
export const IPFS: Content = { reference: { title: "IPFS", link: "https://en.wikipedia.org/wiki/InterPlanetary_File_System" }, status: Viewed.VIEWED };
export const SQL: Content = { reference: { title: "SQL", link: "https://en.wikipedia.org/wiki/SQL" }, status: Viewed.VIEWED, archived: true };
export const MYSQL: Content = { reference: { title: "MySQL", link: "https://en.wikipedia.org/wiki/MySQL" }, status: Viewed.VIEWED, archived: true };
export const POSTGRESQL: Content = { reference: { title: "PostgreSQL", link: "https://en.wikipedia.org/wiki/PostgreSQL" }, status: Viewed.VIEWED, archived: true };
export const MONGO_DB: Content = { reference: { title: "MongoDB", link: "https://en.wikipedia.org/wiki/MongoDB" }, status: Viewed.VIEWED, archived: true };
export const REDIS: Content = { reference: { title: "Redis", link: "https://en.wikipedia.org/wiki/Redis" }, status: Viewed.VIEWED, archived: true };
export const RABBIT_MQ: Content = { reference: { title: "RabbitMQ", link: "https://en.wikipedia.org/wiki/RabbitMQ" }, status: Viewed.VIEWED, archived: true };
export const GIT: Content = { reference: { title: "Git", link: "https://en.wikipedia.org/wiki/Git" }, status: Viewed.VIEWED };
export const GITLAB: Content = { reference: { title: "GitLab", link: "https://en.wikipedia.org/wiki/GitLab" }, status: Viewed.VIEWED };
export const GITHUB: Content = { reference: { title: "GitHub", link: "https://en.wikipedia.org/wiki/GitHub" }, status: Viewed.VIEWED };
export const BITBUCKET: Content = { reference: { title: "Bitbucket", link: "https://en.wikipedia.org/wiki/Bitbucket" }, status: Viewed.VIEWED, archived: true };
export const DOCKER: Content = { reference: { title: "Docker", link: "https://en.wikipedia.org/wiki/Docker_(software)" }, status: Viewed.VIEWED };
export const KUBERNETES: Content = { reference: { title: "Kubernetes", link: "https://en.wikipedia.org/wiki/Kubernetes" }, status: Viewed.VIEWED, archived: true };
export const NGINX: Content = { reference: { title: "NGINX", link: "https://en.wikipedia.org/wiki/Nginx" }, status: Viewed.VIEWED };
export const NPM: Content = { reference: { title: "NPM", link: "https://en.wikipedia.org/wiki/Npm_(software)" }, status: Viewed.VIEWED };
export const MAVEN: Content = { reference: { title: "Maven", link: "https://en.wikipedia.org/wiki/Apache_Maven" }, status: Viewed.VIEWED, archived: true };
export const LINUX: Content = { reference: { title: "Linux", link: "https://en.wikipedia.org/wiki/Linux" }, status: Viewed.VIEWED };
export const ANDROID: Content = { reference: { title: "Android", link: "https://en.wikipedia.org/wiki/Android_(operating_system)" }, status: Viewed.VIEWED };
export const GCP: Content = { reference: { title: "GCP", link: "https://en.wikipedia.org/wiki/Google_Cloud_Platform" }, status: Viewed.VIEWED, archived: true };
export const AZURE: Content = { reference: { title: "Azure", link: "https://en.wikipedia.org/wiki/Microsoft_Azure" }, status: Viewed.VIEWED, archived: true };
export const AWS: Content = { reference: { title: "AWS", link: "https://en.wikipedia.org/wiki/Amazon_Web_Services" }, status: Viewed.VIEWED, archived: true };
export const SPIGOT_MC: Content = { reference: { title: "SpigotMC", link: "https://www.spigotmc.org/" }, status: Viewed.VIEWED, archived: true };
export const BUNGEE_CORD: Content = { reference: { title: "BungeeCord", link: "https://www.spigotmc.org/" }, status: Viewed.VIEWED, archived: true };
export const BUKKIT: Content = { reference: { title: "Bukkit", link: "https://dev.bukkit.org/" }, status: Viewed.VIEWED, archived: true };

export const FAMILIAR_TOOLS: ContentCategory = {
  name: 'Familiar Tools',
  items: [
    JAVA,
    RUBY_ON_RAILS,
    C_SHARP,
    DOT_NET,
    JAVASCRIPT,
    CSS,
    SASS,
    HTML,

    TYPESCRIPT,
    REACT,
    BLUEPRINT_JS,
    SLATE,

    WASM,
    ASSEMBLY_SCRIPT,

    CPP,
    PYTHON,
    GO,
    HASKELL,
    WOLFRAM_LANGUAGE,


    LLVM,

    IPFS,
    SQL,
    MYSQL,
    POSTGRESQL,
    MONGO_DB,
    REDIS,
    RABBIT_MQ,

    GIT,
    GITLAB,
    GITHUB,
    BITBUCKET,

    DOCKER,
    KUBERNETES,
    NGINX,
    NPM,
    MAVEN,

    LINUX,
    ANDROID,

    GCP,
    AZURE,
    AWS,

    SPIGOT_MC,
    BUNGEE_CORD,
    BUKKIT,
  ]
};

// TODO: Lex Fridman podcasts & others ..

export const current = (content: ContentCategory): Content[] =>
  (content?.items || []).filter(item => item.status === Viewed.IN_PROGRESS && !item.archived);

export const finished = (content: ContentCategory): Content[] =>
  (content?.items || []).filter(item => item.status === Viewed.VIEWED && !item.archived);

export const todo = (content: ContentCategory): Content[] =>
  (content?.items || []).filter(item => item.status === Viewed.FOUND && !item.archived);

export enum ContentFocus {
  CURRENT,
  FINISHED,
  TODO,
  ALL,
}

export const category = (content: ContentCategory) => {
  return {
    [ContentFocus.CURRENT]: current(content),
    [ContentFocus.FINISHED]: finished(content),
    [ContentFocus.TODO]: todo(content),
    [ContentFocus.ALL]: content.items,
  };
}

const Category = (props: { category: ContentCategory, archival_functions?: boolean, inline?: boolean, focus?: ContentFocus }) => {
  const { archival_functions, inline, focus = ContentFocus.CURRENT } = props;

  const { name, items } = props.category;

  const content: Content[] = category(props.category)[focus];

  const Item = ({item, index}: {item: Content, index: number}) => {
    return <Tag intent={Intent.NONE} minimal>
      <Reference index={index} {...item.reference} inline simple />
    </Tag>;
  }

  if (inline) {
    return <Row center="xs" className="child-p-1">
      {content.map((item, index) => <Col><Item item={item} index={index} key={index}/></Col>)}
    </Row>;
  }

  return <div>
    <H4>{name}</H4>
    {content.map((item, index) => <Row center="xs" className="child-py-1" key={index}>
      <Col xs={12}>
        <Item item={item} index={index} key={index} />
      </Col>
    </Row>)}
    {archival_functions ? <Row center="xs" className="mt-5 child-px-2">
      <Col><Tag intent={Intent.WARNING} minimal>Archive</Tag></Col>
      <Col><Tag intent={Intent.PRIMARY} minimal>Future</Tag></Col>
      <Col><Tag intent={Intent.DANGER} minimal>Forgotten</Tag></Col>
    </Row> : null}
  </div>
}

const FadiShawki = () => {
  // @ts-ignore
  const profile: Profile = {
    title: 'Fadi Shawki',
    subtitle: <Row className="child-px-3" middle="xs">
      <Col>
        <a href="mailto:shawkifadi@gmail.com" target="_blank">shawkifadi@gmail.com</a>
      </Col>
      <Col>
        <Divider style={{height: '0.8rem'}}/>
      </Col>
      <Col>
        22 SY old
      </Col>
    </Row>,
    profile_picture: fadishawki_profile_picture,
    socials: fadishawki,

    summary: <span>
      👋 The year is 2023 and ripe for the continued exploration of the universe by an allegedly self-proclaimed engineer, researcher, ..., scientist with an unkeenly interest in all things computational.
    </span>,

    books: BOOKS,
    history: HISTORY,
    formal_education: FORMAL_EDUCATION,
    familiar_tools: FAMILIAR_TOOLS,
  }

  const pageStyles = {
    // width: '1240px',
    // height: '1754px',
    width: '100vw',
    height: '100vh',
    // fontSize: '1.1rem'
  };

  const Layer = ({zIndex, children, ...props}: any) => {
    return <div
      {...props}
      className={classNames("py-35 px-50 child-pb-15" , props.className)}
      style={{
        ...pageStyles,
        position: 'absolute',
        zIndex: zIndex,
        ...(props.style ?? {})
      }}
    >
      {children}
    </div>;
  }

  return <div style={{
    ...pageStyles,
    border: 'solid 2px darkgray'
  }}>
    <Layer zIndex="0">
      <Row style={{height: '100%'}}>
        <Col xs={12}>
          <Row center="xs">
            <Col xs={6}>
              <img src={profile.profile_picture} width="200px" />

              <Row center="xs"><H3>{profile.title}</H3></Row>
              <Row center="xs"><H4 className="bp4-text-muted">{profile.subtitle}</H4></Row>
            </Col>
            <Col xs={6} style={{textAlign: 'start'}}>
              <Row middle="xs" style={{height: '100%'}}>{profile.summary}</Row>
            </Col>
          </Row>
        </Col>
        <Col xs={6}>
          <Category category={profile.books} archival_functions />
        </Col>
        <Col xs={6}>
          <Category category={profile.history} archival_functions focus={ContentFocus.FINISHED} />
        </Col>
        <Col xs={6}>
          <Category category={profile.formal_education} focus={ContentFocus.ALL} />
        </Col>
        <Col xs={12}>
          <Category category={profile.familiar_tools} focus={ContentFocus.ALL} inline />
        </Col>
      </Row>
    </Layer>
  </div>
};

export default FadiShawki;