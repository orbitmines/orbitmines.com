import {getName} from '../storage';
import type {EtherPage} from './types';

// Ported from ray's `Router.ts`. Pure function — no DOM mutation, no
// history side-effects. Consumers call this with `location.pathname` and
// route to a page component based on the discriminated union.
//
// Each branch corresponds to a distinct URL shape; see `types.ts` for the
// catalog. Order matters: language ($) and chat are tested before the
// generic repository fallback because they would otherwise be absorbed
// into the path segments.
export function matchRoute(pathname: string): EtherPage {
  let user = getName().replace(/^@/, '') || 'ether';
  let base = '';
  let rest = pathname;

  // /$ — language routes (before @user extraction).
  const langMatch = pathname.match(/^\/\$(?:\.([a-zA-Z][a-zA-Z0-9]*))?(?:\/(.*))?$/);
  if (langMatch) {
    const lang = langMatch[1] || null;
    const sub = langMatch[2] || '';
    const path = sub ? sub.split('/').filter(Boolean) : [];
    return {page: 'language', params: {user, base: '', lang, path}};
  }

  // /@user prefix.
  const atMatch = pathname.match(/^\/@([^/]+)(\/.*)?$/);
  if (atMatch) {
    user = atMatch[1];
    base = `/@${user}`;
    rest = atMatch[2] || '';
  }

  const segments = rest.split('/').filter(Boolean);

  // ---- Chat routes (must precede the dash-segment check) ----
  const chatIdx = segments.indexOf('chat');
  if (chatIdx >= 0) {
    const afterChat = segments.slice(chatIdx + 1);

    if (afterChat.length === 0) {
      return {
        page: 'chat',
        params: {
          user, base, chatAction: 'hub',
          targetUser: null, threadId: null, conversationId: '',
          isGroup: false, worldId: null,
        },
      };
    }

    if (afterChat[0] === '~' || afterChat[0]?.startsWith('~')) {
      const tildeSegs: string[] = [];
      for (let i = 0; i < afterChat.length; i++) {
        if (afterChat[i] === '~' && i + 1 < afterChat.length) {
          tildeSegs.push(afterChat[i + 1]);
          i++;
        } else if (afterChat[i].startsWith('~')) {
          tildeSegs.push(afterChat[i].slice(1));
        }
      }

      // DM: first tilde segment starts with @ → target user
      if (tildeSegs.length >= 1 && tildeSegs[0].startsWith('@')) {
        const target = tildeSegs[0].slice(1);
        const convId = `dm-${[user, target].sort().join('-')}`;
        if (tildeSegs.length >= 2) {
          return {
            page: 'chat',
            params: {
              user, base, chatAction: 'thread',
              targetUser: target, threadId: tildeSegs[1], conversationId: convId,
              isGroup: false, worldId: null,
            },
          };
        }
        return {
          page: 'chat',
          params: {
            user, base, chatAction: 'conversation',
            targetUser: target, threadId: null, conversationId: convId,
            isGroup: false, worldId: null,
          },
        };
      }

      // Group chat: tilde segment doesn't start with @
      if (tildeSegs.length >= 1) {
        const worldId = tildeSegs[0];
        const convId = `group-${worldId}`;
        return {
          page: 'chat',
          params: {
            user, base, chatAction: 'conversation',
            targetUser: null, threadId: null, conversationId: convId,
            isGroup: true, worldId,
          },
        };
      }
    }

    return {
      page: 'chat',
      params: {
        user, base, chatAction: 'hub',
        targetUser: null, threadId: null, conversationId: '',
        isGroup: false, worldId: null,
      },
    };
  }

  // ---- Dash-namespace routes (-/pulls, -/settings, -/library) ----
  const dashIdx = segments.indexOf('-');
  if (dashIdx >= 0) {
    let isPulls = false;
    let category: '@' | '~' | null = null;
    let pullsStart = dashIdx + 2;

    if (segments[dashIdx + 1] === 'pulls') {
      isPulls = true;
    } else if (
      (segments[dashIdx + 1] === '@' || segments[dashIdx + 1] === '~') &&
      segments[dashIdx + 2] === 'pulls'
    ) {
      isPulls = true;
      category = segments[dashIdx + 1] as '@' | '~';
      pullsStart = dashIdx + 3;
    }

    if (isPulls) {
      const repoPathSegments = segments.slice(0, dashIdx).filter((s) => s !== '*' && s !== '**');
      const pullsSegments = segments.slice(pullsStart);
      const repoPath = `@${user}` + (repoPathSegments.length > 0 ? '/' + repoPathSegments.join('/') : '');

      let prAction: 'list' | 'detail' | 'new' | 'players' | 'worlds' = 'list';
      let prId: number | null = null;
      let commitId: string | null = null;

      if (category && pullsSegments.length === 0) {
        prAction = category === '@' ? 'players' : 'worlds';
      } else if (pullsSegments.length === 0) {
        prAction = 'list';
      } else if (pullsSegments[0] === 'new') {
        prAction = 'new';
      } else {
        const id = parseInt(pullsSegments[0], 10);
        if (!isNaN(id)) {
          prAction = 'detail';
          prId = id;
          if (pullsSegments[1] === 'commits' && pullsSegments[2]) {
            commitId = pullsSegments[2];
          }
        }
      }

      return {
        page: 'pull-requests',
        params: {user, path: repoPathSegments, base, prAction, prId, commitId, repoPath, category},
      };
    }

    if (segments[dashIdx + 1] === 'settings') {
      const repoPathSegments = segments.slice(0, dashIdx).filter((s) => s !== '*' && s !== '**');
      const repoPath = `@${user}` + (repoPathSegments.length > 0 ? '/' + repoPathSegments.join('/') : '');
      const settingsSegments = segments.slice(dashIdx + 2);
      const tab = settingsSegments[0] || 'general';

      return {
        page: 'settings',
        params: {user, path: repoPathSegments, base, repoPath, tab},
      };
    }

    if (segments[dashIdx + 1] === 'library') {
      return {page: 'library', params: {user, base}};
    }
  }

  // ---- Default: repository view with version markers ----
  const path: string[] = [];
  const versions: [number, string][] = [];
  let i = 0;
  while (i < segments.length) {
    if (segments[i] === '~') {
      if (i + 1 < segments.length) {
        versions.push([path.length, segments[i + 1]]);
        i += 2;
      } else {
        path.push('~');
        i++;
      }
    } else {
      path.push(segments[i]);
      i++;
    }
  }

  return {page: 'repository', params: {user, path, versions, base, hash: null}};
}
