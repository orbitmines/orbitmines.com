import React from 'react';
import {Layer, pageStyles} from "../profiles/FadiShawki/FadiShawki2";
import {Col, Row} from "../lib/layout/flexbox";
import logo from "../lib/organizations/orbitmines/logo/orbitmines.logo.3000x1000.png";
import {H3, Tag} from "@blueprintjs/core";
import CustomIcon from "../lib/layout/icons/CustomIcon";
import ORGANIZATIONS from "../lib/organizations/ORGANIZATIONS";
import Author from "../lib/paper/layout/Author";
import {PROFILES} from "../profiles/profiles";
import {Helmet} from "react-helmet";
import {ON_INTELLIGIBILITY} from "./papers/2022.OnIntelligibility";
import {ON_ORBITS} from "./papers/2023.OnOrbits";
import Reference from "../lib/paper/layout/Reference";
import {CanvasContainer} from "../@orbitmines/Visualization";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "./archive/2024.02.OrbitMines_as_a_Game_Project";
import {A_UNIVERSAL_LANGUAGE} from "./papers/2024.AUniversalLanguage";

const Root = () => {
  const papers = [A_UNIVERSAL_LANGUAGE, _2024_02_ORBITMINES_AS_A_GAME_PROJECT, ON_ORBITS, ON_INTELLIGIBILITY];

  const profile = ORGANIZATIONS.orbitmines_research.profile;

  return <div style={{
    ...pageStyles
  }}>
    <Helmet>
      <title lang="en">OrbitMines Research</title>
      <meta property="og:type" content="website"/>
      <meta name="description"
            content="Once a Minecraft server, now a research project dedicated to understanding arbitrarily unknown dynamical systems."/>
      <meta property="og:image" content="https://orbitmines.com/logo.png"/>
      <meta property="og:image:type" content="image/jpeg"/>

    </Helmet>

    <Layer zIndex="0">
      <Row center="xs" className="child-py-5">
        <Col xs={12}><Row center="xs"><img src={logo} alt="logo" style={{maxWidth: '400px', width: '90%'}}/></Row></Col>
        <Col md={8} sm={10} xs={12}><Row center="xs">
                    <span style={{fontStyle: 'italic'}}>
                        Once a Minecraft server, now a research project dedicated to understanding arbitrarily unknown dynamical systems.
                    </span>
        </Row></Col>
        <Col xs={12}> <Row center="xs" className="child-py-2 child-px-2">

          <Col xs={12}>
            <Row center="xs" className="child-px-2">
              {(profile?.external || []).filter(profile => [
                ORGANIZATIONS.github.key,
                ORGANIZATIONS.discord.key,
              ].includes(profile.organization.key)).map(profile => <Col>
                <a href={profile.link} target="_blank">
                  <Tag
                    icon={<CustomIcon icon={profile.organization.key} size={20}/>}
                    minimal
                    interactive
                    multiline
                  >
                    <Row middle="xs" className="px-5" style={{fontSize: '1.1rem'}}>
                      {profile.link.replaceAll("https://", "")}
                    </Row>
                  </Tag>
                </a>
              </Col>)}
            </Row>
          </Col>

          <Col xs={12}>
            <Row center="xs" className="child-px-1">
              {(profile?.external || []).filter(profile => [
                ORGANIZATIONS.github.key,
                ORGANIZATIONS.twitter.key,
                ORGANIZATIONS.discord.key,
                ORGANIZATIONS.linkedin.key,
                ORGANIZATIONS.gitlab.key,
                ORGANIZATIONS.instagram.key,
                ORGANIZATIONS.instagram.key,
                ORGANIZATIONS.youtube.key,
                ORGANIZATIONS.twitch.key,
                ORGANIZATIONS.mastodon.key,
                ORGANIZATIONS.facebook.key,
              ].includes(profile.organization.key)).map(profile => <Col>
                <a href={profile.link} target="_blank">
                  <CustomIcon icon={profile.organization.key} size={20}/>
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
        <H3 className="m-0">Paperable Text</H3>
      </Row>

      <div className="child-px-2">
        {papers.map(paper => (<Row center="xs" className="pb-3">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Reference index={0} reference={{...paper.reference, notes: undefined}} center="xs"
                       style={{fontSize: '0.8rem'}} target="_self"/>
            {/*<a href={paper.reference.link?.replace("https://orbitmines.com/papers", "")}>*/}
            {/*    <Icon icon="link" /> {paper.reference.year}. <Rendered renderable={paper.reference.title} />*/}
            {/*</a>*/}
          </Col>
        </Row>))}
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

      <Author {...PROFILES.fadi_shawki} filter={(profile) => [
        ORGANIZATIONS.github.key,
        ORGANIZATIONS.twitter.key,
        ORGANIZATIONS.discord.key,
      ].includes(profile.organization.key)}/>
    </Layer>
  </div>
};

export default Root;