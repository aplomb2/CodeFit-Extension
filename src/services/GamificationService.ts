import * as vscode from 'vscode';
import { Exercise, Achievement, UserStats, DailyQuest, QuestTask } from '../types';
import { StorageManager } from '../utils/storage';
import { ACHIEVEMENTS, LEVELS } from '../constants/achievements';
import { format, isToday } from 'date-fns';

export class GamificationService {
  private userStats: UserStats;
  private unlockedAchievements: Set<string>;
  private dailyQuest?: DailyQuest;

  constructor(
    private context: vscode.ExtensionContext,
    private storage: StorageManager
  ) {
    this.userStats = this.loadUserStats();
    this.unlockedAchievements = new Set(this.loadUnlockedAchievements());
    this.dailyQuest = this.loadOrGenerateDailyQuest();
  }

  /**
   * Award XP and points for completing an exercise
   */
  async awardExerciseCompletion(exercise: Exercise): Promise<{
    xpEarned: number;
    pointsEarned: number;
    leveledUp: boolean;
    newLevel?: number;
    newAchievements: Achievement[];
  }> {
    // Calculate XP based on exercise duration
    const baseXP = this.calculateExerciseXP(exercise);
    const bonusXP = this.calculateBonusXP();
    const totalXP = baseXP + bonusXP;

    // Calculate points
    const points = this.calculateExercisePoints(exercise);

    // Award XP
    const oldLevel = this.userStats.level;
    this.userStats.xp += totalXP;
    this.userStats.totalPoints += points;
    this.userStats.availablePoints += points;

    // Check for level up
    const leveledUp = this.checkAndHandleLevelUp();
    const newLevel = leveledUp ? this.userStats.level : undefined;

    // Check for achievements
    const newAchievements = await this.checkAchievements(exercise);

    // Update daily quest progress
    await this.updateDailyQuestProgress(exercise);

    // Save state
    await this.saveUserStats();
    await this.saveUnlockedAchievements();

    // Show notifications
    if (leveledUp) {
      this.showLevelUpNotification(oldLevel, this.userStats.level);
    }

    for (const achievement of newAchievements) {
      this.showAchievementNotification(achievement);
    }

    return {
      xpEarned: totalXP,
      pointsEarned: points,
      leveledUp,
      newLevel,
      newAchievements
    };
  }

  /**
   * Get current user stats
   */
  getUserStats(): UserStats {
    return { ...this.userStats };
  }

