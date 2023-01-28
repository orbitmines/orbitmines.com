import React from 'react';
import {Layer, pageStyles} from "../profiles/FadiShawki/FadiShawki";
import {Row} from "../lib/layout/flexbox";
import logo from "../lib/images/orbitmines/logo/orbitmines.logo.3000x1000.png";
import {Author} from "../lib/pdf/paper/Paper";
import fadishawki from "../lib/profiles/fadishawki";
import {Button, Divider, H3, Icon} from "@blueprintjs/core";
import {useNavigate} from "react-router-dom";

const Root = () => {
    const navigate = useNavigate();

    return <div style={{
        ...pageStyles
    }}>
        <Layer zIndex="0">
            <Row center="xs">
                <img src={logo} alt="logo" style={{maxWidth: '400px', width: '90%'}}/>
            </Row>

            <H3 className="m-0">Papers</H3>

            <Row center="xs">
                <a onClick={() => navigate("/papers/on-intelligibility")}>
                    <Icon icon="link" /> 2022. On the Intelligibility of (dynamic) Systems and Conceptual Uncertainty
                </a>
            </Row>

            <Row center="xs">
                <Divider style={{width: '80%'}}/>
            </Row>

            <Author
                title="Fadi Shawki"
                subtitle={<a href="mailto:shawkifadi@gmail.com" target="_blank">shawkifadi@gmail.com</a>}
                socials={fadishawki}
            />
        </Layer>
    </div>
};

export default Root;