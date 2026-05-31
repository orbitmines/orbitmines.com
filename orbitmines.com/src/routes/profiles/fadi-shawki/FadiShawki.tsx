import React from 'react';
import {ARTICLES_2021, ARTICLES_2022, ARTICLES_2023, ARTICLES_2024, ARTICLES_2025, ARTICLES_2026} from "./fadi_shawki";
import ORGANIZATIONS, {Viewed} from "../../../lib/organizations/ORGANIZATIONS";
import {PROFILES} from "../profiles";
import {ON_INTELLIGIBILITY} from "../../archive/2022.OnIntelligibility";
import {CanvasContainer, ON_ORBITS} from "../../archive/2023.OnOrbits";
import {_2024_02_ORBITMINES_AS_A_GAME_PROJECT} from "../../archive/2024.02.OrbitMines_as_a_Game_Project";
import {Arc, Section, Reference, Category, Profile} from "../../../lib/post/Post";
import {TOWARDS_A_UNIVERSAL_LANGUAGE} from "../../archive/2025.TowardsAUniversalLanguage";

interface TimelineEntry {
    when: string;
    what: React.ReactNode;
    description?: React.ReactNode;
    icon?: string;
    icons?: React.ReactNode[];
}

const firstYear = (when: string): number | null => {
    const m = when.match(/\d{4}/);
    return m ? parseInt(m[0], 10) : null;
};

const lastYear = (when: string): number | null => {
    if (/present/i.test(when)) return new Date().getFullYear();
    const all = when.match(/\d{4}/g);
    if (!all || all.length === 0) return null;
    return parseInt(all[all.length - 1], 10);
};

