import React, { createContext, useContext, useReducer, useEffect } from 'react';

const ExamCreationContext = createContext();

const initialState = {
  currentStep: 1,
  totalSteps: 5,
  examData: {
    // Step 1: Basic Information
    title: '',
    description: '',
    subject: '',
    duration: 60,
    instructions: '',
    
    // Step 2: Exam Type Selection
    examType: null, // 'mcq', 'descriptive', 'viva', 'coding', 'practical', 'pen-paper'
    difficulty: 'intermediate',
    
    // Step 3: Content Source
    contentSource: null, // 'manual', 'ai', 'hybrid'
    uploadedDocuments: [],
    documentProcessingStatus: null,
    
    // Step 4: Questions
    questions: [],
    totalQuestions: 0,
    questionSettings: {
      randomizeOrder: false,
      allowReview: true,
      showCorrectAnswers: false,
      passingScore: 60,
      attemptsAllowed: 1
    },
    
    // Step 5: Tokens & Distribution
    tokenSettings: {
      expiryType: 'time', // 'time', 'uses', 'never'
      expiryValue: 24, // hours or number of uses
      accessControl: 'open', // 'open', 'restricted'
      allowedUsers: []
    },
    generatedTokens: [],
    
    // Meta information
    status: 'draft', // 'draft', 'ready', 'published'
    createdAt: null,
    lastModified: null
  },
  validationErrors: {},
  isProcessing: false,
  processingMessage: '',
  savedDrafts: [],
  aiProcessingLogs: []
};

const examCreationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        validationErrors: {} // Clear validation errors when changing steps
      };
    
    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, state.totalSteps);
      return {
        ...state,
        currentStep: nextStep,
        examData: {
          ...state.examData,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };
    
    case 'UPDATE_EXAM_DATA':
      return {
        ...state,
        examData: {
          ...state.examData,
          ...action.payload,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'UPDATE_BASIC_INFO':
      return {
        ...state,
        examData: {
          ...state.examData,
          ...action.payload,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'SET_EXAM_TYPE':
      return {
        ...state,
        examData: {
          ...state.examData,
          examType: action.payload.type,
          difficulty: action.payload.difficulty || state.examData.difficulty,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'SET_CONTENT_SOURCE':
      return {
        ...state,
        examData: {
          ...state.examData,
          contentSource: action.payload,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'ADD_UPLOADED_DOCUMENT':
      return {
        ...state,
        examData: {
          ...state.examData,
          uploadedDocuments: [...state.examData.uploadedDocuments, action.payload],
          lastModified: new Date().toISOString()
        }
      };
    
    case 'REMOVE_UPLOADED_DOCUMENT':
      return {
        ...state,
        examData: {
          ...state.examData,
          uploadedDocuments: state.examData.uploadedDocuments.filter(
            doc => doc.id !== action.payload
          ),
          lastModified: new Date().toISOString()
        }
      };
    
    case 'SET_DOCUMENT_PROCESSING_STATUS':
      return {
        ...state,
        examData: {
          ...state.examData,
          documentProcessingStatus: action.payload
        }
      };
    
    case 'ADD_QUESTION':
      return {
        ...state,
        examData: {
          ...state.examData,
          questions: [...state.examData.questions, action.payload],
          totalQuestions: state.examData.questions.length + 1,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'UPDATE_QUESTION':
      return {
        ...state,
        examData: {
          ...state.examData,
          questions: state.examData.questions.map(q =>
            q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
          ),
          lastModified: new Date().toISOString()
        }
      };
    
    case 'REMOVE_QUESTION':
      return {
        ...state,
        examData: {
          ...state.examData,
          questions: state.examData.questions.filter(q => q.id !== action.payload),
          totalQuestions: state.examData.questions.length - 1,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'SET_QUESTIONS':
      return {
        ...state,
        examData: {
          ...state.examData,
          questions: action.payload,
          totalQuestions: action.payload.length,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'UPDATE_QUESTION_SETTINGS':
      return {
        ...state,
        examData: {
          ...state.examData,
          questionSettings: {
            ...state.examData.questionSettings,
            ...action.payload
          },
          lastModified: new Date().toISOString()
        }
      };
    
    case 'UPDATE_TOKEN_SETTINGS':
      return {
        ...state,
        examData: {
          ...state.examData,
          tokenSettings: {
            ...state.examData.tokenSettings,
            ...action.payload
          },
          lastModified: new Date().toISOString()
        }
      };
    
    case 'SET_GENERATED_TOKENS':
      return {
        ...state,
        examData: {
          ...state.examData,
          generatedTokens: action.payload,
          lastModified: new Date().toISOString()
        }
      };
    
    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload
      };
    
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload.isProcessing,
        processingMessage: action.payload.message || ''
      };
    
    case 'ADD_AI_LOG':
      return {
        ...state,
        aiProcessingLogs: [
          ...state.aiProcessingLogs,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...action.payload
          }
        ].slice(-20) // Keep only last 20 logs
      };
    
    case 'SAVE_DRAFT':
      const draft = {
        id: Date.now(),
        title: state.examData.title || 'Untitled Draft',
        savedAt: new Date().toISOString(),
        data: state.examData
      };
      return {
        ...state,
        savedDrafts: [draft, ...state.savedDrafts.slice(0, 9)], // Keep only 10 drafts
        examData: {
          ...state.examData,
          status: 'draft',
          lastModified: draft.savedAt
        }
      };
    
    case 'LOAD_DRAFT':
      return {
        ...state,
        examData: {
          ...action.payload.data,
          lastModified: new Date().toISOString()
        },
        currentStep: 1,
        validationErrors: {}
      };
    
    case 'PUBLISH_EXAM':
      return {
        ...state,
        examData: {
          ...state.examData,
          status: 'published',
          createdAt: state.examData.createdAt || new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };
    
    case 'RESET_WIZARD':
      return {
        ...initialState,
        savedDrafts: state.savedDrafts // Preserve saved drafts
      };
    
    default:
      return state;
  }
};

export const ExamCreationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(examCreationReducer, initialState);

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    if (state.examData.title && state.examData.lastModified) {
      const autoSaveTimer = setTimeout(() => {
        dispatch({ type: 'SAVE_DRAFT' });
      }, 30000);
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [state.examData.lastModified]);

  // Load saved drafts on mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('assessai-exam-drafts');
    if (savedDrafts) {
      try {
        const drafts = JSON.parse(savedDrafts);
        dispatch({ type: 'SET_SAVED_DRAFTS', payload: drafts });
      } catch (error) {
        console.error('Error loading saved drafts:', error);
      }
    }
  }, []);

  // Persist drafts to localStorage
  useEffect(() => {
    if (state.savedDrafts.length > 0) {
      localStorage.setItem('assessai-exam-drafts', JSON.stringify(state.savedDrafts));
    }
  }, [state.savedDrafts]);

  // Validation functions
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!state.examData.title?.trim()) {
          errors.title = 'Exam title is required';
        }
        if (state.examData.duration < 5 || state.examData.duration > 300) {
          errors.duration = 'Duration must be between 5 and 300 minutes';
        }
        break;
      
      case 2:
        if (!state.examData.examType) {
          errors.examType = 'Please select an exam type';
        }
        break;
      
      case 3:
        if (!state.examData.contentSource) {
          errors.contentSource = 'Please select a content creation method';
        }
        if (state.examData.contentSource === 'ai' && state.examData.uploadedDocuments.length === 0) {
          errors.documents = 'Please upload at least one document for AI processing';
        }
        break;
      
      case 4:
        if (state.examData.questions.length === 0) {
          errors.questions = 'Please add at least one question';
        }
        break;
      
      case 5:
        if (state.examData.tokenSettings.expiryType === 'time' && state.examData.tokenSettings.expiryValue < 1) {
          errors.tokenExpiry = 'Token expiry must be at least 1 hour';
        }
        break;
    }
    
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
    return Object.keys(errors).length === 0;
  };

  const value = {
    ...state,
    dispatch,
    
    // Navigation functions
    goToStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    nextStep: () => {
      if (validateStep(state.currentStep)) {
        dispatch({ type: 'NEXT_STEP' });
        return true;
      }
      return false;
    },
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    
    // Data update functions
    updateBasicInfo: (data) => dispatch({ type: 'UPDATE_BASIC_INFO', payload: data }),
    setExamType: (type, difficulty) => dispatch({ type: 'SET_EXAM_TYPE', payload: { type, difficulty } }),
    setContentSource: (source) => dispatch({ type: 'SET_CONTENT_SOURCE', payload: source }),
    addDocument: (document) => dispatch({ type: 'ADD_UPLOADED_DOCUMENT', payload: document }),
    removeDocument: (id) => dispatch({ type: 'REMOVE_UPLOADED_DOCUMENT', payload: id }),
    
    // Question management
    addQuestion: (question) => dispatch({ type: 'ADD_QUESTION', payload: question }),
    updateQuestion: (id, updates) => dispatch({ type: 'UPDATE_QUESTION', payload: { id, updates } }),
    removeQuestion: (id) => dispatch({ type: 'REMOVE_QUESTION', payload: id }),
    setQuestions: (questions) => dispatch({ type: 'SET_QUESTIONS', payload: questions }),
    
    // Settings
    updateQuestionSettings: (settings) => dispatch({ type: 'UPDATE_QUESTION_SETTINGS', payload: settings }),
    updateTokenSettings: (settings) => dispatch({ type: 'UPDATE_TOKEN_SETTINGS', payload: settings }),
    setGeneratedTokens: (tokens) => dispatch({ type: 'SET_GENERATED_TOKENS', payload: tokens }),
    
    // Utility functions
    validateStep,
    saveDraft: () => dispatch({ type: 'SAVE_DRAFT' }),
    loadDraft: (draft) => dispatch({ type: 'LOAD_DRAFT', payload: draft }),
    publishExam: () => dispatch({ type: 'PUBLISH_EXAM' }),
    resetWizard: () => dispatch({ type: 'RESET_WIZARD' }),
    
    // Processing
    setProcessing: (isProcessing, message = '') => 
      dispatch({ type: 'SET_PROCESSING', payload: { isProcessing, message } }),
    addAILog: (log) => dispatch({ type: 'ADD_AI_LOG', payload: log })
  };

  return (
    <ExamCreationContext.Provider value={value}>
      {children}
    </ExamCreationContext.Provider>
  );
};

export const useExamCreation = () => {
  const context = useContext(ExamCreationContext);
  if (!context) {
    throw new Error('useExamCreation must be used within ExamCreationProvider');
  }
  return context;
};