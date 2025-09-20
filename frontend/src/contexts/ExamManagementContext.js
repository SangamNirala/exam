import React, { createContext, useContext, useReducer, useEffect } from 'react';

const ExamManagementContext = createContext();

const initialState = {
  exams: [],
  filteredExams: [],
  selectedExams: [],
  searchQuery: '',
  filters: {
    status: 'all', // 'all', 'draft', 'active', 'completed', 'expired'
    type: 'all', // 'all', 'mcq', 'descriptive', 'coding', etc.
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'custom'
    difficulty: 'all', // 'all', 'beginner', 'intermediate', 'advanced'
    createdBy: 'all'
  },
  sortBy: 'lastModified', // 'title', 'createdAt', 'lastModified', 'status', 'completions'
  sortOrder: 'desc', // 'asc', 'desc'
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
  loading: {
    exams: false,
    actions: false,
    export: false
  },
  bulkActions: {
    available: ['publish', 'archive', 'delete', 'duplicate', 'export'],
    inProgress: false,
    results: null
  },
  viewMode: 'grid', // 'grid', 'list', 'table'
  showArchivedExams: false,
  recentActivity: [],
  statistics: {
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    totalCompletions: 0,
    averageScore: 0
  }
};

// Mock exam data for demonstration
const mockExams = [
  {
    id: 'exam-001',
    title: 'AI Fundamentals Assessment',
    description: 'Comprehensive test covering basic AI concepts and terminology',
    type: 'mixed',
    status: 'active',
    difficulty: 'intermediate',
    duration: 90,
    totalQuestions: 25,
    createdAt: '2024-01-15T10:00:00Z',
    lastModified: '2024-01-16T14:30:00Z',
    createdBy: 'admin',
    tags: ['ai', 'fundamentals', 'theory'],
    statistics: {
      totalAttempts: 156,
      completions: 142,
      averageScore: 78.5,
      passRate: 89.4
    },
    tokens: {
      active: 25,
      used: 142,
      expired: 12
    }
  },
  {
    id: 'exam-002',
    title: 'Python Programming Challenge',
    description: 'Practical coding assessment for Python developers',
    type: 'coding',
    status: 'active',
    difficulty: 'advanced',
    duration: 120,
    totalQuestions: 15,
    createdAt: '2024-01-14T09:15:00Z',
    lastModified: '2024-01-16T16:45:00Z',
    createdBy: 'admin',
    tags: ['python', 'programming', 'coding'],
    statistics: {
      totalAttempts: 89,
      completions: 76,
      averageScore: 68.2,
      passRate: 71.9
    },
    tokens: {
      active: 15,
      used: 76,
      expired: 8
    }
  },
  {
    id: 'exam-003',
    title: 'Digital Literacy Basic Test',
    description: 'Essential digital skills assessment for beginners',
    type: 'mcq',
    status: 'completed',
    difficulty: 'beginner',
    duration: 45,
    totalQuestions: 20,
    createdAt: '2024-01-10T11:30:00Z',
    lastModified: '2024-01-15T13:20:00Z',
    createdBy: 'admin',
    tags: ['digital-literacy', 'basics', 'computer-skills'],
    statistics: {
      totalAttempts: 234,
      completions: 228,
      averageScore: 85.7,
      passRate: 94.2
    },
    tokens: {
      active: 0,
      used: 228,
      expired: 6
    }
  },
  {
    id: 'exam-004',
    title: 'Database Design Concepts',
    description: 'Theory and practical questions on database design principles',
    type: 'mixed',
    status: 'draft',
    difficulty: 'intermediate',
    duration: 75,
    totalQuestions: 18,
    createdAt: '2024-01-16T15:00:00Z',
    lastModified: '2024-01-16T17:30:00Z',
    createdBy: 'admin',
    tags: ['database', 'design', 'sql'],
    statistics: {
      totalAttempts: 0,
      completions: 0,
      averageScore: 0,
      passRate: 0
    },
    tokens: {
      active: 0,
      used: 0,
      expired: 0
    }
  }
];

const examManagementReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_EXAMS':
      const totalStats = action.payload.reduce((acc, exam) => ({
        total: acc.total + 1,
        active: acc.active + (exam.status === 'active' ? 1 : 0),
        completed: acc.completed + (exam.status === 'completed' ? 1 : 0),
        draft: acc.draft + (exam.status === 'draft' ? 1 : 0),
        totalCompletions: acc.totalCompletions + exam.statistics.completions,
        averageScore: acc.averageScore + exam.statistics.averageScore
      }), { total: 0, active: 0, completed: 0, draft: 0, totalCompletions: 0, averageScore: 0 });
      
      totalStats.averageScore = totalStats.total > 0 ? totalStats.averageScore / totalStats.total : 0;
      
      return {
        ...state,
        exams: action.payload,
        statistics: totalStats,
        totalItems: action.payload.length
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        currentPage: 1
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        currentPage: 1
      };
    
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };
    
    case 'SET_FILTERED_EXAMS':
      return {
        ...state,
        filteredExams: action.payload
      };
    
    case 'SELECT_EXAM':
      const isSelected = state.selectedExams.includes(action.payload);
      return {
        ...state,
        selectedExams: isSelected
          ? state.selectedExams.filter(id => id !== action.payload)
          : [...state.selectedExams, action.payload]
      };
    
    case 'SELECT_ALL_EXAMS':
      return {
        ...state,
        selectedExams: action.payload ? state.filteredExams.map(exam => exam.id) : []
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedExams: []
      };
    
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload
      };
    
    case 'SET_ITEMS_PER_PAGE':
      return {
        ...state,
        itemsPerPage: action.payload,
        currentPage: 1
      };
    
    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.loading
        }
      };
    
    case 'UPDATE_EXAM':
      return {
        ...state,
        exams: state.exams.map(exam =>
          exam.id === action.payload.id
            ? { ...exam, ...action.payload.updates, lastModified: new Date().toISOString() }
            : exam
        )
      };
    
    case 'DELETE_EXAM':
      return {
        ...state,
        exams: state.exams.filter(exam => exam.id !== action.payload),
        selectedExams: state.selectedExams.filter(id => id !== action.payload)
      };
    
    case 'DUPLICATE_EXAM':
      const originalExam = state.exams.find(exam => exam.id === action.payload);
      if (!originalExam) return state;
      
      const duplicatedExam = {
        ...originalExam,
        id: `exam-${Date.now()}`,
        title: `${originalExam.title} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        statistics: {
          totalAttempts: 0,
          completions: 0,
          averageScore: 0,
          passRate: 0
        },
        tokens: {
          active: 0,
          used: 0,
          expired: 0
        }
      };
      
      return {
        ...state,
        exams: [duplicatedExam, ...state.exams]
      };
    
    case 'BULK_UPDATE_STATUS':
      return {
        ...state,
        exams: state.exams.map(exam =>
          action.payload.examIds.includes(exam.id)
            ? { ...exam, status: action.payload.status, lastModified: new Date().toISOString() }
            : exam
        ),
        selectedExams: []
      };
    
    case 'ADD_RECENT_ACTIVITY':
      return {
        ...state,
        recentActivity: [
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...action.payload
          },
          ...state.recentActivity.slice(0, 19) // Keep only 20 recent activities
        ]
      };
    
    case 'SET_BULK_ACTION_PROGRESS':
      return {
        ...state,
        bulkActions: {
          ...state.bulkActions,
          inProgress: action.payload.inProgress,
          results: action.payload.results || null
        }
      };
    
    default:
      return state;
  }
};

export const ExamManagementProvider = ({ children }) => {
  const [state, dispatch] = useReducer(examManagementReducer, initialState);

  // Load mock exams on mount
  useEffect(() => {
    dispatch({ type: 'LOAD_EXAMS', payload: mockExams });
  }, []);

  // Filter and sort exams whenever filters, search, or sort changes
  useEffect(() => {
    let filtered = [...state.exams];

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(query) ||
        exam.description.toLowerCase().includes(query) ||
        exam.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(exam => exam.status === state.filters.status);
    }

    // Apply type filter
    if (state.filters.type !== 'all') {
      filtered = filtered.filter(exam => exam.type === state.filters.type);
    }

    // Apply difficulty filter
    if (state.filters.difficulty !== 'all') {
      filtered = filtered.filter(exam => exam.difficulty === state.filters.difficulty);
    }

    // Apply date range filter
    if (state.filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (state.filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (state.filters.dateRange !== 'all') {
        filtered = filtered.filter(exam => new Date(exam.createdAt) >= filterDate);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[state.sortBy];
      let bValue = b[state.sortBy];

      // Handle nested properties
      if (state.sortBy === 'completions') {
        aValue = a.statistics.completions;
        bValue = b.statistics.completions;
      } else if (state.sortBy === 'averageScore') {
        aValue = a.statistics.averageScore;
        bValue = b.statistics.averageScore;
      }

      // Convert dates to timestamps for comparison
      if (state.sortBy.includes('At') || state.sortBy.includes('Modified')) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    dispatch({ type: 'SET_FILTERED_EXAMS', payload: filtered });
  }, [state.exams, state.searchQuery, state.filters, state.sortBy, state.sortOrder]);

  const value = {
    ...state,
    
    // Search and filter functions
    setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    setFilters: (filters) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    setSort: (sortBy, sortOrder) => dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } }),
    
    // Selection functions
    selectExam: (examId) => dispatch({ type: 'SELECT_EXAM', payload: examId }),
    selectAllExams: (selected) => dispatch({ type: 'SELECT_ALL_EXAMS', payload: selected }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    
    // Pagination
    setPage: (page) => dispatch({ type: 'SET_PAGE', payload: page }),
    setItemsPerPage: (count) => dispatch({ type: 'SET_ITEMS_PER_PAGE', payload: count }),
    
    // View mode
    setViewMode: (mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    
    // Exam operations
    updateExam: (id, updates) => dispatch({ type: 'UPDATE_EXAM', payload: { id, updates } }),
    deleteExam: (examId) => {
      dispatch({ type: 'DELETE_EXAM', payload: examId });
      dispatch({ type: 'ADD_RECENT_ACTIVITY', payload: {
        type: 'delete',
        message: `Deleted exam`,
        details: { examId }
      }});
    },
    duplicateExam: (examId) => {
      dispatch({ type: 'DUPLICATE_EXAM', payload: examId });
      dispatch({ type: 'ADD_RECENT_ACTIVITY', payload: {
        type: 'duplicate',
        message: `Duplicated exam`,
        details: { examId }
      }});
    },
    
    // Bulk operations
    bulkUpdateStatus: (examIds, status) => {
      dispatch({ type: 'BULK_UPDATE_STATUS', payload: { examIds, status } });
      dispatch({ type: 'ADD_RECENT_ACTIVITY', payload: {
        type: 'bulk_update',
        message: `Updated ${examIds.length} exams to ${status}`,
        details: { examIds, status }
      }});
    },
    
    // Utility functions
    setLoading: (type, loading) => dispatch({ type: 'SET_LOADING', payload: { type, loading } }),
    addRecentActivity: (activity) => dispatch({ type: 'ADD_RECENT_ACTIVITY', payload: activity }),
    
    // Get paginated results
    getPaginatedExams: () => {
      const startIndex = (state.currentPage - 1) * state.itemsPerPage;
      const endIndex = startIndex + state.itemsPerPage;
      return state.filteredExams.slice(startIndex, endIndex);
    },
    
    // Get exam by ID
    getExamById: (id) => state.exams.find(exam => exam.id === id),
    
    // Statistics
    getTotalPages: () => Math.ceil(state.filteredExams.length / state.itemsPerPage)
  };

  return (
    <ExamManagementContext.Provider value={value}>
      {children}
    </ExamManagementContext.Provider>
  );
};

export const useExamManagement = () => {
  const context = useContext(ExamManagementContext);
  if (!context) {
    throw new Error('useExamManagement must be used within ExamManagementProvider');
  }
  return context;
};