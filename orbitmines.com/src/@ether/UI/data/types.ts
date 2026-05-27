// All data shapes used by the ether UI. Mirrors the shapes from the ray
// prototype's DummyData.ts so backends (Dummy, future Http) speak the same
// vocabulary.

// ---- File tree ----

export interface FileEntry {
  name: string;
  isDirectory: boolean;
  modified: string;
  children?: TreeEntry[];
  content?: string;
  access?: 'public' | 'local' | 'private' | 'npc' | 'player' | 'everyone';
  encrypted?: boolean;
  /** Optional route this file links to. When set, file viewers should
   *  navigate here instead of trying to render `content`. Used by article
   *  files which delegate to the existing /archive/<slug> route. */
  externalRoute?: string;
}

export interface CompoundEntry {
  op: '&' | '|';
  entries: TreeEntry[];
}

export type TreeEntry = FileEntry | CompoundEntry;

export function isCompound(entry: TreeEntry): entry is CompoundEntry {
  return 'op' in entry;
}

export function flattenEntries(tree: TreeEntry[]): FileEntry[] {
  const out: FileEntry[] = [];
  for (const e of tree) {
    if (isCompound(e)) out.push(...flattenEntries(e.entries));
    else out.push(e);
  }
  return out;
}

// ---- Repository ----

export interface Repository {
  user: string;
  description: string;
  tree: TreeEntry[];
}

// ---- Pull requests ----

export type PRStatus = 'open' | 'closed' | 'merged';

export interface FileDiff {
  path: string;
  oldContent: string;
  newContent: string;
  type: 'added' | 'modified' | 'deleted';
}

export interface PRCommit {
  id: string;
  message: string;
  author: string;
  createdAt: string;
  diffs: FileDiff[];
}

export type ActivityItem =
  | { type: 'commit'; commit: PRCommit; createdAt: string }
  | { type: 'comment'; comment: ChatMessage; createdAt: string }
  | { type: 'status_change'; from: PRStatus; to: PRStatus; author: string; createdAt: string }
  | { type: 'merge'; author: string; createdAt: string };

export interface PullRequest {
  id: number;
  title: string;
  description: string;
  status: PRStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  sourceVersion: string;
  targetVersion: string;
  sourceLabel: string;
  targetLabel: string;
  commits: PRCommit[];
  comments: ChatMessage[];
  activity: ActivityItem[];
  mergeable: boolean;
}

export interface InlinePR {
  pr: PullRequest;
  relPath: string;
}

export interface CategoryPRSummary {
  openCount: number;
  closedCount: number;
  itemCount: number;
}

// ---- Chat ----

export type DeliveryStatus = 'sending' | 'sent' | 'delivered';

export interface ChatReaction {
  emoji: string;
  users: string[];
}

export interface ChatAttachment {
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface ChatMessage {
  id: number;
  author: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  editHistory?: {body: string; editedAt: string}[];
  threadId?: string;
  threadTitle?: string;
  voiceUrl?: string;
  voiceTranscript?: string;
  replyTo?: number;
  reactions: ChatReaction[];
  pinned?: boolean;
  deliveryStatus: DeliveryStatus;
  deleted?: boolean;
  forwardedFrom?: {author: string; conversationId: string};
  attachments?: ChatAttachment[];
  scheduledFor?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  messages: ChatMessage[];
}

export type UserStatus = 'online' | 'away' | 'dnd' | 'invisible';

export interface ChatConversation {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  threads: ChatThread[];
  createdAt: string;
  updatedAt: string;
  isGroup: boolean;
  worldId?: string;
  groupName?: string;
  accentColor?: string;
  archived?: boolean;
  mutedBy?: string[];
}

export interface CustomEmoji {
  name: string;
  svg: string;
}
