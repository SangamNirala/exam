// Mock data for AI-Driven Inclusive Assessment Tools

export const mockStatistics = {
  totalAssessments: 125847,
  studentsEvaluated: 89234,
  institutionsUsing: 1456,
  accessibilityFeatures: 23
};

export const mockFeatures = [
  {
    id: 1,
    title: "AI-Powered Question Generation",
    description: "Generate comprehensive questions from any document using advanced Gemini AI",
    icon: "Brain",
    gradient: "from-slate-900 to-slate-700"
  },
  {
    id: 2,
    title: "Complete Accessibility Support", 
    description: "Text-to-speech, speech-to-text, and alternative input methods for PWD candidates",
    icon: "Accessibility",
    gradient: "from-slate-800 to-slate-600"
  },
  {
    id: 3,
    title: "Multi-Mode Assessment",
    description: "Online, offline, and blended assessment modes with seamless switching",
    icon: "MonitorSpeaker",
    gradient: "from-slate-700 to-slate-500"
  },
  {
    id: 4,
    title: "Real-Time Analytics",
    description: "Advanced analytics with detailed performance insights and predictions",
    icon: "BarChart3",
    gradient: "from-slate-600 to-slate-400"
  },
  {
    id: 5,
    title: "All Exam Types Supported",
    description: "MCQ, descriptive, coding, viva, practical, and pen-paper evaluations",
    icon: "FileText",
    gradient: "from-slate-500 to-slate-300"
  }
];

export const mockTestimonials = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    role: "Director, Skill Development Council",
    message: "This platform has revolutionized how we conduct assessments across our institutes.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b9c08c32?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Principal, ITI Delhi",
    message: "The accessibility features ensure no student is left behind. Truly inclusive assessment.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Prof. Anita Desai",
    role: "Assessment Specialist",
    message: "AI-powered evaluation saves hours while maintaining accuracy and fairness.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  }
];

export const mockDemoScenarios = [
  {
    id: 'ai-generation',
    title: 'AI Question Generation',
    description: 'Upload a document and watch AI create comprehensive questions',
    action: 'Try AI Generation'
  },
  {
    id: 'accessibility',
    title: 'Accessibility Features',
    description: 'Experience text-to-speech, voice input, and other PWD features',
    action: 'Test Accessibility'
  },
  {
    id: 'analytics',
    title: 'Real-Time Analytics',
    description: 'Explore detailed performance insights and predictive analytics',
    action: 'View Analytics'
  }
];