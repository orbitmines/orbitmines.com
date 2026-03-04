import Post, {Arc, BR, Col, HorizontalLine, Paragraph, PaperProps, Row, Section} from "./Post";
import React, {useEffect, useLayoutEffect, useRef} from "react";
import {useSearchParams} from "react-router-dom";
import {Button} from "@blueprintjs/core";

type SearchResult = { sectionName: string; groups: React.ReactNode[][] };

const extractText = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (!React.isValidElement(node)) return '';
  if (node.type === Section) return '';
  if (node.type === BR) return '\n';
  const children = (node.props as any)?.children;
  if (children) return extractText(children);
  return '';
};

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

  getContentChildren = (element: any): React.ReactNode[] =>
    React.Children.toArray(element.props.children)
      .filter((child: any) => !React.isValidElement(child) || child.type !== Section);

  searchAll = (query: string): SearchResult[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];
    const CONTEXT = 5;

    for (const section of this.allSections()) {
      const content = this.getContentChildren(section);
      const matchingIndices: number[] = [];

      content.forEach((child, i) => {
        if (extractText(child).toLowerCase().includes(lowerQuery)) {
          matchingIndices.push(i);
        }
      });

      if (matchingIndices.length === 0) continue;

      const ranges: [number, number][] = matchingIndices.map(i => [
        Math.max(0, i - CONTEXT),
        Math.min(content.length - 1, i + CONTEXT)
      ]);

      const merged: [number, number][] = [ranges[0]];
      for (let i = 1; i < ranges.length; i++) {
        const last = merged[merged.length - 1];
        if (ranges[i][0] <= last[1] + 1) {
          last[1] = Math.max(last[1], ranges[i][1]);
        } else {
          merged.push(ranges[i]);
        }
      }

      const groups = merged.map(([start, end]) => content.slice(start, end + 1));
      results.push({ sectionName: this.sectionName(section), groups });
    }
    return results;
  };
}

export const Navigation = (props: PaperProps & { hideBorder?: boolean, onNavigate?: () => void }) => {
  const [params, setParams] = useSearchParams();
  const navRef = useRef<HTMLDivElement>(null);

  const util = new BookUtil(props, params)
  const generate = params.get('generate');
  const section = params.get('section');

  const navigate = (sectionName: string) => {
    setParams(prev => { const next = new URLSearchParams(prev); next.set('section', sectionName); next.delete('search'); return next; });
    props.onNavigate?.();
  };

  useLayoutEffect(() => {
    if (!navRef.current) return;
    const selected = navRef.current.querySelector('[data-selected]') as HTMLElement | null;
    if (!selected) return;
    const container = navRef.current.parentElement?.parentElement;
    if (!container || container.scrollHeight <= container.clientHeight) return;
    const containerRect = container.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    container.scrollTop = Math.max(0, selectedRect.top - containerRect.top + container.scrollTop - container.clientHeight / 2 + selectedRect.height / 2);
  }, [section]);

  return <Row style={{...(!props.hideBorder ? {minHeight: '100%'} : {}), ...(generate !== 'button' && generate !== 'pdf' && !props.hideBorder ? {borderRight: '1px solid rgb(108, 103, 131)'} : {}), alignContent: 'flex-start'}} className="pl-10 child-py-3 py-20"><div ref={navRef} style={{width: '100%'}}>
    {util.arcs().map((arc: any) => <Col xs={12} style={{textAlign: 'start'}}>
      <a className="bp5-text-muted" data-selected={util.isSelected(arc) || undefined} style={{color: util.isSelected(arc) ? 'orange' : '#abb3bf'}} onClick={() => !util.disabled(arc) ? navigate(util.sectionName(arc)) : undefined}>{arc.props.head}</a>

      {React.Children.toArray((arc as any).props.children).filter(child =>
        React.isValidElement(child) && child.type === Section
      ).map((section: any) => <Col xs={12} style={{textAlign: 'start'}} className="pt-3">
        <a className="bp5-text-muted ml-5" data-selected={util.isSelected(section) || undefined} style={util.isSelected(section) ? {color: 'orange'} : {}} onClick={() => !util.disabled(section) ? navigate(util.sectionName(section)) : undefined}>{section.props.head}</a>

        {React.Children.toArray((section as any).props.children).filter(child =>
          React.isValidElement(child) && child.type === Section
        ).map((section: any) => <Col xs={12} style={{textAlign: 'start'}}>
          <a className="bp5-text-muted ml-10" data-selected={util.isSelected(section) || undefined} style={util.isSelected(section) ? {color: 'orange'} : {}} onClick={() => !util.disabled(section) ? navigate(util.sectionName(section)) : undefined}>{section.props.head}</a>


        </Col>)}
      </Col>)}
    </Col>)}
  </div></Row>
}

