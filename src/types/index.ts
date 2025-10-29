/**
 * CodeFit Shared Types
 * Used across VS Code Extension and Web Application
 */

// ============= User Types =============

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY_ADMIN = 'company_admin',
  HR_MANAGER = 'hr_manager',
  TEAM_LEAD = 'team_lead',
  MEMBER = 'member'
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  organizationId?: string;
  teamIds: string[];
  role: UserRole;
  profile: UserProfile;
  stats: UserStats;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface UserProfile {
  joinedAt: Date;
  timezone: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  reminderFrequency: 'smart' | '30min' | '60min' | '90min';
  exerciseTypes: string[];
  exerciseIntensity: 'light' | 'medium' | 'high';
  doNotDisturb: {
    enabled: boolean;
    hours: string[];
  };
}

export interface UserStats {
  healthScore: number;
  streak: number;
  longestStreak: number;
  totalExercises: number;
  totalExerciseTime: number; // minutes
  totalPoints: number;
  availablePoints: number;
  level: number;
  xp: number;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  integrations: IntegrationSettings;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  email: boolean;
  slack: boolean;
}

export interface PrivacySettings {
  analytics: 'full' | 'anonymous' | 'none';
  leaderboard: 'visible' | 'anonymous' | 'hidden';
  profileVisibility: 'public' | 'team' | 'private';
}

export interface IntegrationSettings {
  slack: boolean;
  teams: boolean;
  googleCalendar: boolean;
}

// ============= Exercise Types =============

export interface Exercise {
  id: string;
  name: string;
  category: '1min' | '3min' | '5min' | 'targeted';
  duration: number; // seconds
  steps: ExerciseStep[];
  benefits: string[];
  targetIssues?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  equipment?: string[];
  caloriesBurn: number;
  animation: {
    type: 'gif' | 'video' | 'lottie';
    url: string;
  };
  voiceGuidance?: string;
}

export interface ExerciseStep {
  instruction: string;
  duration: number;
  image?: string;
}

// ============= Activity Types =============

export interface Activity {
  id: string;
  userId: string;
  type: 'exercise' | 'break' | 'challenge_participation';
  exerciseId?: string;
  exerciseName: string;
  duration: number; // seconds
  caloriesBurned: number;
  pointsEarned: number;
  pointsBreakdown: PointsBreakdown;
  source: 'vscode' | 'web' | 'mobile' | 'slack';
  triggeredBy: 'reminder' | 'manual' | 'commit' | 'challenge';
  teamId?: string;
  challengeId?: string;
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
}

export interface PointsBreakdown {
  base: number;
  multipliers: { name: string; value: number }[];
  bonus: number;
}

// ============= Achievement Types =============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'milestone' | 'special' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: AchievementRequirement;
  reward: {
    xp: number;
    badge: string;
  };
}

export interface AchievementRequirement {
  type: 'streak' | 'count' | 'time-based' | 'speed' | 'social';
  target?: number;
  days?: number;
  count?: number;
  time?: 'morning' | 'afternoon' | 'evening' | 'night';
  action?: string;
}

// ============= Organization Types =============

