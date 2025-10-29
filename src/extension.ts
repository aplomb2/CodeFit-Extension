import * as vscode from 'vscode';
import { HealthReminderService } from './services/ReminderService';
import { ExerciseService } from './services/ExerciseService';
import { HealthTracker } from './services/HealthTracker';
import { GamificationService } from './services/GamificationService';
import { GitIntegration } from './services/GitIntegration';
import { HealthStatusBar } from './ui/StatusBar';
import { StorageManager } from './utils/storage';
import { FirebaseService } from './services/FirebaseService';

let outputChannel: vscode.OutputChannel;
let firebaseService: FirebaseService;

export function activate(context: vscode.ExtensionContext) {
  try {
    // Create output channel for debugging
    outputChannel = vscode.window.createOutputChannel('CodeFit');
    context.subscriptions.push(outputChannel);

    outputChannel.appendLine('=== CodeFit Extension Starting ===');
    console.log('CodeFit extension is now active!');

    // Show activation message
    vscode.window.showInformationMessage('✅ CodeFit is activating...');

    // Initialize storage
    const storage = new StorageManager(context);
    outputChannel.appendLine('✓ Storage initialized');

    // Initialize services in correct order to avoid circular dependencies

    // 1. Initialize HealthTracker and GamificationService first (they have no dependencies on other services)
    outputChannel.appendLine('Initializing HealthTracker...');
    const healthTracker = new HealthTracker(context, storage);
    outputChannel.appendLine('✓ HealthTracker initialized');

    outputChannel.appendLine('Initializing GamificationService...');
    const gamificationService = new GamificationService(context, storage);
    outputChannel.appendLine('✓ GamificationService initialized');

    // 2. Initialize ExerciseService (it will need references to healthTracker and gamificationService)
    outputChannel.appendLine('Initializing ExerciseService...');
    const exerciseService = new ExerciseService(context);
    outputChannel.appendLine('✓ ExerciseService initialized');

    // Set references after initialization
    outputChannel.appendLine('Setting service references...');
    exerciseService.setHealthTracker(healthTracker);
    exerciseService.setGamificationService(gamificationService);
    outputChannel.appendLine('✓ Service references set');

    // 3. Initialize ReminderService (depends on exerciseService, healthTracker, gamificationService)
    outputChannel.appendLine('Initializing ReminderService...');
    const reminderService = new HealthReminderService(
      context,
      exerciseService,
      healthTracker,
      gamificationService
    );
    outputChannel.appendLine('✓ ReminderService initialized');

    // 4. Initialize GitIntegration (depends on reminderService)
    outputChannel.appendLine('Initializing GitIntegration...');
    const gitIntegration = new GitIntegration(context, reminderService);
    outputChannel.appendLine('✓ GitIntegration initialized');

    // 5. Initialize StatusBar (depends on healthTracker)
    outputChannel.appendLine('Initializing StatusBar...');
    const statusBar = new HealthStatusBar(context, healthTracker);
    outputChannel.appendLine('✓ StatusBar initialized');

    // 6. Initialize FirebaseService (for cloud sync and enterprise features)
    outputChannel.appendLine('Initializing FirebaseService...');
    firebaseService = FirebaseService.getInstance(context);
    outputChannel.appendLine('✓ FirebaseService initialized');

    // Try to restore previous session silently
    const hasStoredToken = context.globalState.get<string>('firebaseToken');
    if (hasStoredToken) {
      outputChannel.appendLine('Previous session found, attempting silent restore...');
      firebaseService.authenticate().then((success) => {
        if (success) {
          outputChannel.appendLine('✓ Session restored successfully');
          const email = firebaseService.getUserEmail();
          const licenseType = firebaseService.getLicenseType();
          outputChannel.appendLine(`Signed in as: ${email} (License: ${licenseType})`);
        } else {
          outputChannel.appendLine('Session restore failed');
        }
      }).catch((error) => {
        outputChannel.appendLine(`Session restore error: ${error}`);
      });
    }

    // Start services
    try {
      outputChannel.appendLine('Starting ReminderService...');
      reminderService.start();
      outputChannel.appendLine('✓ ReminderService started');
    } catch (error) {
      outputChannel.appendLine(`ERROR starting ReminderService: ${error}`);
      throw error;
    }

    // Enable git integration if configured
    try {
      outputChannel.appendLine('Checking Git integration config...');
      const config = vscode.workspace.getConfiguration('codefit');
      if (config.get('git.integration')) {
        outputChannel.appendLine('Enabling Git integration...');
        gitIntegration.enable();
        outputChannel.appendLine('✓ Git integration enabled');
      } else {
        outputChannel.appendLine('Git integration disabled in config');
      }
    } catch (error) {
      outputChannel.appendLine(`ERROR with Git integration: ${error}`);
      throw error;
    }

    // Start status bar auto-update
    try {
      outputChannel.appendLine('Starting StatusBar auto-update...');
      statusBar.startAutoUpdate(60000); // Update every minute
      outputChannel.appendLine('✓ StatusBar auto-update started');
    } catch (error) {
      outputChannel.appendLine(`ERROR starting StatusBar auto-update: ${error}`);
      throw error;
    }

    // Register commands
    outputChannel.appendLine('Registering commands...');

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.openDashboard', () => {
        outputChannel.appendLine('Command: openDashboard triggered');
        try {
          healthTracker.showDashboard();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in openDashboard: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to open dashboard: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.startExercise', async () => {
        outputChannel.appendLine('Command: startExercise triggered');
        try {
          await exerciseService.showExercisePicker();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in startExercise: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to start exercise: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.takeBreak', async () => {
        outputChannel.appendLine('Command: takeBreak triggered');
        try {
          await reminderService.triggerBreakNow();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in takeBreak: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to take break: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.snooze', () => {
        outputChannel.appendLine('Command: snooze triggered');
        try {
          reminderService.snooze(30); // 30 minutes
          vscode.window.showInformationMessage('CodeFit reminders snoozed for 30 minutes');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in snooze: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to snooze: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.viewStats', () => {
        outputChannel.appendLine('Command: viewStats triggered');
        try {
          healthTracker.showStatsPanel();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in viewStats: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to view stats: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.pauseReminders', () => {
        outputChannel.appendLine('Command: pauseReminders triggered');
        try {
          if (reminderService.isPaused()) {
            reminderService.resume();
            vscode.window.showInformationMessage('CodeFit reminders resumed');
          } else {
            reminderService.pause();
            vscode.window.showInformationMessage('CodeFit reminders paused');
          }
          statusBar.update(); // Update status bar to reflect pause state
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in pauseReminders: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to pause/resume: ${errorMsg}`);
        }
      })
    );

    // Additional commands for gamification
    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.viewAchievements', () => {
        outputChannel.appendLine('Command: viewAchievements triggered');
        try {
          gamificationService.showAllAchievements();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in viewAchievements: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to view achievements: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.viewDailyQuest', () => {
        outputChannel.appendLine('Command: viewDailyQuest triggered');
        try {
          gamificationService.showDailyQuestProgress();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in viewDailyQuest: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to view daily quest: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.exportData', () => {
        outputChannel.appendLine('Command: exportData triggered');
        try {
          healthTracker.exportData();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in exportData: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to export data: ${errorMsg}`);
        }
      })
    );

    // Firebase commands (Cloud sync and enterprise features)
    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.signIn', async () => {
        outputChannel.appendLine('Command: signIn triggered');
        try {
          const success = await firebaseService.authenticate();
          if (success) {
            const email = firebaseService.getUserEmail();
            const licenseType = firebaseService.getLicenseType();

            vscode.window.showInformationMessage(
              `✓ Signed in as ${email} (${licenseType} license)`,
              'Sync Data Now',
              'View License'
            ).then(async (choice) => {
              if (choice === 'Sync Data Now') {
                await vscode.commands.executeCommand('codefit.syncData');
              } else if (choice === 'View License') {
                await vscode.commands.executeCommand('codefit.viewLicense');
              }
            });

            // Update status bar
            statusBar.update();
          } else {
            vscode.window.showErrorMessage('Sign in failed. Please try again.');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in signIn: ${errorMsg}`);
          vscode.window.showErrorMessage(`Sign in failed: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.signOut', async () => {
        outputChannel.appendLine('Command: signOut triggered');
        try {
          await firebaseService.signOut();
          vscode.window.showInformationMessage('✓ Signed out successfully');
          statusBar.update();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in signOut: ${errorMsg}`);
          vscode.window.showErrorMessage(`Sign out failed: ${errorMsg}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.syncData', async () => {
        outputChannel.appendLine('Command: syncData triggered');

        if (!firebaseService.isAuthenticated()) {
          const signIn = await vscode.window.showInformationMessage(
            'Please sign in to sync data',
            'Sign In'
          );
          if (signIn === 'Sign In') {
            await vscode.commands.executeCommand('codefit.signIn');
          }
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Syncing data to cloud...',
            cancellable: false,
          },
          async (progress) => {
            try {
              // Get local activities
              const activities = healthTracker.getAllActivities();
              let synced = 0;

              progress.report({ increment: 0, message: `Syncing ${activities.length} activities...` });

              // Sync activities to cloud
              for (let i = 0; i < activities.length; i++) {
                const activity = activities[i];
                try {
                  await firebaseService.logActivity({
                    type: 'exercise',
                    exerciseId: activity.exercise?.id,
                    exerciseName: activity.exercise?.name,
                    category: activity.exercise?.category,
                    duration: activity.duration || 0,
                    source: 'vscode',
                    completedFully: activity.completed || false,
                  });
                  synced++;

                  const percentComplete = Math.floor(((i + 1) / activities.length) * 100);
                  progress.report({
                    increment: 100 / activities.length,
                    message: `Synced ${synced}/${activities.length} activities (${percentComplete}%)`
                  });
                } catch (error) {
                  outputChannel.appendLine(`Failed to sync activity: ${error}`);
                  // Continue with next activity even if one fails
                }
              }

              vscode.window.showInformationMessage(`✓ Synced ${synced}/${activities.length} activities to cloud`);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              outputChannel.appendLine(`Error in syncData: ${errorMsg}`);
              vscode.window.showErrorMessage(`Sync failed: ${errorMsg}`);
            }
          }
        );
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('codefit.viewLicense', async () => {
        outputChannel.appendLine('Command: viewLicense triggered');

        try {
          if (!firebaseService.isAuthenticated()) {
            vscode.window.showInformationMessage(
              'Sign in to view license information',
              'Sign In'
            ).then(async (choice) => {
              if (choice === 'Sign In') {
                await vscode.commands.executeCommand('codefit.signIn');
              }
            });
            return;
          }

          const license = await firebaseService.verifyLicense();
          const email = firebaseService.getUserEmail();

          const featureList = license.features.length > 0
            ? `\n\nFeatures:\n${license.features.map(f => `• ${f}`).join('\n')}`
            : '';

          vscode.window.showInformationMessage(
            `License Information\n\nEmail: ${email}\nType: ${license.type}${featureList}`,
            'OK',
            'Visit Dashboard'
          ).then((choice) => {
            if (choice === 'Visit Dashboard') {
              vscode.env.openExternal(vscode.Uri.parse('https://www.codefit.ai/dashboard'));
            }
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          outputChannel.appendLine(`Error in viewLicense: ${errorMsg}`);
          vscode.window.showErrorMessage(`Failed to get license info: ${errorMsg}`);
        }
      })
    );

    outputChannel.appendLine('✓ All commands registered successfully!');

    // Show welcome message for first-time users
    const isFirstTime = storage.get<boolean>('firstTime', true);
    if (isFirstTime) {
      showWelcomeMessage(storage);
    }

    outputChannel.appendLine('=== CodeFit Extension Activated Successfully ===');
    console.log('CodeFit extension activated successfully');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (outputChannel) {
      outputChannel.appendLine(`FATAL ERROR: ${errorMsg}`);
      outputChannel.show();
    }
    console.error('CodeFit extension activation failed:', error);
    vscode.window.showErrorMessage(`CodeFit failed to activate: ${errorMsg}`);
    throw error;
  }
}

async function showWelcomeMessage(storage: StorageManager) {
  const response = await vscode.window.showInformationMessage(
    'Welcome to CodeFit! 💚 Stay healthy while coding. Visit www.codefit.ai to learn more. Would you like to take a quick tour?',
    'Take Tour',
    'Start Using',
    'Visit Website',
    'Maybe Later'
  );

  if (response === 'Take Tour') {
    // Show onboarding tutorial
    vscode.commands.executeCommand('codefit.openDashboard');

    // Show a series of tips
    setTimeout(() => {
      vscode.window.showInformationMessage(
        'Tip: CodeFit will remind you to take breaks based on your activity. You can customize this in settings!',
        'Got it'
      );
    }, 2000);

    setTimeout(() => {
      vscode.window.showInformationMessage(
        'Tip: Press Ctrl+Alt+E (Cmd+Alt+E on Mac) to start an exercise anytime!',
        'Got it'
      );
    }, 5000);
  } else if (response === 'Start Using') {
    vscode.window.showInformationMessage(
      'Great! CodeFit is now active. Check the status bar on the bottom right for your health stats.',
      'Show Dashboard'
    ).then((resp) => {
      if (resp === 'Show Dashboard') {
        vscode.commands.executeCommand('codefit.openDashboard');
      }
    });
  } else if (response === 'Visit Website') {
    vscode.env.openExternal(vscode.Uri.parse('https://www.codefit.ai'));
  }

  storage.set('firstTime', false);
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine('CodeFit extension deactivated');
  }
  console.log('CodeFit extension is now deactivated');
}
