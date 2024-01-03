import React from "react";
import {Col, Row} from "../../layout/flexbox";
import {H3, H4, Tag} from "@blueprintjs/core";
import CustomIcon from "../../layout/icons/CustomIcon";
import {ExternalProfile, TProfile} from "../../organizations/ORGANIZATIONS";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Predicate, Rendered} from "../../typescript/React";


const Author = (props: TProfile & { filter?: Predicate<ExternalProfile>}) => {
  let generate;
  try {
    const [params] = useSearchParams();

    generate = params.get('generate');
  } catch (e) {
    generate = 'pdf';
  }

  const { reference, name, email, profile, external, filter } = props;

  const { title, subtitle } = reference || {};

  return <Col>
    <Row center="xs" middle="xs" className="child-px-2">
      <Col><img src={`/profiles/${props.profile}/profile-picture.jpg`} alt="Profile picture" style={{
        maxWidth: '32px', clipPath: 'circle()'}}
      /></Col>
      <H3 className="m-0">{title ? <Rendered renderable={title} /> : <a href={generate === 'pdf' ? `https://orbitmines.com/profiles/${profile}` : `/profiles/${profile}`}>{name}</a>}</H3>
    </Row>
    <Row center="xs"><H4 className="bp5-text-muted">{subtitle ? <Rendered renderable={subtitle} /> : <a href={`mailto:${email}`} target="_blank">{email}</a>}</H4></Row>
    <Row center="xs" className="child-px-2">
      {(external || []).filter(filter ? filter : () => true).map(profile => <Col>
          <a href={profile.link} target="_blank">
            <Tag
              icon={<CustomIcon icon={profile.organization.key} size={20}/>}
              minimal
              interactive
              multiline
            >
              <Row middle="xs" className="px-2" style={{fontSize: '0.8rem'}}>
                {profile.display}
              </Row>
            </Tag>
          </a>
        </Col>)}
    </Row>
  </Col>
}

export default Author;