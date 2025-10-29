import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  // 1-minute exercises
  {
    id: 'eye_exercise',
    name: '20-20-20 Eye Exercise',
    category: '1min',
    duration: 60,
    steps: [
      {
        instruction: 'Look at an object 20 feet (6 meters) away',
        duration: 20
      },
      {
        instruction: 'Keep looking at the distant object',
        duration: 20
      },
      {
        instruction: 'Return to your screen',
        duration: 20
      }
    ],
    benefits: ['Reduces eye strain', 'Prevents computer vision syndrome', 'Relaxes eye muscles'],
    targetIssues: ['eye-strain'],
    difficulty: 'easy',
    equipment: [],
    caloriesBurn: 2,
    animation: {
      type: 'gif',
      url: 'media/animations/eye-exercise.gif'
    }
  },
  {
    id: 'neck_stretch',
    name: 'Neck Stretch',
    category: '1min',
    duration: 60,
    steps: [
      {
        instruction: 'Slowly turn your head to the right',
        duration: 10
      },
      {
        instruction: 'Hold for 10 seconds',
        duration: 10
      },
      {
        instruction: 'Turn your head to the left',
        duration: 10
      },
      {
        instruction: 'Hold for 10 seconds',
        duration: 10
      },
      {
        instruction: 'Repeat one more time on each side',
        duration: 20
      }
    ],
    benefits: ['Relieves neck stiffness', 'Improves flexibility', 'Reduces tension headaches'],
    targetIssues: ['neck-pain'],
    difficulty: 'easy',
    equipment: [],
    caloriesBurn: 3,
    animation: {
      type: 'gif',
      url: 'media/animations/neck-stretch.gif'
    }
  },
  {
    id: 'deep_breathing',
    name: 'Deep Breathing Exercise',
    category: '1min',
    duration: 60,
    steps: [
      {
        instruction: 'Breathe in slowly for 4 seconds',
        duration: 4
      },
      {
        instruction: 'Hold your breath for 4 seconds',
        duration: 4
      },
      {
        instruction: 'Breathe out slowly for 6 seconds',
        duration: 6
      },
      {
        instruction: 'Repeat 4 times',
        duration: 46
      }
    ],
    benefits: ['Reduces stress', 'Improves focus', 'Lowers blood pressure'],
    targetIssues: ['stress', 'anxiety'],
    difficulty: 'easy',
    equipment: [],
    caloriesBurn: 2,
    animation: {
      type: 'gif',
      url: 'media/animations/breathing.gif'
    }
  },

  // 3-minute exercises
  {
    id: 'desk_squats',
    name: 'Desk Squats',
    category: '3min',
    duration: 180,
    steps: [
      {
        instruction: 'Stand with feet shoulder-width apart',
        duration: 10
      },
      {
        instruction: 'Lower your body as if sitting back into a chair',
        duration: 3
      },
      {
        instruction: 'Keep your chest up and knees behind toes',
        duration: 2
      },
      {
        instruction: 'Push back up to starting position',
        duration: 3
      },
      {
        instruction: 'Repeat 15 times',
        duration: 162
      }
    ],
    benefits: ['Strengthens leg muscles', 'Improves circulation', 'Burns calories'],
    difficulty: 'medium',
    equipment: [],
    caloriesBurn: 15,
    animation: {
      type: 'gif',
      url: 'media/animations/squats.gif'
    }
  },
  {
    id: 'wall_pushups',
    name: 'Wall Pushups',
    category: '3min',
    duration: 180,
    steps: [
      {
        instruction: 'Stand facing a wall at arm\'s length',
        duration: 10
      },
      {
        instruction: 'Place hands flat on wall at shoulder height',
        duration: 5
      },
      {
        instruction: 'Bend elbows and lean toward wall',
        duration: 3
      },
      {
        instruction: 'Push back to starting position',
        duration: 2
      },
      {
        instruction: 'Repeat 12 times',
        duration: 160
      }
    ],
    benefits: ['Strengthens upper body', 'Improves posture', 'Builds chest and arm muscles'],
    difficulty: 'medium',
    equipment: ['wall'],
    caloriesBurn: 18,
    animation: {
      type: 'gif',
      url: 'media/animations/wall-pushups.gif'
    }
  },
  {
    id: 'arm_circles',
    name: 'Arm Circles',
    category: '3min',
    duration: 180,
    steps: [
      {
        instruction: 'Stand with feet shoulder-width apart',
        duration: 10
      },
      {
        instruction: 'Extend arms straight out to sides',
        duration: 5
      },
      {
        instruction: 'Make small circles forward for 30 seconds',
        duration: 30
      },
      {
        instruction: 'Make small circles backward for 30 seconds',
        duration: 30
      },
      {
        instruction: 'Make large circles forward for 30 seconds',
        duration: 30
      },
      {
        instruction: 'Make large circles backward for 30 seconds',
        duration: 30
      },
      {
        instruction: 'Rest and repeat',
        duration: 45
      }
    ],
    benefits: ['Improves shoulder mobility', 'Reduces shoulder tension', 'Increases blood flow'],
    difficulty: 'easy',
    equipment: [],
    caloriesBurn: 12,
    animation: {
      type: 'gif',
      url: 'media/animations/arm-circles.gif'
    }
  },

  // 5-minute exercises
  {
    id: 'walking_break',
    name: 'Walking Break',
    category: '5min',
    duration: 300,
    steps: [
      {
        instruction: 'Stand up from your desk',
        duration: 10
      },
      {
        instruction: 'Walk around your office or outside',
        duration: 240
      },
      {
        instruction: 'Take deep breaths while walking',
        duration: 30
      },
      {
        instruction: 'Return to your desk feeling refreshed',
        duration: 20
      }
    ],
    benefits: ['Improves circulation', 'Boosts energy', 'Clears mind', 'Reduces sitting time'],
    difficulty: 'easy',
    equipment: [],
    caloriesBurn: 25,
    animation: {
      type: 'gif',
      url: 'media/animations/walking.gif'
    }
  },
  {
    id: 'stair_climb',
    name: 'Stair Climbing',
    category: '5min',
    duration: 300,
    steps: [
      {
        instruction: 'Find a staircase',
        duration: 20
      },
      {
        instruction: 'Walk up and down at a comfortable pace',
        duration: 240
      },
      {
        instruction: 'Take breaks as needed',
        duration: 20
      },
      {
        instruction: 'Cool down with slow walking',
        duration: 20
      }
    ],
    benefits: ['Cardio workout', 'Strengthens legs', 'Improves stamina', 'Burns significant calories'],
    difficulty: 'medium',
    equipment: ['stairs'],
    caloriesBurn: 40,
    animation: {
      type: 'gif',
      url: 'media/animations/stairs.gif'
    }
  },
  {
    id: 'stretching_routine',
    name: 'Full Body Stretching',
    category: '5min',
    duration: 300,
    steps: [
      {
        instruction: 'Neck rolls - 30 seconds',
        duration: 30
      },
      {
        instruction: 'Shoulder shrugs - 30 seconds',
        duration: 30
      },
      {
        instruction: 'Torso twists - 30 seconds',
        duration: 30
      },
      {
        instruction: 'Side bends - 30 seconds each side',
        duration: 60
      },
      {
        instruction: 'Hip circles - 30 seconds',
        duration: 30
      },
      {
        instruction: 'Leg swings - 30 seconds each leg',
        duration: 60
      },
      {
        instruction: 'Ankle rolls - 30 seconds',
        duration: 30
      },
      {
        instruction: 'Full body shake out - 30 seconds',
        duration: 30
      }
    ],
    benefits: ['Improves flexibility', 'Reduces muscle tension', 'Prevents injury', 'Increases range of motion'],
    difficulty: 'easy',
    equipment: [],
    caloriesBurn: 20,
    animation: {
      type: 'gif',
      url: 'media/animations/stretching.gif'
    }
  },

  // Targeted exercises
  {
    id: 'back_pain_relief',
    name: 'Back Pain Relief Routine',
    category: 'targeted',
    duration: 240,
    steps: [
      {
        instruction: 'Cat-Cow stretch - 10 reps',
        duration: 60
      },
      {
        instruction: 'Seated spinal twist - 30 seconds each side',
        duration: 60
      },
      {
        instruction: 'Forward fold - 30 seconds',
        duration: 30
      },
      {
        instruction: 'Child\'s pose - 60 seconds',
        duration: 60
      },
      {
        instruction: 'Gentle back extension - 30 seconds',
        duration: 30
      }
    ],
    benefits: ['Relieves back pain', 'Improves spinal flexibility', 'Reduces muscle tension'],
    targetIssues: ['back-pain'],
    difficulty: 'easy',
    equipment: ['chair'],
    caloriesBurn: 15,
    animation: {
      type: 'gif',
      url: 'media/animations/back-relief.gif'
    }
  },
  {
    id: 'wrist_exercise',
    name: 'Wrist and Hand Exercise',
    category: 'targeted',
    duration: 120,
    steps: [
      {
        instruction: 'Wrist circles - 10 times each direction',
        duration: 30
      },
      {
        instruction: 'Finger stretches - spread and squeeze',
        duration: 30
      },
      {
        instruction: 'Wrist flexion and extension - 10 reps',
        duration: 30
      },
      {
        instruction: 'Prayer position stretch - 30 seconds',
        duration: 30
      }
    ],
    benefits: ['Prevents carpal tunnel', 'Reduces wrist pain', 'Improves grip strength'],
    targetIssues: ['wrist-pain', 'carpal-tunnel'],
    difficulty: 'easy',
    equipment: [],
    caloriesBurn: 5,
    animation: {
      type: 'gif',
      url: 'media/animations/wrist-exercise.gif'
    }
  }
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(ex => ex.id === id);
}

export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return EXERCISES.filter(ex => ex.category === category);
}

export function getExercisesByTargetIssue(issue: string): Exercise[] {
  return EXERCISES.filter(ex => ex.targetIssues?.includes(issue));
}