const Timeline = ({title, entries, leftHeader, heading = 'Timeline', showHeading = true, groupByYear = false, belowHeader, compact = false}: {title?: string; entries: TimelineEntry[]; leftHeader?: React.ReactNode; heading?: React.ReactNode; showHeading?: boolean; groupByYear?: boolean; belowHeader?: React.ReactNode; compact?: boolean}) => {
    const lineColor = 'rgba(255,255,255,0.18)';
    const activeDot = '#abb3bf';
    const mutedDot = '#5c6370';
    const activeText = '#e6e6e6';
    const currentYear = new Date().getFullYear();
    const [isSmall, setIsSmall] = React.useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches,
    );
    React.useEffect(() => {
        const mqlSmall = window.matchMedia('(max-width: 640px)');
        const onSmall = (e: MediaQueryListEvent) => setIsSmall(e.matches);
        mqlSmall.addEventListener('change', onSmall);
        return () => {
            mqlSmall.removeEventListener('change', onSmall);
        };
    }, []);
    return (
        <div style={{padding: '24px 0', textAlign: 'left'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16}}>
                {leftHeader ? (
                    <>
                        <div style={{flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 96}}>
                            {leftHeader}
                        </div>
                        {showHeading ? (
                            <div style={{flex: '1 1 auto', minWidth: 0}}>
                                <div style={{fontSize: '1.4rem', lineHeight: 1.2, color: activeText}}>{heading}</div>
                                {title ? <div className="bp5-text-muted" style={{fontSize: '0.95rem'}}>{title}</div> : null}
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div style={{flex: '0 0 auto', minWidth: 0}}>
                        <div style={{fontSize: '1.4rem', lineHeight: 1.2, color: activeText}}>{heading}</div>
                        {title ? <div className="bp5-text-muted" style={{fontSize: '0.95rem'}}>{title}</div> : null}
                    </div>
                )}
            </div>
            {belowHeader ? <div style={{marginBottom: 12}}>{belowHeader}</div> : null}
            <div style={{position: 'relative', paddingLeft: isSmall ? 0 : 22}}>
                    {!isSmall ? <div style={{position: 'absolute', left: 6, top: 6, bottom: 6, width: 2, background: lineColor}}/> : null}
                    {(() => {
                        const ordered = groupByYear
                            ? [...entries].sort((a, b) => (firstYear(b.when) ?? 0) - (firstYear(a.when) ?? 0))
                            : entries;
                        return ordered.map((entry, i) => {
                            const y = firstYear(entry.when);
                            const future = y !== null && y > currentYear;
                            const prevYear = i > 0 ? firstYear(ordered[i - 1].when) : null;
                            const sameAsPrev = groupByYear && y !== null && y === prevYear;
                            const label = groupByYear ? (y !== null ? `${y}` : entry.when) : entry.when;
                            const moreSpecific = groupByYear && y !== null && entry.when.trim() !== `${y}`;
                            return (
                                <div key={i} style={{position: 'relative', padding: compact ? '3px 0' : '8px 0', color: future ? 'rgba(255,255,255,0.4)' : activeText}}>
                                    {!sameAsPrev && !isSmall ? (
                                        <span style={{
                                            position: 'absolute',
                                            left: -22,
                                            top: compact ? 7 : 14,
                                            width: 14,
                                            height: 14,
                                            borderRadius: '50%',
                                            background: future ? mutedDot : activeDot,
                                            border: '2px solid rgb(10,10,10)',
                                            boxSizing: 'border-box',
                                        }}/>
                                    ) : null}
                                    {!sameAsPrev || !isSmall ? (
                                        <span
                                            className={future ? 'bp5-text-disabled' : undefined}
                                            style={{display: 'inline-block', minWidth: isSmall ? 0 : 90, marginRight: isSmall ? 0 : 12, color: future ? undefined : activeDot, visibility: sameAsPrev && !isSmall ? 'hidden' : 'visible'}}
                                        >{!sameAsPrev ? label : ''}</span>
                                    ) : null}
                                    {isSmall ? <div style={{height: 0}}/> : null}
                                    <span
                                        className={future ? 'bp5-text-muted' : undefined}
                                        style={{color: future ? undefined : activeText, fontSize: compact ? '0.8rem' : undefined}}
                                    >{entry.what}</span>
                                    {entry.description || moreSpecific ? (
                                        isSmall ? (
                                            <span className="bp5-text-muted" style={{marginLeft: 8, fontSize: compact ? '0.7rem' : '0.9rem'}}>
                                                {moreSpecific ? (
                                                    <span style={{marginRight: entry.description ? 8 : 0}}>{entry.when}{entry.description ? '.' : ''}</span>
                                                ) : null}
                                                {entry.description}
                                            </span>
                                        ) : (
                                            <div className="bp5-text-muted" style={{marginLeft: 102, fontSize: compact ? '0.7rem' : '0.9rem', marginTop: 2}}>
                                                {moreSpecific ? (
                                                    <span style={{marginRight: entry.description ? 8 : 0}}>{entry.when}{entry.description ? '.' : ''}</span>
                                                ) : null}
                                                {entry.description}
                                            </div>
                                        )
                                    ) : null}
                                </div>
                            );
                        });
                    })()}
            </div>
        </div>
    );
};

export const ONGOING_PROJECTS = [
    {
        reference: {
            title: "The Ray Programming Language",
            organizations: [ORGANIZATIONS.github],
            year: "2025->",
            link: "https://github.com/orbitmines/ray"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "IDE: The Ether",
            organizations: [ORGANIZATIONS.github],
            year: "2026->",
            link: "https://github.com/orbitmines/ray"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Library: Analysis & indexing of Languages",
            organizations: [ORGANIZATIONS.github],
            year: "2028->",
            link: "https://github.com/orbitmines/ray/tree/main/Ether/projects/library"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "3D Rendering: Physics & Games",
            organizations: [ORGANIZATIONS.github],
            year: "2029+?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/_indefinite_future_projects/PENDING%20(2027%3F%2B)%20%3B%20Physics%20(%26%20Hardware).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Operating System",
            organizations: [ORGANIZATIONS.github],
            year: "2029+?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/_indefinite_future_projects/PENDING%20(2027%3F%2B)%20%3B%20Operating%20System.md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Education",
            organizations: [ORGANIZATIONS.github],
            year: "2035+?",
            link: "https://github.com/orbitmines/archive/blob/main/projects/_indefinite_future_projects/INDEFINITE%20Project%20-%20Education%20(2027%2B%3F).md"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
    {
        reference: {
            title: "Archive - \"OrbitMines' Journey\"",
            organizations: [ORGANIZATIONS.github],
            year: "2025-2026?",
            link: "https://github.com/orbitmines/archive/tree/main/projects"
        }, status: Viewed.VIEWED, found_at: "2024", viewed_at: "2024"
    },
]

const renderOrgIcon = (org: any, key: React.Key): React.ReactNode => {
    const style: React.CSSProperties = {width: 18, height: 18, verticalAlign: 'middle', marginRight: 6, objectFit: 'contain'};
    const raster = org?.assets?.icon_png ?? org?.assets?.logo;
    if (raster) return <img key={key} src={raster} alt={org?.name ?? ''} style={style}/>;
    const svg = org?.assets?.icon;
    if (svg?.paths?.length) {
        return (
            <svg key={key} viewBox={`0 0 ${svg.viewBox.width} ${svg.viewBox.height}`} style={{...style, fill: 'currentColor'}} aria-hidden>
                {svg.paths.map((d: string, i: number) => <path key={i} d={d}/>)}
            </svg>
        );
    }
    return null;
};

type ExposureType = 'book' | 'video' | 'article';

const inferType = (item: any): ExposureType => {
    if (item.type === 'book' || item.type === 'video' || item.type === 'article') return item.type;
    const orgs: any[] = item.reference?.organizations ?? [];
    if (orgs.some(o => o?.key === 'youtube')) return 'video';
    return 'article';
};

interface ParsedFilters {
    types: string[];
    persons: string[];
    orgs: string[];
    after?: number;
    before?: number;
    since?: number;
    year?: number;
    text: string[];
}

const FILTER_KEYS = ['type', 'person', 'organization', 'org', 'after', 'before', 'since', 'year'];

const parseQuery = (q: string): ParsedFilters => {
    const out: ParsedFilters = {types: [], persons: [], orgs: [], text: []};
    const tokens = q.match(/(?:[a-z]+:"[^"]*"|[a-z]+:\S+|"[^"]*"|\S+)/gi) ?? [];
    for (const raw of tokens) {
        const m = raw.match(/^([a-z]+):(.*)$/i);
        if (m && FILTER_KEYS.includes(m[1].toLowerCase())) {
            const key = m[1].toLowerCase();
            const val = m[2].replace(/^"|"$/g, '');
            if (key === 'type') out.types.push(val.toLowerCase());
            else if (key === 'person') out.persons.push(val.toLowerCase());
            else if (key === 'organization' || key === 'org') out.orgs.push(val.toLowerCase());
            else if (key === 'after') { const n = parseInt(val, 10); if (!isNaN(n)) out.after = n; }
            else if (key === 'before') { const n = parseInt(val, 10); if (!isNaN(n)) out.before = n; }
            else if (key === 'since') { const n = parseInt(val, 10); if (!isNaN(n)) out.since = n; }
            else if (key === 'year') { const n = parseInt(val, 10); if (!isNaN(n)) out.year = n; }
        } else {
            out.text.push(raw.replace(/^"|"$/g, '').toLowerCase());
        }
    }
    return out;
};

const matches = (item: any, year: number, f: ParsedFilters): boolean => {
    const t = inferType(item);
    if (f.types.length && !f.types.includes(t)) return false;
    const authorNames: string[] = (item.reference.authors ?? []).map((a: any) => (a.name ?? '').toLowerCase());
    if (f.persons.length && !f.persons.every(p => authorNames.some(n => n.includes(p)))) return false;
    const orgKeys: string[] = (item.reference.organizations ?? []).map((o: any) => (o.key ?? '').toLowerCase());
    const orgNames: string[] = (item.reference.organizations ?? []).map((o: any) => (o.name ?? '').toLowerCase());
    if (f.orgs.length && !f.orgs.every(q => orgKeys.some(k => k.includes(q)) || orgNames.some(n => n.includes(q)))) return false;
    if (f.year !== undefined && year !== f.year) return false;
    if (f.after !== undefined && year <= f.after) return false;
    if (f.before !== undefined && year >= f.before) return false;
    if (f.since !== undefined && year < f.since) return false;
    if (f.text.length) {
        const titleStr = String((typeof item.reference.title === 'string' ? item.reference.title : '')).toLowerCase();
        const haystack = [titleStr, `${year}`, ...authorNames].join(' ');
        if (!f.text.every(t => haystack.includes(t))) return false;
    }
    return true;
};

const LiteraryExposure = ({byYear}: {byYear: Record<number, any[]>}) => {
    const items = React.useMemo(() => {
        const out: {year: number; item: any}[] = [];
        for (const [yStr, arr] of Object.entries(byYear)) {
            const y = parseInt(yStr, 10);
            for (const it of arr) out.push({year: y, item: it});
        }
        return out;
    }, [byYear]);
    const [q, setQ] = React.useState('');
    const [focused, setFocused] = React.useState(false);
    const [cursor, setCursor] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [minHeight, setMinHeight] = React.useState<number | undefined>();
    React.useLayoutEffect(() => {
        if (containerRef.current && !q && minHeight === undefined) {
            setMinHeight(containerRef.current.offsetHeight);
        }
    }, [q, minHeight]);

    const allAuthors = React.useMemo(() => {
        const set = new Set<string>();
        for (const {item} of items) for (const a of (item.reference.authors ?? [])) if (a?.name) set.add(a.name);
        return [...set].sort();
    }, [items]);
    const allOrgs = React.useMemo(() => {
        const map = new Map<string, string>();
        for (const {item} of items) for (const o of (item.reference.organizations ?? [])) if (o?.key) map.set(o.key, o.name || o.key);
        return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }, [items]);
    const allYears = React.useMemo(() => {
        const set = new Set<number>();
        for (const {year} of items) set.add(year);
        return [...set].sort((a, b) => b - a);
    }, [items]);

    const filters = React.useMemo(() => parseQuery(q), [q]);

    const filtered = React.useMemo(
        () => items.filter(({item, year}) => matches(item, year, filters)),
        [items, filters],
    );

    // Compute autocomplete suggestions based on the current token being typed
    const lastToken = (() => {
        const m = q.match(/(?:^|\s)(\S*)$/);
        return m ? m[1] : '';
    })();
    const suggestions: {value: string; label: string}[] = React.useMemo(() => {
        const tk = lastToken.toLowerCase();
        const colon = tk.indexOf(':');
        if (colon < 0) {
            // suggest keys + matching free text values
            return FILTER_KEYS.filter(k => k.startsWith(tk)).map(k => ({value: k + ':', label: k + ':'}));
        }
        const key = tk.slice(0, colon);
        const val = tk.slice(colon + 1);
        let opts: {value: string; label: string}[] = [];
        if (key === 'type') opts = ['book', 'article', 'video'].filter(v => v.startsWith(val)).map(v => ({value: `type:${v}`, label: `type:${v}`}));
        else if (key === 'person') opts = allAuthors.filter(a => a.toLowerCase().includes(val)).slice(0, 8).map(a => ({value: `person:"${a}"`, label: `person: ${a}`}));
        else if (key === 'organization' || key === 'org') opts = allOrgs.filter(([k, n]) => k.toLowerCase().includes(val) || n.toLowerCase().includes(val)).slice(0, 8).map(([k, n]) => ({value: `${key}:${k}`, label: `${key}: ${n}`}));
        else if (['after', 'before', 'since', 'year'].includes(key)) opts = allYears.filter(y => `${y}`.startsWith(val)).slice(0, 12).map(y => ({value: `${key}:${y}`, label: `${key}:${y}`}));
        return opts;
    }, [lastToken, allAuthors, allOrgs, allYears]);

    React.useEffect(() => { setCursor(0); }, [q]);

    const insertSuggestion = (s: {value: string; label: string}) => {
        const before = q.replace(/(?:^|\s)\S*$/, m => m.replace(/\S*$/, ''));
        const next = (before.length && !before.endsWith(' ') ? before + ' ' : before) + s.value + ' ';
        setQ(next);
    };

    const entries: TimelineEntry[] = filtered.map(({item, year}) => {
        const orgs = (item.reference.organizations ?? []) as any[];
        const icons = orgs.map((o, i) => renderOrgIcon(o, i)).filter((x): x is React.ReactNode => !!x);
        const authors = (item.reference.authors ?? []).map((a: any) => a.name).filter(Boolean).join(', ');
        const inner = <>{icons}{item.reference.title}</>;
        return {
            when: `${year}`,
            what: item.reference.link ? (
                <a href={item.reference.link} target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : inner,
            description: authors ? <>{authors}{item.reference.year ? ` ${item.reference.year}` : ''}{item.description ? <>. {item.description}</> : null}</> : item.description,
        };
    });

    // The top suggestion's "completion" — what would be appended after `lastToken` on Tab
    const completion = (() => {
        if (!suggestions.length) return '';
        const top = suggestions[cursor]?.value ?? '';
        if (top.toLowerCase().startsWith(lastToken.toLowerCase())) return top.slice(lastToken.length);
        return '';
    })();

    const filterRow = (
        <div style={{position: 'relative', maxWidth: 720, marginBottom: 8}}>
            <div style={{position: 'relative'}}>
                <input
                    type="text"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 150)}
                    onKeyDown={e => {
                        if (!suggestions.length) return;
                        if (e.key === 'Tab') {
                            e.preventDefault();
                            insertSuggestion(suggestions[cursor]);
                        }
                    }}
                    placeholder="filter — try: type:video  person:&quot;Isaac Asimov&quot;  org:youtube  after:2024"
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 4,
                        color: '#e6e6e6',
                        outline: 'none',
                        fontSize: '0.9rem',
                        position: 'relative',
                        zIndex: 1,
                        fontFamily: 'inherit',
                    }}
                />
                {completion ? (
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            padding: '8px 12px',
                            fontSize: '0.9rem',
                            color: 'rgba(255,255,255,0.25)',
                            pointerEvents: 'none',
                            whiteSpace: 'pre',
                            overflow: 'hidden',
                            fontFamily: 'inherit',
                        }}
                    >
                        <span style={{visibility: 'hidden'}}>{q}</span>{completion}
                    </div>
                ) : null}
            </div>
            <div style={{minHeight: 22, marginTop: 4, fontSize: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: 6}}>
                {focused && suggestions.length > 0 ? (
                    suggestions.map((s, i) => (
                        <span
                            key={i}
                            onMouseDown={e => { e.preventDefault(); insertSuggestion(s); }}
                            className={i === cursor ? undefined : 'bp5-text-disabled'}
                            style={{
                                cursor: 'pointer',
                                color: i === cursor ? 'rgba(255,255,255,0.6)' : undefined,
                                padding: '0 2px',
                            }}
                        >{s.label}</span>
                    ))
                ) : (
                    <span className="bp5-text-disabled">{filtered.length} of {items.length}</span>
                )}
            </div>
        </div>
    );

    return (
        <div ref={containerRef} style={{minHeight}}>
            <Timeline
                heading="Literary Exposure"
                groupByYear
                compact
                entries={entries}
                belowHeader={filterRow}
            />
        </div>
    );
};

export const FadiShawkiBody = () => {
    const profile = PROFILES.fadi_shawki;

    return <>
        <Timeline
            title="Ongoing & Planned Projects"
            leftHeader={<img src="/Ether.svg" alt="Ether" style={{width: '100%', height: 'auto', opacity: 0.9}}/>}
            entries={[
                {when: '2025->', what: <a href="/almanac">The Ray Programming Language</a>},
                {when: '2026->', what: 'Ether: Ecosystem for the Ray programming language.'},
                {when: '2028->', what: 'The Ether Library Project: The analysis, indexing and interoperating of existing programming languages.'},
                {when: '2029+?', what: '3D Rendering / Game Engine extension to the Ether Library.'},
                {when: '2030-2035', what: 'Start research on the gamification of science, engineering and education.'},
            ]}
        />

        <Timeline
            heading="Writings"
            leftHeader={<img src="/logo.png" alt="orbitmines.com" style={{width: '100%', height: 'auto', opacity: 0.9}}/>}
            entries={[TOWARDS_A_UNIVERSAL_LANGUAGE, _2024_02_ORBITMINES_AS_A_GAME_PROJECT, ON_ORBITS, ON_INTELLIGIBILITY].map((paper) => {
                const icon = paper.reference.organizations?.[0] ? renderOrgIcon(paper.reference.organizations[0], 0) : null;
                const inner = <>{icon}{paper.reference.title as React.ReactNode}</>;
                return {
                    when: paper.reference.year ?? '',
                    what: paper.reference.link ? (
                        <a href={paper.reference.link}>{inner}</a>
                    ) : inner,
                    description: <>{paper.reference.date ? `${paper.reference.date}. ` : ''}{paper.reference.subtitle as React.ReactNode}</>,
                };
            })}
        />

        <Arc buffer={false}>
            <CanvasContainer style={{height: '140px'}}>
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
        </Arc>

        <Timeline
            heading="Formal History"
            title="Projects, Education & Attended Events"
            groupByYear
            entries={[
                ...(profile.content!.history ?? []),
                ...(profile.content!.formal_education ?? []),
                ...(profile.content!.attended_events ?? []),
            ].map((item) => {
                const org = item.reference.organizations?.[0] ?? item.reference.published?.[0];
                const icon = org ? renderOrgIcon(org, 0) : null;
                const inner = <>{icon}{item.reference.title as React.ReactNode}</>;
                return {
                    when: (item.reference.year as string) ?? '',
                    what: item.reference.link ? (
                        <a href={item.reference.link} target="_blank" rel="noopener noreferrer">{inner}</a>
                    ) : inner,
                    description: item.description ?? (item.reference.subtitle as React.ReactNode),
                };
            })}
        />

        <CanvasContainer style={{height: '150px'}}>
            <canvas
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url('/archive/on-orbits-equivalence-and-inconsistencies/images/2_edge_3_fractal_with_equivs.png')`,
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
        </CanvasContainer>

        <LiteraryExposure byYear={{
            2026: ARTICLES_2026,
            2025: ARTICLES_2025,
            2024: ARTICLES_2024,
            2023: ARTICLES_2023,
            2022: ARTICLES_2022,
            2021: ARTICLES_2021,
        }}/>
    </>;
}

const FadiShawki = () => {
    const profile = PROFILES.fadi_shawki;
    return <Profile profile={profile}><FadiShawkiBody /></Profile>;
}

export default FadiShawki;