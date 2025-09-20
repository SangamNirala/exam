import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AdminContext = createContext();

const initialState = {
  currentSection: 'overview', // overview, exams, questions, analytics, students, settings
  examCreation: {
    currentStep: 1,
    examData: {
      title: '',
      description: '',
      duration: 60,
      type: 'mixed',
      difficulty: 'medium',
      questions: [],
      settings: {
        randomizeQuestions: false,
        allowReview: true,
        showResults: false,
        timedSections: false
      }
    },
    isCreating: false,
    isDraft: false
  },
  questionBank: {
    questions: [],
    selectedQuestions: [],
    filters: {
      type: 'all',
      difficulty: 'all',
      subject: 'all'
    },
    searchQuery: ''
  },
  activeExams: [],
  examTemplates: [],
  analytics: {
    overview: {},
    detailed: {},
    reports: [],
    timeRange: '7d'
  },
  students: {
    registered: [],
    tokens: [],
    activeAssessments: []
  },
  notifications: [],
  loading: {
    exams: false,
    questions: false,
    analytics: false,
    students: false
  }
};

const adminReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SECTION':
      return { ...state, currentSection: action.payload };
    
    case 'UPDATE_EXAM_CREATION':
      return {
        ...state,
        examCreation: {
          ...state.examCreation,
          ...action.payload
        }
      };
    
    case 'UPDATE_EXAM_DATA':
      return {
        ...state,
        examCreation: {
          ...state.examCreation,
          examData: {
            ...state.examCreation.examData,
            ...action.payload
          }
        }
      };
    
    case 'ADD_QUESTION_TO_EXAM':
      return {
        ...state,
        examCreation: {
          ...state.examCreation,
          examData: {
            ...state.examCreation.examData,
            questions: [...state.examCreation.examData.questions, action.payload]
          }
        }
      };
    
    case 'REMOVE_QUESTION_FROM_EXAM':
      return {
        ...state,
        examCreation: {
          ...state.examCreation,
          examData: {
            ...state.examCreation.examData,
            questions: state.examCreation.examData.questions.filter(q => q.id !== action.payload)
          }
        }
      };
    
    case 'UPDATE_QUESTION_BANK':
      return {
        ...state,
        questionBank: {
          ...state.questionBank,
          ...action.payload
        }
      };
    
    case 'SET_QUESTION_FILTERS':
      return {
        ...state,
        questionBank: {
          ...state.questionBank,
          filters: {
            ...state.questionBank.filters,
            ...action.payload
          }
        }
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        questionBank: {
          ...state.questionBank,
          searchQuery: action.payload
        }
      };
    
    case 'SET_ACTIVE_EXAMS':
      return { ...state, activeExams: action.payload };
    
    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.section]: action.payload.loading
        }
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'RESET_EXAM_CREATION':
      return {
        ...state,
        examCreation: initialState.examCreation
      };
    
    default:
      return state;
  }
};

export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Load persisted admin state
  useEffect(() => {
    const savedAdminState = localStorage.getItem('assessai-admin-state');
    if (savedAdminState) {
      try {
        const parsedState = JSON.parse(savedAdminState);
        if (parsedState.examCreation && parsedState.examCreation.isDraft) {
          dispatch({ type: 'UPDATE_EXAM_CREATION', payload: parsedState.examCreation });
        }
      } catch (error) {
        console.error('Error loading admin state:', error);
      }
    }
  }, []);

  // Persist exam creation drafts
  useEffect(() => {
    if (state.examCreation.isDraft || state.examCreation.examData.title) {
      const stateToSave = {
        examCreation: state.examCreation
      };
      localStorage.setItem('assessai-admin-state', JSON.stringify(stateToSave));
    }
  }, [state.examCreation]);

  const value = {
    state,
    dispatch,
    // Convenience methods
    setSection: (section) => dispatch({ type: 'SET_SECTION', payload: section }),
    updateExamData: (data) => dispatch({ type: 'UPDATE_EXAM_DATA', payload: data }),
    addQuestionToExam: (question) => dispatch({ type: 'ADD_QUESTION_TO_EXAM', payload: question }),
    setLoading: (section, loading) => dispatch({ type: 'SET_LOADING', payload: { section, loading } }),
    addNotification: (notification) => dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    resetExamCreation: () => dispatch({ type: 'RESET_EXAM_CREATION' })
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};