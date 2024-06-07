import React from 'react';
import logo from "../lib/organizations/orbitmines/logo/orbitmines.logo.3000x1000.png";
import ORGANIZATIONS, {PLATFORMS} from "../lib/organizations/ORGANIZATIONS";
import {Helmet} from "react-helmet";
import {CanvasContainer} from "./papers/2023.OnOrbits";
import {Author, Col, CustomIcon, Layer, pageStyles, Reference, Row} from "../lib/paper/Paper";
import {PROFILES} from "./profiles/profiles";
import {A_UNIVERSAL_LANGUAGE} from "./papers/2024.AUniversalLanguage";


const Minimap = () => {
    const profile = ORGANIZATIONS.orbitmines_research.profile;

    return <div style={{
        ...pageStyles
    }}>
        <Helmet>
            <title lang="en">OrbitMines Research</title>
            <meta property="og:type" content="website"/>
            <meta name="description"
                  content="Once a Minecraft server, now the building of a world where engineering, science, education are all an exploratory videogame."/>
            <meta property="og:image" content="https://orbitmines.com/logo.png"/>
            <meta property="og:image:type" content="image/jpeg"/>

        </Helmet>

        <Layer zIndex="0" style={{height: '100vh'}} className="">
            <div style={{height: '100%'}}>
                <Row style={{height: '100%'}} center="xs" middle="xs" between="xs">
                    <Col xs={12}>
                        <Col xs={12}><Row center="xs"><img src={logo} alt="logo"
                                                           style={{maxWidth: '400px', width: '90%'}}/></Row></Col>
                        <Col xs={12}>
                            <Row center="xs">
                                <Col xl={4} lg={6} md={8} sm={10} xs={12}>
                                    <Row center="xs">
                                <span style={{fontStyle: 'italic'}}>
                                    Once a Minecraft server, now the building of a world where engineering, science, education are all an exploratory videogame.
                                </span>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={12}>
                            <Row center="xs" className="child-py-2 child-px-2">
                                <Col xs={12}>
                                    <Row center="xs" className="child-px-1">
                                        {(profile?.external || []).filter(profile => PLATFORMS.includes(profile.organization.key)).map(profile =>
                                            <Col>
                                                <a href={profile.link} target="_blank">
                                                    <CustomIcon icon={profile.organization.key} size={16}/>
                                                </a>
                                            </Col>)}
                                    </Row>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={12}>
                        </Col>

                        <Col xs={12} style={{marginTop: '5%'}}>
                            <Author {...PROFILES.fadi_shawki}
                                    filter={(profile) => PLATFORMS.includes(profile.organization.key)}/>
                        </Col>
                    </Col>
                </Row>

            </div>
        </Layer>
    </div>
};
// This is definitely not a minimap of how the metaverse is actually going to happen. And accidentally change a letter and rename something else to the fadiverse along the way.

export default Minimap;