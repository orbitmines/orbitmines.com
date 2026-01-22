import logo from "../../lib/organizations/orbitmines/logo/orbitmines.logo.3000x1000.png";
import orbitmines_icon from "../../lib/organizations/orbitmines/icon/orbitmines.icon.650x650.png";
import minigames_icon from "../../lib/organizations/orbitmines/minecraft/server/icon/orbitmines.minecraft.server.icon.minigames.1000x1000.png";
import creative_icon from "../../lib/organizations/orbitmines/minecraft/server/icon/orbitmines.minecraft.server.icon.creative.1000x1000.png";
import prison_icon from "../../lib/organizations/orbitmines/minecraft/server/icon/orbitmines.minecraft.server.icon.prison.1000x1000.png";
import strangeloop_icon from "../../lib/organizations/strange-loop/strange_loop_logo_final_color_no_year_square2.png";
import semf_icon from "../../lib/organizations/semf/semf_icon.jpg";
import ursprung_icon from "../../lib/organizations/ursprung/ursprung_icon.png";
import webassembly_icon from "../../lib/organizations/wasm/webassembly-icon.png";
import topos_institute_icon from "././topos.institute/topos_favicon.ico";
import mindscape_icon from "././preposterous-universe/download.jpeg";
import criticalthinking_icon from "././critical-thinking/https___s3.us-west-1.amazonaws.com_redwood-labs_showpage_uploads_images_403b35d6-ec76-4cd9-a70d-bd1c5d825460.png";
import hoc_icon from "././hoc/92327702.png";
import mlst_icon from "././mlst/channels4_profile.jpg";
import ngi_icon from "././ngi/Logo-NGI_Icon-circle-NGI-rgb.png";
import santa_fe_icon from "././santa-fe-institute/0_OgRM7UU-SsqK46La.png";
import papers_we_love_icon from "././papers-we-love/6187757.png";
import wolfram_institute_icon from "././wolfram-institute/channels4_profile.jpg";
import tinycorp_icon from "././tinycorp/132956020.jpeg";
import lex_fridman_podcast_icon from "././lexfridman-podcast/download.jpeg";
import _3b1b_icon from "././3b1b/3B1B_Logo.svg.png";
import akissinger_icon from "././akissinger/881183.png";
import wolfram_icon from "././wolfram-research/logo.png";
import all_in_icon from "././all-in/icon.jpeg";
import zx_calculus_icon from "././zx/icon.png";
import active_inference_institute_icon from "././active-inference-institute/channels4_profile.jpg";
import toe_icon from "././toe/toe.jpg";
import syco_icon from "././syco/logo.png";
import cool_worlds_podcast_icon from "././cool_worlds/channels4_profile.jpg";
import demystifysci_icon from "././demystifysci/channels4_profile.jpg";
import {ReferenceProps, Renderable} from "../post/Post";
import {ReactNode} from "react";

export type SVG = {
  viewBox: {
    width: number,
    height: number,
  },
  paths: string[];
}

export type TOrganization<TKey = string> = {
  key: TKey,
  name: string,
  assets: {
    logo?: any,
    icon?: SVG,
    icon_png?: any
  }
  profile?: Partial<TProfile>,
}

export type ExternalProfile<TKey = string> = {
  organization: TOrganization<TKey>;
  display?: string;
  link: string;
}

export type ExternalProfiles = ExternalProfile[];
export enum Viewed {
  FOUND, IN_PROGRESS, VIEWED
}

export type Content = {
  status: Viewed,
  reference: ReferenceProps,
  archived?: boolean,
  found_at?: string,
  viewed_at?: string,
  description?: string
}

