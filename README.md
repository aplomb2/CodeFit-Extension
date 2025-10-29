# CodeFit - Developer Health & Wellness 💚

> **Stay healthy while coding.** Smart health reminders and exercise tracking designed specifically for developers.

[![Visual Studio Marketplace](https://img.shields.io/badge/VS%20Marketplace-CodeFit-green)](https://www.codefit.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CodeFit is your personal health companion in VS Code. It intelligently reminds you to take breaks, guides you through quick exercises, and tracks your wellness journey—all without interrupting your flow.

🌐 **[Visit CodeFit.ai](https://www.codefit.ai)** | 📖 **[Documentation](https://www.codefit.ai/docs)** | 🐛 **[Report Issues](https://github.com/aplomb2/CodeFit-Extension/issues)**

---

## ✨ Features

### 🧠 Smart Health Reminders
- **Intelligent Timing**: Learns your coding patterns and suggests breaks at natural pause points
- **Activity-Based**: Triggers reminders after Git commits or extended coding sessions
- **Do Not Disturb**: Respects your focus time and meeting schedules

### 🏃 Guided Exercise Library
- **10+ Exercises**: Curated collection including stretches, eye care, breathing exercises, and movement breaks
- **Step-by-Step Guidance**: Clear instructions with countdown timers for each exercise
- **Quick & Effective**: Exercises designed to fit into 1-5 minute breaks

### 📊 Health Dashboard
- **Real-Time Tracking**: Monitor your health score, streak, and daily activity
- **Visual Insights**: Beautiful dashboard with progress charts and metrics
- **Data Export**: Export your health data for personal records

### 🎮 Gamification System
- **XP & Levels**: Earn experience points and level up as you maintain healthy habits
- **Achievements**: Unlock achievements for milestones and consistent practice
- **Daily Quests**: Complete daily health goals for bonus rewards
- **Streak Tracking**: Build and maintain your wellness streak

### 🔧 Git Integration
- **Post-Commit Reminders**: Gentle nudges to take a break after completing work
- **Activity Detection**: Tracks coding intensity to optimize break timing

### 📍 Status Bar Integration
- **At-a-Glance Metrics**: See your health score, level, and streak in the status bar
- **Color-Coded Indicators**: Visual feedback on your current health status
- **One-Click Access**: Click to open your dashboard instantly

---

## 🚀 Getting Started

### Installation

1. Open VS Code
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Type: `ext install codefit.codefit`
4. Press Enter

**Or** install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=codefit.codefit)

### First Launch

When you first install CodeFit, you'll be greeted with a welcome message offering a quick tour. Choose:
- **Take Tour**: Walk through CodeFit's features
- **Start Using**: Jump right in
- **Visit Website**: Learn more at [CodeFit.ai](https://www.codefit.ai)

---

## 📖 Usage

### Quick Actions

| Command | Shortcut (Mac) | Shortcut (Win/Linux) | Description |
|---------|---------------|---------------------|-------------|
| **Start Exercise** | `Cmd+Alt+E` | `Ctrl+Alt+E` | Begin a guided exercise session |
| **Open Dashboard** | `Cmd+Alt+D` | `Ctrl+Alt+D` | View your health dashboard |
| **Take Break Now** | — | — | Trigger an immediate break reminder |
| **Snooze Reminders** | — | — | Pause reminders for 30 minutes |
| **Pause/Resume** | — | — | Toggle reminders on/off |

### Command Palette

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Win/Linux) and search for:
- `CodeFit: Open Dashboard`
- `CodeFit: Start Exercise`
- `CodeFit: Take Break Now`
- `CodeFit: Snooze Reminders`
- `CodeFit: View Statistics`
- `CodeFit: Pause/Resume Reminders`
- `CodeFit: View Achievements`
- `CodeFit: View Daily Quest`
- `CodeFit: Export Data`

---

## ⚙️ Configuration

Customize CodeFit to match your workflow. Access settings via `Code > Preferences > Settings` and search for "CodeFit".

### Reminder Settings

```json
{
  "codefit.reminder.frequency": "smart",  // Options: "smart", "30min", "60min", "90min"
  "codefit.reminder.style": "toast",      // Options: "toast", "statusBar", "background"
  "codefit.reminder.sound": false,        // Enable sound notifications
  "codefit.workMode": "freeform",         // Options: "pomodoro", "freeform", "deepWork"
}
```

### Do Not Disturb

```json
{
  "codefit.doNotDisturb.enabled": true,
  "codefit.doNotDisturb.hours": ["12:00-13:00", "15:00-16:00"]  // Time ranges
}
```

### Exercise Preferences

```json
{
  "codefit.exercise.intensity": "medium",  // Options: "light", "medium", "high"
  "codefit.exercise.types": ["stretch", "cardio", "breathing"],
  "codefit.exercise.duration": 3  // Minutes: 1, 3, or 5
}
```

### Gamification

```json
{
  "codefit.gamification.enabled": true,
  "codefit.gamification.showLevel": true,
  "codefit.gamification.dailyQuests": true
}
```

### Display Options

```json
{
  "codefit.display.statusBar": true,
  "codefit.display.theme": "auto"  // Options: "auto", "light", "dark"
}
```

### Git Integration

```json
{
  "codefit.git.integration": true,
  "codefit.git.commitReminder": true
}
```

---

## 🎯 Exercise Categories

### Stretching (4 exercises)
- **Neck Stretch**: Release tension from looking at screens
- **Shoulder Rolls**: Reduce upper body stiffness
- **Wrist Stretch**: Prevent repetitive strain injuries
- **Standing Side Stretch**: Full body stretch

### Eye Care (2 exercises)
- **20-20-20 Rule**: Look 20 feet away for 20 seconds every 20 minutes
- **Eye Circles**: Reduce eye strain and improve focus

### Breathing (2 exercises)
- **Deep Breathing**: Calm your mind and reduce stress
- **Box Breathing**: Improve focus and mental clarity

### Movement (2 exercises)
- **Desk Push-ups**: Quick strength exercise
- **Calf Raises**: Improve circulation

---

## 📈 Health Metrics Explained

### Health Score (0-100)
Your overall wellness score based on:
- Break frequency (40% weight)
- Exercise duration (30% weight)
- Consistency (20% weight)
- Coding time balance (10% weight)

### Streak
Consecutive days of meeting your recommended break goals. Build your streak to unlock achievements!

### XP & Levels
- **XP**: Earned by completing exercises and maintaining healthy habits
- **Levels**: Progress through 9 levels from "Newbie" to "Health Master"

---

## 🏆 Achievements

Unlock achievements by:
- Completing your first exercise
- Maintaining 7-day, 30-day, and 100-day streaks
- Reaching level milestones
- Taking all recommended breaks in a day
- Trying different exercise types

---

## 🎨 Status Bar Icons

| Icon | Meaning |
|------|---------|
| ❤️ | Your current health score
| 🔥 | Your active streak (days)
| ✓ | Breaks taken today
| ⭐ | Your current level

**Color Coding:**
- 🟢 **Green** (80-100): Excellent health habits
- 🟡 **Yellow** (60-79): Room for improvement
- 🔴 **Red** (0-59): Need more breaks

---

## 🔒 Privacy

CodeFit stores all data **locally** in your VS Code workspace. We never collect or transmit your health data.

### Data Storage
- Health statistics: Local VS Code storage
- Activity history: Local workspace storage
- No cloud sync: Your data stays on your machine

### Analytics Options
```json
{
  "codefit.privacy.analytics": "none"  // Options: "full", "anonymous", "none"
}
```

---

## 💡 Tips for Success

1. **Start Small**: Begin with just one exercise per break
2. **Be Consistent**: Build a daily habit rather than sporadic intense activity
3. **Customize**: Adjust reminder frequency to match your workflow
4. **Use Shortcuts**: Learn the keyboard shortcuts for quick access
5. **Track Progress**: Check your dashboard regularly to stay motivated

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- **Report Bugs**: [GitHub Issues](https://github.com/aplomb2/CodeFit-Extension/issues)
- **Submit PRs**: Fork the repo and submit pull requests
- **Share Feedback**: Visit [CodeFit.ai](https://www.codefit.ai) to learn more

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

Built with ❤️ for developers who care about their health.

Special thanks to the VS Code team and the open-source community.

---

## 🔗 Links

- **Website**: [www.codefit.ai](https://www.codefit.ai)
- **GitHub**: [github.com/aplomb2/CodeFit-Extension](https://github.com/aplomb2/CodeFit-Extension)
- **Issues**: [github.com/aplomb2/CodeFit-Extension/issues](https://github.com/aplomb2/CodeFit-Extension/issues)

---

<div align="center">

**Stay healthy. Code better. 💚**

[Get Started](https://www.codefit.ai) · [Report Bug](https://github.com/aplomb2/CodeFit-Extension/issues) · [Request Feature](https://github.com/aplomb2/CodeFit-Extension/issues)

</div>
