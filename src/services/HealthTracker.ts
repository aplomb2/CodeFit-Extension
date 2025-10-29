import * as vscode from 'vscode';
import { Activity, HealthMetrics, DailyMetrics, UserStats } from '../types';
import { StorageManager } from '../utils/storage';
import { format, startOfDay, startOfWeek, isToday } from 'date-fns';

export class HealthTracker {
  private currentStats: UserStats;

  constructor(
    private context: vscode.ExtensionContext,
    private storage: StorageManager
  ) {
    this.currentStats = this.loadStats();
  }

  /**
   * Record an activity (exercise, break, etc.)
   */
  async recordActivity(activity: Partial<Activity>): Promise<void> {
    // Generate activity ID
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fullActivity: Activity = {
      id: activityId,
      userId: 'local', // For local storage
      type: 'exercise',
      exerciseId: activity.exerciseId || '',
      exerciseName: activity.exerciseName || '',
      duration: activity.duration || 0,
      caloriesBurned: activity.caloriesBurned || 0,
      pointsEarned: this.calculatePoints(activity.duration || 0),
      pointsBreakdown: {
        base: this.calculateBasePoints(activity.duration || 0),
        multipliers: [],
        bonus: 0
      },
      source: activity.source || 'vscode',
      triggeredBy: activity.triggeredBy || 'manual',
      teamId: activity.teamId,
      challengeId: activity.challengeId,
      startedAt: activity.startedAt || new Date(),
      completedAt: activity.completedAt || new Date(),
      createdAt: new Date()
    };

    // Save activity
    await this.saveActivity(fullActivity);

    // Update stats
    await this.updateStats(fullActivity);

    // Update health score
    await this.updateHealthScore();
  }

  /**
   * Get current user stats
   */
  getStats(): UserStats {
    return { ...this.currentStats };
  }

  /**
   * Get health metrics for dashboard
   */
  getHealthMetrics(): HealthMetrics {
    const activities = this.getActivities();
    const today = this.getActivitiesForDate(new Date());
    const thisWeek = this.getActivitiesThisWeek();

    const todayMetrics = this.calculateDailyMetrics(today);
    const weekMetrics = {
      totalCodingTime: this.estimateCodingTime(),
      totalBreaks: thisWeek.length,
      averageHealthScore: this.currentStats.healthScore,
      streak: this.currentStats.streak,
      topExercises: this.getTopExercises(thisWeek)
    };

    return {
      today: todayMetrics,
      week: weekMetrics,
      historical: {
        monthlyTrend: this.getMonthlyTrend(),
        improvements: this.generateImprovements(todayMetrics, weekMetrics),
        concerns: this.generateConcerns(todayMetrics, weekMetrics)
      }
    };
  }

