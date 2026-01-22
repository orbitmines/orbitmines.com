import ORGANIZATIONS, {Content, ExternalProfile, TProfile, Viewed} from '../../../lib/organizations/ORGANIZATIONS';

// TODO: Just a crude initi\al setup while the interface is not yet workable

export const REFERENCES = {
  THE_STRANGEST_MAN: <Content>{
    reference: {
      title: 'The Strangest Man',
      authors: [{name: 'Graham Farmelo'}],
      organizations: [],
      year: '(2009)',
      link: "https://en.wikipedia.org/wiki/The_Strangest_Man"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ECCE_HOMO: <Content>{
    reference: {
      title: 'Ecce Homo',
      authors: [{name: 'Friedrich Nietzsche'}],
      organizations: [],
      year: '(1908)',
      link: "https://en.wikipedia.org/wiki/Ecce_Homo_(book)"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_THREE_BODY_PROBLEM: <Content>{
    reference: {
      title: 'The Three-Body Problem',
      authors: [{name: 'Liu Cixin'}],
      organizations: [],
      year: '(2008)',
      link: "https://en.wikipedia.org/wiki/The_Three-Body_Problem_(novel)"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WOOL: <Content>{
    reference: {
      title: 'Wool',
      authors: [{name: 'Hugh Howey'}],
      organizations: [],
      year: '(2011)',
      link: "https://en.wikipedia.org/wiki/Silo_(series)"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  SHIFT: <Content>{
    reference: {
      title: 'Shift',
      authors: [{name: 'Hugh Howey'}],
      organizations: [],
      year: '(2013)',
      link: "https://en.wikipedia.org/wiki/Silo_(series)"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HARRY_POTTER_1_7: <Content>{
    reference: {
      title: 'Harry Potter 1-7',
      authors: [{name: 'J. K. Rowling'}],
      organizations: [],
      year: '(1997-2007)',
      link: "https://en.wikipedia.org/wiki/Harry_Potter"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROPOSITIONS_AS_TYPES: <Content>{
    reference: {
      title: '"Propositions as Types"',
      authors: [{name: 'Philip Wadler'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '(2015)',
      link: "https://www.youtube.com/watch?v=IOiZatlZtGU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_DISTRIBUTED_SYSTEMS: <Content>{
    reference: {
      title: '"Programming Distributed Systems"',
      authors: [{name: 'Mae Milano'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '(2023)',
      link: "https://www.youtube.com/watch?v=Mc3tTRkjCvE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  DAN_HOUSER_GTA_RED_DEAD_REDEMPTION_ROCKSTAR_ABSURD_FUTURE_OF_GAMING_484: <Content>{
    reference: {
      title: 'Dan Houser: GTA, Red Dead Redemption, Rockstar, Absurd & Future of Gaming | #484',
      authors: [{name: 'Dan Houser'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=o3gbXDjNWyI"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  DECIPHERING_SECRETS_OF_ANCIENT_CIVILIZATIONS_NOAHS_ARK_AND_FLOOD_MYTHS_487: <Content>{
    reference: {
      title: 'Deciphering Secrets of Ancient Civilizations, Noah\'s Ark, and Flood Myths | #487',
      authors: [{name: 'Irving Finkel'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=_bBRVNkAfkQ&pp=0gcJCYcKAYcqIYzv"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PAVEL_DUROV_TELEGRAM_FREEDOM_CENSORSHIP_MONEY_POWER_HUMAN_NATURE_482: <Content>{
    reference: {
      title: 'Pavel Durov: Telegram, Freedom, Censorship, Money, Power & Human Nature | #482',
      authors: [{name: 'Pavel Durov'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=qjPH9njnaVU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  DAVID_KIRTLEY_NUCLEAR_FUSION_PLASMA_PHYSICS_AND_THE_FUTURE_OF_ENERGY_485: <Content>{
    reference: {
      title: 'David Kirtley: Nuclear Fusion, Plasma Physics, and the Future of Energy | #485',
      authors: [{name: 'David Kirtley'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=m_CFCyc2Shs"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  INFINITY_PARADOXES_GÖDEL_INCOMPLETENESS_THE_MATHEMATICAL_MULTIVERSE_488: <Content>{
    reference: {
      title: 'Infinity, Paradoxes, Gödel Incompleteness & the Mathematical Multiverse | #488',
      authors: [{name: 'Joel David Hamkins'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=14OPT6CcsH4"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PAUL_ROSOLIE_UNCONTACTED_TRIBES_IN_THE_AMAZON_JUNGLE_489: <Content>{
    reference: {
      title: 'Paul Rosolie: Uncontacted Tribes in the Amazon Jungle | #489',
      authors: [{name: 'Paul Rosolie'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2026)',
      link: "https://www.youtube.com/watch?v=Z-FRe5AKmCU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _26_WILL_KINNEY___BEFORE_THE_BIG_BANG_INFLATION_INFINITY_OF_WORLDS: <Content>{
    reference: {
      title: '#26 Will Kinney - Before the Big Bang, Inflation, Infinity of Worlds',
      authors: [{name: 'Will Kinney'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=HSZtn0yKPBI"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _27_JASON_STEFFEN___KEPLER_MISSION_LEGACY_PARTICLE_PHYSICS_OPTIMAL_PLANE_BOARDING: <Content>{
    reference: {
      title: '#27 Jason Steffen - Kepler Mission Legacy, Particle Physics, Optimal Plane Boarding',
      authors: [{name: 'Jason Steffen'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=vaqgPzT8PXA"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _28_NÉSTOR_ESPINOZA___JWST_EXOPLANET_ATMOSPHERES_MOLECULE_DETECTION: <Content>{
    reference: {
      title: '#28 Néstor Espinoza - JWST, Exoplanet Atmospheres, Molecule Detection',
      authors: [{name: 'Néstor Espinoza'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=bZ7Hge0OUTE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CRAFTING_INTERPRETERS: <Content>{
    reference: {
      title: 'Crafting Interpreters',
      authors: [{name: 'Robert Nystrom'}],
      organizations: [],
      year: '(2021)',
      link: "https://www.craftinginterpreters.com/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  FUNCTIONAL_PROGRAMMING_IN_LEAN: <Content>{
    reference: {
      title: 'Functional Programming in Lean',
      authors: [{name: 'David Thrane Christiansen'}],
      organizations: [],
      year: '(2023)',
      link: "https://lean-lang.org/functional_programming_in_lean/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  REFLECTIONS_ON_EQUALITY: <Content>{
    reference: {
      title: 'Reflections on Equality',
      authors: [{name: 'Amélia Liao'}],
      organizations: [],
      year: '(2020)',
      link: "https://amelia.how/posts/reflections-on-equality.html"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CUBICAL_TYPE_THEORY: <Content>{
    reference: {
      title: 'Cubical Type Theory',
      authors: [{name: 'Amélia Liao'}],
      organizations: [],
      year: '(2021)',
      link: "https://amelia.how/posts/cubical-type-theory.html"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ABSTRACT_INTERPRETATION_IN_A_NUTSHELL: <Content>{
    reference: {
      title: 'Abstract Interpretation in a Nutshell',
      authors: [{name: 'Patrick Cousot'}],
      organizations: [],
      year: '(2005)',
      link: "https://www.di.ens.fr/~cousot/AI/IntroAbsInt.html"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ABSTRACT_INTERPRETATION_A_UNIFIED_LATTICE_MODEL_FOR_STATIC_ANALYSIS_OF_PROGRAMS_BY_CONSTRUCTION_OR_APPROXIMATION_OF_FIXPOINTS: <Content>{
    reference: {
      title: 'Abstract interpretation: a unified lattice model for static analysis of programs by construction or approximation of fixpoints',
      authors: [{name: 'Patrick Cousot'}, {name: 'Radhia Cousot'}],
      organizations: [],
      year: '(1977)',
      link: "https://dl.acm.org/doi/pdf/10.1145/512950.512973"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LEVIATHAN_WAKES: <Content>{
    reference: {
      title: 'Leviathan Wakes',
      authors: [{name: 'James S. A. Corey'}],
      organizations: [],
      year: '(2011)',
      link: "https://en.wikipedia.org/wiki/Leviathan_Wakes"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CUBICAL_TYPES_FOR_THE_WORKING_FORMALIZER: <Content>{
    reference: {
      title: '"Cubical types for the working formalizer"',
      authors: [{name: 'Amélia Liao'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.topos_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=rhZAkHDo-r4&t=1s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  EASY_ABSTRACT_INTERPRETATION_WITH_SPARTA: <Content>{
    reference: {
      title: '"Easy Abstract Interpretation with SPARTA"',
      authors: [{name: 'Arnaud Venet'}, {name: 'Jez Ng'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '(2019)',
      link: "https://www.youtube.com/watch?v=_fA7vkVJhF8&t=2s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  A_LITTLE_TASTE_OF_DEPENDENT_TYPES: <Content>{
    reference: {
      title: 'A Little Taste of Dependent Types',
      authors: [{name: 'David Thrane Christiansen'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '(2018)',
      link: "https://www.youtube.com/watch?v=VxINoKFm-S4&ab_channel=StrangeLoopConference"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _24___MODERN_COSMOLOGY_HUBBLE_TENSION_EXOTIC_PHYSICS: <Content>{
    reference: {
      title: '#24 - Modern Cosmology, Hubble Tension, Exotic Physics',
      authors: [{name: 'Colin Hill'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=FkC-kVC2IRA"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _25___PBS_SPACETIME_SCIENCE_ON_YOUTUBE_QUASARS: <Content>{
    reference: {
      title: '#25 - PBS Spacetime, Science on YouTube, Quasars',
      authors: [{name: 'Matt O\'Dowd'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=V7QjrsadlKQ&t=5327s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  DAVE_PLUMMER_PROGRAMMING_AUTISM_AND_OLD_SCHOOL_MICROSOFT_STORIES_479: <Content>{
    reference: {
      title: 'Dave Plummer: Programming, Autism, and Old-School Microsoft Stories | #479',
      authors: [{name: 'Dave Plummer'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=HsLgZzgpz9Y"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  DAVE_HONE_T_REX_DINOSAURS_EXTINCTION_EVOLUTION_AND_JURASSIC_PARK_480: <Content>{
    reference: {
      title: 'Dave Hone: T-Rex, Dinosaurs, Extinction, Evolution, and Jurassic Park | #480',
      authors: [{name: 'Dave Hone'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=-Qm1_On71Oo"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  TIM_SWEENEY_FORTNITE_UNREAL_ENGINE_AND_THE_FUTURE_OF_GAMING_467: <Content>{
    reference: {
      title: 'Tim Sweeney: Fortnite, Unreal Engine, and the Future of Gaming | #467',
      authors: [{name: 'Tim Sweeney'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=477qF6QNSvc&t=14990s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  QUANTUM_THEORY_AS_A_NEW_KIND_OF_STOCHASTIC_PROCESS: <Content>{
    reference: {
      title: 'Quantum Theory as a New Kind of Stochastic Process',
      authors: [{name: 'Jacob Barandes'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=JsmX3YxiUj0&t=4288s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  KEYNOTE_HIGHER_INDUCTIVE_TYPES_IN_HOMOTOPY_TYPE_THEORY: <Content>{
    reference: {
      title: 'Keynote: Higher Inductive Types in Homotopy Type Theory',
      authors: [{name: 'Kristina Sojakova'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2019)',
      link: "https://www.youtube.com/watch?v=AMJIsEBS-zk"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_VERSE_PROGRAMMING_LANGUAGE_GDC_2023: <Content>{
    reference: {
      title: 'The Verse Programming Language | GDC 2023',
      authors: [{name: 'Tim Sweeney'}, {name: 'Phil Pizlo'}, {name: 'Tim TIllotson'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2023)',
      link: "https://www.youtube.com/watch?v=5prkKOIilJg&t=1517s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },

  READY_PLAYER_ONE: <Content>{
    reference: {
      title: 'Ready Player One',
      authors: [{name: 'Ernest Cline'}],
      organizations: [],
      year: '(2011)',
      link: "https://en.wikipedia.org/wiki/Ready_Player_One"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  READY_PLAYER_TWO: <Content>{
    reference: {
      title: 'Ready Player Two',
      authors: [{name: 'Ernest Cline'}],
      organizations: [],
      year: '(2020)',
      link: "https://en.wikipedia.org/wiki/Ready_Player_Two"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MSP_101_GENERALISATION_IN_LLMS_PETAR_VELIČKOVIĆ: <Content>{
    reference: {
      title: 'MSP 101: Generalisation in LLMs (Petar Veličković)',
      authors: [{name: 'Petar Veličković'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=7Z144Ymohd0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  SUNDAR_PICHAI_CEO_OF_GOOGLE_AND_ALPHABET_471: <Content>{
    reference: {
      title: 'Sundar Pichai: CEO of Google and Alphabet | #471',
      authors: [{name: 'Sundar Pichai'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=9V6tWC4CdFQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  TERENCE_TAO_HARDEST_PROBLEMS_IN_MATHEMATICS_PHYSICS_THE_FUTURE_OF_AI_472: <Content>{
    reference: {
      title: 'Terence Tao: Hardest Problems in Mathematics, Physics & the Future of AI | #472',
      authors: [{name: 'Terence Tao'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=HUkBz-cdB-k"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  DHH_FUTURE_OF_PROGRAMMING_AI_RUBY_ON_RAILS_PRODUCTIVITY_PARENTING_474: <Content>{
    reference: {
      title: 'DHH: Future of Programming, AI, Ruby on Rails, Productivity & Parenting | #474',
      authors: [{name: 'David Heinemeier Hansson'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=vagyIcmIGOQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  DEMIS_HASSABIS_FUTURE_OF_AI_SIMULATING_REALITY_PHYSICS_AND_VIDEO_GAMES_475: <Content>{
    reference: {
      title: 'Demis Hassabis: Future of AI, Simulating Reality, Physics and Video Games | #475',
      authors: [{name: 'Demis Hassabis'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=-HzgcbRXUK8&t=8677s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_323_JACOB_BARANDES_ON_INDIVISIBLE_STOCHASTIC_QUANTUM_MECHANICS: <Content>{
    reference: {
      title: 'Mindscape 323 | Jacob Barandes on Indivisible Stochastic Quantum Mechanics',
      authors: [{name: 'Jacob Barandes'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=gINYis8BgSY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _23___FINE_TUNING_MULTIVERSE_COSMOLOGICAL_TENSIONS: <Content>{
    reference: {
      title: '#23 - Fine-Tuning, Multiverse, Cosmological Tensions',
      authors: [{name: 'Geraint Lewis'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=OejwZqh-F9U&t=29s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  STRING_DIAGRAM_REWRITE_THEORY_III_CONFLUENCE_WITH_AND_WITHOUT_FROBENIUS: <Content>{
    reference: {
      title: 'String diagram rewrite theory III: Confluence with and without Frobenius',
      authors: [{name: 'Filippo Bonchi'}, {name: 'Fabio Gadducci'}, {name: 'Aleks Kissinger'}, {name: 'Pawel Sobocinski'}, {name: 'Fabio Zanasi'}],
      organizations: [],
      year: '(2022)',
      link: "https://arxiv.org/abs/2109.06049"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  INFLUENCE_OF_TEMPORAL_INFORMATION_GAPS_ON_DECISION_MAKING_DESCRIBING_THE_DYNAMICS_OF_WORKING_MEMORY: <Content>{
    reference: {
      title: 'Influence of temporal information gaps on decision making: describing the dynamics of working memory',
      authors: [{name: 'Alejandro Sospedra'}, {name: 'Santiago Canals'}, {name: 'Encarni Marcos'}],
      organizations: [],
      year: '(2024)',
      link: "https://www.biorxiv.org/content/10.1101/2024.07.17.603868v1"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  BLACK_HOLES_WORMHOLES_ALIENS_PARADOXES_EXTRA_DIMENSIONS_468: <Content>{
    reference: {
      title: 'Black Holes, Wormholes, Aliens, Paradoxes & Extra Dimensions | #468',
      authors: [{name: 'Janna Levin'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=A6m4iJIw_84"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _19___INFLATION_B_MODES_AND_LOSING_THE_NOBEL_PRIZE: <Content>{
    reference: {
      title: '#19 - Inflation, B Modes and Losing the Nobel Prize',
      authors: [{name: 'Brian Keating'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=L5MDDTFbpfU&t=3s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _20___KEPLER_MISSION_EXOPLANETS_WITH_JWST_FUTURE_IMAGERS: <Content>{
    reference: {
      title: '#20 - Kepler Mission, Exoplanets with JWST, Future Imagers',
      authors: [{name: 'Natalie Batalha'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=BCWd7NuTIcY&t=4s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _21___EARLY_MARS_TERRAFORMINGSETTLING_MARS: <Content>{
    reference: {
      title: '#21 - Early Mars, Terraforming/Settling Mars',
      authors: [{name: 'Edwin Kite'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=-DaeWdIaMZE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _22___ORIGIN_OF_LIFE_ASSEMBLY_THEORY_BIOSIGNATURES: <Content>{
    reference: {
      title: '#22 - Origin of Life, Assembly Theory, Biosignatures',
      authors: [{name: 'Sara Walker'}, {name: 'David Kipping'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.cool_worlds_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=W2duMnWYhDY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  RULES_THAT_REALITY_PLAYS_BY___343: <Content>{
    reference: {
      title: 'Rules that Reality Plays By - #343',
      authors: [{name: 'Stephen Wolfram'}, {name: 'Anastasia Bendebury'}, {name: 'Michael Shilo DeLay'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.demystifysci],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=aQCT_kboi8A"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MISTAKING_THE_MAP_FOR_THE_TERRITORY_IN_PHYSICS___344: <Content>{
    reference: {
      title: 'Mistaking the Map for the Territory in Physics - #344',
      authors: [{name: 'Jacob Barandes'}, {name: 'Anastasia Bendebury'}, {name: 'Michael Shilo DeLay'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.demystifysci],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=9068pS75Uds&t=2s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },

  THE_EQUIVALENCE_BETWEEN_GEOMETRICAL_STRUCTURES_AND_ENTROPY: <Content>{
    reference: {
      title: 'The equivalence between geometrical structures and entropy',
      authors: [{name: 'Gabriele Carcassi'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=lp0RgZ6kQF8"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  DEEPSEEK_CHINA_OPENAI_NVIDIA_XAI_TSMC_STARGATE_AND_AI_MEGACLUSTERS_459: <Content>{
    reference: {
      title: 'DeepSeek, China, OpenAI, NVIDIA, xAI, TSMC, Stargate, and AI Megaclusters | #459',
      authors: [{name: 'Dylan Patel'}, {name: 'Nathan Lambert'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=_1f-o0nqpEI"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WHY_PHYSICS_WITHOUT_PHILOSOPHY_IS_DEEPLY_BROKEN_PART_2: <Content>{
    reference: {
      title: 'Why Physics Without Philosophy Is Deeply Broken... [Part 2]',
      authors: [{name: 'Jacob Barandes'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=YaS1usLeXQM"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HARVARD_SCIENTIST_THERE_IS_NO_QUANTUM_MULTIVERSE_PART_3: <Content>{
    reference: {
      title: 'Harvard Scientist: "There is No Quantum Multiverse" [Part 3]',
      authors: [{name: 'Jacob Barandes'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=wrUvtqr4wOs"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HARVARD_PHYSICIST_DEBUNKS_PARTICLE_SUPERPOSITION: <Content>{
    reference: {
      title: 'Harvard Physicist Debunks Particle Superposition',
      authors: [{name: 'Jacob Barandes'}, {name: 'Manolis Kellis'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=MTD8xkbiGis&t=11s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  TOP_AI_SCIENTIST_UNIFIES_WOLFRAM_LEIBNIZ_CONSCIOUSNESS: <Content>{
    reference: {
      title: 'Top AI Scientist Unifies Wolfram, Leibniz, & Consciousness',
      authors: [{name: 'William Hahn'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=3fkg0uTA3qU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_THEORY_THAT_EXPLAINS_YOU_FREE_ENERGY_PRINCIPLE: <Content>{
    reference: {
      title: 'The Theory That Explains YOU... (Free Energy Principle)',
      authors: [{name: 'Michael Levin'}, {name: 'Karl Friston'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=0yOV9Pzk2zw"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  EINSTEIN_HIS_LIFE_AND_UNIVERSE: <Content>{
    reference: {
      title: 'Einstein: His Life and Universe',
      authors: [{name: 'Walter Isaacson'}],
      organizations: [],
      year: '(2007)',
      link: "https://en.wikipedia.org/wiki/Einstein:_His_Life_and_Universe"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_FUTURE_OF_BRAIN_EMULATION_IS_LOOKING_SPIKY: <Content>{
    reference: {
      title: 'The future of brain emulation is looking spiky',
      authors: [{name: 'Andy McKenzie'}],
      organizations: [],
      year: '(2025)',
      link: "https://neurobiology.substack.com/p/the-future-of-brain-emulation-is"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WHY_THE_GODFATHER_OF_AI_NOW_FEARS_HIS_OWN_CREATION: <Content>{
    reference: {
      title: 'Why The "Godfather of AI" Now Fears His Own Creation',
      authors: [{name: 'Geoffrey Hinton'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=b_DUft-BdIE&ab_channel=CurtJaimungal"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_MAJOR_FLAWS_IN_FUNDAMENTAL_PHYSICS: <Content>{
    reference: {
      title: 'The Major Flaws in Fundamental Physics',
      authors: [{name: 'Sabine Hossenfelder'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=E3y-Z0pgupg&ab_channel=CurtJaimungal"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_CRISIS_IN_STRING_THEORY_IS_WORSE_THAN_YOU_THINK: <Content>{
    reference: {
      title: 'The Crisis in String Theory is Worse Than You Think',
      authors: [{name: 'Leonard Susskind'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=2p_Hlm6aCok&ab_channel=CurtJaimungal"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MATH_HAS_CHANGED_FOREVER: <Content>{
    reference: {
      title: 'Math Has Changed Forever…',
      authors: [{name: 'Yang-Hui He'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2025)',
      link: "https://www.youtube.com/watch?v=wbP0KjWm0pw&ab_channel=CurtJaimungal"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },

  APPLIED_CATEGORY_THEORY_IN_CHEMISTRY_COMPUTING_AND_SOCIAL_NETWORKS: <Content>{
    reference: {
      title: 'Applied Category Theory in Chemistry, Computing, and Social Networks',
      authors: [{name: 'John Baez'}, {name: 'Simon Cho'}, {name: 'Daniel Cicala'}, {name: 'Nina Otter'}, {name: 'Valeria de Paiva'}],
      organizations: [],
      year: '(2022)',
      link: "https://math.ucr.edu/home/baez/mrc_2022.pdf"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  UNIQUENESS_TREES_A_POSSIBLE_POLYNOMIAL_APPROACH_TO_THE_GRAPH_ISOMORPHISM_PROBLEM: <Content>{
    reference: {
      title: 'Uniqueness Trees: A Possible Polynomial Approach to the Graph Isomorphism Problem',
      authors: [{name: 'Jonathan Gorard'}],
      organizations: [],
      year: '(2016)',
      link: "https://arxiv.org/pdf/1606.06399"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALIEN_CIVILIZATIONS_AND_THE_SEARCH_FOR_EXTRATERRESTRIAL_LIFE_LEX_FRIDMAN_PODCAST_455: <Content>{
    reference: {
      title: 'Alien Civilizations and the Search for Extraterrestrial Life | Lex Fridman Podcast #455',
      authors: [{name: 'Adam Frank'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=yhZAXXI83-4&ab_channel=LexFridman"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THERES_NO_WAVE_FUNCTION: <Content>{
    reference: {
      title: 'There’s No Wave Function?',
      authors: [{name: 'Jacob Barandes'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=7oWip00iXbo&ab_channel=CurtJaimungal"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_POTENTIAL_OF_THE_HUMAN_BRAIN: <Content>{
    reference: {
      title: 'The Potential of the Human Brain',
      authors: [{name: 'Iain McGilchrist'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=Q9sBKCd2HD0&ab_channel=CurtJaimungal"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_UNIVERSE_WRITES_ITSELF_INTO_EXISTENCE_MOMENT_BY_MOMENT: <Content>{
    reference: {
      title: 'The Universe Writes Itself Into Existence Moment by Moment',
      authors: [{name: 'Avshalom Elitzur'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=pWRAaimQT1E&ab_channel=CurtJaimungal"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },

  HUNTERS_OF_DUNE: <Content>{
    reference: {
      title: 'Hunters of Dune',
      authors: [{name: 'Brian Herbert'}, {name: 'Kevin J. Anderson'}],
      organizations: [],
      year: '(2006)',
      link: "https://en.wikipedia.org/wiki/Hunters_of_Dune"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_LITTLE_BOOK_OF_DEEP_LEARNING: <Content>{
    reference: {
      title: 'The Little Book of Deep Learning',
      authors: [{name: 'François Fleuret'}],
      organizations: [],
      year: '(2023)',
      link: "https://fleuret.org/public/lbdl.pdf"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PREFACE_WHAT_IS_OPENGL: <Content>{
    reference: {
      title: 'Preface: What is OpenGL?',
      authors: [{name: 'Eddy Luten'}],
      organizations: [],
      year: '(2014)',
      link: "https://openglbook.com/chapter-0-preface-what-is-opengl.html#:~:text=On%20the%20most%20fundamental%20level,the%20finer%20details%20of%20OpenGL."
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  FOUNDATIONS_OF_BIDIRECTIONAL_PROGRAMMING_I_WELL_TYPED_SUBSTRUCTURAL_LANGUAGES: <Content>{
    reference: {
      title: 'Foundations of Bidirectional Programming I: Well-Typed Substructural Languages',
      authors: [{name: 'Jules Hedges'}],
      organizations: [],
      year: '(2024)',
      link: "https://cybercat.institute/2024/08/26/bidirectional-programming-i/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  FOUNDATIONS_OF_BIDIRECTIONAL_PROGRAMMING_II_NEGATIVE_TYPES: <Content>{
    reference: {
      title: 'Foundations of Bidirectional Programming II: Negative Types',
      authors: [{name: 'Jules Hedges'}],
      organizations: [],
      year: '(2024)',
      link: "https://cybercat.institute/2024/09/05/bidirectional-programming-ii/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_YOGA_OF_CONTEXTS_I: <Content>{
    reference: {
      title: 'The Yoga of Contexts I',
      authors: [{name: 'Jules Hedges'}],
      organizations: [],
      year: '(2024)',
      link: "https://cybercat.institute/2024/06/28/yoga-contexts/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WHY_DOES_BIOLOGICAL_EVOLUTION_WORK_A_MINIMAL_MODEL_FOR_BIOLOGICAL_EVOLUTION_AND_OTHER_ADAPTIVE_PROCESSES: <Content>{
    reference: {
      title: 'Why Does Biological Evolution Work? A Minimal Model for Biological Evolution and Other Adaptive Processes',
      authors: [{name: 'Stephen Wolfram'}],
      organizations: [ORGANIZATIONS.wolfram],
      year: '(2024)',
      link: "https://writings.stephenwolfram.com/2024/05/why-does-biological-evolution-work-a-minimal-model-for-biological-evolution-and-other-adaptive-processes/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  _20TH_CENTURY_S_GREATEST_LIVING_SCIENTIST_SIR_ROGER_PENROSE: <Content>{
    reference: {
      title: '20th Century’s Greatest Living Scientist | Sir Roger Penrose',
      authors: [{name: 'Roger Penrose'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=sGm505TFMbU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_QUANTUM_HERETIC_A_NEW_THEORY_OF_EVERYTHING: <Content>{
    reference: {
      title: 'The Quantum Heretic: A New Theory of Everything?',
      authors: [{name: 'Jonathan Oppenheim'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=6Z_p3viqW1g"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MAYA_AZTEC_INCA_AND_LOST_CIVILIZATIONS_OF_SOUTH_AMERICA_LEX_FRIDMAN_PODCAST_446: <Content>{
    reference: {
      title: 'Maya, Aztec, Inca, and Lost Civilizations of South America | Lex Fridman Podcast #446',
      authors: [{name: 'Ed Barnhart'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=AzzE7GOvYz8"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_ROMAN_EMPIRE___RISE_AND_FALL_OF_ANCIENT_ROME_LEX_FRIDMAN_PODCAST_443: <Content>{
    reference: {
      title: 'The Roman Empire - Rise and Fall of Ancient Rome | Lex Fridman Podcast #443',
      authors: [{name: 'Gregory Aldrete'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=DyoVVSggPjY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_289_THE_NEXT_GENERATION_OF_PARTICLE_EXPERIMENTS: <Content>{
    reference: {
      title: 'Mindscape 289 | The Next Generation of Particle Experiments',
      authors: [{name: 'Cari Cesarotti'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=ELe3fvuTsdE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_291_THE_BIOLOGY_OF_DEATH_AND_AGING: <Content>{
    reference: {
      title: 'Mindscape 291 | The Biology of Death and Aging',
      authors: [{name: 'Venki Ramakrishnan'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=aNqwamgxNiU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MATHS_OF_QUANTUM_MECHANICS: <Content>{
    reference: {
      title: 'Maths of Quantum Mechanics',
      authors: [{name: 'Brandon Sandoval'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2023)',
      link: "https://www.youtube.com/watch?v=3nvbBEzfmE8&list=PL8ER5-vAoiHAWm1UcZsiauUGPlJChgNXC"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },

  COMPUTING_MACHINERY_AND_INTELLIGENCE: <Content>{
    reference: {
      title: 'Computing Machinery and Intelligence',
      authors: [{name: 'Alan M. Turing'}],
      organizations: [],
      year: '(1950)',
      link: "https://academic.oup.com/mind/article/LIX/236/433/986238?url=http://szyxflb.com&login=false"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  VON_NEUMANN_AND_LATTICE_THEORY: <Content>{
    reference: {
      title: 'Von Neumann and Lattice Theory',
      authors: [{name: 'Garrett Birkhoff'}],
      organizations: [],
      year: '(1958)',
      link: "https://projecteuclid.org/journals/bulletin-of-the-american-mathematical-society/volume-64/issue-3.P2/Von-Neumann-and-lattice-theory/bams/1183522370.pdf"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WHEN_EXACTLY_WILL_THE_ECLIPSE_HAPPEN_A_MULTIMILLENNIUM_TALE_OF_COMPUTATION: <Content>{
    reference: {
      title: 'When Exactly Will the Eclipse Happen? A Multimillennium Tale of Computation',
      authors: [{name: 'Stephen Wolfram'}],
      organizations: [ORGANIZATIONS.wolfram],
      year: '(2024)',
      link: "https://writings.stephenwolfram.com/2024/03/when-exactly-will-the-eclipse-happen-a-multimillennium-tale-of-computation/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ARE_ALL_FISH_THE_SAME_SHAPE_IF_YOU_STRETCH_THEM_THE_VICTORIAN_TALE_OF_ON_GROWTH_AND_FORM: <Content>{
    reference: {
      title: 'Are All Fish the Same Shape if You Stretch Them? The Victorian Tale of On Growth and Form',
      authors: [{name: 'Stephen Wolfram'}],
      organizations: [ORGANIZATIONS.wolfram],
      year: '(2017)',
      link: "https://writings.stephenwolfram.com/2017/10/are-all-fish-the-same-shape-if-you-stretch-them-the-victorian-tale-of-on-growth-and-form/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WHATS_REALLY_GOING_ON_IN_MACHINE_LEARNING_SOME_MINIMAL_MODELS: <Content>{
    reference: {
      title: 'What’s Really Going On in Machine Learning? Some Minimal Models',
      authors: [{name: 'Stephen Wolfram'}],
      organizations: [ORGANIZATIONS.wolfram],
      year: '(2024)',
      link: "https://writings.stephenwolfram.com/2024/08/whats-really-going-on-in-machine-learning-some-minimal-models/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_HYDROGEN_ATOM_INTRO_TO_QUANTUM: <Content>{
    reference: {
      title: 'The Hydrogen Atom: Intro to Quantum Physics',
      authors: [{name: 'Richard Behiel'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=-Y0XL-K0jy0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_287_INSTITUTIONS_AND_THE_LEGACY_OF: <Content>{
    reference: {
      title: 'Mindscape 287 | Institutions and the Legacy of History',
      authors: [{name: 'Jean-Paul Faguet'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '2024',
      link: "https://www.youtube.com/watch?v=FKVmYeU11y0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LIVE_SCIENCE_SPINAL_GRAPHS_HYPERGRAPH_CONFLUENCE_SYMMETRY_AND: <Content>{
    reference: {
      title: 'Live Science | Spinal Graphs | Hypergraph Confluence, Symmetry and Efficiency',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '2024',
      link: "https://www.youtube.com/watch?v=uZkqNDIOQLs"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LIVE_SCIENCE_INFRAGEOMETRY_CORRESPONDENCES_DIFFERENTIAL_GEOMETRY_HYPERGRAPH: <Content>{
    reference: {
      title: 'Live Science | Infrageometry: Correspondences | Differential Geometry, Hypergraph Rewriting',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '2024',
      link: "https://www.youtube.com/watch?v=Mr1zfZtoFX0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LIVE_SCIENCE_QUANTUM_PARADOXES_DELAYED_CHOICE_QUANTUM_ERASER_CHSH_GAME: <Content>{
    reference: {
      title: 'Live Science | Quantum Paradoxes | Delayed Choice Quantum Eraser, CHSH Game, Quasiprobabilities',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '2024',
      link: "https://www.youtube.com/watch?v=rTKSWObWtNE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CONSCIOUSNESS_BIOLOGY_UNIVERSAL_MIND_EMERGENCE_CANCER: <Content>{
    reference: {
      title: 'Consciousness, Biology, Universal Mind, Emergence, Cancer Research',
      authors: [{name: 'Michael Levin'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '2024',
      link: "https://www.youtube.com/watch?v=c8iFtaltX-s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_CRISIS_IN_FUNDAMENTAL_PHYSICS_IS_WORSE_THAN_YOU: <Content>{
    reference: {
      title: 'The Crisis in (Fundamental) Physics is Worse Than You Think...',
      authors: [{name: 'Sean Carroll'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '2024',
      link: "https://www.youtube.com/watch?v=9AoRxtYZrZo"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  NEURALINK_AND_THE_FUTURE_OF_HUMANITY_LEX_FRIDMAN_PODCAST: <Content>{
    reference: {
      title: 'Neuralink and the Future of Humanity | Lex Fridman Podcast #438',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '2024',
      link: "https://www.youtube.com/watch?v=Kbk9BiPhm7o"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PHYSICS_OF_LIFE_TIME_COMPLEXITY_AND_ALIENS_LEX_FRIDMAN_PODCAST: <Content>{
    reference: {
      title: 'Physics of Life, Time, Complexity, and Aliens | Lex Fridman Podcast #433',
      authors: [{name: 'Sara Walker'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '2024',
      link: "https://www.youtube.com/watch?v=wwhTfyX9J34"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PLURALISTIC_THE_DISENSHITTIFIED_INTERNET_STARTS_WITH_LOYAL_USER_AGENTS: <Content>{
    reference: {
      title: 'Pluralistic: The disenshittified internet starts with loyal "user agents"',
      authors: [{name: 'Cory Doctorow'}],
      organizations: [],
      year: '(2024)',
      link: "https://pluralistic.net/2024/05/07/treacherous-computing/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ELON_MUSK: <Content>{
    reference: {
      title: 'Elon Musk',
      authors: [{name: 'Walter Isaacson'}],
      organizations: [],
      year: '(2023)',
      link: "https://en.wikipedia.org/wiki/Elon_Musk_(Isaacson_book)"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  FUN_RAISING_FUNDING_SCHOOL_QA_SEMF: <Content>{
    reference: {
      title: 'Fun Raising | Funding & School Q&A + SEMF Social',
      authors: [{name: 'Fadi Shawki'}, {name: 'Álvaro Moreno Vallori'}, {name: 'Alejandro Sospedra Orellano'}, {name: 'Elena Isasi Theus'}, {name: 'Anmol Agrawal'}, {name: 'Carlos Zapata Carratalá'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '2024',
      link: "https://www.youtube.com/watch?v=FL8zNDbrAR0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HUMAN_MEMORY_IMAGINATION_DEJA_VU_AND_FALSE_MEMORIES_LEX_FRIDMAN_PODCAST: <Content>{
    reference: {
      title: 'Human Memory, Imagination, Deja Vu, and False Memories | Lex Fridman Podcast #430',
      authors: [{name: 'Charan Ranganath'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '2024',
      link: "https://www.youtube.com/watch?v=4iuepdI3wCU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  JUNGLE_APEX_PREDATORS_ALIENS_UNCONTACTED_TRIBES_AND_GOD_LEX_FRIDMAN_PODCAST: <Content>{
    reference: {
      title: 'Jungle, Apex Predators, Aliens, Uncontacted Tribes, and God | Lex Fridman Podcast #429',
      authors: [{name: 'Paul Rosolie'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '2024',
      link: "https://www.youtube.com/watch?v=pwN8u6HFH8U"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LONGEVITY_MEDITATION_PHILOSOPHIES_CONSCIOUSNESS_NATURE_OF: <Content>{
    reference: {
      title: 'Longevity, Meditation, Philosophies, Consciousness, Nature of Reality',
      authors: [{name: 'Bryan Johnson'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '2024',
      link: "https://www.youtube.com/watch?v=PXkhhHPUud4"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },

  REVERSE_ENGINEERING_SAME_THING_WE_DO_EVERY_WEEKEND_DOCUMENTING_THE_AMD_7900XTX_PART2: <Content>{
    reference: {
      title: 'Reverse engineering | same thing we do every weekend documenting the AMD 7900XTX Part2',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=Z04xTlLdZnc"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  RESEARCHING_DOCUMENTING_THE_AMD_7900XTX_SO_WE_CAN_UNDERSTAND_WHY_IT_CRASHES_RDNA_3: <Content>{
    reference: {
      title: 'Researching | documenting the AMD 7900XTX so we can understand why it crashes | RDNA 3',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=Y-0yZ1AHb0s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WHAT_MAKES_HIGH_DIMENSIONAL_NETWORKS_PRODUCE_LOW_DIM_ACTIVITY: <Content>{
    reference: {
      title: 'What makes high-dimensional networks produce low-dim. activity?',
      authors: [{name: 'Eric Shea-Brown'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2019)',
      link: "https://www.youtube.com/watch?v=toeX2mGWDbI"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LISA_RANDALL_DARK_MATTER_THEORETICAL_PHYSICS_AND_EXTINCTION_EVENTS_LEX_FRIDMAN_PODCAST_403: <Content>{
    reference: {
      title: 'Lisa Randall: Dark Matter, Theoretical Physics, and Extinction Events | Lex Fridman Podcast #403',
      authors: [{name: 'Lisa Randall'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2023)',
      link: "https://www.youtube.com/watch?v=VPaOy3G1-2A"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  REALITY_IS_A_PARADOX___MATHEMATICS_PHYSICS_TRUTH_LOVE_LEX_FRIDMAN_PODCAST_370: <Content>{
    reference: {
      title: 'Reality is a Paradox - Mathematics, Physics, Truth & Love | Lex Fridman Podcast #370',
      authors: [{name: 'Edward Frenkel'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '(2023)',
      link: "https://www.youtube.com/watch?v=Osh0-J3T2nY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_LANGLANDS_PROGRAM___NUMBERPHILE: <Content>{
    reference: {
      title: 'The Langlands Program - Numberphile',
      authors: [{name: 'Edward Frenkel'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2023)',
      link: "https://www.youtube.com/watch?v=4dyytPboqvE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  TIME_AND_QUANTUM_MECHANICS_SOLVED_LEE_SMOLIN: <Content>{
    reference: {
      title: 'Time and Quantum Mechanics SOLVED? | Lee Smolin',
      authors: [{name: 'Lee Smolin'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=uOKOodQXjhc"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  EDWARD_FRENKEL_INFINITY_AI_STRING_THEORY_DEATH_THE_SELF: <Content>{
    reference: {
      title: 'Edward Frenkel: Infinity, Ai, String Theory, Death, The Self',
      authors: [{name: 'Edward Frenkel'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2023)',
      link: "https://www.youtube.com/watch?v=n_oPMcvHbAc"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LIVE_SCIENCE_INFRAGEOMETRY_CORE_DEFINITIONS_DIFFERENTIAL_GEOMETRY_TANGENT_BUNDLES_FUNCTIONS: <Content>{
    reference: {
      title: 'Live Science | Infrageometry: Core Definitions | Differential Geometry, Tangent Bundles, Functions',
      authors: [{name: 'Nikolay Murzin'}, {name: 'Carlos Zapata-Carratalá'}, {name: 'James Wiles'}, {name: 'Utkarsh Bajaj'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=QxtG4tr6VY0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LIVE_SCIENCE_INFRAGEOMETRY_WORKING_SESSION_FUNCTIONS_EDGES_PLACES_BIPARTITE_GRAPHS: <Content>{
    reference: {
      title: 'Live Science | Infrageometry: Working Session | Functions, Edges-Places, Bipartite Graphs',
      authors: [{name: 'Nikolay Murzin'}, {name: 'Carlos Zapata-Carratalá'}, {name: 'James Wiles'}, {name: 'Utkarsh Bajaj'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=pdPBzPyJqcE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  FELLOW_FOCUS_RICHARD_ASSAR_METAMETAVERSE_ALIEN_MINDS_MACHINE_LEARNING_CELLULAR_AUTOMATA: <Content>{
    reference: {
      title: 'Fellow Focus | Richard Assar | MetaMetaverse, Alien Minds, Machine Learning Cellular Automata',
      authors: [{name: 'Nikolay Murzin'}, {name: 'Carlos Zapata-Carratalá'}, {name: 'James Wiles'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=xg9pAx4bupk"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  FELLOW_FOCUS_NIK_MURZIN_QUANTUM_FRAMEWORK: <Content>{
    reference: {
      title: 'Fellow Focus | Nik Murzin | Quantum Framework',
      authors: [{name: 'Nikolay Murzin'}, {name: 'Carlos Zapata-Carratalá'}, {name: 'James Wiles'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=eG6d8_2GuCw"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  EXPLORE_LEARN_THE_MAP_OF_INSTITUTE_RESEARCH_QUANTUM_PROBABILITIES_MULTICOMPUTATION_CAUSALITY: <Content>{
    reference: {
      title: 'Explore & Learn | The Map of Institute Research | Quantum Probabilities, Multicomputation, Causality',
      authors: [{name: 'Nikolay Murzin'}, {name: 'James Wiles'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=OKHrPZ6tT6M"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  EXPLORE_LEARN_THE_MAP_OF_INSTITUTE_RESEARCH_MULTICOMPUTATION_INFRAGEOMETRY_RULIAD: <Content>{
    reference: {
      title: 'Explore & Learn | The Map of Institute Research | Multicomputation, Infrageometry, Ruliad',
      authors: [{name: 'Carlos Zapata-Carratalá'}, {name: 'James Wiles'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=8F9YL887Bck"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  EXPLORE_LEARN_FUNDAMENTALS_WHATS_HYPE_ABOUT_HYPERGRAPHS_GRAPH_THEORY_HYPERMATRIX_ARITY: <Content>{
    reference: {
      title: 'Explore & Learn | Fundamentals: What\'s hype about Hypergraphs? | Graph Theory, Hypermatrix, Arity',
      authors: [{name: 'Carlos Zapata-Carratalá'}, {name: 'Richard Assar'}, {name: 'James Wiles'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=N3vGEp1uLvk"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_274_GIZEM_GUMUSKAYA_ON_BUILDING_ROBOTS_FROM_HUMAN_CELLS: <Content>{
    reference: {
      title: 'Mindscape 274 | Gizem Gumuskaya on Building Robots from Human Cells',
      authors: [{name: 'Gizem Gumuskaya'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=jwaOzmW3xfs"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  COMMUNITY_LIVESTREAM_DATA_DIMENSIONALITY: <Content>{
    reference: {
      title: 'Community Livestream | Data & Dimensionality',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=zBV1nLw2WuM"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E173: <Content>{
    reference: {
      title: 'All-In Podcast E173',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=z3Zzlgo-xZM"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E174: <Content>{
    reference: {
      title: 'All-In Podcast E174',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=hZp80SYIRlY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E175: <Content>{
    reference: {
      title: 'All-In Podcast E175',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=HKtlezdPNAI"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E176: <Content>{
    reference: {
      title: 'All-In Podcast E176',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=1ZQ33OnGFWE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CALCULUS_RATIOCINATOR_VS_CHARACTERISTICA_UNIVERSALIS_THE_TWO_TRADITIONS_IN_LOGIC_REVISITED: <Content>{
    reference: {
      title: 'Calculus Ratiocinator vs. Characteristica Universalis? The Two Traditions in Logic, Revisited',
      authors: [{name: 'Volker Peckhaus'}],
      organizations: [],
      year: '(2004)',
      link: "https://www.researchgate.net/publication/22838cus`6287_Calculus_Ratiocinator_vs_Characteristica_Universalis_The_two_traditions_in_logic_revisited"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CARGO_CULT_SCIENCE: <Content>{
    reference: {
      title: 'Cargo Cult Science',
      authors: [{name: 'Richard P. Feynman'}],
      organizations: [],
      year: '(1974)',
      link: "https://calteches.library.caltech.edu/51/2/CargoCult.htm"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MILLIONS_OF_CHILDREN_LEARN_ONLY_VERY_LITTLE_HOW_CAN_THE_WORLD_PROVIDE_A_BETTER_EDUCATION_TO_THE_NEXT_GENERATION: <Content>{
    reference: {
      title: 'Millions of children learn only very little. How can the world provide a better education to the next generation?',
      authors: [{name: 'Max Roser'}],
      organizations: [],
      year: '(2022)',
      link: "https://ourworldindata.org/better-learning"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  STRIPES_2023_ANNUAL_LETTER: <Content>{
    reference: {
      title: 'Stripe\'s 2023 annual letter',
      authors: [{name: 'Patrick Collison'}, {name: 'John Collison'}],
      organizations: [],
      year: '(2024)',
      link: "https://stripe.com/en-nl/annual-updates/2023"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PLAYING_VALUING_AND_LIVING_EXAMINING_NIETZSCHES_PLAYFUL_RESPONSE_TO_NIHILISM: <Content>{
    reference: {
      title: 'Playing, Valuing, and Living: Examining Nietzsche’s Playful Response to Nihilism',
      authors: [{name: 'Aaron Harper'}],
      organizations: [],
      year: '(2015)',
      link: "https://philpapers.org/rec/HARPVA-2"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_BUILD_YOUR_OWN_OPEN_GAMES_ENGINE_BOOTCAMP_PART_I_LENSES: <Content>{
    reference: {
      title: 'The Build Your Own Open Games Engine Bootcamp — Part I: Lenses',
      authors: [{name: 'Daniele Palombi'}],
      organizations: [],
      year: '(2024)',
      link: "https://blog.20squares.xyz/open-games-bootcamp-i/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CAN_AI_SOLVE_SCIENCE: <Content>{
    reference: {
      title: 'Can AI Solve Science?',
      authors: [{name: 'Stephen Wolfram'}, {name: 'Richard Assar'}, {name: 'Nik Murzin'}],
      organizations: [ORGANIZATIONS.wolfram],
      year: '(2024)',
      link: "https://writings.stephenwolfram.com/2024/03/can-ai-solve-science/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  COMMUNITY_LIVESTREAM_BIOELECTRICITY: <Content>{
    reference: {
      title: 'Community Livestream | Bioelectricity',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=XBNh3Yoxei0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  QUANTUM_GRAVITY_WOLFRAM_PHYSICS_PROJECT: <Content>{
    reference: {
      title: 'Quantum Gravity & Wolfram Physics Project',
      authors: [{name: 'Jonathan Gorard'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=ioXwL-c1RXQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PARADIGM_SHIFT_GHOST_PARTICLES_CONSTRUCTOR_THEORY: <Content>{
    reference: {
      title: 'Paradigm Shift, Ghost Particles, Constructor Theory',
      authors: [{name: 'Chiara Marletto'}, {name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=40CB12cj_aM&t=6443s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_STRING_THEORY_ICEBERG_EXPLAINED: <Content>{
    reference: {
      title: 'The String Theory Iceberg EXPLAINED',
      authors: [{name: 'Curt Jaimungal'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.toe],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=X4PdPnQuwjY&t=9496s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  EXPLORING_SNIFFING_NVIDIAS_IOCTLS_OPEN_GPU_KERNEL_MODULES_DEBUG_PTX_CUDA: <Content>{
    reference: {
      title: 'Exploring | sniffing NVIDIA\'s ioctls | open-gpu-kernel-modules | DEBUG | PTX | CUDA',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=rUsx1b7rQ8Q&t=9910s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_WRITING_A_FUZZER_AND_NOT_GETTING_TRIGGERED_WHEN_THE_AMD_GPU_CRASHES_UMR: <Content>{
    reference: {
      title: 'Programming | writing a fuzzer and not getting triggered when the AMD GPU crashes UMR',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=BCnTXwhzzxA&t=9780s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_RIPPING_OUT_ALL_OF_AMDS_USERSPACE_AMDGPU_IOCTLS_GPU_MEMORY_HSA_KFD: <Content>{
    reference: {
      title: 'Programming | ripping out all of AMD\'s userspace, AMDGPU ioctls | GPU memory | HSA KFD',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=-iH5wvFnsKs"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E169: <Content>{
    reference: {
      title: 'All-In Podcast E169',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=snbTCWL6rxo"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E170: <Content>{
    reference: {
      title: 'All-In Podcast E170',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=uMajFsCkzxY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E171: <Content>{
    reference: {
      title: 'All-In Podcast E171',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=3tEcLAud7Nc"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E172: <Content>{
    reference: {
      title: 'All-In Podcast E172',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=4t4YkHSTZbw"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  SHANNON_LUMINARY_LECTURE_SERIES___STEPHEN_FRY: <Content>{
    reference: {
      title: 'Shannon Luminary Lecture Series - Stephen Fry',
      authors: [{name: 'Stephen Fry'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2017)',
      link: "https://www.youtube.com/watch?v=24F6C1KfbjM"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CONTAINERS_FOR_COMPILER_ARCHITECTURE: <Content>{
    reference: {
      title: 'Containers for compiler architecture',
      authors: [{name: 'Andre Videla'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=BnzAxT-O0Y8"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WHY_IT_WAS_ALMOST_IMPOSSIBLE_TO_MAKE_THE_BLUE_LED: <Content>{
    reference: {
      title: 'Why It Was Almost Impossible to Make the Blue LED',
      authors: [{name: '@Veritasium'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=AF8d72mA41M"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  COMPOSITIONAL_GAME_THEORY_TOWARDS_INCENTIVES_MODELLING_AT_SCALE: <Content>{
    reference: {
      title: 'Compositional Game Theory – Towards Incentives Modelling at Scale',
      authors: [{name: 'Jules Hedges'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=2b4hxOP7g9I"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_268_MATT_STRASSLER_ON_RELATIVITY_FIELDS_AND_THE_LANGUAGE_OF_REALITY: <Content>{
    reference: {
      title: 'Mindscape 268 | Matt Strassler on Relativity, Fields, and the Language of Reality',
      authors: [{name: 'Matt Strassler'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=kCpELmx425w"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ACTINF_MATHSTREAM_0091_JONATHAN_GORARD_A_COMPUTATIONAL_PERSPECTIVE_ON_OBSERVATION_AND_COGNITION: <Content>{
    reference: {
      title: 'ActInf MathStream 009.1 ~ Jonathan Gorard: A computational perspective on observation and cognition',
      authors: [{name: 'Jonathan Gorard'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.active_inference_institute],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=I3rhsT-8isk"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  A_CONVERSATION_WITH_MARK_ZUCKERBERG_PATRICK_COLLISON_AND_TYLER_COWEN: <Content>{
    reference: {
      title: 'A Conversation with Mark Zuckerberg, Patrick Collison and Tyler Cowen',
      authors: [{name: 'Mark Zuckerberg'}, {name: 'Patrick Collison'}, {name: 'Tyler Cowen'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2019)',
      link: "https://about.fb.com/news/2019/11/a-conversation-with-mark-zuckerberg-patrick-collison-and-tyler-cowen/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  SOLVING_SAT_VIA_POSITIVE_SUPERCOMPILATION: <Content>{
    reference: {
      title: 'Solving SAT via Positive Supercompilation',
      authors: [{name: 'Tima Kinsart (Hirrolot)'}],
      organizations: [],
      year: '(2024)',
      link: "https://hirrolot.github.io/posts/sat-supercompilation.html) ; *Tima Kinsart (Hirrolot"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  NAVIGATING_COGNITION_SPATIAL_CODES_FOR_HUMAN_THINKING: <Content>{
    reference: {
      title: 'Navigating cognition: Spatial codes for human thinking',
      authors: [{name: 'Jacob L. S. Bellmund'}, {name: 'Peter Gärdenfors'}, {name: 'Edvard I. Moser'}, {name: 'Christian F. Doeller'}],
      organizations: [],
      year: '(2018)',
      link: "https://www.science.org/doi/10.1126/science.aat6766"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  TOWARDS_A_STRUCTURAL_TURN_IN_CONSCIOUSNESS_SCIENCE: <Content>{
    reference: {
      title: 'Towards a structural turn in consciousness science',
      authors: [{name: 'Johannes Kleiner'}],
      organizations: [],
      year: '(2024)',
      link: "https://pubmed.ncbi.nlm.nih.gov/38422757/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_GLASS_BEAD_GAME: <Content>{
    reference: {
      title: 'The Glass Bead Game',
      authors: [{name: 'Ralph Freedman'}],
      organizations: [],
      year: '(1970)',
      link: "https://www.nytimes.com/1970/01/04/archives/the-glass-bead-game-glass-bead.html"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  AN_INTRODUCTION_TO_HIGHER_ARITY_SCIENCE: <Content>{
    reference: {
      title: 'An Introduction to Higher Arity Science',
      authors: [{name: 'Carlos Zapata-Carratalá'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2021)',
      link: "https://www.youtube.com/watch?v=62UFbGsj5Jg"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HISTORY_OF_SCIENCE_AND_TECHNOLOGY_QA_FEBRUARY_28: <Content>{
    reference: {
      title: 'History of Science and Technology Q&A (February 28,',
      authors: [{name: 'Stephen Wolfram'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2024)',
      link: "https://www.youtube.com/watch?v=kNXXksujIHM"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  GRETA_SEMINAR_HIGHER_ARITY_ALGEBRA_VIA_HYPERGRAPH_REWRITING: <Content>{
    reference: {
      title: 'GReTA seminar: Higher-Arity Algebra via Hypergraph Rewriting',
      authors: [{name: 'Carlos Zapata-Carratalá'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=ZBjagJvNEn8"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WORKSHOP_AXIOMATIC_CREATION: <Content>{
    reference: {
      title: 'Workshop | Axiomatic Creation',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=StNfdknDQ9c"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  COMMUNITY_LIVESTREAM_AXIOMS_CREATIVITY: <Content>{
    reference: {
      title: 'Community Livestream | Axioms & Creativity',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=9ddJAJaYk_E"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CONCEPT_COLLIDER_GEOMETRY_OF_DATA_AND_NEURAL_CORRELATES: <Content>{
    reference: {
      title: 'Concept Collider | Geometry of Data and Neural Correlates',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=mROz1U4VkGY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WOLFRAM_PHYSICS_PROJECT_WORKING_SESSION___CAUSAL_MULTIWAY_SYSTEMS: <Content>{
    reference: {
      title: 'Wolfram Physics Project: Working Session - Causal Multiway Systems',
      authors: [{name: 'Stephen Wolfram'}, {name: 'Jonathan Gorard'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram],
      year: '(2020)',
      link: "https://www.youtube.com/watch?v=OXSE6KhRUF4"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  SCIENCE_RESEARCH_SESSION_HYPORULIAD: <Content>{
    reference: {
      title: 'Science Research Session: Hyporuliad',
      authors: [{name: 'Stephen Wolfram'}, {name: 'Jonathan Gorard'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram],
      year: '(2023)',
      link: "https://www.youtube.com/watch?v=lZaBjuHk7Ms"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  A_CONVERSATION_BETWEEN_BOB_COECKE_AND_STEPHEN_WOLFRAM: <Content>{
    reference: {
      title: 'A conversation between Bob Coecke and Stephen Wolfram',
      authors: [{name: 'Bob Coecke'}, {name: 'Stephen Wolfram'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram],
      year: '(2021)',
      link: "https://www.youtube.com/watch?v=8CUTXaGqvSQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  STEVE_JOBS: <Content>{
    reference: {
      title: 'Steve Jobs',
      authors: [{name: 'Walter Isaacson'}],
      organizations: [],
      year: '(2011)',
      link: "https://en.wikipedia.org/wiki/Steve_Jobs_(book)"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  JOHN_CLEESE_ON_CREATIVITY_IN_MANAGEMENT: <Content>{
    reference: {
      title: 'John Cleese on Creativity In Management',
      authors: [{name: 'John Cleese'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2017)',
      link: "https://www.youtube.com/watch?v=Pb5oIIPO62g"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_TRILLION_DOLLAR_EQUATION: <Content>{
    reference: {
      title: 'The Trillion Dollar Equation',
      authors: [{name: '@Veritasium'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(Veritasium)',
      link: "https://www.youtube.com/watch?v=A5w-dEgIU1M"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  STEVE_JOBS_PRESIDENT_CEO_NEXT_COMPUTER_CORP_AND_APPLE_MIT_SLOAN_DISTINGUISHED_SPEAKER_SERIES: <Content>{
    reference: {
      title: 'Steve Jobs President & CEO, NeXT Computer Corp and Apple. MIT Sloan Distinguished Speaker Series',
      authors: [{name: 'Steve Jobs'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(1992)',
      link: "https://www.youtube.com/watch?v=Gk-9Fd2mEnI"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CARL_SAGAN_AT_MIT___MANAGEMENT_IN_THE_YEAR_2000_SLOAN_SCHOOL_SYMPOSIUM: <Content>{
    reference: {
      title: 'Carl Sagan at MIT - Management in the Year 2000: Sloan School Symposium',
      authors: [{name: 'Carl Sagan'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(1987)',
      link: "https://www.youtube.com/watch?v=gLOZsTMuars"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CHAMATH_PALIHAPITIYA_SOCIALCAPITAL_STARTUP_GRIND: <Content>{
    reference: {
      title: 'Chamath Palihapitiya (SocialCapital) @ Startup Grind',
      authors: [{name: 'Chamath Palihapitiya'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2015)',
      link: "https://www.youtube.com/watch?v=ncjum-bkW98"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CHAMATH_PALIHAPITIYA_SPEAKING_AT_WATERLOO_INNOVATION_SUMMIT: <Content>{
    reference: {
      title: 'Chamath Palihapitiya speaking at Waterloo Innovation Summit',
      authors: [{name: 'Chamath Palihapitiya'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '(2016)',
      link: "https://www.youtube.com/watch?v=D82_ppT2iic"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E165: <Content>{
    reference: {
      title: 'All-In Podcast E165',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=FHO4hoXc75k"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ALL_IN_PODCAST_E164: <Content>{
    reference: {
      title: 'All-In Podcast E164',
      authors: [{name: 'Chamath Palihapitiya'}, {name: 'Jason Calacanis'}, {name: 'David Friedberg'}, {name: 'David O. Sacks'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.all_in],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=bUuEE2jmP2c"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CONCEPT_COLLIDER_MATHEMATICAL_PHYSICS_ACTIVE_INFERENCE_FREE_ENERGY_ENTROPY: <Content>{
    reference: {
      title: 'Concept Collider | Mathematical Physics + Active Inference, Free Energy & Entropy',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '(2024)',
      link: "https://www.youtube.com/watch?v=GwbLOCCI2yE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CRDTS_GO_BRRR: <Content>{
    reference: {
      title: 'CRDTs go brrr',
      authors: [{name: 'Seph Gentle'}],
      organizations: [],
      year: '2021',
      link: "https://josephg.com/blog/crdts-go-brrr/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THIS_WEEKS_FINDS_18_CATEGORIFYING_THE_QUANTUM_HARMONIC_OSCILLATOR: <Content>{
    reference: {
      title: 'This Week\'s Finds 18: categorifying the quantum harmonic oscillator',
      authors: [{name: 'John Baez'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=pvVm3L92pdc"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WOLFRAM_PHYSICS_PROJECT_WORKING_SESSION_QUANTUM_BLACK_HOLES_AND_OTHER_THINGS: <Content>{
    reference: {
      title: 'Wolfram Physics Project Working Session: Quantum Black Holes and Other Things',
      authors: [{name: 'Stephen Wolfram'}, {name: 'Jonathan Gorard'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram],
      year: '2023',
      link: "https://www.youtube.com/watch?v=fFEVq76_Pu0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CAUSAL_INVARIANCE_VERSUS_CONFLUENCE: <Content>{
    reference: {
      title: 'Causal invariance versus confluence',
      authors: [{name: 'Jonathan Gorard'}, {name: 'Mark Jeffery'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=LYFzm_xSWXw"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CRDTS_THE_HARD_PARTS: <Content>{
    reference: {
      title: 'CRDTs: The Hard Parts',
      authors: [{name: 'Martin Kleppmann'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2020',
      link: "https://www.youtube.com/watch?v=x7drE24geUw"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  RIAK_DYNAMO_FIVE_YEARS_LATER_PRESENTED: <Content>{
    reference: {
      title: 'Riak & Dynamo, Five Years Later Presented',
      authors: [{name: 'Andy Gross'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2013',
      link: "https://www.youtube.com/watch?v=AxG9DROsnqg"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  RIAK_CORE___AN_ERLANG_DISTRIBUTED_SYSTEMS_TOOLKIT: <Content>{
    reference: {
      title: 'Riak Core - An Erlang Distributed Systems Toolkit',
      authors: [{name: 'Andy Gross'}],
      organizations: [],
      year: '2011',
      link: "https://vimeo.com/21772889"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ZXLIVE___AN_INTERACTIVE_GUI_FOR_THE_ZX_CALCULUS___RAZIN_A_SHAIKH: <Content>{
    reference: {
      title: 'ZXLive - An Interactive GUI for the ZX Calculus - Razin A. Shaikh',
      authors: [{name: 'Razin A. Shaikh'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.zx_calculus],
      year: '2023',
      link: "https://www.youtube.com/watch?v=J--c2q-KOc8"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  GRAPHICAL_CSS_CODE_TRANSFORMATION_USING_ZX_CALCULUS: <Content>{
    reference: {
      title: 'Graphical CSS Code Transformation Using ZX Calculus',
      authors: [{name: 'Jiaxin Huang'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.zx_calculus],
      year: '2023',
      link: "https://www.youtube.com/watch?v=ZhfQxdjodNs"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_ZETA_CALCULUS: <Content>{
    reference: {
      title: 'The Zeta Calculus',
      authors: [{name: 'Nicklas Botö'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.zx_calculus],
      year: '2023',
      link: "https://www.youtube.com/watch?v=iUHEy3PZCso"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HOW_TO_TAKE_THE_FACTORIAL_OF_ANY_NUMBER: <Content>{
    reference: {
      title: 'How to Take the Factorial of Any Number',
      authors: [{name: '@Lines That Connect'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2022',
      link: "https://www.youtube.com/watch?v=v_HeaeUUOnc"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  JEFF_BEZOS_AMAZON_AND_BLUE_ORIGIN_LEX_FRIDMAN_PODCAST_405: <Content>{
    reference: {
      title: 'Jeff Bezos: Amazon and Blue Origin | Lex Fridman Podcast #405',
      authors: [{name: 'Jeff Bezos'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '2023',
      link: "https://www.youtube.com/watch?v=DcWqzZ3I2cY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HR_TALK_INTRO_TO_LARGE_LANGUAGE_MODELS: <Content>{
    reference: {
      title: '[1hr Talk] Intro to Large Language Models',
      authors: [{name: 'Andrej Karpathy'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=zjkBMFhNj_g"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  STREAM_0_WHY_ALL_VIDEO_GAME_PROGRAMMERS_SHOULD_LEARN_GEOMETRIC_ALGEBRA: <Content>{
    reference: {
      title: 'Stream #0: Why all video game programmers should learn geometric algebra',
      authors: [{name: 'Hamish Todd'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=pHKOdxgr5lE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  THE_PERIODIC_TABLE_OF_GEOMETRIC_ALGEBRAS___CL301_DOES_ALL_3D_GAME_MATH_SO_WHAT_DOES_CLPQR_D: <Content>{
    reference: {
      title: 'The Periodic Table of Geometric Algebras - CL(3,0,1) does all 3D game math, so what does CL(p,q,r) d',
      authors: [{name: 'Hamish Todd'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=oXcp3gA8erQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  GEOMETRIC_ALGEBRA_AS_A_TOOL_IN_TECHNICAL_COMMUNICATION: <Content>{
    reference: {
      title: 'Geometric Algebra as a tool in technical communication',
      authors: [{name: 'Hamish Todd'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2020',
      link: "https://www.youtube.com/watch?v=hR-MQm3c13Q"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_260_RICARD_SOLE_ON_THE_SPACE_OF_COGNITIONS: <Content>{
    reference: {
      title: 'Mindscape 260 | Ricard Solé on the Space of Cognitions',
      authors: [{name: 'Ricard Solé'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '2024',
      link: "https://www.youtube.com/watch?v=lJltHIlUHvQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_261_SANJANA_CURTIS_ON_THE_ORIGINS_OF_THE_ELEMENTS: <Content>{
    reference: {
      title: 'Mindscape 261 | Sanjana Curtis on the Origins of the Elements',
      authors: [{name: 'Sanjana Curtis'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '2024',
      link: "https://www.youtube.com/watch?v=V28YdLuYnjk"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_264_SABINE_STANLEY_ON_WHATS_INSIDE_PLANETS: <Content>{
    reference: {
      title: 'Mindscape 264 | Sabine Stanley on What\'s Inside Planets',
      authors: [{name: 'Sabine Stanley'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '2024',
      link: "https://www.youtube.com/watch?v=myU8GNdpPjU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_263_CHRIS_QUIGG_ON_SYMMETRY_AND_THE_BIRTH_OF_THE_STANDARD_MODEL: <Content>{
    reference: {
      title: 'Mindscape 263 | Chris Quigg on Symmetry and the Birth of the Standard Model',
      authors: [{name: 'Chris Quigg'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '2024',
      link: "https://www.youtube.com/watch?v=-q-HBIBiTQ0"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_262_ERIC_SCHWITZGEBEL_ON_THE_WEIRDNESS_OF_THE_WORLD: <Content>{
    reference: {
      title: 'Mindscape 262 | Eric Schwitzgebel on the Weirdness of the World',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mindscape],
      year: '2024',
      link: "https://www.youtube.com/watch?v=V0evRaWV_HU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  JUST_CHATTING_TECHNO_OPTIMISM_WINNING_OVER_NATURE_PROGRESSIVE_ACCELERATION: <Content>{
    reference: {
      title: 'Just Chatting | techno optimism | Winning over nature | Progressive | Acceleration',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2023',
      link: "https://www.youtube.com/watch?v=WS5wGal3ukw"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_DECISION_TRANSFORMER_REINFORCEMENT_LEARNING_RL_LUNARLANDER_PART_1: <Content>{
    reference: {
      title: 'Programming | Decision Transformer Reinforcement Learning (RL) | LunarLander | Part 1',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2024',
      link: "https://www.youtube.com/watch?v=8U8kK3SpLTU"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_RL_IS_DUMB_AND_DOESNT_WORK_REINFORCEMENT_LEARNING_LUNARLANDER_PART_2: <Content>{
    reference: {
      title: 'Programming | RL is dumb and doesn\'t work | Reinforcement Learning LunarLander Part 2',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2024',
      link: "https://www.youtube.com/watch?v=-tZkb0vgaDk"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  RESEARCHING_RL_IS_DUMB_AND_DOESNT_WORK_THEORY_REINFORCEMENT_LEARNING_PART_3: <Content>{
    reference: {
      title: 'Researching | RL is dumb and doesn\'t work (theory) | Reinforcement Learning | Part 3',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2024',
      link: "https://www.youtube.com/watch?v=Ul5-NKOP8RQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  RESEARCHING_MULTIGPU_WITH_HIP_OR_MAYBE_WITHOUT_HIP_HSA_HIP_GRAPH_PART_1: <Content>{
    reference: {
      title: 'Researching | multiGPU with HIP (or maybe without HIP) | HSA | HIP Graph | Part 1',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2024',
      link: "https://www.youtube.com/watch?v=X4J_GUhp9jI"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_MULTIGPU_WITH_HIP_OR_MAYBE_WITHOUT_HIP_HSA_DISABLE_CACHE1_PART_2: <Content>{
    reference: {
      title: 'Programming | multiGPU with HIP (or maybe without HIP) | HSA_DISABLE_CACHE=1 | Part 2',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2024',
      link: "https://www.youtube.com/watch?v=kh2z9J_gXWg"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  STRING_DIAGRAM_REWRITE_THEORY_II_REWRITING_WITH_SYMMETRIC_MONOIDAL_STRUCTURE: <Content>{
    reference: {
      title: 'String Diagram Rewrite Theory II: Rewriting with Symmetric Monoidal Structure',
      authors: [{name: 'Filippo Bonchi'}, {name: 'Fabio Gadducci'}, {name: 'Aleks Kissinger'}, {name: 'Pawel Sobocinski'}, {name: 'Fabio Zanasi'}],
      organizations: [],
      year: '2022',
      link: "https://arxiv.org/abs/2104.14686"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CHYP_COMPOSING_HYPERGRAPHS_PROVING_THEOREMS: <Content>{
    reference: {
      title: 'Chyp: Composing Hypergraphs, Proving Theorems',
      authors: [{name: 'Aleks Kissinger'}],
      organizations: [],
      year: '2023',
      link: "https://act2023.github.io/papers/paper25.pdf"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  OBSERVER_THEORY: <Content>{
    reference: {
      title: 'Observer Theory',
      authors: [{name: 'Stephen Wolfram'}],
      organizations: [],
      year: '2023',
      link: "https://writings.stephenwolfram.com/2023/12/observer-theory/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WASM_SPECTEC_ENGINEERING_A_FORMAL_LANGUAGE_STANDARD: <Content>{
    reference: {
      title: 'Wasm SpecTec: Engineering a Formal Language Standard',
      authors: [{name: 'Joachim Breitner'}, {name: 'Philippa Gardner'}, {name: 'Jaehyun Lee'}, {name: 'Sam Lindley'}, {name: 'Matija Pretnar'}, {name: 'Xiaojia Rao'}, {name: 'Andreas Rossberg'}, {name: 'Sukyoung Ryu'}, {name: 'Wonho Shin'}, {name: 'Conrad Watt'}, {name: 'Dongjun Youn'}],
      organizations: [ORGANIZATIONS.wasm],
      year: '2023',
      link: "https://arxiv.org/pdf/2311.07223.pdf"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  MINDSCAPE_259_ADAM_FRANK_ON_WHAT_ALIENS_MIGHT_BE_LIKE: <Content>{
    reference: {
      title: 'Mindscape 259 | Adam Frank on What Aliens Might Be Like',
      authors: [{name: 'Adam Frank'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.preposterous_universe],
      year: '2023',
      link: "https://www.youtube.com/watch?v=UzmlA3g2nRE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  ANIMATION_VS_PHYSICS: <Content>{
    reference: {
      title: 'Animation vs. Physics',
      authors: [{name: 'Alan Becker + Team'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=ErMSHiQRnc8"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  WHY_LIGHT_CAN_SLOW_DOWN_AND_WHY_IT_DEPENDS_ON_COLOR_OPTICS_PUZZLES: <Content>{
    reference: {
      title: 'Why light can “slow down”, and why it depends on color | Optics puzzles',
      authors: [{name: '3Blue1Brown'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=KTzGBJPuJwM"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  LEE_CRONIN_CONTROVERSIAL_NATURE_PAPER_ON_EVOLUTION_OF_LIFE_AND_UNIVERSE_LEX_FRIDMAN_PODCAST_404: <Content>{
    reference: {
      title: 'Lee Cronin: Controversial Nature Paper on Evolution of Life and Universe | Lex Fridman Podcast #404',
      authors: [{name: 'Lee Cronin'}, {name: 'Lex Fridman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.lex_fridman_podcast],
      year: '2023',
      link: "https://www.youtube.com/watch?v=CGiDqhSdLHk"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  BERKELEY_SEMINAR_DAVID_JAZ_MYERS_872023: <Content>{
    reference: {
      title: 'Berkeley Seminar: David Jaz Myers, 8/7/2023',
      authors: [{name: 'David Jaz Myers'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.topos_institute],
      year: '2023',
      link: "https://www.youtube.com/watch?v=WvniD62U_W4"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  YUGOSLAVIAS_DIGITAL_TWIN: <Content>{
    reference: {
      title: 'Yugoslavia’s Digital Twin',
      authors: [{name: 'Kaloyan Kolev'}],
      organizations: [],
      year: '2023',
      link: "https://www.thedial.world/issue-9/yugolsav-wars-yu-domain-history-icann"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PHYSICS_EXPLAINS_WHY_THERE_IS_NO_INFORMATION_ON_SOCIAL_MEDIA: <Content>{
    reference: {
      title: 'Physics explains why there is no information on social media',
      authors: [{name: 'Tiernan Ray'}],
      organizations: [],
      year: '2021',
      link: "https://www.zdnet.com/article/physics-explains-why-there-is-no-information-on-social-media/"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HOW_TO_ASK_QUESTIONS_THE_SMART_WAY: <Content>{
    reference: {
      title: 'How To Ask Questions The Smart Way',
      authors: [{name: 'Eric S. Raymond'}, {name: 'Rick Moen'}],
      organizations: [],
      year: '2001-2014',
      link: "http://www.catb.org/~esr/faqs/smart-questions.html"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  COMPLEXITY_MATHEMATICS_COMMUNITY_LIVESTREAM: <Content>{
    reference: {
      title: 'Complexity & Mathematics | Community Livestream',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '2023',
      link: "https://www.youtube.com/watch?v=MWQ7XFjkOhs"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  HOLIDAY_SPECIAL_LIVESTREAM: <Content>{
    reference: {
      title: 'Holiday Special Livestream',
      authors: [{name: ''}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '2023',
      link: "https://www.youtube.com/watch?v=m_rATW4Nrqk"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  JUST_CHATTING_TESLA_AI_DAY_2022_SCIENCE_TECHNOLOGY: <Content>{
    reference: {
      title: 'Just Chatting | Tesla AI Day 2022 | Science & Technology',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2022',
      link: "https://www.youtube.com/watch?v=lSXwIzww6Us"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_MISTRAL_MIXTRAL_ON_A_TINYBOX_AMD_P2P_MULTI_GPU_MIXTRAL_8X7B_32KSEQLEN: <Content>{
    reference: {
      title: 'Programming | Mistral mixtral on a tinybox | AMD P2P multi-GPU mixtral-8x7b-32kseqlen',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=H40QRJFzThQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_WHAT_IS_THE_Q_ALGORITHM_OPENAI_Q_STAR_ALGORITHM_MISTRAL_7B_PRM800K: <Content>{
    reference: {
      title: 'Programming | what is the Q* algorithm? OpenAI Q Star Algorithm | Mistral 7B | PRM800K',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=2QO3vzwHXhg"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  JUST_CHATTING_EFFECTIVE_ACCELERATIONISM_EACC_TECHNO_PESSIMISM_DECELERATION: <Content>{
    reference: {
      title: 'Just Chatting | effective accelerationism | e/acc | Techno-pessimism | Deceleration',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=YrWEDOQQ8pw"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  SCIENCE_THERMODYNAMICS_IS_TO_ENERGY_AS_IS_TO_INTELLIGENCE: <Content>{
    reference: {
      title: 'Science | Thermodynamics is to Energy as ??? is to Intelligence',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=vn9Dq24RDn8"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  SCIENCE_THERMODYNAMICS_IS_TO_ENERGY_AS_ENTROPICS_IS_TO_INTELLIGENCE_PART_2: <Content>{
    reference: {
      title: 'Science | Thermodynamics is to Energy as Entropics is to Intelligence | Part 2',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=mEoiQ_PZNTE"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_A_TINY_TOUR_THROUGH_TINYGRAD_NOOB_LESSON: <Content>{
    reference: {
      title: 'Programming | a tiny tour through tinygrad (noob lesson)',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2023',
      link: "https://www.youtube.com/watch?v=-MhwhiReY-s"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  PROGRAMMING_TINYGRAD_WRITING_TUTORIALS_FOR_NOOBS: <Content>{
    reference: {
      title: 'Programming | tinygrad: writing tutorials for noobs',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2023',
      link: "https://www.youtube.com/watch?v=Sk35MKtCXfQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  RANT_COMPLAINING_ABOUT_HOW_TERRIBLE_QUALCOMM_IS_THE_BUSINESS_WORLD: <Content>{
    reference: {
      title: 'Rant | Complaining about how terrible Qualcomm is | The business world',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2023',
      link: "https://www.youtube.com/watch?v=rzb2cuT9vaY"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  CHATTING_CHALLENGES_HIRING_PEOPLE_VISION_BUILDING_A_COMPANY_TINY_CORP_TINYGRADORG: <Content>{
    reference: {
      title: 'Chatting | challenges hiring people, vision, building a company tiny corp tinygrad.org',
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2023',
      link: "https://www.youtube.com/watch?v=4_6eY-8dibI"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },
  READING_TALKING_LETS_READ_ML_PAPERS: <Content>{
    reference: {
      title: `Reading & Talking | let's read ML papers`,
      authors: [{name: 'George Hotz'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.tinycorp],
      year: '2023',
      link: "https://www.youtube.com/watch?v=YrWEDOQQ8pw"
    }, status: Viewed.VIEWED, viewed_at: "2023, December"
  },

  STRING_DIAGRAM_REWRITE_THEORY_I: <Content>{
    reference: {
      title: 'String Diagram Rewrite Theory I: Rewriting with Frobenius Structure',
      authors: [{name: 'Filippo Bonchi'}, {name: 'Fabio Gadducci'}, {name: 'Aleks Kissinger'}, {name: 'Pawel Sobocinski'}, {name: 'Fabio Zanasi'},],
      year: '2023',
      link: "https://arxiv.org/abs/2012.01847"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  REPTAR: <Content>{
    reference: {
      title: 'Reptar',
      authors: [{name: 'Tavis Ormandy'}],
      year: '2023',
      link: "https://lock.cmpxchg8b.com/reptar.html"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  AGGREGATION_AND_TILING_AS_MULTICOMPUTATIONAL_PROCESSES: <Content>{
    reference: {
      title: 'Aggregation and Tiling as Multicomputational Processes',
      authors: [{name: 'Stephen Wolfram'}],
      year: '2023',
      link: "https://writings.stephenwolfram.com/2023/11/aggregation-and-tiling-as-multicomputational-processes/"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  PHYSICS_AND_ECONOMICS_SEMF_COMMUNITY_LIVESTREAM: <Content>{
    reference: {
      title: 'Physics & Economics | SEMF Community Livestream',
      authors: [],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.semf],
      year: '2023',
      link: "https://www.youtube.com/watch?v=enR68VVQPtY"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  WOLFRAM_INSTITUTES_INFRAGEOMETRY_LIVESTREAMS: <Content>{
    reference: {
      title: 'Wolfram Institute\'s Infrageometry Project Livestreams',
      authors: [{name: 'Jonathan Gorard'}, {name: 'Carlos Zapata-Carratalá'}, {name: 'Nikolay Murzin'}, {name: 'Utkarsh Bajaj'},],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '2023',
      link: "https://www.youtube.com/playlist?list=PLtbvsohNkWeVO_PMxoZfDEiiY8tuYOjgf"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  HYPERMATRIX_WORKSHOP: <Content>{
    reference: {
      title: 'HyperMatrix Workshop',
      authors: [{name: 'Edinah Koffi Gnang'}, {name: 'Richard Kerner'}, {name: 'Luke Oeding'}, {name: 'Joshua Grochow'}, {name: 'Harm Derksen'}, {name: 'Tali Beynon'}, {name: 'Michel Rausch'}, {name: 'Carlos Zapata-Carratalá'},],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.wolfram_institute],
      year: '2023',
      link: "https://www.youtube.com/watch?v=E8s9Daqy_2A"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  WOLFRAM_PHYSICS_PROJECT_RELATIONS_TO_CATEGORY_THEORY: <Content>{
    reference: {
      title: 'Wolfram Physics Project: Relations to Category Theory',
      authors: [{name: 'Stephen Wolfram'}, {name: 'Fabrizio Remano Genovese'}, {name: 'Matteo Capucci'}, {name: 'Jonathan Gorard'}, {name: 'Tali Beynon'},],
      organizations: [ORGANIZATIONS.youtube],
      year: '2020',
      link: "https://www.youtube.com/watch?v=0LAtNXo9rbE"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  ALL_CONCEPTS_ARE_CAT_SHARP: <Content>{
    reference: {
      title: 'All Concepts are Cat#',
      authors: [{name: 'David Spivak'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.topos_institute],
      year: '2023',
      link: "https://www.youtube.com/watch?v=_1-rueSZMGc"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  HIGHER_CATEGORY_THEORY_IN_CAT_SHARP: <Content>{
    reference: {
      title: '(Higher) category theory in Cat^#',
      authors: [{name: 'Brandon Shapiro'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.topos_institute],
      year: '2023',
      link: "https://www.youtube.com/watch?v=AKyHHykroWg"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  ABSTRACTION_ENGINEERING_WITH_THE_PVS: <Content>{
    reference: {
      title: 'Abstraction Engineering with the Prototype Verification System (PVS)',
      authors: [{name: 'Nat Shankar'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.topos_institute],
      year: '2023',
      link: "https://www.youtube.com/watch?v=MHf07noO9KA"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  CAUSAL_VS_ACAUSAL_MODELING_BY_EXAMPLE: <Content>{
    reference: {
      title: 'Causal vs Acausal Modeling By Example: Why Julia ModelingToolkit.jl Scales',
      authors: [{name: 'Chris Rackauckas'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=ZYkojUozeC4"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  RP_159: <Content>{
    reference: {
      title: 'Entropic Gravity, Black Holes, and the Holographic Principle | RP#159',
      authors: [{name: 'Erik Verlinde'}, {name: 'Robinson Erhardt'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=TgQg1Oy37r0"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  RP_118: <Content>{
    reference: {
      title: 'Quantum Physics, the Multiverse, and Time Travel | RP #118',
      authors: [{name: 'Slavoj Žižek'}, {name: 'Sean Carroll'}, {name: 'Robinson Erhardt'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=735mYcl3Lrg"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  MINDSCAPE_256: <Content>{
    reference: {
      title: 'Mindscape 256 | Kelly & Zach Weinersmith on Building Cities on the Moon and Mars',
      authors: [{name: 'Kelly & Zach Weinersmith'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.preposterous_universe],
      year: '2023',
      link: "https://www.youtube.com/watch?v=dJqr_cCi9tM"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  THIS_WEEKS_FINDS_15: <Content>{
    reference: {
      title: 'This Week\'s Finds 15: combinatorics, groupoid cardinality and species',
      authors: [{name: 'John Baez'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=yLtgs7Fz8aw"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  THIS_WEEKS_FINDS_14: <Content>{
    reference: {
      title: 'This Week\'s Finds 14: the 3-strand braid group',
      authors: [{name: 'John Baez'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=MnS4hduP5xg"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  SCALES_AND_SCIENCE_FICTION_WITH_BIOLOGIST_MICHAEL_LEVIN: <Content>{
    reference: {
      title: 'Scales and Science Fiction with Biologist Michael Levin',
      authors: [{name: 'Michael Levi'}, {name: 'Andrea Hiott'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=n15xS4YcyG0"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  DELIMITED_CONTINUATIONS_FOR_EVERYONE: <Content>{
    reference: {
      title: 'Delimited Continuations for Everyone',
      authors: [{name: 'Kenichi Asai'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.papers_we_love],
      year: '2017',
      link: "https://www.youtube.com/watch?v=QNM-njddhIw"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  HOMOTOPY_TYPE_THEORY_101: <Content>{
    reference: {
      title: 'Homotopy Type Theory 101',
      authors: [{name: 'Carlo Angiuli'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=VMqF06fDljU"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  FROM_CATEGORICAL_SYSTEMS_THEORY_TO_CATEGORICAL_CYBERNETICS: <Content>{
    reference: {
      title: 'From categorical systems theory to categorical cybernetics',
      authors: [{name: 'Matteo Capucci'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2022',
      link: "https://www.youtube.com/watch?v=wtgfyjFIHBQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  THE_SEARCH_FOR_THE_PERFECT_DOOR: <Content>{
    reference: {
      title: 'The Search for the Perfect Door',
      authors: [{name: 'Deviant Ollam'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2016',
      link: "https://www.youtube.com/watch?v=4YYvBLAF4T8"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  EVOLVING_BRAINS_SOLID_LIQUID_AND_SYNTHETIC: <Content>{
    reference: {
      title: 'Evolving Brains: Solid, Liquid and Synthetic',
      authors: [{name: 'Ricard Solé'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.santa_fe_institute],
      year: '2023',
      link: "https://www.youtube.com/watch?v=EIb5-LJbcIM"
    }, status: Viewed.VIEWED, viewed_at: "2023, November"
  },

  CRITICAL_THINKING_1: <Content>{
    reference: {
      title: 'Critical Thinking - Episode 1: Introductions, Bug Bounty Reports, and BB Tips',
      authors: [{name: 'Joel Margolis'}, {name: 'Justin Gardner'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.criticalthinkingpodcast.io/episode-1-introductions-bug-bounty-reports-and-bb-tips/"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  MINDSCAPE_253: <Content>{
    reference: {
      title: 'Mindscape 253 | David Deutsch on Science, Complexity, and Explanation',
      authors: [{name: 'David Deutsch'}, {name: 'Sean Carroll'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=ldgK7EhEnto"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  PAST_PRESENT_AND_FUTURE_OF_MATHEMATICS: <Content>{
    reference: {
      title: 'Past, Present, & Future of Mathematics',
      authors: [{name: 'Grant Sanderson'}, {name: 'Dwarkesh Patel'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=oDyviiN4NVo"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  GOD_MODE_UNLOCKED_HARDWARE_BACKDOORS_IN_X86_CPUS: <Content>{
    reference: {
      title: 'GOD MODE UNLOCKED - Hardware Backdoors in x86 CPUs',
      authors: [{name: 'Christopher Domas'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2018',
      link: "https://www.youtube.com/watch?v=_eSAF_qT_FY"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  BREAKING_THE_X86_INSTRUCTION_SET: <Content>{
    reference: {
      title: 'Breaking the x86 Instruction Set',
      authors: [{name: 'Christopher Domas'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2017',
      link: "https://www.youtube.com/watch?v=KrksBdWcZgQ"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  REDUCTIO_AD_ABSURDUM: <Content>{
    reference: {
      title: 'reductio ad absurdum',
      authors: [{name: 'Christopher Domas'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2017',
      link: "https://www.youtube.com/watch?v=NmWwRmvjAE8"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  THE_RING_0_FACADE_AWAKENING_THE_PROCESSORS_INNER_DEMONS: <Content>{
    reference: {
      title: 'The Ring 0 Facade Awakening the Processors Inner Demons',
      authors: [{name: 'Christopher Domas'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2018',
      link: "https://www.youtube.com/watch?v=XH0F9r0siTI"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  THE_DISCOVER_OF_ZENBLEED: <Content>{
    reference: {
      title: 'The Discovery of Zenbleed',
      authors: [{name: 'Tavis Ormandy'}, {name: ' Fabian Faessler (LiveOverflow)'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=neWc0H1k2Lc"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  HIGHER_ORDER_COMPANY_ORIGINS_OF_THE_HVM: <Content>{
    reference: {
      title: 'Higher Order Company - Origins of the HVM',
      authors: [{name: 'Victor Taelin'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=UQNNs77SpXA"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  MLST_OBSERVERS: <Content>{
    reference: {
      title: 'MLST - Observers',
      authors: [{name: 'Stephen Wolfram'}, {name: 'Karl Friston'}, {name: 'Keith Duggar'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.mlst],
      year: '2023',
      link: "https://www.youtube.com/watch?v=6iaT-0Dvhnc"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  COMPOSITIONAL_INTELLIGENCE: <Content>{
    reference: {
      title: 'Compositional Intelligence',
      authors: [{name: 'Bob Coecke'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.topos_institute],
      year: '2022',
      link: "https://www.youtube.com/watch?v=03ZPDyj8TtM"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  MODERNIZING_COMPILER_DESIGN_FOR_CARBON_TOOLCHAIN: <Content>{
    reference: {
      title: 'Modernizing Compiler Design for Carbon Toolchain',
      authors: [{name: 'Chandler Carruth'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=ZI198eFghJk"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  YASP_EPISODE_2: <Content>{
    reference: {
      title: 'Automated Reasoning, SMT Solvers, Artificial Intelligence • YASP #2',
      authors: [{name: 'Clark Barrett'}],
      organizations: [ORGANIZATIONS.youtube],
      year: '2023',
      link: "https://www.youtube.com/watch?v=RVjQkUI0kcw"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  CURSORLESS_A_SPOKEN_LANGUAGE_FOR_EDITING_CODE: <Content>{
    reference: {
      title: 'Cursorless: A spoken language for editing code',
      authors: [{name: 'Pokey Rule'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '2023',
      link: "https://www.youtube.com/watch?v=NcUJnmBqHTY"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  COMPUTATIONAL_PHSYICS_BEYOND_THE_GLASS: <Content>{
    reference: {
      title: 'Computational Physics, Beyond the Glass',
      authors: [{name: 'Sam Ritchie'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '2023',
      link: "https://www.youtube.com/watch?v=Jv2JgzAl5yU"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  AN_APPROACH_TO_COMPUTING_AND_SUSTAINABILITY_INSPIRED_FROM_PERMACULTURE: <Content>{
    reference: {
      title: 'An approach to computing and sustainability inspired from permaculture',
      authors: [{name: 'Devine Lu Linvega'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '2023',
      link: "https://www.youtube.com/watch?v=T3u7bGgVspM"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  THE_ECONOMICS_OF_PROGRAMMING_LANGUAGES: <Content>{
    reference: {
      title: 'The Economics of Programming Languages',
      authors: [{name: 'Evan Czaplicki'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '2023',
      link: "https://www.youtube.com/watch?v=XZ3w_jec1v8"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  WAR_TIME_PROOFS_AND_FUTURISTIC_PROGRAMS: <Content>{
    reference: {
      title: 'War Time Proofs and Futuristic Programs',
      authors: [{name: 'Valeria de Paiva'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '2023',
      link: "https://www.youtube.com/watch?v=4_6uboxUYR8"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  FROM_GEOMETRY_TO_ALGEBRA_AND_BACK_AGAIN_4000_YEARS_OF_PAPERS: <Content>{
    reference: {
      title: 'From Geometry to Algebra and Back Again: 4000 Years of Papers',
      authors: [{name: 'Jack Rusher'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '2023',
      link: "https://www.youtube.com/watch?v=1cRFfYQYGxE"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },

  WE_REALLY_DONT_KNOW_HOW_TO_COMPUTE: <Content>{
    reference: {
      title: 'We Really Don\'t Know How to Compute!',
      authors: [{name: 'Gerald Sussman'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '2023',
      link: "https://www.youtube.com/watch?v=HB5TrK7A4pI"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },
  WHY_PROGRAMMING_LANGUAGES_MATTER: <Content>{
    reference: {
      title: 'Why Programming Languages Matter',
      authors: [{name: 'Andrew Black'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop],
      year: '2023',
      link: "https://www.youtube.com/watch?v=JqYCt9rTG8g"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },
  IPVM_SEAMLESS_SERVICES_FOR_AN_OPEN_WORLD: <Content>{
    reference: {
      title: 'IPVM: Seamless Services for an Open World',
      authors: [{name: 'Brooklyn Zelenka'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop, ORGANIZATIONS.wasm],
      year: '2023',
      link: "https://www.youtube.com/watch?v=Z5U8JQZXABs"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },
  INSIDE_THE_WIZARD_RESEARCH_ENGINE: <Content>{
    reference: {
      title: 'Inside the Wizard Research Engine',
      authors: [{name: 'Ben L. Titzer'}],
      organizations: [ORGANIZATIONS.youtube, ORGANIZATIONS.strangeloop, ORGANIZATIONS.wasm],
      year: '2023',
      link: "https://www.youtube.com/watch?v=43ENxjq2Vhc"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },
  CURRY_HOWARD_IS_OVERRATED: <Content>{
    reference: {
      title: 'Curry-Howard is overrated',
      authors: [{name: 'Simon Cruanes'}],
      year: '2021',
      link: "https://blag.cedeela.fr/curry-howard-scam/"
    }, status: Viewed.VIEWED, viewed_at: "2023, October"
  },
  DUNE: <Content>{
    reference: {
      title: 'Dune',
      authors: [{name: 'Herbert, Frank'}],
      published: [{name: 'Ace Books'}],
      year: '1965',
      link: "https://en.wikipedia.org/wiki/Dune_(novel)"
    }, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2021"
  },
  DUNE_MESSIAH: <Content>{
    reference: {
      title: 'Dune Messiah',
      authors: [{name: 'Herbert, Frank'}],
      published: [{name: 'Ace Books'}],
      year: '1969',
      link: 'https://en.wikipedia.org/wiki/Dune_Messiah'
    }, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2021"
  },
  CHILDREN_OF_DUNE: <Content>{
    reference: {
      title: "Children of Dune",
      authors: [{name: "Herbert, Frank"}],
      published: [{name: "Ace Books"}],
      year: "1976",
      link: "https://en.wikipedia.org/wiki/Children_of_Dune"
    }, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2021"
  },
  GOD_EMPEROR_OF_DUNE: <Content>{
    reference: {
      title: "God Emperor of Dune",
      authors: [{name: "Herbert, Frank"}],
      published: [{name: "Ace Books"}],
      year: "1981",
      link: "https://en.wikipedia.org/wiki/God_Emperor_of_Dune",
    }, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2022"
  },
  HERETICS_OF_DUNE: <Content>{
    reference: {
      title: "Heretics of Dune",
      authors: [{name: "Herbert, Frank"}],
      published: [{name: "Ace Books"}],
      year: "1984",
      link: "https://en.wikipedia.org/wiki/Heretics_of_Dune"
    }, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2022"
  },
  CHAPTERHOUSE_DUNE: <Content>{
    reference: {
      title: "Chapterhouse: Dune",
      authors: [{name: "Herbert, Frank"}],
      published: [{name: "Ace Books"}],
      year: "1985",
      link: "https://en.wikipedia.org/wiki/Chapterhouse:_Dune"
    }, status: Viewed.IN_PROGRESS, found_at: "2021", viewed_at: "2022 - "
  },

  FLUID_CONCEPTS_AND_CREATIVE_ANALOGIES: <Content>{
    reference: {
      title: "Fluid concepts and creative analogies: Computer models of the fundamental mechanisms of thought",
      authors: [{name: "Hofstadter, Douglas R"}],
      published: [{name: "Basic books"}],
      year: "1995",
      link: "https://en.wikipedia.org/wiki/Fluid_Concepts_and_Creative_Analogies",
    }, status: Viewed.VIEWED, found_at: "January, 2022", viewed_at: "January, 2022 - May, 2022"
  },

  GODEL_ESCHER_BACH: <Content>{
    reference: {
      title: "Gödel, escher, bach",
      authors: [{name: "Hofstadter, Douglas R"}],
      published: [{name: "New York: Basic books"}],
      year: "1979",
      link: "https://en.wikipedia.org/wiki/G%C3%B6del,_Escher,_Bach",
    }, status: Viewed.IN_PROGRESS, found_at: "March, 2022", viewed_at: "March, 2022 - "
  },

  QUANTUM_EINSTEIN_BOHR_AND_THE_GREAT_DEBATE_ABOUT_THE_NATURE_OF_REALITY: <Content>{
    reference: {
      title: "Quantum: Einstein, Bohr and the great debate about the nature of reality",
      authors: [{name: "Kumar, Manjit"}],
      published: [{name: "Icon Books Ltd"}],
      year: "2008",
      link: "https://en.wikipedia.org/wiki/Quantum_(book)",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "2022 - October, 2022"
  },

  THE_ART_OF_WAR: <Content>{
    reference: {
      title: "The Art of War / Sun Tzu",
      authors: [{name: "Cleary, Thomas"}],
      published: [{name: "Thomas Clearly translation. Shambhala Publications"}],
      year: "6th cent. B.C.",
      link: "https://en.wikipedia.org/wiki/Thomas_Cleary",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "2022", archived: true
  },

  _1984: <Content>{
    reference: {
      title: "1984",
      authors: [{name: "Orwell, George"}],
      published: [{name: "Secker & Warburg"}],
      year: "1949",
      link: "https://en.wikipedia.org/wiki/Nineteen_Eighty-Four",
    }, status: Viewed.VIEWED, found_at: "2021", viewed_at: "2021"
  },

  ANIMAL_FARM: <Content>{
    reference: {
      title: "Animal Farm",
      authors: [{name: "Orwell, George"}],
      published: [{name: "Secker & Warburg"}],
      year: "1945",
      link: "https://en.wikipedia.org/wiki/Animal_Farm",
    }, status: Viewed.IN_PROGRESS, found_at: "2021", viewed_at: "2021", archived: true
  },

  THE_FUTURE_OF_HUMANITY: <Content>{
    reference: {
      title: "The Future of Humanity: Terraforming Mars, Interstellar Travel, Immortality, and Our Destiny Beyond Earth",
      authors: [{name: "Kaku, Michio"}],
      published: [{name: "Doubleday"}],
      year: "2018",
      link: "https://en.wikipedia.org/wiki/The_Future_of_Humanity",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November, 2022"
  },

  FOUNDATION: <Content>{
    reference: {
      title: "Foundation",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Gnome Press"}],
      year: "1951",
      link: "https://en.wikipedia.org/wiki/Foundation_(Asimov_novel)",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October, 2022"
  },

  SECOND_FOUNDATION: <Content>{
    reference: {
      title: "Second Foundation",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Gnome Press"}],
      year: "1953",
      link: "https://en.wikipedia.org/wiki/Second_Foundation",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October, 2022 - January, 2023"
  },

  FOUNDATION_AND_EMPIRE: <Content>{
    reference: {
      title: "Foundation and Empire",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Gnome Press"}],
      year: "1952",
      link: "https://en.wikipedia.org/wiki/Foundation_and_Empire",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "January, 2023"
  },

  PRELUDE_TO_FOUNDATION: <Content>{
    reference: {
      title: "Prelude to Foundation",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1988",
      link: "https://en.wikipedia.org/wiki/Prelude_to_Foundation",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "April, 2023"
  },

  FOUNDATIONS_EDGE: <Content>{
    reference: {
      title: "Foundation's Edge",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1982",
      link: "https://en.wikipedia.org/wiki/Foundation%27s_Edge",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "March, 2023"
  },

  FOUNDATION_AND_EARTH: <Content>{
    reference: {
      title: "Foundation and Earth",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1986",
      link: "https://en.wikipedia.org/wiki/Foundation_and_Earth",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "March, 2023"
  },

  FORWARD_THE_FOUNDATION: <Content>{
    reference: {
      title: "Forward the Foundation",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1993",
      link: "https://en.wikipedia.org/wiki/Forward_the_Foundation",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May, 2023"
  },

  I_ROBOT: <Content>{
    reference: {
      title: "I, Robot",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Gnome Press"}],
      year: "1950",
      link: "https://en.wikipedia.org/wiki/I,_Robot",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "April, 2023"
  },

  THE_REST_OF_THE_ROBOTS: <Content>{
    reference: {
      title: "The Rest of the Robots",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1964",
      link: "https://en.wikipedia.org/wiki/The_Rest_of_the_Robots",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May, 2023"
  },

  THE_COMPLETE_ROBOT: <Content>{
    reference: {
      title: "The Complete Robot",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1982",
      link: "https://en.wikipedia.org/wiki/The_Complete_Robot",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "June, 2023"
  },

  THE_CAVES_OF_STEEL: <Content>{
    reference: {
      title: "The Caves of Steel",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1954",
      link: "https://en.wikipedia.org/wiki/The_Caves_of_Steel",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "August, 2023"
  },

  THE_NAKED_SUN: <Content>{
    reference: {
      title: "The Naked Sun",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1957",
      link: "https://en.wikipedia.org/wiki/The_Naked_Sun",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "August, 2023"
  },

  THE_ROBOTS_OF_DAWN: <Content>{
    reference: {
      title: "The Robots of Dawn",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1983",
      link: "https://en.wikipedia.org/wiki/The_Robots_of_Dawn",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "September, 2023"
  },

  ROBOTS_AND_EMPIRE: <Content>{
    reference: {
      title: "Robots and Empire",
      authors: [{name: "Asimov, Isaac"}],
      published: [{name: "Doubleday"}],
      year: "1985",
      link: "https://en.wikipedia.org/wiki/Robots_and_Empire",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "October, 2023"
  },

  THE_RISE_AND_FALL_OF_THE_THIRD_REICH: <Content>{
    reference: {
      title: "The Rise and Fall of the Third Reich",
      authors: [{name: "Shirer, William L"}],
      published: [{name: "Simon & Schuster"}],
      year: "1960",
      link: "https://en.wikipedia.org/wiki/The_Rise_and_Fall_of_the_Third_Reich",
    }, status: Viewed.IN_PROGRESS, found_at: "July, 2022", viewed_at: "September, 2022 - "
  },

  A_NEW_KIND_OF_SCIENCE: <Content>{
    reference: {
      title: "A new kind of science?",
      authors: [{name: "Wolfram, Stephen"}, {name: "M. Gad-el-Hak"}],
      published: [{name: "Appl. Mech. Rev. 56.2"}],
      year: "2003",
      link: "https://www.wolframscience.com/nks/",
    }, status: Viewed.IN_PROGRESS,
  },

  A_PROJECT_TO_FIND_THE_FUNDAMENTAL_THEORY_OF_PHYSICS: <Content>{
    reference: {
      title: "A Project to Find the Fundamental Theory of Physics",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: "Wolfram Media, Inc."}],
      year: "2020",
      link: "https://www.wolframphysics.org/",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "December, 2022 - "
  },

  COMBINATORS_A_CENTENNIAL_VIEW: <Content>{
    reference: {
      title: "Combinators, A Centennial View",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: "Wolfram Media, Inc."}],
      year: "2021",
      link: "https://arxiv.org/pdf/2103.12811.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December, 2022 - January, 2023"
  },

  METAMATHEMATICS: <Content>{
    reference: {
      title: "Metamathematics: Foundations & Physicalization",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: "Wolfram Media, Inc."}],
      year: "2022",
      link: "https://arxiv.org/abs/2204.05123",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "May, 2023"
  },

  TWENTY_YEARS_NKS: <Content>{
    reference: {
      title: "Twenty Years of a New Kind of Science",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: "Wolfram Media, Inc."}],
      year: "2022",
      link: "https://www.wolfram-media.com/products/twenty-years-of-a-new-kind-of-science/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June, 2023"
  },

  THE_SELFISH_GENE: <Content>{
    reference: {
      title: "The Selfish Gene",
      authors: [{name: "Dawkins, Richard"}],
      published: [{name: "Oxford University Press"}],
      year: "1976",
      link: "https://en.wikipedia.org/wiki/The_Selfish_Gene",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "February 2023 - "
  },

  TRANSFORMER: <Content>{
    reference: {
      title: "Transformer: The Deep Chemistry of Life and Death",
      authors: [{name: "Lane, Nick"}],
      published: [{name: "W.W. Norton & Company"}],
      year: "2022",
      link: "https://en.wikipedia.org/wiki/Nick_Lane",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "May 2023 - "
  },

  THE_VITAL_QUESTION: <Content>{
    reference: {
      title: "The Vital Question: Why Is Life The Way It Is?",
      authors: [{name: "Lane, Nick"}],
      published: [{name: "Profile Books"}],
      year: "2015",
      link: "https://en.wikipedia.org/wiki/Nick_Lane",
    }, status: Viewed.IN_PROGRESS, found_at: "2022", viewed_at: "May 2023 - "
  },

  A_THOUSAND_BRAINS: <Content>{
    reference: {
      title: "A Thousand Brains: A New Theory of Intelligence",
      authors: [{name: "Hawkins, Jeff"}],
      published: [{name: ""}],
      year: "2021",
      link: "https://www.numenta.com/resources/books/a-thousand-brains-by-jeff-hawkins/",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"
  },

  REASONING_WITH_BELIEF_FUNCTIONS: <Content>{
    reference: {
      title: "Reasoning with belief functions: An analysis of compatibility",
      authors: [{name: "Pearl, Judea"}],
      published: [{name: "International Journal of Approximate Reasoning"}],
      year: "1990",
      link: "https://www.sciencedirect.com/science/article/pii/0888613X9090013R/pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October 2022"
  },

  CONTEXT_AWARE_COMPUTING_APPLICATIONS: <Content>{
    reference: {
      title: "Context-Aware Computing Applications",
      authors: [{name: "Schilit, Bill, Norman Adams, and Roy Want"}],
      published: [{name: "first workshop on mobile computing systems and applications. IEEE"}],
      year: "1994",
      link: "https://www.cs.cmu.edu/~./jasonh/courses/ubicomp-sp2007/papers/12-wmc-94-schilit.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"
  },

  IS_REALISM_COMPATIBLE_WITH_TRUE_RANDOMNESS: <Content>{
    reference: {
      title: "Is realism compatible with true randomness?",
      authors: [{name: "Gisin, Nicolas"}],
      published: [{name: "arXiv"}],
      year: "2010",
      link: "https://arxiv.org/pdf/1012.2536",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "September 2022"
  },

  WHAT_IS_A_KNOWLEDGE_REPRESENTATION: <Content>{
    reference: {
      title: "What Is a Knowledge Representation?",
      authors: [{name: "Davis, Randall, Howard Shrobe, and Peter Szolovits"}],
      published: [{name: "AI magazine 14.1"}],
      year: "1993",
      link: "https://ojs.aaai.org/index.php/aimagazine/article/download/1029/947",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"
  },

  LEARNING_TO_REPRESENT_PROGRAMS_WITH_GRAPHS: <Content>{
    reference: {
      title: "Learning to Represent Programs with Graphs",
      authors: [{name: "Allamanis, Miltiadis, Marc Brockschmidt, and Mahmoud Khademi"}],
      published: [{name: "arXiv"}],
      year: "2017",
      link: "https://arxiv.org/pdf/1711.00740",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"
  },

  A_THEORY_OF_INCREMENTAL_COMPRESSION: <Content>{
    reference: {
      title: "A theory of incremental compression",
      authors: [{name: "Franz, Arthur, Oleksandr Antonenko, and Roman Soletskyi"}],
      published: [{name: "Information Sciences 547"}],
      year: "2021",
      link: "https://arxiv.org/pdf/1908.03781",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "August 2022"
  },

  ON_THE_MEASURE_OF_INTELLIGENCE: <Content>{
    reference: {
      title: "On the Measure of Intelligence",
      authors: [{name: "Chollet, François"}],
      published: [{name: "arXiv"}],
      year: "2019",
      link: "https://arxiv.org/pdf/1911.01547",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December 2022"
  },

  EMPIRICISM_SEMANTICS_AND_ONTOLOGY: <Content>{
    reference: {
      title: "Empiricism, Semantics, and Ontology",
      authors: [{name: "Carnap, Rudolf"}],
      published: [{name: "Revue internationale de philosophie"}],
      year: "1950",
      link: "https://authortomharper.com/wp-content/uploads/2022/04/1950-Empiricism-Semantics-and-Ontology-Carnap.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October 2022"
  },

  HUTTER_PRIZE: <Content>{
    reference: {
      title: "Hutter Prize",
      authors: [{name: "Hutter, Marcus"}],
      link: "https://en.wikipedia.org/wiki/Hutter_Prize",
    }, status: Viewed.VIEWED
  },

  GOING_BEYOND_THE_POINT_NEURON: <Content>{
    reference: {
      title: "Going Beyond the Point Neuron: Active Dendrites and Sparse Representations for Continual Learning",
      authors: [{name: "Grewal, Karan, et al."}],
      published: [{name: "bioRxiv"}],
      year: "2021",
      link: "https://www.biorxiv.org/content/biorxiv/early/2021/10/26/2021.10.25.465651.full.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "September 2022"
  },

  THE_GENERAL_THEORY_OF_GENERAL_INTELLIGENCE: <Content>{
    reference: {
      title: "The General Theory of General Intelligence: A Pragmatic Patternist Perspective",
      authors: [{name: "Goertzel, Ben"}],
      published: [{name: "arXiv"}],
      year: "2021",
      link: "https://arxiv.org/pdf/2103.15100",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "September 2022"
  },

  EMBODIED_SITUATED_AND_GROUNDED_INTELLIGENCE: <Content>{
    reference: {
      title: "Embodied, Situated, and Grounded Intelligence: Implications for AI",
      authors: [{name: "Millhouse, Tyler, Melanie Moses, and Melanie Mitchell"}],
      published: [{name: "arXiv"}],
      year: "2022",
      link: "https://arxiv.org/pdf/2210.13589",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "October 2022"
  },

  THE_DEBATE_OVER_UNDERSTANDING_IN_AI_LARGE_LANGUAGE_MODELS: <Content>{
    reference: {
      title: "The Debate Over Understanding in AI’s Large Language Models",
      authors: [{name: "Mitchell, Melanie, and David C. Krakauer"}],
      published: [{name: "Proceedings of the National Academy of Sciences 120.13"}],
      year: "2023",
      link: "https://www.pnas.org/doi/full/10.1073/pnas.2215907120",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November 2022"
  },

  BEYOND_PROGRAMMING_LANGUAGES: <Content>{
    reference: {
      title: "Beyond Programming Languages",
      authors: [{name: "Winograd, Terry"}],
      published: [{name: "Communications of the ACM 22.7"}],
      year: "1979",
      link: "https://dl.acm.org/doi/pdf/10.1145/359131.359133",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"
  },

  DATA_COMPRESSION_EXPLAINED: <Content>{
    reference: {
      title: "Data Compression Explained",
      authors: [{name: "Mahoney, Matt"}],
      published: [{name: "Mahoney, Matt"}],
      year: "2010",
      link: "https://mattmahoney.net/dc/dce.html",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "June 2022"
  },

  IPFS_FAN_A_FUNCTION_ADDRESSABLE_COMPUTATION_NETWORK: <Content>{
    reference: {
      title: "IPFS-FAN: A Function-Addressable Computation Network",
      authors: [{name: "de la Rocha, Alfonso, Yiannis Psaras, and David Dias"}],
      published: [{name: "IFIP Networking Conference (IFIP Networking). IEEE"}],
      year: "2021",
      link: "http://opendl.ifip-tc6.org/db/conf/networking/networking2021/1570713481.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December 2022"
  },

  AVOIDING_CATASTROPHE_ACTIVE_DENDRITES_ENABLE_MULTI_TASK_LEARNING_IN_DYNAMICS_ENVIRONMENTS: <Content>{
    reference: {
      title: "Avoiding Catastrophe: Active Dendrites Enable Multi-Task Learning in Dynamic Environments",
      authors: [{name: "Iyer, Abhiram, et al."}],
      published: [{name: "Frontiers in neurorobotics 16"}],
      year: "2022",
      link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9100780/",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: " 2022"
  },

  GAMES_AND_PUZZLES_AS_MULTICOMPUTATIONAL_SYSTEMS: <Content>{
    reference: {
      title: "Games and Puzzles as Multicomputational Systems",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2022",
      link: "https://writings.stephenwolfram.com/2022/06/games-and-puzzles-as-multicomputational-systems/",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November 2022"
  },

  A_THOUSAND_BRAINS_TOWARD_BIOLOGICALLY_CONSTRAINED_AI: <Content>{
    reference: {
      title: "A thousand brains: toward biologically constrained AI",
      authors: [{name: "Hole, Kjell Jørgen, and Subutai Ahmad"}],
      published: [{name: "SN Applied Sciences 3.8"}],
      year: "2021",
      link: "https://link.springer.com/article/10.1007/s42452-021-04715-0",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"
  },

  IS_PROBABILITY_THEORY_RELEVANT_FOR_UNCERTAINTY: <Content>{
    reference: {
      title: "Is Probability Theory Relevant for Uncertainty? A Post Keynesian Perspective",
      authors: [{name: "Davidson, Paul"}],
      published: [{name: "Journal of Economic Perspectives 5.1"}],
      year: "1991",
      link: "https://pubs.aeaweb.org/doi/pdf/10.1257/jep.5.1.129",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: " 2022"
  },

  MULTICOMPUTATION_A_FOURTH_PARADIGM_FOR_THEORETICAL_SCIENCE: <Content>{
    reference: {
      title: "Multicomputation: A Fourth Paradigm for Theoretical Science",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2021",
      link: "https://writings.stephenwolfram.com/2021/09/multicomputation-a-fourth-paradigm-for-theoretical-science/",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December 2022"
  },

  ATTENTION_IS_ALL_YOU_NEED: <Content>{
    reference: {
      title: "Attention Is All You Need",
      authors: [{name: "Vaswani, Ashish, et al."}],
      published: [{name: "Advances in neural information processing systems 30"}],
      year: "2017",
      link: "https://proceedings.neurips.cc/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November 2022"
  },

  ON_THE_EINSTEIN_PODOLSKY_ROSEN_PARADOX: <Content>{
    reference: {
      title: "On the Einstein Podolsky Rosen Paradox",
      authors: [{name: "Bell, John S."}],
      published: [{name: "Physics Physique Fizika 1.3 "}],
      year: "1964",
      link: "https://link.aps.org/pdf/10.1103/PhysicsPhysiqueFizika.1.195",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "June 2022"
  },

  THE_ALGORITHMIC_ORIGINS_OF_LIFE: <Content>{
    reference: {
      title: "The algorithmic origins of life",
      authors: [{name: "Walker, Sara Imari, and Paul CW Davies"}],
      published: [{name: "Journal of the Royal Society Interface 10.79"}],
      year: "2013",
      link: "https://royalsocietypublishing.org/doi/full/10.1098/rsif.2012.0869",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "November 2022"
  },

  THE_COMPUTER_FOR_THE_21ST_CENTURY: <Content>{
    reference: {
      title: "The computer for the 21st century",
      authors: [{name: "Weiser, Mark"}],
      published: [{name: "Scientific american 265.3 "}],
      year: "1991",
      link: "https://www.academia.edu/download/50943771/scientificamerican0991-9420161217-28996-1rvsbxf.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"
  },

  SOK_SANITIZING_FOR_SECURITY: <Content>{
    reference: {
      title: "SoK: Sanitizing for Security",
      authors: [{name: "Song, Dokyung, et al."}],
      published: [{name: "IEEE Symposium on Security and Privacy (SP). IEEE"}],
      year: "2019",
      link: "https://arxiv.org/pdf/1806.04355",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "May 2022"
  },

  UNCERTAINTY_BELIEF_AND_PROBABILITY: <Content>{
    reference: {
      title: "Uncertainty, belief, and probability",
      authors: [{name: "Fagin, Ronald, and Joseph Y. Halpern"}],
      published: [{name: "Computational Intelligence 7.3"}],
      year: "1991",
      link: "https://s3.us.cloud-object-storage.appdomain.cloud/res-files/500-comint91.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "September 2022"
  },

  ON_DEFINING_ARTIFICAL_INTELLIGENCE: <Content>{
    reference: {
      title: "On Defining Artificial Intelligence",
      authors: [{name: "Wang, Pei"}],
      published: [{name: "Journal of Artificial General Intelligence 10.2"}],
      year: "2019",
      link: "https://sciendo.com/downloadpdf/journals/jagi/10/2/article-p1.pdf",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "August 2022"
  },

  ROBUST_SPEECH_RECOGNITION_VIA_LARGE_SCALE_WEAK_SUPERVISION: <Content>{
    reference: {
      title: "Robust Speech Recognition via Large-Scale Weak Supervision",
      authors: [{name: "Radford, Alec, et al."}],
      published: [{name: "arXiv"}],
      year: "2022",
      link: "https://arxiv.org/pdf/2212.04356",
    }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December 2022"
  },


//


  INTERACTION_COMBINATORS: <Content>{
    reference: {
      title: "Interaction Combinators",
      authors: [{name: "Lafont, Yves."}],
      published: [{name: "Information and Computation 137.1"}],
      year: "1997",
      link: "https://www.sciencedirect.com/science/article/pii/S0890540197926432/pdf?md5=30965cec6dd7605a865bbec4076f65e4&pid=1-s2.0-S0890540197926432-main.pdf",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"
  },

  VON_NEUMANNS_IMPOSSIBILITY_PROOF_MATHEMATICS_IN_THE_SERVICE_OF_RHETORICS: <Content>{
    reference: {
      title: "Von Neumann’s Impossibility Proof: Mathematics in the Service of Rhetorics",
      authors: [{name: "Dieks, Dennis"}],
      published: [{name: "Studies in History and Philosophy of Science Part B: Studies in History and Philosophy of Modern Physics 60"}],
      year: "2017",
      link: "https://arxiv.org/pdf/1801.09305",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "February 2023"
  },

  PERFECTLY_SECURE_STEGANOGRAPHY_USING_MINIMUM_ENTROPY_COUPLING: <Content>{
    reference: {
      title: "Perfectly Secure Steganography Using Minimum Entropy Coupling",
      authors: [{name: "de Witt, Christian Schroeder, et al."}],
      published: [{name: "arXiv"}],
      year: "2022",
      link: "https://arxiv.org/pdf/2210.14889",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },

  GENERAL_INTELLIGENCE_REQUIRES_RETHINKING_EXPLORATION: <Content>{
    reference: {
      title: "General Intelligence Requires Rethinking Exploration",
      authors: [{name: "Jiang, Minqi, Tim Rocktäschel, and Edward Grefenstette"}],
      published: [{name: "arXiv"}],
      year: "2022",
      link: "https://arxiv.org/pdf/2211.07819",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },

  DENSEPOSE_FROM_WIFI: <Content>{
    reference: {
      title: "DensePose From WiFi",
      authors: [{name: "Geng, Jiaqi, Dong Huang, and Fernando De la Torre"}],
      published: [{name: "arXiv"}],
      year: "2022",
      link: "https://arxiv.org/pdf/2301.00250",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "February 2023"
  },

  A_MECHANIZED_FORMALIZATION_OF_THE_WEBASSEMBLY_SPECIFICATION_IN_COQ: <Content>{
    reference: {
      title: "A Mechanized Formalization of the WebAssembly Specification in Coq",
      authors: [{name: "Huang, Xuan"}],
      published: [{name: "RIT Computer Science"}],
      year: "2019",
      link: "https://www.semanticscholar.org/paper/A-Mechanized-Formalization-of-the-WebAssembly-in-Huang/2fde569f52c37fe8e45ebf05268e1b4341b58cbf",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "May 2023"
  },

  A_DENOTATIONAL_SEMANTICS_FOR_THE_SYMMETRIC_INTERACTION_COMBINATORS: <Content>{
    reference: {
      title: "A Denotational Semantics for the Symmetric Interaction Combinators",
      authors: [{name: "Mazza, Damian"}],
      published: [{name: "Mathematical Structures in Computer Science 17.3 "}],
      year: "2007",
      link: "https://www.researchgate.net/profile/Damiano-Mazza/publication/220173732_A_denotational_semantics_for_the_symmetric_interaction_combinators/links/0912f50f4273696c14000000/A-denotational-semantics-for-the-symmetric-interaction-combinators.pdf",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"
  },

  DEEP_SELF_MODELING_AS_A_FUNDAMENTAL_PRINCIPLE_IN_THE_DESIGN_OF_INTELLIGENT_SYSTEMS: <Content>{
    reference: {
      title: "Deep self-modeling as a fundamental principle in the design of intelligent systems",
      authors: [{name: "Dean, George"}],
      published: [{name: "Lab42"}],
      year: "2022",
      link: "https://lab42.global/past-challenges/essay-intelligence/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"
  },
  AI_ARTIFICIAL_INTELLIGENCE_OR_ARTIFICAL_IGNORANCE: <Content>{
    reference: {
      title: "A.I. (Artificial Intelligence or Artificial Ignorance?",
      authors: [{name: "Pavan, Massimiliano"}],
      published: [{name: "Lab42"}],
      year: "2022",
      link: "https://lab42.global/past-challenges/essay-intelligence/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"
  },
  FROM_HUME_TO_HUMAN_AI_A_RETURN_TO_THE_FOUNDATIONS_AND_RESTRICTIONS_OF_HUMEAN_REASONING: <Content>{
    reference: {
      title: "From Hume to Human AI: A return to the foundations and restrictions of hum(e)an reasoning",
      authors: [{name: "Burke, Cassidy, Maura"}],
      published: [{name: "Lab42"}],
      year: "2022",
      link: "https://lab42.global/past-challenges/essay-intelligence/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"
  },
  BUILDING_HUMAN_LIKE_INTELLIGENCE_AN_EVOLUTIONARY_PERSPECTIVE: <Content>{
    reference: {
      title: "Building human-like intelligence: an evolutionary perspective",
      authors: [{name: "Ouellette, Simon"}],
      published: [{name: "Lab42"}],
      year: "2022",
      link: "https://lab42.global/past-challenges/essay-intelligence/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"
  },
  A_CASE_FOR_COMPUTATIONAL_INTELLIGENCE_AS_RECURSIVE_ABSTRACTION_AND_GOAL_ORIENTED_SYNTHESIS: <Content>{
    reference: {
      title: "A Case for Computational Intelligence as Recursive Abstraction and Goal-Oriented Synthesis",
      authors: [{name: "Song, Yiding"}],
      published: [{name: "Lab42"}],
      year: "2022",
      link: "https://lab42.global/past-challenges/essay-intelligence/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "January 2023"
  },

  REVERSE_ENGINEERING_WEBASSEMBLY: <Content>{
    reference: {
      title: "Reverse Engineering WebAssembly",
      authors: [{name: "Falliere, Nicolas"}],
      published: [{name: "PNF Software"}],
      year: "2018",
      link: "https://www.pnfsoftware.com/reversing-wasm.pdf",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "May 2023"
  },

  TOROIDAL_TOPOLOGY_OF_POPULATION_ACTIVITY_IN_GRID_CELLS: <Content>{
    reference: {
      title: "Toroidal topology of population activity in grid cells",
      authors: [{name: "Gardner, Richard J., et al."}],
      published: [{name: "Nature 602.7895"}],
      year: "2022",
      link: "https://www.nature.com/articles/s41586-021-04268-7",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },

  A_50_YEAR_QUEST_MY_PERSONAL_JOURNEY_WITH_THE_SECOND_LAW_OF_THERMODYNAMICS: <Content>{
    reference: {
      title: "A 50-Year Quest: My Personal Journey with the Second Law of Thermodynamics",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://writings.stephenwolfram.com/2023/02/a-50-year-quest-my-personal-journey-with-the-second-law-of-thermodynamics/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },
  ALIEN_INTELLIGENCE_AND_THE_CONCEPT_OF_TECHNOLOGY: <Content>{
    reference: {
      title: "Alien Intelligence and the Concept of Technology",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2022",
      link: "https://writings.stephenwolfram.com/2022/06/alien-intelligence-and-the-concept-of-technology/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },
  CHATGPT_GETS_ITS_WOLFRAM_SUPERPOWERS: <Content>{
    reference: {
      title: "ChatGPT Gets Its “Wolfram Superpowers”!",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://writings.stephenwolfram.com/2023/03/chatgpt-gets-its-wolfram-superpowers/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },
  COMPUTATIONAL_FOUNDATIONS_FOR_THE_SECOND_LAW_OF_THERMODYNAMICS: <Content>{
    reference: {
      title: "Computational Foundations for the Second Law of Thermodynamics",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://writings.stephenwolfram.com/2023/02/computational-foundations-for-the-second-law-of-thermodynamics/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },
  FASTER_THAN_LIGHT_IN_OUR_MODEL_OF_PHYSICS_SOME_PRELIMINARY_THOUGHTS: <Content>{
    reference: {
      title: "Faster than Light in Our Model of Physics: Some Preliminary Thoughts",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2020",
      link: "https://writings.stephenwolfram.com/2020/10/faster-than-light-in-our-model-of-physics-some-preliminary-thoughts/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },
  HOW_DID_WE_GET_HERE_THE_TANGLED_HISTORY_OF_THE_SECOND_LAW_OF_THERMODYNAMICS: <Content>{
    reference: {
      title: "How Did We Get Here? The Tangled History of the Second Law of Thermodynamics",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://writings.stephenwolfram.com/2023/01/how-did-we-get-here-the-tangled-history-of-the-second-law-of-thermodynamics/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },
  MULTICOMPUTATIONAL_IRREDUCIBILITY: <Content>{
    reference: {
      title: "Multicomputational Irreducibility",
      authors: [{name: "Boyd, James"}],
      published: [{name: "Wolfram Institute"}],
      year: "2022",
      link: "https://www.wolframphysics.org/bulletins/2022/06/multicomputational-irreducibility/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "March 2023"
  },

  ZX_CALCULUS_AND_EXTENDED_HYPERGRAPH_REWRITING_SYSTEMS_I: <Content>{
    reference: {
      title: "ZX-Calculus and Extended Hypergraph Rewriting Systems I: A Multiway Approach to Categorical Quantum Information Theory",
      authors: [{name: "Gorard, Jonathan, Manojna Namuduri, and Xerxes D. Arsiwalla"}],
      published: [{name: "arXiv"}],
      year: "2020",
      link: "https://arxiv.org/pdf/2010.02752",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"
  },

  FAST_AUTOMATED_REASONING_OVER_STRING_DIAGRAMS_USING_MULTIWAY_CAUSAL_STRUCTURE: <Content>{
    reference: {
      title: "Fast Automated Reasoning over String Diagrams using Multiway Causal Structure",
      authors: [{name: "Gorard, Jonathan, Manojna Namuduri, and Xerxes D. Arsiwalla"}],
      published: [{name: "arXiv"}],
      year: "2021",
      link: "https://arxiv.org/pdf/2105.04057",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"
  },

  LAGRANGIAN_NEURAL_NETWORKS: <Content>{
    reference: {
      title: "Lagrangian Neural Networks",
      authors: [{name: "Cranmer, Miles, et al"}],
      published: [{name: "arXiv"}],
      year: "2020",
      link: "https://arxiv.org/pdf/2003.04630",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"
  },

  QUANTOMATRIC_A_PROOF_ASSISTANT_FOR_DIAGRAMMATIC_REASONING: <Content>{
    reference: {
      title: "Quantomatic: A proof assistant for diagrammatic reasoning",
      authors: [{name: "Kissinger, Aleks, and Vladimir Zamdzhiev"}],
      published: [{name: "Automated Deduction-CADE-25: 25th International Conference on Automated Deduction, Berlin, Germany"}],
      year: "2015",
      link: "https://arxiv.org/pdf/1503.01034",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"
  },

  THE_SEMANTIC_CONCEPTION_OF_TRUTH_AND_THE_FOUNDATIONS_OF_SEMANTICS: <Content>{
    reference: {
      title: "The semantic conception of truth: and the foundations of semantics",
      authors: [{name: "Tarski, Alfred"}],
      published: [{name: "The semantic conception of truth: and the foundations of semantics"}],
      year: "1944",
      link: "https://sites.google.com/site/filosofiaetc/histfil/Tarski_SCT_1944.pdf",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "June 2023"
  },

  RESIDUALITY_THEORY_RANDOM_SIMULATION_AND_ATTRACTOR_NETWORKS: <Content>{
    reference: {
      title: "Residuality Theory, random simulation, and attractor networks",
      authors: [{name: "O’Reilly, Barry M."}],
      published: [{name: "Procedia Computer Science 201"}],
      pointer: '639-645',
      year: "2022",
      link: "https://www.sciencedirect.com/science/article/pii/S1877050922004975/pdf?md5=faa21ad837ec9eba6fac3beb2cd93f9f&pid=1-s2.0-S1877050922004975-main.pdf",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023"
  },

  A_FUNCTORIAL_PERSPECTIVE_ON_MULTICOMPUTATIONAL_IRREDUCIBILITY: <Content>{
    reference: {
      title: "A Functorial Perspective on (Multi)computational Irreducibility",
      authors: [{name: "Gorard, Jonathan"}],
      published: [{name: "arXiv"}],
      year: "2022",
      link: "https://arxiv.org/pdf/2301.04690",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023"
  },

  BIOELECTRIC_NETWORKS_THE_COGNITIVE_GLUE_ENABLING_EVOLUTIONARY_SCALING_FROM_PHYSIOLOGY_TO_MIND: <Content>{
    reference: {
      title: "Bioelectric networks: the cognitive glue enabling evolutionary scaling from physiology to mind",
      authors: [{name: "Levin, Michael"}],
      published: [{name: "Animal Cognition"}],
      year: "2023",
      link: "https://link.springer.com/article/10.1007/s10071-023-01780-3",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023"
  },

  COMPETENCY_IN_NAVIGATING_ARBITRARY_SPACES_AS_AN_INVARIANT_FOR_ANALYZING_COGNITION_IN_DIVERSE_EMBODIMENTS: <Content>{
    reference: {
      title: "Competency in Navigating Arbitrary Spaces as an Invariant for Analyzing Cognition in Diverse Embodiments",
      authors: [{name: "Fields, Chris, and Levin, Michael"}],
      pointer: '819',
      published: [{name: "Entropy 24.6"}],
      year: "2022",
      link: "https://www.mdpi.com/1099-4300/24/6/819",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023"
  },

  CHROME_SHIPS_WEBGPU: <Content>{
    reference: {
      title: "Chrome ships WebGPU",
      authors: [{name: "Beaufort, François and Wallez, Corentin"}],
      published: [{name: "Chrome Developers Blog"}],
      year: "2023",
      link: "https://developer.chrome.com/blog/webgpu-release/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023"
  },

  GET_STARTED_WITH_GPU_COMPUTE_ON_THE_WEB: <Content>{
    reference: {
      title: "Get started with GPU Compute on the web",
      authors: [{name: "Beaufort, François"}],
      published: [{name: "Chrome Developers Blog"}],
      year: "2023",
      link: "https://developer.chrome.com/articles/gpu-compute/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023"
  },

  SPAWNING_A_WASI_THREAD_WITH_RAW_WEBASSEMBLY: <Content>{
    reference: {
      title: "Spawning a WASI Thread with raw WebAssembly",
      authors: [{name: "Das Surma"}],
      published: [{name: "surma.dev"}],
      year: "2023",
      link: "https://surma.dev/postits/wasi-threads/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023"
  },

  WEBGPU_ALL_OF_THE_CORES_NONE_OF_THE_CANVAS: <Content>{
    reference: {
      title: "WebGPU — All of the cores, none of the canvas",
      authors: [{name: "Das Surma"}],
      published: [{name: "surma.dev"}],
      year: "2022",
      link: "https://surma.dev/things/webgpu/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "July 2023"
  },

  REMEMBERING_THE_IMPROBABLE_LIFE_OF_ED_FREDKIN: <Content>{
    reference: {
      title: "Remembering the Improbable Life of Ed Fredkin (1934–2023) and His World of Ideas and Stories",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://writings.stephenwolfram.com/2023/08/remembering-the-improbable-life-of-ed-fredkin-1934-2023-and-his-world-of-ideas-and-stories/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"
  },

  REMEMBERING_DOUG_LENAT: <Content>{
    reference: {
      title: "Remembering Doug Lenat (1950–2023) and His Quest to Capture the World with Logic",
      authors: [{name: "Wolfram, Stephen"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://writings.stephenwolfram.com/2023/09/remembering-doug-lenat-1950-2023-and-his-quest-to-capture-the-world-with-logic/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"
  },

  THE_ALEXANDRIA_PROJECT_WHAT_HAS_BEEN_ACCOMPLISHED: <Content>{
    reference: {
      title: "The ALEXANDRIA Project: what has been accomplished?",
      authors: [{name: "Paulson, Lawrence C."}],
      published: [{name: ""}],
      year: "2023",
      link: "https://lawrencecpaulson.github.io/2023/04/27/ALEXANDRIA_outcomes.html",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"
  },
  THE_END_OF_THE_ALEXANDRIA_PROJECT: <Content>{
    reference: {
      title: "The End (?) of the ALEXANDRIA Project",
      authors: [{name: "Paulson, Lawrence C."}],
      published: [{name: ""}],
      year: "2023",
      link: "https://lawrencecpaulson.github.io/2023/08/31/ALEXANDRIA_finished.html",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"
  },
  WHEN_IS_A_COMPUTER_PROOF_A_PROOF: <Content>{
    reference: {
      title: "When is a computer proof a proof?",
      authors: [{name: "Paulson, Lawrence C."}],
      published: [{name: ""}],
      year: "2023",
      link: "https://lawrencecpaulson.github.io/2023/08/09/computer_proof.html",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"
  },
  ALEXANDRIA_LARGE_SCALE_FORMAL_PROOF_FOR_THE_WORKING_MATHEMATICIAN: <Content>{
    reference: {
      title: "ALEXANDRIA: Large-Scale Formal Proof for the Working Mathematician",
      authors: [{name: "Paulson, Lawrence C."}],
      published: [{name: ""}],
      year: "2021",
      link: "https://lawrencecpaulson.github.io/2021/12/08/ALEXANDRIA.html",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"
  },
  THE_ORIGINS_AND_MOTIVATIONS_OF_UNIVALENT_FOUNDATIONS: <Content>{
    reference: {
      title: "The Origins and Motivations of Univalent Foundations",
      authors: [{name: "Voevodsky, Vladimir"}],
      published: [{name: ""}],
      year: "2014",
      link: "https://www.ias.edu/ideas/2014/voevodsky-origins",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "September, 2023"
  },

  ZENBLEED: <Content>{
    reference: {
      title: "Zenbleed",
      authors: [{name: "Ormandy, Tavis"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://lock.cmpxchg8b.com/zenbleed.html",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "October, 2023"
  },
  DOWNFALL: <Content>{
    reference: {
      title: "Downfall: Exploiting Speculative Data Gathering",
      authors: [{name: "Moghimi, Daniel"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://downfall.page/media/downfall.pdf",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "October, 2023"
  },
  ASSEMBLY_THEORY_EXPLAINS_AND_QUANTIFIES_SELECTION_AND_EVOLUTION: <Content>{
    reference: {
      title: "Assembly theory explains and quantifies selection and evolution",
      authors: [{name: "Abhishek Sharma, Dániel Czégel, Michael Lachmann, Christopher P. Kempes, Sara I. Walker and Leroy Cronin"}],
      published: [{name: ""}],
      year: "2023",
      link: "https://www.nature.com/articles/s41586-023-06600-9",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "October, 2023"
  },

  WILL_COMPUTERS_REDEFINE_THE_ROOTS_OF_MATH: <Content>{
    reference: {
      title: "Will Computers Redefine the Roots of Math?",
      authors: [{name: "Hartnett, Kevin"}],
      published: [{name: ""}],
      year: "2015",
      link: "https://www.quantamagazine.org/will-computers-redefine-the-roots-of-math-20150519/",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"
  },

  QUANTUM_IN_PICTURES: <Content>{
    reference: {
      title: "Quantum in Pictures",
      authors: [{name: "Coecke, Bob and Gogioso, Stefano"}],
      published: [{name: "Quantinuum"}],
      year: "2023",
      link: "https://www.quantinuum.com/news/quantum-in-pictures",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"
  },

  CATEGORY_THEORY_I: <Content>{
    reference: {
      title: "Category Theory I",
      authors: [{name: "Milewski, Bartosz"}],
      organizations: [ORGANIZATIONS.youtube],
      year: "2016",
      link: "https://www.youtube.com/watch?v=I8LbkfSSR58&list=PLbgaMIhjbmEnaH_LTkxLI7FMa2HsnawM_",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"
  },
  CATEGORY_THEORY_II: <Content>{
    reference: {
      title: "Category Theory II",
      authors: [{name: "Milewski, Bartosz"}],
      organizations: [ORGANIZATIONS.youtube],
      year: "2017",
      link: "https://www.youtube.com/watch?v=3XTQSx1A3x8&list=PLbgaMIhjbmElia1eCEZNvsVscFef9m0dm",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"
  },
  CATEGORY_THEORY_III: <Content>{
    reference: {
      title: "Category Theory III",
      authors: [{name: "Milewski, Bartosz"}],
      organizations: [ORGANIZATIONS.youtube],
      year: "2018",
      link: "https://www.youtube.com/watch?v=F5uEpKwHqdk&list=PLbgaMIhjbmEn64WVX4B08B4h2rOtueWIL",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"
  },

  DIHEAPS_A_NEW_SPECIES_OF_ALGEBRAIC_STRUCTURE: <Content>{
    reference: {
      title: "Diheaps: a new species of algebraic structure",
      authors: [{name: "Zapata, Carlos"}],
      organizations: [ORGANIZATIONS.youtube],
      year: "2023",
      link: "https://www.youtube.com/watch?v=YOfIXwBHPFU",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"
  },

  HACKENBUSH_A_WINDOW_TO_A_NEW_WORLD_OF_MATH: <Content>{
    reference: {
      title: "HACKENBUSH: a window to a new world of math\n",
      authors: [{name: "Maitzen, Owen"}],
      organizations: [ORGANIZATIONS.youtube],
      year: "2021",
      link: "https://www.youtube.com/watch?v=ZYj4NkeGPdM",
    }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "August, 2023"
  },

  EXPLORER_ORBITMINES_RESEARCH: <Content>{
    reference: {
      title: "Independent Researcher - OrbitMines Research",
      organizations: [ORGANIZATIONS.orbitmines_research],
      year: "July, 2022 - Present",
      link: "https://orbitmines.com/"
    }, status: Viewed.VIEWED, viewed_at: "July, 2022 - Present"
  },
  SOFTWARE_DEVELOPER_AT_BREACHLOCK_INC: <Content>{
    reference: {
      title: "Software Developer - BreachLock Inc.",
      organizations: [{name: "BreachLock Inc."}],
      year: "November, 2021 - May, 2022",
      link: "https://www.linkedin.com/company/breachlock/"
    }, status: Viewed.VIEWED, viewed_at: "November, 2021 - May, 2022"
  },
  CONTRACTOR_AT_MARTI_ORBAK_SOFTWARE: <Content>{
    reference: {
      title: "Contractor - MartiOrbak Software",
      organizations: [{name: "MartiOrbak Software"}],
      year: "November, 2020 - March 2021",
      link: "https://www.linkedin.com/company/marti-orbak-software/"
    }, status: Viewed.VIEWED, viewed_at: "November, 2020 - March 2021"
  },
  BACKEND_DEVELOPER_AT_MOBIEL_NL: <Content>{
    reference: {
      title: "Backend Developer - Mobiel.nl",
      organizations: [{name: "Mobiel.nl"}],
      year: "November, 2018 - August, 2019",
      link: "https://www.linkedin.com/company/mobiel.nl/",
    },
    status: Viewed.VIEWED,
    viewed_at: "November, 2018 - August, 2019",
    description: "My first interaction working at a SME."
  },
  FOUNDER_AT_ORBITMINES_MINECRAFT: <Content>{
    reference: {
      title: "Founder - OrbitMines (Minecraft)",
      organizations: [ORGANIZATIONS.orbitmines_research],
      year: "October, 2013 - May, 2019",
      link: "https://www.youtube.com/@OrbitMines/videos",
    },
    status: Viewed.VIEWED,
    viewed_at: "October, 2013 - May, 2019",
    description: "I introduced myself to software engineering during this period by designing and maintaining my own Minecraft game server, which had a small community of concurrent players."
  },


  LEIDEN_UNIVERSITY: <Content>{
    reference: {
      title: "(Unfinished) Computer Science (BSc)",
      published: [{name: "Leiden University"}],
      year: "2020: I stop attending Leiden University. If you could call what I did there as attending in the first place. Perhaps more of an (immature) severe disinterest",
    }, status: Viewed.IN_PROGRESS, viewed_at: "September, 2019 - December, 2020", archived: true
  },

  VWO: <Content>{
    reference: {
      title: "VWO / Science & Engineering",
      year: "2012 - 2019"
    }, status: Viewed.VIEWED, viewed_at: "2012 - 2019"
  },

  SEMF_2023: <Content>{
    reference: {
      title: "SEMF School of 2023",
      organizations: [ORGANIZATIONS.semf],
      year: "2023",
      link: "https://semf.org.es/school2023/"
    }, status: Viewed.VIEWED, found_at: "July, 2023", viewed_at: "2023"
  },
  SEMF_2025: <Content>{
    reference: {
      title: "SEMF School of 2025",
      organizations: [ORGANIZATIONS.semf],
      year: "2025",
      link: "https://semf.org.es/school2025/"
    }, status: Viewed.VIEWED, found_at: "July, 2023", viewed_at: "2023"
  },

  URSPRUNG_IV: <Content>{
    reference: {
      title: "Ursprung IV",
      organizations: [ORGANIZATIONS.ursprung],
      year: "2026",
      link: "https://ursprung.community/"
    }, status: Viewed.VIEWED, found_at: "July, 2026", viewed_at: "2026"
  },

  SYCO_12: <Content>{
    reference: {
      title: "Twelfth Symposium on Compositional Structures (SYCO 12)",
      organizations: [ORGANIZATIONS.syco],
      year: "2024 @ Birmingham, UK",
      link: "https://www.cl.cam.ac.uk/events/syco/12/"
    }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
  },

  INTO_THE_INFORMATION_CONTINUUM_2024_03_09: <Content>{
    reference: {
      title: "In-Person Workshop | Into the Information Continuum",
      organizations: [ORGANIZATIONS.semf],
      year: "2024, 9 March @ Amsterdam",
      link: "https://www.youtube.com/watch?v=KM97bUcVPDE&t=2786s"
    }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
  },
  INTO_THE_INFORMATION_CONTINUUM_2024_05_04: <Content>{
    reference: {
      title: "In-Person Workshop | Into the Information Continuum",
      organizations: [ORGANIZATIONS.semf],
      year: "2024, 4 May @ Amsterdam",
      link: "https://www.youtube.com/watch?v=KM97bUcVPDE&t=2786s"
    }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
  },

  NGI_FORUM_2023: <Content>{
    reference: {
      title: "NGI FORUM 2023",
      organizations: [ORGANIZATIONS.ngi],
      year: "2023",
      link: "https://www.ngi.eu/event/ngi-forum-2023/"
    }, status: Viewed.VIEWED, found_at: "July, 2023", viewed_at: "2023"
  },

  RUST: <Content>{
    reference: {title: "Rust", link: "https://en.wikipedia.org/wiki/Rust_(programming_language)"},
    status: Viewed.VIEWED
  },
  JAVA: <Content>{
    reference: {title: "Java", link: "https://en.wikipedia.org/wiki/Java_(programming_language)"},
    status: Viewed.VIEWED,
    archived: true
  },
  KOTLIN: <Content>{
    reference: {title: "Kotlin", link: "https://en.wikipedia.org/wiki/Kotlin_(programming_language)"},
    status: Viewed.VIEWED,
    archived: true
  },
  RUBY_ON_RAILS: <Content>{
    reference: {title: "Ruby (on Rails)", link: "https://en.wikipedia.org/wiki/Ruby_on_Rails"},
    status: Viewed.VIEWED,
    archived: true
  },
  C_SHARP: <Content>{
    reference: {title: "C#", link: "https://en.wikipedia.org/wiki/C_Sharp_(programming_language)"},
    status: Viewed.VIEWED,
    archived: true
  },
  DOT_NET: <Content>{
    reference: {title: ".NET", link: "https://en.wikipedia.org/wiki/.NET"},
    status: Viewed.VIEWED,
    archived: true
  },
  BLAZOR: <Content>{
    reference: {title: "Blazor", link: "https://en.wikipedia.org/wiki/Blazor"},
    status: Viewed.VIEWED,
    archived: true
  },
  JAVASCRIPT: <Content>{
    reference: {title: "JavaScript", link: "https://en.wikipedia.org/wiki/JavaScript"},
    status: Viewed.VIEWED
  },
  CSS: <Content>{reference: {title: "CSS", link: "https://en.wikipedia.org/wiki/CSS"}, status: Viewed.VIEWED},
  SASS: <Content>{
    reference: {title: "SASS", link: "https://en.wikipedia.org/wiki/Sass_(stylesheet_language)"},
    status: Viewed.VIEWED
  },
  HTML: <Content>{reference: {title: "HTML", link: "https://en.wikipedia.org/wiki/HTML"}, status: Viewed.VIEWED},
  WEBPACK: <Content>{reference: {title: "Webpack", link: "https://webpack.js.org/"}, status: Viewed.VIEWED},
  TYPESCRIPT: <Content>{
    reference: {title: "TypeScript", link: "https://en.wikipedia.org/wiki/TypeScript"},
    status: Viewed.VIEWED
  },
  REACT: <Content>{
    reference: {title: "React", link: "https://en.wikipedia.org/wiki/React_(JavaScript_library)"},
    status: Viewed.VIEWED
  },
  BLUEPRINT_JS: <Content>{
    reference: {title: "Blueprint.js", link: "https://github.com/palantir/blueprint"},
    status: Viewed.VIEWED
  },
  SLATE: <Content>{
    reference: {title: "Slate", link: "https://github.com/ianstormtaylor/slate"},
    status: Viewed.IN_PROGRESS
  },
  THREEJS: <Content>{
    reference: {title: "Three.js", link: "https://github.com/mrdoob/three.js/"},
    status: Viewed.IN_PROGRESS
  },
  NEXTJS: <Content>{
    reference: {title: "Next.js", link: "https://nextjs.org/"},
    status: Viewed.IN_PROGRESS
  },
  DREI: <Content>{reference: {title: "drei", link: "https://github.com/pmndrs/drei"}, status: Viewed.IN_PROGRESS},
  WASM: <Content>{
    reference: {title: "WebAssembly", link: "https://en.wikipedia.org/wiki/WebAssembly"},
    status: Viewed.IN_PROGRESS
  },
  ASSEMBLY_SCRIPT: <Content>{
    reference: {title: "AssemblyScript", link: "https://en.wikipedia.org/wiki/AssemblyScript"},
    status: Viewed.IN_PROGRESS
  },
  CPP: <Content>{reference: {title: "C++", link: "https://en.wikipedia.org/wiki/C%2B%2B"}, status: Viewed.VIEWED},
  PYTHON: <Content>{
    reference: {title: "Python", link: "https://en.wikipedia.org/wiki/Python_(programming_language)"},
    status: Viewed.VIEWED
  },
  GO: <Content>{
    reference: {title: "Go", link: "https://en.wikipedia.org/wiki/Go_(programming_language)"},
    status: Viewed.VIEWED
  },
  HASKELL: <Content>{
    reference: {title: "Haskell", link: "https://en.wikipedia.org/wiki/Haskell"},
    status: Viewed.VIEWED
  },
  WOLFRAM_LANGUAGE: <Content>{
    reference: {
      title: "Wolfram Language",
      link: "https://en.wikipedia.org/wiki/Wolfram_Language"
    }, status: Viewed.VIEWED
  },
  LLVM: <Content>{reference: {title: "LLVM", link: "https://en.wikipedia.org/wiki/LLVM"}, status: Viewed.IN_PROGRESS},
  IPFS: <Content>{
    reference: {title: "IPFS", link: "https://en.wikipedia.org/wiki/InterPlanetary_File_System"},
    status: Viewed.VIEWED
  },
  IPVM: <Content>{reference: {title: "IPVM", link: "https://github.com/ipvm-wg"}, status: Viewed.VIEWED},
  SQL: <Content>{
    reference: {title: "SQL", link: "https://en.wikipedia.org/wiki/SQL"},
    status: Viewed.VIEWED,
    archived: true
  },
  MYSQL: <Content>{
    reference: {title: "MySQL", link: "https://en.wikipedia.org/wiki/MySQL"},
    status: Viewed.VIEWED,
    archived: true
  },
  POSTGRESQL: <Content>{
    reference: {title: "PostgreSQL", link: "https://en.wikipedia.org/wiki/PostgreSQL"},
    status: Viewed.VIEWED,
    archived: true
  },
  MONGO_DB: <Content>{
    reference: {title: "MongoDB", link: "https://en.wikipedia.org/wiki/MongoDB"},
    status: Viewed.VIEWED,
    archived: true
  },
  REDIS: <Content>{
    reference: {title: "Redis", link: "https://en.wikipedia.org/wiki/Redis"},
    status: Viewed.VIEWED,
    archived: true
  },
  RABBIT_MQ: <Content>{
    reference: {title: "RabbitMQ", link: "https://en.wikipedia.org/wiki/RabbitMQ"},
    status: Viewed.VIEWED,
    archived: true
  },
  GIT: <Content>{reference: {title: "Git", link: "https://en.wikipedia.org/wiki/Git"}, status: Viewed.VIEWED},
  GITLAB: <Content>{
    reference: {title: "GitLab", link: "https://en.wikipedia.org/wiki/GitLab"},
    status: Viewed.VIEWED
  },
  GITHUB: <Content>{
    reference: {title: "GitHub", link: "https://en.wikipedia.org/wiki/GitHub"},
    status: Viewed.VIEWED
  },
  BITBUCKET: <Content>{
    reference: {title: "Bitbucket", link: "https://en.wikipedia.org/wiki/Bitbucket"},
    status: Viewed.VIEWED,
    archived: true
  },
  DOCKER: <Content>{
    reference: {title: "Docker", link: "https://en.wikipedia.org/wiki/Docker_(software)"},
    status: Viewed.VIEWED
  },
  KUBERNETES: <Content>{
    reference: {title: "Kubernetes", link: "https://en.wikipedia.org/wiki/Kubernetes"},
    status: Viewed.VIEWED,
    archived: true
  },
  NGINX: <Content>{reference: {title: "NGINX", link: "https://en.wikipedia.org/wiki/Nginx"}, status: Viewed.VIEWED},
  NPM: <Content>{
    reference: {title: "NPM", link: "https://en.wikipedia.org/wiki/Npm_(software)"},
    status: Viewed.VIEWED
  },
  MAVEN: <Content>{
    reference: {title: "Maven", link: "https://en.wikipedia.org/wiki/Apache_Maven"},
    status: Viewed.VIEWED,
    archived: true
  },
  LINUX: <Content>{reference: {title: "Linux", link: "https://en.wikipedia.org/wiki/Linux"}, status: Viewed.VIEWED},
  ANDROID: <Content>{
    reference: {title: "Android", link: "https://en.wikipedia.org/wiki/Android_(operating_system)"},
    status: Viewed.VIEWED
  },
  GCP: <Content>{
    reference: {title: "GCP", link: "https://en.wikipedia.org/wiki/Google_Cloud_Platform"},
    status: Viewed.VIEWED,
    archived: true
  },
  AZURE: <Content>{
    reference: {title: "Azure", link: "https://en.wikipedia.org/wiki/Microsoft_Azure"},
    status: Viewed.VIEWED,
    archived: true
  },
  AWS: <Content>{
    reference: {title: "AWS", link: "https://en.wikipedia.org/wiki/Amazon_Web_Services"},
    status: Viewed.VIEWED,
    archived: true
  },
  SPIGOT_MC: <Content>{
    reference: {title: "SpigotMC", link: "https://www.spigotmc.org/"},
    status: Viewed.VIEWED,
    archived: true
  },
  BUNGEE_CORD: <Content>{
    reference: {title: "BungeeCord", link: "https://www.spigotmc.org/"},
    status: Viewed.VIEWED,
    archived: true
  },
  BUKKIT: <Content>{
    reference: {title: "Bukkit", link: "https://dev.bukkit.org/"},
    status: Viewed.VIEWED,
    archived: true
  },
  FLATPAK: <Content>{
    reference: {title: "Flatpak", link: "https://en.wikipedia.org/wiki/Flatpak"},
    status: Viewed.VIEWED,
    archived: false
  },
  OBS: <Content>{
    reference: {title: "OBS Studio", link: "https://en.wikipedia.org/wiki/OBS_Studio"},
    status: Viewed.VIEWED,
    archived: false
  },
  CLOUDFLARE: <Content>{
    reference: {title: "Cloudflare", link: "https://en.wikipedia.org/wiki/Cloudflare"},
    status: Viewed.VIEWED,
    archived: false
  },
  CHYP: <Content>{
    reference: {title: "Chyp", link: "https://github.com/akissinger/chyp"},
    status: Viewed.VIEWED,
    archived: false
  },
  WEBGPU: <Content>{
    reference: {title: "WebGPU", link: "https://github.com/gpuweb/gpuweb"},
    status: Viewed.VIEWED,
    archived: false
  },
  INTELLI_J: <Content>{
    reference: {title: "IntelliJ", link: "https://github.com/JetBrains/intellij-community"},
    status: Viewed.VIEWED,
    archived: false
  },
  VS_CODE: <Content>{
    reference: {title: "VS Code", link: "https://github.com/microsoft/vscode"},
    status: Viewed.VIEWED,
    archived: false
  },
  ECLIPSE: <Content>{
    reference: {title: "Eclipse", link: "https://github.com/eclipse-platform/eclipse.platform"},
    status: Viewed.VIEWED,
    archived: false
  },
}

export default REFERENCES;

export const ARTICLES_2026: Content[] = [
  REFERENCES.THE_STRANGEST_MAN,
  REFERENCES.ECCE_HOMO,
  REFERENCES.THE_THREE_BODY_PROBLEM,
  REFERENCES.SHIFT,
  REFERENCES.PAUL_ROSOLIE_UNCONTACTED_TRIBES_IN_THE_AMAZON_JUNGLE_489,
]

export const ARTICLES_2025: Content[] = [
  REFERENCES.WOOL,
  REFERENCES.HARRY_POTTER_1_7,
  REFERENCES.PROPOSITIONS_AS_TYPES,
  REFERENCES.PROGRAMMING_DISTRIBUTED_SYSTEMS,
  REFERENCES.DAN_HOUSER_GTA_RED_DEAD_REDEMPTION_ROCKSTAR_ABSURD_FUTURE_OF_GAMING_484,
  REFERENCES.DECIPHERING_SECRETS_OF_ANCIENT_CIVILIZATIONS_NOAHS_ARK_AND_FLOOD_MYTHS_487,
  REFERENCES.PAVEL_DUROV_TELEGRAM_FREEDOM_CENSORSHIP_MONEY_POWER_HUMAN_NATURE_482,
  REFERENCES.DAVID_KIRTLEY_NUCLEAR_FUSION_PLASMA_PHYSICS_AND_THE_FUTURE_OF_ENERGY_485,
  REFERENCES.INFINITY_PARADOXES_GÖDEL_INCOMPLETENESS_THE_MATHEMATICAL_MULTIVERSE_488,
  REFERENCES._26_WILL_KINNEY___BEFORE_THE_BIG_BANG_INFLATION_INFINITY_OF_WORLDS,
  REFERENCES._27_JASON_STEFFEN___KEPLER_MISSION_LEGACY_PARTICLE_PHYSICS_OPTIMAL_PLANE_BOARDING,
  REFERENCES._28_NÉSTOR_ESPINOZA___JWST_EXOPLANET_ATMOSPHERES_MOLECULE_DETECTION,

  REFERENCES.CRAFTING_INTERPRETERS,
  REFERENCES.FUNCTIONAL_PROGRAMMING_IN_LEAN,
  REFERENCES.REFLECTIONS_ON_EQUALITY,
  REFERENCES.CUBICAL_TYPE_THEORY,
  REFERENCES.ABSTRACT_INTERPRETATION_IN_A_NUTSHELL,
  REFERENCES.ABSTRACT_INTERPRETATION_A_UNIFIED_LATTICE_MODEL_FOR_STATIC_ANALYSIS_OF_PROGRAMS_BY_CONSTRUCTION_OR_APPROXIMATION_OF_FIXPOINTS,
  REFERENCES.LEVIATHAN_WAKES,
  REFERENCES.CUBICAL_TYPES_FOR_THE_WORKING_FORMALIZER,
  REFERENCES.EASY_ABSTRACT_INTERPRETATION_WITH_SPARTA,
  REFERENCES.A_LITTLE_TASTE_OF_DEPENDENT_TYPES,
  REFERENCES._24___MODERN_COSMOLOGY_HUBBLE_TENSION_EXOTIC_PHYSICS,
  REFERENCES._25___PBS_SPACETIME_SCIENCE_ON_YOUTUBE_QUASARS,
  REFERENCES.DAVE_PLUMMER_PROGRAMMING_AUTISM_AND_OLD_SCHOOL_MICROSOFT_STORIES_479,
  REFERENCES.DAVE_HONE_T_REX_DINOSAURS_EXTINCTION_EVOLUTION_AND_JURASSIC_PARK_480,
  REFERENCES.TIM_SWEENEY_FORTNITE_UNREAL_ENGINE_AND_THE_FUTURE_OF_GAMING_467,
  REFERENCES.QUANTUM_THEORY_AS_A_NEW_KIND_OF_STOCHASTIC_PROCESS,
  REFERENCES.KEYNOTE_HIGHER_INDUCTIVE_TYPES_IN_HOMOTOPY_TYPE_THEORY,
  REFERENCES.THE_VERSE_PROGRAMMING_LANGUAGE_GDC_2023,

  REFERENCES.READY_PLAYER_ONE,
  REFERENCES.READY_PLAYER_TWO,
  REFERENCES.MSP_101_GENERALISATION_IN_LLMS_PETAR_VELIČKOVIĆ,
  REFERENCES.SUNDAR_PICHAI_CEO_OF_GOOGLE_AND_ALPHABET_471,
  REFERENCES.TERENCE_TAO_HARDEST_PROBLEMS_IN_MATHEMATICS_PHYSICS_THE_FUTURE_OF_AI_472,
  REFERENCES.DHH_FUTURE_OF_PROGRAMMING_AI_RUBY_ON_RAILS_PRODUCTIVITY_PARENTING_474,
  REFERENCES.DEMIS_HASSABIS_FUTURE_OF_AI_SIMULATING_REALITY_PHYSICS_AND_VIDEO_GAMES_475,
  REFERENCES.MINDSCAPE_323_JACOB_BARANDES_ON_INDIVISIBLE_STOCHASTIC_QUANTUM_MECHANICS,
  REFERENCES._23___FINE_TUNING_MULTIVERSE_COSMOLOGICAL_TENSIONS,

  REFERENCES.STRING_DIAGRAM_REWRITE_THEORY_III_CONFLUENCE_WITH_AND_WITHOUT_FROBENIUS,
  REFERENCES.INFLUENCE_OF_TEMPORAL_INFORMATION_GAPS_ON_DECISION_MAKING_DESCRIBING_THE_DYNAMICS_OF_WORKING_MEMORY,
  REFERENCES.BLACK_HOLES_WORMHOLES_ALIENS_PARADOXES_EXTRA_DIMENSIONS_468,
  REFERENCES._19___INFLATION_B_MODES_AND_LOSING_THE_NOBEL_PRIZE,
  REFERENCES._20___KEPLER_MISSION_EXOPLANETS_WITH_JWST_FUTURE_IMAGERS,
  REFERENCES._21___EARLY_MARS_TERRAFORMINGSETTLING_MARS,
  REFERENCES._22___ORIGIN_OF_LIFE_ASSEMBLY_THEORY_BIOSIGNATURES,
  REFERENCES.RULES_THAT_REALITY_PLAYS_BY___343,
  REFERENCES.MISTAKING_THE_MAP_FOR_THE_TERRITORY_IN_PHYSICS___344,

  REFERENCES.THE_EQUIVALENCE_BETWEEN_GEOMETRICAL_STRUCTURES_AND_ENTROPY,
  REFERENCES.DEEPSEEK_CHINA_OPENAI_NVIDIA_XAI_TSMC_STARGATE_AND_AI_MEGACLUSTERS_459,
  REFERENCES.WHY_PHYSICS_WITHOUT_PHILOSOPHY_IS_DEEPLY_BROKEN_PART_2,
  REFERENCES.HARVARD_SCIENTIST_THERE_IS_NO_QUANTUM_MULTIVERSE_PART_3,
  REFERENCES.HARVARD_PHYSICIST_DEBUNKS_PARTICLE_SUPERPOSITION,
  REFERENCES.TOP_AI_SCIENTIST_UNIFIES_WOLFRAM_LEIBNIZ_CONSCIOUSNESS,
  REFERENCES.THE_THEORY_THAT_EXPLAINS_YOU_FREE_ENERGY_PRINCIPLE,

  REFERENCES.EINSTEIN_HIS_LIFE_AND_UNIVERSE,
  REFERENCES.THE_FUTURE_OF_BRAIN_EMULATION_IS_LOOKING_SPIKY,
  REFERENCES.WHY_THE_GODFATHER_OF_AI_NOW_FEARS_HIS_OWN_CREATION,
  REFERENCES.THE_MAJOR_FLAWS_IN_FUNDAMENTAL_PHYSICS,
  REFERENCES.THE_CRISIS_IN_STRING_THEORY_IS_WORSE_THAN_YOU_THINK,
  REFERENCES.MATH_HAS_CHANGED_FOREVER
]

export const ARTICLES_2024: Content[] = [
  REFERENCES.APPLIED_CATEGORY_THEORY_IN_CHEMISTRY_COMPUTING_AND_SOCIAL_NETWORKS,
  REFERENCES.UNIQUENESS_TREES_A_POSSIBLE_POLYNOMIAL_APPROACH_TO_THE_GRAPH_ISOMORPHISM_PROBLEM,
  REFERENCES.ALIEN_CIVILIZATIONS_AND_THE_SEARCH_FOR_EXTRATERRESTRIAL_LIFE_LEX_FRIDMAN_PODCAST_455,
  REFERENCES.THERES_NO_WAVE_FUNCTION,
  REFERENCES.THE_POTENTIAL_OF_THE_HUMAN_BRAIN,
  REFERENCES.THE_UNIVERSE_WRITES_ITSELF_INTO_EXISTENCE_MOMENT_BY_MOMENT,

  REFERENCES.HUNTERS_OF_DUNE,
  REFERENCES.THE_LITTLE_BOOK_OF_DEEP_LEARNING,
  REFERENCES.PREFACE_WHAT_IS_OPENGL,
  REFERENCES.FOUNDATIONS_OF_BIDIRECTIONAL_PROGRAMMING_I_WELL_TYPED_SUBSTRUCTURAL_LANGUAGES,
  REFERENCES.FOUNDATIONS_OF_BIDIRECTIONAL_PROGRAMMING_II_NEGATIVE_TYPES,
  REFERENCES.THE_YOGA_OF_CONTEXTS_I,
  REFERENCES.WHY_DOES_BIOLOGICAL_EVOLUTION_WORK_A_MINIMAL_MODEL_FOR_BIOLOGICAL_EVOLUTION_AND_OTHER_ADAPTIVE_PROCESSES,
  REFERENCES._20TH_CENTURY_S_GREATEST_LIVING_SCIENTIST_SIR_ROGER_PENROSE,
  REFERENCES.THE_QUANTUM_HERETIC_A_NEW_THEORY_OF_EVERYTHING,
  REFERENCES.MAYA_AZTEC_INCA_AND_LOST_CIVILIZATIONS_OF_SOUTH_AMERICA_LEX_FRIDMAN_PODCAST_446,
  REFERENCES.THE_ROMAN_EMPIRE___RISE_AND_FALL_OF_ANCIENT_ROME_LEX_FRIDMAN_PODCAST_443,
  REFERENCES.MINDSCAPE_289_THE_NEXT_GENERATION_OF_PARTICLE_EXPERIMENTS,
  REFERENCES.MINDSCAPE_291_THE_BIOLOGY_OF_DEATH_AND_AGING,
  REFERENCES.MATHS_OF_QUANTUM_MECHANICS,

  REFERENCES.COMPUTING_MACHINERY_AND_INTELLIGENCE,
  REFERENCES.VON_NEUMANN_AND_LATTICE_THEORY,
  REFERENCES.WHEN_EXACTLY_WILL_THE_ECLIPSE_HAPPEN_A_MULTIMILLENNIUM_TALE_OF_COMPUTATION,
  REFERENCES.ARE_ALL_FISH_THE_SAME_SHAPE_IF_YOU_STRETCH_THEM_THE_VICTORIAN_TALE_OF_ON_GROWTH_AND_FORM,
  REFERENCES.WHATS_REALLY_GOING_ON_IN_MACHINE_LEARNING_SOME_MINIMAL_MODELS,
  REFERENCES.THE_HYDROGEN_ATOM_INTRO_TO_QUANTUM,
  REFERENCES.MINDSCAPE_287_INSTITUTIONS_AND_THE_LEGACY_OF,
  REFERENCES.LIVE_SCIENCE_SPINAL_GRAPHS_HYPERGRAPH_CONFLUENCE_SYMMETRY_AND,
  REFERENCES.LIVE_SCIENCE_INFRAGEOMETRY_CORRESPONDENCES_DIFFERENTIAL_GEOMETRY_HYPERGRAPH,
  REFERENCES.LIVE_SCIENCE_QUANTUM_PARADOXES_DELAYED_CHOICE_QUANTUM_ERASER_CHSH_GAME,
  REFERENCES.CONSCIOUSNESS_BIOLOGY_UNIVERSAL_MIND_EMERGENCE_CANCER,
  REFERENCES.THE_CRISIS_IN_FUNDAMENTAL_PHYSICS_IS_WORSE_THAN_YOU,
  REFERENCES.NEURALINK_AND_THE_FUTURE_OF_HUMANITY_LEX_FRIDMAN_PODCAST,
  REFERENCES.PHYSICS_OF_LIFE_TIME_COMPLEXITY_AND_ALIENS_LEX_FRIDMAN_PODCAST,

  REFERENCES.PLURALISTIC_THE_DISENSHITTIFIED_INTERNET_STARTS_WITH_LOYAL_USER_AGENTS,
  REFERENCES.ELON_MUSK,
  REFERENCES.FUN_RAISING_FUNDING_SCHOOL_QA_SEMF,
  REFERENCES.HUMAN_MEMORY_IMAGINATION_DEJA_VU_AND_FALSE_MEMORIES_LEX_FRIDMAN_PODCAST,
  REFERENCES.JUNGLE_APEX_PREDATORS_ALIENS_UNCONTACTED_TRIBES_AND_GOD_LEX_FRIDMAN_PODCAST,
  REFERENCES.LONGEVITY_MEDITATION_PHILOSOPHIES_CONSCIOUSNESS_NATURE_OF,

  REFERENCES.REVERSE_ENGINEERING_SAME_THING_WE_DO_EVERY_WEEKEND_DOCUMENTING_THE_AMD_7900XTX_PART2,
  REFERENCES.RESEARCHING_DOCUMENTING_THE_AMD_7900XTX_SO_WE_CAN_UNDERSTAND_WHY_IT_CRASHES_RDNA_3,
  REFERENCES.WHAT_MAKES_HIGH_DIMENSIONAL_NETWORKS_PRODUCE_LOW_DIM_ACTIVITY,
  REFERENCES.LISA_RANDALL_DARK_MATTER_THEORETICAL_PHYSICS_AND_EXTINCTION_EVENTS_LEX_FRIDMAN_PODCAST_403,
  REFERENCES.REALITY_IS_A_PARADOX___MATHEMATICS_PHYSICS_TRUTH_LOVE_LEX_FRIDMAN_PODCAST_370,
  REFERENCES.THE_LANGLANDS_PROGRAM___NUMBERPHILE,
  REFERENCES.TIME_AND_QUANTUM_MECHANICS_SOLVED_LEE_SMOLIN,
  REFERENCES.EDWARD_FRENKEL_INFINITY_AI_STRING_THEORY_DEATH_THE_SELF,
  REFERENCES.LIVE_SCIENCE_INFRAGEOMETRY_CORE_DEFINITIONS_DIFFERENTIAL_GEOMETRY_TANGENT_BUNDLES_FUNCTIONS,
  REFERENCES.LIVE_SCIENCE_INFRAGEOMETRY_WORKING_SESSION_FUNCTIONS_EDGES_PLACES_BIPARTITE_GRAPHS,
  REFERENCES.FELLOW_FOCUS_RICHARD_ASSAR_METAMETAVERSE_ALIEN_MINDS_MACHINE_LEARNING_CELLULAR_AUTOMATA,
  REFERENCES.FELLOW_FOCUS_NIK_MURZIN_QUANTUM_FRAMEWORK,
  REFERENCES.EXPLORE_LEARN_THE_MAP_OF_INSTITUTE_RESEARCH_QUANTUM_PROBABILITIES_MULTICOMPUTATION_CAUSALITY,
  REFERENCES.EXPLORE_LEARN_THE_MAP_OF_INSTITUTE_RESEARCH_MULTICOMPUTATION_INFRAGEOMETRY_RULIAD,
  REFERENCES.EXPLORE_LEARN_FUNDAMENTALS_WHATS_HYPE_ABOUT_HYPERGRAPHS_GRAPH_THEORY_HYPERMATRIX_ARITY,
  REFERENCES.MINDSCAPE_274_GIZEM_GUMUSKAYA_ON_BUILDING_ROBOTS_FROM_HUMAN_CELLS,
  REFERENCES.COMMUNITY_LIVESTREAM_DATA_DIMENSIONALITY,
  REFERENCES.ALL_IN_PODCAST_E173,
  REFERENCES.ALL_IN_PODCAST_E174,
  REFERENCES.ALL_IN_PODCAST_E175,
  REFERENCES.ALL_IN_PODCAST_E176,

  REFERENCES.CALCULUS_RATIOCINATOR_VS_CHARACTERISTICA_UNIVERSALIS_THE_TWO_TRADITIONS_IN_LOGIC_REVISITED,
  REFERENCES.CARGO_CULT_SCIENCE,
  REFERENCES.MILLIONS_OF_CHILDREN_LEARN_ONLY_VERY_LITTLE_HOW_CAN_THE_WORLD_PROVIDE_A_BETTER_EDUCATION_TO_THE_NEXT_GENERATION,
  REFERENCES.STRIPES_2023_ANNUAL_LETTER,
  REFERENCES.PLAYING_VALUING_AND_LIVING_EXAMINING_NIETZSCHES_PLAYFUL_RESPONSE_TO_NIHILISM,
  REFERENCES.THE_BUILD_YOUR_OWN_OPEN_GAMES_ENGINE_BOOTCAMP_PART_I_LENSES,
  REFERENCES.CAN_AI_SOLVE_SCIENCE,
  REFERENCES.COMMUNITY_LIVESTREAM_BIOELECTRICITY,
  REFERENCES.QUANTUM_GRAVITY_WOLFRAM_PHYSICS_PROJECT,
  REFERENCES.PARADIGM_SHIFT_GHOST_PARTICLES_CONSTRUCTOR_THEORY,
  REFERENCES.THE_STRING_THEORY_ICEBERG_EXPLAINED,
  REFERENCES.EXPLORING_SNIFFING_NVIDIAS_IOCTLS_OPEN_GPU_KERNEL_MODULES_DEBUG_PTX_CUDA,
  REFERENCES.PROGRAMMING_WRITING_A_FUZZER_AND_NOT_GETTING_TRIGGERED_WHEN_THE_AMD_GPU_CRASHES_UMR,
  REFERENCES.PROGRAMMING_RIPPING_OUT_ALL_OF_AMDS_USERSPACE_AMDGPU_IOCTLS_GPU_MEMORY_HSA_KFD,
  REFERENCES.ALL_IN_PODCAST_E169,
  REFERENCES.ALL_IN_PODCAST_E170,
  REFERENCES.ALL_IN_PODCAST_E171,
  REFERENCES.ALL_IN_PODCAST_E172,
  REFERENCES.SHANNON_LUMINARY_LECTURE_SERIES___STEPHEN_FRY,
  REFERENCES.CONTAINERS_FOR_COMPILER_ARCHITECTURE,
  REFERENCES.WHY_IT_WAS_ALMOST_IMPOSSIBLE_TO_MAKE_THE_BLUE_LED,
  REFERENCES.COMPOSITIONAL_GAME_THEORY_TOWARDS_INCENTIVES_MODELLING_AT_SCALE,
  REFERENCES.MINDSCAPE_268_MATT_STRASSLER_ON_RELATIVITY_FIELDS_AND_THE_LANGUAGE_OF_REALITY,
  REFERENCES.ACTINF_MATHSTREAM_0091_JONATHAN_GORARD_A_COMPUTATIONAL_PERSPECTIVE_ON_OBSERVATION_AND_COGNITION,
  REFERENCES.A_CONVERSATION_WITH_MARK_ZUCKERBERG_PATRICK_COLLISON_AND_TYLER_COWEN,

  REFERENCES.SOLVING_SAT_VIA_POSITIVE_SUPERCOMPILATION,
  REFERENCES.NAVIGATING_COGNITION_SPATIAL_CODES_FOR_HUMAN_THINKING,
  REFERENCES.TOWARDS_A_STRUCTURAL_TURN_IN_CONSCIOUSNESS_SCIENCE,
  REFERENCES.THE_GLASS_BEAD_GAME,
  REFERENCES.AN_INTRODUCTION_TO_HIGHER_ARITY_SCIENCE,
  REFERENCES.HISTORY_OF_SCIENCE_AND_TECHNOLOGY_QA_FEBRUARY_28,
  REFERENCES.GRETA_SEMINAR_HIGHER_ARITY_ALGEBRA_VIA_HYPERGRAPH_REWRITING,
  REFERENCES.WORKSHOP_AXIOMATIC_CREATION,
  REFERENCES.COMMUNITY_LIVESTREAM_AXIOMS_CREATIVITY,
  REFERENCES.CONCEPT_COLLIDER_GEOMETRY_OF_DATA_AND_NEURAL_CORRELATES,
  REFERENCES.WOLFRAM_PHYSICS_PROJECT_WORKING_SESSION___CAUSAL_MULTIWAY_SYSTEMS,
  REFERENCES.SCIENCE_RESEARCH_SESSION_HYPORULIAD,
  REFERENCES.A_CONVERSATION_BETWEEN_BOB_COECKE_AND_STEPHEN_WOLFRAM,
  REFERENCES.STEVE_JOBS,
  REFERENCES.JOHN_CLEESE_ON_CREATIVITY_IN_MANAGEMENT,
  REFERENCES.THE_TRILLION_DOLLAR_EQUATION,
  REFERENCES.STEVE_JOBS_PRESIDENT_CEO_NEXT_COMPUTER_CORP_AND_APPLE_MIT_SLOAN_DISTINGUISHED_SPEAKER_SERIES,
  REFERENCES.CARL_SAGAN_AT_MIT___MANAGEMENT_IN_THE_YEAR_2000_SLOAN_SCHOOL_SYMPOSIUM,
  REFERENCES.CHAMATH_PALIHAPITIYA_SOCIALCAPITAL_STARTUP_GRIND,
  REFERENCES.CHAMATH_PALIHAPITIYA_SPEAKING_AT_WATERLOO_INNOVATION_SUMMIT,
  REFERENCES.ALL_IN_PODCAST_E165,
  REFERENCES.ALL_IN_PODCAST_E164,
  REFERENCES.CONCEPT_COLLIDER_MATHEMATICAL_PHYSICS_ACTIVE_INFERENCE_FREE_ENERGY_ENTROPY,
  REFERENCES.CRDTS_GO_BRRR,
  REFERENCES.THIS_WEEKS_FINDS_18_CATEGORIFYING_THE_QUANTUM_HARMONIC_OSCILLATOR,
  REFERENCES.WOLFRAM_PHYSICS_PROJECT_WORKING_SESSION_QUANTUM_BLACK_HOLES_AND_OTHER_THINGS,
  REFERENCES.CAUSAL_INVARIANCE_VERSUS_CONFLUENCE,
  REFERENCES.CRDTS_THE_HARD_PARTS,
  REFERENCES.RIAK_DYNAMO_FIVE_YEARS_LATER_PRESENTED,
  REFERENCES.RIAK_CORE___AN_ERLANG_DISTRIBUTED_SYSTEMS_TOOLKIT,
  REFERENCES.ZXLIVE___AN_INTERACTIVE_GUI_FOR_THE_ZX_CALCULUS___RAZIN_A_SHAIKH,
  REFERENCES.GRAPHICAL_CSS_CODE_TRANSFORMATION_USING_ZX_CALCULUS,
  REFERENCES.THE_ZETA_CALCULUS,
  REFERENCES.HOW_TO_TAKE_THE_FACTORIAL_OF_ANY_NUMBER,
  REFERENCES.JEFF_BEZOS_AMAZON_AND_BLUE_ORIGIN_LEX_FRIDMAN_PODCAST_405,
  REFERENCES.HR_TALK_INTRO_TO_LARGE_LANGUAGE_MODELS,
  REFERENCES.STREAM_0_WHY_ALL_VIDEO_GAME_PROGRAMMERS_SHOULD_LEARN_GEOMETRIC_ALGEBRA,
  REFERENCES.THE_PERIODIC_TABLE_OF_GEOMETRIC_ALGEBRAS___CL301_DOES_ALL_3D_GAME_MATH_SO_WHAT_DOES_CLPQR_D,
  REFERENCES.GEOMETRIC_ALGEBRA_AS_A_TOOL_IN_TECHNICAL_COMMUNICATION,
  REFERENCES.MINDSCAPE_260_RICARD_SOLE_ON_THE_SPACE_OF_COGNITIONS,
  REFERENCES.MINDSCAPE_261_SANJANA_CURTIS_ON_THE_ORIGINS_OF_THE_ELEMENTS,
  REFERENCES.MINDSCAPE_264_SABINE_STANLEY_ON_WHATS_INSIDE_PLANETS,
  REFERENCES.MINDSCAPE_263_CHRIS_QUIGG_ON_SYMMETRY_AND_THE_BIRTH_OF_THE_STANDARD_MODEL,
  REFERENCES.MINDSCAPE_262_ERIC_SCHWITZGEBEL_ON_THE_WEIRDNESS_OF_THE_WORLD,
  REFERENCES.JUST_CHATTING_TECHNO_OPTIMISM_WINNING_OVER_NATURE_PROGRESSIVE_ACCELERATION,
  REFERENCES.PROGRAMMING_DECISION_TRANSFORMER_REINFORCEMENT_LEARNING_RL_LUNARLANDER_PART_1,
  REFERENCES.PROGRAMMING_RL_IS_DUMB_AND_DOESNT_WORK_REINFORCEMENT_LEARNING_LUNARLANDER_PART_2,
  REFERENCES.RESEARCHING_RL_IS_DUMB_AND_DOESNT_WORK_THEORY_REINFORCEMENT_LEARNING_PART_3,
  REFERENCES.RESEARCHING_MULTIGPU_WITH_HIP_OR_MAYBE_WITHOUT_HIP_HSA_HIP_GRAPH_PART_1,
  REFERENCES.PROGRAMMING_MULTIGPU_WITH_HIP_OR_MAYBE_WITHOUT_HIP_HSA_DISABLE_CACHE1_PART_2
]


export const ARTICLES_2023: Content[] = [
  REFERENCES.STRING_DIAGRAM_REWRITE_THEORY_II_REWRITING_WITH_SYMMETRIC_MONOIDAL_STRUCTURE,
  REFERENCES.CHYP_COMPOSING_HYPERGRAPHS_PROVING_THEOREMS,
  REFERENCES.OBSERVER_THEORY,
  REFERENCES.WASM_SPECTEC_ENGINEERING_A_FORMAL_LANGUAGE_STANDARD,
  REFERENCES.MINDSCAPE_259_ADAM_FRANK_ON_WHAT_ALIENS_MIGHT_BE_LIKE,
  REFERENCES.ANIMATION_VS_PHYSICS,
  REFERENCES.WHY_LIGHT_CAN_SLOW_DOWN_AND_WHY_IT_DEPENDS_ON_COLOR_OPTICS_PUZZLES,
  REFERENCES.LEE_CRONIN_CONTROVERSIAL_NATURE_PAPER_ON_EVOLUTION_OF_LIFE_AND_UNIVERSE_LEX_FRIDMAN_PODCAST_404,
  REFERENCES.BERKELEY_SEMINAR_DAVID_JAZ_MYERS_872023,
  REFERENCES.YUGOSLAVIAS_DIGITAL_TWIN,
  REFERENCES.PHYSICS_EXPLAINS_WHY_THERE_IS_NO_INFORMATION_ON_SOCIAL_MEDIA,
  REFERENCES.HOW_TO_ASK_QUESTIONS_THE_SMART_WAY,
  REFERENCES.COMPLEXITY_MATHEMATICS_COMMUNITY_LIVESTREAM,
  REFERENCES.HOLIDAY_SPECIAL_LIVESTREAM,
  REFERENCES.JUST_CHATTING_TESLA_AI_DAY_2022_SCIENCE_TECHNOLOGY,
  REFERENCES.PROGRAMMING_MISTRAL_MIXTRAL_ON_A_TINYBOX_AMD_P2P_MULTI_GPU_MIXTRAL_8X7B_32KSEQLEN,
  REFERENCES.PROGRAMMING_WHAT_IS_THE_Q_ALGORITHM_OPENAI_Q_STAR_ALGORITHM_MISTRAL_7B_PRM800K,
  REFERENCES.JUST_CHATTING_EFFECTIVE_ACCELERATIONISM_EACC_TECHNO_PESSIMISM_DECELERATION,
  REFERENCES.SCIENCE_THERMODYNAMICS_IS_TO_ENERGY_AS_IS_TO_INTELLIGENCE,
  REFERENCES.SCIENCE_THERMODYNAMICS_IS_TO_ENERGY_AS_ENTROPICS_IS_TO_INTELLIGENCE_PART_2,
  REFERENCES.PROGRAMMING_A_TINY_TOUR_THROUGH_TINYGRAD_NOOB_LESSON,
  REFERENCES.PROGRAMMING_TINYGRAD_WRITING_TUTORIALS_FOR_NOOBS,
  REFERENCES.RANT_COMPLAINING_ABOUT_HOW_TERRIBLE_QUALCOMM_IS_THE_BUSINESS_WORLD,
  REFERENCES.CHATTING_CHALLENGES_HIRING_PEOPLE_VISION_BUILDING_A_COMPANY_TINY_CORP_TINYGRADORG,
  REFERENCES.READING_TALKING_LETS_READ_ML_PAPERS,

  REFERENCES.STRING_DIAGRAM_REWRITE_THEORY_I,
  REFERENCES.REPTAR,
  REFERENCES.AGGREGATION_AND_TILING_AS_MULTICOMPUTATIONAL_PROCESSES,
  REFERENCES.PHYSICS_AND_ECONOMICS_SEMF_COMMUNITY_LIVESTREAM,
  REFERENCES.WOLFRAM_INSTITUTES_INFRAGEOMETRY_LIVESTREAMS,
  REFERENCES.HYPERMATRIX_WORKSHOP,
  REFERENCES.WOLFRAM_PHYSICS_PROJECT_RELATIONS_TO_CATEGORY_THEORY,
  REFERENCES.ALL_CONCEPTS_ARE_CAT_SHARP,
  REFERENCES.HIGHER_CATEGORY_THEORY_IN_CAT_SHARP,
  REFERENCES.ABSTRACTION_ENGINEERING_WITH_THE_PVS,
  REFERENCES.CAUSAL_VS_ACAUSAL_MODELING_BY_EXAMPLE,
  REFERENCES.RP_159,
  REFERENCES.RP_118,
  REFERENCES.MINDSCAPE_256,
  REFERENCES.THIS_WEEKS_FINDS_15,
  REFERENCES.THIS_WEEKS_FINDS_14,
  REFERENCES.SCALES_AND_SCIENCE_FICTION_WITH_BIOLOGIST_MICHAEL_LEVIN,
  REFERENCES.DELIMITED_CONTINUATIONS_FOR_EVERYONE,
  REFERENCES.HOMOTOPY_TYPE_THEORY_101,
  REFERENCES.FROM_CATEGORICAL_SYSTEMS_THEORY_TO_CATEGORICAL_CYBERNETICS,
  REFERENCES.THE_SEARCH_FOR_THE_PERFECT_DOOR,
  REFERENCES.EVOLVING_BRAINS_SOLID_LIQUID_AND_SYNTHETIC,

  REFERENCES.ZENBLEED,
  REFERENCES.DOWNFALL,
  REFERENCES.ASSEMBLY_THEORY_EXPLAINS_AND_QUANTIFIES_SELECTION_AND_EVOLUTION,
  REFERENCES.INSIDE_THE_WIZARD_RESEARCH_ENGINE,
  REFERENCES.IPVM_SEAMLESS_SERVICES_FOR_AN_OPEN_WORLD,
  REFERENCES.WHY_PROGRAMMING_LANGUAGES_MATTER,
  REFERENCES.WE_REALLY_DONT_KNOW_HOW_TO_COMPUTE,
  REFERENCES.FROM_GEOMETRY_TO_ALGEBRA_AND_BACK_AGAIN_4000_YEARS_OF_PAPERS,
  REFERENCES.WAR_TIME_PROOFS_AND_FUTURISTIC_PROGRAMS,
  REFERENCES.THE_ECONOMICS_OF_PROGRAMMING_LANGUAGES,
  REFERENCES.AN_APPROACH_TO_COMPUTING_AND_SUSTAINABILITY_INSPIRED_FROM_PERMACULTURE,
  REFERENCES.COMPUTATIONAL_PHSYICS_BEYOND_THE_GLASS,
  REFERENCES.CURSORLESS_A_SPOKEN_LANGUAGE_FOR_EDITING_CODE,

  REFERENCES.YASP_EPISODE_2,
  REFERENCES.MODERNIZING_COMPILER_DESIGN_FOR_CARBON_TOOLCHAIN,
  REFERENCES.COMPOSITIONAL_INTELLIGENCE,
  REFERENCES.MLST_OBSERVERS,
  REFERENCES.HIGHER_ORDER_COMPANY_ORIGINS_OF_THE_HVM,
  REFERENCES.THE_DISCOVER_OF_ZENBLEED,
  REFERENCES.THE_RING_0_FACADE_AWAKENING_THE_PROCESSORS_INNER_DEMONS,
  REFERENCES.REDUCTIO_AD_ABSURDUM,
  REFERENCES.BREAKING_THE_X86_INSTRUCTION_SET,
  REFERENCES.PAST_PRESENT_AND_FUTURE_OF_MATHEMATICS,
  REFERENCES.MINDSCAPE_253,
  REFERENCES.CRITICAL_THINKING_1,

  REFERENCES.THE_ORIGINS_AND_MOTIVATIONS_OF_UNIVALENT_FOUNDATIONS,
  REFERENCES.THE_END_OF_THE_ALEXANDRIA_PROJECT,
  REFERENCES.WHEN_IS_A_COMPUTER_PROOF_A_PROOF,
  REFERENCES.THE_ALEXANDRIA_PROJECT_WHAT_HAS_BEEN_ACCOMPLISHED,
  REFERENCES.ALEXANDRIA_LARGE_SCALE_FORMAL_PROOF_FOR_THE_WORKING_MATHEMATICIAN,
  REFERENCES.REMEMBERING_DOUG_LENAT,

  REFERENCES.CATEGORY_THEORY_I,
  REFERENCES.CATEGORY_THEORY_II,
  REFERENCES.CATEGORY_THEORY_III,
  REFERENCES.HACKENBUSH_A_WINDOW_TO_A_NEW_WORLD_OF_MATH,
  REFERENCES.DIHEAPS_A_NEW_SPECIES_OF_ALGEBRAIC_STRUCTURE,
  REFERENCES.QUANTUM_IN_PICTURES,
  REFERENCES.REMEMBERING_THE_IMPROBABLE_LIFE_OF_ED_FREDKIN,
  REFERENCES.WILL_COMPUTERS_REDEFINE_THE_ROOTS_OF_MATH,
  REFERENCES.A_FUNCTORIAL_PERSPECTIVE_ON_MULTICOMPUTATIONAL_IRREDUCIBILITY,
  REFERENCES.RESIDUALITY_THEORY_RANDOM_SIMULATION_AND_ATTRACTOR_NETWORKS,
  REFERENCES.BIOELECTRIC_NETWORKS_THE_COGNITIVE_GLUE_ENABLING_EVOLUTIONARY_SCALING_FROM_PHYSIOLOGY_TO_MIND,
  REFERENCES.COMPETENCY_IN_NAVIGATING_ARBITRARY_SPACES_AS_AN_INVARIANT_FOR_ANALYZING_COGNITION_IN_DIVERSE_EMBODIMENTS,
  REFERENCES.CHROME_SHIPS_WEBGPU,
  REFERENCES.GET_STARTED_WITH_GPU_COMPUTE_ON_THE_WEB,
  REFERENCES.SPAWNING_A_WASI_THREAD_WITH_RAW_WEBASSEMBLY,
  REFERENCES.WEBGPU_ALL_OF_THE_CORES_NONE_OF_THE_CANVAS,
  REFERENCES.ZX_CALCULUS_AND_EXTENDED_HYPERGRAPH_REWRITING_SYSTEMS_I,
  REFERENCES.FAST_AUTOMATED_REASONING_OVER_STRING_DIAGRAMS_USING_MULTIWAY_CAUSAL_STRUCTURE,
  REFERENCES.LAGRANGIAN_NEURAL_NETWORKS,
  REFERENCES.QUANTOMATRIC_A_PROOF_ASSISTANT_FOR_DIAGRAMMATIC_REASONING,
  REFERENCES.THE_SEMANTIC_CONCEPTION_OF_TRUTH_AND_THE_FOUNDATIONS_OF_SEMANTICS,

  REFERENCES.CHAPTERHOUSE_DUNE,

  REFERENCES.FOUNDATIONS_EDGE,
  REFERENCES.FOUNDATION_AND_EARTH,
  REFERENCES.PRELUDE_TO_FOUNDATION,
  REFERENCES.FORWARD_THE_FOUNDATION,

  REFERENCES.I_ROBOT,
  REFERENCES.THE_REST_OF_THE_ROBOTS,
  REFERENCES.THE_COMPLETE_ROBOT,
  REFERENCES.THE_CAVES_OF_STEEL,
  REFERENCES.THE_NAKED_SUN,
  REFERENCES.THE_ROBOTS_OF_DAWN,
  REFERENCES.ROBOTS_AND_EMPIRE,

  REFERENCES.THE_RISE_AND_FALL_OF_THE_THIRD_REICH,

  REFERENCES.A_PROJECT_TO_FIND_THE_FUNDAMENTAL_THEORY_OF_PHYSICS,
  REFERENCES.METAMATHEMATICS,
  REFERENCES.TWENTY_YEARS_NKS,

  REFERENCES.THE_SELFISH_GENE,
  REFERENCES.TRANSFORMER,
  REFERENCES.THE_VITAL_QUESTION,

  REFERENCES.INTERACTION_COMBINATORS,
  REFERENCES.VON_NEUMANNS_IMPOSSIBILITY_PROOF_MATHEMATICS_IN_THE_SERVICE_OF_RHETORICS,
  REFERENCES.PERFECTLY_SECURE_STEGANOGRAPHY_USING_MINIMUM_ENTROPY_COUPLING,
  REFERENCES.GENERAL_INTELLIGENCE_REQUIRES_RETHINKING_EXPLORATION,
  REFERENCES.DENSEPOSE_FROM_WIFI,
  REFERENCES.A_MECHANIZED_FORMALIZATION_OF_THE_WEBASSEMBLY_SPECIFICATION_IN_COQ,
  REFERENCES.A_DENOTATIONAL_SEMANTICS_FOR_THE_SYMMETRIC_INTERACTION_COMBINATORS,
  REFERENCES.DEEP_SELF_MODELING_AS_A_FUNDAMENTAL_PRINCIPLE_IN_THE_DESIGN_OF_INTELLIGENT_SYSTEMS,
  REFERENCES.AI_ARTIFICIAL_INTELLIGENCE_OR_ARTIFICAL_IGNORANCE,
  REFERENCES.FROM_HUME_TO_HUMAN_AI_A_RETURN_TO_THE_FOUNDATIONS_AND_RESTRICTIONS_OF_HUMEAN_REASONING,
  REFERENCES.BUILDING_HUMAN_LIKE_INTELLIGENCE_AN_EVOLUTIONARY_PERSPECTIVE,
  REFERENCES.A_CASE_FOR_COMPUTATIONAL_INTELLIGENCE_AS_RECURSIVE_ABSTRACTION_AND_GOAL_ORIENTED_SYNTHESIS,
  REFERENCES.REVERSE_ENGINEERING_WEBASSEMBLY,
  REFERENCES.TOROIDAL_TOPOLOGY_OF_POPULATION_ACTIVITY_IN_GRID_CELLS,
  REFERENCES.A_50_YEAR_QUEST_MY_PERSONAL_JOURNEY_WITH_THE_SECOND_LAW_OF_THERMODYNAMICS,
  REFERENCES.ALIEN_INTELLIGENCE_AND_THE_CONCEPT_OF_TECHNOLOGY,
  REFERENCES.CHATGPT_GETS_ITS_WOLFRAM_SUPERPOWERS,
  REFERENCES.COMPUTATIONAL_FOUNDATIONS_FOR_THE_SECOND_LAW_OF_THERMODYNAMICS,
  REFERENCES.FASTER_THAN_LIGHT_IN_OUR_MODEL_OF_PHYSICS_SOME_PRELIMINARY_THOUGHTS,
  REFERENCES.HOW_DID_WE_GET_HERE_THE_TANGLED_HISTORY_OF_THE_SECOND_LAW_OF_THERMODYNAMICS,
  REFERENCES.MULTICOMPUTATIONAL_IRREDUCIBILITY
]


export const ARTICLES_2021: Content[] = [
  REFERENCES.DUNE,
  REFERENCES.DUNE_MESSIAH,
  REFERENCES.CHILDREN_OF_DUNE,

  REFERENCES._1984,
]


export const ARTICLES_2022: Content[] = [

  REFERENCES.GOD_EMPEROR_OF_DUNE,
  REFERENCES.HERETICS_OF_DUNE,

  REFERENCES.FOUNDATION,
  REFERENCES.FOUNDATION_AND_EMPIRE,
  REFERENCES.SECOND_FOUNDATION,

  REFERENCES.THE_ART_OF_WAR,

  REFERENCES.A_THOUSAND_BRAINS,

  REFERENCES.QUANTUM_EINSTEIN_BOHR_AND_THE_GREAT_DEBATE_ABOUT_THE_NATURE_OF_REALITY,
  REFERENCES.THE_FUTURE_OF_HUMANITY,

  REFERENCES.FLUID_CONCEPTS_AND_CREATIVE_ANALOGIES,
  REFERENCES.GODEL_ESCHER_BACH,

  REFERENCES.COMBINATORS_A_CENTENNIAL_VIEW,

  REFERENCES.REASONING_WITH_BELIEF_FUNCTIONS,
  REFERENCES.CONTEXT_AWARE_COMPUTING_APPLICATIONS,
  REFERENCES.IS_REALISM_COMPATIBLE_WITH_TRUE_RANDOMNESS,
  REFERENCES.WHAT_IS_A_KNOWLEDGE_REPRESENTATION,
  REFERENCES.LEARNING_TO_REPRESENT_PROGRAMS_WITH_GRAPHS,
  REFERENCES.A_THEORY_OF_INCREMENTAL_COMPRESSION,
  REFERENCES.ON_THE_MEASURE_OF_INTELLIGENCE,
  REFERENCES.EMPIRICISM_SEMANTICS_AND_ONTOLOGY,
  REFERENCES.GOING_BEYOND_THE_POINT_NEURON,
  REFERENCES.THE_GENERAL_THEORY_OF_GENERAL_INTELLIGENCE,
  REFERENCES.EMBODIED_SITUATED_AND_GROUNDED_INTELLIGENCE,
  REFERENCES.THE_DEBATE_OVER_UNDERSTANDING_IN_AI_LARGE_LANGUAGE_MODELS,
  REFERENCES.BEYOND_PROGRAMMING_LANGUAGES,
  REFERENCES.DATA_COMPRESSION_EXPLAINED,
  REFERENCES.IPFS_FAN_A_FUNCTION_ADDRESSABLE_COMPUTATION_NETWORK,
  REFERENCES.AVOIDING_CATASTROPHE_ACTIVE_DENDRITES_ENABLE_MULTI_TASK_LEARNING_IN_DYNAMICS_ENVIRONMENTS,
  REFERENCES.GAMES_AND_PUZZLES_AS_MULTICOMPUTATIONAL_SYSTEMS,
  REFERENCES.A_THOUSAND_BRAINS_TOWARD_BIOLOGICALLY_CONSTRAINED_AI,
  REFERENCES.IS_PROBABILITY_THEORY_RELEVANT_FOR_UNCERTAINTY,
  REFERENCES.MULTICOMPUTATION_A_FOURTH_PARADIGM_FOR_THEORETICAL_SCIENCE,
  REFERENCES.ATTENTION_IS_ALL_YOU_NEED,
  REFERENCES.ON_THE_EINSTEIN_PODOLSKY_ROSEN_PARADOX,
  REFERENCES.THE_ALGORITHMIC_ORIGINS_OF_LIFE,
  REFERENCES.THE_COMPUTER_FOR_THE_21ST_CENTURY,
  REFERENCES.SOK_SANITIZING_FOR_SECURITY,
  REFERENCES.UNCERTAINTY_BELIEF_AND_PROBABILITY,
  REFERENCES.ON_DEFINING_ARTIFICAL_INTELLIGENCE,
  REFERENCES.ROBUST_SPEECH_RECOGNITION_VIA_LARGE_SCALE_WEAK_SUPERVISION,
]

export const FAMILIAR_TOOLS: Content[] = [

  REFERENCES.PYTHON,
  // REFERENCES.GO,
  // REFERENCES.CHYP,
  // REFERENCES.LLVM,
  // REFERENCES.HASKELL,
  REFERENCES.JAVA,
  REFERENCES.RUBY_ON_RAILS,
  REFERENCES.C_SHARP,
  REFERENCES.DOT_NET,
  REFERENCES.BLAZOR,
  REFERENCES.JAVASCRIPT,
  REFERENCES.KOTLIN,
  REFERENCES.CSS,
  REFERENCES.SASS,
  REFERENCES.HTML,
  REFERENCES.WASM,
  REFERENCES.WEBGPU,
  REFERENCES.RUST,
  REFERENCES.CPP,
  REFERENCES.WOLFRAM_LANGUAGE,

  REFERENCES.WEBPACK,

  REFERENCES.ASSEMBLY_SCRIPT,
  REFERENCES.TYPESCRIPT,
  REFERENCES.REACT,
  // REFERENCES.BLUEPRINT_JS,
  // REFERENCES.SLATE,
  REFERENCES.THREEJS,
  REFERENCES.DREI,
  REFERENCES.NEXTJS,

  REFERENCES.IPFS,
  REFERENCES.IPVM,
  REFERENCES.SQL,
  REFERENCES.MYSQL,
  REFERENCES.POSTGRESQL,
  REFERENCES.MONGO_DB,
  REFERENCES.REDIS,
  REFERENCES.RABBIT_MQ,

  REFERENCES.GIT,
  REFERENCES.GITLAB,
  REFERENCES.GITHUB,
  REFERENCES.BITBUCKET,

  REFERENCES.DOCKER,
  REFERENCES.KUBERNETES,
  REFERENCES.NGINX,
  REFERENCES.NPM,
  REFERENCES.MAVEN,

  REFERENCES.LINUX,
  REFERENCES.ANDROID,

  REFERENCES.GCP,
  REFERENCES.AZURE,
  REFERENCES.AWS,

  // REFERENCES.SPIGOT_MC,
  // REFERENCES.BUNGEE_CORD,
  // REFERENCES.BUKKIT,

  // REFERENCES.FLATPAK,
  // REFERENCES.OBS,
  // REFERENCES.CLOUDFLARE,

  // REFERENCES.INTELLI_J,
  // REFERENCES.VS_CODE,
  // REFERENCES.ECLIPSE,
];

export const fadi_shawki = <TProfile>{
  first_name: 'Fadi',
  last_name: 'Shawki',
  name: 'Fadi Shawki',
  profile: 'fadi-shawki',
  formal_citation_name: 'Shawki, Fadi',

  picture: 'https://orbitmines.com/profiles/fadi-shawki/profile-picture.png',

  date: '2026-01-01',

  email: 'fadi.shawki@orbitmines.com',

  title: "2026. Fadi Shawki",
  subtitle: "A self-profile by some 25-solar-orbiting explorer.",

  reference: {
    // title: renderable<string>("2023. Fadi Shawki"),
    // subtitle: renderable<string>("A self-profile by some 25-solar-orbiting explorer."),
  },

  content: {
    history: [
      REFERENCES.EXPLORER_ORBITMINES_RESEARCH,
      REFERENCES.SOFTWARE_DEVELOPER_AT_BREACHLOCK_INC,
      REFERENCES.CONTRACTOR_AT_MARTI_ORBAK_SOFTWARE,
      REFERENCES.BACKEND_DEVELOPER_AT_MOBIEL_NL,
      REFERENCES.FOUNDER_AT_ORBITMINES_MINECRAFT,
    ],
    formal_education: [
      REFERENCES.LEIDEN_UNIVERSITY,
      REFERENCES.VWO,
    ],
    attended_events: [
      REFERENCES.URSPRUNG_IV,
      REFERENCES.SEMF_2025,
      REFERENCES.INTO_THE_INFORMATION_CONTINUUM_2024_05_04,
      REFERENCES.SYCO_12,
      REFERENCES.INTO_THE_INFORMATION_CONTINUUM_2024_03_09,
      REFERENCES.NGI_FORUM_2023,
      REFERENCES.SEMF_2023,
    ],
  },

  orcid: '0009-0009-9288-992X',

  external: <ExternalProfile[]>[
    {organization: ORGANIZATIONS.discord, display: 'fadishawki', link: 'https://discord.orbitmines.com'},
    {organization: ORGANIZATIONS.github, display: 'FadiShawki', link: 'https://github.com/FadiShawki'},
    {organization: ORGANIZATIONS.twitter, display: '@_FadiShawki', link: 'https://twitter.com/_FadiShawki'},
    {organization: ORGANIZATIONS.gitlab, display: '@FadiShawki', link: 'https://gitlab.com/FadiShawki'},
    {organization: ORGANIZATIONS.instagram, display: '@f._shawki', link: 'https://www.instagram.com/f._shawki/'},
    {organization: ORGANIZATIONS.youtube, display: '@FadiShawki', link: 'https://www.youtube.com/@FadiShawki'},
    {organization: ORGANIZATIONS.twitch, display: '@fadishawki', link: 'https://www.twitch.tv/fadishawki'},
    {organization: ORGANIZATIONS.linkedin, display: 'fadishawki', link: 'https://www.linkedin.com/in/fadishawki/'},
    {
      organization: ORGANIZATIONS.mastodon,
      display: '@fadishawki',
      link: 'https://mastodon.orbitmines.com/@fadishawki'
    },
    {
      organization: ORGANIZATIONS.facebook,
      display: 'Fadi Shawki',
      link: 'https://www.facebook.com/profile.php?id=100094496444130'
    },
    {
      organization: ORGANIZATIONS.orcid,
      display: '0009-0009-9288-992X',
      link: 'https://orcid.org/0009-0009-9288-992X'
    },

    // {organization: ORGANIZATIONS.ipfs, link: 'https://discuss.ipfs.tech/u/fadishawki'},
    // {organization: ORGANIZATIONS.nixos, link: 'https://discourse.nixos.org/u/fadishawki'},
    // {organization: ORGANIZATIONS.fission, link: 'https://talk.fission.codes/u/fadishawki/'},
  ]
}
