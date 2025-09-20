import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Shield,
  Activity,
  ChevronDown,
  Menu,
  X,
  Plus,
  FileText,
  BarChart3,
  Users,
  Key
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const NavigationHeader = ({ activeSection, onSectionChange }) => {
  const { currentUser, logout, securityLogs } = useAdminAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const navigationTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Activity,
      description: 'Overview and quick actions'
    },
    {
      id: 'create',
      label: 'Create Exam',
      icon: Plus,
      description: 'Build new assessments',
      badge: 'New'
    },
    {
      id: 'manage',
      label: 'Manage Exams',
      icon: FileText,
      description: 'Edit and organize exams'
    },
    {
      id: 'analytics',
      label: 'Reports & Analytics',
      icon: BarChart3,
      description: 'Performance insights',
      badge: 'Live'
    }
  ];

  const mockNotifications = [
    {
      id: 1,
      type: 'success',
      message: '3 new exam completions',
      time: '2 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'info',
      message: 'System backup completed',
      time: '15 min ago',
      unread: true
    },
    {
      id: 3,
      type: 'warning',
      message: '5 tokens expiring today',
      time: '1 hour ago',
      unread: false
    }
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const NavTab = ({ tab, isActive, onClick }) => {
    const IconComponent = tab.icon;
    return (
      <button
        onClick={() => onClick(tab.id)}
        className={`relative flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 group ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg scale-105'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title={tab.description}
      >
        <IconComponent className={`w-5 h-5 mr-3 transition-transform duration-300 ${
          isActive ? 'scale-110' : 'group-hover:scale-105'
        }`} />
        <span className="hidden md:block">{tab.label}</span>
        {tab.badge && (
          <Badge 
            variant={isActive ? "secondary" : "outline"} 
            className={`ml-2 text-xs ${
              isActive ? 'bg-white text-blue-600' : ''
            }`}
          >
            {tab.badge}
          </Badge>
        )}
        {isActive && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
        )}
      </button>
    );
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Header */}
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
                <p className="text-xs text-slate-600">Assessment Management System</p>
              </div>
            </div>
          </div>

          {/* Center: Navigation Tabs (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-100 rounded-2xl p-2">
            {navigationTabs.map((tab) => (
              <NavTab
                key={tab.id}
                tab={tab}
                isActive={activeSection === tab.id}
                onClick={onSectionChange}
              />
            ))}
          </div>

          {/* Right: Search, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search (Desktop) */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search exams, students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl"
              >
                <Bell className="w-5 h-5" />
                {mockNotifications.filter(n => n.unread).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {mockNotifications.filter(n => n.unread).length}
                  </div>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-sm text-slate-900">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 text-center">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View All Notifications
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 rounded-xl hover:bg-slate-100"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-900">Admin</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Administrator</p>
                        <p className="text-sm text-slate-500">admin@assessai.pro</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start rounded-lg">
                      <Settings className="w-4 h-4 mr-3" />
                      Account Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start rounded-lg">
                      <Key className="w-4 h-4 mr-3" />
                      Security Logs
                    </Button>
                    <div className="border-t border-slate-100 my-2" />
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full justify-start rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-slate-200 py-4">
            <div className="space-y-2">
              {navigationTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSectionChange(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      activeSection === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <Badge variant="outline" className="text-xs">
                        {tab.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Mobile Search */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search exams, students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default NavigationHeader;