  /**
   * Calculate health score
   */
  calculateHealthScore(): number {
    const today = this.getActivitiesForDate(new Date());
    const dailyMetrics = this.calculateDailyMetrics(today);

    let score = 100;

    // Factor 1: Break frequency (40% weight)
    const breakRatio = dailyMetrics.breaksRecommended > 0
      ? dailyMetrics.breaksTaken / dailyMetrics.breaksRecommended
      : 0;

    if (breakRatio < 0.5) {
      score -= 40;
    } else if (breakRatio < 0.7) {
      score -= 20;
    } else if (breakRatio < 0.9) {
      score -= 10;
    }

    // Factor 2: Longest sitting streak (30% weight)
    if (dailyMetrics.longestSittingStreak > 120) {
      score -= 30;
    } else if (dailyMetrics.longestSittingStreak > 90) {
      score -= 20;
    } else if (dailyMetrics.longestSittingStreak > 60) {
      score -= 10;
    }

    // Factor 3: Exercise duration (15% weight)
    if (dailyMetrics.exerciseDuration < 10) {
      score -= 15;
    } else if (dailyMetrics.exerciseDuration < 20) {
      score -= 8;
    }

    // Factor 4: Variety bonus (15% weight)
    const uniqueExercises = new Set(today.map(a => a.exerciseId)).size;
    if (uniqueExercises < 2) {
      score -= 15;
    } else if (uniqueExercises < 3) {
      score -= 8;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Update health score
   */
  private async updateHealthScore(): Promise<void> {
    this.currentStats.healthScore = this.calculateHealthScore();
    await this.saveStats();
  }

  /**
   * Update streak
   */
  private async updateStreak(): Promise<void> {
    const activities = this.getActivities();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const hasActivityToday = activities.some(a => isToday(a.createdAt));
    const hasActivityYesterday = activities.some(a =>
      format(a.createdAt, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
    );

    if (hasActivityToday) {
      if (hasActivityYesterday || this.currentStats.streak === 0) {
        this.currentStats.streak++;
      }

      if (this.currentStats.streak > this.currentStats.longestStreak) {
        this.currentStats.longestStreak = this.currentStats.streak;
      }
    } else if (!hasActivityYesterday && this.currentStats.streak > 0) {
      // Streak broken
      this.currentStats.streak = 0;
    }

    await this.saveStats();
  }

  /**
   * Show dashboard webview
   */
  showDashboard(): void {
    const panel = vscode.window.createWebviewPanel(
      'codefitDashboard',
      'CodeFit Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    panel.webview.html = this.getDashboardHtml();
  }

  /**
   * Show stats panel
   */
  showStatsPanel(): void {
    const metrics = this.getHealthMetrics();
    const stats = this.getStats();

    const message = this.formatStatsMessage(stats, metrics);

    vscode.window.showInformationMessage(
      message,
      'View Full Dashboard',
      'Export Data'
    ).then((response) => {
      if (response === 'View Full Dashboard') {
        this.showDashboard();
      } else if (response === 'Export Data') {
        this.exportData();
      }
    });
  }

  /**
   * Export health data
   */
  async exportData(): Promise<void> {
    const data = {
      stats: this.currentStats,
      activities: this.getActivities(),
      metrics: this.getHealthMetrics(),
      exportedAt: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);

    const uri = await vscode.window.showSaveDialog({
      filters: {
        'JSON': ['json']
      },
      defaultUri: vscode.Uri.file(`codefit-data-${format(new Date(), 'yyyy-MM-dd')}.json`)
    });

    if (uri) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(json, 'utf8'));
      vscode.window.showInformationMessage('Health data exported successfully!');
    }
  }

  /**
   * Calculate daily metrics
   */
  private calculateDailyMetrics(activities: Activity[]): DailyMetrics {
    const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalCalories = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);

    // Estimate coding time (8 hours default, can be improved)
    const codingTime = 480; // minutes

    // Recommend breaks every 60 minutes
    const recommended = Math.floor(codingTime / 60);

    return {
      codingTime,
      breaksTaken: activities.length,
      breaksRecommended: recommended,
      exerciseDuration: Math.floor(totalDuration / 60),
      caloriesBurned: totalCalories,
      healthScore: this.currentStats.healthScore,
      longestSittingStreak: this.calculateLongestSittingStreak(activities)
    };
  }

  /**
   * Calculate longest sitting streak
   */
  private calculateLongestSittingStreak(activities: Activity[]): number {
    if (activities.length === 0) {
      return 480; // Assume full work day if no breaks
    }

    const sortedActivities = activities.sort((a, b) =>
      a.completedAt.getTime() - b.completedAt.getTime()
    );

    let longestStreak = 0;
    let currentStreak = 0;
    let lastActivityTime = startOfDay(new Date()).getTime();

    for (const activity of sortedActivities) {
      const gap = activity.startedAt.getTime() - lastActivityTime;
      const gapMinutes = gap / (1000 * 60);

      currentStreak += gapMinutes;
      longestStreak = Math.max(longestStreak, currentStreak);

      currentStreak = 0;
      lastActivityTime = activity.completedAt.getTime();
    }

    // Add time since last activity
    const now = new Date().getTime();
    const finalGap = (now - lastActivityTime) / (1000 * 60);
    currentStreak += finalGap;
    longestStreak = Math.max(longestStreak, currentStreak);

    return Math.round(longestStreak);
  }

  /**
   * Get activities for specific date
   */
  private getActivitiesForDate(date: Date): Activity[] {
    const activities = this.getActivities();
    const dateStr = format(date, 'yyyy-MM-dd');

    return activities.filter(a =>
      format(a.createdAt, 'yyyy-MM-dd') === dateStr
    );
  }

  /**
   * Get activities for this week
   */
  private getActivitiesThisWeek(): Activity[] {
    const activities = this.getActivities();
    const weekStart = startOfWeek(new Date());

    return activities.filter(a => a.createdAt >= weekStart);
  }

  /**
   * Get all activities
   */
  private getActivities(): Activity[] {
    const stored = this.storage.get<Activity[]>('activities', []);
    // Convert date strings back to Date objects
    return stored.map(a => ({
      ...a,
      startedAt: new Date(a.startedAt),
      completedAt: new Date(a.completedAt),
      createdAt: new Date(a.createdAt)
    }));
  }

  /**
   * Save activity
   */
  private async saveActivity(activity: Activity): Promise<void> {
    const activities = this.getActivities();
    activities.push(activity);

    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }

    await this.storage.set('activities', activities);
  }

