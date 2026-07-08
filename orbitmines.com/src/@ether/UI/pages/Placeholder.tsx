import React from 'react';

// Shared placeholder for pages that haven't been ported yet. Renders the
// page name and the parsed route params so we can see routing is wired up
// even before the page itself exists.

type Props = {
  page: string;
  params: unknown;
};

const Placeholder: React.FC<Props> = ({page, params}) => {
  return (
    <div
      style={{
        padding: '60px 24px',
        fontFamily: "'Courier New', Courier, monospace",
        color: 'rgba(255,255,255,0.55)',
      }}
    >
      <h1 style={{color: '#fff', fontSize: 24, marginBottom: 14}}>
        @ether · {page}
      </h1>
      <p style={{marginBottom: 18}}>
        This page hasn't been ported yet. Route params:
      </p>
      <pre
        style={{
          fontSize: 13,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: 14,
          borderRadius: 6,
          overflow: 'auto',
        }}
      >
{JSON.stringify(params, null, 2)}
      </pre>
    </div>
  );
};

export default Placeholder;
