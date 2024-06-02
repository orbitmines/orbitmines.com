import React from 'react';
import logo from "../lib/organizations/orbitmines/logo/orbitmines.logo.3000x1000.png";
import {H3, H4} from "@blueprintjs/core";
import ORGANIZATIONS, {PLATFORMS, Viewed} from "../lib/organizations/ORGANIZATIONS";
import {Helmet} from "react-helmet";
import {ON_INTELLIGIBILITY} from "./papers/2022.OnIntelligibility";
import {CanvasContainer, ON_ORBITS} from "./papers/2023.OnOrbits";
import {Author, Category, Col, CustomIcon, Layer, pageStyles, Reference, Row} from "../lib/paper/Paper";
import {PROFILES} from "./profiles/profiles";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "./archive/2024.02.OrbitMines_as_a_Game_Project";
import {A_UNIVERSAL_LANGUAGE} from "./papers/2024.AUniversalLanguage";


const Minimap = () => {
    const papers = [A_UNIVERSAL_LANGUAGE, _2024_02_ORBITMINES_AS_A_GAME_PROJECT, ON_ORBITS, ON_INTELLIGIBILITY];

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

        <Layer zIndex="0">
            <Row center="xs" className="">
                <Col xs={12}><Row center="xs"><img src={logo} alt="logo"
                                                   style={{maxWidth: '400px', width: '90%'}}/></Row></Col>
                <Col xl={4} lg={6} md={8} sm={10} xs={12}><Row center="xs">
                    <span style={{fontStyle: 'italic'}}>
                        Once a Minecraft server, now the building of a world where engineering, science, education are all an exploratory videogame.
                    </span>
                </Row></Col>

                <Col xs={12}> <Row center="xs" className="child-py-2 child-px-2">
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
                </Row></Col>
            </Row>

            <CanvasContainer style={{height: '120px'}}>
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


            <Row center="xs">

            </Row>
            <Row middle="xs" center="xs">
                <Col>
                    <Reference
                        index={0}
                        reference={{
                            title: "Infrastructure for the 21st century",
                            organizations: [ORGANIZATIONS.orbitmines_minecraft_prison]
                        }}
                        start="xs"
                        style={{fontSize: '0.8rem'}} className="bp5-text-muted" target="_blank"
                    />
                    <div className="pl-9">
                        <Reference
                            index={0}
                            reference={{
                                title: "Rays: A Universal Language",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/ray"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                        <Reference
                            index={0}
                            reference={{
                                title: "A Reprogrammable Visual Interface",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/ray"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem', color: 'orange'}} target="_blank"
                        />
                        <Reference
                            index={0}
                            reference={{
                                title: "Intercommunication between Languages",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Indexing%20existing%20Abstract%20Models%20(2024-2025%3F).md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                    </div>
                    <div className="pl-18">

                        <Reference
                            index={0}
                            reference={{
                                title: "(Universal) Version Control",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20(Hypergraphic)%20Version%20Control%20System%20through%20Rays%20(2024).md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />

                        <Reference
                            index={0}
                            reference={{
                                title: "(Universal) Compression Infrastructure",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20(Hypergraphic)%20Version%20Control%20System%20through%20Rays%20(2024).md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />

                        <Reference
                            index={0}
                            reference={{
                                title: "(Universal) Networking Infrastructure",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Computer%20Networking%2C%20Security%2C%20Encryption%20%20%26%20Communication%20(2025%3F).md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                    </div>

                    <Reference
                        index={0}
                        reference={{
                            title: "Ongoing Logistics",
                            organizations: [ORGANIZATIONS.orbitmines_minecraft_creative],
                            link: "https://github.com/orbitmines/archive/blob/main/projects/ONGOING%20Project%20Logistics.md"
                        }}
                        start="xs"
                        style={{fontSize: '0.8rem'}} className="bp5-text-muted"  target="_blank"
                    />
                    <div className="pl-9">
                        <Reference
                            index={0}
                            reference={{
                                title: "Open Call for Funding",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/ONGOING%20Project%20-%20Funding.md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                        <Reference
                            index={0}
                            reference={{
                                title: "Archive",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/tree/main/projects"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                    </div>
                    <Reference
                        index={0}
                        reference={{
                            title: "OrbitMines: A Game Project",
                            organizations: [ORGANIZATIONS.orbitmines_research]
                        }}
                        start="xs"
                        style={{fontSize: '0.8rem'}} className="bp5-text-muted"  target="_blank"
                    />
                    <div className="pl-9">
                        <Reference
                            index={0}
                            reference={{
                                title: "Research towards Designs",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/Project%20-%20Research%20towards%20Designs%20(2024).md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                        <Reference
                            index={0}
                            reference={{
                                title: "Education",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/INDEFINITE%20Project%20-%20Education%20(2027%2B%3F).md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                        <Reference
                            index={0}
                            reference={{
                                title: "Physics (& Hardware)",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/PENDING%20(2027%3F%2B)%20%3B%20Physics%20(%26%20Hardware).md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                        <Reference
                            index={0}
                            reference={{
                                title: "Operating System",
                                organizations: [ORGANIZATIONS.github],
                                link: "https://github.com/orbitmines/archive/blob/main/projects/PENDING%20(2027%3F%2B)%20%3B%20Operating%20System.md"
                            }}
                            start="xs"
                            style={{fontSize: '0.8rem'}} target="_blank"
                        />
                    </div>
                </Col>
                <Col style={{maxWidth: '400px'}}>
                    {/*<Row start="xs">*/}
                    <Reference
                        index={0}
                        reference={{
                            title: "Could be printed on paper",
                            organizations: [ORGANIZATIONS.orbitmines_minecraft_minigames]
                        }}
                        start="xs"
                        style={{fontSize: '0.8rem'}} className="bp5-text-muted" target="_blank"
                    />
                    {/*</Row>*/}

                    <div className="pl-9">
                        {papers.map(((paper, i) => (
                            <Reference index={0}
                                       reference={{...paper.reference, subtitle: i < 2 ? paper.reference.subtitle : undefined, notes: undefined}}
                                       start="xs"
                                       style={{fontSize: '0.8rem'}} target="_self"/>
                        )))}
                    </div>

                    <CanvasContainer style={{height: '150px'}}>
                        <canvas
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url('/papers/on-orbits-equivalence-and-inconsistencies/images/2_double_expanded_continuation.png')`,
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                    </CanvasContainer>
                </Col>
            </Row>

            <Author {...PROFILES.fadi_shawki} filter={(profile) => PLATFORMS.includes(profile.organization.key)}/>
        </Layer>
    </div>
};
// This is definitely not a minimap of how the metaverse is actually going to happen. And accidentally change a letter and rename something else to the fadiverse along the way.

export default Minimap;