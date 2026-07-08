import React from "react";
import ORGANIZATIONS, {Content, PLATFORMS, Viewed} from "../lib/organizations/ORGANIZATIONS";
import {PROFILES} from "./profiles/profiles";

export const ON_INTELLIGIBILITY: Content = { reference: {
    title: "On the Intelligibility of (dynamic) Systems and Conceptual Uncertainty",
    subtitle:"A collection of my thoughts on intelligibility. An attempt to edge towards a basic theory for understanding dynamic systems by computationally bounded observers. While the aim is to have practical implications for the design of sophisticated observers, these ideas are quite far-reaching and do tend to border on philosophy (an inevitability, perhaps).",
    date: "2022-12-31",
    year: "2022",
    external: {
      discord: {serverId: '1055502602365845534', channelId: '1105246681915732108', link: () => "https://discord.com/channels/1055502602365845534/1105246681915732108/1105246681915732108"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
    published: [ORGANIZATIONS.orbitmines_research],
    link: "https://orbitmines.com/archive/on-intelligibility",
    notes: [{
      date: '2023-11-27',
      render: () => <span>
        I started distilling a years' worth of thoughts/explorations on 2023-12-11. Already - on the first day -, distributing them within the buckets of two titles: "On the intelligibility of (dynamic) systems and associated uncertainty" and "On Functional Equivalence and Compression". Though I initially didn't intend to publish these thoughts quickly, that changed on 2022-12-22. While exploring Melanie Mitchell's Mastodon account, I found her <a href="https://sigmoid.social/@melaniemitchell/109303350293539759" target="_blank">post</a> on the Lab42 essay competition, which prompted me to accelerate my timeline.
      </span>
    }, {
      date: '2023-08-03',
      render: () => <span>
        It's probably worth noting that I currently take issue with a lot of phrasings I use here. I've noticed that many of the ideas I'm thinking about rarely hold the same viewpoint for over a few months. But as an exercise it was quite useful to distill a year of thoughts into a few pages. It has helped quite tremendously in me working through some confusions.
      </span>
    }]
  }, status: Viewed.VIEWED, found_at: "2022", viewed_at: "December, 2022" }

export const ON_ORBITS: Content = {
  reference: {
    /**
     * Orbits: Equivalence at Continuations
     * Equivalence: Variance made Invariant (Ignored Variance)
     * Inconsistencies: Variance
     *
     *
     * Equivalence ; Pattern matching, Assumption, Variance made Invariant (Ignored/Deemed Irrelevant/../Dropping/pruning/deleting Variance), Symmetry, Invariance, Consistency, Equality, Equivalence, Superposition, Well-defined/Ignored Ambiguity, Duplication, Parallel, Persistence, Coherence, Same, Similar, Complete, Memory, Inertia, Intuition, Fidelity, Reproducibility, Stability, Isomorphism, Reversibility, Deterministic (Identifiably mechanistic/Predictable/High-fidelity - Decreasing Perceived Randomness/Arbitrariness - Perhaps eliminating/Reducing superpositions/../ambiguity), Holonomic system, Constant, Fixed Point, Halting, Orbits, Copy, Redundancy, Caching, (Ignored implementation details), Translation, Compiling/Supercompilation/.../Meta-Compilation - differently ignorant on certain scales, Undirected, (multi-/arbitrarily complex structured-/)Computational,Non-distinguishability, Analogy, Distill, Confluence, Termination, Predictability (High fidelity), Lossless, Compression, Attention - Ignorance of something, Ignorance, Survivability, Cast, Interpretability, Fidelity Checking, Dimension, Continuation, Generalize, Universal, Sorting
     *
     * Inconsistency ; Variance, Assumption Violation, Hacking/Vulnerability, Divergence, Anomaly, Separability, Forgetting ((Realized) temporal non-trivial inability to resolve references), Refuting, Deleting, Evolution, Unintended/Accidental/Irrelevant Variance, Non-consistency, Non-modelled effects, Unknowns, Uncertainty, Asymmetry, Inequality, Sequence, Time/Temporary, Incoherence, Difference, Incomplete, Non-deterministic (if assumption violated), Non-holonomic system, Gravity, Curvature [ref; Inability to categorize with some small set of variables - Jonathan Gorard's tweet], Change, Selection, Ill-defined, Ambiguous, Confusion, Undefined, Sparsity?, Transformation, Describing, Separability, Directed, Movement, Propagation, Distinguishability, Inhibition, Pointer, Encapsulation, Transduction, Lacking access, Furthering, Obsoleting, Enhancing, Fallibility, View, Traversal
     *
     * Structure, Configuration, Selection, Symbol, Token, Connection, Communication, Possibilities, Enumeration, Spatially/Space, Time, Arbitrary Naming / Labelling, Functions, Morphisms, Rewrite Rule, Rays, Dynamics, Movement, Processes, Systems, Generative, Generators, Superposition, Encoding, Property, Value, Path, Hierarchy, Tree, Program, History, Causality, Version-Control, Instance, Object, Phrasings, States, Constructions, Worlds, Universe, Background, (Non-/)Context, Frame, Reference, Overlap, Merge, Cardinality, Node, Strategy, Tactic, Sheaf, Foliation, Slice, Type, Static/Dynamic, Knowledge, Squared, Defaults, Extreme, Abstraction, Simulation, Emulation, Projection, Heuristics, Inhibition, Regulation, Conjecture, Redundancy, Density, Property, Relation, What-if, Phase, Definition, Encompass, (Positional) Encodings, "Different levels of description", Levels, Scales, Complexity, Data, Runtime, Vibration, Arbitrary, Random, Limited/Limit/Limitations, Constraints, Resources, Pressure, Priority, Interpreted, Interacted, Observed, Initial, Terminal, Result, Conclusion, Fluidity, Output (Realized change by the system), Layer
     * Distance, Locality, Closeness, Approximation, "Practical Equivalencing/.../Ignoring", (Computational) Effort, Complexity, Relevance, Non-trivival superposition (e.g. any equivalence), Impreciseness, Less Actionability, Trivial/Non-trivial, Conditionally (Circular), Guarded, Partial, Skipping, Teleporting, Encryption, Disambiguation
     *
     * TODO ; Composability is Non-locality?
     * TODO ; Encoding is usually Ignorant of its use
     *
     * ; These are just the same sort of thing from different perspectives, you need additional context for separation of concepts/.../duals - And separation is likely somewhat arbitrary and inconsistent - but that doesn't prevent them from being useful.
     */
    title: "On Orbits, Equivalence and Inconsistencies",
    subtitle: "A preliminary exploration through the world of possible inconsistencies. Originally intended as a more technical continuation of earlier thoughts on intelligibility.",
    draft: false,
    link: 'https://orbitmines.com/archive/on-orbits-equivalence-and-inconsistencies',
    year: "2023",
    date: "2023-12-31",
    external: {
      discord: {serverId: '1055502602365845534', channelId: '1190719376085766195', link: () => "https://discord.com/channels/1055502602365845534/1190719376085766195/1190719376085766195"}
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2023", viewed_at: "December, 2023"
}

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

export const _2024_02_NGI_GRANT_PROPOSAL: Content = {
  reference: {
    title: "NGI Grant Proposal: OrbitMines' (Hypergraphic) Version Control System through Rays",
    subtitle: "",
    draft: false,
    link: 'https://orbitmines.com/archive/2024-02-ngi-grant-proposal',
    year: "2024",
    date: "2024-01-31",
    external: {
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "January, 2024"
}

export const _2025_09_NGI_GRANT_PROPOSAL3: Content = {
  reference: {
    title: "The `.ray.txt` Programming Language",
    subtitle: "",
    draft: false,
    link: 'https://orbitmines.com/archive/2025-09-ngi-grant-proposal',
    year: "2025",
    date: "2025-09-07",
    external: {
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "January, 2024"
}

export const TOWARDS_A_UNIVERSAL_LANGUAGE: Content = {
  reference: {
    title: "2025 Progress Update: Towards A Universal Language",
    subtitle: "An initial look at the text-based Ray programming language and subsequent design notes for its IDE: The Ether.",
    draft: false,
    link: 'https://orbitmines.com/archive/towards-a-universal-language',
    year: "2025",
    date: "2025-12-31",
    external: {
      discord: {
        serverId: '1055502602365845534',
        channelId: '1455223851825762475',
        link: () => "https://discord.com/channels/1055502602365845534/1455223851825762475"
      }
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2025", viewed_at: "December, 2025"
}

export const ORBITMINES_MINECRAFT_ARCHIVE: Content = {
  reference: {
    title: "The OrbitMines Minecraft Server (2013-2019)",
    subtitle: "A trip back into the past, a piece of OrbitMines history when it was a Minecraft server. And a look at the OrbitMines Minecraft Archive which includes a remastered version of the server through its lifetime!",
    draft: false,
    link: 'https://orbitmines.com/archive/the-orbitmines-minecraft-server',
    year: "2026",
    date: "2026-04-04",
    external: {
      discord: {
        serverId: '221293899967102976',
        channelId: '1488917711982694461',
        link: () => "https://discord.com/channels/221293899967102976/1488917711982694461" // TODO
      }
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
  }, status: Viewed.VIEWED, found_at: "2026", viewed_at: "December, 2026"
}

export const ETHERS_ALMANAC: Content & { UPDATES: Content[] } = { reference: {
  title: "Ether's Almanac",
  subtitle: "Your handbook for anything Ether, Ray & OrbitMines.",
  draft: true,
  date: "Last update: 2026-12-31",
  year: "2026",
  external: {
    discord: {serverId: '1055502602365845534', channelId: '1463219913044005018', link: () => "https://discord.com/channels/1055502602365845534/1463219913044005018/1463219913044005018"}
  },
  organizations: [ORGANIZATIONS.orbitmines_research, ORGANIZATIONS.ether],
  authors: [{
    ...PROFILES.fadi_shawki,
    external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
  }],
  published: [ORGANIZATIONS.orbitmines_research],
  link: "https://orbitmines.com/almanac"
}, status: Viewed.VIEWED, found_at: "2026", viewed_at: "December, 2026",

  UPDATES: [
    { reference: {
      title: "2026 Ether's Almanac: The v0 specification runtime for the Ray programming language",
      subtitle: "The first release of the Ether's Almanac, containing instructions on how to get started with the Ray programming language.",
      draft: true,
      date: "2026-12-31",
      year: "2026",
      external: {
        discord: {serverId: '1055502602365845534', channelId: '1463219913044005018', link: () => "https://discord.com/channels/1055502602365845534/1463219913044005018/1463219913044005018"}
      },
      organizations: [ORGANIZATIONS.orbitmines_research, ORGANIZATIONS.ether],
      authors: [{
        ...PROFILES.fadi_shawki,
        external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
      }],
      published: [ORGANIZATIONS.orbitmines_research],
      link: "https://orbitmines.com/almanac"
    }, status: Viewed.VIEWED, found_at: "2026", viewed_at: "December, 2026" }
  ]

}

