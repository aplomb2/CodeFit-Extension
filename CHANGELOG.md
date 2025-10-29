# Change Log

All notable changes to the "CodeFit" extension will be documented in this file.

## [0.2.0] - 2025-10-29

### Added
- ☁️ **Cloud Sync & Enterprise Features**
  - Sign in with Google account
  - Automatic cloud backup of health data
  - Cross-device data synchronization
  - License management system (Personal/Team/Enterprise tiers)
- 🔐 **New Commands**
  - `CodeFit: Sign In` - Authenticate with Google
  - `CodeFit: Sign Out` - Sign out of account
  - `CodeFit: Sync Data to Cloud` - Manually sync local data
  - `CodeFit: View License Info` - View your license details
- 🔄 **Hybrid Mode**
  - Works fully offline (local-first)
  - Automatic sync when online and signed in
  - Seamless transition between offline/online modes
- 🏢 **Enterprise Support**
  - Organization management
  - Team challenges
  - Analytics dashboard access
  - ROI metrics (Team/Enterprise plans)

### Changed
- Updated Firebase integration with production backend
- Improved status bar to show sign-in status
- Enhanced welcome flow with cloud sync option

### Technical
- Integrated FirebaseService for cloud operations
- Added public `getAllActivities()` method to HealthTracker
- Session restoration on extension activation
- Improved error handling for network operations

## [0.1.0] - 2025-10-28

### Added
- 🎉 Initial release of CodeFit
- 🧠 Smart health reminders with context awareness
  - Learns your coding patterns
  - Never interrupts during debugging
  - Respects Do Not Disturb hours
- 💪 10+ guided exercises
  - Desk stretches
  - Eye care exercises
  - Breathing exercises
  - Light cardio movements
- 📊 Health tracking dashboard
  - Health score calculation
  - Streak tracking
  - Activity history
  - Daily/weekly/monthly stats
- 🎮 Gamification system
  - XP and level progression (9 levels)
  - 7 achievements with milestones
  - Daily quests
  - Points and rewards
- 🔧 Git integration
  - Post-commit reminders
  - Commit detection
  - Smart timing after major work
- 📈 Status bar integration
  - Real-time health metrics
  - Clickable dashboard access
  - Color-coded indicators
- ⚙️ Extensive customization
  - Reminder frequency (smart, 30min, 60min, 90min)
  - Work modes (pomodoro, freeform, deep work)
  - Exercise preferences (intensity, duration, types)
  - Privacy settings
- ⌨️ Keyboard shortcuts
  - Ctrl+Alt+E / Cmd+Alt+E: Start Exercise
  - Ctrl+Alt+D / Cmd+Alt+D: Open Dashboard
- 🔒 Privacy-first design
  - All data stored locally
  - No external tracking
  - Optional anonymous analytics
  - Full data export

### Features
- Context-aware reminder timing
- Step-by-step exercise guidance with countdown timers
- Completion celebrations with XP rewards
- Team challenges support (Enterprise)
- Data export for health tracking
- Responsive and lightweight (< 1MB)

### Supported Exercises
1. Desk Stretch - 3 minutes
2. Neck Rolls - 2 minutes
3. Eye Rest (20-20-20 Rule) - 1 minute
4. Shoulder Shrugs - 2 minutes
5. Wrist Stretches - 2 minutes
6. Standing Desk Break - 5 minutes
7. Deep Breathing - 3 minutes
8. Posture Check - 1 minute
9. Quick Walk - 5 minutes
10. Hand Exercises - 2 minutes

### Requirements
- VS Code 1.85.0 or higher
- Node.js runtime (bundled with VS Code)

---

## [Unreleased]

### Planned Features
- 📱 Mobile app companion
- 🌐 Web dashboard sync
- 👥 Team leaderboards
- 🎁 Reward marketplace integration
- 📸 Exercise video demonstrations
- 🔔 Custom notification sounds
- 📅 Calendar integration
- 💬 Slack/Teams notifications
- 🌍 Multi-language support

---

Check our [roadmap](https://github.com/aplomb2/CodeFit/projects) for upcoming features!
