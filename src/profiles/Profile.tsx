import React from 'react';
import {Helmet} from "react-helmet";
import {useLocation} from "react-router-dom";
import {PaperProps, PaperView, PView} from "../lib/paper/Paper";
import JetBrainsMono from "../lib/layout/font/fonts/JetBrainsMono/JetBrainsMono";
import ORGANIZATIONS, {TProfile} from "../lib/organizations/ORGANIZATIONS";
import {Children, renderable} from "../lib/typescript/React";

import BlueprintIcons16 from '@blueprintjs/icons/lib/css/blueprint-icons-16.ttf';
import BlueprintIcons20 from '@blueprintjs/icons/lib/css/blueprint-icons-20.ttf';

const Profile = ({profile, children}: {profile: TProfile} & Children) => {
  const location = useLocation();

  const paper: Omit<PaperProps, 'children'> = {
    title: profile.title ?? renderable(profile.name),
    subtitle: profile.subtitle,
    date: profile.date,
    view: PView.Browser,
    pdf: {
      fonts: [
        JetBrainsMono,
        {
          family: 'blueprint-icons-20',
          fonts: [
            {src: BlueprintIcons20, fontWeight: 'normal', fontStyle: 'normal'},
          ]
        },
        {
          family: 'blueprint-icons-16',
          fonts: [
            {src: BlueprintIcons16, fontWeight: 'normal', fontStyle: 'normal'},
          ]
        }
      ],
    },
    authors: [{
      ...profile,
      external: profile.external?.filter((profile) => [
        ORGANIZATIONS.github.key,
        ORGANIZATIONS.twitter.key,
        ORGANIZATIONS.discord.key,
        ORGANIZATIONS.linkedin.key,
        ORGANIZATIONS.orcid.key,
        ORGANIZATIONS.gitlab.key,
        ORGANIZATIONS.instagram.key,
        ORGANIZATIONS.youtube.key,
        ORGANIZATIONS.twitch.key,
        ORGANIZATIONS.mastodon.key,
        ORGANIZATIONS.facebook.key,
      ].includes(profile.organization.key))
    }],
    exclude_footnotes: true
  }

  const {title, subtitle, authors} = paper;

  const url = {
    base: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}`,
    pdf: `https://orbitmines.com${location.pathname.replace(/\/$/, "")}.pdf`,
  };
  const description = subtitle?.value;

  // Google Scholar: https://scholar.google.com.au/intl/en/scholar/inclusion.html#indexing

  // The Open Graph Protocol // https://ogp.me/
  const OpenGraph = () => (
    <Helmet>
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={title.value} />
      <meta property="og:url" content={url.base} />
      <meta property="og:description" content={description} />

      <meta property="og:image" content={profile.picture} />
      {/*<meta property="og:image:secure_url" content={profile.picture} />*/}
      <meta property="og:image:type" content="image/jpeg" />
      {/*<meta property="og:image:width" content="400" />*/}
      {/*<meta property="og:image:height" content="300" />*/}
      <meta property="og:image:alt" content="Profile picture" />

      <meta property="og:profile:first_name" content={profile.first_name} />
      <meta property="og:profile:last_name" content={profile.last_name} />
      <meta property="og:profile:username" content={profile.profile} />
    </Helmet>
  )

  // https://schema.org/Article
  const Schemaorg = () => (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify([{
        "@context": "https://schema.org",
        "@type": "Person",
        "name": profile.name,
        "email": profile.email,
        "givenName": profile.first_name,
        "familyName": profile.last_name,
        "url": `https://orbitmines.com/profiles/${profile.profile}`,
        "image": profile.picture,
      }, {
        "@context": "https://schema.org",
        "@type": "Organization",
        "url": "https://orbitmines.com",
        "logo": "https://www.example.com/images/logo.png"
      }, {
        // Can have multiple breadcrumbs
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": "Profiles",
          "item": "https://orbitmines.com/profiles"
        },{
          "@type": "ListItem",
          "position": 2,
          "name": profile.name
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
    <meta property="twitter:image" content={profile.picture} />
  </Helmet>);

  return <div>
    <Helmet>
      <title lang="en">{title.value}</title>
      <meta name="description" content={description} />
    </Helmet>
    <OpenGraph/>
    <Schemaorg/>
    <Twitter/>

    <PaperView {...paper}>
      {children}
    </PaperView>
  </div>
}

export default Profile;