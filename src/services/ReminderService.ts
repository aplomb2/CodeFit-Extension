import * as vscode from 'vscode';
import { ReminderContext } from '../types';
import { ExerciseService } from './ExerciseService';
import { HealthTracker } from './HealthTracker';
import { GamificationService } from './GamificationService';

export class HealthReminderService {
  private intervalId?: NodeJS.Timeout;
  private paused: boolean = false;
  private snoozedUntil?: Date;
  private lastActivityTime: Date = new Date();
  private lastCommitTime?: Date;
  private consecutiveWorkMinutes: number = 0;
  private codeInputFrequency: number = 0;
  private todayBreakCount: number = 0;

  constructor(
    private context: vscode.ExtensionContext,
    private exerciseService: ExerciseService,
    private healthTracker: HealthTracker,
    private gamificationService: GamificationService
  ) {
    this.loadState();
    this.setupActivityTracking();
  }

  /**
   * Start the reminder service
   */
  start(): void {
    // Check every minute
    this.intervalId = setInterval(() => {
      this.checkAndNotify();
    }, 60000);

    console.log('CodeFit Reminder Service started');
  }

  /**
   * Stop the reminder service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Pause reminders
   */
  pause(): void {
    this.paused = true;
    this.saveState();
  }

  /**
   * Resume reminders
   */
  resume(): void {
    this.paused = false;
    this.snoozedUntil = undefined;
    this.saveState();
  }

  /**
   * Check if reminders are paused
   */
  isPaused(): boolean {
    return this.paused || (this.snoozedUntil !== undefined && new Date() < this.snoozedUntil);
  }

