import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppStateContext = createContext();

const initialState = {
  currentView: 'landing', // landing, dashboard
  activeTab: 'admin', // admin, student
  user: null,
  isOnline: true,
  notifications: [],
  theme: 'light',
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: false
  },
  systemStatus: {
    assessmentsActive: 12,
    studentsOnline: 245,
    systemHealth: 'excellent'
  }
};

const appStateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'TOGGLE_ACCESSIBILITY':
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          [action.payload]: !state.accessibility[action.payload]
        }
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'UPDATE_SYSTEM_STATUS':
      return {
        ...state,
        systemStatus: { ...state.systemStatus, ...action.payload }
      };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    default:
      return state;
  }
};

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  // Load persisted state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('assessai-app-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'SET_ACTIVE_TAB', payload: parsedState.activeTab || 'admin' });
        dispatch({ type: 'SET_THEME', payload: parsedState.theme || 'light' });
        if (parsedState.accessibility) {
          Object.keys(parsedState.accessibility).forEach(key => {
            if (parsedState.accessibility[key]) {
              dispatch({ type: 'TOGGLE_ACCESSIBILITY', payload: key });
            }
          });
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    const stateToSave = {
      activeTab: state.activeTab,
      theme: state.theme,
      accessibility: state.accessibility
    };
    localStorage.setItem('assessai-app-state', JSON.stringify(stateToSave));
  }, [state.activeTab, state.theme, state.accessibility]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    state,
    dispatch,
    // Convenience methods
    setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
    setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    toggleAccessibility: (feature) => dispatch({ type: 'TOGGLE_ACCESSIBILITY', payload: feature }),
    addNotification: (notification) => dispatch({ type: 'ADD_NOTIFICATION', payload: { ...notification, id: Date.now() } }),
    removeNotification: (id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};