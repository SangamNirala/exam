import { useCallback, useEffect, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';

export const useTabSwitching = () => {
  const { state, setActiveTab } = useAppState();
  const transitionRef = useRef(null);
  const previousTabRef = useRef(state.activeTab);

  // Smooth tab switching with animation
  const switchTab = useCallback((newTab, options = {}) => {
    const { 
      withAnimation = true, 
      preserveState = true,
      onComplete = null 
    } = options;

    if (newTab === state.activeTab) return;

    previousTabRef.current = state.activeTab;

    if (withAnimation && transitionRef.current) {
      // Add transition classes
      transitionRef.current.classList.add('tab-switching');
      
      // Small delay to allow CSS transition to start
      setTimeout(() => {
        setActiveTab(newTab);
        
        // Complete transition after animation
        setTimeout(() => {
          if (transitionRef.current) {
            transitionRef.current.classList.remove('tab-switching');
          }
          onComplete && onComplete();
        }, 300);
      }, 50);
    } else {
      setActiveTab(newTab);
      onComplete && onComplete();
    }

    // Track tab switch analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'tab_switch', {
        from_tab: previousTabRef.current,
        to_tab: newTab,
        preserve_state: preserveState
      });
    }
  }, [state.activeTab, setActiveTab]);

  // Keyboard shortcuts for tab switching
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Alt + A for Admin tab
      if (event.altKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        switchTab('admin');
      }
      // Alt + S for Student tab
      else if (event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        switchTab('student');
      }
      // Alt + L for Landing/Home
      else if (event.altKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        // This would navigate back to landing page
        window.history.pushState({}, '', '/');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [switchTab]);

  // URL synchronization
  useEffect(() => {
    const currentPath = window.location.pathname;
    const expectedPath = `/dashboard/${state.activeTab}`;
    
    if (currentPath !== expectedPath && currentPath.startsWith('/dashboard')) {
      window.history.replaceState({}, '', expectedPath);
    }
  }, [state.activeTab]);

  // Preload tab content for faster switching
  const preloadTab = useCallback((tabName) => {
    // This could be used to prefetch data for the target tab
    // Implementation would depend on data fetching strategy
    console.log(`Preloading ${tabName} tab content...`);
  }, []);

  // Get tab switching animation state
  const getTabAnimationClass = useCallback((tabName) => {
    if (tabName === state.activeTab) {
      return 'tab-active tab-enter';
    } else if (tabName === previousTabRef.current) {
      return 'tab-exit';
    }
    return 'tab-hidden';
  }, [state.activeTab]);

  // Check if tab switch is in progress
  const isSwitching = transitionRef.current?.classList.contains('tab-switching') || false;

  return {
    activeTab: state.activeTab,
    previousTab: previousTabRef.current,
    switchTab,
    preloadTab,
    getTabAnimationClass,
    isSwitching,
    transitionRef,
    // Tab validation
    isValidTab: (tabName) => ['admin', 'student'].includes(tabName),
    // Get opposite tab
    getOppositeTab: () => state.activeTab === 'admin' ? 'student' : 'admin'
  };
};

// Custom hook for tab-specific data persistence
export const useTabPersistence = (tabName) => {
  const { state } = useAppState();
  const isCurrentTab = state.activeTab === tabName;
  
  const persistData = useCallback((key, data) => {
    const storageKey = `assessai-${tabName}-${key}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to persist ${tabName} data:`, error);
    }
  }, [tabName]);

  const retrieveData = useCallback((key, defaultValue = null) => {
    const storageKey = `assessai-${tabName}-${key}`;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Failed to retrieve ${tabName} data:`, error);
      return defaultValue;
    }
  }, [tabName]);

  const clearTabData = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(`assessai-${tabName}-`)
    );
    keys.forEach(key => localStorage.removeItem(key));
  }, [tabName]);

  return {
    isCurrentTab,
    persistData,
    retrieveData,
    clearTabData
  };
};