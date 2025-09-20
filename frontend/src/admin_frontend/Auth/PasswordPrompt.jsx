import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Shield,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  CheckCircle,
  Timer,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const PasswordPrompt = ({ onClose, onSuccess }) => {
  const { login, authError, isLoading, failedAttempts, isLocked, lockoutTimeRemaining, clearError } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const passwordInputRef = useRef(null);

  // Focus password input on mount
  useEffect(() => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, []);

  // Handle lockout countdown
  useEffect(() => {
    if (isLocked && lockoutTimeRemaining > 0) {
      setCountdown(lockoutTimeRemaining);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTimeRemaining]);

  // Clear errors when password changes
  useEffect(() => {
    if (authError && password) {
      clearError();
    }
  }, [password, authError, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || isLocked || isLoading) return;

    const result = await login(password);
    if (result.success) {
      onSuccess();
    }
    // Error is handled by context
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const getSecurityLevel = () => {
    if (failedAttempts === 0) return { level: 'High', color: 'green', icon: CheckCircle };
    if (failedAttempts === 1) return { level: 'Medium', color: 'yellow', icon: AlertCircle };
    if (failedAttempts === 2) return { level: 'Low', color: 'red', icon: AlertCircle };
    return { level: 'Locked', color: 'red', icon: Lock };
  };

  const securityInfo = getSecurityLevel();
  const SecurityIcon = securityInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
      <Card className="w-full max-w-md border-0 shadow-2xl animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl w-fit">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Admin Authentication
          </CardTitle>
          <p className="text-slate-600 mt-2">
            Enter the admin password to access the administrative panel
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <SecurityIcon className={`w-5 h-5 text-${securityInfo.color}-600`} />
              <span className="text-sm font-medium text-slate-700">Security Level</span>
            </div>
            <Badge 
              variant="outline" 
              className={`bg-${securityInfo.color}-50 text-${securityInfo.color}-700 border-${securityInfo.color}-200`}
            >
              {securityInfo.level}
            </Badge>
          </div>

          {/* Lockout Warning */}
          {isLocked && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Timer className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-semibold text-red-900">Account Temporarily Locked</h4>
                  <p className="text-sm text-red-700">
                    Please wait {countdown} seconds before trying again
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter admin password"
                  className={`pr-12 text-lg font-mono ${
                    authError ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  disabled={isLocked || isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {authError && (
                <div className="flex items-center mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{authError}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>Attempts: {failedAttempts}/3</span>
                <span>Demo password: 1234</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                disabled={isLocked || isLoading || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Authenticating...
                  </>
                ) : isLocked ? (
                  <>
                    <Lock className="w-5 h-5 mr-3" />
                    Locked ({countdown}s)
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5 mr-3" />
                    Access Admin Panel
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-3 rounded-xl"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Security Information */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <UserCheck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Security Features</h4>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• 24-hour session persistence</li>
                  <li>• 3 failed attempts trigger 30-second lockout</li>
                  <li>• All security events are logged</li>
                  <li>• Automatic session expiry for security</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="text-center text-xs text-slate-500">
            <span>Press </span>
            <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Enter</kbd>
            <span> to login • </span>
            <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Esc</kbd>
            <span> to cancel</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordPrompt;