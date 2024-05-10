import React from 'react';
import {ARTICLES_2021, ARTICLES_2022, ARTICLES_2023, ARTICLES_2024} from "./fadi_shawki";
import ORGANIZATIONS, {Viewed} from "../../../lib/organizations/ORGANIZATIONS";
import {PROFILES} from "../profiles";
import {ON_INTELLIGIBILITY} from "../../papers/2022.OnIntelligibility";
import {CanvasContainer, ON_ORBITS} from "../../papers/2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../../archive/2024.02.OrbitMines_as_a_Game_Project";
import {Arc, Section, Reference, Category, Profile} from "../../../lib/paper/Paper";

export const ONGOING_PROJECTS = [
    {
        reference: {
            title: "Rays: A Universal Language",
            organizations: [ORGANIZATIONS.github],
            year: "2024",
            link: "https://github.com/orbitmines/ray"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "A Reprogrammable Visual Interface",
            organizations: [ORGANIZATIONS.github],
            year: "2024",
            link: "https://github.com/orbitmines/ray"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Intercommunication between Languages",
            organizations: [ORGANIZATIONS.github],
            year: "2024-2025?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Indexing%20existing%20Abstract%20Models%20(2024-2025%3F).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "(Universal) Version Control",
            organizations: [ORGANIZATIONS.github],
            year: "2024",
            link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20(Hypergraphic)%20Version%20Control%20System%20through%20Rays%20(2024).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "(Universal) Compression Infrastructure",
            organizations: [ORGANIZATIONS.github],
            year: "2025?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20(Hypergraphic)%20Version%20Control%20System%20through%20Rays%20(2024).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "(Universal) Networking Infrastructure",
            organizations: [ORGANIZATIONS.github],
            year: "2024",
            link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Computer%20Networking%2C%20Security%2C%20Encryption%20%20%26%20Communication%20(2025%3F).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Logistics",
            organizations: [ORGANIZATIONS.github],
            year: "Ongoing",
            link: "https://github.com/orbitmines/archive/blob/main/projects/ONGOING%20Project%20Logistics.md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Open Call for Funding",
            organizations: [ORGANIZATIONS.github],
            year: "Ongoing",
            link: "https://github.com/orbitmines/archive/blob/main/projects/ONGOING%20Project%20-%20Funding.md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Archive - \"OrbitMines' Journey\"",
            organizations: [ORGANIZATIONS.github],
            year: "2025-2026?",
            link: "https://github.com/orbitmines/archive/tree/main/projects"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Research towards Designs",
            organizations: [ORGANIZATIONS.github],
            year: "2027+?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Research%20towards%20Designs%20(2024).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Education",
            organizations: [ORGANIZATIONS.github],
            year: "2027+?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/INDEFINITE%20Project%20-%20Education%20(2027%2B%3F).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Physics (& Hardware)",
            organizations: [ORGANIZATIONS.github],
            year: "2027+?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/PENDING%20(2027%3F%2B)%20%3B%20Physics%20(%26%20Hardware).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Operating System",
            organizations: [ORGANIZATIONS.github],
            year: "2027+?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/PENDING%20(2027%3F%2B)%20%3B%20Operating%20System.md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    }
]

const FadiShawki = () => {
    const profile = PROFILES.fadi_shawki;

    return <Profile profile={profile}>
        <Arc head={<span>
      TGBG but the solution to TGBG is TGBG.🤔
    </span>} buffer={false}>
            {/*<Section head="Looking for a (Compiler, Chip, Language, ...)-(Research, Design)-related position">*/}
            {/*  Feel free to contact me on the socials specified above.*/}
            {/*</Section>*/}
            <Section head="Looking for funding, collaboration or anyone curious to learn more">
                Feel free to contact me on the socials specified above.
            </Section>

            <CanvasContainer style={{height: '110px'}}>
                <canvas
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/branch.png')`,
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            </CanvasContainer>

            <Section head="Ongoing Projects">
                <Category content={[
                    _2024_02_ORBITMINES_AS_A_GAME_PROJECT,
                    ...ONGOING_PROJECTS
                ]}/>
            </Section>

            <CanvasContainer style={{height: '140px'}}>
                <canvas
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/header.png')`,
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            </CanvasContainer>

            {/*<Section head="Modelling WebAssembly">*/}
            {/*  <Link link="https://github.com/orbitmines/wasm" icon={ORGANIZATIONS.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />*/}

            {/*</Section>*/}
            {/*<Section head="Trying to compress enwik9 (Hutter Prize)">*/}
            {/*  <Link link="https://github.com/orbitmines/enwik9" icon={ORGANIZATIONS.github.key} intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />*/}

            {/*</Section>*/}
            {/*<Section head="Writing a paper on most of the above">*/}
            {/*  <Link link="https://orbitmines.com/papers/on-orbits-equivalence-and-inconsistencies" intent={Intent.DANGER} style={{textDecoration: 'line-through'}} />*/}
            {/*</Section>*/}
        </Arc>


        <Arc head="Writings" buffer={false}>
            <Section head="Theoretics">
                {[_2024_02_ORBITMINES_AS_A_GAME_PROJECT, ON_ORBITS, ON_INTELLIGIBILITY].map((paper, i) => (
                    <Reference index={i} reference={{...paper.reference}} start="xs" style={{fontSize: '0.8rem'}}/>
                ))}
            </Section>
        </Arc>

        <CanvasContainer style={{height: '110px'}}>
            <canvas
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/2_edge_3_fractal.png')`,
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
        </CanvasContainer>

        <Arc head="Formal History" buffer={false}>
            <Section head="Projects">
                <Category content={profile.content!.history}/>
            </Section>

            <Section head="Attended Events">
                <Category content={profile.content!.attended_events}/>
            </Section>

            <Section head="Formal Education">
                <Category content={profile.content!.formal_education}/>
            </Section>
        </Arc>

        <CanvasContainer style={{height: '150px'}}>
            <canvas
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/2_edge_3_fractal_with_equivs.png')`,
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
        </CanvasContainer>

        {/* Include things like wikipedia exposure/other things like github ? */}
        <Arc head="Literary Exposure">
            <Section head="2024">
                <Category content={ARTICLES_2024}/>
            </Section>
            <Section head="2023">
                <Category content={ARTICLES_2023}/>
            </Section>
            <Section head="2022">
                <Category content={ARTICLES_2022}/>
            </Section>
            <Section head="2021">
                <Category content={ARTICLES_2021}/>
            </Section>
        </Arc>
    </Profile>;
}

export default FadiShawki;