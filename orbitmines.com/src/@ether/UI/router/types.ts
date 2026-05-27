// Parsed-route shapes. The ether URL scheme keeps several ray-specific
// conventions that don't fit clean react-router params:
//   /@user                       — user namespace
//   /@user/path/-/pulls          — pull request list under a sub-path
//   /@user/path/-/pulls/123      — pull request detail
//   /@user/path/-/@/pulls        — players category PRs
//   /@user/path/-/~/pulls        — worlds category PRs
//   /@user/-/settings/general    — settings under a sub-path
//   /@user/-/library             — library shortcut
//   /@user/chat                  — chat hub
//   /@user/chat/~/@target        — DM
//   /@user/chat/~/@target/~tid   — thread in DM
//   /@user/chat/~world           — group chat
//   /$                           — language listing
//   /$.ray                       — language creator for .ray
//   /~version                    — version marker (inline anywhere in repo paths)
// We match these inside one catch-all react-router route via `matchRoute`.

export type EtherPage =
  | {page: 'repository'; params: RepoParams}
  | {page: 'pull-requests'; params: PRParams}
  | {page: 'settings'; params: SettingsParams}
  | {page: 'chat'; params: ChatParams}
  | {page: 'library'; params: LibraryParams}
  | {page: 'language'; params: LangParams};

export interface RepoParams {
  user: string;
  path: string[];
  /** [depth, version] pairs — depth indexes into `path`. */
  versions: [number, string][];
  /** URL prefix for the current player ('' for root, '/@user' for @-routes). */
  base: string;
  /** File selection from URL hash (without the '#'). */
  hash: string | null;
}

export interface PRParams {
  user: string;
  path: string[];
  base: string;
  prAction: 'list' | 'detail' | 'new' | 'players' | 'worlds';
  prId: number | null;
  commitId: string | null;
  /** Canonical repo path, e.g. "@ether/library". */
  repoPath: string;
  /** Category context: '@' for players, '~' for worlds, null otherwise. */
  category: '@' | '~' | null;
}

export interface SettingsParams {
  user: string;
  path: string[];
  base: string;
  repoPath: string;
  tab: string;
}

export interface ChatParams {
  user: string;
  base: string;
  chatAction: 'hub' | 'conversation' | 'thread';
  targetUser: string | null;
  threadId: string | null;
  conversationId: string;
  isGroup: boolean;
  worldId: string | null;
}

export interface LibraryParams {
  user: string;
  base: string;
}

export interface LangParams {
  user: string;
  base: string;
  /** Language extension without the dot, or null when listing all. */
  lang: string | null;
  path: string[];
}
