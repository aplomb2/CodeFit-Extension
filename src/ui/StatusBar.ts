import * as vscode from 'vscode';
import { HealthTracker } from '../services/HealthTracker';

export class HealthStatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private updateInterval?: NodeJS.Timeout;

  constructor(
    private context: vscode.ExtensionContext,
    private healthTracker: HealthTracker
  ) {
    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );

    this.statusBarItem.command = 'codefit.openDashboard';
    this.statusBarItem.tooltip = 'Click to open CodeFit Dashboard';

    context.subscriptions.push(this.statusBarItem);
  }

  /**
   * Update status bar display
   */
  update(): void {
    const config = vscode.workspace.getConfiguration('codefit');
    const enabled = config.get<boolean>('display.statusBar', true);

    if (!enabled) {
      this.statusBarItem.hide();
      return;
    }

    const stats = this.healthTracker.getStats();
    const metrics = this.healthTracker.getHealthMetrics();

    // Build status bar text
    const parts: string[] = [];

    // Health score with icon
    const scoreIcon = this.getHealthIcon(stats.healthScore);
    parts.push(`$(${scoreIcon}) ${stats.healthScore}%`);

    // Streak with fire icon
    if (stats.streak > 0) {
      parts.push(`$(flame) ${stats.streak}`);
    }

    // Today's breaks
    if (metrics.today.breaksTaken > 0) {
      parts.push(`$(check) ${metrics.today.breaksTaken}`);
    }

    // Level (if gamification enabled)
    const gamificationEnabled = config.get<boolean>('gamification.enabled', true);
    const showLevel = config.get<boolean>('gamification.showLevel', true);

    if (gamificationEnabled && showLevel) {
      parts.push(`$(star) L${stats.level}`);
    }

    this.statusBarItem.text = parts.join('  ');

    // Set background color based on health score
    this.statusBarItem.backgroundColor = this.getBackgroundColor(stats.healthScore);

    // Update tooltip
    this.statusBarItem.tooltip = this.generateTooltip(stats, metrics);

    this.statusBarItem.show();
  }

  /**
   * Get health icon based on score
   */
  private getHealthIcon(score: number): string {
    if (score >= 90) {
      return 'heart';
    } else if (score >= 70) {
      return 'heart';
    } else if (score >= 50) {
      return 'warning';
    } else {
      return 'alert';
    }
  }

  /**
   * Get background color based on score
   */
  private getBackgroundColor(score: number): vscode.ThemeColor | undefined {
    if (score >= 80) {
      return undefined; // Default (green-ish)
    } else if (score >= 60) {
      return new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      return new vscode.ThemeColor('statusBarItem.errorBackground');
    }
  }

  /**
   * Generate tooltip text
   */
  private generateTooltip(stats: any, metrics: any): string {
    return `
CodeFit Health Status
━━━━━━━━━━━━━━━━━━━━
Health Score: ${stats.healthScore}/100
Streak: ${stats.streak} days
Today's Breaks: ${metrics.today.breaksTaken}/${metrics.today.breaksRecommended}
Exercise Time: ${metrics.today.exerciseDuration} min
Level: ${stats.level} (${stats.xp} XP)

Click to view dashboard
    `.trim();
  }

  /**
   * Start auto-update
   */
  startAutoUpdate(intervalMs: number = 60000): void {
    // Update immediately
    this.update();

    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      this.update();
    }, intervalMs);
  }

  /**
   * Stop auto-update
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  /**
   * Dispose status bar item
   */
  dispose(): void {
    this.stopAutoUpdate();
    this.statusBarItem.dispose();
  }
}