export type TProfile = {
  first_name?: string,
  last_name?: string,
  name: string,
  formal_citation_name?: string,

  date?: string,

  profile?: string,
  email?: string,

  picture?: string,

  orcid?: string,

  title?: Renderable<string | ReactNode>
  subtitle?: Renderable<string>,

  reference?: {
    title?: Renderable<string>
    subtitle?: Renderable<string>,
  }

  external?: ExternalProfiles,

  content?: {
    history?: Content[]
    formal_education?: Content[]
    attended_events?: Content[],
  }

};


const ORGANIZATIONS = {
  orbitmines_research: <TOrganization>{
    key: 'orbitmines-research',
    name: "OrbitMines Research",
    assets: {
      logo: logo,
      icon_png: orbitmines_icon,
    },
  },
  orbitmines_minecraft_prison: <TOrganization>{key: 'orbitmines-minecraft-prison', name: "", assets: {icon_png: prison_icon,},},
  orbitmines_minecraft_creative: <TOrganization>{key: 'orbitmines-minecraft-creative', name: "", assets: {icon_png: creative_icon,},},
  orbitmines_minecraft_minigames: <TOrganization>{key: 'orbitmines-minecraft-minigames', name: "", assets: {icon_png: minigames_icon,},},
  demystifysci: <TOrganization>{
    key: 'demystifysci',
    name: "demystifysci",
    assets: {
      icon_png: demystifysci_icon,
    }
  },
  cool_worlds_podcast: <TOrganization>{
    key: 'cool_worlds_podcast',
    name: "cool_worlds_podcast",
    assets: {
      icon_png: cool_worlds_podcast_icon,
    }
  },
  syco: <TOrganization>{
    key: 'syco',
    name: "syco",
    assets: {
      icon_png: syco_icon,
    }
  },
  toe: <TOrganization>{
    key: 'toe',
    name: "toe",
    assets: {
      icon_png: toe_icon,
    }
  },
  active_inference_institute: <TOrganization>{
    key: 'active_inference_institute',
    name: "active_inference_institute",
    assets: {
      icon_png: active_inference_institute_icon,
    }
  },
  all_in: <TOrganization>{
    key: 'all_in',
    name: "all_in",
    assets: {
      icon_png: all_in_icon,
    }
  },
  zx_calculus: <TOrganization>{
    key: 'zx_calculus',
    name: "zx_calculus",
    assets: {
      icon_png: zx_calculus_icon,
    }
  },
  wolfram: <TOrganization>{
    key: 'wolfram',
    name: "wolfram",
    assets: {
      icon_png: wolfram_icon,
    }
  },
  lex_fridman_podcast: <TOrganization>{
    key: 'lex_fridman_podcast',
    name: "lex_fridman_podcast",
    assets: {
      logo: logo,
      icon_png: lex_fridman_podcast_icon,
    }
  },
  tinycorp: <TOrganization>{
    key: 'tinycorp',
    name: "tinycorp",
    assets: {
      logo: logo,
      icon_png: tinycorp_icon,
    }
  },
  '3b1b': <TOrganization>{
    key: '3b1b',
    name: "3b1b",
    assets: {
      logo: logo,
      icon_png: _3b1b_icon,
    }
  },
  chyp: <TOrganization>{
    key: 'chypr',
    name: "chyp",
    assets: {
      logo: akissinger_icon,
      icon_png: akissinger_icon,
    }
  },
  ursprung: <TOrganization>{
    key: 'ursprung',
    name: "Ursprung",
    assets: {
      icon_png: ursprung_icon,
    }
  },
  semf: <TOrganization>{
    key: 'semf',
    name: "SEMF",
    assets: {
      logo: logo,
      icon_png: semf_icon,
    }
  },
  ngi: <TOrganization>{
    key: 'ngi',
    name: "NGI",
    assets: {
      icon_png: ngi_icon,
    }
  },
  strangeloop: <TOrganization>{
    key: 'strangeloop',
    name: "Strange Loop",
    assets: {
      icon_png: strangeloop_icon,
    }
  },
  wasm: <TOrganization>{
    key: 'wasm',
    name: "WebAssembly",
    assets: {
      icon_png: webassembly_icon,
    }
  },
  topos_institute: <TOrganization>{
    key: 'topos_institute',
    name: "Topos Institute",
    assets: {
      icon_png: topos_institute_icon,
    }
  },
  mlst: <TOrganization>{
    key: 'mlst',
    name: "MLST",
    assets: {
      icon_png: mlst_icon,
    }
  },
  hoc: <TOrganization>{
    key: 'hoc',
    name: "Higher Order Company",
    assets: {
      icon_png: hoc_icon,
    }
  },
  mindscape: <TOrganization>{
    key: 'mindscape',
    name: "Mindscape",
    assets: {
      icon_png: mindscape_icon,
    }
  },
  preposterous_universe: <TOrganization>{
    key: 'preposterous_universe',
    name: "Preposterous Universe",
    assets: {
      icon_png: mindscape_icon,
    }
  },
  criticalthinkingpodcast: <TOrganization>{
    key: 'criticalthinkingpodcast',
    name: "Critical Thinking Podcast",
    assets: {
      icon_png: criticalthinking_icon,
    }
  },
  santa_fe_institute: <TOrganization>{
    key: 'santa_fe_institute',
    name: "Santa Fe Institute",
    assets: {
      icon_png: santa_fe_icon,
    }
  },
  papers_we_love: <TOrganization>{
    key: 'papers_we_love',
    name: "Papers we love",
    assets: {
      icon_png: papers_we_love_icon,
    }
  },
  wolfram_institute: <TOrganization>{
    key: 'wolfram_institute',
    name: "Wolfram Institute",
    assets: {
      icon_png: wolfram_institute_icon,
    }
  },
  github: <TOrganization>{
    key: 'github',
    name: 'GitHub',
    assets: {
      icon: {
        viewBox: {
          width: 98,
          height: 96,
        },
        paths: ["M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"]
      }
    }
  },
  orcid: <TOrganization>{
    key: 'orcid',
    name: 'ORCID',
    assets: {
      icon: {
        viewBox: {
          width: 256,
          height: 256,
        },
        paths: ["M128 256C198.7 256 256 198.7 256 128C256 57.3 198.7 0 128 0C57.3 0 0 57.3 0 128C0 198.7 57.3 256 128 256ZM70.9 186.2H86.3V127.5V79.0999H70.9V186.2ZM108.9 79.0999H150.5C190.1 79.0999 207.5 107.4 207.5 132.7C207.5 160.2 186 186.3 150.7 186.3H108.9V79.0999ZM124.3 172.4H148.8C183.7 172.4 191.7 145.9 191.7 132.7C191.7 111.2 178 93 148 93H124.3V172.4ZM78.6 66.8999C84.2 66.8999 88.7 62.2999 88.7 56.7999C88.7 51.2999 84.2 46.7 78.6 46.7C73 46.7 68.5 51.2 68.5 56.7999C68.5 62.2999 73 66.8999 78.6 66.8999Z"]
      }
    }
  },
  youtube: <TOrganization>{
    key: 'youtube',
    name: 'YouTube',
    assets: {
      icon: {
        viewBox: {
          width: 512,
          height: 360.726,
        },
        paths: ["M456.035 10.769c22.031 5.926 39.377 23.386 45.265 45.56C512 96.516 512 180.363 512 180.363s0 83.846-10.7 124.037c-5.888 22.17-23.234 39.631-45.265 45.559-39.928 10.767-200.034 10.767-200.034 10.767s-160.107 0-200.035-10.767C33.937 344.031 16.587 326.57 10.7 304.4 0 264.209 0 180.363 0 180.363S0 96.516 10.7 56.329c5.887-22.174 23.237-39.634 45.266-45.56C95.894 0 256.001 0 256.001 0s160.106 0 200.034 10.769zm-252.398 245.72l133.818-76.122-133.818-76.131v152.253z"]
      }
    }
  },
  twitch: <TOrganization>{
    key: 'twitch',
    name: 'Twitch',
    assets: {
      icon: {
        viewBox: {
          width: 439,
          height: 512.165,
        },
        paths: ["M402.415 237.791l-73.166 73.166h-73.166l-64.021 64.021v-64.021H109.75V36.584h292.665v201.207zM91.458 0L0 91.456v329.251h109.75v91.458l91.458-91.458h73.167L439 256.083V0H91.458z", "M310.958 210.354h36.583v-109.75h-36.583zM210.354 210.354h36.583v-109.75h-36.583z"]
      }
    }
  },

  twitter: <TOrganization>{
    key: 'twitter',
    name: 'Twitter',
    assets: {
      icon: {
        viewBox: {
          // width: 248,
          // height: 204,
          width: 1200,
          height: 1227,
        },
        // paths: ["M221.95,51.29c0.15,2.17,0.15,4.34,0.15,6.53c0,66.73-50.8,143.69-143.69,143.69v-0.04C50.97,201.51,24.1,193.65,1,178.83c3.99,0.48,8,0.72,12.02,0.73c22.74,0.02,44.83-7.61,62.72-21.66c-21.61-0.41-40.56-14.5-47.18-35.07c7.57,1.46,15.37,1.16,22.8-0.87C27.8,117.2,10.85,96.5,10.85,72.46c0-0.22,0-0.43,0-0.64c7.02,3.91,14.88,6.08,22.92,6.32C11.58,63.31,4.74,33.79,18.14,10.71c25.64,31.55,63.47,50.73,104.08,52.76c-4.07-17.54,1.49-35.92,14.61-48.25c20.34-19.12,52.33-18.14,71.45,2.19c11.31-2.23,22.15-6.38,32.07-12.26c-3.77,11.69-11.66,21.62-22.2,27.93c10.01-1.18,19.79-3.86,29-7.95C240.37,35.29,231.83,44.14,221.95,51.29z"]
        paths: ["M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"]
      }
    }
  },

  gitlab: <TOrganization>{
    key: 'gitlab',
    name: 'Gitlab',
    assets: {
      icon: {
        viewBox: {
          width: 380,
          height: 380,
        },
        paths: ["M282.83,170.73l-.27-.69-26.14-68.22a6.81,6.81,0,0,0-2.69-3.24,7,7,0,0,0-8,.43,7,7,0,0,0-2.32,3.52l-17.65,54H154.29l-17.65-54A6.86,6.86,0,0,0,134.32,99a7,7,0,0,0-8-.43,6.87,6.87,0,0,0-2.69,3.24L97.44,170l-.26.69a48.54,48.54,0,0,0,16.1,56.1l.09.07.24.17,39.82,29.82,19.7,14.91,12,9.06a8.07,8.07,0,0,0,9.76,0l12-9.06,19.7-14.91,40.06-30,.1-.08A48.56,48.56,0,0,0,282.83,170.73Z"]
      }
    }
  },

  fission: <TOrganization>{
    key: 'fission',
    name: 'Fission',
    assets: {
      icon: {
        viewBox: {
          width: 89,
          height: 88,
        },
        paths: ["M52.5304 49.8364C48.2792 47.8478 45.3747 47.0707 45.3747 47.0707C45.607 46.4253 46.1227 44.8392 46.5548 43.51C46.7425 42.9329 46.9145 42.404 47.0405 42.0218C48.3732 42.2743 49.7892 42.4426 51.2051 42.5267C56.4525 42.9475 60.4505 41.9377 63.0326 39.5816C65.5313 37.2254 66.1143 34.0279 66.1143 31.84C66.1143 26.5387 61.8665 22.1631 56.5358 22.1631C54.9412 22.1631 52.7575 22.5219 50.3813 24.4133C48.1294 26.2057 46.6178 30.9029 45.1232 35.5469C45.0407 35.8032 44.9583 36.0594 44.8758 36.3149C42.4966 35.674 40.2676 34.7141 38.4061 33.6068C38.4279 33.368 38.4391 33.1261 38.4391 32.8816C38.4391 28.5416 34.9208 25.0233 30.5807 25.0233C26.2407 25.0233 22.7224 28.5416 22.7224 32.8816C22.7224 37.2216 26.2407 40.7399 30.5807 40.7399C32.6746 40.7399 34.5772 39.921 35.9857 38.586C38.1851 39.7174 40.6184 40.6102 43.2091 41.2645C42.9768 41.9099 42.4611 43.4961 42.0289 44.8253C41.8413 45.4025 41.6694 45.9312 41.5433 46.3134C40.2106 46.0609 38.7947 45.8926 37.3787 45.8085C32.1313 45.3877 28.1333 46.3975 25.5513 48.7536C23.0525 51.1097 22.4695 54.3073 22.4695 56.4952C22.4695 61.7965 26.7174 66.1721 32.048 66.1721C34.1199 66.1721 35.5302 65.9238 37.6882 64.2467C40.3816 62.1536 42.0124 57.2315 43.5792 52.5026L43.7387 52.0213C46.1335 52.6665 48.2938 53.9 50.1558 55.0385C50.1478 55.1836 50.1438 55.3297 50.1438 55.4768C50.1438 59.8168 53.6621 63.3351 58.0021 63.3351C62.3421 63.3351 65.8604 59.8168 65.8604 55.4768C65.8604 51.1368 62.3421 47.6185 58.0021 47.6185C55.875 47.6185 53.9453 48.4636 52.5304 49.8364ZM61.45 35.2059C58.667 38.158 52.9051 37.9637 48.6538 37.1672C48.7565 36.8653 48.88 36.4802 49.0235 36.0324C50.3194 31.9901 53.2562 22.8291 57.452 23.4253C60.2839 24.0143 62.2829 29.1473 62.5328 31.0827C62.6994 32.8498 62.3662 34.1961 61.45 35.2059ZM26.9672 53.0451C29.6793 50.134 36.2852 50.3746 39.9429 51.1958C39.8741 51.3897 39.7948 51.6178 39.7054 51.8747C38.3979 55.6333 34.9459 65.5566 30.9652 64.8258C28.1333 64.2367 26.1343 59.1037 25.8844 57.1683C25.7179 55.4013 26.051 54.0549 26.9672 53.0451Z"]
      }
    }
  },

  instagram: <TOrganization>{
    key: 'instagram',
    name: 'Instagram',
    assets: {
      icon: {
        viewBox: {
          width: 1000,
          height: 1000,
        },
        paths: ["M295.42,6c-53.2,2.51-89.53,11-121.29,23.48-32.87,12.81-60.73,30-88.45,57.82S40.89,143,28.17,175.92c-12.31,31.83-20.65,68.19-23,121.42S2.3,367.68,2.56,503.46,3.42,656.26,6,709.6c2.54,53.19,11,89.51,23.48,121.28,12.83,32.87,30,60.72,57.83,88.45S143,964.09,176,976.83c31.8,12.29,68.17,20.67,121.39,23s70.35,2.87,206.09,2.61,152.83-.86,206.16-3.39S799.1,988,830.88,975.58c32.87-12.86,60.74-30,88.45-57.84S964.1,862,976.81,829.06c12.32-31.8,20.69-68.17,23-121.35,2.33-53.37,2.88-70.41,2.62-206.17s-.87-152.78-3.4-206.1-11-89.53-23.47-121.32c-12.85-32.87-30-60.7-57.82-88.45S862,40.87,829.07,28.19c-31.82-12.31-68.17-20.7-121.39-23S637.33,2.3,501.54,2.56,348.75,3.4,295.42,6m5.84,903.88c-48.75-2.12-75.22-10.22-92.86-17-23.36-9-40-19.88-57.58-37.29s-28.38-34.11-37.5-57.42c-6.85-17.64-15.1-44.08-17.38-92.83-2.48-52.69-3-68.51-3.29-202s.22-149.29,2.53-202c2.08-48.71,10.23-75.21,17-92.84,9-23.39,19.84-40,37.29-57.57s34.1-28.39,57.43-37.51c17.62-6.88,44.06-15.06,92.79-17.38,52.73-2.5,68.53-3,202-3.29s149.31.21,202.06,2.53c48.71,2.12,75.22,10.19,92.83,17,23.37,9,40,19.81,57.57,37.29s28.4,34.07,37.52,57.45c6.89,17.57,15.07,44,17.37,92.76,2.51,52.73,3.08,68.54,3.32,202s-.23,149.31-2.54,202c-2.13,48.75-10.21,75.23-17,92.89-9,23.35-19.85,40-37.31,57.56s-34.09,28.38-57.43,37.5c-17.6,6.87-44.07,15.07-92.76,17.39-52.73,2.48-68.53,3-202.05,3.29s-149.27-.25-202-2.53m407.6-674.61a60,60,0,1,0,59.88-60.1,60,60,0,0,0-59.88,60.1M245.77,503c.28,141.8,115.44,256.49,257.21,256.22S759.52,643.8,759.25,502,643.79,245.48,502,245.76,245.5,361.22,245.77,503m90.06-.18a166.67,166.67,0,1,1,167,166.34,166.65,166.65,0,0,1-167-166.34"]
      }
    }
  },

  ipfs: <TOrganization>{
    key: 'ipfs',
    name: 'IPFS',
    assets: {
      icon: {
        viewBox: {
          width: 24,
          height: 24,
        },
        paths: ["M12 0L1.608 6v12L12 24l10.392-6V6zm-1.073 1.445h.001a1.8 1.8 0 002.138 0l7.534 4.35a1.794 1.794 0 000 .403l-7.535 4.35a1.8 1.8 0 00-2.137 0l-7.536-4.35a1.795 1.795 0 000-.402zM21.324 7.4c.109.08.226.147.349.201v8.7a1.8 1.8 0 00-1.069 1.852l-7.535 4.35a1.8 1.8 0 00-.349-.2l-.009-8.653a1.8 1.8 0 001.07-1.851zm-18.648.048l7.535 4.35a1.8 1.8 0 001.069 1.852v8.7c-.124.054-.24.122-.349.202l-7.535-4.35a1.8 1.8 0 00-1.069-1.852v-8.7c.124-.054.24-.122.35-.202z"]
      }
    }
  },

  mastodon: <TOrganization>{
    key: 'mastodon',
    name: 'Mastodon',
    assets: {
      icon: {
        viewBox: {
          width: 74,
          height: 79,
        },
        paths: ["M73.7014 17.4323C72.5616 9.05152 65.1774 2.4469 56.424 1.1671C54.9472 0.950843 49.3518 0.163818 36.3901 0.163818H36.2933C23.3281 0.163818 20.5465 0.950843 19.0697 1.1671C10.56 2.41145 2.78877 8.34604 0.903306 16.826C-0.00357854 21.0022 -0.100361 25.6322 0.068112 29.8793C0.308275 35.9699 0.354874 42.0498 0.91406 48.1156C1.30064 52.1448 1.97502 56.1419 2.93215 60.0769C4.72441 67.3445 11.9795 73.3925 19.0876 75.86C26.6979 78.4332 34.8821 78.8603 42.724 77.0937C43.5866 76.8952 44.4398 76.6647 45.2833 76.4024C47.1867 75.8033 49.4199 75.1332 51.0616 73.9562C51.0841 73.9397 51.1026 73.9184 51.1156 73.8938C51.1286 73.8693 51.1359 73.8421 51.1368 73.8144V67.9366C51.1364 67.9107 51.1302 67.8852 51.1186 67.862C51.1069 67.8388 51.0902 67.8184 51.0695 67.8025C51.0489 67.7865 51.0249 67.7753 50.9994 67.7696C50.9738 67.764 50.9473 67.7641 50.9218 67.7699C45.8976 68.9569 40.7491 69.5519 35.5836 69.5425C26.694 69.5425 24.3031 65.3699 23.6184 63.6327C23.0681 62.1314 22.7186 60.5654 22.5789 58.9744C22.5775 58.9477 22.5825 58.921 22.5934 58.8965C22.6043 58.8721 22.621 58.8505 22.6419 58.8336C22.6629 58.8167 22.6876 58.8049 22.714 58.7992C22.7404 58.7934 22.7678 58.794 22.794 58.8007C27.7345 59.9796 32.799 60.5746 37.8813 60.5733C39.1036 60.5733 40.3223 60.5733 41.5447 60.5414C46.6562 60.3996 52.0437 60.1408 57.0728 59.1694C57.1983 59.1446 57.3237 59.1233 57.4313 59.0914C65.3638 57.5847 72.9128 52.8555 73.6799 40.8799C73.7086 40.4084 73.7803 35.9415 73.7803 35.4523C73.7839 33.7896 74.3216 23.6576 73.7014 17.4323ZM61.4925 47.3144H53.1514V27.107C53.1514 22.8528 51.3591 20.6832 47.7136 20.6832C43.7061 20.6832 41.6988 23.2499 41.6988 28.3194V39.3803H33.4078V28.3194C33.4078 23.2499 31.3969 20.6832 27.3894 20.6832C23.7654 20.6832 21.9552 22.8528 21.9516 27.107V47.3144H13.6176V26.4937C13.6176 22.2395 14.7157 18.8598 16.9118 16.3545C19.1772 13.8552 22.1488 12.5719 25.8373 12.5719C30.1064 12.5719 33.3325 14.1955 35.4832 17.4394L37.5587 20.8853L39.6377 17.4394C41.7884 14.1955 45.0145 12.5719 49.2765 12.5719C52.9614 12.5719 55.9329 13.8552 58.2055 16.3545C60.4017 18.8574 61.4997 22.2371 61.4997 26.4937L61.4925 47.3144Z"]
      }
    }
  },

  facebook: <TOrganization>{
    key: 'facebook',
    name: 'Facebook',
    assets: {
      icon: {
        viewBox: {
          width: 50,
          height: 50,
        },
        paths: ["M25,3C12.85,3,3,12.85,3,25c0,11.03,8.125,20.137,18.712,21.728V30.831h-5.443v-5.783h5.443v-3.848 c0-6.371,3.104-9.168,8.399-9.168c2.536,0,3.877,0.188,4.512,0.274v5.048h-3.612c-2.248,0-3.033,2.131-3.033,4.533v3.161h6.588 l-0.894,5.783h-5.694v15.944C38.716,45.318,47,36.137,47,25C47,12.85,37.15,3,25,3z"]
      }
    }
  },

  linkedin: <TOrganization>{
    key: 'linkedin',
    name: 'LinkedIn',
    assets: {
      icon: {
        viewBox: {
          width: 455,
          height: 455,
        },
        paths: ["M0,0v455h455V0H0z M141.522,378.002H74.016V174.906h67.506V378.002zM107.769,147.186h-0.446C84.678,147.186,70,131.585,70,112.085c0-19.928,15.107-35.087,38.211-35.087c23.109,0,37.31,15.159,37.752,35.087C145.963,131.585,131.32,147.186,107.769,147.186z M385,378.002h-67.524V269.345c0-27.291-9.756-45.92-34.195-45.92c-18.664,0-29.755,12.543-34.641,24.693c-1.776,4.34-2.24,10.373-2.24,16.459v113.426h-67.537c0,0,0.905-184.043,0-203.096H246.4v28.779c8.973-13.807,24.986-33.547,60.856-33.547c44.437,0,77.744,29.02,77.744,91.398V378.002z"]
      }
    }
  },

  nixos: <TOrganization>{
    key: 'nixos',
    name: 'NixOS',
    assets: {
      icon: {
        viewBox: {
          width: 60,
          height: 60,
        },
        paths: [
          "M23.58 20.214L8.964 45.528 5.55 39.743l3.94-6.78-7.823-.02L0 30.052l1.703-2.956 11.135.035 4.002-6.9zM24.7 40.45h29.23l-3.302 5.85-7.84-.022 3.894 6.785-1.67 2.9-3.412.004-5.537-9.66-7.976-.016zm17.014-11.092L27.1 4.043l6.716-.063 3.902 6.8 3.93-6.765 3.337.002 1.7 2.953-5.598 9.626 3.974 6.916z",
          "M35.28 19.486l-29.23-.002 3.303-5.848 7.84.022L13.3 6.873l1.67-2.9 3.412-.004 5.537 9.66 7.976.016zm1.14 20.294l14.616-25.313 3.413 5.785-3.94 6.78 7.823.02 1.668 2.9-1.703 2.956-11.135-.035-4.002 6.9z",
          "M18.305 30.642L32.92 55.956l-6.716.063-3.902-6.8-3.93 6.765-3.337-.002-1.71-2.953 5.598-9.626-3.974-6.916z"
        ]
      }
    }
  },

  discord: <TOrganization>{
    key: 'discord',
    name: 'Discord',
    assets: {
      icon: {
        viewBox: {
          width: 127.14,
          height: 96.36,
        },
        paths: ["M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"]
      }
    }
  },

}

