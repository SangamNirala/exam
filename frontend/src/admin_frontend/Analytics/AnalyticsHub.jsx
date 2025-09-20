import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  Target,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const AnalyticsHub = () => {
  const { setSection } = useAdmin();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [liveData, setLiveData] = useState({
    activeAssessments: 12,
    studentsOnline: 156,
    completionRate: 78.5,
    avgScore: 82.3
  });

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        activeAssessments: Math.max(0, prev.activeAssessments + Math.floor(Math.random() * 3) - 1),
        studentsOnline: Math.max(0, prev.studentsOnline + Math.floor(Math.random() * 10) - 5),
        completionRate: Math.max(0, Math.min(100, prev.completionRate + (Math.random() - 0.5) * 2)),
        avgScore: Math.max(0, Math.min(100, prev.avgScore + (Math.random() - 0.5) * 1))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const mockAnalytics = {
    overview: {
      totalAssessments: 156,
      totalStudents: 2847,
      completedAssessments: 1293,
      avgCompletionTime: 45,
      successRate: 78.5,
      improvement: 12.3
    },
    performance: {
      byDifficulty: [
        { level: 'Beginner', avgScore: 89.2, attempts: 456 },
        { level: 'Intermediate', avgScore: 76.8, attempts: 324 },
        { level: 'Advanced', avgScore: 68.4, attempts: 198 }
      ],
      byType: [
        { type: 'MCQ', avgScore: 84.1, completion: 92.3 },
        { type: 'Descriptive', avgScore: 73.2, completion: 78.9 },
        { type: 'Coding', avgScore: 69.8, completion: 65.4 },
        { type: 'Mixed', avgScore: 77.5, completion: 81.2 }
      ]
    },
    trends: {
      weeklyStats: [
        { week: 'Week 1', assessments: 32, students: 245, avgScore: 76.2 },
        { week: 'Week 2', assessments: 28, students: 198, avgScore: 78.1 },
        { week: 'Week 3', assessments: 35, students: 267, avgScore: 79.8 },
        { week: 'Week 4', assessments: 41, students: 312, avgScore: 82.3 }
      ]
    }
  };

  const MetricCard = ({ icon: Icon, title, value, change, trend, isLive = false }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-600">{title}</p>
                {isLive && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">LIVE</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              {change && (
                <div className={`flex items-center mt-1 text-sm ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-slate-600'
                }`}>
                  {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                  {trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
                  {change}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickInsightCard = ({ icon: Icon, title, description, value, color = "blue" }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 bg-${color}-100 rounded-xl`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-600 mb-2">{description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">{value}</span>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setSection('overview')} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
            <p className="text-slate-600">Real-time insights and performance metrics</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-sm"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>
          <Button variant="outline" className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Metrics */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900">Live Metrics</h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Updated every 2s
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          <MetricCard
            icon={Activity}
            title="Active Assessments"
            value={liveData.activeAssessments}
            isLive={true}
          />
          <MetricCard
            icon={Users}
            title="Students Online"
            value={liveData.studentsOnline}
            isLive={true}
          />
          <MetricCard
            icon={Target}
            title="Completion Rate"
            value={`${liveData.completionRate.toFixed(1)}%`}
            change="+2.3%"
            trend="up"
            isLive={true}
          />
          <MetricCard
            icon={BarChart3}
            title="Average Score"
            value={`${liveData.avgScore.toFixed(1)}%`}
            change="+1.8%"
            trend="up"
            isLive={true}
          />
        </div>
      </div>

      {/* Performance Overview */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Performance Overview</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Assessment Types Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.performance.byType.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{type.type}</h4>
                      <p className="text-sm text-slate-600">{type.completion}% completion rate</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{type.avgScore}%</span>
                      <p className="text-xs text-slate-500">avg score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Difficulty Level Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.performance.byDifficulty.map((difficulty, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{difficulty.level}</h4>
                      <p className="text-sm text-slate-600">{difficulty.attempts} attempts</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{difficulty.avgScore}%</span>
                      <p className="text-xs text-slate-500">avg score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.trends.weeklyStats.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{week.week}</h4>
                      <p className="text-sm text-slate-600">{week.students} students</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{week.avgScore}%</span>
                      <p className="text-xs text-slate-500">{week.assessments} tests</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Insights */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Insights</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <QuickInsightCard
            icon={TrendingUp}
            title="Top Performing Question"
            description="Highest accuracy rate this week"
            value="94.2% correct"
            color="green"
          />
          <QuickInsightCard
            icon={AlertCircle}
            title="Needs Attention"
            description="Questions with low accuracy"
            value="8 questions"
            color="yellow"
          />
          <QuickInsightCard
            icon={Zap}
            title="AI Generation Impact"
            description="Performance boost from AI questions"
            value="+15.3%"
            color="purple"
          />
        </div>
      </div>

      {/* Detailed Reports */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Detailed Reports</CardTitle>
            <Button variant="outline" size="sm" className="rounded-lg">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Available Reports</h4>
              {[
                { name: 'Student Performance Summary', date: '2024-01-15', type: 'Weekly' },
                { name: 'Question Analytics Report', date: '2024-01-14', type: 'Monthly' },
                { name: 'Accessibility Usage Report', date: '2024-01-13', type: 'Weekly' },
                { name: 'System Health Report', date: '2024-01-12', type: 'Daily' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <h5 className="font-medium text-slate-900">{report.name}</h5>
                    <p className="text-sm text-slate-600">{report.date} • {report.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Advanced Analytics</h4>
                  <p className="text-sm text-slate-600">Get deeper insights with AI-powered analysis</p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Zap className="w-4 h-4 mr-2" />
                Generate AI Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsHub;