import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Brain,
  Upload,
  FileText,
  Eye,
  Edit3,
  Trash2,
  Star,
  Copy,
  Download,
  Wand2,
  CheckCircle,
  Clock,
  Target,
  Users,
  Lightbulb
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const QuestionManager = () => {
  const { setSection } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const mockQuestions = [
    {
      id: 1,
      type: 'mcq',
      question: 'What is the primary purpose of machine learning algorithms?',
      difficulty: 'intermediate',
      subject: 'AI Fundamentals',
      tags: ['machine-learning', 'algorithms'],
      usage: 15,
      accuracy: 78,
      createdAt: '2024-01-15',
      isAIGenerated: true
    },
    {
      id: 2,
      type: 'descriptive',
      question: 'Explain the concept of neural networks and their applications in modern technology.',
      difficulty: 'advanced',
      subject: 'AI Fundamentals',
      tags: ['neural-networks', 'deep-learning'],
      usage: 8,
      accuracy: 65,
      createdAt: '2024-01-14',
      isAIGenerated: false
    },
    {
      id: 3,
      type: 'coding',
      question: 'Write a Python function to implement a basic linear regression model.',
      difficulty: 'advanced',
      subject: 'Programming',
      tags: ['python', 'regression', 'ml'],
      usage: 12,
      accuracy: 82,
      createdAt: '2024-01-13',
      isAIGenerated: true
    },
    {
      id: 4,
      type: 'mcq',
      question: 'Which of the following is NOT a supervised learning algorithm?',
      difficulty: 'beginner',
      subject: 'AI Fundamentals',
      tags: ['supervised-learning', 'algorithms'],
      usage: 25,
      accuracy: 89,
      createdAt: '2024-01-12',
      isAIGenerated: false
    }
  ];

  const questionTypes = [
    { id: 'all', label: 'All Types', count: mockQuestions.length, icon: FileText },
    { id: 'mcq', label: 'Multiple Choice', count: mockQuestions.filter(q => q.type === 'mcq').length, icon: CheckCircle },
    { id: 'descriptive', label: 'Descriptive', count: mockQuestions.filter(q => q.type === 'descriptive').length, icon: Edit3 },
    { id: 'coding', label: 'Coding', count: mockQuestions.filter(q => q.type === 'coding').length, icon: FileText }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return CheckCircle;
      case 'descriptive': return Edit3;
      case 'coding': return FileText;
      default: return FileText;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const QuestionCard = ({ question }) => {
    const TypeIcon = getTypeIcon(question.type);
    const isSelected = selectedQuestions.includes(question.id);

    return (
      <Card className={`border transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedQuestions([...selectedQuestions, question.id]);
                  } else {
                    setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
                  }
                }}
                className="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <TypeIcon className="w-4 h-4 text-slate-500" />
                  <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                  {question.isAIGenerated && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                      <Brain className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                </div>
                <p className="text-slate-900 font-medium mb-2 leading-relaxed">
                  {question.question}
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Used {question.usage} times
                  </span>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {question.accuracy}% accuracy
                  </span>
                  <span>{question.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setSection('overview')} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Question Bank</h2>
            <p className="text-slate-600">Manage and organize your assessment questions</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowAIGenerator(true)} className="rounded-xl">
            <Brain className="w-4 h-4 mr-2" />
            AI Generator
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Question Types */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Question Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {questionTypes.map((type) => {
                const TypeIcon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedFilter(type.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedFilter === type.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <TypeIcon className="w-4 h-4" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <Badge variant="outline">{type.count}</Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Questions</span>
                <span className="font-bold text-slate-900">{mockQuestions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">AI Generated</span>
                <span className="font-bold text-purple-600">
                  {mockQuestions.filter(q => q.isAIGenerated).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Avg. Accuracy</span>
                <span className="font-bold text-green-600">78.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Most Used</span>
                <span className="font-bold text-blue-600">25x</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {selectedQuestions.length > 0 
                  ? `${selectedQuestions.length} questions selected`
                  : `${mockQuestions.length} questions total`
                }
              </span>
              {selectedQuestions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="rounded-lg">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option>Sort by Date</option>
                <option>Sort by Usage</option>
                <option>Sort by Accuracy</option>
                <option>Sort by Difficulty</option>
              </select>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {mockQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center py-8">
            <Button variant="outline" className="rounded-xl">
              Load More Questions
            </Button>
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-purple-600" />
                  AI Question Generator
                </CardTitle>
                <Button variant="ghost" onClick={() => setShowAIGenerator(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Powered by Gemini 2.5-Flash</h3>
                    <p className="text-sm text-slate-600">Generate high-quality questions from your content</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Document</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Drop your PDF, DOCX, or TXT files here</p>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Question Type</label>
                  <select className="w-full p-3 border border-slate-300 rounded-xl">
                    <option>Mixed Types</option>
                    <option>Multiple Choice Only</option>
                    <option>Descriptive Only</option>
                    <option>Coding Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                  <select className="w-full p-3 border border-slate-300 rounded-xl">
                    <option>Mixed Difficulty</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;