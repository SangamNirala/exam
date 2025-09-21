import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Users,
  Monitor,
  Wifi,
  Volume2,
  Headphones,
  Camera,
  Mic,
  Battery,
  HardDrive,
  Cpu,
  Globe,
  ArrowRight,
  Play,
  Pause,
  RotateCw,
  Eye,
  Info,
  HelpCircle
} from 'lucide-react';

const ExamInstructions = ({ examDetails, onComplete, onAccessibilitySettings }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [systemChecks, setSystemChecks] = useState({});
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  const sections = [
    {
      id: 'academic-integrity',
      title: 'Academic Integrity Guidelines',
      icon: Shield,
      content: [
        {
          type: 'text',
          content: 'Welcome to your assessment. This examination is conducted under strict academic integrity standards to ensure fairness for all students.'
        },
        {
          type: 'rules',
          title: 'What is NOT allowed during the exam:',
          items: [
            'Communication with other people (in person, phone, chat, etc.)',
            'Access to unauthorized websites, applications, or materials',
            'Use of external devices not specified for the exam',
            'Taking screenshots or recording the exam content',
            'Leaving the exam environment without permission',
            'Sharing exam content with others before or after the exam'
          ]
        },
        {
          type: 'rules',
          title: 'What IS allowed during the exam:',
          items: [
            'Use of approved reference materials (if specified)',
            'Basic calculator for mathematical calculations',
            'Scratch paper for notes (if permitted)',
            'Short breaks (if exam duration allows)',
            'Accessibility features as configured'
          ]
        },
        {
          type: 'warning',
          content: 'Violation of academic integrity will result in immediate exam termination and may lead to disciplinary action.'
        }
      ]
    },
    {
      id: 'technical-requirements',
      title: 'Technical Requirements & System Check',
      icon: Monitor,
      content: [
        {
          type: 'text',
          content: 'Ensure your system meets the minimum requirements for optimal exam experience.'
        },
        {
          type: 'requirements',
          title: 'Minimum System Requirements:',
          items: [
            'Stable internet connection (minimum 5 Mbps)',
            'Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)',
            'Working camera and microphone for verification',
            'Screen resolution of at least 1024x768',
            '4GB RAM and adequate storage space',
            'Updated operating system with latest security patches'
          ]
        },
        {
          type: 'systemcheck',
          title: 'Live System Check'
        }
      ]
    },
    {
      id: 'behavioral-expectations',
      title: 'Behavioral Expectations & Monitoring',
      icon: Eye,
      content: [
        {
          type: 'text',
          content: 'This exam includes behavioral monitoring to maintain integrity. Please understand what is expected during the assessment.'
        },
        {
          type: 'monitoring',
          title: 'What we monitor during the exam:',
          items: [
            'Face position and eye movement patterns',
            'Unusual head movements or looking away frequently',
            'Multiple faces detected in the camera view',
            'Audio levels for conversation detection',
            'Browser focus and tab switching attempts',
            'System behavior and application usage'
          ]
        },
        {
          type: 'guidelines',
          title: 'Behavioral Guidelines:',
          items: [
            'Remain seated and face the camera throughout the exam',
            'Keep your eyes focused on the screen',
            'Avoid excessive movements or gestures',
            'Speak only when using speech-to-text features',
            'Do not use headphones unless specifically permitted',
            'Maintain a quiet environment free from distractions'
          ]
        },
        {
          type: 'video',
          title: 'Watch: Proper Exam Behavior',
          description: 'A 2-minute video showing correct posture and behavior during the exam'
        }
      ]
    },
    {
      id: 'accessibility-features',
      title: 'Accessibility & Support Features',
      icon: Volume2,
      content: [
        {
          type: 'text',
          content: 'Our platform includes comprehensive accessibility features to ensure equal access for all students.'
        },
        {
          type: 'features',
          title: 'Available Accessibility Features:',
          items: [
            'Text-to-Speech with adjustable speed and voice',
            'Speech-to-Text for voice input responses',
            'Font size adjustment (100% to 300% scaling)',
            'High contrast themes for better visibility',
            'Keyboard-only navigation support',
            'Screen reader compatibility (NVDA, JAWS, VoiceOver)',
            'Extended time options for qualified students',
            'Sign language video instructions'
          ]
        },
        {
          type: 'customize',
          title: 'Customize Your Experience'
        }
      ]
    },
    {
      id: 'exam-interface',
      title: 'Exam Interface & Navigation',
      icon: BookOpen,
      content: [
        {
          type: 'text',
          content: 'Familiarize yourself with the exam interface and navigation features before starting.'
        },
        {
          type: 'interface',
          title: 'Key Interface Elements:',
          items: [
            'Question navigation panel on the left side',
            'Timer display showing remaining time',
            'Progress indicator showing completion status',
            'Flag questions for review feature',
            'Save progress automatically every 30 seconds',
            'Submit button available only when ready'
          ]
        },
        {
          type: 'navigation',
          title: 'Navigation Tips:',
          items: [
            'Use Previous/Next buttons to move between questions',
            'Click question numbers for quick navigation',
            'Flag difficult questions to return later',
            'Review all answers before final submission',
            'Use keyboard shortcuts for faster navigation',
            'Take advantage of the review period if provided'
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    // Calculate estimated reading time (average 200 words per minute)
    const totalWords = sections.reduce((total, section) => {
      return total + section.content.reduce((sectionTotal, item) => {
        if (item.type === 'text') {
          return sectionTotal + item.content.split(' ').length;
        }
        if (item.items) {
          return sectionTotal + item.items.join(' ').split(' ').length;
        }
        return sectionTotal;
      }, 0);
    }, 0);
    
    setEstimatedReadTime(Math.ceil(totalWords / 200));
  }, []);

  const runSystemCheck = async () => {
    setIsRunningChecks(true);
    const checks = {};

    // Browser check
    checks.browser = {
      name: 'Browser Compatibility',
      status: 'checking'
    };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 1000));
    checks.browser.status = 'passed';
    checks.browser.details = 'Chrome 120.0 - Compatible';

    // Internet connection
    checks.internet = {
      name: 'Internet Connection',
      status: 'checking'
    };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 1500));
    checks.internet.status = 'passed';
    checks.internet.details = 'Speed: 45.2 Mbps - Excellent';

    // Camera check
    checks.camera = {
      name: 'Camera Access',
      status: 'checking'
    };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 1200));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      checks.camera.status = 'passed';
      checks.camera.details = 'Camera detected and accessible';
    } catch (error) {
      checks.camera.status = 'failed';
      checks.camera.details = 'Camera access denied';
    }

    // Microphone check
    checks.microphone = {
      name: 'Microphone Access',
      status: 'checking'
    };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      checks.microphone.status = 'passed';
      checks.microphone.details = 'Microphone detected and accessible';
    } catch (error) {
      checks.microphone.status = 'failed';
      checks.microphone.details = 'Microphone access denied';
    }

    // System performance
    checks.performance = {
      name: 'System Performance',
      status: 'checking'
    };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 800));
    checks.performance.status = 'passed';
    checks.performance.details = 'CPU: Good, RAM: 8GB Available';

    // Storage check
    checks.storage = {
      name: 'Available Storage',
      status: 'checking'
    };
    setSystemChecks({...checks});
    await new Promise(resolve => setTimeout(resolve, 600));
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const availableGB = ((estimate.quota - estimate.usage) / (1024 ** 3)).toFixed(1);
        checks.storage.status = 'passed';
        checks.storage.details = `${availableGB} GB available`;
      } catch {
        checks.storage.status = 'passed';
        checks.storage.details = 'Sufficient storage available';
      }
    } else {
      checks.storage.status = 'passed';
      checks.storage.details = 'Storage check not available';
    }

    setSystemChecks(checks);
    setIsRunningChecks(false);
  };

  const markSectionComplete = (sectionIndex) => {
    setCompletedSections(prev => new Set(prev).add(sectionIndex));
  };

  const handleSectionChange = (newSection) => {
    if (newSection < sections.length) {
      setCurrentSection(newSection);
      setReadingProgress(0);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <RotateCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />;
    }
  };

  const renderContent = (item, index) => {
    switch (item.type) {
      case 'text':
        return (
          <p key={index} className="text-slate-700 leading-relaxed mb-4">
            {item.content}
          </p>
        );

      case 'rules':
      case 'requirements':
      case 'monitoring':
      case 'features':
      case 'interface':
      case 'navigation':
      case 'guidelines':
        return (
          <div key={index} className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3">{item.title}</h4>
            <ul className="space-y-2">
              {item.items.map((listItem, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{listItem}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'warning':
        return (
          <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 font-medium">{item.content}</p>
            </div>
          </div>
        );

      case 'systemcheck':
        return (
          <div key={index} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">{item.title}</h4>
              <Button 
                onClick={runSystemCheck}
                disabled={isRunningChecks}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                {isRunningChecks ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run System Check
                  </>
                )}
              </Button>
            </div>
            
            {Object.keys(systemChecks).length > 0 && (
              <div className="space-y-3">
                {Object.entries(systemChecks).map(([key, check]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <span className="font-medium text-slate-900">{check.name}</span>
                    </div>
                    {check.details && (
                      <span className="text-sm text-slate-600">{check.details}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div key={index} className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3">{item.title}</h4>
            <div className="bg-slate-100 rounded-xl p-8 text-center">
              <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">{item.description}</p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Play className="w-4 h-4 mr-2" />
                Play Video
              </Button>
            </div>
          </div>
        );

      case 'customize':
        return (
          <div key={index} className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3">{item.title}</h4>
            <Button 
              onClick={onAccessibilitySettings}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Open Accessibility Settings
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    return completedSections.size === sections.length;
  };

  const currentSectionData = sections[currentSection];
  const IconComponent = currentSectionData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pre-Exam Instructions</h1>
              <p className="text-slate-600">{examDetails?.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-4 h-4 mr-1" />
                ~{estimatedReadTime} min read
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {completedSections.size}/{sections.length} sections completed
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Instructions Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sections.map((section, index) => {
                  const SectionIcon = section.icon;
                  const isCompleted = completedSections.has(index);
                  const isCurrent = currentSection === index;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(index)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all ${
                        isCurrent ? 'bg-blue-100 border-blue-300 border-2' :
                        isCompleted ? 'bg-green-50 border-green-200 border' :
                        'bg-slate-50 border-slate-200 border hover:bg-slate-100'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isCurrent ? 'bg-blue-200' :
                        isCompleted ? 'bg-green-200' :
                        'bg-slate-200'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <SectionIcon className={`w-5 h-5 ${
                            isCurrent ? 'text-blue-600' : 'text-slate-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${
                          isCurrent ? 'text-blue-900' :
                          isCompleted ? 'text-green-900' :
                          'text-slate-900'
                        }`}>
                          {section.title}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {isCompleted ? 'Completed' : 
                           isCurrent ? 'Reading...' : 'Not started'}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Final Step */}
                <div className={`p-4 rounded-xl border-2 ${
                  canProceed() ? 'bg-green-100 border-green-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-center">
                    <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                      canProceed() ? 'text-green-600' : 'text-slate-400'
                    }`} />
                    <p className={`font-semibold text-sm ${
                      canProceed() ? 'text-green-900' : 'text-slate-600'
                    }`}>
                      Ready to Proceed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <span>{currentSectionData.title}</span>
                  </CardTitle>
                  <Badge variant="outline">
                    Section {currentSection + 1} of {sections.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="prose max-w-none">
                {currentSectionData.content.map((item, index) => renderContent(item, index))}
                
                {/* Section completion */}
                <div className="flex items-center justify-between pt-8 border-t not-prose">
                  <div className="flex items-center space-x-4">
                    {currentSection > 0 && (
                      <Button 
                        variant="outline"
                        onClick={() => handleSectionChange(currentSection - 1)}
                        className="rounded-xl"
                      >
                        Previous Section
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {!completedSections.has(currentSection) && (
                      <Button 
                        onClick={() => markSectionComplete(currentSection)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                    
                    {currentSection < sections.length - 1 ? (
                      <Button 
                        onClick={() => handleSectionChange(currentSection + 1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                      >
                        Next Section
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : canProceed() && (
                      <Button 
                        onClick={onComplete}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                      >
                        Proceed to Acknowledgment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;