import React, { useState, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Upload,
  FileText,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Wand2,
  Brain,
  Sparkles,
  Clock,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useExamCreation } from '../../contexts/ExamCreationContext';

const DocumentUploader = () => {
  const { 
    examData, 
    setContentSource, 
    addDocument, 
    removeDocument, 
    setProcessing,
    addAILog
  } = useExamCreation();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const contentSources = [
    {
      id: 'manual',
      title: 'Manual Creation',
      description: 'Create questions manually using our rich text editor',
      icon: Settings,
      color: 'green',
      features: ['Full control', 'Custom formatting', 'Multiple question types'],
      timeEstimate: '10-30 min per question'
    },
    {
      id: 'ai',
      title: 'AI Generation',
      description: 'Let AI create questions from your uploaded documents',
      icon: Brain,
      color: 'purple',
      features: ['Fast generation', 'Multiple formats', 'Consistent quality'],
      timeEstimate: '1-3 min for 20 questions',
      badge: 'Recommended'
    },
    {
      id: 'hybrid',
      title: 'Hybrid Approach',
      description: 'AI generates questions, then you review and edit',
      icon: Sparkles,
      color: 'blue',
      features: ['AI efficiency', 'Human oversight', 'Best of both'],
      timeEstimate: '5-15 min for 20 questions'
    }
  ];

  const supportedFormats = [
    { ext: 'PDF', desc: 'Portable Document Format', icon: FileText, maxSize: '10MB' },
    { ext: 'DOCX', desc: 'Microsoft Word Document', icon: File, maxSize: '5MB' },
    { ext: 'TXT', desc: 'Plain Text File', icon: FileText, maxSize: '2MB' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    files.forEach(file => {
      if (validateFile(file)) {
        uploadFile(file);
      }
    });
  };

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSizes = {
      'application/pdf': 10 * 1024 * 1024, // 10MB
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 5 * 1024 * 1024, // 5MB
      'text/plain': 2 * 1024 * 1024 // 2MB
    };

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only PDF, DOCX, or TXT files.');
      return false;
    }

    if (file.size > maxSizes[file.type]) {
      alert(`File size exceeds the limit for ${file.type.split('/')[1].toUpperCase()} files.`);
      return false;
    }

    return true;
  };

  const uploadFile = async (file) => {
    const fileId = Date.now() + Math.random();
    
    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
    
    const document = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      processingStatus: null
    };

    // Simulate progressive upload
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
    }

    document.status = 'uploaded';
    addDocument(document);
    
    // Remove from upload progress
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const processDocumentWithAI = async (documentId) => {
    const document = examData.uploadedDocuments.find(doc => doc.id === documentId);
    if (!document) return;

    setProcessing(true, `Processing ${document.name} with AI...`);
    
    // Simulate AI processing stages
    const stages = [
      'Extracting text content...',
      'Analyzing document structure...',
      'Identifying key concepts...',
      'Generating question variations...',
      'Optimizing difficulty levels...',
      'Finalizing question bank...'
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProcessing(true, stages[i]);
      
      addAILog({
        type: 'processing',
        message: stages[i],
        documentId: documentId,
        progress: Math.round(((i + 1) / stages.length) * 100)
      });
    }

    // Simulate successful processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addAILog({
      type: 'success',
      message: `Successfully generated 15 questions from ${document.name}`,
      documentId: documentId,
      questionsGenerated: 15
    });

    setProcessing(false);
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return FileText;
    if (type.includes('word')) return File;
    return FileText;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Content Source Selection */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <Wand2 className="w-6 h-6 mr-3 text-purple-600" />
            Choose Content Creation Method
          </CardTitle>
          <p className="text-slate-600">Select how you want to create questions for your assessment</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {contentSources.map((source) => {
              const SourceIcon = source.icon;
              const isSelected = examData.contentSource === source.id;
              
              return (
                <button
                  key={source.id}
                  onClick={() => setContentSource(source.id)}
                  className={`text-left p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    isSelected
                      ? `border-${source.color}-300 bg-${source.color}-50 ring-2 ring-${source.color}-200`
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected ? `bg-${source.color}-100` : 'bg-slate-100'
                    }`}>
                      <SourceIcon className={`w-6 h-6 ${
                        isSelected ? `text-${source.color}-600` : 'text-slate-500'
                      }`} />
                    </div>
                    {source.badge && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        {source.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2">{source.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{source.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-slate-700 mb-2">Features</h4>
                      <div className="space-y-1">
                        {source.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-slate-400 rounded-full" />
                            <span className="text-xs text-slate-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{source.timeEstimate}</span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className={`mt-4 p-3 bg-${source.color}-100 rounded-lg flex items-center`}>
                      <CheckCircle className={`w-4 h-4 text-${source.color}-600 mr-2`} />
                      <span className={`text-sm font-medium text-${source.color}-700`}>Selected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Section - Only show if AI or Hybrid is selected */}
      {(examData.contentSource === 'ai' || examData.contentSource === 'hybrid') && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Upload className="w-6 h-6 mr-3 text-blue-600" />
              Upload Reference Documents
            </CardTitle>
            <p className="text-slate-600">Upload documents that AI will use to generate questions</p>
          </CardHeader>
          <CardContent>
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 ${
                dragActive ? 'text-blue-600' : 'text-slate-400'
              }`} />
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {dragActive ? 'Drop files here' : 'Drag & Drop Files'}
              </h3>
              <p className="text-slate-600 mb-6">
                Or click to browse your computer for files
              </p>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* Supported Formats */}
            <div className="mt-6">
              <h4 className="font-medium text-slate-900 mb-3">Supported Formats</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {supportedFormats.map((format) => {
                  const FormatIcon = format.icon;
                  return (
                    <div key={format.ext} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
                      <FormatIcon className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900">{format.ext}</p>
                        <p className="text-xs text-slate-500">Max: {format.maxSize}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {examData.uploadedDocuments.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-900">
              <div className="flex items-center">
                <FileText className="w-6 h-6 mr-3 text-green-600" />
                Uploaded Documents ({examData.uploadedDocuments.length})
              </div>
              {examData.contentSource === 'ai' && (
                <Button
                  onClick={() => {
                    examData.uploadedDocuments.forEach(doc => {
                      if (doc.status === 'uploaded') {
                        processDocumentWithAI(doc.id);
                      }
                    });
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Process All with AI
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {examData.uploadedDocuments.map((document) => {
                const FileIcon = getFileIcon(document.type);
                const isUploading = uploadProgress[document.id] !== undefined;
                
                return (
                  <div key={document.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FileIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{document.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>{formatFileSize(document.size)}</span>
                          <span>•</span>
                          <span>{new Date(document.uploadedAt).toLocaleString()}</span>
                        </div>
                        
                        {/* Upload Progress */}
                        {isUploading && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[document.id]}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600">{uploadProgress[document.id]}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {document.status === 'uploaded' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                      
                      {examData.contentSource === 'ai' && document.status === 'uploaded' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => processDocumentWithAI(document.id)}
                          className="rounded-lg"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Process
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(document.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Creation Preview */}
      {examData.contentSource === 'manual' && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="p-4 bg-white rounded-2xl shadow-sm inline-block mb-6">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Manual Question Creation</h3>
              <p className="text-slate-600 mb-6">
                You'll create questions one by one using our rich text editor with full formatting control.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="font-semibold text-slate-900 mb-2">Rich Editor</h4>
                  <p className="text-sm text-slate-600">Full formatting, images, equations, and multimedia support</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="font-semibold text-slate-900 mb-2">Question Types</h4>
                  <p className="text-sm text-slate-600">MCQ, descriptive, coding, and custom question formats</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="font-semibold text-slate-900 mb-2">Preview Mode</h4>
                  <p className="text-sm text-slate-600">See exactly how students will view each question</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUploader;