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

  // Dynamic question templates based on different subjects
  const getQuestionTemplates = () => {
    const documentNames = examData.uploadedDocuments.map(doc => doc.name.toLowerCase());
    const documentContent = documentNames.join(' ');
    
    // Determine subject based on document names or exam subject
    const subject = examData.subject || 'general';
    const difficulty = aiGenerationSettings.difficulty;
    
    // Generate different questions based on context
    if (documentContent.includes('math') || documentContent.includes('calculus') || documentContent.includes('algebra') || subject === 'math') {
      return getMathQuestions(difficulty);
    } else if (documentContent.includes('history') || subject === 'history') {
      return getHistoryQuestions(difficulty);
    } else if (documentContent.includes('science') || documentContent.includes('biology') || documentContent.includes('chemistry') || subject === 'science') {
      return getScienceQuestions(difficulty);
    } else if (documentContent.includes('english') || documentContent.includes('literature') || subject === 'english') {
      return getEnglishQuestions(difficulty);
    } else if (documentContent.includes('programming') || documentContent.includes('code') || subject === 'programming') {
      return getProgrammingQuestions(difficulty);
    } else {
      return getGeneralQuestions(difficulty);
    }
  };

  const getMathQuestions = (difficulty) => [
    {
      id: 'math1',
      type: 'mcq',
      question: 'What is the derivative of x²?',
      options: ['x', '2x', 'x²', '2x²'],
      correctAnswer: 1,
      difficulty: difficulty,
      estimatedTime: 3,
      tags: ['calculus', 'derivatives']
    },
    {
      id: 'math2',
      type: 'mcq',
      question: 'Which of the following is a prime number?',
      options: ['15', '21', '17', '25'],
      correctAnswer: 2,
      difficulty: difficulty,
      estimatedTime: 2,
      tags: ['number-theory', 'primes']
    },
    {
      id: 'math3',
      type: 'descriptive',
      question: 'Explain the Pythagorean theorem and provide an example of its application.',
      difficulty: difficulty,
      estimatedTime: 8,
      maxWords: 200,
      tags: ['geometry', 'theorems']
    }
  ];

  const getHistoryQuestions = (difficulty) => [
    {
      id: 'hist1',
      type: 'mcq',
      question: 'In which year did World War II end?',
      options: ['1944', '1945', '1946', '1947'],
      correctAnswer: 1,
      difficulty: difficulty,
      estimatedTime: 2,
      tags: ['world-war', 'dates']
    },
    {
      id: 'hist2',
      type: 'descriptive',
      question: 'Discuss the causes and consequences of the Industrial Revolution.',
      difficulty: difficulty,
      estimatedTime: 10,
      maxWords: 300,
      tags: ['industrial-revolution', 'social-change']
    },
    {
      id: 'hist3',
      type: 'mcq',
      question: 'Who was the first President of the United States?',
      options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
      correctAnswer: 1,
      difficulty: difficulty,
      estimatedTime: 2,
      tags: ['american-history', 'presidents']
    }
  ];

  const getScienceQuestions = (difficulty) => [
    {
      id: 'sci1',
      type: 'mcq',
      question: 'What is the chemical symbol for gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correctAnswer: 2,
      difficulty: difficulty,
      estimatedTime: 2,
      tags: ['chemistry', 'elements']
    },
    {
      id: 'sci2',
      type: 'descriptive',
      question: 'Explain the process of photosynthesis and its importance to life on Earth.',
      difficulty: difficulty,
      estimatedTime: 8,
      maxWords: 250,
      tags: ['biology', 'photosynthesis']
    },
    {
      id: 'sci3',
      type: 'mcq',
      question: 'What is the speed of light in a vacuum?',
      options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10¹² m/s'],
      correctAnswer: 1,
      difficulty: difficulty,
      estimatedTime: 3,
      tags: ['physics', 'constants']
    }
  ];

  const getEnglishQuestions = (difficulty) => [
    {
      id: 'eng1',
      type: 'mcq',
      question: 'Which of the following is a metaphor?',
      options: ['He runs like the wind', 'Time is money', 'The cat sat on the mat', 'She sings beautifully'],
      correctAnswer: 1,
      difficulty: difficulty,
      estimatedTime: 3,
      tags: ['literature', 'figurative-language']
    },
    {
      id: 'eng2',
      type: 'descriptive',
      question: 'Analyze the theme of love in Shakespeare\'s Romeo and Juliet.',
      difficulty: difficulty,
      estimatedTime: 12,
      maxWords: 400,
      tags: ['shakespeare', 'literary-analysis']
    },
    {
      id: 'eng3',
      type: 'mcq',
      question: 'What is the past tense of "write"?',
      options: ['writed', 'wrote', 'written', 'writes'],
      correctAnswer: 1,
      difficulty: difficulty,
      estimatedTime: 2,
      tags: ['grammar', 'verbs']
    }
  ];

  const getProgrammingQuestions = (difficulty) => [
    {
      id: 'prog1',
      type: 'mcq',
      question: 'Which of the following is NOT a programming language?',
      options: ['Python', 'JavaScript', 'HTML', 'Java'],
      correctAnswer: 2,
      difficulty: difficulty,
      estimatedTime: 2,
      tags: ['programming', 'languages']
    },
    {
      id: 'prog2',
      type: 'coding',
      question: 'Write a function that returns the factorial of a given number.',
      difficulty: difficulty,
      estimatedTime: 15,
      tags: ['algorithms', 'recursion']
    },
    {
      id: 'prog3',
      type: 'descriptive',
      question: 'Explain the difference between a class and an object in object-oriented programming.',
      difficulty: difficulty,
      estimatedTime: 6,
      maxWords: 200,
      tags: ['oop', 'concepts']
    }
  ];

  const getGeneralQuestions = (difficulty) => [
    {
      id: 'gen1',
      type: 'mcq',
      question: 'What does the acronym "URL" stand for?',
      options: ['Universal Resource Locator', 'Uniform Resource Locator', 'Universal Reference Link', 'Uniform Reference Locator'],
      correctAnswer: 1,
      difficulty: difficulty,
      estimatedTime: 2,
      tags: ['technology', 'internet']
    },
    {
      id: 'gen2',
      type: 'descriptive',
      question: 'Describe the importance of critical thinking in problem-solving.',
      difficulty: difficulty,
      estimatedTime: 8,
      maxWords: 250,
      tags: ['critical-thinking', 'problem-solving']
    },
    {
      id: 'gen3',
      type: 'mcq',
      question: 'Which continent has the most countries?',
      options: ['Asia', 'Africa', 'Europe', 'South America'],
      correctAnswer: 1,
      difficulty: difficulty,
      estimatedTime: 2,
      tags: ['geography', 'countries']
    }
  ];

  const generateQuestionsWithAI = async () => {
    setProcessing(true, 'Generating questions with AI...');
    
    try {
      // Check if we have uploaded documents
      if (!examData.uploadedDocuments || examData.uploadedDocuments.length === 0) {
        throw new Error('No documents uploaded. Please upload documents first.');
      }

      // Get the backend URL from environment
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

      addAILog({
        type: 'generation',
        message: 'Preparing document content for analysis...',
        progress: 10
      });

      // Extract document content - for now use document names as fallback since actual text extraction happens in backend
      const documentContents = examData.uploadedDocuments.map(doc => {
        // If document has extractedText (from backend processing), use it
        if (doc.extractedText) {
          return doc.extractedText;
        }
        // Otherwise, create a basic description from filename
        return `Document: ${doc.name}\nFile type: ${doc.type}\nSize: ${doc.size} bytes\nThis document was uploaded for question generation.`;
      });

      addAILog({
        type: 'generation',
        message: 'Analyzing document content with AI...',
        progress: 30
      });

      // Prepare the AI generation request
      const generationRequest = {
        assessment_id: examData.id || 'temp-assessment-' + Date.now(),
        document_contents: documentContents,
        question_count: aiGenerationSettings.questionCount,
        difficulty: aiGenerationSettings.difficulty,
        question_types: aiGenerationSettings.types,
        focus_area: aiGenerationSettings.focus
      };

      addAILog({
        type: 'generation',
        message: 'Generating questions with Gemini AI...',
        progress: 50
      });

      // Call the backend API for AI question generation
      const response = await fetch(`${backendUrl}/api/assessments/${generationRequest.assessment_id}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API request failed with status ${response.status}`);
      }

      const result = await response.json();

      addAILog({
        type: 'generation',
        message: 'Processing generated questions...',
        progress: 80
      });

      // Add the generated questions to the exam
      if (result.questions && result.questions.length > 0) {
        result.questions.forEach(question => {
          addQuestion({
            ...question,
            id: question.id || Date.now() + Math.random() // Ensure we have an ID
          });
        });

        addAILog({
          type: 'success',
          message: `Successfully generated ${result.questions_generated} questions using AI`,
          questionsGenerated: result.questions_generated,
          settings: aiGenerationSettings
        });
      } else {
        throw new Error('No questions were generated by the AI service');
      }

    } catch (error) {
      console.error('Error generating questions with AI:', error);
      
      addAILog({
        type: 'error',
        message: `Failed to generate questions: ${error.message}`,
        error: error.message
      });

      // Fallback to template-based questions if AI fails
      addAILog({
        type: 'info',
        message: 'Falling back to template-based questions...',
        progress: 90
      });

      const generatedQuestions = getQuestionTemplates();
      const questionsToAdd = generatedQuestions.slice(0, aiGenerationSettings.questionCount);
      
      questionsToAdd.forEach(question => {
        addQuestion(question);
      });

      addAILog({
        type: 'warning',
        message: `Generated ${questionsToAdd.length} template-based questions as fallback`,
        questionsGenerated: questionsToAdd.length,
        settings: aiGenerationSettings
      });
    } finally {
      setProcessing(false);
    }
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
        <QuestionEditor
          question={editingQuestion}
          onSave={(questionData) => {
            if (editingQuestion) {
              updateQuestion(editingQuestion.id, questionData);
            } else {
              const newQuestion = {
                id: `q_${Date.now()}`,
                ...questionData,
                createdAt: new Date().toISOString()
              };
              addQuestion(newQuestion);
            }
            setShowQuestionEditor(false);
            setEditingQuestion(null);
          }}
          onCancel={() => {
            setShowQuestionEditor(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

// Question Editor Component
const QuestionEditor = ({ question, onSave, onCancel }) => {
  const [questionData, setQuestionData] = useState({
    type: question?.type || 'mcq',
    question: question?.question || '',
    options: question?.options || ['', '', '', ''],
    correctAnswer: question?.correctAnswer || 0,
    difficulty: question?.difficulty || 'intermediate',
    estimatedTime: question?.estimatedTime || 2,
    tags: question?.tags || [],
    points: question?.points || 1,
    explanation: question?.explanation || '',
    maxWords: question?.maxWords || 200
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  const validateQuestion = () => {
    const newErrors = {};

    if (!questionData.question.trim()) {
      newErrors.question = 'Question text is required';
    }

    if (questionData.type === 'mcq') {
      const validOptions = questionData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 options are required for MCQ';
      }
      if (questionData.correctAnswer >= validOptions.length) {
        newErrors.correctAnswer = 'Please select a valid correct answer';
      }
    }

    if (questionData.estimatedTime < 1 || questionData.estimatedTime > 60) {
      newErrors.estimatedTime = 'Estimated time must be between 1 and 60 minutes';
    }

    if (questionData.points < 0.1 || questionData.points > 100) {
      newErrors.points = 'Points must be between 0.1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateQuestion()) {
      const cleanedData = {
        ...questionData,
        options: questionData.type === 'mcq' ? questionData.options.filter(opt => opt.trim()) : undefined
      };
      onSave(cleanedData);
    }
  };

  const addOption = () => {
    if (questionData.options.length < 6) {
      setQuestionData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (questionData.options.length > 2) {
      const newOptions = questionData.options.filter((_, i) => i !== index);
      setQuestionData(prev => ({
        ...prev,
        options: newOptions,
        correctAnswer: prev.correctAnswer >= index ? Math.max(0, prev.correctAnswer - 1) : prev.correctAnswer
      }));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !questionData.tags.includes(newTag.trim())) {
      setQuestionData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setQuestionData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Edit3 className="w-6 h-6 mr-3 text-blue-600" />
              {question ? 'Edit Question' : 'Add New Question'}
            </CardTitle>
            <Button variant="ghost" onClick={onCancel} className="rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Question Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'mcq', label: 'Multiple Choice', icon: '🔘' },
                { id: 'descriptive', label: 'Descriptive', icon: '📝' },
                { id: 'coding', label: 'Coding', icon: '💻' },
                { id: 'practical', label: 'Practical', icon: '🛠️' }
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setQuestionData(prev => ({ ...prev, type: type.id }))}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    questionData.type === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Question Text *
            </label>
            <textarea
              value={questionData.question}
              onChange={(e) => setQuestionData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter your question here..."
              rows={4}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.question ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.question && (
              <p className="mt-1 text-sm text-red-600">{errors.question}</p>
            )}
          </div>

          {/* MCQ Options */}
          {questionData.type === 'mcq' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">
                  Answer Options *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={questionData.options.length >= 6}
                  className="rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-3">
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={questionData.correctAnswer === index}
                      onChange={() => setQuestionData(prev => ({ ...prev, correctAnswer: index }))}
                      className="w-4 h-4 text-green-600"
                    />
                    <div className="flex-1 flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-600 w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {questionData.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.options && (
                <p className="mt-1 text-sm text-red-600">{errors.options}</p>
              )}
              {errors.correctAnswer && (
                <p className="mt-1 text-sm text-red-600">{errors.correctAnswer}</p>
              )}
            </div>
          )}

          {/* Descriptive Question Settings */}
          {questionData.type === 'descriptive' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maximum Words
              </label>
              <input
                type="number"
                value={questionData.maxWords}
                onChange={(e) => setQuestionData(prev => ({ ...prev, maxWords: parseInt(e.target.value) }))}
                min="50"
                max="1000"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Question Settings */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={questionData.difficulty}
                onChange={(e) => setQuestionData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={questionData.estimatedTime}
                onChange={(e) => setQuestionData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
                min="1"
                max="60"
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estimatedTime ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.estimatedTime && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Points
              </label>
              <input
                type="number"
                step="0.1"
                value={questionData.points}
                onChange={(e) => setQuestionData(prev => ({ ...prev, points: parseFloat(e.target.value) }))}
                min="0.1"
                max="100"
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.points ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.points && (
                <p className="mt-1 text-sm text-red-600">{errors.points}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags (Optional)
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                className="rounded-lg"
              >
                Add
              </Button>
            </div>
            {questionData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {questionData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Explanation (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={questionData.explanation}
              onChange={(e) => setQuestionData(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Provide an explanation for the correct answer..."
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Save className="w-4 h-4 mr-2" />
              {question ? 'Update Question' : 'Save Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionCreationMethods;