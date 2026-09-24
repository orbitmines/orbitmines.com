import {useSearchParams} from "react-router-dom";

import ORGANIZATIONS, {PLATFORMS} from "../organizations/ORGANIZATIONS";
import {PROFILES} from "../../routes/profiles/profiles";
import {CanvasContainer} from "../../routes/archive/2023.OnOrbits";
import {
  BlueprintIcons16, BlueprintIcons20, JetBrainsMono, PaperProps, PaperThumbnail, useCounter,
} from "./Post";

/**
 * The social-card page — `/thumbnail`, rendered to an image and never read.
 *
 * It lives here rather than in `Post.tsx` for one reason: its header is a
 * `CanvasContainer`, and that is three.js, react-three-fiber and drei — a
 * three-megabyte dependency reached by exactly this one page. Named inside
 * `Post.tsx` it was named by every paper that imports `Post`, which is all of
 * them, and each of them downloaded a WebGL renderer to draw an article.
 *
 * Nothing about the page changed in moving it. What changed is who pays for it.
 */
export const ThumbnailPage = () => {
  const [params] = useSearchParams();

  const title = params.get('title') ?? 'OrbitMines - Stream';
  const subtitle = params.get('subtitle') ?? '';
  const date = params.get('date') ?? new Date().toISOString().split('T')[0];

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    title,
    subtitle,
    date,
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    organizations: [ORGANIZATIONS.orbitmines_research],
    authors: [{
      ...PROFILES.fadi_shawki,
      external: PROFILES.fadi_shawki.external?.filter((profile) => PLATFORMS.includes(profile.organization.key))
    }],
    draft: false,
    Reference: (props: {}) => (<></>),
    references: referenceCounter,
    header: <CanvasContainer style={{height: '140px', paddingBottom: 0}}>
      <canvas
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/header.png')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </CanvasContainer>
  }

  return <div>
    <PaperThumbnail {...paper}>
      <></>
    </PaperThumbnail>
  </div>
}

export default ThumbnailPage;
