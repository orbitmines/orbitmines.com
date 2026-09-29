import React from 'react';
import {renderMarkdown} from './Markdown';

type Props = {
  source: string;
  className?: string;
};

// Trivial wrapper — the parser already returns sanitized HTML (it escapes
// inline text before assembling tags), so dangerouslySetInnerHTML is safe
// for the content shapes the parser produces.
const Markdown: React.FC<Props> = ({source, className}) => (
  <div className={className} dangerouslySetInnerHTML={{__html: renderMarkdown(source)}} />
);

export default Markdown;
