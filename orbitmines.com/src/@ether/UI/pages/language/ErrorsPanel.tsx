import React from 'react';
import classnames from 'classnames';
import type {ProgramError} from './types';

type Props = {
  errors: ProgramError[];
  onSelect: (instanceId: string) => void;
};

const ErrorsPanel: React.FC<Props> = ({errors, onSelect}) => (
  <div className="errors-panel">
    <div className="errors-panel__header">
      <span>Problems</span>
      <span
        className={classnames('errors-panel__count', {
          'errors-panel__count--has': errors.length > 0,
          'errors-panel__count--none': errors.length === 0,
        })}
      >
        {errors.length}
      </span>
    </div>
    {errors.length === 0 ? (
      <div className="errors-panel__none">No problems with the current program.</div>
    ) : (
      errors.map((err, i) => (
        <div
          key={i}
          className="errors-panel__entry"
          onClick={() => onSelect(err.instanceId)}
        >
          <span style={{flexShrink: 0, fontSize: 10, marginTop: 2}}>●</span>
          <span style={{flex: 1}}>{err.message}</span>
        </div>
      ))
    )}
  </div>
);

export default ErrorsPanel;