  /**
   * Get daily quest
   */
  getDailyQuest(): DailyQuest | undefined {
    return this.dailyQuest;
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => this.unlockedAchievements.has(a.id));
  }

  /**
   * Get available achievements (not yet unlocked)
   */
  getAvailableAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => !this.unlockedAchievements.has(a.id));
  }

  /**
   * Calculate XP for exercise
   */
  private calculateExerciseXP(exercise: Exercise): number {
    const baseXP = {
      '1min': 5,
      '3min': 15,
      '5min': 30,
      'targeted': 20
    };

    return baseXP[exercise.category] || 10;
  }

  /**
   * Calculate bonus XP
   */
  private calculateBonusXP(): number {
    let bonus = 0;
    const hour = new Date().getHours();

    // Early morning bonus (6-8 AM)
    if (hour >= 6 && hour < 8) {
      bonus += 5;
    }

    // Streak bonus
    if (this.userStats.streak >= 7) {
      bonus += Math.floor(this.userStats.streak / 7) * 2;
    }

    return bonus;
  }

  /**
   * Calculate points for exercise
   */
  private calculateExercisePoints(exercise: Exercise): number {
    const basePoints = {
      '1min': 5,
      '3min': 15,
      '5min': 30,
      'targeted': 20
    };

    let points = basePoints[exercise.category] || 10;

    // Apply multipliers
    const config = vscode.workspace.getConfiguration('codefit');
    if (config.get('gamification.enabled')) {
      // Consistency bonus
      if (this.userStats.streak >= 7) {
        points = Math.floor(points * 1.1);
      }
    }

    return points;
  }

  /**
   * Check and handle level up
   */
  private checkAndHandleLevelUp(): boolean {
    const currentLevel = this.findCurrentLevel(this.userStats.xp);

    if (currentLevel > this.userStats.level) {
      this.userStats.level = currentLevel;
      return true;
    }

    return false;
  }

  /**
   * Find current level based on XP
   */
  private findCurrentLevel(xp: number): number {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return LEVELS[i].level;
      }
    }

    return 1;
  }

  /**
   * Get next level info
   */
  getNextLevelInfo(): { level: number; xpRequired: number; xpProgress: number } {
    const currentLevel = this.userStats.level;
    const nextLevelData = LEVELS.find(l => l.level > currentLevel);

    if (!nextLevelData) {
      // Max level reached
      return {
        level: currentLevel,
        xpRequired: LEVELS[LEVELS.length - 1].xpRequired,
        xpProgress: 100
      };
    }

    const currentLevelData = LEVELS.find(l => l.level === currentLevel);
    const xpForCurrentLevel = currentLevelData?.xpRequired || 0;
    const xpForNextLevel = nextLevelData.xpRequired;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = this.userStats.xp - xpForCurrentLevel;

    return {
      level: nextLevelData.level,
      xpRequired: xpNeeded,
      xpProgress: Math.min(100, (xpProgress / xpNeeded) * 100)
    };
  }

  /**
   * Check for achievement unlocks
   */
  private async checkAchievements(exercise: Exercise): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip already unlocked
      if (this.unlockedAchievements.has(achievement.id)) {
        continue;
      }

      if (await this.checkAchievementRequirement(achievement, exercise)) {
        this.unlockedAchievements.add(achievement.id);
        newAchievements.push(achievement);

        // Award achievement reward
        this.userStats.xp += achievement.reward.xp;
      }
    }

    return newAchievements;
  }

  /**
   * Check if achievement requirement is met
   */
  private async checkAchievementRequirement(
    achievement: Achievement,
    exercise: Exercise
  ): Promise<boolean> {
    const req = achievement.requirement;

    switch (req.type) {
      case 'streak':
        return this.userStats.streak >= (req.days || 0);

      case 'count':
        if (req.action === 'break' || req.action === 'exercise') {
          return this.userStats.totalExercises >= (req.count || 0);
        }
        return false;

      case 'time-based':
        return this.checkTimeBasedAchievement(req);

      default:
        return false;
    }
  }

  /**
   * Check time-based achievement
   */
  private checkTimeBasedAchievement(req: any): boolean {
    const hour = new Date().getHours();

    if (req.time === 'morning') {
      return hour >= 6 && hour < 10;
    } else if (req.time === 'night') {
      return hour >= 22 || hour < 6;
    }

    return false;
  }

  /**
   * Generate or load daily quest
   */
  private loadOrGenerateDailyQuest(): DailyQuest {
    const stored = this.storage.get<DailyQuest>('dailyQuest');

    // Check if stored quest is from today
    if (stored && isToday(new Date(stored.date))) {
      // Convert date string back to Date object
      return {
        ...stored,
        date: new Date(stored.date)
      };
    }

    // Generate new quest
    return this.generateDailyQuest();
  }

  /**
   * Generate new daily quest
   */
  private generateDailyQuest(): DailyQuest {
    const today = new Date();

    const tasks: QuestTask[] = [
      {
        id: 'task_breaks',
        description: 'Complete 8 micro-breaks',
        target: 8,
        current: 0,
        xp: 40,
        completed: false
      },
      {
        id: 'task_5min',
        description: 'Complete a 5-minute exercise',
        target: 1,
        current: 0,
        xp: 30,
        completed: false
      },
      {
        id: 'task_eyes',
        description: 'Do 3 eye exercises',
        target: 3,
        current: 0,
        xp: 20,
        completed: false
      },
      {
        id: 'task_variety',
        description: 'Try 3 different exercises',
        target: 3,
        current: 0,
        xp: 50,
        completed: false
      }
    ];

    const quest: DailyQuest = {
      id: `quest_${format(today, 'yyyy-MM-dd')}`,
      date: today,
      tasks,
      totalXP: tasks.reduce((sum, t) => sum + t.xp, 0),
      completed: false
    };

    this.dailyQuest = quest;
    this.saveDailyQuest();

    return quest;
  }

  /**
   * Update daily quest progress
   */
  private async updateDailyQuestProgress(exercise: Exercise): Promise<void> {
    if (!this.dailyQuest) {
      return;
    }

    // Update task progress
    for (const task of this.dailyQuest.tasks) {
      if (task.completed) {
        continue;
      }

      if (task.id === 'task_breaks') {
        task.current++;
      } else if (task.id === 'task_5min' && exercise.category === '5min') {
        task.current++;
      } else if (task.id === 'task_eyes' && exercise.id === 'eye_exercise') {
        task.current++;
      } else if (task.id === 'task_variety') {
        // Track unique exercises (simplified)
        task.current++;
      }

      if (task.current >= task.target) {
        task.completed = true;
        this.userStats.xp += task.xp;
      }
    }

    // Check if all tasks completed
    const allCompleted = this.dailyQuest.tasks.every(t => t.completed);
    if (allCompleted && !this.dailyQuest.completed) {
      this.dailyQuest.completed = true;
      // Bonus for completing all tasks
      this.userStats.xp += 50;

      vscode.window.showInformationMessage(
        '🎉 Daily Quest Completed! +50 Bonus XP',
        'View Progress'
      ).then((response) => {
        if (response === 'View Progress') {
          this.showDailyQuestProgress();
        }
      });
    }

    await this.saveDailyQuest();
    await this.saveUserStats();
  }

  /**
   * Show daily quest progress
   */
  showDailyQuestProgress(): void {
    if (!this.dailyQuest) {
      vscode.window.showInformationMessage('No daily quest available');
      return;
    }

    const completed = this.dailyQuest.tasks.filter(t => t.completed).length;
    const total = this.dailyQuest.tasks.length;

    const message = `
Daily Quest Progress: ${completed}/${total}

${this.dailyQuest.tasks.map(task =>
      `${task.completed ? '✅' : '⏳'} ${task.description} (${task.current}/${task.target})`
    ).join('\n')}

Total XP Available: ${this.dailyQuest.totalXP}
    `.trim();

    vscode.window.showInformationMessage(message, 'OK');
  }

  /**
   * Show level up notification
   */
  private showLevelUpNotification(oldLevel: number, newLevel: number): void {
    const levelData = LEVELS.find(l => l.level === newLevel);
    const levelName = levelData?.name || `Level ${newLevel}`;
    const icon = levelData?.icon || '🎉';

    vscode.window.showInformationMessage(
      `${icon} Level Up! You're now ${levelName}!`,
      'View Progress'
    ).then((response) => {
      if (response === 'View Progress') {
        vscode.commands.executeCommand('codefit.viewStats');
      }
    });
  }

  /**
   * Show achievement notification
   */
  private showAchievementNotification(achievement: Achievement): void {
    vscode.window.showInformationMessage(
      `🏆 Achievement Unlocked: ${achievement.name}\n${achievement.description}\n+${achievement.reward.xp} XP`,
      'View Achievements'
    ).then((response) => {
      if (response === 'View Achievements') {
        this.showAllAchievements();
      }
    });
  }

  /**
   * Show all achievements
   */
  showAllAchievements(): void {
    const unlocked = this.getUnlockedAchievements();
    const available = this.getAvailableAchievements();

    const message = `
Achievements (${unlocked.length}/${ACHIEVEMENTS.length})

Unlocked:
${unlocked.map(a => `${a.icon} ${a.name}`).join('\n')}

${available.length > 0 ? `\nAvailable:\n${available.slice(0, 5).map(a =>
      `🔒 ${a.name} - ${a.description}`
    ).join('\n')}` : ''}
    `.trim();

    vscode.window.showInformationMessage(message, 'OK');
  }

  /**
   * Load user stats
   */
  private loadUserStats(): UserStats {
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
   * Save user stats
   */
  private async saveUserStats(): Promise<void> {
    await this.storage.set('userStats', this.userStats);
  }

  /**
   * Load unlocked achievements
   */
  private loadUnlockedAchievements(): string[] {
    return this.storage.get<string[]>('unlockedAchievements', []);
  }

  /**
   * Save unlocked achievements
   */
  private async saveUnlockedAchievements(): Promise<void> {
    await this.storage.set('unlockedAchievements', Array.from(this.unlockedAchievements));
  }

  /**
   * Save daily quest
   */
  private async saveDailyQuest(): Promise<void> {
    if (this.dailyQuest) {
      await this.storage.set('dailyQuest', this.dailyQuest);
    }
  }
}
