import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import classnames from 'classnames';
import type {SettingsParams} from '../../router/types';
import {loadSettings, saveSettings} from './storage';
import type {
  BillingPeriod,
  CloudProvider,
  CloudRegion,
  SettingsState,
  UsageTreeNode,
} from './types';
import {CURRENCIES, createUsageTree, gcFilterRegions} from './data';
import {
  computeOperationCosts,
  computeTotalCostMonthly,
  findCurrency,
  formatBytes,
  formatCost,
  getActiveRegion,
  nodeStorageCostMonthly,
  periodLabel,
  processingNodeCost,
} from './calc';
import './Settings.scss';

// Static SVG icons. Tiny inline JSX — we don't reuse them outside Settings.

const ArrowLeft = () => (
  <svg viewBox="0 0 640 640" aria-hidden>
    <path
      d="M512 320L128 320M128 320L288 160M128 320L288 480"
      fill="none"
      stroke="currentColor"
      strokeWidth="48"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 640 640" aria-hidden>
    <path
      d="M128 240l192 192 192-192"
      fill="none"
      stroke="currentColor"
      strokeWidth="48"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 640 640" aria-hidden>
    <path
      d="M240 128l192 192-192 192"
      fill="none"
      stroke="currentColor"
      strokeWidth="48"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StorageIcon = () => (
  <svg viewBox="0 0 640 640" aria-hidden>
    <path d="M128 128h384v96H128zm0 144h384v96H128zm0 144h384v96H128zM176 176c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zm0 144c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zm0 144c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24z" />
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 640 640" aria-hidden>
    <path d="M320 96c-123.7 0-224 100.3-224 224s100.3 224 224 224 224-100.3 224-224S443.7 96 320 96zm0 400c-97.2 0-176-78.8-176-176S222.8 144 320 144s176 78.8 176 176-78.8 176-176 176zm-160-192h320v32H160v-32zm144-128v384h32V176h-32z" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 640 640" aria-hidden>
    <path d="M128 128c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V240c0-35.3-28.7-64-64-64H336l-48-48H128z" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 640 640" aria-hidden>
    <path d="M384 64H192c-35.3 0-64 28.7-64 64v384c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V192L384 64zm0 64l128 128H384V128zM224 288h192v32H224v-32zm0 64h192v32H224v-32zm0 64h128v32H224v-32z" />
  </svg>
);

const InfinityIcon = () => (
  <svg viewBox="0 0 640 640" aria-hidden>
    <path d="M480 200c-66.3 0-120 53.7-120 120 0 0-40-120-120-120S120 253.7 120 320s53.7 120 120 120c80 0 120-120 120-120s53.7 120 120 120 120-53.7 120-120-53.7-120-120-120zM240 392c-39.8 0-72-32.2-72-72s32.2-72 72-72c39.8 0 72 72 72 72s-32.2 72-72 72zm240 0c-39.8 0-72-72-72-72s32.2-72 72-72c39.8 0 72 32.2 72 72s-32.2 72-72 72z" />
  </svg>
);

const opCategoryIcon = (icon: 'clone' | 'explorer' | 'search') => {
  switch (icon) {
    case 'clone': return <FileIcon />;
    case 'explorer': return <FolderIcon />;
    case 'search': return <FileIcon />;
  }
};

const opSubIcon = (icon: 'network' | 'disk-read' | 'disk-write') => {
  return <NetworkIcon />;
};

// ---- Container component ----

type Props = {
  params: SettingsParams;
};

const Settings: React.FC<Props> = ({params}) => {
  const navigate = useNavigate();
  const [state, setState] = useState<SettingsState>(() => loadSettings());

  useEffect(() => saveSettings(state), [state]);

  const update = useCallback(
    (mut: (s: SettingsState) => SettingsState) => setState((s) => mut(s)),
    [],
  );

  const setPeriod = (p: BillingPeriod) => update((s) => ({...s, billingPeriod: p}));
  const setCurrency = (code: string) => update((s) => ({...s, currencyCode: code}));
  const toggleProvider = (id: string) =>
    update((s) => ({
      ...s,
      providers: s.providers.map((p) => (p.id === id ? {...p, enabled: !p.enabled} : p)),
    }));
  const setRegion = (id: string, region: string) =>
    update((s) => ({
      ...s,
      providers: s.providers.map((p) => (p.id === id ? {...p, selectedRegion: region} : p)),
    }));
  const setGcType = (type: 'single' | 'dual' | 'multi') =>
    update((s) => ({
      ...s,
      providers: s.providers.map((p) => {
        if (p.id !== 'gcloud') return p;
        const filtered = gcFilterRegions(p.regions, type);
        return {
          ...p,
          gcRegionType: type,
          selectedRegion: filtered[0]?.id ?? p.selectedRegion,
        };
      }),
    }));

  const backUrl = useMemo(() => {
    const pathPart = params.path.length > 0 ? '/' + params.path.join('/') : '';
    return `${params.base}${pathPart}`;
  }, [params]);

  return (
    <div className="settings-page">
      <a
        href={backUrl}
        className="settings-back-link"
        onClick={(e) => {
          e.preventDefault();
          navigate(backUrl);
        }}
      >
        <ArrowLeft /> Back to {params.repoPath}
      </a>
      <div className="repo-header">
        <a
          className="user"
          href={params.base}
          onClick={(e) => {
            e.preventDefault();
            navigate(params.base);
          }}
        >
          @{params.user}
        </a>
        {params.path.map((seg, i) => (
          <React.Fragment key={i}>
            <span className="sep">/</span>
            <span className="repo-name">{seg}</span>
          </React.Fragment>
        ))}
        <span className="sep">/</span>
        <span className="repo-name">Settings</span>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <button className="settings-sidebar-tab settings-sidebar-tab--active" type="button">
            Storage / Processing
          </button>
        </div>
        <div className="settings-content">
          <TitleBar state={state} setPeriod={setPeriod} setCurrency={setCurrency} />
          <StorageSection
            state={state}
            toggleProvider={toggleProvider}
            setRegion={setRegion}
            setGcType={setGcType}
          />
          <ProcessingSection state={state} />
        </div>
      </div>
    </div>
  );
};

export default Settings;

// ============================================================
// TitleBar
// ============================================================

const TitleBar: React.FC<{
  state: SettingsState;
  setPeriod: (p: BillingPeriod) => void;
  setCurrency: (code: string) => void;
}> = ({state, setPeriod, setCurrency}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const cur = findCurrency(state.currencyCode);
  const total = computeTotalCostMonthly(state);

  const filtered = useMemo(
    () =>
      CURRENCIES.filter((c) =>
        (c.code + ' ' + c.name).toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <div className="settings-title-bar">
      <div style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
        <div className="settings-total-credits">
          <span className="settings-total-credits__label">Total</span>
          {formatCost(state, total)}
          {periodLabel(state)}
        </div>
        <div className="settings-currency">
          <button
            type="button"
            className="settings-currency-btn"
            onClick={() => setOpen((o) => !o)}
          >
            {cur.symbol} {cur.code} <ChevronDown />
          </button>
          {open && (
            <div className="settings-currency-popup">
              <input
                className="settings-currency-search"
                type="text"
                placeholder="Search currencies…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {filtered.map((c) => (
                <div
                  key={c.code}
                  className={classnames('settings-currency-option', {
                    'settings-currency-option--active': c.code === state.currencyCode,
                  })}
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                  }}
                >
                  <span className="settings-currency-symbol">{c.symbol}</span>
                  {c.code}
                  <span style={{color: 'rgba(255,255,255,0.25)', marginLeft: 'auto', fontSize: 11}}>
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="settings-period-toggle">
        {(['hourly', 'daily', 'monthly', 'yearly'] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={classnames('settings-period-toggle-btn', {
              'settings-period-toggle-btn--active': state.billingPeriod === p,
            })}
            onClick={() => setPeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// StorageSection
// ============================================================

const StorageSection: React.FC<{
  state: SettingsState;
  toggleProvider: (id: string) => void;
  setRegion: (id: string, region: string) => void;
  setGcType: (type: 'single' | 'dual' | 'multi') => void;
}> = ({state, toggleProvider, setRegion, setGcType}) => {
  const pct = Math.min(100, (state.storageUsedGB / state.storageQuotaGB) * 100);
  const storageCost = state.storageUsedGB * (state.providers.filter((p) => p.enabled).length === 0
    ? 0
    : state.providers
        .filter((p) => p.enabled)
        .reduce((acc, p) => acc + getActiveRegion(p).storagePricePerGBMonth, 0) /
      state.providers.filter((p) => p.enabled).length);
  const isDanger = pct >= 90;
  const enabledProviders = state.providers.filter((p) => p.enabled);

  return (
    <div className="settings-section">
      <div className="settings-section__title">
        <StorageIcon /> Data Storage
        <span className="settings-section__right">
          {formatCost(state, storageCost)}
          {periodLabel(state)}
        </span>
      </div>

      <div className="settings-storage-bar">
        <div className="settings-storage-bar__rail">
          <div
            className={classnames('settings-storage-bar__fill', {
              'settings-storage-bar__fill--danger': isDanger,
            })}
            style={{width: `${pct.toFixed(1)}%`}}
          />
        </div>
        <div className="settings-storage-bar__label">
          <strong>{state.storageUsedGB.toFixed(2)} GB</strong> / {state.storageQuotaGB.toFixed(2)} GB
        </div>
      </div>

      <div className="settings-providers">
        {state.providers.map((p) => (
          <button
            key={p.id}
            type="button"
            className={classnames('settings-provider', {
              'settings-provider--active': p.enabled,
            })}
            onClick={() => toggleProvider(p.id)}
          >
            <span className="settings-provider__check">{p.enabled ? '✓' : ' '}</span>
            {p.name}
          </button>
        ))}
      </div>

      {state.providers.filter((p) => p.enabled).map((p) => (
        <div key={p.id} className="settings-region-row">
          <span className="settings-region-row__label">{p.name}</span>
          {p.id === 'gcloud' ? (
            <RegionGCloud provider={p} setRegion={setRegion} setGcType={setGcType} state={state} />
          ) : (
            <>
              <select
                className="settings-region-select"
                value={p.selectedRegion}
                onChange={(e) => setRegion(p.id, e.target.value)}
              >
                {p.regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <span className="settings-region-row__price">
                {formatCost(state, getActiveRegion(p).storagePricePerGBMonth)}
                {periodLabel(state)}/GB
              </span>
            </>
          )}
        </div>
      ))}

      {enabledProviders.length > 0 && <PricingTable state={state} providers={enabledProviders} />}

      <UsageTree state={state} />
    </div>
  );
};

const RegionGCloud: React.FC<{
  state: SettingsState;
  provider: CloudProvider;
  setRegion: (id: string, region: string) => void;
  setGcType: (type: 'single' | 'dual' | 'multi') => void;
}> = ({state, provider, setRegion, setGcType}) => {
  const type = provider.gcRegionType || 'single';
  const filtered = gcFilterRegions(provider.regions, type);
  const region = filtered.find((r) => r.id === provider.selectedRegion) || filtered[0];
  return (
    <>
      <div className="settings-gc-tabs">
        {(['single', 'dual', 'multi'] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={classnames('settings-gc-tabs__tab', {
              'settings-gc-tabs__tab--active': type === t,
            })}
            onClick={() => setGcType(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <select
        className="settings-region-select"
        value={provider.selectedRegion}
        onChange={(e) => setRegion(provider.id, e.target.value)}
      >
        {filtered.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      {region && (
        <span className="settings-region-row__price">
          {formatCost(state, region.storagePricePerGBMonth)}
          {periodLabel(state)}/GB
        </span>
      )}
    </>
  );
};

const PricingTable: React.FC<{
  state: SettingsState;
  providers: CloudProvider[];
}> = ({state, providers}) => {
  const ops: {label: string; key: keyof CloudRegion}[] = [
    {label: 'PUT / 1000', key: 'putPer1000'},
    {label: 'GET / 1000', key: 'getPer1000'},
    {label: 'LIST / 1000', key: 'listPer1000'},
    {label: 'DELETE / 1000', key: 'deletePer1000'},
    {label: 'Egress / GB', key: 'egressPerGB'},
    {label: 'Ingress / GB', key: 'ingressPerGB'},
  ];
  return (
    <table className="settings-pricing-table">
      <thead>
        <tr>
          <th>Operation</th>
          {providers.map((p) => (
            <th key={p.id}>{p.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ops.map((op) => (
          <tr key={op.label}>
            <td>{op.label}</td>
            {providers.map((p) => {
              const region = getActiveRegion(p);
              const val = region[op.key] as number;
              return <td key={p.id}>{val === 0 ? 'Free' : formatCost(state, val)}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ============================================================
// UsageTree
// ============================================================

const UsageTree: React.FC<{state: SettingsState}> = ({state}) => {
  const tree = useMemo(() => createUsageTree(), []);
  return (
    <div className="settings-tree">
      <TreeNode state={state} node={tree} path="" />
    </div>
  );
};

const TreeNode: React.FC<{state: SettingsState; node: UsageTreeNode; path: string}> = ({
  state,
  node,
  path,
}) => {
  const [open, setOpen] = useState(false);
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const hasChildren = node.isDirectory && node.children.length > 0;
  const cost = nodeStorageCostMonthly(state, node);
  return (
    <div className="settings-tree-node">
      <div
        className="settings-tree-row"
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        <span
          className={classnames('settings-tree-arrow', {
            'settings-tree-arrow--expanded': open,
            'settings-tree-arrow--leaf': !hasChildren,
          })}
        >
          <ChevronRight />
        </span>
        <span className="settings-tree-icon">
          {node.isDirectory ? <FolderIcon /> : <FileIcon />}
        </span>
        <span className="settings-tree-name">
          {node.name}
          {node.isDirectory ? '/' : ''}
        </span>
        <span className="settings-tree-size">{formatBytes(node.storageBytes)}</span>
        <span className="settings-tree-cost">
          {formatCost(state, cost)}
          {periodLabel(state)}
        </span>
      </div>
      {hasChildren && (
        <div
          className={classnames('settings-tree-children', {
            'settings-tree-children--collapsed': !open,
          })}
        >
          {node.children.map((c) => (
            <TreeNode key={c.name} state={state} node={c} path={fullPath} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// ProcessingSection
// ============================================================

const ProcessingSection: React.FC<{state: SettingsState}> = ({state}) => {
  const cats = useMemo(() => computeOperationCosts(state), [state]);
  return (
    <div className="settings-section">
      <div className="settings-section__title">
        <NetworkIcon /> Data Processing
        <span className="settings-section__right">
          Credits: <InfinityIcon />{' '}
          <span style={{color: 'rgba(255,255,255,0.7)'}}>Unlimited</span>
        </span>
      </div>
      {cats.map((cat) => (
        <OpCategory key={cat.id} state={state} cat={cat} />
      ))}

      <ProcessingTree state={state} />
    </div>
  );
};

const OpCategory: React.FC<{
  state: SettingsState;
  cat: ReturnType<typeof computeOperationCosts>[number];
}> = ({state, cat}) => {
  const [open, setOpen] = useState(false);
  const total = cat.subcategories.reduce((acc, s) => acc + s.costUSD, 0);
  return (
    <div className="settings-op">
      <div className="settings-op__header" onClick={() => setOpen((o) => !o)}>
        <span
          className={classnames('settings-op__arrow', {'settings-op__arrow--expanded': open})}
        >
          <ChevronRight />
        </span>
        <span className="settings-op__icon">{opCategoryIcon(cat.icon)}</span>
        <span className="settings-op__label">{cat.label}</span>
        <span className="settings-usage-extra">{formatBytes(cat.usageBytes)}</span>
        <span className="settings-op__total">
          {formatCost(state, total)}
          {periodLabel(state)}
        </span>
      </div>
      <div
        className={classnames('settings-op__body', {'settings-op__body--collapsed': !open})}
      >
        {cat.subcategories.map((sub) => (
          <div key={sub.label} className="settings-op__sub">
            <span className="settings-op__sub-icon">{opSubIcon(sub.icon)}</span>
            <span className="settings-op__sub-label">{sub.label}</span>
            {sub.usageLabel && (
              <span style={{fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto'}}>
                {sub.usageLabel}
              </span>
            )}
            <span className="settings-op__sub-cost">
              {formatCost(state, sub.costUSD)}
              {periodLabel(state)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProcessingTree: React.FC<{state: SettingsState}> = ({state}) => {
  const tree = useMemo(() => createUsageTree(), []);
  return (
    <div className="settings-tree">
      <ProcessingTreeNode state={state} node={tree} path="" />
    </div>
  );
};

const ProcessingTreeNode: React.FC<{
  state: SettingsState;
  node: UsageTreeNode;
  path: string;
}> = ({state, node, path}) => {
  const [open, setOpen] = useState(false);
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const hasChildren = node.isDirectory && node.children.length > 0;
  const cost = processingNodeCost(state, node);
  return (
    <div className="settings-tree-node">
      <div className="settings-tree-row" onClick={() => hasChildren && setOpen((o) => !o)}>
        <span
          className={classnames('settings-tree-arrow', {
            'settings-tree-arrow--expanded': open,
            'settings-tree-arrow--leaf': !hasChildren,
          })}
        >
          <ChevronRight />
        </span>
        <span className="settings-tree-icon">
          {node.isDirectory ? <FolderIcon /> : <FileIcon />}
        </span>
        <span className="settings-tree-name">
          {node.name}
          {node.isDirectory ? '/' : ''}
        </span>
        <span className="settings-tree-size" style={{color: 'rgba(255,255,255,0.25)'}}>
          {node.readOps.toLocaleString()}R / {node.writeOps.toLocaleString()}W
        </span>
        <span className="settings-tree-cost">
          {formatCost(state, cost)}
          {periodLabel(state)}
        </span>
      </div>
      {hasChildren && (
        <div
          className={classnames('settings-tree-children', {
            'settings-tree-children--collapsed': !open,
          })}
        >
          {node.children.map((c) => (
            <ProcessingTreeNode key={c.name} state={state} node={c} path={fullPath} />
          ))}
        </div>
      )}
    </div>
  );
};
