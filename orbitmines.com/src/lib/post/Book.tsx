import Post, {Arc, Col, PaperProps, Row, Section} from "./Post";
import React, {useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {Button} from "@blueprintjs/core";

export const Navigation = (props: PaperProps) => {
  const [params] = useSearchParams();

  const section = params.get('section');

  const arcs = React.Children.toArray(props.children).filter(child =>
    React.isValidElement(child) && child.type === Arc
  )

  const sections = arcs.flatMap(arc => [arc, ...React.Children.toArray((arc as any).props.children).filter(child =>
    React.isValidElement(child) && child.type === Section
  )])

  const isSelected = (element: any) => {
    return React.isValidElement(element) && (element.props as any).head === section;
  }

  return <Row style={{height: '100%', borderRight: '1px solid rgb(108, 103, 131)', alignContent: 'flex-start'}} className="child-py-3 py-20">
    {arcs.map((arc: any) => <Col xs={12} style={{textAlign: 'start'}}>
      <span className="bp5-text-muted" style={{color: isSelected(arc) ? 'orange' : '#abb3bf'}}>{arc.props.head}</span>

      {React.Children.toArray((arc as any).props.children).filter(child =>
        React.isValidElement(child) && child.type === Section
      ).map((section: any) => <Col xs={12} style={{textAlign: 'start'}} className="pt-3">
        <span className="bp5-text-muted" style={isSelected(section) ? {color: 'orange'} : {}}>{section.props.head}</span>

        {React.Children.toArray((section as any).props.children).filter(child =>
          React.isValidElement(child) && child.type === Section
        ).map((section: any) => <Col xs={12} style={{textAlign: 'start'}}>
          <span className="bp5-text-muted" style={isSelected(section) ? {color: 'orange'} : {}}>{section.props.head}</span>


        </Col>)}
      </Col>)}
    </Col>)}
  </Row>
}

const Book = (props: PaperProps) => {
  const [params, setParams] = useSearchParams();

  const section = params.get('section');
  const search = params.get('search');

  //TODO If search cancelled scroll back.

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();

        const input = document.getElementById("search") as HTMLInputElement;
        input?.focus();
        input?.select();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isStartPage: boolean = (section ?? "").length == 0

  if (isStartPage)
    return <Row end="xs">
      <Button icon="arrow-right" text="Start Reading" minimal style={{fontSize: '18px'}} onClick={() => setParams({...params, section: 'test'})} />
    </Row>

  return <Row between="xs">
    <Button icon="arrow-left" text="Previous" minimal style={{fontSize: '18px'}} onClick={() => setParams({...params, page: 'test'})} />
    <Button icon="arrow-right" text="Next" minimal style={{fontSize: '18px'}} onClick={() => setParams({...params, page: 'test'})} />
  </Row>
}

export default Book;