import _ from "lodash";

import brands, {Brand} from "../external/brands";

export type ISocialProfile = {
    brand: Brand;
    display?: string;
    link: string;
}

export type Socials = { [key: string]: ISocialProfile };

/**
 *
 * https://www.npmjs.com/~fadishawki
 */

const fadishawki: Socials = _.fromPairs([
    { brand: brands.github, display: 'FadiShawki', link: 'https://github.com/FadiShawki' },
    { brand: brands.gitlab, link: 'https://gitlab.com/FadiShawki' },
    { brand: brands.twitter, display: '@_FadiShawki', link: 'https://twitter.com/_FadiShawki' },
    { brand: brands.linkedin, link: 'https://www.linkedin.com/in/fadishawki/' },
    { brand: brands.instagram, link: 'https://www.instagram.com/f._shawki/' },
    { brand: brands.ipfs, link: 'https://discuss.ipfs.tech/u/fadishawki' },
    { brand: brands.nixos, link: 'https://discourse.nixos.org/u/fadishawki' },
    { brand: brands.fission, link: 'https://talk.fission.codes/u/fadishawki/' },
    { brand: brands.mastodon, link: 'https://sigmoid.social/@FadiShawki' },
    { brand: brands.discord, display: 'Fadi#2854', link: 'https://discord.orbitmines.com' }, // TODO: Behind proxy?
].map(profile => [profile.brand.key, profile]));

export default fadishawki;