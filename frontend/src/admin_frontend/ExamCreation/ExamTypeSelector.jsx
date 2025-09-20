import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  CheckCircle,
  FileText,
  Edit3,
  Code,
  Mic,
  Settings,
  FileCheck,
  Clock,
  Users,
  Target,
  Zap,
  AlertCircle,
  Info
} from 'lucide-react';
import { useExamCreation } from '../../contexts/ExamCreationContext';

const ExamTypeSelector = () => {
  const { examData, setExamType, validationErrors } = useExamCreation();
  const [selectedType, setSelectedType] = useState(examData.examType);
  const [selectedDifficulty, setSelectedDifficulty] = useState(examData.difficulty || 'intermediate');

  const examTypes = [
    {
      id: 'mcq',
      title: 'Multiple Choice Questions',
      description: 'Traditional MCQ format with single or multiple correct answers',
      icon: CheckCircle,
      color: 'blue',
      features: ['Quick to complete', 'Auto-graded', 'Good for knowledge testing'],
      avgDuration: '1-2 min per question',
      difficulty: ['beginner', 'intermediate', 'advanced'],
      examples: ['Knowledge recall', 'Concept understanding', 'Quick assessments']
    },
    {
      id: 'descriptive',
      title: 'Descriptive Questions',
      description: 'Open-ended essay and theory questions requiring detailed answers',
      icon: Edit3,
      color: 'green',
      features: ['In-depth evaluation', 'Critical thinking', 'Writing skills'],
      avgDuration: '5-15 min per question',
      difficulty: ['intermediate', 'advanced'],
      examples: ['Essay questions', 'Case studies', 'Analytical problems']
    },
    {
      id: 'coding',
      title: 'Coding Challenges',
      description: 'Programming problems with code execution and testing',
      icon: Code,
      color: 'purple',
      features: ['Code execution', 'Test cases', 'Multiple languages'],
      avgDuration: '10-30 min per question',
      difficulty: ['intermediate', 'advanced'],
      examples: ['Algorithm problems', 'Data structures', 'Logic building']
    },
    {
      id: 'viva',
      title: 'Viva Voce (Oral)',
      description: 'Voice-based examinations with speech recognition',
      icon: Mic,
      color: 'orange',
      features: ['Voice recording', 'AI transcription', 'Speaking assessment'],
      avgDuration: '3-5 min per question',
      difficulty: ['beginner', 'intermediate', 'advanced'],
      examples: ['Language tests', 'Presentation skills', 'Verbal reasoning']
    },
    {
      id: 'practical',
      title: 'Practical Tasks',
      description: 'Hands-on assignments with file uploads and demonstrations',
      icon: Settings,
      color: 'teal',
      features: ['File uploads', 'Task completion', 'Real-world scenarios'],
      avgDuration: '15-45 min per task',
      difficulty: ['intermediate', 'advanced'],
      examples: ['Lab work', 'Design tasks', 'Project submissions']
    },
    {
      id: 'pen-paper',
      title: 'Pen & Paper',
      description: 'Traditional written exams with OCR scanning and AI evaluation',
      icon: FileCheck,
      color: 'indigo',
      features: ['OCR processing', 'Handwriting recognition', 'Traditional format'],
      avgDuration: '2-5 min per question',
      difficulty: ['beginner', 'intermediate', 'advanced'],
      examples: ['Math problems', 'Diagrams', 'Written responses']
    }
  ];

  const difficultyLevels = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'Basic concepts and fundamental knowledge',
      color: 'green',
      characteristics: ['Simple terminology', 'Direct questions', 'Clear options']
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Applied knowledge and moderate complexity',
      color: 'yellow',
      characteristics: ['Applied concepts', 'Multi-step problems', 'Analysis required']
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Complex scenarios and expert-level understanding',
      color: 'red',
      characteristics: ['Complex scenarios', 'Critical thinking', 'Expert knowledge']
    }
  ];

  const handleTypeSelection = (typeId) => {
    setSelectedType(typeId);
    const selectedTypeInfo = examTypes.find(type => type.id === typeId);
    
    // Auto-adjust difficulty if current selection is not available for this type
    if (!selectedTypeInfo.difficulty.includes(selectedDifficulty)) {
      setSelectedDifficulty(selectedTypeInfo.difficulty[0]);
    }
  };

  const handleSave = () => {
    if (selectedType && selectedDifficulty) {
      setExamType(selectedType, selectedDifficulty);
    }
  };

  const selectedTypeInfo = examTypes.find(type => type.id === selectedType);
  const IconComponent = selectedTypeInfo?.icon || CheckCircle;

  return (
    <div className="space-y-8">
      {/* Exam Type Selection */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <Target className="w-6 h-6 mr-3 text-green-600" />
            Select Assessment Type
          </CardTitle>
          <p className="text-slate-600">Choose the format that best matches your evaluation needs</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examTypes.map((type) => {
              const TypeIcon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelection(type.id)}
                  className={`text-left p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    isSelected
                      ? `border-${type.color}-300 bg-${type.color}-50 ring-2 ring-${type.color}-200`
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected ? `bg-${type.color}-100` : 'bg-slate-100'
                    }`}>
                      <TypeIcon className={`w-6 h-6 ${
                        isSelected ? `text-${type.color}-600` : 'text-slate-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{type.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{type.avgDuration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4">{type.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-slate-700 mb-2">Key Features</h4>
                      <div className="space-y-1">
                        {type.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full" />
                            <span className="text-xs text-slate-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-slate-700 mb-2">Best For</h4>
                      <div className="flex flex-wrap gap-1">
                        {type.examples.slice(0, 2).map((example, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className={`mt-4 p-3 bg-${type.color}-100 rounded-lg flex items-center`}>
                      <CheckCircle className={`w-4 h-4 text-${type.color}-600 mr-2`} />
                      <span className={`text-sm font-medium text-${type.color}-700`}>Selected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {validationErrors.examType && (
            <div className="flex items-center mt-4 p-4 bg-red-50 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span>{validationErrors.examType}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Difficulty Level Selection */}
      {selectedType && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Zap className="w-6 h-6 mr-3 text-purple-600" />
              Difficulty Level
            </CardTitle>
            <p className="text-slate-600">Set the complexity level for your assessment</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {difficultyLevels
                .filter(level => selectedTypeInfo?.difficulty.includes(level.id))
                .map((level) => {
                  const isSelected = selectedDifficulty === level.id;
                  
                  return (
                    <button
                      key={level.id}
                      onClick={() => setSelectedDifficulty(level.id)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                        isSelected
                          ? `border-${level.color}-300 bg-${level.color}-50 ring-2 ring-${level.color}-200`
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900">{level.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${
                            isSelected ? `bg-${level.color}-100 border-${level.color}-300` : ''
                          }`}
                        >
                          {level.id}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-4">{level.description}</p>
                      
                      <div>
                        <h4 className="text-xs font-medium text-slate-700 mb-2">Characteristics</h4>
                        <div className="space-y-1">
                          {level.characteristics.map((char, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-slate-400 rounded-full" />
                              <span className="text-xs text-slate-600">{char}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className={`mt-4 flex items-center text-${level.color}-600`}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {selectedType && selectedDifficulty && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <IconComponent className={`w-8 h-8 text-${selectedTypeInfo.color}-600`} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {selectedTypeInfo.title}
                </h3>
                <p className="text-slate-600 mb-4">{selectedTypeInfo.description}</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Difficulty</p>
                      <p className="text-sm text-slate-600 capitalize">{selectedDifficulty}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Time per Question</p>
                      <p className="text-sm text-slate-600">{selectedTypeInfo.avgDuration}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Evaluation</p>
                      <p className="text-sm text-slate-600">
                        {selectedType === 'mcq' ? 'Auto-graded' : 
                         selectedType === 'coding' ? 'Auto + Manual' : 'AI-assisted'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-slate-900">Recommended Settings</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">
                    <strong>Questions:</strong> {
                      selectedType === 'mcq' ? '15-30 questions' :
                      selectedType === 'descriptive' ? '5-10 questions' :
                      selectedType === 'coding' ? '3-8 problems' :
                      selectedType === 'viva' ? '10-20 questions' :
                      selectedType === 'practical' ? '2-5 tasks' :
                      '10-25 questions'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">
                    <strong>Duration:</strong> {
                      selectedType === 'mcq' ? '30-60 minutes' :
                      selectedType === 'descriptive' ? '60-120 minutes' :
                      selectedType === 'coding' ? '90-180 minutes' :
                      selectedType === 'viva' ? '20-45 minutes' :
                      selectedType === 'practical' ? '120-240 minutes' :
                      '45-90 minutes'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {selectedType && selectedDifficulty && (
        <div className="flex justify-center">
          <Button 
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Confirm Selection
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamTypeSelector;