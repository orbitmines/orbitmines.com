import React from 'react';
import {Helmet} from "react-helmet";
import ExportablePaper, {PdfProps} from "./views/ExportablePaper";
import {Children, value} from "../typescript/React";
import Browser from "./views/Browser";
import {useLocation, useSearchParams} from "react-router-dom";
import {ReferenceCounter, ReferenceProps} from "./layout/Reference";
import {PaperHeader} from "./PaperContent";
import {Grid, Row} from "../layout/flexbox";
import {Center} from "@react-three/drei";
import {Continuation, Loop, RenderedRay, torus, Vertex} from "../../@orbitmines/explorer/OrbitMinesExplorer";
import {length} from "../../@orbitmines/explorer/Ray";
import {CachedVisualizationCanvas, VisualizationCanvas} from "../../@orbitmines/explorer/Visualization";

export type PaperProps = ReferenceProps & {
  pdf: PdfProps,
  exclude_footnotes?: boolean

  Reference: (props: {}) => JSX.Element,

  references?: ReferenceCounter
} & Children;

export const PaperView = (paper: PaperProps) => {
  const [params] = useSearchParams();

  const generate = params.get('generate');

  if (generate === 'pdf')
    return <ExportablePaper {...paper} />

  return <Browser paper={paper}/>;
};

export const PaperThumbnail = (
  {size, ...props}: PaperProps & { size?: { width: number, height: number } }
) => {
  const [params] = useSearchParams();

  const width = parseInt(params.get('width') ?? '1920');
  const height = parseInt(params.get('height') ?? '1080');

  // const {width = 1920, height = 1080} = size ?? {};

  const scale = (width / 1240) * 1.1;

  const s2 = scale;


  return <div style={{
    width: `${width}px`,
    height: `${height}px`,
  }}>
    <VisualizationCanvas style={{
      position: 'absolute',
      // height: '100px',
      width: `${width}px`,
      height: `${height}px`,
    }}>

      <group scale={s2}>

        <group position={[3, -225, 0]}>

          <group scale={1.5}>
            <RenderedRay reference={length(1)} scale={1.5 * s2} color="#555555" initial={[-500, 0, 0]}
                         terminal={[500, 0, 0]}/>
          </group>


          <group position={[100, -10, 0]}>
            <group position={[30, 45, 0]}>
              <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5 * s2}
                                                                     color="#555555"/></group>
              <group scale={1.5}><RenderedRay reference={length(1)} scale={1.5 * s2} color="#555555"/></group>
            </group>

            <group scale={1.5}>
              <Continuation position={[-20, 30, 0]} color="orange" scale={1.5}/>
              <Continuation position={[20, 30, 0]} color="orange" scale={1.5}/>

              <group rotation={[Math.PI, 0, 0]}>
                <Continuation position={[0, -30 + torus.radius, 0]} color="orange" scale={1.5} arc={Math.PI}
                              radius={20}/>
              </group>

              <Vertex color="orange" position={[0, 7, 0]}/>
            </group>
          </group>
          <group>
            <group scale={1.5} position={[300, 0, 0]}>
              <Loop position={[0, 15, 0]} radius={15} color="orange" scale={1.5 * s2}/>
            </group>
          </group>

          <group rotation={[0, 0, Math.PI / 2]} position={[-100, 60, 0]}>
            <group scale={1.5} position={[-60, 0, 0]}><RenderedRay reference={length(1)} scale={1.5 * s2}
                                                                   color="orange"/></group>
          </group>

          <group rotation={[0, 0, Math.PI / 2]} position={[-300, 60, 0]}>
            <group scale={1.5} position={[-60, 0, 0]}><Vertex scale={1.5}
                                                              color="orange"/></group>
          </group>

        </group>

      </group>
    </VisualizationCanvas>

    <Row center="xs" middle="xs" style={{height: '100%', width: '100%'}}>
      <div style={{transform: `scale(${scale})`}}>
        <Grid fluid className="py-35 child-pb-15 px-50-lg" style={{
          // border: 'solid rgba(143, 153, 168, 0.15) 2px',
          //     height={1754} width={1240}
          maxWidth: '1240px',
          fontSize: '1.1rem'
        }}>

          <PaperHeader {...props} />
        </Grid>
      </div>
    </Row>
  </div>
}

