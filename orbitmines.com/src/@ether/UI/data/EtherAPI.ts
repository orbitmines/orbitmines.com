import {DummyBackend} from './DummyBackend';
import type {
  FileEntry,
  Repository,
  PullRequest,
  InlinePR,
  CategoryPRSummary,
  ChatConversation,
  ChatThread,
  CustomEmoji,
  UserStatus,
} from './types';

// Single source of data access for ether UI. Pages should not import
// DummyData / DummyBackend directly — they call getAPI() and never know
// whether they're talking to mock state or a real server.

export interface EtherAPI {
  // ---- File system ----
  listDirectory(path: string): Promise<FileEntry[]>;
  readFile(path: string): Promise<string | null>;

  // ---- Repos ----
  getRepository(user: string): Promise<Repository | null>;
  getWorld(user: string, world: string): Promise<Repository | null>;
  getReferencedUsers(user: string, world?: string | null): Promise<string[]>;
  getReferencedWorlds(user: string, world?: string | null): Promise<string[]>;

  // ---- Pull requests ----
  getPullRequests(canonicalPath: string): Promise<PullRequest[]>;
  getPullRequest(canonicalPath: string, prId: number): Promise<PullRequest | null>;
  getInlinePullRequests(canonicalPath: string): Promise<InlinePR[]>;
  getOpenPRCount(canonicalPath: string): Promise<number>;
  getCategoryPRSummary(canonicalPath: string, prefix: '~' | '@'): Promise<CategoryPRSummary | null>;
  getCategoryPullRequests(canonicalPath: string, prefix: '~' | '@'): Promise<InlinePR[]>;
  createPullRequest(
    canonicalPath: string,
    title: string,
    description: string,
    sourceLabel: string,
    targetLabel: string,
    author?: string,
  ): Promise<PullRequest>;

  // ---- Chat ----
  getChatConversation(id: string): Promise<ChatConversation | null>;
  getOrCreateChatConversation(id: string, participants: string[]): Promise<ChatConversation>;
  getUserChats(user: string): Promise<ChatConversation[]>;
  getChatThread(conversationId: string, threadId: string): Promise<ChatThread | null>;
  getCustomEmojis(user: string): Promise<CustomEmoji[]>;
  getUserStatus(user: string): Promise<UserStatus>;
}

let _api: EtherAPI | null = null;

export function getAPI(): EtherAPI {
  if (!_api) _api = new DummyBackend();
  return _api;
}

export function setAPI(api: EtherAPI): void {
  _api = api;
}