  /**
   * Update stats after activity
   */
  private async updateStats(activity: Activity): Promise<void> {
    this.currentStats.totalExercises++;
    this.currentStats.totalExerciseTime += Math.floor(activity.duration / 60);
    this.currentStats.totalPoints += activity.pointsEarned;
    this.currentStats.availablePoints += activity.pointsEarned;

    await this.updateStreak();
    await this.saveStats();
  }

  /**
   * Calculate points for activity
   */
  private calculatePoints(duration: number): number {
    return this.calculateBasePoints(duration);
  }

  /**
   * Calculate base points
   */
  private calculateBasePoints(duration: number): number {
    if (duration <= 60) {
      return 5;
    } else if (duration <= 180) {
      return 15;
    } else {
      return 30;
    }
  }

  /**
   * Get top exercises
   */
  private getTopExercises(activities: Activity[]): any[] {
    const counts: Record<string, { name: string; count: number }> = {};

    activities.forEach(a => {
      const exerciseId = a.exerciseId || 'unknown';
      if (!counts[exerciseId]) {
        counts[exerciseId] = { name: a.exerciseName, count: 0 };
      }
      counts[exerciseId].count++;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Get monthly trend
   */
  private getMonthlyTrend(): Array<{ date: Date; value: number }> {
    const activities = this.getActivities();
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentActivities = activities.filter(a => a.createdAt >= last30Days);

    // Group by date
    const byDate: Record<string, number> = {};
    recentActivities.forEach(a => {
      const dateStr = format(a.createdAt, 'yyyy-MM-dd');
      byDate[dateStr] = (byDate[dateStr] || 0) + 1;
    });

    return Object.entries(byDate).map(([date, value]) => ({
      date: new Date(date),
      value
    }));
  }

  /**
   * Generate improvement insights
   */
  private generateImprovements(todayMetrics: DailyMetrics, weekMetrics: any): string[] {
    const insights: string[] = [];

    if (weekMetrics.streak > 7) {
      insights.push(`Great ${weekMetrics.streak}-day streak! Keep it up!`);
    }

    if (todayMetrics.breaksTaken >= todayMetrics.breaksRecommended) {
      insights.push('You\'re taking all recommended breaks today!');
    }

    if (todayMetrics.healthScore > 80) {
      insights.push('Excellent health score today!');
    }

    return insights;
  }

  /**
   * Generate concern insights
   */
  private generateConcerns(todayMetrics: DailyMetrics, weekMetrics: any): string[] {
    const concerns: string[] = [];

    if (todayMetrics.longestSittingStreak > 120) {
      concerns.push('You\'ve been sitting for over 2 hours. Take a break!');
    }

    if (todayMetrics.breaksTaken < todayMetrics.breaksRecommended * 0.5) {
      concerns.push('You\'re missing too many breaks today.');
    }

    if (weekMetrics.streak === 0) {
      concerns.push('Start a new streak today!');
    }

    return concerns;
  }

  /**
   * Estimate coding time
   */
  private estimateCodingTime(): number {
    // This is a simplified estimation
    // In a real app, this could track actual editor activity
    return 40 * 60; // 40 hours per week in minutes
  }

  /**
   * Format stats message
   */
  private formatStatsMessage(stats: UserStats, metrics: HealthMetrics): string {
    return `
📊 Your CodeFit Stats

💚 Health Score: ${stats.healthScore}/100
🔥 Current Streak: ${stats.streak} days
🏆 Level ${stats.level} (${stats.xp} XP)

Today:
✅ Breaks: ${metrics.today.breaksTaken}/${metrics.today.breaksRecommended}
💪 Exercise: ${metrics.today.exerciseDuration} min
🔥 Calories: ${metrics.today.caloriesBurned} kcal

Total:
📈 ${stats.totalExercises} exercises completed
⏱️ ${stats.totalExerciseTime} minutes of exercise
🎯 ${stats.totalPoints} points earned
`.trim();
  }

  /**
   * Get dashboard HTML
   */
  private getDashboardHtml(): string {
    const stats = this.getStats();
    const metrics = this.getHealthMetrics();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeFit Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      padding: 20px;
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    .header {
      margin-bottom: 30px;
    }
    .score {
      font-size: 48px;
      font-weight: bold;
      color: #10b981;
    }
    .metric {
      margin: 15px 0;
      padding: 15px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 8px;
    }
    .metric-title {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #10b981;
      transition: width 0.3s ease;
    }
    .insight {
      padding: 10px;
      margin: 10px 0;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-left: 3px solid #10b981;
      border-radius: 4px;
    }
    .concern {
      border-left-color: #f59e0b;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CodeFit Dashboard</h1>
    <div class="score">${stats.healthScore}/100</div>
    <div>Health Score</div>
    <p style="margin-top: 15px; color: var(--vscode-descriptionForeground);">
      <a href="https://www.codefit.ai" style="color: #10b981; text-decoration: none;">🌐 Visit CodeFit.ai</a> |
      <a href="https://github.com/aplomb2/CodeFit" style="color: #10b981; text-decoration: none;">⭐ GitHub</a>
    </p>
  </div>

  <div class="section">
    <div class="section-title">Today's Activity</div>
    <div class="metric">
      <div class="metric-title">Breaks Taken</div>
      <div class="metric-value">${metrics.today.breaksTaken}/${metrics.today.breaksRecommended}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(metrics.today.breaksTaken / metrics.today.breaksRecommended) * 100}%"></div>
      </div>
    </div>
    <div class="metric">
      <div class="metric-title">Exercise Duration</div>
      <div class="metric-value">${metrics.today.exerciseDuration} minutes</div>
    </div>
    <div class="metric">
      <div class="metric-title">Calories Burned</div>
      <div class="metric-value">${metrics.today.caloriesBurned} kcal</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Your Progress</div>
    <div class="metric">
      <div class="metric-title">Current Streak</div>
      <div class="metric-value">🔥 ${stats.streak} days</div>
    </div>
    <div class="metric">
      <div class="metric-title">Level & XP</div>
      <div class="metric-value">Level ${stats.level} (${stats.xp} XP)</div>
    </div>
    <div class="metric">
      <div class="metric-title">Total Exercises</div>
      <div class="metric-value">${stats.totalExercises}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">💡 Insights</div>
    ${metrics.historical.improvements.map(improvement =>
      `<div class="insight">${improvement}</div>`
    ).join('')}
    ${metrics.historical.concerns.map(concern =>
      `<div class="insight concern">⚠️ ${concern}</div>`
    ).join('')}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Load stats from storage
   */
  private loadStats(): UserStats {
    return this.storage.get<UserStats>('userStats', {
      healthScore: 100,
      streak: 0,
      longestStreak: 0,
      totalExercises: 0,
      totalExerciseTime: 0,
      totalPoints: 0,
      availablePoints: 0,
      level: 1,
      xp: 0
    });
  }

  /**
   * Save stats to storage
   */
  private async saveStats(): Promise<void> {
    await this.storage.set('userStats', this.currentStats);
  }
}
