import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  FileText,
  Brain,
  Upload,
  Clock,
  Users,
  Settings,
  Eye,
  Save,
  Wand2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Edit3
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const ExamWizard = () => {
  const { state, setSection, updateExamData } = useAdmin();
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: 60,
    type: 'mixed',
    difficulty: 'medium',
    instructions: '',
    settings: {
      randomizeQuestions: false,
      allowReview: true,
      showResults: false,
      timedSections: false,
      accessibility: true
    }
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Content', icon: Brain },
    { id: 3, title: 'Settings', icon: Settings },
    { id: 4, title: 'Preview', icon: Eye }
  ];

  const examTypes = [
    { id: 'mcq', title: 'Multiple Choice', description: 'Traditional MCQ assessments', icon: CheckCircle },
    { id: 'descriptive', title: 'Descriptive', description: 'Long-form written responses', icon: Edit3 },
    { id: 'coding', title: 'Coding', description: 'Programming challenges', icon: FileText },
    { id: 'mixed', title: 'Mixed Format', description: 'Combination of question types', icon: Wand2 },
    { id: 'viva', title: 'Viva Voce', description: 'Oral examination format', icon: Users },
    { id: 'practical', title: 'Practical', description: 'Hands-on assessments', icon: Settings }
  ];

  const StepIndicator = ({ step, isActive, isCompleted }) => {
    const StepIcon = steps.find(s => s.id === step)?.icon || FileText;
    return (
      <div className={`flex items-center ${step < steps.length ? 'flex-1' : ''}`}>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
          isCompleted ? 'bg-green-500 border-green-500 text-white' :
          isActive ? 'bg-blue-600 border-blue-600 text-white' :
          'border-slate-300 text-slate-400'
        }`}>
          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
        </div>
        {step < steps.length && (
          <div className={`h-px flex-1 mx-4 ${
            step < currentStep ? 'bg-green-500' : 'bg-slate-300'
          }`} />
        )}
      </div>
    );
  };

  const handleInputChange = (field, value) => {
    setExamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (setting, value) => {
    setExamData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assessment Title *</label>
              <Input
                placeholder="e.g., Advanced AI Fundamentals Assessment"
                value={examData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="text-lg font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Provide a detailed description of what this assessment covers..."
                value={examData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (minutes)</label>
                <Input
                  type="number"
                  value={examData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  min="1"
                  max="240"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty Level</label>
                <select
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={examData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Assessment Type</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {examTypes.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleInputChange('type', type.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        examData.type === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <TypeIcon className={`w-6 h-6 ${
                          examData.type === type.id ? 'text-blue-600' : 'text-slate-500'
                        }`} />
                        <div>
                          <h4 className="font-medium text-slate-900">{type.title}</h4>
                          <p className="text-sm text-slate-600">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Content Generation Options</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-slate-900 mb-2">Upload Documents</h4>
                    <p className="text-sm text-slate-600 mb-4">Let AI generate questions from your syllabus</p>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-green-300 hover:border-green-500 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Brain className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h4 className="font-semibold text-slate-900 mb-2">Manual Creation</h4>
                    <p className="text-sm text-slate-600 mb-4">Create questions manually with our editor</p>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Questions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Assessment Settings</h3>
            
            <div className="space-y-4">
              {[
                { key: 'randomizeQuestions', label: 'Randomize Question Order', description: 'Shuffle questions for each student' },
                { key: 'allowReview', label: 'Allow Review', description: 'Students can review answers before submission' },
                { key: 'showResults', label: 'Show Results Immediately', description: 'Display scores right after submission' },
                { key: 'timedSections', label: 'Timed Sections', description: 'Set individual time limits for sections' },
                { key: 'accessibility', label: 'Accessibility Features', description: 'Enable PWD support features' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-slate-900">{setting.label}</h4>
                    <p className="text-sm text-slate-600">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange(setting.key, !examData.settings[setting.key])}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      examData.settings[setting.key] ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      examData.settings[setting.key] ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Special Instructions</label>
              <textarea
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Any special instructions for students taking this assessment..."
                value={examData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Assessment Preview</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">{examData.title || 'Untitled Assessment'}</h4>
                  <p className="text-slate-600 mb-4">{examData.description || 'No description provided'}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {examData.duration} minutes
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {examData.difficulty || 'medium'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {examData.type || 'mixed'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Settings Summary</h4>
                  <div className="space-y-2">
                    {Object.entries(examData.settings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <Badge variant={value ? "default" : "outline"} size="sm">
                          {value ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 p-6 bg-green-50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Ready to Create!</h4>
                <p className="text-green-700">Your assessment is configured and ready to be created.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setSection('overview')} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create Assessment</h2>
            <p className="text-slate-600">Design your assessment step by step</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Step {currentStep} of {steps.length}
        </Badge>
      </div>

      {/* Step Indicator */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            {steps.map((step) => (
              <StepIndicator
                key={step.id}
                step={step.id}
                isActive={currentStep === step.id}
                isCompleted={currentStep > step.id}
              />
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              {steps.find(s => s.id === currentStep)?.title}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 1}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          {currentStep === steps.length ? (
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          ) : (
            <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamWizard;