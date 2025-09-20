import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Timer,
  Play,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Wifi,
  Shield
} from 'lucide-react';
import { useStudent } from '../../contexts/StudentContext';

const ExamCountdown = () => {
  const { state, setView } = useStudent();
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Countdown logic
  useEffect(() => {
    let interval;
    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setView('assessment');
    }
    return () => clearInterval(interval);
  }, [isCountingDown, countdown, setView]);

  const handleStartCountdown = () => {
    setIsCountingDown(true);
  };

  const examInfo = state.examInfo || {};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Exam Information */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{examInfo.title || 'Your Assessment'}</CardTitle>
            <p className="text-slate-600">You're about to begin your assessment</p>
          </CardHeader>
        </Card>

        {/* Countdown Display */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            {!isCountingDown ? (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
                  <Timer className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Ready to Begin?</h2>
                  <p className="text-lg text-slate-600">Click to start the countdown</p>
                </div>
                
                <Button
                  onClick={handleStartCountdown}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Countdown
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-48 h-48 mx-auto relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl font-bold text-blue-600">{countdown}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {countdown > 0 ? 'Starting in...' : 'Starting Now!'}
                  </h2>
                  <p className="text-lg text-slate-600">
                    {countdown > 0 
                      ? 'Get ready, your exam will begin shortly' 
                      : 'Launching your assessment interface'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50">
              <Monitor className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Browser: Compatible</span>
              <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Internet: Connected</span>
              <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Security: Active</span>
              <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamCountdown;