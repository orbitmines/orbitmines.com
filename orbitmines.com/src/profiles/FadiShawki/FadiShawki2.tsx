import {Content, ContentCategory, Viewed} from "../../lib/organizations/ORGANIZATIONS";
import {Intent, Tag} from "@blueprintjs/core";
import Reference from "../../lib/paper/layout/Reference";
import {Col, Row} from "../../lib/layout/flexbox";
import classNames from "classnames";

// TODO: Lex Fridman podcasts & others ..

export const current = (content: ContentCategory): Content[] =>
  (content?.items || []).filter(item => item.status === Viewed.IN_PROGRESS && !item.archived);

export const finished = (content: ContentCategory): Content[] =>
  (content?.items || []).filter(item => item.status === Viewed.VIEWED && !item.archived);

export const todo = (content: ContentCategory): Content[] =>
  (content?.items || []).filter(item => item.status === Viewed.FOUND && !item.archived);

export enum ContentFocus {
  CURRENT,
  FINISHED,
  TODO,
  ALL,
}

export const category = (content: ContentCategory) => {
  return {
    [ContentFocus.CURRENT]: current(content),
    [ContentFocus.FINISHED]: finished(content),
    [ContentFocus.TODO]: todo(content),
    [ContentFocus.ALL]: content.items,
  };
}

export const Category = (props: {
  category?: ContentCategory,
  inline?: boolean,
  focus?: ContentFocus,
  simple?: boolean
}) => {
  const {inline, focus = ContentFocus.CURRENT, simple = false} = props;

  if (!props.category)
    return <></>;

  const {name, items} = props.category;

  const content: Content[] = category(props.category)[focus];

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
