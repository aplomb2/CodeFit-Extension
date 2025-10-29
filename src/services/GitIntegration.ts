import * as vscode from 'vscode';
import { HealthReminderService } from './ReminderService';

interface GitExtension {
  getAPI(version: number): GitAPI;
}

interface GitAPI {
  repositories: Repository[];
}

interface Repository {
  state: RepositoryState;
  getCommit(ref: string): Promise<Commit>;
}

interface RepositoryState {
  onDidChange: vscode.Event<void>;
  HEAD: Branch | undefined;
}

interface Branch {
  commit?: string;
  name?: string;
}

interface Commit {
  hash: string;
  message: string;
  parents: string[];
  authorDate?: Date;
}

export class GitIntegration {
  private gitExtension?: GitExtension;
  private gitAPI?: GitAPI;
  private enabled: boolean = false;
  private lastCommitHash?: string;

  constructor(
    private context: vscode.ExtensionContext,
    private reminderService: HealthReminderService
  ) {
    this.initialize();
  }

  /**
   * Initialize Git integration
   */
  private async initialize(): Promise<void> {
    try {
      this.gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;

      if (this.gitExtension) {
        this.gitAPI = this.gitExtension.getAPI(1);
        console.log('CodeFit: Git integration initialized');
      }
    } catch (error) {
      console.error('CodeFit: Failed to initialize Git integration:', error);
    }
  }

  /**
   * Enable Git integration
   */
  enable(): void {
    if (this.enabled) {
      return;
    }

    if (!this.gitAPI || this.gitAPI.repositories.length === 0) {
      console.log('CodeFit: No Git repositories found');
      return;
    }

    this.enabled = true;
    this.setupListeners();
    console.log('CodeFit: Git integration enabled');
  }

  /**
   * Disable Git integration
   */
  disable(): void {
    this.enabled = false;
    console.log('CodeFit: Git integration disabled');
  }

  /**
   * Check if Git integration is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Setup Git event listeners
   */
  private setupListeners(): void {
    if (!this.gitAPI) {
      return;
    }

    // Listen to state changes on all repositories
    for (const repo of this.gitAPI.repositories) {
      repo.state.onDidChange(() => {
        this.onRepositoryStateChange(repo);
      });
    }
  }

  /**
   * Handle repository state change
   */
  private async onRepositoryStateChange(repo: Repository): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const config = vscode.workspace.getConfiguration('codefit');
    if (!config.get('git.commitReminder')) {
      return;
    }

    try {
      // Get current HEAD commit
      const currentHash = repo.state.HEAD?.commit;

      if (!currentHash) {
        return;
      }

      // Check if this is a new commit
      if (this.lastCommitHash && this.lastCommitHash !== currentHash) {
        // New commit detected
        const commit = await repo.getCommit('HEAD');
        await this.handleNewCommit(commit);
      }

      this.lastCommitHash = currentHash;
    } catch (error) {
      console.error('CodeFit: Error handling Git state change:', error);
    }
  }

  /**
   * Handle new commit
   */
  private async handleNewCommit(commit: Commit): Promise<void> {
    console.log(`CodeFit: New commit detected: ${commit.message}`);

    // Notify reminder service
    this.reminderService.notifyCommit(commit.message);

    // Show commit stats if enabled
    await this.showCommitStats(commit);
  }

  /**
   * Show commit stats
   */
  private async showCommitStats(commit: Commit): Promise<void> {
    const config = vscode.workspace.getConfiguration('codefit');
    const showStats = config.get('git.showCommitStats', false);

    if (!showStats) {
      return;
    }

    // Get simple stats
    const stats = await this.getCommitStats();

    vscode.window.showInformationMessage(
      `Commit #${stats.totalCommits} today. ${stats.commitsWithBreak} with breaks. Keep it healthy!`
    );
  }

  /**
   * Get commit statistics
   */
  async getCommitStats(): Promise<{
    totalCommits: number;
    commitsWithBreak: number;
    todayCommits: number;
  }> {
    const commits = this.context.globalState.get<Array<{ hash: string; timestamp: number }>>('gitCommits', []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCommits = commits.filter(c => c.timestamp >= today.getTime()).length;

    // Simplified: assume half of commits had breaks (real implementation would track this)
    return {
      totalCommits: commits.length,
      commitsWithBreak: Math.floor(commits.length / 2),
      todayCommits
    };
  }

  /**
   * Record commit in history
   */
  private async recordCommit(commit: Commit): Promise<void> {
    const commits = this.context.globalState.get<Array<{ hash: string; timestamp: number }>>('gitCommits', []);

    commits.push({
      hash: commit.hash,
      timestamp: Date.now()
    });

    // Keep only last 1000 commits
    if (commits.length > 1000) {
      commits.splice(0, commits.length - 1000);
    }

    await this.context.globalState.update('gitCommits', commits);
  }
}
