import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Eye,
  Wand2,
  Clock,
  Users,
  Target
} from 'lucide-react';
import { useExamCreation } from '../../contexts/ExamCreationContext';
import ExamTypeSelector from './ExamTypeSelector';
import DocumentUploader from './DocumentUploader';
import QuestionCreationMethods from './QuestionCreationMethods';
import TokenGenerator from './TokenGenerator';

const ExamCreationWizard = ({ onClose }) => {
  const {
    currentStep,
    totalSteps,
    examData,
    validationErrors,
    isProcessing,
    processingMessage,
    nextStep,
    prevStep,
    updateBasicInfo,
    saveDraft,
    publishExam,
    resetWizard,
    validateStep
  } = useExamCreation();

  const [localData, setLocalData] = useState({
    title: examData.title || '',
    description: examData.description || '',
    subject: examData.subject || '',
    duration: examData.duration || 60,
    instructions: examData.instructions || ''
  });

  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Set up exam details and requirements',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Exam Type',
      description: 'Choose assessment format and difficulty',
      icon: Target,
      color: 'green'
    },
    {
      id: 3,
      title: 'Content Creation',
      description: 'Upload documents or create manually',
      icon: Wand2,
      color: 'purple'
    },
    {
      id: 4,
      title: 'Questions & Settings',
      description: 'Review questions and configure options',
      icon: Settings,
      color: 'orange'
    },
    {
      id: 5,
      title: 'Tokens & Publish',
      description: 'Generate access tokens and go live',
      icon: Users,
      color: 'pink'
    }
  ];

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (examData.title) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [examData.title, saveDraft]);

  const handleLocalDataChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStepComplete = (stepData) => {
    // Update the context with the local data
    updateBasicInfo(stepData);
    // Use setTimeout to ensure state update is processed before validation
    setTimeout(() => {
      nextStep();
    }, 0);
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      if (window.confirm('Are you sure you want to exit? Your progress will be saved as a draft.')) {
        saveDraft();
        onClose();
      }
    } else {
      prevStep();
    }
  };

  const handlePublish = async () => {
    if (validateStep(currentStep)) {
      publishExam();
      // Show success message and redirect
      alert('Exam published successfully!');
      onClose();
    }
  };

  const StepIndicator = ({ step, isActive, isCompleted, isNext }) => {
    const stepInfo = steps.find(s => s.id === step);
    const IconComponent = stepInfo?.icon || FileText;

    return (
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
          isCompleted 
            ? 'bg-green-500 border-green-500 text-white shadow-lg' :
          isActive 
            ? `bg-${stepInfo?.color}-600 border-${stepInfo?.color}-600 text-white shadow-lg scale-110` :
          isNext
            ? 'border-slate-300 bg-slate-50 text-slate-400 hover:border-slate-400'
            : 'border-slate-200 bg-white text-slate-300'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <IconComponent className="w-6 h-6" />
          )}
        </div>
        {step < totalSteps && (
          <div className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${
            step < currentStep ? 'bg-green-500' : 'bg-slate-200'
          }`} />
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={localData}
            onChange={handleLocalDataChange}
            onComplete={handleStepComplete}
            errors={validationErrors}
          />
        );
      case 2:
        return <ExamTypeSelector />;
      case 3:
        return <DocumentUploader />;
      case 4:
        return <QuestionCreationMethods />;
      case 5:
        return <TokenGenerator />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                className="rounded-xl hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? 'Exit Wizard' : 'Previous'}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Create New Assessment</h1>
                <p className="text-slate-600">
                  Step {currentStep} of {totalSteps}: {steps.find(s => s.id === currentStep)?.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {examData.title && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Draft: {examData.title}
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={saveDraft}
                disabled={!examData.title}
                className="rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-6">
              {steps.map((step) => (
                <StepIndicator
                  key={step.id}
                  step={step.id}
                  isActive={currentStep === step.id}
                  isCompleted={currentStep > step.id}
                  isNext={currentStep < step.id}
                />
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {steps.find(s => s.id === currentStep)?.title}
              </h2>
              <p className="text-slate-600">
                {steps.find(s => s.id === currentStep)?.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Progress</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="mb-8">
          {isProcessing ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Processing...</h3>
                <p className="text-slate-600">{processingMessage}</p>
              </CardContent>
            </Card>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Navigation Footer */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous Step
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Step {currentStep} of {totalSteps}
                </div>
                
                {currentStep < totalSteps ? (
                  <Button
                    onClick={() => {
                      // For step 1, update context with local data before proceeding
                      if (currentStep === 1) {
                        updateBasicInfo(localData);
                        setTimeout(() => {
                          nextStep();
                        }, 0);
                      } else {
                        nextStep();
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    disabled={currentStep === 1 && (!localData.title?.trim() || localData.duration < 5 || localData.duration > 300)}
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePublish}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                    disabled={Object.keys(validationErrors).length > 0}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Publish Exam
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Basic Information Step Component
const BasicInfoStep = ({ data, onChange, onComplete, errors }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(data);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-slate-900">
          <FileText className="w-6 h-6 mr-3 text-blue-600" />
          Basic Exam Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Exam Title *
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder="e.g., Advanced AI Fundamentals Assessment"
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.title && (
                <div className="flex items-center mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{errors.title}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => onChange('description', e.target.value)}
                placeholder="Provide a detailed description of what this assessment covers..."
                rows={4}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subject Category
              </label>
              <select
                value={data.subject}
                onChange={(e) => onChange('subject', e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a subject</option>
                <option value="ai-ml">Artificial Intelligence & ML</option>
                <option value="programming">Programming & Development</option>
                <option value="digital-literacy">Digital Literacy</option>
                <option value="data-science">Data Science</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="cloud-computing">Cloud Computing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (minutes) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={data.duration}
                  onChange={(e) => onChange('duration', parseInt(e.target.value))}
                  min="5"
                  max="300"
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16 ${
                    errors.duration ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Clock className="w-4 h-4 text-slate-400 mr-1" />
                  <span className="text-sm text-slate-500">min</span>
                </div>
              </div>
              {errors.duration && (
                <div className="flex items-center mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{errors.duration}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Special Instructions for Students
              </label>
              <textarea
                value={data.instructions}
                onChange={(e) => onChange('instructions', e.target.value)}
                placeholder="Any special instructions, rules, or notes for students taking this exam..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-3">Quick Tips</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Choose a clear, descriptive title that reflects the exam content</li>
              <li>• Include relevant keywords in the description for better organization</li>
              <li>• Duration should allow sufficient time for all question types</li>
              <li>• Instructions help students understand expectations and requirements</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExamCreationWizard;