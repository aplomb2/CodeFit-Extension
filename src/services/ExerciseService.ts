import * as vscode from 'vscode';
import { Exercise, Activity } from '../types';
import { EXERCISES, getExerciseById, getExercisesByCategory } from '../constants/exercises';
import { HealthTracker } from './HealthTracker';
import { GamificationService } from './GamificationService';

export class ExerciseService {
  constructor(
    private context: vscode.ExtensionContext,
    private healthTracker?: HealthTracker,
    private gamificationService?: GamificationService
  ) {}

  /**
   * Set health tracker reference (after initialization)
   */
  setHealthTracker(tracker: HealthTracker): void {
    this.healthTracker = tracker;
  }

  /**
   * Set gamification service reference (after initialization)
   */
  setGamificationService(service: GamificationService): void {
    this.gamificationService = service;
  }

  /**
   * Show exercise picker and execute selected exercise
   */
  async showExercisePicker(suggestedDuration?: number): Promise<Exercise | undefined> {
    const items = this.createExerciseQuickPickItems(suggestedDuration);

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: suggestedDuration
        ? `Choose a ${Math.floor(suggestedDuration / 60)}-minute exercise`
        : 'Choose an exercise',
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selected && selected.exercise) {
      return await this.executeExercise(selected.exercise);
    }

