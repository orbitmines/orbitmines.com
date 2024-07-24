import React from 'react';
import {ARTICLES_2021, ARTICLES_2022, ARTICLES_2023, ARTICLES_2024, FAMILIAR_TOOLS} from "./fadi_shawki";
import ORGANIZATIONS, {Viewed} from "../../../lib/organizations/ORGANIZATIONS";
import {PROFILES} from "../profiles";
import {ON_INTELLIGIBILITY} from "../../papers/2022.OnIntelligibility";
import {CanvasContainer, ON_ORBITS} from "../../papers/2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../../archive/2024.02.OrbitMines_as_a_Game_Project";
import {Arc, Section, Reference, Category, Profile, Author} from "../../../lib/paper/Paper";

const FadiShawkiCV = () => {
    const profile = PROFILES.fadi_shawki;

    return <Profile profile={profile} head={<></>}>
        <Author {...profile} />

        <Section head="Projects / Projecten">
            <Category content={profile.content!.history}/>
            <Category content={profile.content!.formal_education}/>
        </Section>
        <Arc head="Technology Exposure">
            <Category content={FAMILIAR_TOOLS} inline simple />
        </Arc>
    </Profile>;
}

export default FadiShawkiCV;