import React from 'react';
import {useParams} from "react-router-dom";
import Error from "./Error";
import _2024_02_NGI_GrantProposal from "./archive/2024.02.NGI.GrantProposal";
import _2025_09_NGI_GrantProposal from "./archive/2025.09.NGI.GrantProposal3";
import _2024_02_OrbitMines_as_a_Game_Project from "./archive/2024.02.OrbitMines_as_a_Game_Project";

const ITEMS: { [key: string]: any } = {
    '2025-09-ngi-grant-proposal': _2025_09_NGI_GrantProposal,
    '2024-02-ngi-grant-proposal': _2024_02_NGI_GrantProposal,
    '2024-02-orbitmines-as-a-game-project': _2024_02_OrbitMines_as_a_Game_Project
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