    return undefined;
  }

  /**
   * Execute a specific exercise by ID
   */
  async executeExerciseById(exerciseId: string): Promise<Exercise | undefined> {
    const exercise = getExerciseById(exerciseId);
    if (exercise) {
      return await this.executeExercise(exercise);
    }

    vscode.window.showErrorMessage(`Exercise "${exerciseId}" not found`);
    return undefined;
  }

  /**
   * Show exercises by category
   */
  async showCategoryPicker(): Promise<void> {
    const categories = [
      { label: '⚡ 1 Minute', description: 'Quick micro-breaks', category: '1min' as const },
      { label: '💪 3 Minutes', description: 'Short exercises', category: '3min' as const },
      { label: '🏃 5 Minutes', description: 'Longer breaks', category: '5min' as const },
      { label: '🎯 Targeted', description: 'Specific problem areas', category: 'targeted' as const }
    ];

    const selected = await vscode.window.showQuickPick(categories, {
      placeHolder: 'Select exercise duration'
    });

    if (selected) {
      const exercises = getExercisesByCategory(selected.category);
      await this.showExerciseListFromCategory(exercises);
    }
  }

  /**
   * Execute an exercise with step-by-step guidance
   */
  private async executeExercise(exercise: Exercise): Promise<Exercise> {
    const startTime = new Date();

    // Show starting message
    const startResponse = await vscode.window.showInformationMessage(
      `Starting: ${exercise.name} (${Math.floor(exercise.duration / 60)} min)`,
      'Begin',
      'Cancel'
    );

    if (startResponse !== 'Begin') {
      return exercise;
    }

    // Execute each step
    let completed = true;
    for (let i = 0; i < exercise.steps.length; i++) {
      const step = exercise.steps[i];
      const stepResult = await this.executeStep(step, i + 1, exercise.steps.length);

      if (!stepResult) {
        completed = false;
        break;
      }
    }

    if (completed) {
      const endTime = new Date();
      await this.handleExerciseCompletion(exercise, startTime, endTime);
    } else {
      vscode.window.showInformationMessage('Exercise cancelled. Try again when ready!');
    }

    return exercise;
  }

  /**
   * Execute a single exercise step
   */
  private async executeStep(
    step: { instruction: string; duration: number },
    stepNumber: number,
    totalSteps: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      let countdown = step.duration;
      let progressInterval: NodeJS.Timeout;

      // Create status bar item for countdown
      const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      statusBar.text = `$(clock) Step ${stepNumber}/${totalSteps}: ${countdown}s`;
      statusBar.show();

      // Show step instruction
      vscode.window.showInformationMessage(
        `Step ${stepNumber}/${totalSteps}: ${step.instruction} (${step.duration}s)`,
        'Skip',
        'Stop Exercise'
      ).then((response) => {
        clearInterval(progressInterval);
        statusBar.dispose();

        if (response === 'Stop Exercise') {
          resolve(false);
        } else {
          resolve(true);
        }
      });

      // Update countdown
      progressInterval = setInterval(() => {
        countdown--;
        statusBar.text = `$(clock) Step ${stepNumber}/${totalSteps}: ${countdown}s`;

        if (countdown <= 0) {
          clearInterval(progressInterval);
          statusBar.dispose();
          resolve(true);
        }
      }, 1000);
    });
  }

  /**
   * Handle exercise completion
   */
  private async handleExerciseCompletion(
    exercise: Exercise,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    // Record activity
    const activity: Partial<Activity> = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      duration: exercise.duration,
      caloriesBurned: exercise.caloriesBurn,
      source: 'vscode',
      triggeredBy: 'manual',
      startedAt: startTime,
      completedAt: endTime
    };

    // Save to health tracker
    if (this.healthTracker) {
      await this.healthTracker.recordActivity(activity);
    }

    // Award points and XP via gamification service
    let xpEarned = 0;
    let newAchievements: any[] = [];

    if (this.gamificationService) {
      const result = await this.gamificationService.awardExerciseCompletion(exercise);
      xpEarned = result.xpEarned;
      newAchievements = result.newAchievements;
    }

    // Show completion message
    await this.showCompletionCelebration(exercise, xpEarned, newAchievements);
  }

  /**
   * Show completion celebration
   */
  private async showCompletionCelebration(
    exercise: Exercise,
    xpEarned: number,
    newAchievements: any[]
  ): Promise<void> {
    let message = `🎉 Great job! Completed ${exercise.name}`;

    if (xpEarned > 0) {
      message += `\n+${xpEarned} XP earned!`;
    }

    if (newAchievements.length > 0) {
      message += `\n🏆 New achievement: ${newAchievements[0].name}!`;
    }

    message += `\n🔥 ${exercise.caloriesBurn} calories burned`;

    const response = await vscode.window.showInformationMessage(
      message,
      'View Stats',
      'Another Exercise',
      'Back to Code'
    );

    if (response === 'View Stats') {
      vscode.commands.executeCommand('codefit.viewStats');
    } else if (response === 'Another Exercise') {
      await this.showExercisePicker();
    }
  }

  /**
   * Create quick pick items for exercises
   */
  private createExerciseQuickPickItems(suggestedDuration?: number): Array<{
    label: string;
    description: string;
    detail: string;
    exercise: Exercise;
  }> {
    let exercisesToShow = EXERCISES;

    // Filter by suggested duration if provided
    if (suggestedDuration) {
      const targetCategory = suggestedDuration <= 60 ? '1min' :
                             suggestedDuration <= 180 ? '3min' : '5min';
      exercisesToShow = EXERCISES.filter(ex => ex.category === targetCategory);
    }

    return exercisesToShow.map(exercise => ({
      label: `${this.getCategoryIcon(exercise.category)} ${exercise.name}`,
      description: `${Math.floor(exercise.duration / 60)} min • ${exercise.caloriesBurn} cal`,
      detail: exercise.benefits[0],
      exercise
    }));
  }

  /**
   * Show exercise list from category
   */
  private async showExerciseListFromCategory(exercises: Exercise[]): Promise<void> {
    const items = exercises.map(exercise => ({
      label: exercise.name,
      description: `${Math.floor(exercise.duration / 60)} min • ${exercise.caloriesBurn} cal`,
      detail: exercise.benefits.join(', '),
      exercise
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Choose an exercise'
    });

    if (selected) {
      await this.executeExercise(selected.exercise);
    }
  }

  /**
   * Get icon for exercise category
   */
  private getCategoryIcon(category: Exercise['category']): string {
    const icons = {
      '1min': '⚡',
      '3min': '💪',
      '5min': '🏃',
      'targeted': '🎯'
    };

    return icons[category] || '🏋️';
  }

  /**
   * Get random exercise from category
   */
  getRandomExercise(category?: Exercise['category']): Exercise {
    let pool = EXERCISES;

    if (category) {
      pool = getExercisesByCategory(category);
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Get exercise recommendations based on time of day
   */
  getRecommendedExercises(): Exercise[] {
    const hour = new Date().getHours();

    if (hour < 10) {
      // Morning: energizing exercises
      return EXERCISES.filter(ex =>
        ex.name.includes('Walk') || ex.name.includes('Stretch')
      );
    } else if (hour > 14 && hour < 17) {
      // Afternoon: combat slump
      return EXERCISES.filter(ex =>
        ex.category === '3min' || ex.name.includes('Stair')
      );
    } else {
      // Default: all exercises
      return EXERCISES;
    }
  }
}
