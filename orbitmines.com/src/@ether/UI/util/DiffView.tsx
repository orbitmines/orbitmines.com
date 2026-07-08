import React from 'react';
import classnames from 'classnames';
import {computeDiff, DiffLine, pairSideBySide} from './diff';
import './DiffView.scss';

type Props = {
  oldText: string;
  newText: string;
  view?: 'unified' | 'side-by-side';
};

const DiffView: React.FC<Props> = ({oldText, newText, view = 'unified'}) => {
  const lines = React.useMemo(() => computeDiff(oldText, newText), [oldText, newText]);
  return view === 'unified' ? <Unified lines={lines} /> : <SideBySide lines={lines} />;
};

const Unified: React.FC<{lines: DiffLine[]}> = ({lines}) => (
  <div className="ether-diff">
    {lines.map((line, idx) => (
      <div
        key={idx}
        className={classnames('ether-diff__line', {
          'ether-diff__line--add': line.type === 'add',
          'ether-diff__line--remove': line.type === 'remove',
        })}
      >
        <span className="ether-diff__num">{line.oldNum ?? ''}</span>
        <span className="ether-diff__num">{line.newNum ?? ''}</span>
        <span className="ether-diff__prefix">
          {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
        </span>
        <span className="ether-diff__text">{line.text}</span>
      </div>
    ))}
  </div>
);

const SideBySide: React.FC<{lines: DiffLine[]}> = ({lines}) => {
  const rows = React.useMemo(() => pairSideBySide(lines), [lines]);
  return (
    <div className="ether-diff-sbs">
      {rows.map((row, idx) => (
        <div key={idx} className="ether-diff-sbs__row">
          <div
            className={classnames('ether-diff-sbs__cell', {
              'ether-diff-sbs__cell--remove': row.left.type === 'remove',
              'ether-diff-sbs__cell--empty': row.left.type === 'empty',
            })}
          >
            <span className="ether-diff-sbs__num">{row.left.num ?? ''}</span>
            <span>{row.left.text}</span>
          </div>
          <div
            className={classnames('ether-diff-sbs__cell', {
              'ether-diff-sbs__cell--add': row.right.type === 'add',
              'ether-diff-sbs__cell--empty': row.right.type === 'empty',
            })}
          >
            <span className="ether-diff-sbs__num">{row.right.num ?? ''}</span>
            <span>{row.right.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiffView;
