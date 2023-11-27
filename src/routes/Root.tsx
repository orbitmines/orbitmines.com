import React from 'react';
import {Layer, pageStyles} from "../profiles/FadiShawki/FadiShawki";
import {Col, Row} from "../lib/layout/flexbox";
import logo from "../lib/organizations/orbitmines/logo/orbitmines.logo.3000x1000.png";
import {Divider, H3, Icon, Tag} from "@blueprintjs/core";
import {useNavigate} from "react-router-dom";
import CustomIcon from "../lib/layout/icons/CustomIcon";
import ORGANIZATIONS from "../lib/organizations/ORGANIZATIONS";
import Author from "../lib/paper/layout/Author";
import {PROFILES} from "../profiles/profiles";
import {Helmet} from "react-helmet";

const Root = () => {
    return <div style={{
        ...pageStyles
    }}>
        <Helmet>
            <title lang="en">OrbitMines Research</title>
            <meta property="og:type" content="website" />
            <meta name="description" content="Once a Minecraft server, now a research project dedicated to understanding arbitrarily unknown dynamical systems." />
            <meta property="og:image" content="https://orbitmines.com/logo.png" />
            <meta property="og:image:type" content="image/jpeg" />

        </Helmet>

        <Layer zIndex="0">
            <Row center="xs">
                <Col xs={12}><Row center="xs"><img src={logo} alt="logo" style={{maxWidth: '400px', width: '90%'}}/></Row></Col>
                <Col xs={12}> <Row center="xs" className="child-px-2">
                    <a href="https://discord.orbitmines.com" target="_blank">
                        <Tag
                            icon={<CustomIcon icon={ORGANIZATIONS.discord.key} size={20}/>}
                            minimal
                            interactive
                            multiline
                        >
                            <Row middle="xs" className="px-5" style={{fontSize: '1.1rem'}}>
                                discord.orbitmines.com
                            </Row>
                        </Tag>
                    </a>
                    <a href="https://github.com/orbitmines" target="_blank">
                        <Tag
                            icon={<CustomIcon icon={ORGANIZATIONS.github.key} size={20}/>}
                            minimal
                            interactive
                            multiline
                        >
                            <Row middle="xs" className="px-5" style={{fontSize: '1.1rem'}}>
                                github.com/orbitmines
                            </Row>
                        </Tag>
                    </a>
                </Row></Col>
            </Row>

            <Row center="xs">
                <H3 className="m-0">Papers</H3>
            </Row>

            <Row center="xs">
                <a href="/papers/on-intelligibility">
                    <Icon icon="link" /> 2022. On the Intelligibility of (dynamic) Systems and Conceptual Uncertainty
                </a>
            </Row>

            <Row center="xs">
                <Divider style={{width: '80%'}}/>
            </Row>

            <Author {...PROFILES.fadi_shawki} filter={(profile) => [
                ORGANIZATIONS.github.key,
                ORGANIZATIONS.twitter.key,
                ORGANIZATIONS.discord.key,
            ].includes(profile.organization.key)}/>
        </Layer>
    </div>
};

export default Root;