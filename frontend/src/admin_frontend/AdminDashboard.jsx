import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3,
  FileText,
  Users,
  Settings,
  Plus,
  Upload,
  Brain,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap,
  Activity,
  Calendar,
  Search,
  Filter,
  Star,
  Target
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import ExamWizard from './ExamCreation/ExamWizard';
import QuestionManager from './QuestionBank/QuestionManager';
import AnalyticsHub from './Analytics/AnalyticsHub';

const AdminDashboard = () => {
  const { state, setSection, addNotification } = useAdmin();
  const [quickStats, setQuickStats] = useState({
    totalExams: 156,
    activeAssessments: 23,
    studentsEvaluated: 2847,
    avgScore: 78.5,
    pendingReviews: 12,
    systemHealth: 98.2
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQuickStats(prev => ({
        ...prev,
        activeAssessments: Math.max(0, prev.activeAssessments + Math.floor(Math.random() * 3) - 1),
        studentsEvaluated: prev.studentsEvaluated + Math.floor(Math.random() * 5),
        systemHealth: Math.max(95, Math.min(99.9, prev.systemHealth + (Math.random() - 0.5) * 0.5))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const SectionButton = ({ section, icon: Icon, label, isActive, badge = null }) => (
    <button
      onClick={() => setSection(section)}
      className={`w-full flex items-center justify-between p-4 rounded-xl font-medium transition-all duration-200 group ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center">
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
        {label}
      </div>
      {badge && (
        <Badge variant={isActive ? "secondary" : "outline"} className="ml-2">
          {badge}
        </Badge>
      )}
    </button>
  );

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

  const QuickActionCard = ({ icon: Icon, title, description, action, color = "blue", badge = null }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 bg-${color}-100 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900">{title}</h3>
              {badge && <Badge variant="outline">{badge}</Badge>}
            </div>
            <p className="text-sm text-slate-600 mb-4">{description}</p>
            <Button 
              size="sm" 
              className={`bg-${color}-600 hover:bg-${color}-700 text-white rounded-lg`}
              onClick={action}
            >
              <Zap className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (state.currentSection !== 'overview') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {state.currentSection === 'exams' && <ExamWizard />}
        {state.currentSection === 'questions' && <QuestionManager />}
        {state.currentSection === 'analytics' && <AnalyticsHub />}
        {state.currentSection === 'students' && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Student Management</h3>
            <p className="text-slate-600">Advanced student tracking and token management coming in Phase 2.</p>
          </div>
        )}
        {state.currentSection === 'settings' && (
          <div className="text-center py-20">
            <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Admin Settings</h3>
            <p className="text-slate-600">System configuration and preferences coming in Phase 2.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Navigation Sidebar */}
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Navigation</h3>
          <SectionButton
            section="overview"
            icon={Activity}
            label="Overview"
            isActive={state.currentSection === 'overview'}
          />
          <SectionButton
            section="exams"
            icon={FileText}
            label="Assessments"
            isActive={state.currentSection === 'exams'}
            badge={quickStats.totalExams}
          />
          <SectionButton
            section="questions"
            icon={Brain}
            label="Question Bank"
            isActive={state.currentSection === 'questions'}
            badge="AI"
          />
          <SectionButton
            section="analytics"
            icon={BarChart3}
            label="Analytics"
            isActive={state.currentSection === 'analytics'}
            badge="Live"
          />
          <SectionButton
            section="students"
            icon={Users}
            label="Students"
            isActive={state.currentSection === 'students'}
            badge={quickStats.studentsEvaluated}
          />
          <SectionButton
            section="settings"
            icon={Settings}
            label="Settings"
            isActive={state.currentSection === 'settings'}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Admin Overview</h2>
              <p className="text-slate-600 mt-1">Manage assessments, analyze performance, and monitor system health</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="rounded-xl">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" className="rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              icon={FileText}
              title="Total Assessments"
              value={quickStats.totalExams}
              change="+12%"
              trend="up"
              color="blue"
            />
            <StatCard
              icon={Activity}
              title="Active Now"
              value={quickStats.activeAssessments}
              change="Live"
              trend="up"
              color="green"
            />
            <StatCard
              icon={Users}
              title="Students Evaluated"
              value={quickStats.studentsEvaluated.toLocaleString()}
              change="+8.3%"
              trend="up"
              color="purple"
            />
            <StatCard
              icon={Target}
              title="Average Score"
              value={`${quickStats.avgScore}%`}
              change="+2.1%"
              trend="up"
              color="orange"
            />
            <StatCard
              icon={Clock}
              title="Pending Reviews"
              value={quickStats.pendingReviews}
              change="-15%"
              trend="down"
              color="yellow"
            />
            <StatCard
              icon={CheckCircle}
              title="System Health"
              value={`${quickStats.systemHealth.toFixed(1)}%`}
              change="Excellent"
              trend="up"
              color="green"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Quick Actions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <QuickActionCard
                icon={Brain}
                title="AI-Powered Question Generation"
                description="Upload documents and let AI create comprehensive questions automatically"
                action={() => setSection('questions')}
                color="blue"
                badge="New"
              />
              <QuickActionCard
                icon={FileText}
                title="Create New Assessment"
                description="Build custom assessments with our intuitive exam wizard"
                action={() => setSection('exams')}
                color="green"
              />
              <QuickActionCard
                icon={BarChart3}
                title="View Analytics Dashboard"
                description="Get detailed insights into student performance and assessment effectiveness"
                action={() => setSection('analytics')}
                color="purple"
                badge="Live"
              />
              <QuickActionCard
                icon={Users}
                title="Manage Student Tokens"
                description="Generate secure access tokens and monitor student progress"
                action={() => setSection('students')}
                color="orange"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <Activity className="w-6 h-6 mr-3 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'exam', title: 'AI Fundamentals Assessment', action: 'completed by 23 students', time: '5 minutes ago', status: 'success' },
                  { type: 'question', title: 'Python Programming Questions', action: 'generated via AI', time: '12 minutes ago', status: 'info' },
                  { type: 'student', title: 'Digital Literacy Test', action: 'started by new student', time: '18 minutes ago', status: 'active' },
                  { type: 'system', title: 'Weekly Backup', action: 'completed successfully', time: '1 hour ago', status: 'success' },
                  { type: 'alert', title: 'Token Expiry Warning', action: '3 tokens expiring soon', time: '2 hours ago', status: 'warning' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        activity.status === 'success' ? 'bg-green-100' :
                        activity.status === 'warning' ? 'bg-yellow-100' :
                        activity.status === 'active' ? 'bg-blue-100' :
                        'bg-slate-100'
                      }`}>
                        {activity.type === 'exam' && <FileText className="w-4 h-4 text-green-600" />}
                        {activity.type === 'question' && <Brain className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'student' && <Users className="w-4 h-4 text-purple-600" />}
                        {activity.type === 'system' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {activity.type === 'alert' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{activity.title}</h4>
                        <p className="text-sm text-slate-600">{activity.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-500">{activity.time}</span>
                      <Badge variant={
                        activity.status === 'success' ? 'default' :
                        activity.status === 'warning' ? 'destructive' :
                        'outline'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;