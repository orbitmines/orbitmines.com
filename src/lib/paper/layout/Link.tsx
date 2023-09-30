import React, {ReactNode} from "react";
import {Intent, Tag} from "@blueprintjs/core";
import CustomIcon from "../../layout/icons/CustomIcon";
import {Row} from "../../layout/flexbox";

// #fbb360 ; #c87619 ; #935610
// discord?/purple ; #5865F2 ; #1B2DFA ~ ; rgba(#1B2DFA, 0.1);;
const Link = ({name, link, icon, intent, ...props }: { name?: ReactNode, link: string, icon: string, intent?: Intent } & any) => {
  return (<a href={link} target="_blank">
    <Tag
      icon={<CustomIcon intent={intent} icon={icon} size={20}/>}
      intent={intent}
      minimal
      interactive
    >
      <Row middle="xs" className="px-5" {...props} style={{fontSize: '1.1rem'}}>
        <span {...props}>{name ? name : link.replaceAll('https://', '')}</span>
      </Row>
    </Tag>
  </a>);
}

export default Link;