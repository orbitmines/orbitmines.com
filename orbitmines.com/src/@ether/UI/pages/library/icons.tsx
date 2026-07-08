import React from 'react';

// Library-specific glyphs. Tiny inline SVGs — kept here rather than in the
// shared icons/ folder because they're only used by the Library page.

type P = {className?: string};

export const Circle: React.FC<P & {size?: number}> = ({className, size = 14}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <circle cx="8" cy="8" r="6" />
  </svg>
);

export const Document: React.FC<P> = ({className}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M4 1h5.5L13 4.5V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm5 1v3h3L9 2z" />
  </svg>
);

export const Repo: React.FC<P> = ({className}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8zM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2z" />
  </svg>
);

export const Settings: React.FC<P> = ({className}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M8 0a8.2 8.2 0 0 1 .701.031C8.936-.019 9.111 0 9.291 0l.214.006A1 1 0 0 1 10.39.87l.372 1.01a6.05 6.05 0 0 1 1.01.585l1.063-.23a1 1 0 0 1 1.001.394 8.08 8.08 0 0 1 .779 1.352 1 1 0 0 1-.238 1.118l-.691.78a6.123 6.123 0 0 1 0 1.17l.69.782a1 1 0 0 1 .239 1.117 8.09 8.09 0 0 1-.78 1.352 1 1 0 0 1-1 .394l-1.063-.23c-.32.228-.66.426-1.01.585l-.372 1.01a1 1 0 0 1-.885.594l-.214.006c-.18 0-.356.02-.53-.031A8.154 8.154 0 0 1 8 16a8.2 8.2 0 0 1-.701-.031c-.234.051-.41.031-.59.031l-.214-.006a1 1 0 0 1-.884-.594l-.372-1.01a6.05 6.05 0 0 1-1.01-.585l-1.064.23a1 1 0 0 1-1-.394 8.09 8.09 0 0 1-.78-1.352 1 1 0 0 1 .238-1.117l.69-.783a6.123 6.123 0 0 1 0-1.17l-.69-.78A1 1 0 0 1 1.394 7.9a8.08 8.08 0 0 1 .78-1.352 1 1 0 0 1 1-.394l1.063.23c.32-.228.66-.426 1.01-.585l.372-1.01A1 1 0 0 1 6.496.194L6.709.188c.18 0 .356-.019.53.031A8.154 8.154 0 0 1 8 0zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </svg>
);

export const Branch: React.FC<P> = ({className}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="12"
    height="12"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6A2.5 2.5 0 0 1 3.5 6v-.628a2.25 2.25 0 1 1 1.5 0V6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25zM11 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM5 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM3.5 10.878a2.25 2.25 0 1 1 1.5 0V13.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.622a2.25 2.25 0 1 1 1.5 0V13.5a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5zM5 12a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" />
  </svg>
);

export const CaretDown: React.FC<P> = ({className}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="10"
    height="10"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427z" />
  </svg>
);

export const Add: React.FC<P> = ({className}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="#3fb950"
    className={className}
    aria-hidden
  >
    <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z" />
  </svg>
);

export const Edit: React.FC<P> = ({className}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zM12.24 2.854L3.832 11.264l-.56 1.96 1.96-.56L13.64 4.266 12.24 2.854z" />
  </svg>
);

export const ArrowLeft: React.FC<P> = ({className}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06z" />
  </svg>
);

export function iconForName(name?: string): React.ReactNode {
  switch (name) {
    case 'document':
      return <Document />;
    case 'git-repo':
      return <Repo />;
    case 'settings':
      return <Settings />;
    case 'circle':
    default:
      return <Circle />;
  }
}

export function iconSmallForName(_name?: string): React.ReactNode {
  return <Circle size={10} />;
}
