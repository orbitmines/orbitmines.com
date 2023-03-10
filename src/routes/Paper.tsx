import React from 'react';
import OnIntelligibility from "./papers/2022.OnIntelligibility";
import {useParams} from "react-router-dom";
import Error from "./Error";

const PAPERS: { [key: string]: Function } = {
    'on-intelligibility': OnIntelligibility
}

const Paper = () => {
    const params = useParams();
    console.log(params)
    const { paper } = params;

    const Element = paper ? PAPERS[paper] : undefined;

    if (!Element)
        return <Error/>

    return <Element />
};

export default Paper;