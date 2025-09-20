import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowLeft,
  Plus,
  FileText,
  Users,
  BarChart3,
  Settings,
  Upload,
  Brain,
  Eye,
  Download,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const mockAdminStats = {
    totalExams: 156,
    activeStudents: 2847,
    completedAssessments: 1293,
    pendingReviews: 23
  };

  const recentExams = [
    { id: 1, title: "AI Fundamentals Test", students: 45, status: "Active", date: "2024-01-15" },
    { id: 2, title: "Digital Literacy Assessment", students: 78, status: "Completed", date: "2024-01-14" },
    { id: 3, title: "Programming Skills Evaluation", students: 32, status: "Draft", date: "2024-01-13" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="hover:bg-slate-100 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                System Online
              </Badge>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'assessments', label: 'Assessments', icon: FileText },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Exams</p>
                      <p className="text-3xl font-bold text-slate-900">{mockAdminStats.totalExams}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Active Students</p>
                      <p className="text-3xl font-bold text-slate-900">{mockAdminStats.activeStudents}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Completed</p>
                      <p className="text-3xl font-bold text-slate-900">{mockAdminStats.completedAssessments}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Pending Reviews</p>
                      <p className="text-3xl font-bold text-slate-900">{mockAdminStats.pendingReviews}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <Brain className="w-6 h-6 mr-3 text-blue-600" />
                    AI-Powered Assessment Creation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">
                    Upload documents and let AI generate comprehensive questions automatically.
                  </p>
                  <div className="flex space-x-3">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      <Eye className="w-4 h-4 mr-2" />
                      View Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
                    Assessment Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">
                    Get detailed insights into student performance and assessment effectiveness.
                  </p>
                  <div className="flex space-x-3">
                    <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Exams */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentExams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{exam.title}</h4>
                          <p className="text-sm text-slate-600">{exam.students} students • {exam.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={exam.status === 'Active' ? 'default' : exam.status === 'Completed' ? 'secondary' : 'outline'}
                          className={
                            exam.status === 'Active' ? 'bg-green-100 text-green-700' :
                            exam.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }
                        >
                          {exam.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="hover:bg-white rounded-lg">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'overview' && (
          <div className="text-center py-20">
            <div className="p-4 bg-slate-100 rounded-2xl inline-block mb-4">
              <Settings className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</h3>
            <p className="text-slate-600">This section will be implemented in the next phase.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;