ORGANIZATIONS.orbitmines_research.profile = {
  email: 'fadi.shawki@orbitmines.com',
  external: <ExternalProfile[]>[
    { organization: ORGANIZATIONS.discord, display: 'discord.orbitmines.com', link: 'https://discord.orbitmines.com' },
    { organization: ORGANIZATIONS.github, display: 'orbitmines', link: 'https://github.com/orbitmines' },
    { organization: ORGANIZATIONS.twitter, display: '@OrbitMines', link: 'https://twitter.com/OrbitMines' },
    { organization: ORGANIZATIONS.instagram, display: '@orbitmines', link: 'https://www.instagram.com/orbitmines/' },
    { organization: ORGANIZATIONS.youtube, display: '@OrbitMines', link: 'https://www.youtube.com/@OrbitMines' },
    { organization: ORGANIZATIONS.twitch, display: '@orbitmines', link: 'https://www.twitch.tv/orbitmines' },
    { organization: ORGANIZATIONS.linkedin, display: 'orbitmines', link: 'https://www.linkedin.com/company/orbitmines/' },
    { organization: ORGANIZATIONS.gitlab, display: '@orbitmines', link: 'https://gitlab.com/orbitmines' },
    { organization: ORGANIZATIONS.mastodon, display: '@orbitmines', link: 'https://mastodon.orbitmines.com/@orbitmines' },
    { organization: ORGANIZATIONS.facebook, display: 'OrbitMines', link: 'https://www.facebook.com/profile.php?id=61550528503885' },
  ]
}

export const PLATFORMS = [
  ORGANIZATIONS.github.key,
  ORGANIZATIONS.twitter.key,
  ORGANIZATIONS.discord.key,
  ORGANIZATIONS.linkedin.key,
  ORGANIZATIONS.orcid.key,
  ORGANIZATIONS.instagram.key,
  ORGANIZATIONS.youtube.key,
  ORGANIZATIONS.twitch.key,
  // ORGANIZATIONS.mastodon.key,
  ORGANIZATIONS.facebook.key,
]

export default ORGANIZATIONS;