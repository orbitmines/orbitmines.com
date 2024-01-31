import React from 'react';
import {useParams} from "react-router-dom";
import Error from "./Error";
import _2024_02_NGI_GrantProposal from "./archive/2024.02.NGI.GrantProposal";

const ITEMS: { [key: string]: any } = {
    '2024-02-ngi-grant-proposal': _2024_02_NGI_GrantProposal,
}

const Archive = () => {
    const params = useParams();
    const { item } = params;

    const Element = item ? ITEMS[item] : undefined;

    if (!Element)
        return <Error/>

    return <Element />
};

export default Archive;