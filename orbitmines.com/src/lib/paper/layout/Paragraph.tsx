import { Children } from "../../typescript/React";
import {Row} from "../../layout/flexbox";
import React from "react";
import _ from "lodash";

const Paragraph = ({ children }: Children & { block?: boolean }): JSX.Element => {
  const blocks: JSX.Element[] = [];
  let currentBlock: JSX.Element[] = [];

  // little nasty regrouping into inline blocks
  const pushCurrentBlock = () => {
    blocks.push(<Row is="block" className="py-2" style={{width: '100%'}}>{currentBlock}</Row>);
    currentBlock = [];
  }

  let block = true;

  React.Children.forEach(children, child => {
    const inline = (_.isString(child)
      || (child as any)?.props?.is === 'reference' // TODO THROUGH PROPS
      || (child as any)?.props?.is === 'footnote' // TODO THROUGH PROPS
    );

    if (!inline) {
      pushCurrentBlock();
      blocks.push(<Row center="xs" style={{width: '100%'}} className="py-2">{child}</Row>);
      return;
    }

    block = false;

    currentBlock.push(<span>{child}</span>);
  });
  pushCurrentBlock();

  if (block)
    return <div style={{width: '100%'}} is="paragraph">{blocks}</div>

  return <span style={{ textAlign: 'start' }} is="paragraph">
    {blocks}
  </span>;
}

export default Paragraph;