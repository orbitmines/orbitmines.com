import React from 'react';
import {useParams} from "react-router-dom";
import Error from "../Error";
import FadiShawki from "./fadi-shawki/FadiShawki";
import FadiShawkiCV from "./fadi-shawki/FadiShawkiCV";

const PROFILES: { [key: string]: any } = {
    'fadi-shawki': FadiShawki,
    'fadi-shawki-cv': FadiShawkiCV,
}

const Profile = () => {
    const params = useParams();
    const { profile } = params;

    const Element = profile ? PROFILES[profile] : undefined;

    if (!Element)
        return <Error/>

    return <Element />
};

export default Profile;