export interface Organization {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  subscription: OrganizationSubscription;
  settings: OrganizationSettings;
  adminIds: string[];
  stats: OrganizationStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSubscription {
  plan: 'starter' | 'growth' | 'enterprise';
  status: 'trial' | 'active' | 'cancelled' | 'past_due';
  seatLimit: number;
  currentSeats: number;
  billingCycle: 'monthly' | 'annual';
  trialEndsAt?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface OrganizationSettings {
  pointsRules: PointsRules;
  rewardsBudget: {
    monthlyBudget: number;
    remainingBudget: number;
    pointsToUSDRate: number;
  };
  features: {
    slackIntegration: boolean;
    teamsIntegration: boolean;
    aiInsights: boolean;
    customRewards: boolean;
  };
}

export interface PointsRules {
  basePoints: {
    '1min_exercise': number;
    '3min_exercise': number;
    '5min_exercise': number;
    daily_goal: number;
    weekly_streak: number;
  };
  multipliers: {
    team_challenge: number;
    company_event: number;
    early_morning: number;
    consistency_bonus: number;
  };
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  avgHealthScore: number;
  totalExercises: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
}

// ============= Team Types =============

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  departmentId?: string;
  leaderId: string;
  memberIds: string[];
  stats: TeamStats;
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamStats {
  memberCount: number;
  avgHealthScore: number;
  totalPoints: number;
  totalExercises: number;
  rank: number;
}

export interface TeamSettings {
  isPrivate: boolean;
  pointsMultiplier: number;
  customGoals: Goal[];
}

export interface Goal {
  id: string;
  description: string;
  target: number;
  current: number;
  deadline?: Date;
}

// ============= Challenge Types =============

export interface Challenge {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: 'team-internal' | 'cross-team' | 'company-wide';
  createdBy: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  participantType: 'users' | 'teams';
  participantIds: string[];
  goal: ChallengeGoal;
  rewards: ChallengeReward[];
  leaderboard: LeaderboardEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeGoal {
  type: 'total-points' | 'avg-health-score' | 'total-exercises' | 'participation-rate';
  target?: number;
  description: string;
}

export interface ChallengeReward {
  rank: number;
  description: string;
  points?: number;
  customReward?: string;
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  participantName: string;
  score: number;
  progress: number; // percentage
}

// ============= Reward Types =============

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: 'gift-card' | 'fitness-gear' | 'experience' | 'company-perk';
  image: string;
  pointsCost: number;
  availability: number; // -1 for unlimited
  remainingStock: number;
  provider: string;
  providerData: any;
  deliveryMethod: 'email' | 'physical' | 'instant';
  estimatedDeliveryDays: number;
  organizationIds: string[]; // empty = available to all
  requiresApproval: boolean;
  minLevel?: number;
  stats: {
    totalRedemptions: number;
    avgRating?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  organizationId: string;
  pointsSpent: number;
  userPointsBalanceBefore: number;
  userPointsBalanceAfter: number;
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled' | 'failed';
  approvedBy?: string;
  approvedAt?: Date;
  deliveryMethod: string;
  deliveryInfo: {
    email?: string;
    address?: Address;
    trackingNumber?: string;
    code?: string;
  };
  requestedAt: Date;
  fulfilledAt?: Date;
  cancelledAt?: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ============= Reminder Types =============

export interface ReminderContext {
  lastActivityTime: Date;
  codeInputFrequency: number;
  lastCommitTime?: Date;
  isDebugging: boolean;
  consecutiveWorkMinutes: number;
  todayBreakCount: number;
}

export interface WorkContext {
  userId: string;
  teamId?: string;
  challengeId?: string;
  userStreakDays: number;
  isEarlyMorning: boolean;
  consecutiveMinutes: number;
  recentIssues: string[];
  preferredExercises: string[];
  currentTime: Date;
}

// ============= Level System =============

export interface Level {
  level: number;
  name: string;
  xpRequired: number;
  icon: string;
}

// ============= Daily Quest =============

export interface DailyQuest {
  id: string;
  date: Date;
  tasks: QuestTask[];
  totalXP: number;
  completed: boolean;
}

export interface QuestTask {
  id: string;
  description: string;
  target: number;
  current: number;
  xp: number;
  completed: boolean;
}

// ============= Health Metrics =============

export interface HealthMetrics {
  today: DailyMetrics;
  week: WeeklyMetrics;
  historical: HistoricalMetrics;
}

export interface DailyMetrics {
  codingTime: number;
  breaksTaken: number;
  breaksRecommended: number;
  exerciseDuration: number;
  caloriesBurned: number;
  healthScore: number;
  longestSittingStreak: number;
}

export interface WeeklyMetrics {
  totalCodingTime: number;
  totalBreaks: number;
  averageHealthScore: number;
  streak: number;
  topExercises: Exercise[];
}

export interface HistoricalMetrics {
  monthlyTrend: TimeSeriesData[];
  improvements: string[];
  concerns: string[];
}

export interface TimeSeriesData {
  date: Date;
  value: number;
}

// ============= Analytics Types =============

export interface AnalyticsData {
  timeSeries: {
    healthScores: TimeSeriesData[];
    participation: TimeSeriesData[];
    exercises: TimeSeriesData[];
  };
  aggregates: {
    totalUsers: number;
    activeUsers: number;
    avgHealthScore: number;
    totalExercises: number;
    totalPoints: number;
    totalRedemptions: number;
  };
  distributions: {
    healthScoreDistribution: Distribution;
    exerciseTypeDistribution: Distribution;
    timeOfDayDistribution: Distribution;
  };
  rankings: {
    topUsers: UserRanking[];
    topTeams: TeamRanking[];
  };
  insights: Insight[];
}

export interface Distribution {
  labels: string[];
  values: number[];
}

export interface UserRanking {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
}

export interface TeamRanking {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
}

export interface Insight {
  type: 'positive' | 'concern' | 'suggestion';
  category: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions?: string[];
}

// ============= API Response Types =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ActivityResponse {
  activityId: string;
  pointsEarned: number;
  pointsBreakdown: PointsBreakdown;
  newHealthScore: number;
  achievementsUnlocked: Achievement[];
  userStats: UserStats;
}
