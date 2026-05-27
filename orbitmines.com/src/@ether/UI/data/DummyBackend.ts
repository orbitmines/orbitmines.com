import type {EtherAPI} from './EtherAPI';
import type {
  CategoryPRSummary,
  ChatConversation,
  ChatThread,
  CustomEmoji,
  FileEntry,
  InlinePR,
  PullRequest,
  Repository,
  TreeEntry,
  UserStatus,
} from './types';
import {archiveTree} from './articles';
import {allProfileUsers, profileRepo} from './profiles';

// Local-only mock backend. Everything is derived from this repo's existing
// content — archive routes (articles) and profile routes (users). No
// fabricated chat / PR / follow data; multi-user surfaces will render empty.

const ETHER_USER = 'ether';

function etherRepository(): Repository {
  const tree: TreeEntry[] = [
    {
      op: '&',
      entries: [
        <FileEntry>{
          name: 'archive',
          isDirectory: true,
          modified: 'today',
          access: 'public',
          children: archiveTree(),
        },
      ],
    },
  ];
  return {
    user: ETHER_USER,
    description: 'OrbitMines · ether root',
    tree,
  };
}

export class DummyBackend implements EtherAPI {
  // ---- File system ----
  async listDirectory(_path: string): Promise<FileEntry[]> {
    return [];
  }

  async readFile(_path: string): Promise<string | null> {
    return null;
  }

  // ---- Repos ----
  async getRepository(user: string): Promise<Repository | null> {
    if (user === ETHER_USER) return etherRepository();
    return profileRepo(user);
  }

  async getWorld(_user: string, _world: string): Promise<Repository | null> {
    // No worlds in the orbitmines.com ether surface (yet).
    return null;
  }

  async getReferencedUsers(_user: string, world?: string | null): Promise<string[]> {
    if (world) return [];
    // @ether is always referenced (the canonical root); profile users follow.
    return [ETHER_USER, ...allProfileUsers()];
  }

  async getReferencedWorlds(_user: string, _world?: string | null): Promise<string[]> {
    return [];
  }

  // ---- Pull requests (empty until multi-user) ----
  async getPullRequests(_canonicalPath: string): Promise<PullRequest[]> {
    return [];
  }

  async getPullRequest(_canonicalPath: string, _prId: number): Promise<PullRequest | null> {
    return null;
  }

  async getInlinePullRequests(_canonicalPath: string): Promise<InlinePR[]> {
    return [];
  }

  async getOpenPRCount(_canonicalPath: string): Promise<number> {
    return 0;
  }

  async getCategoryPRSummary(
    _canonicalPath: string,
    _prefix: '~' | '@',
  ): Promise<CategoryPRSummary | null> {
    return null;
  }

  async getCategoryPullRequests(
    _canonicalPath: string,
    _prefix: '~' | '@',
  ): Promise<InlinePR[]> {
    return [];
  }

  async createPullRequest(
    _canonicalPath: string,
    title: string,
    description: string,
    sourceLabel: string,
    targetLabel: string,
    author?: string,
  ): Promise<PullRequest> {
    // Single-user environment: produce a record but do not persist it
    // anywhere — surfaces that allow PR creation will be hidden in Pass 2's
    // UI until there's a real backend.
    const now = new Date().toISOString();
    return {
      id: 0,
      title,
      description,
      status: 'open',
      author: author || 'anonymous',
      createdAt: now,
      updatedAt: now,
      sourceVersion: sourceLabel,
      targetVersion: targetLabel,
      sourceLabel,
      targetLabel,
      commits: [],
      comments: [],
      activity: [],
      mergeable: false,
    };
  }

  // ---- Chat (empty until multi-user) ----
  async getChatConversation(_id: string): Promise<ChatConversation | null> {
    return null;
  }

  async getOrCreateChatConversation(
    id: string,
    participants: string[],
  ): Promise<ChatConversation> {
    const now = new Date().toISOString();
    return {
      id,
      participants,
      messages: [],
      threads: [],
      createdAt: now,
      updatedAt: now,
      isGroup: participants.length > 2,
    };
  }

  async getUserChats(_user: string): Promise<ChatConversation[]> {
    return [];
  }

  async getChatThread(_conversationId: string, _threadId: string): Promise<ChatThread | null> {
    return null;
  }

  async getCustomEmojis(_user: string): Promise<CustomEmoji[]> {
    return [];
  }

  async getUserStatus(_user: string): Promise<UserStatus> {
    return 'online';
  }
}
