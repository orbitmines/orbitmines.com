'use client';

// Client for the dev-only lore editor server (scripts/lore/editor-server.mjs).
// The base URL is overridable (localStorage 'lore:editorUrl') for non-default
// ports. In production the server isn't running, so calls fail and the editor
// shows an offline state.
import type { Book, Chapter, Entity, Landing, LoreData } from '../types';

const DEFAULT_BASE = 'http://127.0.0.1:4317';

export function editorBase(): string {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('lore:editorUrl');
    if (stored) return stored.replace(/\/$/, '');
  }
  return DEFAULT_BASE;
}

export function setEditorBase(url: string): void {
  if (typeof window !== 'undefined') window.localStorage.setItem('lore:editorUrl', url.replace(/\/$/, ''));
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${editorBase()}/api/lore${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || `HTTP ${res.status}`);
  return json as T;
}

export interface VaultFile { path: string; kind: string; name: string; }

export interface PreviewResult {
  kind: string;
  chapter?: Chapter | null;
  book?: Book | null;
  entity?: Entity | null;
  site?: Landing | null;
  warnings: string[];
}

export const editorApi = {
  ping: () => req<{ ok: boolean; root: string }>('GET', '/ping'),
  tree: () => req<{ files: VaultFile[] }>('GET', '/tree'),
  version: () => req<{ sig: string }>('GET', '/version'),
  data: () => req<{ data: LoreData; warnings: string[] }>('GET', '/data'),
  read: (path: string) => req<{ path: string; content: string }>('GET', `/file?path=${encodeURIComponent(path)}`),
  save: (path: string, content: string) => req<{ ok: boolean; path: string; warnings: string[] }>('PUT', '/file', { path, content }),
  create: (path: string, content: string) => req<{ ok: boolean; path: string; warnings: string[] }>('POST', '/file', { path, content }),
  remove: (path: string) => req<{ ok: boolean; warnings: string[] }>('DELETE', `/file?path=${encodeURIComponent(path)}`),
  rename: (from: string, to: string) => req<{ ok: boolean; path: string; warnings: string[] }>('POST', '/rename', { from, to }),
  preview: (path: string, content: string) => req<PreviewResult>('POST', '/preview', { path, content }),
  rebuild: () => req<{ ok: boolean; warnings: string[] }>('POST', '/rebuild'),
};