  /**
   * Snooze reminders for specified minutes
   */
  snooze(minutes: number): void {
    this.snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);
    this.saveState();
  }

  /**
   * Trigger a break immediately
   */
  async triggerBreakNow(): Promise<void> {
    const exercise = await this.exerciseService.showExercisePicker();
    if (exercise) {
      this.todayBreakCount++;
      this.consecutiveWorkMinutes = 0;
      this.saveState();
    }
  }

  /**
   * Notify about a recent commit (called by GitIntegration)
   */
  notifyCommit(commitMessage: string): void {
    this.lastCommitTime = new Date();
    this.saveState();

    // Show post-commit reminder
    setTimeout(() => {
      this.showPostCommitReminder(commitMessage);
    }, 5000); // Wait 5 seconds after commit
  }

  /**
   * Main check and notify logic
   */
  private async checkAndNotify(): Promise<void> {
    // Don't notify if paused or snoozed
    if (this.isPaused()) {
      return;
    }

    // Check Do Not Disturb hours
    if (this.isDoNotDisturbTime()) {
      return;
    }

    // Update consecutive work minutes
    this.consecutiveWorkMinutes++;

    // Get reminder context
    const context = this.getReminderContext();

    // Check if should show reminder
    if (this.shouldShowReminder(context)) {
      await this.showReminder(context);
    }

    this.saveState();
  }

  /**
   * Get current reminder context
   */
  private getReminderContext(): ReminderContext {
    return {
      lastActivityTime: this.lastActivityTime,
      codeInputFrequency: this.codeInputFrequency,
      lastCommitTime: this.lastCommitTime,
      isDebugging: this.isDebugging(),
      consecutiveWorkMinutes: this.consecutiveWorkMinutes,
      todayBreakCount: this.todayBreakCount
    };
  }

  /**
   * Determine if should show reminder based on context
   */
  private shouldShowReminder(context: ReminderContext): boolean {
    const config = vscode.workspace.getConfiguration('codefit');
    const frequency = config.get<string>('reminder.frequency', 'smart');

    // Don't interrupt high-intensity coding or debugging
    if (context.isDebugging) {
      return false;
    }

    if (context.codeInputFrequency > 50) {
      return false; // High-intensity coding
    }

    // Check based on frequency setting
    if (frequency === 'smart') {
      // Smart mode: use multiple factors

      // Strong reminder: 120+ minutes without break
      if (context.consecutiveWorkMinutes >= 120) {
        return true;
      }

      // Standard reminder: 90+ minutes
      if (context.consecutiveWorkMinutes >= 90) {
        return true;
      }

      // Light reminder: 45-60 minutes
      if (context.consecutiveWorkMinutes >= 45 && context.todayBreakCount < 8) {
        return Math.random() > 0.5; // 50% chance
      }

      // Post-commit reminder
      if (context.lastCommitTime) {
        const timeSinceCommit = Date.now() - context.lastCommitTime.getTime();
        if (timeSinceCommit < 5 * 60 * 1000 && timeSinceCommit > 1 * 60 * 1000) {
          return true;
        }
      }

      return false;
    } else {
      // Fixed frequency mode
      const minutes = parseInt(frequency.replace('min', ''));
      return context.consecutiveWorkMinutes >= minutes;
    }
  }

  /**
   * Show reminder notification
   */
  private async showReminder(context: ReminderContext): Promise<void> {
    const config = vscode.workspace.getConfiguration('codefit');
    const style = config.get<string>('reminder.style', 'toast');

    // Determine severity
    let severity: 'light' | 'standard' | 'strong' = 'standard';
    if (context.consecutiveWorkMinutes >= 120) {
      severity = 'strong';
    } else if (context.consecutiveWorkMinutes < 60) {
      severity = 'light';
    }

    const message = this.getReminderMessage(severity);
    const actions = this.getReminderActions(severity);

    let response: string | undefined;

    if (style === 'toast' || style === 'statusBar') {
      if (severity === 'strong') {
        response = await vscode.window.showWarningMessage(message, ...actions);
      } else {
        response = await vscode.window.showInformationMessage(message, ...actions);
      }
    }

    // Handle response
    if (response) {
      await this.handleReminderResponse(response);
    }
  }

  /**
   * Get reminder message based on severity
   */
  private getReminderMessage(severity: 'light' | 'standard' | 'strong'): string {
    const messages = {
      light: [
        "You've been coding for a while. Quick stretch?",
        "Time for a micro-break! Your body will thank you.",
        "Great progress! Take a 1-minute eye break?"
      ],
      standard: [
        "Time for a break! You've been coding for 90 minutes.",
        "Your health matters! Take a 3-minute exercise break.",
        "Keep your body as healthy as your code! Break time."
      ],
      strong: [
        "⚠️ Health Alert: You need a break NOW! 2+ hours of sitting.",
        "⚠️ Take a break immediately! Your health is at risk.",
        "⚠️ Mandatory break time! Get up and move!"
      ]
    };

    const pool = messages[severity];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Get reminder action buttons based on severity
   */
  private getReminderActions(severity: 'light' | 'standard' | 'strong'): string[] {
    if (severity === 'strong') {
      return ['Take 5-min Break', 'Take 3-min Break'];
    } else if (severity === 'standard') {
      return ['3-min Exercise', 'Quick Walk', 'Snooze 15min'];
    } else {
      return ['1-min Stretch', 'Eye Exercise', 'Snooze 30min'];
    }
  }

  /**
   * Handle user response to reminder
   */
  private async handleReminderResponse(response: string): Promise<void> {
    if (response.includes('Snooze')) {
      const minutes = response.includes('15') ? 15 : 30;
      this.snooze(minutes);
      vscode.window.showInformationMessage(`Reminders snoozed for ${minutes} minutes`);
    } else {
      // User chose to exercise
      const duration = response.includes('5-min') ? 5 :
                      response.includes('3-min') ? 3 : 1;

      await this.exerciseService.showExercisePicker(duration * 60);
      this.consecutiveWorkMinutes = 0;
      this.todayBreakCount++;
    }
  }

  /**
   * Show post-commit reminder
   */
  private async showPostCommitReminder(commitMessage: string): Promise<void> {
    // Analyze commit message for context
    const emotion = this.detectCommitEmotion(commitMessage);
    const message = this.getPostCommitMessage(emotion);

    const response = await vscode.window.showInformationMessage(
      message,
      '2-min Break',
      'Quick Stretch',
      'Later'
    );

    if (response && response !== 'Later') {
      const duration = response.includes('2-min') ? 120 : 60;
      await this.exerciseService.showExercisePicker(duration);
      this.consecutiveWorkMinutes = 0;
      this.todayBreakCount++;
    }
  }

  /**
   * Detect emotion from commit message
   */
  private detectCommitEmotion(message: string): 'celebration' | 'frustration' | 'milestone' | 'normal' {
    const lower = message.toLowerCase();

    const celebrationWords = ['finally', 'done', 'complete', 'success', 'yay', '🎉'];
    const frustrationWords = ['fix', 'bug', 'damn', 'wtf', 'issue'];
    const milestoneWords = ['release', 'v1.0', 'launch', 'deploy', 'merge'];

    if (celebrationWords.some(word => lower.includes(word))) {
      return 'celebration';
    }
    if (frustrationWords.some(word => lower.includes(word))) {
      return 'frustration';
    }
    if (milestoneWords.some(word => lower.includes(word))) {
      return 'milestone';
    }

    return 'normal';
  }

  /**
   * Get post-commit message based on emotion
   */
  private getPostCommitMessage(emotion: string): string {
    const messages = {
      celebration: "🎉 Awesome commit! Celebrate with a victory lap?",
      frustration: "😤 That was tough! Clear your head with a quick walk?",
      milestone: "🚀 Major milestone! You've earned a longer break!",
      normal: "Nice commit! Take a moment to stretch?"
    };

    return messages[emotion as keyof typeof messages] || messages.normal;
  }

  /**
   * Check if current time is in Do Not Disturb hours
   */
  private isDoNotDisturbTime(): boolean {
    const config = vscode.workspace.getConfiguration('codefit');
    const enabled = config.get<boolean>('doNotDisturb.enabled', true);

    if (!enabled) {
      return false;
    }

    const hours = config.get<string[]>('doNotDisturb.hours', ['12:00-13:00']);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const range of hours) {
      const [start, end] = range.split('-');
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if currently debugging
   */
  private isDebugging(): boolean {
    return vscode.debug.activeDebugSession !== undefined;
  }

  /**
   * Setup activity tracking
   */
  private setupActivityTracking(): void {
    // Track text document changes to measure code input frequency
    let recentInputs: number[] = [];

    vscode.workspace.onDidChangeTextDocument((event) => {
      this.lastActivityTime = new Date();

      // Track input frequency (characters per minute)
      const charCount = event.contentChanges.reduce((sum, change) =>
        sum + change.text.length, 0
      );

      recentInputs.push(charCount);
      if (recentInputs.length > 60) {
        recentInputs.shift();
      }

      this.codeInputFrequency = recentInputs.reduce((a, b) => a + b, 0);
    });

    // Reset daily counter at midnight
    this.scheduleMidnightReset();
  }

  /**
   * Schedule midnight reset of daily counters
   */
  private scheduleMidnightReset(): void {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.todayBreakCount = 0;
      this.saveState();

      // Schedule next reset
      this.scheduleMidnightReset();
    }, msUntilMidnight);
  }

  /**
   * Save state to storage
   */
  private saveState(): void {
    this.context.globalState.update('reminderState', {
      paused: this.paused,
      snoozedUntil: this.snoozedUntil?.getTime(),
      lastCommitTime: this.lastCommitTime?.getTime(),
      consecutiveWorkMinutes: this.consecutiveWorkMinutes,
      todayBreakCount: this.todayBreakCount
    });
  }

  /**
   * Load state from storage
   */
  private loadState(): void {
    const state = this.context.globalState.get<any>('reminderState');
    if (state) {
      this.paused = state.paused || false;
      this.snoozedUntil = state.snoozedUntil ? new Date(state.snoozedUntil) : undefined;
      this.lastCommitTime = state.lastCommitTime ? new Date(state.lastCommitTime) : undefined;
      this.consecutiveWorkMinutes = state.consecutiveWorkMinutes || 0;
      this.todayBreakCount = state.todayBreakCount || 0;
    }
  }
}
