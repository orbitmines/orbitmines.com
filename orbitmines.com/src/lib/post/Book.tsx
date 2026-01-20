import Post, {Arc, Col, PaperProps, Row} from "./Post";
import React, {useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {Button} from "@blueprintjs/core";

export const Navigation = (props: PaperProps) => {
  const arcs = React.Children.toArray(props.children).filter(child =>
    React.isValidElement(child) && child.type === Arc
  )

  return <Row style={{height: '100%', borderRight: '1px solid rgb(108, 103, 131)', alignContent: 'flex-start'}} className="child-py-3 py-20">
    {arcs.map((arc: any) => <Col xs={12} style={{textAlign: 'start'}}>
      <span className="bp5-text-muted">{arc.props.head}</span>
    </Col>)}
  </Row>
}

const Book = (props: PaperProps) => {
  const [params, setParams] = useSearchParams();

  const arc = params.get('arc');
  const page = params.get('page');
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

  const isStartPage: boolean = (arc ?? "").length == 0

  if (isStartPage)
    return <Row end="xs">
      <Button icon="arrow-right" text="Start Reading" minimal style={{fontSize: '18px'}} onClick={() => setParams({...params, arc: 'test'})} />
    </Row>

  return <Row between="xs">
    <Button icon="arrow-left" text="Previous" minimal style={{fontSize: '18px'}} onClick={() => setParams({...params, page: 'test'})} />
    <Button icon="arrow-right" text="Next" minimal style={{fontSize: '18px'}} onClick={() => setParams({...params, page: 'test'})} />
  </Row>
}

export default Book;