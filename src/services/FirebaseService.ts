/**
 * Firebase Service - Handles authentication and API calls to Firebase backend
 */

import * as vscode from 'vscode';
import { FIREBASE_CONFIG, FIREBASE_FUNCTIONS } from '../config/firebase';

export interface FirebaseAuthSession {
  accessToken: string;
  account: {
    label: string; // email
    id: string;
  };
}

export class FirebaseService {
  private static instance: FirebaseService;
  private authSession: FirebaseAuthSession | null = null;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  static getInstance(context: vscode.ExtensionContext): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService(context);
    }
    return FirebaseService.instance;
  }

  /**
   * Authenticate user with Google Sign-In
   */
  async authenticate(): Promise<boolean> {
    try {
      // Check if already authenticated
      const storedToken = this.context.globalState.get<string>('firebaseToken');
      if (storedToken) {
        this.authSession = {
          accessToken: storedToken,
          account: {
            label: this.context.globalState.get<string>('userEmail') || '',
            id: this.context.globalState.get<string>('userId') || '',
          },
        };

        // Verify token is still valid
        const isValid = await this.verifyToken();
        if (isValid) {
          return true;
        }
      }

      // Request Google authentication
      const session = await vscode.authentication.getSession('google', ['email', 'profile'], {
        createIfNone: true,
      });

      if (!session) {
        vscode.window.showErrorMessage('Failed to authenticate with Google');
        return false;
      }

      // Store session
      this.authSession = {
        accessToken: session.accessToken,
        account: {
          label: session.account.label,
          id: session.account.id,
        },
      };

      // Store in global state
      await this.context.globalState.update('firebaseToken', session.accessToken);
      await this.context.globalState.update('userEmail', session.account.label);
      await this.context.globalState.update('userId', session.account.id);

      vscode.window.showInformationMessage(`Signed in as ${session.account.label}`);

      // Verify license after authentication
      await this.verifyLicense();

      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      vscode.window.showErrorMessage('Failed to authenticate. Please try again.');
      return false;
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    this.authSession = null;
    await this.context.globalState.update('firebaseToken', undefined);
    await this.context.globalState.update('userEmail', undefined);
    await this.context.globalState.update('userId', undefined);
    await this.context.globalState.update('licenseType', undefined);

    vscode.window.showInformationMessage('Signed out successfully');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authSession !== null;
  }

  /**
   * Get current user email
   */
  getUserEmail(): string | null {
    return this.authSession?.account.label || null;
  }

  /**
   * Verify authentication token
   */
  private async verifyToken(): Promise<boolean> {
    try {
      const result = await this.callFunction('healthCheck', {});
      return result.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify and get license info
   */
  async verifyLicense(): Promise<{ type: string; features: string[] }> {
    try {
      const email = this.getUserEmail();
      if (!email) {
        return { type: 'personal', features: [] };
      }

      const result = await this.callFunction('verifyLicense', {
        email,
      });

      // Store license type
      await this.context.globalState.update('licenseType', result.type);
      await this.context.globalState.update('licenseFeatures', result.features);

      return {
        type: result.type,
        features: result.features,
      };
    } catch (error) {
      console.error('License verification error:', error);
      return { type: 'personal', features: [] };
    }
  }

  /**
   * Get license type
   */
  getLicenseType(): string {
    return this.context.globalState.get<string>('licenseType') || 'personal';
  }

  /**
   * Check if user has access to a feature
   */
  hasFeature(feature: string): boolean {
    const features = this.context.globalState.get<string[]>('licenseFeatures') || [];
    return features.includes(feature);
  }

  /**
   * Call a Firebase Cloud Function
   */
  async callFunction<T = any>(functionName: string, data: any): Promise<T> {
    if (!this.authSession && functionName !== 'healthCheck') {
      throw new Error('Not authenticated. Please sign in first.');
    }

    const url = (FIREBASE_FUNCTIONS as any)[functionName];
    if (!url) {
      throw new Error(`Unknown function: ${functionName}`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authSession) {
      headers['Authorization'] = `Bearer ${this.authSession.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: 'Unknown error' },
      }));
      throw new Error(errorData.error?.message || `Function call failed: ${functionName}`);
    }

    const result = await response.json();
    return result.result;
  }

  // ============================================================================
  // User API Methods
  // ============================================================================

  async getMe() {
    return this.callFunction('getMe', {});
  }

  async updateMe(data: any) {
    return this.callFunction('updateMe', data);
  }

  async logActivity(activity: {
    type: 'exercise' | 'break';
    exerciseId?: string;
    exerciseName?: string;
    category?: string;
    duration: number;
    source: string;
    completedFully?: boolean;
    gitContext?: any;
  }) {
    return this.callFunction('logActivity', activity);
  }

  async getStats() {
    return this.callFunction('getStats', {});
  }

  async getAchievements() {
    return this.callFunction('getAchievements', {});
  }

  async getHealthMetrics() {
    return this.callFunction('getHealthMetrics', {});
  }

  async exportData(params: { startDate: string; endDate: string; format: 'json' | 'csv' }) {
    return this.callFunction('exportData', params);
  }

  // ============================================================================
  // License API Methods
  // ============================================================================

  async activateLicense(licenseKey: string) {
    return this.callFunction('activateLicense', { licenseKey });
  }

  async getMyLicense() {
    return this.callFunction('getMyLicense', {});
  }

  // ============================================================================
  // Organization API Methods (Enterprise)
  // ============================================================================

  async getOrganization(organizationId: string) {
    return this.callFunction('getOrganization', { organizationId });
  }

  async createOrganization(data: {
    name: string;
    domain: string;
    industry?: string;
    size?: string;
  }) {
    return this.callFunction('createOrganization', data);
  }

  async createTeam(organizationId: string, data: { name: string; description?: string }) {
    return this.callFunction('createTeam', { organizationId, ...data });
  }

  async getOrganizationAnalytics(organizationId: string) {
    return this.callFunction('getOrganizationAnalytics', { organizationId });
  }

  async getROIMetrics(organizationId: string) {
    return this.callFunction('getROIMetrics', { organizationId });
  }
}