const Paper = (props: PaperProps) => {
  const location = useLocation();

  const {title, subtitle, date, authors} = props;

  const url = {
    base: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}`,
    jpeg: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}.jpeg`,
    pdf: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}.pdf`,
  };
  const description = value(subtitle);

  // Google Scholar: https://scholar.google.com.au/intl/en/scholar/inclusion.html#indexing

  // The Open Graph Protocol // https://ogp.me/
  const OpenGraph = () => (
    <Helmet>
      <meta property="og:type" content="article"/>
      <meta property="og:title" content={value(title)}/>
      <meta property="og:url" content={url.base}/>
      <meta property="og:description" content={description}/>

      <meta property="og:image" content={url.jpeg}/>
      {/*<meta property="og:image:secure_url" content={url.jpeg} />*/}
      <meta property="og:image:type" content="image/jpeg"/>
      {/*<meta property="og:image:width" content="400" />*/}
      {/*<meta property="og:image:height" content="300" />*/}
      <meta property="og:image:alt" content={description}/>

      <meta property="og:article:published_time" content={date}/>
      <meta property="og:article:modified_time" content={date}/>
      {/*<meta property="og:article:expiration_time" content="" />*/}
      {(authors || []).map(author => (<meta name="og:article:author" content={author.formal_citation_name}/>))}
      {/*<meta property="og:article:section" content="Technology" />*/}
      {/*<meta property="og:article:tag" content="" />*/}
    </Helmet>
  )

  // https://schema.org/Article
  const Schemaorg = () => (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify([{
        "@context": "https://schema.org",
        "@type": "Article",
        "author": [(authors || []).map(author => ({
          "@type": "Person",
          "name": author.name,
          "email": author.email,
          "givenName": author.first_name,
          "familyName": author.last_name,
          "url": `https://orbitmines.com/profiles/${author.profile}`,
          "image": author.picture,
        }))],
        "publisher": [{
          "name": "OrbitMines",
          "url": "https://orbitmines.com"
        }],
        "dateModified": date,
        "datePublished:": date,
        "headline": value(title),
        "image": url.jpeg,
        // "articleBody": "",
        // "articleSection": "", // Technology, ..
        // "backstory": "", // how created
        // "pageEnd": "",
        // "pageStart": "",
        // "pagination": "",
        // "speakable": "", ???
        // The number of words in the text of the Article.
        // "wordCount": "",

        // The subject of the content.
        // "about": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
        // "": "",
      }, {
        "@context": "https://schema.org",
        "@type": "Organization",
        "url": "https://orbitmines.com",
        "logo": "https://orbitmines.com/logo.png"
      }, {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": "Papers",
          "item": "https://orbitmines.com"
        }, {
          "@type": "ListItem",
          "position": 2,
          "name": value(title)
        }]

        // TODO  https://developers.google.com/search/docs/appearance/structured-data/dataset
        // TODO https://developers.google.com/search/docs/appearance/structured-data/event
        // TODO https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
        // todo https://developers.google.com/search/docs/appearance/structured-data/math-solvers
        // todo https://developers.google.com/search/docs/appearance/structured-data/software-app
        // todo https://developers.google.com/search/docs/appearance/structured-data/book
        // TODO https://developers.google.com/search/docs/appearance/structured-data/faqpage
      }])}</script>
    </Helmet>
  )

  const Twitter = () => (<Helmet>
    <meta property="twitter:card" content="summary_large_image"/>
    <meta property="twitter:creator" content="@_FadiShawki"/>
    <meta property="twitter:title" content={value(title)}/>
    <meta property="twitter:description" content={description}/>
    <meta property="twitter:image" content={url.jpeg}/>
  </Helmet>);

  const HighwirePress = () => (<Helmet>
    {/*<meta name="citation_doi" content="10.1038/nature09108">*/}

    <meta name="citation_publisher" content="OrbitMines"/>
    <meta name="citation_journal_title" content="OrbitMines"/>
    <meta name="citation_public_url" content={url.base}/>
    <meta name="citation_pdf_url" content={url.pdf}/>

    <meta name="citation_title" content={value(title)}/>
    {/*<meta name="citation_doi" content={value(title)}/>*/}

    {(authors || []).map(author => (<meta name="citation_author" content={author.formal_citation_name}/>))}
    {(authors || []).map(author => (<meta name="citation_author_email" content={author.email}/>))}
    {(authors || []).map(author => (<meta name="citation_author_orcid" content={author.orcid}/>))}

    {/*<meta name="citation_year" content="" />*/}
    <meta name="citation_date" content={date}/>
    <meta name="citation_online_date" content={date}/>
    <meta name="citation_publication_date" content={date}/>
  </Helmet>);

  // https://en.wikipedia.org/wiki/Dublin_Core
  const DublinCore = () => (<Helmet>
    <meta name="dc.title" content={value(title)}/>
    <meta name="dc.publisher" content="OrbitMines"/>
    <meta name="dc.date" content={date}/>
    {/*<meta name="dc.identifier" content="" />*/}

    {(authors || []).map(author => (<meta name="dc.contributor" content={author.formal_citation_name}/>))}
  </Helmet>);

  // https://en.wikipedia.org/wiki/Publishing_Requirements_for_Industry_Standard_Metadata
  const Prism = () => (<Helmet>
    <meta name="prism.title" content={value(title)}/>
    <meta name="prism.publicationDate" content={date}/>
    {/*<meta name="prism.doi" content="" />*/}
    <meta name="prism.url" content={url.base}/>
  </Helmet>);

  // http://wiki.eprints.org/w/Metadata
  const Eprints = () => (<Helmet>
    <meta name="eprints.title" content={value(title)}/>
    <meta name="eprints.date" content={date}/>
    <meta name="eprints.official_url" content={url.base}/>

    {(authors || []).map(author => (<meta name="eprints.creators_name" content={author.formal_citation_name}/>))}
  </Helmet>);

  return <div>
    <Helmet>
      <title lang="en">{value(title)}</title>
      <meta name="description" content={description}/>
    </Helmet>
    <OpenGraph/>
    <Schemaorg/>
    <Twitter/>
    <HighwirePress/>
    <DublinCore/>
    <Prism/>
    <Eprints/>

    <PaperView {...props} />
  </div>
}

export default Paper;