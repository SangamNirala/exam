import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Plus,
  Edit3,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  Brain,
  Settings,
  Wand2,
  RefreshCw,
  Save,
  Download,
  Upload,
  Target,
  Clock,
  Users
} from 'lucide-react';
import { useExamCreation } from '../../contexts/ExamCreationContext';

const QuestionCreationMethods = () => {
  const { 
    examData, 
    addQuestion, 
    updateQuestion, 
    removeQuestion, 
    setQuestions,
    updateQuestionSettings,
    setProcessing,
    addAILog
  } = useExamCreation();

  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [aiGenerationSettings, setAIGenerationSettings] = useState({
    questionCount: 10,
    difficulty: examData.difficulty || 'intermediate',
    types: ['mcq'],
    focus: 'balanced'
  });

  // Mock questions for demonstration
  const mockGeneratedQuestions = [
    {
      id: 'q1',
      type: 'mcq',
      question: 'What is the primary goal of machine learning?',
      options: ['Data storage', 'Pattern recognition', 'Hardware optimization', 'Network security'],
      correctAnswer: 1,
      difficulty: 'intermediate',
      estimatedTime: 2,
      tags: ['machine-learning', 'fundamentals']
    },
    {
      id: 'q2',
      type: 'mcq',
      question: 'Which algorithm is commonly used for classification tasks?',
      options: ['K-means', 'Decision Tree', 'PCA', 'DBSCAN'],
      correctAnswer: 1,
      difficulty: 'intermediate',
      estimatedTime: 3,
      tags: ['algorithms', 'classification']
    },
    {
      id: 'q3',
      type: 'descriptive',
      question: 'Explain the difference between supervised and unsupervised learning with examples.',
      difficulty: 'advanced',
      estimatedTime: 8,
      maxWords: 300,
      tags: ['supervised-learning', 'unsupervised-learning']
    }
  ];

  const generateQuestionsWithAI = async () => {
    setProcessing(true, 'Generating questions with AI...');
    
    const stages = [
      'Analyzing uploaded documents...',
      'Extracting key concepts...',
      'Generating question variations...',
      'Optimizing for difficulty level...',
      'Creating answer options...',
      'Finalizing question bank...'
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessing(true, stages[i]);
      
      addAILog({
        type: 'generation',
        message: stages[i],
        progress: Math.round(((i + 1) / stages.length) * 100)
      });
    }

    // Simulate adding generated questions
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mockGeneratedQuestions.forEach(question => {
      addQuestion(question);
    });

    addAILog({
      type: 'success',
      message: `Successfully generated ${mockGeneratedQuestions.length} questions`,
      questionsGenerated: mockGeneratedQuestions.length,
      settings: aiGenerationSettings
    });

    setProcessing(false);
  };

  const QuestionCard = ({ question, index }) => {
    const difficultyColors = {
      beginner: 'green',
      intermediate: 'yellow',
      advanced: 'red'
    };

    return (
      <Card className="border border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{index + 1}</span>
              </div>
              <div>
                <Badge variant="outline" className="capitalize">
                  {question.type}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`ml-2 bg-${difficultyColors[question.difficulty]}-100 text-${difficultyColors[question.difficulty]}-700 border-${difficultyColors[question.difficulty]}-200`}
                >
                  {question.difficulty}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-lg"
                onClick={() => {
                  setEditingQuestion(question);
                  setShowQuestionEditor(true);
                }}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                onClick={() => removeQuestion(question.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 mb-3 leading-relaxed">
              {question.question}
            </h4>
            
            {question.type === 'mcq' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <div 
                    key={optIndex}
                    className={`p-3 rounded-lg border ${
                      optIndex === question.correctAnswer
                        ? 'border-green-300 bg-green-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {optIndex === question.correctAnswer && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {question.type === 'descriptive' && (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{question.estimatedTime} min</span>
                  </div>
                  {question.maxWords && (
                    <div className="flex items-center space-x-1">
                      <Edit3 className="w-4 h-4" />
                      <span>Max {question.maxWords} words</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {question.tags?.map((tag, tagIndex) => (
                <Badge key={tagIndex} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{question.estimatedTime || 2} min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* AI Generation Section */}
      {(examData.contentSource === 'ai' || examData.contentSource === 'hybrid') && examData.uploadedDocuments.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Brain className="w-6 h-6 mr-3 text-purple-600" />
              AI Question Generation
            </CardTitle>
            <p className="text-slate-600">Configure AI settings to generate questions from your documents</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  value={aiGenerationSettings.questionCount}
                  onChange={(e) => setAIGenerationSettings(prev => ({
                    ...prev,
                    questionCount: parseInt(e.target.value)
                  }))}
                  min="1"
                  max="50"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Focus Area
                </label>
                <select
                  value={aiGenerationSettings.focus}
                  onChange={(e) => setAIGenerationSettings(prev => ({
                    ...prev,
                    focus: e.target.value
                  }))}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="balanced">Balanced Coverage</option>
                  <option value="concepts">Key Concepts</option>
                  <option value="practical">Practical Applications</option>
                  <option value="theory">Theoretical Knowledge</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Question Types
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'mcq', label: 'Multiple Choice' },
                    { id: 'descriptive', label: 'Descriptive' },
                    { id: 'coding', label: 'Coding' },
                    { id: 'practical', label: 'Practical' }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={aiGenerationSettings.types.includes(type.id)}
                        onChange={(e) => {
                          setAIGenerationSettings(prev => ({
                            ...prev,
                            types: e.target.checked
                              ? [...prev.types, type.id]
                              : prev.types.filter(t => t !== type.id)
                          }));
                        }}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-slate-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <Button
              onClick={generateQuestionsWithAI}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              disabled={examData.uploadedDocuments.length === 0}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Questions with AI
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Question Bank */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-slate-900">
                <Target className="w-6 h-6 mr-3 text-blue-600" />
                Question Bank ({examData.questions.length})
              </CardTitle>
              <p className="text-slate-600">Review and manage your assessment questions</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowQuestionEditor(true)}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              
              {examData.questions.length > 0 && (
                <Button variant="outline" className="rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {examData.questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 rounded-2xl inline-block mb-4">
                <Target className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Questions Yet</h3>
              <p className="text-slate-600 mb-6">
                {examData.contentSource === 'ai' 
                  ? 'Generate questions using AI or add them manually'
                  : examData.contentSource === 'hybrid'
                  ? 'Generate questions with AI first, then review and edit'
                  : 'Start by adding your first question manually'
                }
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                {(examData.contentSource === 'ai' || examData.contentSource === 'hybrid') && (
                  <Button
                    onClick={generateQuestionsWithAI}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                )}
                
                <Button
                  onClick={() => setShowQuestionEditor(true)}
                  variant="outline"
                  className="rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {examData.questions.map((question, index) => (
                <QuestionCard key={question.id} question={question} index={index} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Settings */}
      {examData.questions.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Settings className="w-6 h-6 mr-3 text-orange-600" />
              Assessment Settings
            </CardTitle>
            <p className="text-slate-600">Configure how students will experience this assessment</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Question Behavior</h4>
                
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-slate-900">Randomize Question Order</h5>
                    <p className="text-sm text-slate-600">Shuffle questions for each student</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={examData.questionSettings.randomizeOrder}
                    onChange={(e) => updateQuestionSettings({ randomizeOrder: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-slate-900">Allow Review</h5>
                    <p className="text-sm text-slate-600">Students can review answers before submission</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={examData.questionSettings.allowReview}
                    onChange={(e) => updateQuestionSettings({ allowReview: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h5 className="font-medium text-slate-900">Show Correct Answers</h5>
                    <p className="text-sm text-slate-600">Display correct answers after submission</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={examData.questionSettings.showCorrectAnswers}
                    onChange={(e) => updateQuestionSettings({ showCorrectAnswers: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Scoring & Attempts</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={examData.questionSettings.passingScore}
                    onChange={(e) => updateQuestionSettings({ passingScore: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Attempts Allowed
                  </label>
                  <select
                    value={examData.questionSettings.attemptsAllowed}
                    onChange={(e) => updateQuestionSettings({ attemptsAllowed: parseInt(e.target.value) })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>1 attempt</option>
                    <option value={2}>2 attempts</option>
                    <option value={3}>3 attempts</option>
                    <option value={0}>Unlimited</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Summary */}
      {examData.questions.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Assessment Summary</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-white rounded-xl shadow-sm inline-block mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Total Questions</h4>
                <p className="text-2xl font-bold text-slate-900">{examData.questions.length}</p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-white rounded-xl shadow-sm inline-block mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Estimated Time</h4>
                <p className="text-2xl font-bold text-slate-900">
                  {examData.questions.reduce((total, q) => total + (q.estimatedTime || 2), 0)} min
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-white rounded-xl shadow-sm inline-block mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Passing Score</h4>
                <p className="text-2xl font-bold text-slate-900">{examData.questionSettings.passingScore}%</p>
              </div>
              
              <div className="text-center">
                <div className="p-3 bg-white rounded-xl shadow-sm inline-block mb-3">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Attempts</h4>
                <p className="text-2xl font-bold text-slate-900">
                  {examData.questionSettings.attemptsAllowed === 0 ? '∞' : examData.questionSettings.attemptsAllowed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Editor Modal */}
      {showQuestionEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowQuestionEditor(false);
                    setEditingQuestion(null);
                  }}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Question Editor</h3>
                <p className="text-slate-600">Full question editor will be implemented in the next phase</p>
                <Button 
                  onClick={() => {
                    setShowQuestionEditor(false);
                    setEditingQuestion(null);
                  }}
                  className="mt-4"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuestionCreationMethods;