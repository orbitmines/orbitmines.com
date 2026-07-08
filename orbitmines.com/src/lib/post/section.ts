'use client';

import {createContext, useContext} from 'react';
import {useLocation} from 'react-router-dom';
import {sectionSlug} from './sectionSlug';

// Book sections live in the URL *path* (/almanac/<slug>) rather than as a
// ?section= query param: each section is its own indexable, prerenderable URL
// (better SEO; see the path-vs-query discussion). search / highlight / generate
// stay as query params — they're transient modifiers, not locations.

export {sectionSlug};

export interface SectionPath {
  /** Slug of the currently selected section, or null on the book's start page. */
  currentSlug: string | null;
  /** Path up to (not including) the section slug, e.g. "/almanac". */
  basePath: string;
  /**
   * Navigate to a section by its (heading) name, or null for the start page.
   * `query` overrides individual search params on top of the current ones;
   * a null value deletes that param. `search` and `highlight` are always
   * cleared unless explicitly provided, matching the old ?section= behaviour.
   */
  navigateSection: (name: string | null, query?: Record<string, string | null>) => void;
}

// `validSlugs` is the set of slugs this book actually has, so we can tell a
// trailing section segment apart from the book's own base path.
export function useSectionPath(validSlugs: Set<string>): SectionPath {
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? '';
  const hasSection = validSlugs.has(last);
  const currentSlug = hasSection ? last : null;
  const basePath = '/' + (hasSection ? segments.slice(0, -1) : segments).join('/');

  const navigateSection: SectionPath['navigateSection'] = (name, query) => {
    const slug = name ? sectionSlug(name) : null;
    const params = new URLSearchParams(location.search);
    params.delete('search');
    params.delete('highlight');
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === null) params.delete(k);
        else params.set(k, v);
      }
    }
    const qs = params.toString();
    const path = slug ? `${basePath}/${slug}` : basePath;
    const url = qs ? `${path}?${qs}` : path;
    // Shallow update: App Router reflects history.pushState in usePathname
    // without a navigation/reload, so the section swaps in-session (the patched
    // pushState also notifies search-param consumers). Scroll handling stays in
    // the Book's section-change effect, as before.
    if (typeof window !== 'undefined') window.history.pushState(null, '', url);
  };

  return {currentSlug, basePath, navigateSection};
}

// Lets section content (rendered as children inside Post) trigger section
// navigation without threading callbacks through the whole tree. PaperContent
// provides it; inline "jump to §X" buttons consume it via useSectionNav().
export type NavigateSection = SectionPath['navigateSection'];
export const SectionNavContext = createContext<NavigateSection>(() => {});
export const useSectionNav = (): NavigateSection => useContext(SectionNavContext);
