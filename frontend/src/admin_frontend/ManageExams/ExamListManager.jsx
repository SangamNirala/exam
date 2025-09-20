import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Search,
  Filter,
  Grid,
  List,
  Table,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Share,
  Download,
  MoreHorizontal,
  Calendar,
  Clock,
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Archive
} from 'lucide-react';
import { useExamManagement } from '../../contexts/ExamManagementContext';

const ExamListManager = () => {
  const {
    filteredExams,
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    selectedExams,
    currentPage,
    itemsPerPage,
    viewMode,
    statistics,
    setSearchQuery,
    setFilters,
    setSort,
    selectExam,
    selectAllExams,
    clearSelection,
    setPage,
    setViewMode,
    updateExam,
    deleteExam,
    duplicateExam,
    bulkUpdateStatus,
    getPaginatedExams,
    getTotalPages
  } = useExamManagement();

  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const paginatedExams = getPaginatedExams();
  const totalPages = getTotalPages();

  const statusOptions = [
    { value: 'all', label: 'All Status', count: statistics.total },
    { value: 'active', label: 'Active', count: statistics.active },
    { value: 'completed', label: 'Completed', count: statistics.completed },
    { value: 'draft', label: 'Draft', count: statistics.draft }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'draft': return 'yellow';
      case 'expired': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return Play;
      case 'completed': return CheckCircle;
      case 'draft': return Edit3;
      case 'expired': return AlertCircle;
      default: return Clock;
    }
  };

  const handleBulkAction = (action) => {
    if (selectedExams.length === 0) return;

    switch (action) {
      case 'activate':
        bulkUpdateStatus(selectedExams, 'active');
        break;
      case 'deactivate':
        bulkUpdateStatus(selectedExams, 'completed');
        break;
      case 'archive':
        bulkUpdateStatus(selectedExams, 'archived');
        break;
      case 'delete':
        if (window.confirm(`Delete ${selectedExams.length} selected exams?`)) {
          selectedExams.forEach(examId => deleteExam(examId));
        }
        break;
    }
    setShowBulkActions(false);
  };

  const ExamCard = ({ exam }) => {
    const StatusIcon = getStatusIcon(exam.status);
    
    return (
      <Card className="border border-slate-200 hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedExams.includes(exam.id)}
                onChange={() => selectExam(exam.id)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{exam.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`bg-${getStatusColor(exam.status)}-100 text-${getStatusColor(exam.status)}-700 border-${getStatusColor(exam.status)}-200`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {exam.status}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Target className="w-4 h-4" />
              <span>{exam.totalQuestions} questions</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{exam.duration} minutes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Users className="w-4 h-4" />
              <span>{exam.statistics.completions} completed</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <TrendingUp className="w-4 h-4" />
              <span>{exam.statistics.averageScore.toFixed(1)}% avg</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {exam.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {exam.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{exam.tags.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Updated {new Date(exam.lastModified).toLocaleDateString()}
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ExamRow = ({ exam }) => {
    const StatusIcon = getStatusIcon(exam.status);
    
    return (
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selectedExams.includes(exam.id)}
            onChange={() => selectExam(exam.id)}
            className="w-4 h-4 text-blue-600 rounded"
          />
        </td>
        <td className="px-6 py-4">
          <div>
            <h4 className="font-medium text-slate-900">{exam.title}</h4>
            <p className="text-sm text-slate-600 line-clamp-1">{exam.description}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <Badge 
            variant="outline" 
            className={`bg-${getStatusColor(exam.status)}-100 text-${getStatusColor(exam.status)}-700 border-${getStatusColor(exam.status)}-200`}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {exam.status}
          </Badge>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600 capitalize">
          {exam.type}
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
          {exam.totalQuestions}
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
          {exam.statistics.completions}
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
          {exam.statistics.averageScore.toFixed(1)}%
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
          {new Date(exam.lastModified).toLocaleDateString()}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="rounded-lg">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-lg">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-lg">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Assessments</h2>
          <p className="text-slate-600">View and manage all your created assessments</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {statusOptions.map((option) => (
          <Card 
            key={option.value}
            className={`border-0 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${
              filters.status === option.value ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setFilters({ status: option.value })}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{option.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{option.count}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${
                  option.value === 'active' ? 'green' :
                  option.value === 'completed' ? 'blue' :
                  option.value === 'draft' ? 'yellow' : 'slate'
                }-100`}>
                  {option.value === 'active' && <Play className="w-6 h-6 text-green-600" />}
                  {option.value === 'completed' && <CheckCircle className="w-6 h-6 text-blue-600" />}
                  {option.value === 'draft' && <Edit3 className="w-6 h-6 text-yellow-600" />}
                  {option.value === 'all' && <Target className="w-6 h-6 text-slate-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedExams.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="rounded-xl"
                >
                  Actions ({selectedExams.length})
                </Button>
              )}
              
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-lg"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-lg"
                >
                  <Table className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="all">All Types</option>
                    <option value="mcq">Multiple Choice</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="coding">Coding</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ difficulty: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ dateRange: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      setSort(sortBy, sortOrder);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="lastModified-desc">Recently Modified</option>
                    <option value="createdAt-desc">Recently Created</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="completions-desc">Most Completed</option>
                    <option value="averageScore-desc">Highest Score</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {showBulkActions && selectedExams.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedExams.length} assessments selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('deactivate')}
                    className="rounded-lg"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('archive')}
                    className="rounded-lg"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam List */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedExams.length === paginatedExams.length && paginatedExams.length > 0}
                        onChange={(e) => selectAllExams(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Questions</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Completed</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Avg Score</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Modified</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExams.map((exam) => (
                    <ExamRow key={exam.id} exam={exam} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredExams.length)} of {filteredExams.length} assessments
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg"
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => setPage(page)}
                  className="rounded-lg"
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredExams.length === 0 && (
        <div className="text-center py-12">
          <div className="p-4 bg-slate-100 rounded-2xl inline-block mb-4">
            <Target className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Assessments Found</h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || filters.status !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by creating your first assessment'
            }
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Create Assessment
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamListManager;