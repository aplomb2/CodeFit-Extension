/**
 * Firebase Configuration for CodeFit Extension
 */

export const FIREBASE_CONFIG = {
  projectId: 'codefit-348fe',
  region: 'us-central1',
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: 'codefit-348fe.firebaseapp.com',
  functionsURL: 'https://us-central1-codefit-348fe.cloudfunctions.net',
};

export const FIREBASE_FUNCTIONS = {
  // User API
  getMe: `${FIREBASE_CONFIG.functionsURL}/getMe`,
  updateMe: `${FIREBASE_CONFIG.functionsURL}/updateMe`,
  logActivity: `${FIREBASE_CONFIG.functionsURL}/logActivity`,
  getStats: `${FIREBASE_CONFIG.functionsURL}/getStats`,
  getAchievements: `${FIREBASE_CONFIG.functionsURL}/getAchievements`,
  getHealthMetrics: `${FIREBASE_CONFIG.functionsURL}/getHealthMetrics`,
  exportData: `${FIREBASE_CONFIG.functionsURL}/exportData`,

  // License API
  activateLicense: `${FIREBASE_CONFIG.functionsURL}/activateLicense`,
  verifyLicense: `${FIREBASE_CONFIG.functionsURL}/verifyLicense`,
  getMyLicense: `${FIREBASE_CONFIG.functionsURL}/getMyLicense`,
  hasFeature: `${FIREBASE_CONFIG.functionsURL}/hasFeature`,

  // Organization API (Enterprise)
  getOrganization: `${FIREBASE_CONFIG.functionsURL}/getOrganization`,
  createOrganization: `${FIREBASE_CONFIG.functionsURL}/createOrganization`,
  createTeam: `${FIREBASE_CONFIG.functionsURL}/createTeam`,
  getOrganizationAnalytics: `${FIREBASE_CONFIG.functionsURL}/getOrganizationAnalytics`,
  getROIMetrics: `${FIREBASE_CONFIG.functionsURL}/getROIMetrics`,
  createChallenge: `${FIREBASE_CONFIG.functionsURL}/createChallenge`,
  getChallengeLeaderboard: `${FIREBASE_CONFIG.functionsURL}/getChallengeLeaderboard`,

  // Health check
  healthCheck: `${FIREBASE_CONFIG.functionsURL}/healthCheck`,
};
