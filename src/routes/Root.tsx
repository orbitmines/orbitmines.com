import React from 'react';
import {Layer, pageStyles} from "../profiles/FadiShawki/FadiShawki";
import {Col, Row} from "../lib/layout/flexbox";
import logo from "../lib/images/orbitmines/logo/orbitmines.logo.3000x1000.png";
import {Author} from "../lib/pdf/paper/Paper";
import fadishawki, {Socials} from "../lib/profiles/fadishawki";
import {Button, Divider, H3, Icon, Tag} from "@blueprintjs/core";
import {useNavigate} from "react-router-dom";
import CustomIcon from "../lib/icons/CustomIcon";
import brands from "../lib/external/brands";
import _ from "lodash";

const Root = () => {
    const navigate = useNavigate();

    const socials: Socials = _.pickBy(fadishawki, (value, key) => [
        brands.github.key,
        brands.twitter.key,
        brands.discord.key,
    ].includes(key));

    return <div style={{
        ...pageStyles
    }}>
        <Layer zIndex="0">
            <Row center="xs">
                <Col xs={12}><Row center="xs"><img src={logo} alt="logo" style={{maxWidth: '400px', width: '90%'}}/></Row></Col>
                <Col xs={12}> <Row center="xs" className="child-px-2">
                    <a href="https://discord.orbitmines.com" target="_blank">
                        <Tag
                            icon={<CustomIcon icon={brands.discord.key} size={20}/>}
                            minimal
                            interactive
                        >
                            <Row middle="xs" className="px-5" style={{fontSize: '1.1rem'}}>
                                discord.orbitmines.com
                            </Row>
                        </Tag>
                    </a>
                    <a href="https://github.com/orbitmines" target="_blank">
                        <Tag
                            icon={<CustomIcon icon={brands.github.key} size={20}/>}
                            minimal
                            interactive
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
                <a onClick={() => navigate("/papers/on-intelligibility")}>
                    <Icon icon="link" /> 2022. On the Intelligibility of (dynamic) Systems and Conceptual Uncertainty
                </a>
            </Row>

            <Row center="xs">
                <Divider style={{width: '80%'}}/>
            </Row>

            <Author
                title={<a onClick={() => navigate("/profiles/fadi-shawki")}>Fadi Shawki</a>}
                subtitle={<a href="mailto:fadi.shawki@orbitmines.com" target="_blank">fadi.shawki@orbitmines.com</a>}
                socials={socials}
            />
        </Layer>
    </div>
};

export default Root;