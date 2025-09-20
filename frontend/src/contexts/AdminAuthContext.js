import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AdminAuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  failedAttempts: 0,
  lockoutUntil: null,
  sessionExpiry: null,
  currentUser: null,
  authError: null,
  lastActivity: null,
  securityLogs: []
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        authError: null
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        failedAttempts: 0,
        lockoutUntil: null,
        authError: null,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        currentUser: action.payload.user,
        lastActivity: new Date(),
        securityLogs: [
          ...state.securityLogs,
          {
            id: Date.now(),
            type: 'LOGIN_SUCCESS',
            timestamp: new Date(),
            message: 'Admin login successful'
          }
        ].slice(-10) // Keep only last 10 logs
      };
    
    case 'LOGIN_FAILURE':
      const newFailedAttempts = state.failedAttempts + 1;
      const shouldLockout = newFailedAttempts >= 3;
      const lockoutTime = shouldLockout ? new Date(Date.now() + 30 * 1000) : null; // 30 seconds
      
      return {
        ...state,
        isLoading: false,
        failedAttempts: newFailedAttempts,
        lockoutUntil: lockoutTime,
        authError: shouldLockout 
          ? 'Too many failed attempts. Please wait 30 seconds before trying again.'
          : 'Invalid password. Please try again.',
        securityLogs: [
          ...state.securityLogs,
          {
            id: Date.now(),
            type: 'LOGIN_FAILURE',
            timestamp: new Date(),
            message: `Failed login attempt ${newFailedAttempts}/3`
          }
        ].slice(-10)
      };
    
    case 'CLEAR_LOCKOUT':
      return {
        ...state,
        lockoutUntil: null,
        failedAttempts: 0,
        authError: null
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        securityLogs: [
          ...state.securityLogs,
          {
            id: Date.now(),
            type: 'LOGOUT',
            timestamp: new Date(),
            message: 'Admin logout successful'
          }
        ].slice(-10)
      };
    
    case 'SESSION_EXPIRED':
      return {
        ...initialState,
        authError: 'Session expired. Please login again.',
        securityLogs: [
          ...state.securityLogs,
          {
            id: Date.now(),
            type: 'SESSION_EXPIRED',
            timestamp: new Date(),
            message: 'Session expired due to inactivity'
          }
        ].slice(-10)
      };
    
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date()
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        authError: null
      };
    
    default:
      return state;
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load persisted session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('assessai-admin-session');
    if (savedSession) {
      try {
        const { sessionExpiry, user } = JSON.parse(savedSession);
        const expiryDate = new Date(sessionExpiry);
        
        if (expiryDate > new Date()) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user }
          });
        } else {
          localStorage.removeItem('assessai-admin-session');
          dispatch({ type: 'SESSION_EXPIRED' });
        }
      } catch (error) {
        console.error('Error loading admin session:', error);
        localStorage.removeItem('assessai-admin-session');
      }
    }
  }, []);

  // Auto-clear lockout after 30 seconds
  useEffect(() => {
    if (state.lockoutUntil) {
      const timeUntilUnlock = state.lockoutUntil - new Date();
      if (timeUntilUnlock > 0) {
        const timer = setTimeout(() => {
          dispatch({ type: 'CLEAR_LOCKOUT' });
        }, timeUntilUnlock);
        return () => clearTimeout(timer);
      } else {
        dispatch({ type: 'CLEAR_LOCKOUT' });
      }
    }
  }, [state.lockoutUntil]);

  // Persist session changes
  useEffect(() => {
    if (state.isAuthenticated && state.sessionExpiry && state.currentUser) {
      localStorage.setItem('assessai-admin-session', JSON.stringify({
        sessionExpiry: state.sessionExpiry,
        user: state.currentUser
      }));
    } else {
      localStorage.removeItem('assessai-admin-session');
    }
  }, [state.isAuthenticated, state.sessionExpiry, state.currentUser]);

  // Session expiry check
  useEffect(() => {
    if (state.isAuthenticated && state.sessionExpiry) {
      const checkExpiry = () => {
        if (new Date() > new Date(state.sessionExpiry)) {
          dispatch({ type: 'SESSION_EXPIRED' });
        }
      };

      const interval = setInterval(checkExpiry, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.sessionExpiry]);

  const login = async (password) => {
    if (state.lockoutUntil && new Date() < state.lockoutUntil) {
      return { success: false, error: state.authError };
    }

    dispatch({ type: 'LOGIN_START' });

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === '1234') {
      const user = {
        id: 'admin-001',
        username: 'admin',
        role: 'administrator',
        permissions: ['CREATE_EXAM', 'MANAGE_EXAMS', 'VIEW_ANALYTICS', 'GENERATE_TOKENS']
      };
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user }
      });
      
      return { success: true, user };
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
      return { success: false, error: state.authError };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateActivity = () => {
    if (state.isAuthenticated) {
      dispatch({ type: 'UPDATE_ACTIVITY' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const isLocked = () => {
    return state.lockoutUntil && new Date() < state.lockoutUntil;
  };

  const getLockoutTimeRemaining = () => {
    if (!state.lockoutUntil) return 0;
    const remaining = Math.max(0, state.lockoutUntil - new Date());
    return Math.ceil(remaining / 1000);
  };

  const value = {
    ...state,
    login,
    logout,
    updateActivity,
    clearError,
    isLocked: isLocked(),
    lockoutTimeRemaining: getLockoutTimeRemaining()
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};