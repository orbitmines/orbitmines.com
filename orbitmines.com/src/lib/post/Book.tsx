import Post, {Arc, Col, HorizontalLine, PaperProps, Row, Section} from "./Post";
import React, {useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {Button} from "@blueprintjs/core";

export class BookUtil {
  constructor(private props: PaperProps, private params: URLSearchParams) {}

  arcs = () => React.Children.toArray(this.props.children).filter(child =>
    React.isValidElement(child) && child.type === Arc
  )

  getSections = (node: React.ReactNode): React.ReactElement[] => {
    if (!React.isValidElement(node)) return [];

    const children = React.Children.toArray(node.props?.children);

    const directSections = children.filter(
      child => React.isValidElement(child) && child.type === Section && child.props.head
    ) as React.ReactElement[];

    return directSections.flatMap(section => [
      section,
      ...this.getSections(section)
    ]);
  };

  current = (): any => {
    const current = this.allSections().filter(child => this.sectionName(child) === this.section());

    return current.length != 0 ? current[0] : this.allSections()[0]
  }

  allSections = () =>
    this.arcs().flatMap(arc => [
      arc,
      ...this.getSections(arc)
    ]).filter(child => !this.disabled(child));

  section = () => this.params.get('section')

  firstSection = () => this.sectionName(this.allSections()[0])
  previousSection = () => this.nextSection(true)
  nextSection = (reverse: boolean = false) => this.sectionName(this.next(reverse))

  sectionName = (element: any) => {
    if (typeof element.props.head === "string") return element.props.head
    if (element.props.head.props != undefined) return element.props.head.props.children
    return ""
  }
  disabled = (element: any) => typeof element.props.head !== "string"

  previous = () => this.next(true)
  next = (reverse: boolean = false) => {
    const sections = this.allSections()
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      if (!this.isSelected(section)) continue

      if (reverse) {
        if (i === 0) return undefined
      } else {
        if (i === sections.length - 1) return undefined
      }

      return sections[i + (reverse ? -1 : 1)] as any
    }

    return undefined
  }

  isSelected = (element: any) => {
    return React.isValidElement(element) && this.sectionName(element) === this.section();
  }
}

export const Navigation = (props: PaperProps) => {
  const [params, setParams] = useSearchParams();

  const util = new BookUtil(props, params)

  return <Row style={{height: '100%', borderRight: '1px solid rgb(108, 103, 131)', alignContent: 'flex-start'}} className="pl-10 child-py-3 py-20">
    {util.arcs().map((arc: any) => <Col xs={12} style={{textAlign: 'start'}}>
      <a className="bp5-text-muted" style={{color: util.isSelected(arc) ? 'orange' : '#abb3bf'}} onClick={() => !util.disabled(arc) ? setParams({...params, section: util.sectionName(arc)}) : undefined}>{arc.props.head}</a>

      {React.Children.toArray((arc as any).props.children).filter(child =>
        React.isValidElement(child) && child.type === Section
      ).map((section: any) => <Col xs={12} style={{textAlign: 'start'}} className="pt-3">
        <a className="bp5-text-muted ml-5" style={util.isSelected(section) ? {color: 'orange'} : {}} onClick={() => !util.disabled(section) ? setParams({...params, section: util.sectionName(section)}) : undefined}>{section.props.head}</a>

        {React.Children.toArray((section as any).props.children).filter(child =>
          React.isValidElement(child) && child.type === Section
        ).map((section: any) => <Col xs={12} style={{textAlign: 'start'}}>
          <a className="bp5-text-muted ml-10" style={util.isSelected(section) ? {color: 'orange'} : {}} onClick={() => !util.disabled(section) ? setParams({...params, section: util.sectionName(section)}) : undefined}>{section.props.head}</a>


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

  const util = new BookUtil(props, params)
  const current = util.current()

  if (isStartPage)
    return <Row end="xs">
      <Button rightIcon="arrow-right" text="Start Reading" minimal style={{fontSize: '18px'}} onClick={() => setParams({...params, section: util.firstSection() })} />
    </Row>

  return <Row>
    <Col xs={12}>
      <Section head={current.props.head}>
        {React.Children.toArray(current.props.children).filter((child: any) => !React.isValidElement(child) || child.type !== Section)}
      </Section>
    </Col>
    <Col xs={12}>
      <HorizontalLine/>
    </Col>
    <Col xs={12}>
      <Row between="xs">
        {util.previous() ? <Button icon="arrow-left" text={util.previousSection()} minimal style={{fontSize: '18px', maxWidth: '50%'}} onClick={() => setParams({...params, section: util.previousSection()})} /> : <div/>}
        {util.next() ? <Button rightIcon="arrow-right" text={util.nextSection()} minimal style={{fontSize: '18px', maxWidth: '50%'}} onClick={() => setParams({...params, section: util.nextSection()})} /> : null}
      </Row>
    </Col>
  </Row>
}

export default Book;