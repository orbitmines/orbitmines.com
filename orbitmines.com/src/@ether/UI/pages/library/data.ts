import type {Entry} from './types';

// PROJECTS dataset — currently a static demo dataset matching the ray
// prototype. The deeper architectural goal is to drive this from the
// EtherAPI; for now we ship the same demo data so the page looks alive.

export const PROJECTS: Entry[] = [
  {
    name: 'Ray',
    language: {name: 'Ray', icon: 'circle'},
    versions: [
      {
        tag: 'v1.0.0',
        children: [
          {
            type: 'file',
            name: 'UUID.ray',
            icon: 'document',
            snippet: 'UUID: UUID("asadasdasdasdasdddaaaaaaaaaaaaa"',
          },
          {
            type: 'libraries',
            count: 10000,
            entries: [
              {name: 'Library', snippet: 'UUID: UUID("asadasdasdasdasdddaaaaaaaaaaaaa"'},
              {
                name: 'Library',
                reference: {name: 'Language'},
                snippet: 'UUID: UUID("asadasdasdasdasdddaaaaaaaaaaaaa"',
              },
            ],
          },
        ],
      },
      {tag: 'v1.0.0', language: 'Set Theory'},
      {tag: 'v0.9.0', language: 'Set Theory'},
      {tag: 'v0.9.0'},
    ],
  },
  {
    name: 'Set Theory',
    language: {name: 'Set Theory', icon: 'circle'},
    versions: [
      {
        tag: 'v2.0.0',
        language: 'Ray',
        children: [
          {
            type: 'library',
            name: 'set.mm',
            snippet: 'UUID: UUID("asadasdasdasdasdddaaaaaaaaaaaaa"',
          },
        ],
      },
      {tag: 'v2.0.0'},
      {
        tag: 'v1.0.0',
        children: [
          {
            type: 'library',
            name: 'set.mm',
            versions: [
              {tag: 'v1.0.0', language: 'Ray'},
              {tag: 'v1.0.0'},
            ],
            snippet: 'UUID: UUID("asadasdasdasdasdddaaaaaaaaaaaaa"',
          },
        ],
      },
      {tag: 'v1.0.0', language: 'Ray'},
    ],
  },
  {
    name: 'UUID',
    language: {name: 'UUID', icon: 'circle'},
    versions: [
      {
        tag: 'v1.0.0',
        language: 'Ray',
        children: [
          {
            type: 'file',
            name: 'UUID.ray',
            library: 'Ray',
            versions: [
              {tag: 'v1.0.0', language: 'Ray'},
              {tag: 'v1.0.0'},
            ],
            snippet: 'UUID: UUID("asadasdasdasdasdddaaaaaaaaaaaaa"',
          },
        ],
      },
      {tag: 'v1.0.0'},
      {tag: 'v0.1.0'},
    ],
  },
];

export interface SocialLink {
  name: string;
  url: string;
  label: string;
}

export const SOCIALS: SocialLink[] = [
  {name: 'Discord', url: 'https://discord.orbitmines.com', label: 'discord.orbitmines.com'},
  {
    name: 'GitHub',
    url: 'https://github.com/orbitmines/ray/tree/main/Ether/library',
    label: 'orbitmines',
  },
];
