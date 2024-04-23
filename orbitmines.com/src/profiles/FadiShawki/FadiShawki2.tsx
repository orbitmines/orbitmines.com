import {Content} from "../../lib/organizations/ORGANIZATIONS";
import {Intent, Tag} from "@blueprintjs/core";
import { Col, Row } from "../../lib/render/Layout";
import classNames from "classnames";
import {Reference} from "../../lib/paper/Paper";

export const Category = (props: {
  content?: Content[],
  inline?: boolean,
  simple?: boolean
}) => {
  const {inline, simple = false, content} = props;

  if (!props.content)
    return <></>;

  const Item = ({item, index}: { item: Content, index: number }) => {
    return <Tag intent={Intent.NONE} minimal multiline>
      <Reference index={index} reference={{...item.reference}} inline simple={simple}/>
    </Tag>;
  }

  const inline_item = () => <Row center="xs" className="child-p-1">
    {content.map((item, index) => <Col><Item item={item} index={index} key={index}/></Col>)}
  </Row>

  if (inline)
    return inline_item();

  const simple_item = () => <div>
    {/*<H4>{name}</H4>*/}
    {content.map((item, index) => <Row center="xs" className="child-py-1" key={index}>
      <Col xs={12}>
        <Item item={item} index={index} key={index}/>
      </Col>
    </Row>)}
  </div>

  if (simple)
    simple_item();

  return <Row start="xs" className="child-pb-1" style={{width: '100%'}}>
    {content.map((item, index) => <Col md={4} sm={6} xs={6} key={index}>
      <Reference index={index} reference={{...item.reference}} style={{fontSize: '0.8rem'}} />
    </Col>)}
  </Row>
}

export const pageStyles = {
  // width: '1240px';
  // height: '1754px';
  width: '100%',
  maxWidth: '100vw',
  minHeight: '100vh',
  // fontSize: '1.1rem'
};

export const Layer = ({zIndex, children, ...props}: any) => {
  return <div
    {...props}
    className={classNames("py-35 child-pb-15", props.className)}
    style={{
      ...pageStyles,
      position: 'absolute',
      zIndex: zIndex,
      ...(props.style ?? {})
    }}
  >
    {children}
  </div>;
}
