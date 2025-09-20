import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  CheckCircle,
  Clock,
  FileText,
  Send,
  Trophy,
  Target,
  Timer,
  Star,
  Award
} from 'lucide-react';
import { useStudent } from '../../contexts/StudentContext';

const ExamSubmission = () => {
  const { state, setView } = useStudent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  // Mock exam results
  const mockResults = {
    score: 85,
    maxScore: 100,
    questionsAttempted: 3,
    totalQuestions: 3,
    timeSpent: 25,
    examTitle: state.examInfo?.title || 'Assessment'
  };

  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setSubmissionComplete(true);
      setIsSubmitting(false);
    }, 2000);
  };

  if (submissionComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-8">
          {/* Success Message */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-green-100 rounded-full inline-block mb-6">
                <Trophy className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Congratulations!</h2>
              <p className="text-lg text-slate-600 mb-6">
                You have successfully completed your assessment.
              </p>
              <Badge className="px-4 py-2 text-lg bg-green-50 text-green-700 border-green-200">
                <Award className="w-5 h-5 mr-2" />
                Excellent Performance
              </Badge>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Exam Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {mockResults.score}%
                  </div>
                  <p className="text-slate-600">Overall Score</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Score</span>
                    <span className="font-semibold text-slate-900">
                      {mockResults.score} / {mockResults.maxScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Questions Attempted</span>
                    <span className="font-semibold text-slate-900">
                      {mockResults.questionsAttempted} / {mockResults.totalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Time Spent</span>
                    <span className="font-semibold text-slate-900">
                      {mockResults.timeSpent} minutes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Excellent Performance</h4>
                    <p className="text-sm text-green-700">Great work!</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Time Management</h4>
                    <p className="text-sm text-blue-700">Efficient time usage</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-purple-900">Completion Rate</h4>
                    <p className="text-sm text-purple-700">100% completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setView('dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
            >
              Return to Dashboard
            </Button>
          </div>

          {/* Thank You Message */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-8 text-center">
              <Star className="w-8 h-8 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Thank You!</h3>
              <p className="text-slate-600">
                Thank you for using our assessment platform. We hope you had a smooth 
                and accessible testing experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Exam Summary */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Submit Your Exam</CardTitle>
            <p className="text-slate-600">Review your responses before final submission</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-900 mb-1">3</div>
                <div className="text-sm text-blue-600">Questions Answered</div>
              </div>

              <div className="bg-green-50 rounded-xl p-6 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-900 mb-1">25m</div>
                <div className="text-sm text-green-600">Time Spent</div>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-900 mb-1">100%</div>
                <div className="text-sm text-purple-600">Completed</div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-red-900 mb-2">Important Notice</h4>
              <p className="text-sm text-red-800">
                Once submitted, you cannot make changes to your responses. 
                Please review carefully before proceeding.
              </p>
            </div>

            <Button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Timer className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Exam
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamSubmission;