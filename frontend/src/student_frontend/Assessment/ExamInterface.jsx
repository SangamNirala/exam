import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Type,
  Eye,
  Keyboard,
  Flag,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Settings,
  Pause,
  Play,
  Save
} from 'lucide-react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { useStudent } from '../../contexts/StudentContext';

const ExamInterface = ({ setView, toggleAccessibility }) => {
  const { state: authState } = useStudentAuth();
  const { state: studentState, dispatch } = useStudent();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [answers, setAnswers] = useState({});

  // Get exam data from auth context, fallback to mock data
  const examInfo = authState.examInfo || {};
  
  // Create complete exam data with fallbacks
  const examData = {
    title: examInfo.title || "Digital Literacy Fundamentals",  
    totalQuestions: examInfo.questions?.length || 3,
    questions: examInfo.questions || [
      {
        id: 1,
        type: 'mcq',
        question: "What does 'WWW' stand for in web addresses?",
        options: [
          "World Wide Web",
          "World Web Width",
          "Web World Wide", 
          "Wide World Web"
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        type: 'mcq',
        question: "Which of the following is considered safe password practice?",
        options: [
          "Using your name and birth year",
          "Using the same password for all accounts",
          "Using a combination of letters, numbers, and symbols",
          "Sharing passwords with trusted friends"
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        type: 'mcq',
        question: "What is the purpose of antivirus software?",
        options: [
          "To speed up your computer",
          "To protect against malicious software",
          "To create documents", 
          "To browse the internet"
        ],
        correctAnswer: 1
      }
    ]
  };

  // Timer countdown
  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPaused, timeRemaining]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmitExam();
    }
  }, [timeRemaining, handleSubmitExam]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    // Store answer locally - in real implementation would sync with backend
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (examData.questions?.length - 1 || 0)) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFlagQuestion = () => {
    const questionId = examData.questions?.[currentQuestion]?.id;
    if (!questionId) return;
    
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitExam = useCallback(() => {
    // In real implementation, this would submit to backend
    console.log('Submitting exam with answers:', answers);
    // TODO: Submit to backend and redirect to results
    if (setView) {
      setView('results');
    }
  }, [answers, setView]);

  const currentQuestionData = examData.questions?.[currentQuestion] || examData.questions?.[0];
  const currentAnswer = answers[currentQuestionData?.id];
  const progress = ((currentQuestion + 1) / examData.totalQuestions) * 100;

  // Safety check - if no valid question data, show loading
  if (!currentQuestionData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  const AccessibilityButton = ({ feature, icon: Icon, activeIcon: ActiveIcon, label }) => {
    const isActive = studentState?.accessibility?.[feature] || false;
    const IconComponent = isActive && ActiveIcon ? ActiveIcon : Icon;
    
    return (
      <Button
        variant="outline"
        size="sm"
        className={`rounded-lg ${isActive ? 'bg-blue-100 border-blue-400' : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_ACCESSIBILITY', payload: feature })}
        title={label}
      >
        <IconComponent className="w-4 h-4" />
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => console.log('Exit assessment')}
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Assessment
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{examData.title}</h1>
                <p className="text-sm text-slate-600">
                  Question {currentQuestion + 1} of {examData.totalQuestions}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>

              {/* Accessibility Controls */}
              <div className="flex items-center space-x-2">
                <AccessibilityButton
                  feature="textToSpeech"
                  icon={Volume2}
                  activeIcon={VolumeX}
                  label="Toggle Text-to-Speech"
                />
                <AccessibilityButton
                  feature="speechToText"
                  icon={Mic}
                  activeIcon={MicOff}
                  label="Toggle Speech-to-Text"
                />
                <AccessibilityButton
                  feature="largeText"
                  icon={Type}
                  label="Toggle Large Text"
                />
                <AccessibilityButton
                  feature="highContrast"
                  icon={Eye}
                  label="Toggle High Contrast"
                />
              </div>

              {/* Pause/Resume */}
              <Button
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                className="rounded-xl"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{Math.round(progress)}% Complete</span>
                    <span>{Object.keys(answers).length} answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: examData.totalQuestions }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                        index === currentQuestion
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : answers[examData.questions?.[index]?.id]
                          ? 'border-green-300 bg-green-100 text-green-700'
                          : flaggedQuestions.has(examData.questions?.[index]?.id)
                          ? 'border-yellow-300 bg-yellow-100 text-yellow-700'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 bg-blue-500 rounded" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-green-300 bg-green-100 rounded" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-yellow-300 bg-yellow-100 rounded" />
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={handleFlagQuestion}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {flaggedQuestions.has(currentQuestionData?.id) ? 'Unflag' : 'Flag'} Question
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            {isPaused ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Pause className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Assessment Paused</h3>
                  <p className="text-slate-600 mb-6">Your progress has been saved. Click resume when ready to continue.</p>
                  <Button 
                    onClick={() => setIsPaused(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Question Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Question {currentQuestion + 1}
                        </Badge>
                        {flaggedQuestions.has(currentQuestionData?.id) && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Flag className="w-3 h-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {studentState?.accessibility?.textToSpeech && (
                          <Button variant="outline" size="sm" className="rounded-lg">
                            <Volume2 className="w-4 h-4 mr-2" />
                            Read Aloud
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className={`${studentState?.accessibility?.largeText ? 'text-xl' : 'text-lg'} leading-relaxed`}>
                      <h3 className="font-semibold text-slate-900 mb-6">
                        {currentQuestionData?.question}
                      </h3>
                    </div>

                    {/* MCQ Options */}
                    {currentQuestionData?.type === 'mcq' && (
                      <div className="space-y-3">
                        {currentQuestionData.options.map((option, index) => (
                          <label 
                            key={index}
                            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              currentAnswer === index
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentQuestionData.id}`}
                              value={index}
                              checked={currentAnswer === index}
                              onChange={() => handleAnswerChange(currentQuestionData.id, index)}
                              className="w-4 h-4 text-blue-600 mr-4"
                            />
                            <span className={`${studentState?.accessibility?.largeText ? 'text-lg' : 'text-base'} text-slate-900`}>
                              {String.fromCharCode(65 + index)}. {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Speech-to-Text Area */}
                    {studentState?.accessibility?.speechToText && (
                      <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50">
                        <div className="flex items-center justify-center space-x-3">
                          <Mic className="w-6 h-6 text-blue-600" />
                          <span className="text-blue-700 font-medium">Voice input active - speak your answer</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-600">
                      {Object.keys(answers).length} of {examData.totalQuestions} answered
                    </span>
                    {currentQuestion === examData.totalQuestions - 1 ? (
                      <Button 
                        onClick={handleSubmitExam}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Assessment
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleNextQuestion}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;