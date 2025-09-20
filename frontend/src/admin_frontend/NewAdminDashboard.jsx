import React, { useState, useEffect } from 'react';
import { AdminAuthProvider, useAdminAuth } from '../contexts/AdminAuthContext';
import { ExamCreationProvider } from '../contexts/ExamCreationContext';
import { ExamManagementProvider } from '../contexts/ExamManagementContext';
import PasswordPrompt from './Auth/PasswordPrompt';
import NavigationHeader from './Layout/NavigationHeader';
import ExamCreationWizard from './ExamCreation/ExamCreationWizard';
import ExamListManager from './ManageExams/ExamListManager';
import AnalyticsHub from './Analytics/AnalyticsHub';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Plus,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  Activity,
  Zap,
  Brain,
  Settings,
  AlertCircle
} from 'lucide-react';

const AdminDashboardContent = () => {
  const { isAuthenticated, currentUser, updateActivity } = useAdminAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Update activity on user interactions
  useEffect(() => {
    const handleActivity = () => updateActivity();
    
    document.addEventListener('click', handleActivity);
    document.addEventListener('keypress', handleActivity);
    
    return () => {
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('keypress', handleActivity);
    };
  }, [updateActivity]);

  // Mock dashboard statistics
  const dashboardStats = {
    totalExams: 156,
    activeExams: 23,
    totalStudents: 2847,
    totalCompletions: 1293,
    averageScore: 78.5,
    pendingReviews: 12,
    systemHealth: 98.2,
    recentActivity: [
      { id: 1, type: 'exam_completed', message: '15 students completed "AI Fundamentals Test"', time: '5 min ago' },
      { id: 2, type: 'exam_created', message: 'New exam "Python Basics" created', time: '12 min ago' },
      { id: 3, type: 'student_registered', message: '3 new students registered for assessments', time: '18 min ago' },
      { id: 4, type: 'system_update', message: 'AI question generation improved', time: '25 min ago' }
    ]
  };

  const quickActionCards = [
    {
      id: 'create-exam',
      title: 'Create New Assessment',
      description: 'Build a new assessment with AI-powered question generation',
      icon: Plus,
      color: 'blue',
      action: () => setShowCreateWizard(true),
      badge: 'Quick Start'
    },
    {
      id: 'ai-generation',
      title: 'AI Question Generator',
      description: 'Generate questions from documents using advanced AI',
      icon: Brain,
      color: 'purple',
      action: () => setShowCreateWizard(true),
      badge: 'AI Powered'
    },
    {
      id: 'manage-exams',
      title: 'Manage Assessments',
      description: 'View, edit, and organize your existing assessments',
      icon: Settings,
      color: 'green',
      action: () => setActiveSection('manage')
    },
    {
      id: 'view-analytics',
      title: 'Performance Analytics',
      description: 'Detailed insights and performance reports',
      icon: BarChart3,
      color: 'orange',
      action: () => setActiveSection('analytics'),
      badge: 'Live Data'
    }
  ];

  const StatCard = ({ icon: Icon, title, value, change, trend, color = "blue" }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 bg-${color}-100 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              {change && (
                <div className={`flex items-center mt-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                  {change}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ action, onClick }) => {
    const ActionIcon = action.icon;
    return (
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={onClick}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 bg-${action.color}-100 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
              <ActionIcon className={`w-6 h-6 text-${action.color}-600`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                {action.badge && (
                  <Badge variant="outline" className={`bg-${action.color}-50 text-${action.color}-700 border-${action.color}-200`}>
                    {action.badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-4">{action.description}</p>
              <Button size="sm" className={`bg-${action.color}-600 hover:bg-${action.color}-700 text-white rounded-xl`}>
                <Zap className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (showCreateWizard) {
      return <ExamCreationWizard onClose={() => setShowCreateWizard(false)} />;
    }

    switch (activeSection) {
      case 'create':
        return <ExamCreationWizard onClose={() => setActiveSection('dashboard')} />;
      case 'manage':
        return <ExamListManager />;
      case 'analytics':
        return <AnalyticsHub />;
      default:
        return (
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    Welcome back, {currentUser?.username || 'Admin'}! 👋
                  </h1>
                  <p className="text-lg text-slate-600 mb-4">
                    Ready to create amazing assessments and track student progress.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      System Healthy
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Activity className="w-4 h-4 mr-1" />
                      {dashboardStats.activeExams} Active Exams
                    </Badge>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <BarChart3 className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>



            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {quickActionCards.map((action) => (
                  <QuickActionCard 
                    key={action.id} 
                    action={action} 
                    onClick={action.action}
                  />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-900">
                      <Activity className="w-6 h-6 mr-3 text-green-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardStats.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            {activity.type === 'exam_completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {activity.type === 'exam_created' && <Plus className="w-5 h-5 text-blue-600" />}
                            {activity.type === 'student_registered' && <Users className="w-5 h-5 text-purple-600" />}
                            {activity.type === 'system_update' && <Settings className="w-5 h-5 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                            <p className="text-xs text-slate-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-900">
                      <Target className="w-6 h-6 mr-3 text-blue-600" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">System Health</span>
                      </div>
                      <span className="text-sm font-bold text-green-900">{dashboardStats.systemHealth}%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Active Sessions</span>
                      </div>
                      <span className="text-sm font-bold text-blue-900">{dashboardStats.activeExams}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">Pending Reviews</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-900">{dashboardStats.pendingReviews}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">AI Processing</span>
                      </div>
                      <span className="text-sm font-bold text-purple-900">Ready</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <PasswordPrompt onClose={() => {}} onSuccess={() => {}} />;
  }

  return (
    <ExamCreationProvider>
      <ExamManagementProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <NavigationHeader 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
          />
          {renderContent()}
        </div>
      </ExamManagementProvider>
    </ExamCreationProvider>
  );
};

const NewAdminDashboard = () => {
  return (
    <AdminAuthProvider>
      <AdminDashboardContent />
    </AdminAuthProvider>
  );
};

export default NewAdminDashboard;