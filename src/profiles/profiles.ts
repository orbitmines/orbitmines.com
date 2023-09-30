import ORGANIZATIONS, {ExternalProfile, TProfile} from "../lib/organizations/ORGANIZATIONS";
import {renderable} from "../lib/typescript/React";
import {ATTENDED_EVENTS, FORMAL_EDUCATION, HISTORY} from "./FadiShawki/FadiShawki";


export const PROFILES = {
  fadi_shawki: <TProfile>{
    first_name: 'Fadi',
    last_name: 'Shawki',
    name: 'Fadi Shawki',
    profile: 'fadi-shawki',
    formal_citation_name: 'Shawki, Fadi',

    picture: 'https://orbitmines.com/profiles/fadi-shawki/profile-picture.jpg',

    date: '2023-10-01',

    email: 'fadi.shawki@orbitmines.com',

    title: renderable<string>("2023. Fadi Shawki"),
    subtitle: renderable<string>("A self-profile by some 23-solar-orbiting explorer."),

    reference: {
      // title: renderable<string>("2023. Fadi Shawki"),
      // subtitle: renderable<string>("A self-profile by some 23-solar-orbiting explorer."),
    },

    content: {
      history: HISTORY,
      formal_education: FORMAL_EDUCATION,
      attended_events: ATTENDED_EVENTS,
    },

    orcid: '0009-0009-9288-992X',

    external: <ExternalProfile[]>[
      { organization: ORGANIZATIONS.github, display: 'FadiShawki', link: 'https://github.com/FadiShawki' },
      { organization: ORGANIZATIONS.twitter, display: '@_FadiShawki', link: 'https://twitter.com/_FadiShawki' },
      { organization: ORGANIZATIONS.linkedin, display: 'fadishawki', link: 'https://www.linkedin.com/in/fadishawki/' },
      { organization: ORGANIZATIONS.discord, display: 'fadishawki', link: 'https://discord.orbitmines.com' },
      { organization: ORGANIZATIONS.gitlab, display: '@FadiShawki', link: 'https://gitlab.com/FadiShawki' },
      { organization: ORGANIZATIONS.instagram, display: '@f._shawki', link: 'https://www.instagram.com/f._shawki/' },
      { organization: ORGANIZATIONS.youtube, display: '@FadiShawki', link: 'https://www.youtube.com/@FadiShawki' },
      { organization: ORGANIZATIONS.twitch, display: '@fadishawki', link: 'https://www.twitch.tv/fadishawki' },
      { organization: ORGANIZATIONS.orcid, display: '0009-0009-9288-992X', link: 'https://orcid.org/0009-0009-9288-992X' },


      { organization: ORGANIZATIONS.ipfs, link: 'https://discuss.ipfs.tech/u/fadishawki' },
      { organization: ORGANIZATIONS.nixos, link: 'https://discourse.nixos.org/u/fadishawki' },
      { organization: ORGANIZATIONS.fission, link: 'https://talk.fission.codes/u/fadishawki/' },
      { organization: ORGANIZATIONS.mastodon, link: 'https://sigmoid.social/@FadiShawki' },
    ]
  }
}

