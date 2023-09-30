import React from 'react';
import {Col, Row} from '../../lib/layout/flexbox';
import classNames from "classnames";
import {Intent, Tag} from "@blueprintjs/core";
import Reference from "../../lib/paper/layout/Reference";
import {Content, ContentCategory, Viewed} from '../../lib/organizations/ORGANIZATIONS';

// TODO: Just a crude initi\al setup while the interface is not yet workable

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
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "January, 2023"  };

export const PRELUDE_TO_FOUNDATION: Content = { reference: {
    title: "Prelude to Foundation",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1988",
    link: "https://en.wikipedia.org/wiki/Prelude_to_Foundation",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "April, 2023"  };

export const FOUNDATIONS_EDGE: Content = { reference: {
    title: "Foundation's Edge",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1982",
    link: "https://en.wikipedia.org/wiki/Foundation%27s_Edge",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "March, 2023"  };

export const FOUNDATION_AND_EARTH: Content = { reference: {
    title: "Foundation and Earth",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1986",
    link: "https://en.wikipedia.org/wiki/Foundation_and_Earth",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "March, 2023"  };

export const FORWARD_THE_FOUNDATION: Content = { reference: {
    title: "Forward the Foundation",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1993",
    link: "https://en.wikipedia.org/wiki/Forward_the_Foundation",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May, 2023"  };

export const I_ROBOT: Content = { reference: {
    title: "I, Robot",
    author: "Asimov, Isaac",
    journal: "Gnome Press",
    year: "1950",
    link: "https://en.wikipedia.org/wiki/I,_Robot",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "April, 2023"  };

export const THE_REST_OF_THE_ROBOTS: Content = { reference: {
    title: "The Rest of the Robots",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1964",
    link: "https://en.wikipedia.org/wiki/The_Rest_of_the_Robots",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May, 2023"  };

export const THE_COMPLETE_ROBOT: Content = { reference: {
    title: "The Complete Robot",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1982",
    link: "https://en.wikipedia.org/wiki/The_Complete_Robot",
  }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "June, 2023"  };

export const THE_CAVES_OF_STEEL: Content = { reference: {
    title: "The Caves of Steel",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1954",
    link: "https://en.wikipedia.org/wiki/The_Caves_of_Steel",
  }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "August, 2023"  };

export const THE_NAKED_SUN: Content = { reference: {
    title: "The Naked Sun",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1957",
    link: "https://en.wikipedia.org/wiki/The_Naked_Sun",
  }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "August, 2023"  };

export const THE_ROBOTS_OF_DAWN: Content = { reference: {
    title: "The Robots of Dawn",
    author: "Asimov, Isaac",
    journal: "Doubleday",
    year: "1983",
    link: "https://en.wikipedia.org/wiki/The_Robots_of_Dawn",
  }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "September, 2023"  };

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

export const METAMATHEMATICS: Content = { reference: {
    title: "Metamathematics: Foundations & Physicalization",
    author: "Wolfram, Stephen",
    journal: "Wolfram Media, Inc.",
    year: "2022",
    link: "https://arxiv.org/abs/2204.05123",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "May, 2023"  };

export const TWENTY_YEARS_NKS: Content = { reference: {
    title: "Twenty Years of a New Kind of Science",
    author: "Wolfram, Stephen",
    journal: "Wolfram Media, Inc.",
    year: "2022",
    link: "https://www.wolfram-media.com/products/twenty-years-of-a-new-kind-of-science/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June, 2023"  };

export const THE_SELFISH_GENE: Content = { reference: {
    title: "The Selfish Gene",
    author: "Dawkins, Richard",
    journal: "Oxford University Press",
    year: "1976",
    link: "https://en.wikipedia.org/wiki/The_Selfish_Gene",
  }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "February 2023 - "  };

export const TRANSFORMER: Content = { reference: {
    title: "Transformer: The Deep Chemistry of Life and Death",
    author: "Lane, Nick",
    journal: "W.W. Norton & Company",
    year: "2022",
    link: "https://en.wikipedia.org/wiki/Nick_Lane",
  }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "May 2023 - "  };

export const THE_VITAL_QUESTION: Content = { reference: {
    title: "The Vital Question: Why Is Life The Way It Is?",
    author: "Lane, Nick",
    journal: "Profile Books",
    year: "2015",
    link: "https://en.wikipedia.org/wiki/Nick_Lane",
  }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "May 2023 - "  };

export const A_THOUSAND_BRAINS: Content = { reference: {
    title: "A Thousand Brains: A New Theory of Intelligence",
    author: "Hawkins, Jeff",
    journal: "",
    year: "2021",
    link: "https://www.numenta.com/resources/books/a-thousand-brains-by-jeff-hawkins/",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"  };

export const FICTION: ContentCategory = {
  name: 'Fiction',
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

    FOUNDATIONS_EDGE,
    FOUNDATION_AND_EARTH,
    PRELUDE_TO_FOUNDATION,
    FORWARD_THE_FOUNDATION,

    I_ROBOT,
    THE_REST_OF_THE_ROBOTS,
    THE_COMPLETE_ROBOT,

    // Miscellaneous
    _1984,
  ]
};
export const NON_FICTION: ContentCategory = {
  name: 'History',
  items: [
    THE_ART_OF_WAR,

    QUANTUM_EINSTEIN_BOHR_AND_THE_GREAT_DEBATE_ABOUT_THE_NATURE_OF_REALITY,
    THE_FUTURE_OF_HUMANITY,

    FLUID_CONCEPTS_AND_CREATIVE_ANALOGIES,
    GODEL_ESCHER_BACH,

    COMBINATORS_A_CENTENNIAL_VIEW,

    THE_RISE_AND_FALL_OF_THE_THIRD_REICH,

    A_PROJECT_TO_FIND_THE_FUNDAMENTAL_THEORY_OF_PHYSICS,
    METAMATHEMATICS,
    TWENTY_YEARS_NKS,

    THE_SELFISH_GENE,
    TRANSFORMER,
    THE_VITAL_QUESTION,
  ]
};

export const BOOKS: ContentCategory = {
  name: 'Reading, Books',
  items: [
    // Fiction
    ...FICTION.items,
    ...NON_FICTION.items
  ]
};

export const REASONING_WITH_BELIEF_FUNCTIONS: Content = { reference: {
    title: "Reasoning with belief functions: An analysis of compatibility",
    author: "Pearl, Judea",
    journal: "International Journal of Approximate Reasoning",
    year: "1990",
    link: "https://www.sciencedirect.com/science/article/pii/0888613X9090013R/pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October 2022"  };

export const CONTEXT_AWARE_COMPUTING_APPLICATIONS: Content = { reference: {
    title: "Context-Aware Computing Applications",
    author: "Schilit, Bill, Norman Adams, and Roy Want",
    journal: "first workshop on mobile computing systems and applications. IEEE",
    year: "1994",
    link: "https://www.cs.cmu.edu/~./jasonh/courses/ubicomp-sp2007/papers/12-wmc-94-schilit.pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"  };

export const IS_REALISM_COMPATIBLE_WITH_TRUE_RANDOMNESS: Content = { reference: {
    title: "Is realism compatible with true randomness?",
    author: "Gisin, Nicolas",
    journal: "arXiv",
    year: "2010",
    link: "https://arxiv.org/pdf/1012.2536",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "September 2022"  };

export const WHAT_IS_A_KNOWLEDGE_REPRESENTATION: Content = { reference: {
    title: "What Is a Knowledge Representation?",
    author: "Davis, Randall, Howard Shrobe, and Peter Szolovits",
    journal: "AI magazine 14.1",
    year: "1993",
    link: "https://ojs.aaai.org/index.php/aimagazine/article/download/1029/947",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"  };

export const LEARNING_TO_REPRESENT_PROGRAMS_WITH_GRAPHS: Content = { reference: {
    title: "Learning to Represent Programs with Graphs",
    author: "Allamanis, Miltiadis, Marc Brockschmidt, and Mahmoud Khademi",
    journal: "arXiv",
    year: "2017",
    link: "https://arxiv.org/pdf/1711.00740",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"  };

export const A_THEORY_OF_INCREMENTAL_COMPRESSION: Content = { reference: {
    title: "A theory of incremental compression",
    author: "Franz, Arthur, Oleksandr Antonenko, and Roman Soletskyi",
    journal: "Information Sciences 547",
    year: "2021",
    link: "https://arxiv.org/pdf/1908.03781",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "August 2022"  };

export const ON_THE_MEASURE_OF_INTELLIGENCE: Content = { reference: {
    title: "On the Measure of Intelligence",
    author: "Chollet, François",
    journal: "arXiv",
    year: "2019",
    link: "https://arxiv.org/pdf/1911.01547",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December 2022"  };

export const EMPIRICISM_SEMANTICS_AND_ONTOLOGY: Content = { reference: {
    title: "Empiricism, Semantics, and Ontology",
    author: "Carnap, Rudolf",
    journal: "Revue internationale de philosophie",
    year: "1950",
    link: "https://authortomharper.com/wp-content/uploads/2022/04/1950-Empiricism-Semantics-and-Ontology-Carnap.pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October 2022"  };

export const GOING_BEYOND_THE_POINT_NEURON: Content = { reference: {
    title: "Going Beyond the Point Neuron: Active Dendrites and Sparse Representations for Continual Learning",
    author: "Grewal, Karan, et al.",
    journal: "bioRxiv",
    year: "2021",
    link: "https://www.biorxiv.org/content/biorxiv/early/2021/10/26/2021.10.25.465651.full.pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "September 2022"  };

export const THE_GENERAL_THEORY_OF_GENERAL_INTELLIGENCE: Content = { reference: {
    title: "The General Theory of General Intelligence: A Pragmatic Patternist Perspective",
    author: "Goertzel, Ben",
    journal: "arXiv",
    year: "2021",
    link: "https://arxiv.org/pdf/2103.15100",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "September 2022"  };

export const EMBODIED_SITUATED_AND_GROUNDED_INTELLIGENCE: Content = { reference: {
    title: "Embodied, Situated, and Grounded Intelligence: Implications for AI",
    author: "Millhouse, Tyler, Melanie Moses, and Melanie Mitchell",
    journal: "arXiv",
    year: "2022",
    link: "https://arxiv.org/pdf/2210.13589",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October 2022"  };

export const THE_DEBATE_OVER_UNDERSTANDING_IN_AI_LARGE_LANGUAGE_MODELS: Content = { reference: {
    title: "The Debate Over Understanding in AI’s Large Language Models",
    author: "Mitchell, Melanie, and David C. Krakauer",
    journal: "Proceedings of the National Academy of Sciences 120.13",
    year: "2023",
    link: "https://www.pnas.org/doi/full/10.1073/pnas.2215907120",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November 2022"  };

export const BEYOND_PROGRAMMING_LANGUAGES: Content = { reference: {
    title: "Beyond Programming Languages",
    author: "Winograd, Terry",
    journal: "Communications of the ACM 22.7",
    year: "1979",
    link: "https://dl.acm.org/doi/pdf/10.1145/359131.359133",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"  };

export const DATA_COMPRESSION_EXPLAINED: Content = { reference: {
    title: "Data Compression Explained",
    author: "Mahoney, Matt",
    journal: "Mahoney, Matt",
    year: "2010",
    link: "https://mattmahoney.net/dc/dce.html",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "June 2022"  };

export const IPFS_FAN_A_FUNCTION_ADDRESSABLE_COMPUTATION_NETWORK: Content = { reference: {
    title: "IPFS-FAN: A Function-Addressable Computation Network",
    author: "de la Rocha, Alfonso, Yiannis Psaras, and David Dias",
    journal: "IFIP Networking Conference (IFIP Networking). IEEE",
    year: "2021",
    link: "http://opendl.ifip-tc6.org/db/conf/networking/networking2021/1570713481.pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December 2022"  };

export const AVOIDING_CATASTROPHE_ACTIVE_DENDRITES_ENABLE_MULTI_TASK_LEARNING_IN_DYNAMICS_ENVIRONMENTS: Content = { reference: {
    title: "Avoiding Catastrophe: Active Dendrites Enable Multi-Task Learning in Dynamic Environments",
    author: "Iyer, Abhiram, et al.",
    journal: "Frontiers in neurorobotics 16",
    year: "2022",
    link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9100780/",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: " 2022"  };

export const GAMES_AND_PUZZLES_AS_MULTICOMPUTATIONAL_SYSTEMS: Content = { reference: {
    title: "Games and Puzzles as Multicomputational Systems",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2022",
    link: "https://writings.stephenwolfram.com/2022/06/games-and-puzzles-as-multicomputational-systems/",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November 2022"  };

export const A_THOUSAND_BRAINS_TOWARD_BIOLOGICALLY_CONSTRAINED_AI: Content = { reference: {
    title: "A thousand brains: toward biologically constrained AI",
    author: "Hole, Kjell Jørgen, and Subutai Ahmad",
    journal: "SN Applied Sciences 3.8",
    year: "2021",
    link: "https://link.springer.com/article/10.1007/s42452-021-04715-0",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"  };

export const IS_PROBABILITY_THEORY_RELEVANT_FOR_UNCERTAINTY: Content = { reference: {
    title: "Is Probability Theory Relevant for Uncertainty? A Post Keynesian Perspective",
    author: "Davidson, Paul",
    journal: "Journal of Economic Perspectives 5.1",
    year: "1991",
    link: "https://pubs.aeaweb.org/doi/pdf/10.1257/jep.5.1.129",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: " 2022"  };

export const MULTICOMPUTATION_A_FOURTH_PARADIGM_FOR_THEORETICAL_SCIENCE: Content = { reference: {
    title: "Multicomputation: A Fourth Paradigm for Theoretical Science",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2021",
    link: "https://writings.stephenwolfram.com/2021/09/multicomputation-a-fourth-paradigm-for-theoretical-science/",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December 2022"  };

export const ATTENTION_IS_ALL_YOU_NEED: Content = { reference: {
    title: "Attention Is All You Need",
    author: "Vaswani, Ashish, et al.",
    journal: "Advances in neural information processing systems 30",
    year: "2017",
    link: "https://proceedings.neurips.cc/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November 2022"  };

export const ON_THE_EINSTEIN_PODOLSKY_ROSEN_PARADOX: Content = { reference: {
    title: "On the Einstein Podolsky Rosen Paradox",
    author: "Bell, John S.",
    journal: "Physics Physique Fizika 1.3 ",
    year: "1964",
    link: "https://link.aps.org/pdf/10.1103/PhysicsPhysiqueFizika.1.195",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "June 2022"  };

export const THE_ALGORITHMIC_ORIGINS_OF_LIFE: Content = { reference: {
    title: "The algorithmic origins of life",
    author: "Walker, Sara Imari, and Paul CW Davies",
    journal: "Journal of the Royal Society Interface 10.79",
    year: "2013",
    link: "https://royalsocietypublishing.org/doi/full/10.1098/rsif.2012.0869",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November 2022"  };

export const THE_COMPUTER_FOR_THE_21ST_CENTURY: Content = { reference: {
    title: "The computer for the 21st century",
    author: "Weiser, Mark",
    journal: "Scientific american 265.3 ",
    year: "1991",
    link: "https://www.academia.edu/download/50943771/scientificamerican0991-9420161217-28996-1rvsbxf.pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"  };

export const SOK_SANITIZING_FOR_SECURITY: Content = { reference: {
    title: "SoK: Sanitizing for Security",
    author: "Song, Dokyung, et al.",
    journal: "IEEE Symposium on Security and Privacy (SP). IEEE",
    year: "2019",
    link: "https://arxiv.org/pdf/1806.04355",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"  };

export const UNCERTAINTY_BELIEF_AND_PROBABILITY: Content = { reference: {
    title: "Uncertainty, belief, and probability",
    author: "Fagin, Ronald, and Joseph Y. Halpern",
    journal: "Computational Intelligence 7.3",
    year: "1991",
    link: "https://s3.us.cloud-object-storage.appdomain.cloud/res-files/500-comint91.pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "September 2022"  };

export const ON_DEFINING_ARTIFICAL_INTELLIGENCE: Content = { reference: {
    title: "On Defining Artificial Intelligence",
    author: "Wang, Pei",
    journal: "Journal of Artificial General Intelligence 10.2",
    year: "2019",
    link: "https://sciendo.com/downloadpdf/journals/jagi/10/2/article-p1.pdf",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "August 2022"  };

export const ROBUST_SPEECH_RECOGNITION_VIA_LARGE_SCALE_WEAK_SUPERVISION: Content = { reference: {
    title: "Robust Speech Recognition via Large-Scale Weak Supervision",
    author: "Radford, Alec, et al.",
    journal: "arXiv",
    year: "2022",
    link: "https://arxiv.org/pdf/2212.04356",
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December 2022"  };


//


export const INTERACTION_COMBINATORS: Content = { reference: {
    title: "Interaction Combinators",
    author: "Lafont, Yves.",
    journal: "Information and Computation 137.1",
    year: "1997",
    link: "https://www.sciencedirect.com/science/article/pii/S0890540197926432/pdf?md5=30965cec6dd7605a865bbec4076f65e4&pid=1-s2.0-S0890540197926432-main.pdf",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"  };

export const VON_NEUMANNS_IMPOSSIBILITY_PROOF_MATHEMATICS_IN_THE_SERVICE_OF_RHETORICS: Content = { reference: {
    title: "Von Neumann’s Impossibility Proof: Mathematics in the Service of Rhetorics",
    author: "Dieks, Dennis",
    journal: "Studies in History and Philosophy of Science Part B: Studies in History and Philosophy of Modern Physics 60",
    year: "2017",
    link: "https://arxiv.org/pdf/1801.09305",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "February 2023"  };

export const PERFECTLY_SECURE_STEGANOGRAPHY_USING_MINIMUM_ENTROPY_COUPLING: Content = { reference: {
    title: "Perfectly Secure Steganography Using Minimum Entropy Coupling",
    author: "de Witt, Christian Schroeder, et al.",
    journal: "arXiv",
    year: "2022",
    link: "https://arxiv.org/pdf/2210.14889",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };

export const GENERAL_INTELLIGENCE_REQUIRES_RETHINKING_EXPLORATION: Content = { reference: {
    title: "General Intelligence Requires Rethinking Exploration",
    author: "Jiang, Minqi, Tim Rocktäschel, and Edward Grefenstette",
    journal: "arXiv",
    year: "2022",
    link: "https://arxiv.org/pdf/2211.07819",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };

export const DENSEPOSE_FROM_WIFI: Content = { reference: {
    title: "DensePose From WiFi",
    author: "Geng, Jiaqi, Dong Huang, and Fernando De la Torre",
    journal: "arXiv",
    year: "2022",
    link: "https://arxiv.org/pdf/2301.00250",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "February 2023"  };

export const A_MECHANIZED_FORMALIZATION_OF_THE_WEBASSEMBLY_SPECIFICATION_IN_COQ: Content = { reference: {
    title: "A Mechanized Formalization of the WebAssembly Specification in Coq",
    author: "Huang, Xuan",
    journal: "RIT Computer Science",
    year: "2019",
    link: "https://www.semanticscholar.org/paper/A-Mechanized-Formalization-of-the-WebAssembly-in-Huang/2fde569f52c37fe8e45ebf05268e1b4341b58cbf",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "May 2023"  };

export const A_DENOTATIONAL_SEMANTICS_FOR_THE_SYMMETRIC_INTERACTION_COMBINATORS: Content = { reference: {
    title: "A Denotational Semantics for the Symmetric Interaction Combinators",
    author: "Mazza, Damian",
    journal: "Mathematical Structures in Computer Science 17.3 ",
    year: "2007",
    link: "https://www.researchgate.net/profile/Damiano-Mazza/publication/220173732_A_denotational_semantics_for_the_symmetric_interaction_combinators/links/0912f50f4273696c14000000/A-denotational-semantics-for-the-symmetric-interaction-combinators.pdf",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"  };

export const DEEP_SELF_MODELING_AS_A_FUNDAMENTAL_PRINCIPLE_IN_THE_DESIGN_OF_INTELLIGENT_SYSTEMS: Content = { reference: {
    title: "Deep self-modeling as a fundamental principle in the design of intelligent systems",
    author: "Dean, George",
    journal: "Lab42",
    year: "2022",
    link: "https://lab42.global/past-challenges/essay-intelligence/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"  };
export const AI_ARTIFICIAL_INTELLIGENCE_OR_ARTIFICAL_IGNORANCE: Content = { reference: {
    title: "A.I. (Artificial Intelligence or Artificial Ignorance?",
    author: "Pavan, Massimiliano",
    journal: "Lab42",
    year: "2022",
    link: "https://lab42.global/past-challenges/essay-intelligence/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"  };
export const FROM_HUME_TO_HUMAN_AI_A_RETURN_TO_THE_FOUNDATIONS_AND_RESTRICTIONS_OF_HUMEAN_REASONING: Content = { reference: {
    title: "From Hume to Human AI: A return to the foundations and restrictions of hum(e)an reasoning",
    author: "Burke, Cassidy, Maura",
    journal: "Lab42",
    year: "2022",
    link: "https://lab42.global/past-challenges/essay-intelligence/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"  };
export const BUILDING_HUMAN_LIKE_INTELLIGENCE_AN_EVOLUTIONARY_PERSPECTIVE: Content = { reference: {
    title: "Building human-like intelligence: an evolutionary perspective",
    author: "Ouellette, Simon",
    journal: "Lab42",
    year: "2022",
    link: "https://lab42.global/past-challenges/essay-intelligence/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"  };
export const A_CASE_FOR_COMPUTATIONAL_INTELLIGENCE_AS_RECURSIVE_ABSTRACTION_AND_GOAL_ORIENTED_SYNTHESIS: Content = { reference: {
    title: "A Case for Computational Intelligence as Recursive Abstraction and Goal-Oriented Synthesis",
    author: "Song, Yiding",
    journal: "Lab42",
    year: "2022",
    link: "https://lab42.global/past-challenges/essay-intelligence/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"  };

export const REVERSE_ENGINEERING_WEBASSEMBLY: Content = { reference: {
    title: "Reverse Engineering WebAssembly",
    author: "Falliere, Nicolas",
    journal: "PNF Software",
    year: "2018",
    link: "https://www.pnfsoftware.com/reversing-wasm.pdf",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "May 2023"  };

export const TOROIDAL_TOPOLOGY_OF_POPULATION_ACTIVITY_IN_GRID_CELLS: Content = { reference: {
    title: "Toroidal topology of population activity in grid cells",
    author: "Gardner, Richard J., et al.",
    journal: "Nature 602.7895",
    year: "2022",
    link: "https://www.nature.com/articles/s41586-021-04268-7",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };

export const A_50_YEAR_QUEST_MY_PERSONAL_JOURNEY_WITH_THE_SECOND_LAW_OF_THERMODYNAMICS: Content = { reference: {
    title: "A 50-Year Quest: My Personal Journey with the Second Law of Thermodynamics",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2023",
    link: "https://writings.stephenwolfram.com/2023/02/a-50-year-quest-my-personal-journey-with-the-second-law-of-thermodynamics/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };
export const ALIEN_INTELLIGENCE_AND_THE_CONCEPT_OF_TECHNOLOGY: Content = { reference: {
    title: "Alien Intelligence and the Concept of Technology",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2022",
    link: "https://writings.stephenwolfram.com/2022/06/alien-intelligence-and-the-concept-of-technology/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };
export const CHATGPT_GETS_ITS_WOLFRAM_SUPERPOWERS: Content = { reference: {
    title: "ChatGPT Gets Its “Wolfram Superpowers”!",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2023",
    link: "https://writings.stephenwolfram.com/2023/03/chatgpt-gets-its-wolfram-superpowers/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };
export const COMPUTATIONAL_FOUNDATIONS_FOR_THE_SECOND_LAW_OF_THERMODYNAMICS: Content = { reference: {
    title: "Computational Foundations for the Second Law of Thermodynamics",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2023",
    link: "https://writings.stephenwolfram.com/2023/02/computational-foundations-for-the-second-law-of-thermodynamics/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };
export const FASTER_THAN_LIGHT_IN_OUR_MODEL_OF_PHYSICS_SOME_PRELIMINARY_THOUGHTS: Content = { reference: {
    title: "Faster than Light in Our Model of Physics: Some Preliminary Thoughts",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2020",
    link: "https://writings.stephenwolfram.com/2020/10/faster-than-light-in-our-model-of-physics-some-preliminary-thoughts/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };
export const HOW_DID_WE_GET_HERE_THE_TANGLED_HISTORY_OF_THE_SECOND_LAW_OF_THERMODYNAMICS: Content = { reference: {
    title: "How Did We Get Here? The Tangled History of the Second Law of Thermodynamics",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2023",
    link: "https://writings.stephenwolfram.com/2023/01/how-did-we-get-here-the-tangled-history-of-the-second-law-of-thermodynamics/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };
export const MULTICOMPUTATIONAL_IRREDUCIBILITY: Content = { reference: {
    title: "Multicomputational Irreducibility",
    author: "Boyd, James",
    journal: "Wolfram Institute",
    year: "2022",
    link: "https://www.wolframphysics.org/bulletins/2022/06/multicomputational-irreducibility/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"  };

export const ZX_CALCULUS_AND_EXTENDED_HYPERGRAPH_REWRITING_SYSTEMS_I: Content = { reference: {
    title: "ZX-Calculus and Extended Hypergraph Rewriting Systems I: A Multiway Approach to Categorical Quantum Information Theory",
    author: "Gorard, Jonathan, Manojna Namuduri, and Xerxes D. Arsiwalla",
    journal: "arXiv",
    year: "2020",
    link: "https://arxiv.org/pdf/2010.02752",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"  };

export const FAST_AUTOMATED_REASONING_OVER_STRING_DIAGRAMS_USING_MULTIWAY_CAUSAL_STRUCTURE: Content = { reference: {
    title: "Fast Automated Reasoning over String Diagrams using Multiway Causal Structure",
    author: "Gorard, Jonathan, Manojna Namuduri, and Xerxes D. Arsiwalla",
    journal: "arXiv",
    year: "2021",
    link: "https://arxiv.org/pdf/2105.04057",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"  };

export const LAGRANGIAN_NEURAL_NETWORKS: Content = { reference: {
    title: "Lagrangian Neural Networks",
    author: "Cranmer, Miles, et al",
    journal: "arXiv",
    year: "2020",
    link: "https://arxiv.org/pdf/2003.04630",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"  };

export const QUANTOMATRIC_A_PROOF_ASSISTANT_FOR_DIAGRAMMATIC_REASONING: Content = { reference: {
    title: "Quantomatic: A proof assistant for diagrammatic reasoning",
    author: "Kissinger, Aleks, and Vladimir Zamdzhiev",
    journal: "Automated Deduction-CADE-25: 25th International Conference on Automated Deduction, Berlin, Germany",
    year: "2015",
    link: "https://arxiv.org/pdf/1503.01034",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"  };

export const THE_SEMANTIC_CONCEPTION_OF_TRUTH_AND_THE_FOUNDATIONS_OF_SEMANTICS: Content = { reference: {
    title: "The semantic conception of truth: and the foundations of semantics",
    author: "Tarski, Alfred",
    journal: "The semantic conception of truth: and the foundations of semantics",
    year: "1944",
    link: "https://sites.google.com/site/filosofiaetc/histfil/Tarski_SCT_1944.pdf",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"  };

export const RESIDUALITY_THEORY_RANDOM_SIMULATION_AND_ATTRACTOR_NETWORKS: Content = { reference: {
    title: "Residuality Theory, random simulation, and attractor networks",
    author: "O’Reilly, Barry M.",
    journal: "Procedia Computer Science 201",
    page: "639-645",
    year: "2022",
    link: "https://www.sciencedirect.com/science/article/pii/S1877050922004975/pdf?md5=faa21ad837ec9eba6fac3beb2cd93f9f&pid=1-s2.0-S1877050922004975-main.pdf",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023" };

export const A_FUNCTORIAL_PERSPECTIVE_ON_MULTICOMPUTATIONAL_IRREDUCIBILITY: Content = { reference: {
    title: "A Functorial Perspective on (Multi)computational Irreducibility",
    author: "Gorard, Jonathan",
    journal: "arXiv",
    year: "2022",
    link: "https://arxiv.org/pdf/2301.04690",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023" };

export const BIOELECTRIC_NETWORKS_THE_COGNITIVE_GLUE_ENABLING_EVOLUTIONARY_SCALING_FROM_PHYSIOLOGY_TO_MIND: Content = { reference: {
    title: "Bioelectric networks: the cognitive glue enabling evolutionary scaling from physiology to mind",
    author: "Levin, Michael",
    journal: "Animal Cognition",
    year: "2023",
    link: "https://link.springer.com/article/10.1007/s10071-023-01780-3",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023" };

export const COMPETENCY_IN_NAVIGATING_ARBITRARY_SPACES_AS_AN_INVARIANT_FOR_ANALYZING_COGNITION_IN_DIVERSE_EMBODIMENTS: Content = { reference: {
    title: "Competency in Navigating Arbitrary Spaces as an Invariant for Analyzing Cognition in Diverse Embodiments",
    author: "Fields, Chris, and Levin, Michael",
    journal: "Entropy 24.6",
    page: "819",
    year: "2022",
    link: "https://www.mdpi.com/1099-4300/24/6/819",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023" };

export const CHROME_SHIPS_WEBGPU: Content = { reference: {
    title: "Chrome ships WebGPU",
    author: "Beaufort, François and Wallez, Corentin",
    journal: "Chrome Developers Blog",
    year: "2023",
    link: "https://developer.chrome.com/blog/webgpu-release/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023" };

export const GET_STARTED_WITH_GPU_COMPUTE_ON_THE_WEB: Content = { reference: {
    title: "Get started with GPU Compute on the web",
    author: "Beaufort, François",
    journal: "Chrome Developers Blog",
    year: "2023",
    link: "https://developer.chrome.com/articles/gpu-compute/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023" };

export const SPAWNING_A_WASI_THREAD_WITH_RAW_WEBASSEMBLY: Content = { reference: {
    title: "Spawning a WASI Thread with raw WebAssembly",
    author: "Das Surma",
    journal: "surma.dev",
    year: "2023",
    link: "https://surma.dev/postits/wasi-threads/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023" };

export const WEBGPU_ALL_OF_THE_CORES_NONE_OF_THE_CANVAS: Content = { reference: {
    title: "WebGPU — All of the cores, none of the canvas",
    author: "Das Surma",
    journal: "surma.dev",
    year: "2022",
    link: "https://surma.dev/things/webgpu/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023" };

export const REMEMBERING_THE_IMPROBABLE_LIFE_OF_ED_FREDKIN: Content = { reference: {
    title: "Remembering the Improbable Life of Ed Fredkin (1934–2023) and His World of Ideas and Stories",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2023",
    link: "https://writings.stephenwolfram.com/2023/08/remembering-the-improbable-life-of-ed-fredkin-1934-2023-and-his-world-of-ideas-and-stories/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"  };

export const REMEMBERING_DOUG_LENAT: Content = { reference: {
    title: "Remembering Doug Lenat (1950–2023) and His Quest to Capture the World with Logic",
    author: "Wolfram, Stephen",
    journal: "",
    year: "2023",
    link: "https://writings.stephenwolfram.com/2023/09/remembering-doug-lenat-1950-2023-and-his-quest-to-capture-the-world-with-logic/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"  };

export const THE_ALEXANDRIA_PROJECT_WHAT_HAS_BEEN_ACCOMPLISHED: Content = { reference: {
    title: "The ALEXANDRIA Project: what has been accomplished?",
    author: "Paulson, Lawrence C.",
    journal: "",
    year: "2023",
    link: "https://lawrencecpaulson.github.io/2023/04/27/ALEXANDRIA_outcomes.html",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"  };
export const THE_END_OF_THE_ALEXANDRIA_PROJECT: Content = { reference: {
    title: "The End (?) of the ALEXANDRIA Project",
    author: "Paulson, Lawrence C.",
    journal: "",
    year: "2023",
    link: "https://lawrencecpaulson.github.io/2023/08/31/ALEXANDRIA_finished.html",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"  };
export const WHEN_IS_A_COMPUTER_PROOF_A_PROOF: Content = { reference: {
    title: "When is a computer proof a proof?",
    author: "Paulson, Lawrence C.",
    journal: "",
    year: "2023",
    link: "https://lawrencecpaulson.github.io/2023/08/09/computer_proof.html",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"  };
export const ALEXANDRIA_LARGE_SCALE_FORMAL_PROOF_FOR_THE_WORKING_MATHEMATICIAN: Content = { reference: {
    title: "ALEXANDRIA: Large-Scale Formal Proof for the Working Mathematician",
    author: "Paulson, Lawrence C.",
    journal: "",
    year: "2021",
    link: "https://lawrencecpaulson.github.io/2021/12/08/ALEXANDRIA.html",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"  };
export const THE_ORIGINS_AND_MOTIVATIONS_OF_UNIVALENT_FOUNDATIONS: Content = { reference: {
    title: "The Origins and Motivations of Univalent Foundations",
    author: "Voevodsky, Vladimir",
    journal: "",
    year: "2014",
    link: "https://www.ias.edu/ideas/2014/voevodsky-origins",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"  };

export const WILL_COMPUTERS_REDEFINE_THE_ROOTS_OF_MATH: Content = { reference: {
    title: "Will Computers Redefine the Roots of Math?",
    author: "Hartnett, Kevin",
    journal: "",
    year: "2015",
    link: "https://www.quantamagazine.org/will-computers-redefine-the-roots-of-math-20150519/",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"  };

export const QUANTUM_IN_PICTURES: Content = { reference: {
    title: "Quantum in Pictures",
    author: "Coecke, Bob and Gogioso, Stefano",
    journal: "Quantinuum",
    year: "2023",
    link: "https://www.quantinuum.com/news/quantum-in-pictures",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"  };

export const CATEGORY_THEORY_I: Content = { reference: {
    title: "Category Theory I",
    author: "Milewski, Bartosz",
    journal: "YouTube",
    year: "2016",
    link: "https://www.youtube.com/watch?v=I8LbkfSSR58&list=PLbgaMIhjbmEnaH_LTkxLI7FMa2HsnawM_",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023" };
export const CATEGORY_THEORY_II: Content = { reference: {
    title: "Category Theory II",
    author: "Milewski, Bartosz",
    journal: "YouTube",
    year: "2017",
    link: "https://www.youtube.com/watch?v=3XTQSx1A3x8&list=PLbgaMIhjbmElia1eCEZNvsVscFef9m0dm",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023" };
export const CATEGORY_THEORY_III: Content = { reference: {
    title: "Category Theory III",
    author: "Milewski, Bartosz",
    journal: "YouTube",
    year: "2018",
    link: "https://www.youtube.com/watch?v=F5uEpKwHqdk&list=PLbgaMIhjbmEn64WVX4B08B4h2rOtueWIL",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023" };

export const DIHEAPS_A_NEW_SPECIES_OF_ALGEBRAIC_STRUCTURE: Content = { reference: {
    title: "Diheaps: a new species of algebraic structure",
    author: "Zapata, Carlos",
    journal: "YouTube",
    year: "2023",
    link: "https://www.youtube.com/watch?v=YOfIXwBHPFU",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023" };

export const HACKENBUSH_A_WINDOW_TO_A_NEW_WORLD_OF_MATH: Content = { reference: {
    title: "HACKENBUSH: a window to a new world of math\n",
    author: "Maitzen, Owen",
    journal: "YouTube",
    year: "2021",
    link: "https://www.youtube.com/watch?v=ZYj4NkeGPdM",
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023" };

// TODO ; Accurate here, list the articles from archive automatically
export const WIKIPEDIA_ARTICLES: Content = { reference: {
    title: "~400+ Wikipedia Articles",
    link: "https://www.wikipedia.org/"
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "2023"  };
export const ARTICLES_2023: ContentCategory = {
  name: '2023',
  items: [
    THE_ORIGINS_AND_MOTIVATIONS_OF_UNIVALENT_FOUNDATIONS,
    THE_END_OF_THE_ALEXANDRIA_PROJECT,
    WHEN_IS_A_COMPUTER_PROOF_A_PROOF,
    THE_ALEXANDRIA_PROJECT_WHAT_HAS_BEEN_ACCOMPLISHED,
    ALEXANDRIA_LARGE_SCALE_FORMAL_PROOF_FOR_THE_WORKING_MATHEMATICIAN,
    REMEMBERING_DOUG_LENAT,

    CATEGORY_THEORY_I,
    CATEGORY_THEORY_II,
    CATEGORY_THEORY_III,
    HACKENBUSH_A_WINDOW_TO_A_NEW_WORLD_OF_MATH,
    DIHEAPS_A_NEW_SPECIES_OF_ALGEBRAIC_STRUCTURE,
    QUANTUM_IN_PICTURES,
    REMEMBERING_THE_IMPROBABLE_LIFE_OF_ED_FREDKIN,
    WILL_COMPUTERS_REDEFINE_THE_ROOTS_OF_MATH,
    A_FUNCTORIAL_PERSPECTIVE_ON_MULTICOMPUTATIONAL_IRREDUCIBILITY,
    RESIDUALITY_THEORY_RANDOM_SIMULATION_AND_ATTRACTOR_NETWORKS,
    BIOELECTRIC_NETWORKS_THE_COGNITIVE_GLUE_ENABLING_EVOLUTIONARY_SCALING_FROM_PHYSIOLOGY_TO_MIND,
    COMPETENCY_IN_NAVIGATING_ARBITRARY_SPACES_AS_AN_INVARIANT_FOR_ANALYZING_COGNITION_IN_DIVERSE_EMBODIMENTS,
    CHROME_SHIPS_WEBGPU,
    GET_STARTED_WITH_GPU_COMPUTE_ON_THE_WEB,
    SPAWNING_A_WASI_THREAD_WITH_RAW_WEBASSEMBLY,
    WEBGPU_ALL_OF_THE_CORES_NONE_OF_THE_CANVAS,
    ZX_CALCULUS_AND_EXTENDED_HYPERGRAPH_REWRITING_SYSTEMS_I,
    FAST_AUTOMATED_REASONING_OVER_STRING_DIAGRAMS_USING_MULTIWAY_CAUSAL_STRUCTURE,
    LAGRANGIAN_NEURAL_NETWORKS,
    QUANTOMATRIC_A_PROOF_ASSISTANT_FOR_DIAGRAMMATIC_REASONING,
    THE_SEMANTIC_CONCEPTION_OF_TRUTH_AND_THE_FOUNDATIONS_OF_SEMANTICS,

    CHAPTERHOUSE_DUNE,

    FOUNDATIONS_EDGE,
    FOUNDATION_AND_EARTH,
    PRELUDE_TO_FOUNDATION,
    FORWARD_THE_FOUNDATION,

    I_ROBOT,
    THE_REST_OF_THE_ROBOTS,
    THE_COMPLETE_ROBOT,
    THE_CAVES_OF_STEEL,
    THE_NAKED_SUN,
    THE_ROBOTS_OF_DAWN,

    THE_RISE_AND_FALL_OF_THE_THIRD_REICH,

    A_PROJECT_TO_FIND_THE_FUNDAMENTAL_THEORY_OF_PHYSICS,
    METAMATHEMATICS,
    TWENTY_YEARS_NKS,

    THE_SELFISH_GENE,
    TRANSFORMER,
    THE_VITAL_QUESTION,

    INTERACTION_COMBINATORS,
    VON_NEUMANNS_IMPOSSIBILITY_PROOF_MATHEMATICS_IN_THE_SERVICE_OF_RHETORICS,
    PERFECTLY_SECURE_STEGANOGRAPHY_USING_MINIMUM_ENTROPY_COUPLING,
    GENERAL_INTELLIGENCE_REQUIRES_RETHINKING_EXPLORATION,
    DENSEPOSE_FROM_WIFI,
    A_MECHANIZED_FORMALIZATION_OF_THE_WEBASSEMBLY_SPECIFICATION_IN_COQ,
    A_DENOTATIONAL_SEMANTICS_FOR_THE_SYMMETRIC_INTERACTION_COMBINATORS,
    DEEP_SELF_MODELING_AS_A_FUNDAMENTAL_PRINCIPLE_IN_THE_DESIGN_OF_INTELLIGENT_SYSTEMS,
    AI_ARTIFICIAL_INTELLIGENCE_OR_ARTIFICAL_IGNORANCE,
    FROM_HUME_TO_HUMAN_AI_A_RETURN_TO_THE_FOUNDATIONS_AND_RESTRICTIONS_OF_HUMEAN_REASONING,
    BUILDING_HUMAN_LIKE_INTELLIGENCE_AN_EVOLUTIONARY_PERSPECTIVE,
    A_CASE_FOR_COMPUTATIONAL_INTELLIGENCE_AS_RECURSIVE_ABSTRACTION_AND_GOAL_ORIENTED_SYNTHESIS,
    REVERSE_ENGINEERING_WEBASSEMBLY,
    TOROIDAL_TOPOLOGY_OF_POPULATION_ACTIVITY_IN_GRID_CELLS,
    A_50_YEAR_QUEST_MY_PERSONAL_JOURNEY_WITH_THE_SECOND_LAW_OF_THERMODYNAMICS,
    ALIEN_INTELLIGENCE_AND_THE_CONCEPT_OF_TECHNOLOGY,
    CHATGPT_GETS_ITS_WOLFRAM_SUPERPOWERS,
    COMPUTATIONAL_FOUNDATIONS_FOR_THE_SECOND_LAW_OF_THERMODYNAMICS,
    FASTER_THAN_LIGHT_IN_OUR_MODEL_OF_PHYSICS_SOME_PRELIMINARY_THOUGHTS,
    HOW_DID_WE_GET_HERE_THE_TANGLED_HISTORY_OF_THE_SECOND_LAW_OF_THERMODYNAMICS,
    MULTICOMPUTATIONAL_IRREDUCIBILITY,

    WIKIPEDIA_ARTICLES
  ]
}

export const ARTICLES_2021: ContentCategory = {
  name: '2021',
  items: [
    DUNE,
    DUNE_MESSIAH,
    CHILDREN_OF_DUNE,

    _1984,
  ]
}

export const ARTICLES_2022: ContentCategory = {
  name: '2022',
  items: [

    GOD_EMPEROR_OF_DUNE,
    HERETICS_OF_DUNE,

    FOUNDATION,
    FOUNDATION_AND_EMPIRE,
    SECOND_FOUNDATION,

    THE_ART_OF_WAR,

    A_THOUSAND_BRAINS,

    QUANTUM_EINSTEIN_BOHR_AND_THE_GREAT_DEBATE_ABOUT_THE_NATURE_OF_REALITY,
    THE_FUTURE_OF_HUMANITY,

    FLUID_CONCEPTS_AND_CREATIVE_ANALOGIES,
    GODEL_ESCHER_BACH,

    COMBINATORS_A_CENTENNIAL_VIEW,

    REASONING_WITH_BELIEF_FUNCTIONS,
    CONTEXT_AWARE_COMPUTING_APPLICATIONS,
    IS_REALISM_COMPATIBLE_WITH_TRUE_RANDOMNESS,
    WHAT_IS_A_KNOWLEDGE_REPRESENTATION,
    LEARNING_TO_REPRESENT_PROGRAMS_WITH_GRAPHS,
    A_THEORY_OF_INCREMENTAL_COMPRESSION,
    ON_THE_MEASURE_OF_INTELLIGENCE,
    EMPIRICISM_SEMANTICS_AND_ONTOLOGY,
    GOING_BEYOND_THE_POINT_NEURON,
    THE_GENERAL_THEORY_OF_GENERAL_INTELLIGENCE,
    EMBODIED_SITUATED_AND_GROUNDED_INTELLIGENCE,
    THE_DEBATE_OVER_UNDERSTANDING_IN_AI_LARGE_LANGUAGE_MODELS,
    BEYOND_PROGRAMMING_LANGUAGES,
    DATA_COMPRESSION_EXPLAINED,
    IPFS_FAN_A_FUNCTION_ADDRESSABLE_COMPUTATION_NETWORK,
    AVOIDING_CATASTROPHE_ACTIVE_DENDRITES_ENABLE_MULTI_TASK_LEARNING_IN_DYNAMICS_ENVIRONMENTS,
    GAMES_AND_PUZZLES_AS_MULTICOMPUTATIONAL_SYSTEMS,
    A_THOUSAND_BRAINS_TOWARD_BIOLOGICALLY_CONSTRAINED_AI,
    IS_PROBABILITY_THEORY_RELEVANT_FOR_UNCERTAINTY,
    MULTICOMPUTATION_A_FOURTH_PARADIGM_FOR_THEORETICAL_SCIENCE,
    ATTENTION_IS_ALL_YOU_NEED,
    ON_THE_EINSTEIN_PODOLSKY_ROSEN_PARADOX,
    THE_ALGORITHMIC_ORIGINS_OF_LIFE,
    THE_COMPUTER_FOR_THE_21ST_CENTURY,
    SOK_SANITIZING_FOR_SECURITY,
    UNCERTAINTY_BELIEF_AND_PROBABILITY,
    ON_DEFINING_ARTIFICAL_INTELLIGENCE,
    ROBUST_SPEECH_RECOGNITION_VIA_LARGE_SCALE_WEAK_SUPERVISION,


  ]
};

export const EXPLORER_ORBITMINES_RESEARCH: Content = { reference: {
    title: "Explorer",
    journal: "OrbitMines Research",
    year: "July, 2022 - Present",
    link: "https://orbitmines.com/"
  }, status: Viewed.VIEWED, viewed_at: "July, 2022 - Present" };
export const SOFTWARE_DEVELOPER_AT_BREACHLOCK_INC: Content = { reference: {
    title: "Software Developer",
    journal: "BreachLock Inc.",
    year: "November, 2021 - May, 2022",
    link: "https://www.linkedin.com/company/breachlock/"
  }, status: Viewed.VIEWED, viewed_at: "November, 2021 - May, 2022" };
export const CONTRACTOR_AT_MARTI_ORBAK_SOFTWARE: Content = { reference: {
    title: "Contractor",
    journal: "MartiOrbak Software",
    year: "November, 2020 - March 2021",
    link: "https://www.linkedin.com/company/marti-orbak-software/"
  }, status: Viewed.VIEWED, viewed_at: "November, 2020 - March 2021" };
export const BACKEND_DEVELOPER_AT_MOBIEL_NL: Content = { reference: {
    title: "Backend Developer",
    journal: "Mobiel.nl",
    year: "November, 2018 - August, 2019",
    link: "https://www.linkedin.com/company/mobiel.nl/",
  }, status: Viewed.VIEWED, viewed_at: "November, 2018 - August, 2019", description: "My first interaction working at a SME." };
export const FOUNDER_AT_ORBITMINES_MINECRAFT: Content = { reference: {
    title: "Founder",
    journal: "OrbitMines (Minecraft)",
    year: "October, 2013 - May, 2019",
    link: "https://www.youtube.com/@OrbitMines/videos",
  }, status: Viewed.VIEWED, viewed_at: "October, 2013 - May, 2019", description: "I introduced myself to software engineering during this period by designing and maintaining my own Minecraft game server, which had a small community of concurrent players." };

export const HISTORY: ContentCategory = {
  name: 'History',
  items: [
    EXPLORER_ORBITMINES_RESEARCH,
    SOFTWARE_DEVELOPER_AT_BREACHLOCK_INC,
    CONTRACTOR_AT_MARTI_ORBAK_SOFTWARE,
    BACKEND_DEVELOPER_AT_MOBIEL_NL,
    FOUNDER_AT_ORBITMINES_MINECRAFT,
  ]
};

export const LEIDEN_UNIVERSITY: Content = { reference: {
    title: "(Unfinished) Computer Science (BSc)",
    journal: "Leiden University",
    year: "September, 2019 - December, 2020"
  }, status: Viewed.IN_PROGRESS, viewed_at: "September, 2019 - December, 2020", archived: true };

export const VWO: Content = { reference: {
    title: "VWO / Science & Engineering",
    year: "2012 - 2019"
  }, status: Viewed.VIEWED, viewed_at: "2012 - 2019" };

export const FORMAL_EDUCATION: ContentCategory = {
  name: 'Formal Education',
  items: [
    LEIDEN_UNIVERSITY,
    VWO,
  ]
};

export const SEMF_2023: Content = { reference: {
    title: "SEMF School of 2023",
    year: "2023",
    link: "https://semf.org.es/school2023/"
  }, status: Viewed.VIEWED, found_at: "July, 2023", viewed_at: "2023" };

export const ATTENDED_EVENTS: ContentCategory = {
  name: 'Attended Events',
  items: [
    SEMF_2023,
  ]
};

export const RUST: Content = { reference: { title: "Rust", link: "https://en.wikipedia.org/wiki/Rust_(programming_language)" }, status: Viewed.VIEWED };
export const JAVA: Content = { reference: { title: "Java", link: "https://en.wikipedia.org/wiki/Java_(programming_language)" }, status: Viewed.VIEWED, archived: true };
export const KOTLIN: Content = { reference: { title: "Kotlin", link: "https://en.wikipedia.org/wiki/Kotlin_(programming_language)" }, status: Viewed.VIEWED, archived: true };
export const RUBY_ON_RAILS: Content = { reference: { title: "Ruby (on Rails)", link: "https://en.wikipedia.org/wiki/Ruby_on_Rails" }, status: Viewed.VIEWED, archived: true };
export const C_SHARP: Content = { reference: { title: "C#", link: "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)" }, status: Viewed.VIEWED, archived: true };
export const DOT_NET: Content = { reference: { title: ".NET", link: "https://en.wikipedia.org/wiki/.NET" }, status: Viewed.VIEWED, archived: true };
export const BLAZOR: Content = { reference: { title: "Blazor", link: "https://en.wikipedia.org/wiki/Blazor" }, status: Viewed.VIEWED, archived: true };
export const JAVASCRIPT: Content = { reference: { title: "JavaScript", link: "https://en.wikipedia.org/wiki/JavaScript" }, status: Viewed.VIEWED };
export const CSS: Content = { reference: { title: "CSS", link: "https://en.wikipedia.org/wiki/CSS" }, status: Viewed.VIEWED };
export const SASS: Content = { reference: { title: "SASS", link: "https://en.wikipedia.org/wiki/Sass_(stylesheet_language)" }, status: Viewed.VIEWED };
export const HTML: Content = { reference: { title: "HTML", link: "https://en.wikipedia.org/wiki/HTML" }, status: Viewed.VIEWED };
export const WEBPACK: Content = { reference: { title: "Webpack", link: "https://webpack.js.org/" }, status: Viewed.VIEWED };
export const TYPESCRIPT: Content = { reference: { title: "TypeScript", link: "https://en.wikipedia.org/wiki/TypeScript" }, status: Viewed.VIEWED };
export const REACT: Content = { reference: { title: "React", link: "https://en.wikipedia.org/wiki/React_(JavaScript_library)" }, status: Viewed.VIEWED };
export const BLUEPRINT_JS: Content = { reference: { title: "Blueprint.js", link: "https://github.com/palantir/blueprint" }, status: Viewed.VIEWED };
export const SLATE: Content = { reference: { title: "Slate", link: "https://github.com/ianstormtaylor/slate" }, status: Viewed.IN_PROGRESS };
export const THREEJS: Content = { reference: { title: "Three.js", link: "https://github.com/mrdoob/three.js/" }, status: Viewed.IN_PROGRESS };
export const DREI: Content = { reference: { title: "drei", link: "https://github.com/pmndrs/drei" }, status: Viewed.IN_PROGRESS };
export const WASM: Content = { reference: { title: "WebAssembly", link: "https://en.wikipedia.org/wiki/WebAssembly" }, status: Viewed.IN_PROGRESS };
export const ASSEMBLY_SCRIPT: Content = { reference: { title: "AssemblyScript", link: "https://en.wikipedia.org/wiki/AssemblyScript" }, status: Viewed.IN_PROGRESS };
export const CPP: Content = { reference: { title: "C++", link: "https://en.wikipedia.org/wiki/C%2B%2B" }, status: Viewed.VIEWED };
export const PYTHON: Content = { reference: { title: "Python", link: "https://en.wikipedia.org/wiki/Python_(programming_language)" }, status: Viewed.VIEWED };
export const GO: Content = { reference: { title: "Go", link: "https://en.wikipedia.org/wiki/Go_(programming_language)" }, status: Viewed.VIEWED };
export const HASKELL: Content = { reference: { title: "Haskell", link: "https://en.wikipedia.org/wiki/Haskell" }, status: Viewed.VIEWED };
export const WOLFRAM_LANGUAGE: Content = { reference: { title: "Wolfram Language", link: "https://en.wikipedia.org/wiki/Wolfram_Language" }, status: Viewed.VIEWED };
export const LLVM: Content = { reference: { title: "LLVM", link: "https://en.wikipedia.org/wiki/LLVM" }, status: Viewed.IN_PROGRESS };
export const IPFS: Content = { reference: { title: "IPFS", link: "https://en.wikipedia.org/wiki/InterPlanetary_File_System" }, status: Viewed.VIEWED };
export const IPVM: Content = { reference: { title: "IPVM", link: "https://github.com/ipvm-wg" }, status: Viewed.VIEWED };
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
export const FLATPAK: Content = { reference: { title: "Flatpak", link: "https://en.wikipedia.org/wiki/Flatpak" }, status: Viewed.VIEWED, archived: false };
export const OBS: Content = { reference: { title: "OBS Studio", link: "https://en.wikipedia.org/wiki/OBS_Studio" }, status: Viewed.VIEWED, archived: false };
export const CLOUDFLARE: Content = { reference: { title: "Cloudflare", link: "https://en.wikipedia.org/wiki/Cloudflare" }, status: Viewed.VIEWED, archived: false };
export const CHYP: Content = { reference: { title: "Chyp", link: "https://github.com/akissinger/chyp" }, status: Viewed.VIEWED, archived: false };
export const WEBGPU: Content = { reference: { title: "WebGPU", link: "https://github.com/gpuweb/gpuweb" }, status: Viewed.VIEWED, archived: false };
export const INTELLI_J: Content = { reference: { title: "IntelliJ", link: "https://github.com/JetBrains/intellij-community" }, status: Viewed.VIEWED, archived: false };
export const VS_CODE: Content = { reference: { title: "VS Code", link: "https://github.com/microsoft/vscode" }, status: Viewed.VIEWED, archived: false };
export const ECLIPSE: Content = { reference: { title: "Eclipse", link: "https://github.com/eclipse-platform/eclipse.platform" }, status: Viewed.VIEWED, archived: false };

export const FAMILIAR_TOOLS: ContentCategory = {
  name: 'Familiar Tools',
  items: [
    WASM,
    WEBGPU,
    RUST,
    CPP,
    LLVM,

    CHYP,

    PYTHON,
    GO,
    HASKELL,
    WOLFRAM_LANGUAGE,
    JAVA,
    KOTLIN,
    RUBY_ON_RAILS,
    C_SHARP,
    DOT_NET,
    BLAZOR,
    JAVASCRIPT,
    CSS,
    SASS,
    HTML,
    WEBPACK,

    ASSEMBLY_SCRIPT,
    TYPESCRIPT,
    REACT,
    BLUEPRINT_JS,
    SLATE,
    THREEJS,
    DREI,

    IPFS,
    IPVM,
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

    FLATPAK,
    OBS,
    CLOUDFLARE,

    INTELLI_J,
    VS_CODE,
    ECLIPSE,
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

export const Category = (props: { category?: ContentCategory, archival_functions?: boolean, inline?: boolean, focus?: ContentFocus, simple?: boolean }) => {
  const { archival_functions, inline, focus = ContentFocus.CURRENT, simple = false } = props;

  if (!props.category)
    return <></>;

  const { name, items } = props.category;

  const content: Content[] = category(props.category)[focus];

  const Item = ({item, index}: {item: Content, index: number}) => {
    return <Tag intent={Intent.NONE} minimal multiline>
      <Reference index={index} {...item.reference} inline simple={simple} />
    </Tag>;
  }

  if (inline) {
    return <Row center="xs" className="child-p-1">
      {content.map((item, index) => <Col><Item item={item} index={index} key={index}/></Col>)}
    </Row>;
  }

  return <div>
    {/*<H4>{name}</H4>*/}
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

export const pageStyles = {
  // width: '1240px',
  // height: '1754px',
  width: '100%',
  maxWidth: '100vw',
  minHeight: '100vh',
  // fontSize: '1.1rem'
};

export const Layer = ({zIndex, children, ...props}: any) => {
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
