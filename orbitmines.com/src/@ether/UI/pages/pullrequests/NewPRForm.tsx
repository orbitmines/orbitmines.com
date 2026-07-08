import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import type {PRParams} from '../../router/types';
import {getAPI} from '../../data';
import Header from './Header';
import {ArrowLeftIcon} from '../../icons';
import {buildPullsUrl} from './urls';
import {getName} from '../../storage';

// `/-/pulls/new` — submit goes through the API. With the dummy backend
// it accepts the call but doesn't persist; that lands when there's a real
// server.
const NewPRForm: React.FC<{params: PRParams}> = ({params}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [targetLabel, setTargetLabel] = useState('main');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await getAPI().createPullRequest(
      params.repoPath,
      title.trim(),
      description.trim(),
      sourceLabel.trim() || `${getName()}/branch`,
      targetLabel.trim() || 'main',
      getName(),
    );
    navigate(buildPullsUrl(params));
  };

  return (
    <div className="pr-page">
      <Header params={params} />
      <a
        className="pr-back-link"
        href={buildPullsUrl(params)}
        onClick={(e) => {
          e.preventDefault();
          navigate(buildPullsUrl(params));
        }}
      >
        <ArrowLeftIcon /> Back to pull requests
      </a>

      <h2 style={{fontSize: 16, margin: '8px 0 16px'}}>New Pull Request</h2>

      <form className="pr-form" onSubmit={onSubmit}>
        <label htmlFor="pr-title">Title</label>
        <input
          id="pr-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label htmlFor="pr-source">From</label>
        <input
          id="pr-source"
          type="text"
          value={sourceLabel}
          onChange={(e) => setSourceLabel(e.target.value)}
          placeholder="author/branch"
        />

        <label htmlFor="pr-target">Into</label>
        <input
          id="pr-target"
          type="text"
          value={targetLabel}
          onChange={(e) => setTargetLabel(e.target.value)}
          placeholder="main"
        />

        <label htmlFor="pr-description">Description</label>
        <textarea
          id="pr-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the change…"
        />

        <div className="pr-form-actions">
          <button
            type="submit"
            className="pr-form-btn pr-form-btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Creating…' : 'Create Pull Request'}
          </button>
          <button
            type="button"
            className="pr-form-btn"
            onClick={() => navigate(buildPullsUrl(params))}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPRForm;
