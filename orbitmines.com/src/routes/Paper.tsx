import React from 'react';
import OnIntelligibility from "./papers/2022.OnIntelligibility";
import {useParams} from "react-router-dom";
import Error from "./Error";
import OnOrbits from "./papers/2023.OnOrbits";
import RewritingRays from "./papers/2024.RewritingRays";

const PAPERS: { [key: string]: any } = {
    'on-intelligibility': OnIntelligibility,
    'on-orbits-equivalence-and-inconsistencies': OnOrbits,
    'traversing-and-rewriting-of-arbitrary-rays': RewritingRays,
}

const Paper = () => {
    const params = useParams();
    const { paper } = params;

    const Element = paper ? PAPERS[paper] : undefined;

    if (!Element)
        return <Error/>

    return <Element />
};

export default Paper;