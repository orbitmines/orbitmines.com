import React from 'react';
import logo from "../lib/organizations/orbitmines/logo/orbitmines.logo.3000x1000.png";
import ORGANIZATIONS, {PLATFORMS} from "../lib/organizations/ORGANIZATIONS";
import {Helmet} from "react-helmet";
import {ON_INTELLIGIBILITY} from "./archive/2022.OnIntelligibility";
import {CanvasContainer, ON_ORBITS} from "./archive/2023.OnOrbits";
import {Author, Col, CustomIcon, Layer, pageStyles, Reference, Row} from "../lib/post/Post";
import {PROFILES} from "./profiles/profiles";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "./archive/2024.02.OrbitMines_as_a_Game_Project";
import {TOWARDS_A_UNIVERSAL_LANGUAGE} from "./archive/2025.TowardsAUniversalLanguage";
import {ETHERS_ALMANAC} from "./Almanac";
import {Button} from "@blueprintjs/core";
import {download, DownloadButton, LoginButton, os} from "../@orbitmines/ether/Ether";


const Minimap = () => {
  const papers = [TOWARDS_A_UNIVERSAL_LANGUAGE, _2024_02_ORBITMINES_AS_A_GAME_PROJECT, ON_ORBITS, ON_INTELLIGIBILITY];

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

    <Layer zIndex="0" className="">
      <div style={{height: '100%'}}>
        <Row style={{height: '100%', minHeight: '100vh'}} center="xs" middle="xs" between="xs">
          <Col xs={12}>
            <Col xs={12}>
              <Row center="xs">
                <Col xs={12} style={{maxWidth: '1240px'}}><Row end="xs" middle="xs" className="child-px-5">
                  <Col><DownloadButton/></Col>
                  <Col><LoginButton/></Col>
                </Row></Col>
              </Row>
            </Col>
            <Col xs={12}><Row center="xs">
              <Col><img src={logo} alt="logo" style={{maxWidth: '400px', width: '90%'}}/></Col>
            </Row></Col>
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
                  <Row center="xs" className="child-pt-5 child-px-2">
                    {(profile?.external || []).filter(profile => PLATFORMS.includes(profile.organization.key)).map(profile =>
                      <Col>
                        <a href={profile.link} target="_blank">
                          <CustomIcon icon={profile.organization.key} size={20}/>
                        </a>
                      </Col>)}
                  </Row>
                </Col>
              </Row>
            </Col>

            <CanvasContainer style={{height: '120px'}}>
              <canvas
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/header.png')`,
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </CanvasContainer>

            <Col xs={12}>
              <Row middle="xs" center="xs">
                <Col style={{maxWidth: '500px'}}>
                  <Row style={{alignItems: 'center'}}>
                    <Col xs={2}>
                      <img src="/E.svg" alt="E" style={{width: '100%', maxHeight: '100px'}} />
                    </Col>
                    <Col xs={10}>
                      <Reference
                        index={0}
                        reference={ETHERS_ALMANAC.reference}
                        start="xs"
                        style={{fontSize: '0.8rem'}} target="_self"
                      />
                    </Col>
                  </Row>
                  <CanvasContainer style={{height: '140px'}} className="hidden-xs">
                    <canvas
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url('/archive/towards-a-universal-language/images/empty_vertex_with_hyperedge_2.png')`,
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  </CanvasContainer>
                  <Reference
                    index={0}
                    reference={{
                      title: "github.com/orbitmines",
                      organizations: [ORGANIZATIONS.github],
                      link: "https://github.com/orbitmines"
                    }}
                    start="xs"
                    style={{fontSize: '0.8rem'}} className="bp5-text-muted" target="_blank"
                  />
                  <div className="pl-9">
                    <Reference
                      index={0}
                      reference={{
                        title: <span>/ray <span className="bp5-text-muted">The Ray Programming Language & The Ether</span></span>,
                        organizations: [ORGANIZATIONS.github],
                        link: "https://github.com/orbitmines/ray"
                      }}
                      start="xs"
                      style={{fontSize: '0.8rem'}} target="_blank"
                    />
                    <Reference
                      index={0}
                      reference={{
                        title: <span>/archive <span className="bp5-text-muted">Public research archive</span></span>,
                        organizations: [ORGANIZATIONS.github],
                        link: "https://github.com/orbitmines/archive"
                      }}
                      start="xs"
                      style={{fontSize: '0.8rem'}} target="_blank"
                    />
                    <Reference
                      index={0}
                      reference={{
                        title: <span>/orbitmines.com <span className="bp5-text-muted">Website to the internet</span></span>,
                        organizations: [ORGANIZATIONS.github],
                        link: "https://github.com/orbitmines/orbitmines.com"
                      }}
                      start="xs"
                      style={{fontSize: '0.8rem'}} target="_blank"
                    />
                  </div>
                </Col>
                <Col style={{maxWidth: '500px'}}>
                  {/*<Row start="xs">*/}
                  <Reference
                    index={0}
                    reference={{
                      title: "/updates",
                      organizations: [ORGANIZATIONS.orbitmines_research]
                    }}
                    start="xs"
                    style={{fontSize: '0.8rem'}} className="bp5-text-muted" target="_blank"
                  />
                  {/*</Row>*/}

                  <div className="pl-9">
                    {papers.map(paper => (
                      <Reference index={0}
                                 reference={{...paper.reference, subtitle: undefined, notes: undefined}}
                                 start="xs"
                                 style={{fontSize: '0.8rem'}} target="_self"/>
                    ))}
                  </div>

                  <CanvasContainer style={{height: '150px'}} className="hidden-xs">
                    <canvas
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/2_double_expanded_continuation.png')`,
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  </CanvasContainer>
                </Col>
              </Row>
            </Col>

            <Col xs={12} style={{marginTop: '5%', marginBlock: '5%'}}>
              <Author {...PROFILES.fadi_shawki}
                      filter={(profile) => PLATFORMS.includes(profile.organization.key)}/>
            </Col>
          </Col>
        </Row>

      </div>
    </Layer>
    {/*<Layer zIndex="0">*/}
    {/*    <Row center="xs" className="">*/}
    {/*        <Col xs={12}><Row center="xs"><img src={logo} alt="logo"*/}
    {/*                                           style={{maxWidth: '400px', width: '90%'}}/></Row></Col>*/}
    {/*        <Col xl={4} lg={6} md={8} sm={10} xs={12}><Row center="xs">*/}
    {/*            <span style={{fontStyle: 'italic'}}>*/}
    {/*                Once a Minecraft server, now the building of a world where engineering, science, education are all an exploratory videogame.*/}
    {/*            </span>*/}
    {/*        </Row></Col>*/}

    {/*        <Col xs={12}> <Row center="xs" className="child-py-2 child-px-2">*/}
    {/*            <Col xs={12}>*/}
    {/*                <Row center="xs" className="child-px-1">*/}
    {/*                    {(profile?.external || []).filter(profile => PLATFORMS.includes(profile.organization.key)).map(profile =>*/}
    {/*                        <Col>*/}
    {/*                            <a href={profile.link} target="_blank">*/}
    {/*                                <CustomIcon icon={profile.organization.key} size={20}/>*/}
    {/*                            </a>*/}
    {/*                        </Col>)}*/}
    {/*                </Row>*/}
    {/*            </Col>*/}
    {/*        </Row></Col>*/}
    {/*    </Row>*/}


    {/*    <Row center="xs">*/}

    {/*    </Row>*/}


    {/*    <Author {...PROFILES.fadi_shawki} filter={(profile) => PLATFORMS.includes(profile.organization.key)}/>*/}
    {/*</Layer>*/}
  </div>
};
// This is definitely not a minimap of how the metaverse is actually going to happen. And accidentally change a letter and rename something else to the fadiverse along the way.

export default Minimap;