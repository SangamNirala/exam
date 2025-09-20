import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  Award, 
  ArrowLeft, 
  Bell, 
  Settings, 
  Accessibility,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Keyboard,
  Activity
} from 'lucide-react';
import { useAppState } from '../contexts/AppStateContext';
import { useTabSwitching } from '../hooks/useTabSwitching';
import AdminDashboard from '../admin_frontend/AdminDashboard';
import StudentDashboard from '../student_frontend/StudentDashboard';
import AuthenticationFlow from '../student_frontend/Auth/AuthenticationFlow';

const Dashboard = ({ onBackToLanding }) => {
  const { state, toggleAccessibility, addNotification } = useAppState();
  const { activeTab, switchTab, getTabAnimationClass, transitionRef } = useTabSwitching();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Demo notification system
  useEffect(() => {
    const notifications = [
      { id: 1, type: 'info', message: '3 new assessments completed', timestamp: Date.now() - 300000 },
      { id: 2, type: 'success', message: 'System backup completed successfully', timestamp: Date.now() - 600000 }
    ];
    
    notifications.forEach(notification => {
      setTimeout(() => addNotification(notification), Math.random() * 2000);
    });
  }, [addNotification]);

  // Keyboard shortcuts help
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === '?' && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      if (event.key === 'Escape') {
        setShowKeyboardShortcuts(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardShortcuts]);

  const TabButton = ({ tab, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab)}
      className={`
        flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 group
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg scale-105' 
          : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md'
        }
      `}
      aria-pressed={isActive}
      role="tab"
    >
      <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
      {label}
      {isActive && (
        <div className="ml-3 w-2 h-2 bg-white rounded-full animate-pulse" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={onBackToLanding}
                className="hover:bg-slate-100 rounded-xl transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>
              
              <div className="h-8 w-px bg-slate-200" />
              
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">AssessAI Pro Dashboard</h1>
                  <p className="text-sm text-slate-600">Professional Assessment Management</p>
                </div>
              </div>
            </div>

            {/* Center - Tab Navigation */}
            <div className="flex items-center bg-slate-100 rounded-2xl p-2 shadow-inner">
              <TabButton
                tab="admin"
                icon={Users}
                label="Admin"
                isActive={activeTab === 'admin'}
                onClick={switchTab}
              />
              <TabButton
                tab="student"
                icon={Award}
                label="Student"
                isActive={activeTab === 'student'}
                onClick={switchTab}
              />
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-3">
                <Badge 
                  variant="outline" 
                  className={`${state.isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                >
                  {state.isOnline ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
                  {state.isOnline ? 'Online' : 'Offline'}
                </Badge>
                
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {state.systemStatus.assessmentsActive} Active
                </Badge>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAccessibility('highContrast')}
                  className={`rounded-xl ${state.accessibility.highContrast ? 'bg-blue-100 text-blue-700' : ''}`}
                  title="Toggle High Contrast"
                >
                  <Accessibility className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className="rounded-xl"
                  title="Keyboard Shortcuts (Press ?)"
                >
                  <Keyboard className="w-4 h-4" />
                </Button>

                <div className="relative">
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    <Bell className="w-4 h-4" />
                    {state.notifications.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </Button>
                </div>

                <Button variant="ghost" size="sm" className="rounded-xl">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main 
        ref={transitionRef}
        className="relative overflow-hidden"
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        {/* Admin Tab */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            activeTab === 'admin' 
              ? 'translate-x-0 opacity-100' 
              : 'translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <AdminDashboard />
        </div>

        {/* Student Tab */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            activeTab === 'student' 
              ? 'translate-x-0 opacity-100' 
              : '-translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <AuthenticationFlow />
        </div>
      </main>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Keyboard Shortcuts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(false)}
                className="rounded-lg"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Switch to Admin</span>
                <kbd className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">Alt + A</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Switch to Student</span>
                <kbd className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">Alt + S</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Back to Home</span>
                <kbd className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">Alt + L</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">?</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Close Modal</span>
                <kbd className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">Esc</kbd>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Pro Tip:</strong> All shortcuts work globally within the dashboard for seamless navigation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast Area */}
      {state.notifications.length > 0 && (
        <div className="fixed top-20 right-6 z-40 space-y-2">
          {state.notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className="bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Overlay for Tab Switching */}
      <div className={`fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-30 transition-opacity duration-300 ${
        transitionRef.current?.classList.contains('tab-switching') ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-slate-700 font-medium">Switching views...</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;