const highlightDomMatches = (container: HTMLElement, query: string) => {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const lowerQuery = query.toLowerCase();
  const matches: { node: Text; indices: number[] }[] = [];

  let textNode: Text | null;
  while ((textNode = walker.nextNode() as Text | null)) {
    const text = textNode.textContent || '';
    const lowerText = text.toLowerCase();
    const indices: number[] = [];
    let from = 0;
    while (true) {
      const idx = lowerText.indexOf(lowerQuery, from);
      if (idx === -1) break;
      indices.push(idx);
      from = idx + query.length;
    }
    if (indices.length > 0) matches.push({ node: textNode, indices });
  }

  for (const { node, indices } of [...matches].reverse()) {
    for (const idx of [...indices].reverse()) {
      try {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + query.length);
        const mark = document.createElement('mark');
        mark.style.backgroundColor = 'rgba(255, 179, 71, 0.3)';
        mark.style.color = 'inherit';
        mark.style.padding = '1px 2px';
        mark.style.borderRadius = '2px';
        range.surroundContents(mark);
      } catch (e) {}
    }
  }
};

const clearDomHighlights = (container: HTMLElement) => {
  container.querySelectorAll('mark').forEach(mark => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      parent.normalize();
    }
  });
};

const BookSearch = ({ props, params, setParams, onBack }: {
  props: PaperProps,
  params: URLSearchParams,
  setParams: ReturnType<typeof useSearchParams>[1],
  onBack: () => void
}) => {
  const search = params.get('search') || '';
  const util = new BookUtil(props, params);
  const results = util.searchAll(search);
  const resultsRef = useRef<HTMLDivElement>(null);
  const totalGroups = results.reduce((sum, r) => sum + r.groups.length, 0);

  useEffect(() => {
    if (!resultsRef.current || !search.trim()) return;
    const container = resultsRef.current;
    highlightDomMatches(container, search);
    return () => clearDomHighlights(container);
  }, [search]);

  const allGroups = results.flatMap(result =>
    result.groups.map(group => ({ sectionName: result.sectionName, children: group }))
  );

  return <Row>
    <Col xs={12}>
      <Row between="xs" middle="xs" className="pb-10">
        <Button icon="arrow-left" text="Back" minimal style={{fontSize: '16px'}} onClick={onBack} />
        <span className="bp5-text-muted" style={{fontSize: '14px'}}>
          {totalGroups} result{totalGroups !== 1 ? 's' : ''} for '{search}'
        </span>
      </Row>
    </Col>
    <div ref={resultsRef} style={{width: '100%'}}>
      {allGroups.length === 0 ? <Col xs={12}>
        <Row center="xs" className="py-20">
          <span className="bp5-text-muted" style={{fontSize: '16px'}}>No results found.</span>
        </Row>
      </Col> : allGroups.map((group, i) => <Col xs={12} key={i}>
        {i > 0 && <HorizontalLine />}
        <Row between="xs" middle="xs" className="py-3">
          <span className="bp5-text-muted" style={{fontSize: '13px'}}>{group.sectionName}</span>
          <Button
            rightIcon="arrow-right"
            text="Keep reading"
            minimal
            small
            style={{fontSize: '13px'}}
            onClick={() => setParams(prev => {
              const next = new URLSearchParams(prev);
              next.set('section', group.sectionName);
              next.set('highlight', search);
              next.delete('search');
              return next;
            })}
          />
        </Row>
        <div style={{textAlign: 'start'}}>
          <Paragraph>{group.children}</Paragraph>
        </div>
      </Col>)}
    </div>
  </Row>;
};

