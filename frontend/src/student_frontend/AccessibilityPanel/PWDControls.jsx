import React from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  X,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Type,
  Eye,
  Keyboard,
  MousePointer,
  Accessibility,
  Settings,
  CheckCircle,
  Info,
  Lightbulb
} from 'lucide-react';
import { useStudent } from '../../contexts/StudentContext';

const PWDControls = ({ onClose }) => {
  const { state, toggleAccessibility } = useStudent();

  const accessibilityFeatures = [
    {
      id: 'textToSpeech',
      name: 'Text-to-Speech',
      description: 'Automatically reads questions, instructions, and content aloud using natural voice synthesis.',
      detailedInfo: 'Perfect for visual impairments, dyslexia, or when you prefer auditory learning. Supports multiple languages and speech rates.',
      icon: Volume2,
      activeIcon: VolumeX,
      category: 'Visual Support',
      enabled: state.accessibility.textToSpeech
    },
    {
      id: 'speechToText',
      name: 'Speech-to-Text',
      description: 'Convert your spoken responses into text answers automatically.',
      detailedInfo: 'Ideal for motor disabilities, typing difficulties, or when speaking is easier than writing. Supports voice commands for navigation.',
      icon: Mic,
      activeIcon: MicOff,
      category: 'Input Support',
      enabled: state.accessibility.speechToText
    },
    {
      id: 'largeText',
      name: 'Large Text Mode',
      description: 'Increase font sizes throughout the interface for better readability.',
      detailedInfo: 'Helps with visual impairments, age-related vision changes, or screen viewing difficulties. Scales all text proportionally.',
      icon: Type,
      category: 'Visual Support',
      enabled: state.accessibility.largeText
    },
    {
      id: 'highContrast',
      name: 'High Contrast Mode',
      description: 'Enhanced color contrast and visual clarity for better visibility.',
      detailedInfo: 'Beneficial for color blindness, low vision, or bright screen environments. Uses optimized color combinations.',
      icon: Eye,
      category: 'Visual Support',
      enabled: state.accessibility.highContrast
    },
    {
      id: 'keyboardNavigation',
      name: 'Keyboard Navigation',
      description: 'Navigate the entire assessment using only keyboard shortcuts.',
      detailedInfo: 'Essential for motor disabilities or when mouse usage is difficult. Includes visual focus indicators and logical tab order.',
      icon: Keyboard,
      category: 'Navigation Support',
      enabled: state.accessibility.keyboardNavigation
    },
    {
      id: 'voiceControl',
      name: 'Voice Control',
      description: 'Control the interface using voice commands and navigation.',
      detailedInfo: 'Advanced feature for hands-free operation. Includes commands for navigation, selection, and form completion.',
      icon: MousePointer,
      category: 'Input Support',
      enabled: state.accessibility.voiceControl
    }
  ];

  const categories = [...new Set(accessibilityFeatures.map(f => f.category))];

  const FeatureCard = ({ feature }) => {
    const IconComponent = feature.enabled && feature.activeIcon ? feature.activeIcon : feature.icon;
    
    return (
      <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
        feature.enabled 
          ? 'border-blue-300 bg-blue-50' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              feature.enabled ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <IconComponent className={`w-5 h-5 ${
                feature.enabled ? 'text-blue-600' : 'text-slate-500'
              }`} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{feature.name}</h4>
              <Badge variant="outline" className="mt-1 text-xs">
                {feature.category}
              </Badge>
            </div>
          </div>
          <button
            onClick={() => toggleAccessibility(feature.id)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              feature.enabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            aria-label={`Toggle ${feature.name}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
              feature.enabled ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>
        
        <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
        
        <details className="group">
          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            More details
          </summary>
          <p className="text-xs text-slate-500 mt-2 pl-4 border-l-2 border-blue-200">
            {feature.detailedInfo}
          </p>
        </details>
      </div>
    );
  };

  const activeFeatures = accessibilityFeatures.filter(f => f.enabled).length;

  return (
    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <CardHeader className="sticky top-0 bg-white z-10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Accessibility className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Accessibility Controls</CardTitle>
              <p className="text-slate-600 text-sm">
                Customize your assessment experience for optimal accessibility
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-4 h-4 mr-1" />
              {activeFeatures} active
            </Badge>
            <Button variant="ghost" onClick={onClose} className="rounded-lg">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Quick Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Accessibility at Your Fingertips</h3>
              <p className="text-slate-600 text-sm mb-4">
                Our platform supports a comprehensive range of accessibility features designed to 
                ensure equal access for all learners. Enable the features that work best for your needs.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <Badge variant="outline" className="bg-white">
                  WCAG 2.1 AAA Compliant
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Screen Reader Optimized
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Keyboard Accessible
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Features by Category */}
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3" />
              {category}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {accessibilityFeatures
                .filter(feature => feature.category === category)
                .map((feature) => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
            </div>
          </div>
        ))}

        {/* Keyboard Shortcuts */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Keyboard className="w-5 h-5 mr-3 text-slate-600" />
            Keyboard Shortcuts
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-medium text-slate-900 mb-3">Navigation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Next Question</span>
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">Tab + Enter</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Previous Question</span>
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">Shift + Tab</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Flag Question</span>
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">Ctrl + F</kbd>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-medium text-slate-900 mb-3">Accessibility</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Read Aloud</span>
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">Alt + R</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Voice Input</span>
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">Alt + V</kbd>
                </div>
                <div className="flex justify-between">
                  <span>High Contrast</span>
                  <kbd className="px-2 py-1 bg-white rounded text-xs font-mono">Alt + H</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Need Additional Support?</h4>
              <p className="text-slate-600 text-sm mb-4">
                If you require accommodations not covered by these features, please contact 
                your instructor or assessment administrator before beginning your test.
              </p>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="rounded-lg">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg">
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-slate-600">
            Settings are automatically saved and will persist across sessions
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                // Reset all accessibility features
                Object.keys(state.accessibility).forEach(feature => {
                  if (state.accessibility[feature]) {
                    toggleAccessibility(feature);
                  }
                });
              }}
              className="rounded-xl"
            >
              Reset All
            </Button>
            <Button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWDControls;