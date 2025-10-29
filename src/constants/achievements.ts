import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day exercise streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: { type: 'streak', days: 7 },
    reward: { xp: 100, badge: 'week-warrior' }
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day exercise streak',
    icon: '🏆',
    category: 'streak',
    rarity: 'rare',
    requirement: { type: 'streak', days: 30 },
    reward: { xp: 500, badge: 'monthly-master' }
  },
  {
    id: 'streak_100',
    name: 'Century Club',
    description: 'Maintain a 100-day exercise streak',
    icon: '💎',
    category: 'streak',
    rarity: 'legendary',
    requirement: { type: 'streak', days: 100 },
    reward: { xp: 2000, badge: 'century-club' }
  },

  // Milestone achievements
  {
    id: 'breaks_100',
    name: 'Break Master',
    description: 'Complete 100 exercise breaks',
    icon: '💯',
    category: 'milestone',
    rarity: 'common',
    requirement: { type: 'count', action: 'break', count: 100 },
    reward: { xp: 150, badge: 'break-master' }
  },
  {
    id: 'exercises_500',
    name: 'Exercise Enthusiast',
    description: 'Complete 500 exercises',
    icon: '🎯',
    category: 'milestone',
    rarity: 'rare',
    requirement: { type: 'count', action: 'exercise', count: 500 },
    reward: { xp: 800, badge: 'exercise-enthusiast' }
  },

  // Special achievements
  {
    id: 'morning_7',
    name: 'Morning Glory',
    description: 'Exercise in the morning for 7 consecutive days',
    icon: '🌅',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'time-based', time: 'morning', days: 7 },
    reward: { xp: 200, badge: 'morning-glory' }
  },
  {
    id: 'night_owl',
    name: 'Night Owl Health',
    description: 'Exercise after 10 PM 10 times',
    icon: '🌙',
    category: 'special',
    rarity: 'epic',
    requirement: { type: 'time-based', time: 'night', count: 10 },
    reward: { xp: 300, badge: 'night-owl' }
  }
];

export const LEVELS = [
  { level: 1, name: 'Code Newbie', xpRequired: 0, icon: '🌱' },
  { level: 2, name: 'Alert Coder', xpRequired: 100, icon: '⚡' },
  { level: 3, name: 'Stretch Master', xpRequired: 250, icon: '🧘' },
  { level: 5, name: 'Healthy Coder', xpRequired: 500, icon: '💪' },
  { level: 10, name: 'Wellness Warrior', xpRequired: 1500, icon: '⚔️' },
  { level: 15, name: 'Balance Champion', xpRequired: 3000, icon: '⚖️' },
  { level: 20, name: 'Zen Master', xpRequired: 5000, icon: '🧘‍♂️' },
  { level: 30, name: 'Health Guru', xpRequired: 10000, icon: '🌟' },
  { level: 50, name: 'Immortal Developer', xpRequired: 25000, icon: '👑' }
];
