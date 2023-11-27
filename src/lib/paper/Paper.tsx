import React, {Fragment, ReactNode} from 'react';
import {Helmet} from "react-helmet";
import ExportablePaper, {PdfProps} from "./views/ExportablePaper";
import {TOrganization, TProfile} from "../organizations/ORGANIZATIONS";
import {Children, Renderable} from "../typescript/React";
import Browser from "./views/Browser";
import {useLocation} from "react-router-dom";
import {ReferenceCounter} from "./layout/Reference";

export type PaperProps = {
  title: Renderable<string>,
  subtitle?: Renderable<string>,
  date: string,

  draft?: boolean,

  pdf: PdfProps,
  exclude_footnotes?: boolean
  view: PView

  organizations?: [TOrganization]
  authors?: [TProfile]

  external?: {
    discord?: { serverId: string, channelId?: string, link: () => string },
  },

  Reference: (props: {}) => JSX.Element,

  references?: ReferenceCounter
} & Children;

export enum PView {
  Browser,
  DereferencedHtml,

  Pdf,
}

export const PaperView = (paper: PaperProps) => {
  const { view } = paper;

  if (view === PView.Browser)
    return <Browser paper={paper} />;

  return <ExportablePaper {...paper} />
};

const Paper = (props: PaperProps) => {
  const location = useLocation();

  const {title, subtitle, date, authors} = props;

  const url = {
    base: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}`,
    jpeg: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}.jpeg`,
    pdf: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}.pdf`,
  };
  const description = subtitle?.value;

  // Google Scholar: https://scholar.google.com.au/intl/en/scholar/inclusion.html#indexing

  // The Open Graph Protocol // https://ogp.me/
  const OpenGraph = () => (
    <Helmet>
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title.value} />
      <meta property="og:url" content={url.base} />
      <meta property="og:description" content={description} />

      <meta property="og:image" content={url.jpeg} />
      {/*<meta property="og:image:secure_url" content={url.jpeg} />*/}
      <meta property="og:image:type" content="image/jpeg" />
      {/*<meta property="og:image:width" content="400" />*/}
      {/*<meta property="og:image:height" content="300" />*/}
      <meta property="og:image:alt" content={description} />

      <meta property="og:article:published_time" content={date} />
      <meta property="og:article:modified_time" content={date} />
      {/*<meta property="og:article:expiration_time" content="" />*/}
      {(authors || []).map(author => (<meta name="og:article:author" content={author.formal_citation_name} />))}
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
        "headline": title.value,
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
        },{
          "@type": "ListItem",
          "position": 2,
          "name": title.value
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
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:creator" content="@_FadiShawki" />
    <meta property="twitter:title" content={title.value} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={url.jpeg} />
  </Helmet>);

  const HighwirePress = () => (<Helmet>
    {/*<meta name="citation_doi" content="10.1038/nature09108">*/}

    <meta name="citation_publisher" content="OrbitMines" />
    <meta name="citation_journal_title" content="OrbitMines" />
    <meta name="citation_public_url" content={url.base} />
    <meta name="citation_pdf_url" content={url.pdf} />

    <meta name="citation_title" content={title.value}/>
    {/*<meta name="citation_doi" content={title.value}/>*/}

    {(authors || []).map(author => (<meta name="citation_author" content={author.formal_citation_name} />))}
    {(authors || []).map(author => (<meta name="citation_author_email" content={author.email} />))}
    {(authors || []).map(author => (<meta name="citation_author_orcid" content={author.orcid} />))}

    {/*<meta name="citation_year" content="" />*/}
    <meta name="citation_date" content={date} />
    <meta name="citation_online_date" content={date} />
    <meta name="citation_publication_date" content={date} />
  </Helmet>);

  // https://en.wikipedia.org/wiki/Dublin_Core
  const DublinCore = () => (<Helmet>
    <meta name="dc.title" content={title.value}/>
    <meta name="dc.publisher" content="OrbitMines"/>
    <meta name="dc.date" content={date} />
    {/*<meta name="dc.identifier" content="" />*/}

    {(authors || []).map(author => (<meta name="dc.contributor" content={author.formal_citation_name} />))}
  </Helmet>);

  // https://en.wikipedia.org/wiki/Publishing_Requirements_for_Industry_Standard_Metadata
  const Prism = () => (<Helmet>
    <meta name="prism.title" content={title.value}/>
    <meta name="prism.publicationDate" content={date} />
    {/*<meta name="prism.doi" content="" />*/}
    <meta name="prism.url" content={url.base} />
  </Helmet>);

  // http://wiki.eprints.org/w/Metadata
  const Eprints = () => (<Helmet>
    <meta name="eprints.title" content={title.value}/>
    <meta name="eprints.date" content={date} />
    <meta name="eprints.official_url" content={url.base} />

    {(authors || []).map(author => (<meta name="eprints.creators_name" content={author.formal_citation_name} />))}
  </Helmet>);

  return <div>
    <Helmet>
      <title lang="en">{title.value}</title>
      <meta name="description" content={description} />
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