const Book = (props: PaperProps) => {
  const [params, setParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const preSearchState = useRef<{ section: string | null; scrollTop: number } | null>(null);
  const prevSearch = useRef<string | null>(null);

  const section = params.get('section');
  const search = params.get('search');
  const highlight = params.get('highlight');

  // Save state when entering search
  useEffect(() => {
    const wasSearching = (prevSearch.current ?? '').length > 0;
    const isSearching = (search ?? '').length > 0;

    if (!wasSearching && isSearching) {
      preSearchState.current = {
        section: params.get('section'),
        scrollTop: document.documentElement.scrollTop
      };
    }

    prevSearch.current = search;
  }, [search]);

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

  // Highlight text when navigating from search
  useEffect(() => {
    if (!highlight || !contentRef.current) return;

    const timer = setTimeout(() => {
      const container = contentRef.current!;
      highlightDomMatches(container, highlight);

      const firstMark = container.querySelector('mark');
      if (firstMark) {
        firstMark.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }

      const originalSection = new URLSearchParams(window.location.search).get('section');
      setTimeout(() => {
        clearDomHighlights(container);
        const current = new URLSearchParams(window.location.search);
        if (!current.get('search') && current.get('section') === originalSection) {
          setParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('highlight');
            return next;
          });
        }
      }, 6000);
    }, 100);

    return () => clearTimeout(timer);
  }, [highlight, section]);

  const isSearching = (search ?? '').length > 0;
  const isStartPage: boolean = (section ?? "").length == 0

  const util = new BookUtil(props, params)

  const handleBack = () => {
    const saved = preSearchState.current;
    setParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      if (saved?.section) {
        next.set('section', saved.section);
      } else {
        next.delete('section');
      }
      return next;
    });
    if (saved) {
      requestAnimationFrame(() => {
        document.documentElement.scrollTop = saved.scrollTop;
      });
    }
    preSearchState.current = null;
  };

  const generate = params.get('generate');

  if (generate === 'button' || generate === 'pdf')
    return <Row>
      <Col xs={12}>
        <Navigation {...props} />
      </Col>
      <Col xs={12}><HorizontalLine/></Col>
      {util.allSections().map((sec: any, i: number) => <Col xs={12} key={i}>
        <Section head={sec.props.head}>
          {React.Children.toArray(sec.props.children).filter((child: any) => !React.isValidElement(child) || child.type !== Section)}
        </Section>
        <HorizontalLine/>
      </Col>)}
    </Row>

  if (isSearching)
    return <BookSearch props={props} params={params} setParams={setParams} onBack={handleBack} />;

  const current = util.current()

  if (isStartPage)
    return <Row end="xs">
      <Button rightIcon="arrow-right" text="Start Reading" minimal style={{fontSize: '18px'}} onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.set('section', util.firstSection()); return next; })} />
    </Row>

  return <Row>
    <Col xs={12}>
      <div ref={contentRef}>
        <Section head={current.props.head}>
          {React.Children.toArray(current.props.children).filter((child: any) => !React.isValidElement(child) || child.type !== Section)}
        </Section>
      </div>
    </Col>
    <Col xs={12}>
      <HorizontalLine/>
    </Col>
    <Col xs={12}>
      <Row between="xs">
        {util.previous() ? <Button icon="arrow-left" text={util.previousSection()} minimal style={{fontSize: '18px', maxWidth: '50%'}} onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.set('section', util.previousSection()); return next; })} /> : <div/>}
        {util.next() ? <Button rightIcon="arrow-right" text={util.nextSection()} minimal style={{fontSize: '18px', maxWidth: '50%'}} onClick={() => setParams(prev => { const next = new URLSearchParams(prev); next.set('section', util.nextSection()); return next; })} /> : null}
      </Row>
    </Col>
  </Row>
}

export default Book;