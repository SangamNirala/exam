import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Send,
  Download,
  Eye,
  RotateCw,
  Star,
  TrendingUp,
  Target,
  Award,
  Shield,
  Save,
  Lock,
  Calendar
} from 'lucide-react';

const ExamSubmission = ({ 
  examData, 
  answers, 
  monitoringData, 
  onSubmit, 
  onBackToReview 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState('review'); // review, confirm, processing, complete
  const [finalValidation, setFinalValidation] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    // Calculate time spent
    if (examData?.startTime) {
      const elapsed = Math.floor((Date.now() - examData.startTime) / 1000);
      setTimeSpent(elapsed);
    }

    // Perform final validation
    performFinalValidation();
  }, []);

  const performFinalValidation = () => {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = examData?.questions?.length || 0;
    const completionRate = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    
    const validation = {
      answeredQuestions: answeredCount,
      totalQuestions: totalQuestions,
      completionRate: Math.round(completionRate),
      unansweredQuestions: totalQuestions - answeredCount,
      flaggedQuestions: examData?.flaggedQuestions?.length || 0,
      monitoringViolations: monitoringData?.violations?.length || 0,
      behaviorScore: monitoringData?.behaviorScore?.overall || 100,
      technicalIssues: monitoringData?.technicalIssues?.length || 0,
      canSubmit: completionRate >= 50 && (monitoringData?.behaviorScore?.overall || 100) >= 30
    };

    setFinalValidation(validation);
  };

  const handleSubmissionConfirm = async () => {
    setIsSubmitting(true);
    setSubmissionStep('processing');

    try {
      // Simulate submission process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const submissionData = {
        examId: examData.id,
        studentId: examData.studentId,
        answers: answers,
        timeSpent: timeSpent,
        submissionTime: new Date().toISOString(),
        monitoringData: monitoringData,
        finalValidation: finalValidation,
        submissionId: `EXAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      setSubmissionId(submissionData.submissionId);
      setSubmissionStep('complete');
      
      // Call parent callback
      onSubmit(submissionData);

    } catch (error) {
      console.error('Submission failed:', error);
      alert('Submission failed. Please try again.');
      setSubmissionStep('review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getCompletionColor = (rate) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 70) return 'text-blue-600 bg-blue-100';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getBehaviorColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const generateSubmissionReceipt = () => {
    const receipt = {
      submissionId: submissionId || 'TEMP_RECEIPT',
      examTitle: examData?.title,
      studentName: examData?.studentName,
      submissionTime: new Date().toISOString(),
      answeredQuestions: finalValidation?.answeredQuestions,
      totalQuestions: finalValidation?.totalQuestions,
      timeSpent: formatTime(timeSpent),
      behaviorScore: finalValidation?.behaviorScore
    };

    const receiptText = `
EXAM SUBMISSION RECEIPT

Submission ID: ${receipt.submissionId}
Exam: ${receipt.examTitle}
Student: ${receipt.studentName}
Submission Time: ${new Date(receipt.submissionTime).toLocaleString()}

COMPLETION SUMMARY:
- Questions Answered: ${receipt.answeredQuestions}/${receipt.totalQuestions}
- Time Spent: ${receipt.timeSpent}
- Behavior Score: ${receipt.behaviorScore}%

This receipt confirms successful submission of your exam.
Keep this for your records.
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-receipt-${receipt.submissionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (submissionStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="border-0 shadow-2xl max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="p-6 bg-blue-100 rounded-full inline-block">
                <Send className="w-12 h-12 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Submitting Your Exam</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <RotateCw className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-slate-600">Processing your answers...</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4" />
                  </div>
                  <p className="text-sm text-slate-500">
                    Please do not close this window or navigate away.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submissionStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="p-6 bg-green-100 rounded-full inline-block mb-8">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Exam Submitted Successfully!</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Your exam has been securely submitted and recorded. You should receive confirmation 
              and results according to your instructor's timeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Submission Confirmation */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Lock className="w-6 h-6 text-green-600" />
                  <span>Submission Confirmed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Submission Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Submission ID:</span>
                      <code className="text-green-800 font-mono">{submissionId}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Time:</span>
                      <span className="text-green-800">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Securely Recorded</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Questions Completed</span>
                    <Badge className={getCompletionColor(finalValidation?.completionRate)}>
                      {finalValidation?.answeredQuestions}/{finalValidation?.totalQuestions}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Time Spent</span>
                    <span className="font-medium text-slate-900">{formatTime(timeSpent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Integrity Score</span>
                    <Badge className={getBehaviorColor(finalValidation?.behaviorScore)}>
                      {finalValidation?.behaviorScore}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span>What Happens Next</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Automatic Processing</h4>
                      <p className="text-sm text-slate-600">Your responses are being processed and scored automatically.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Instructor Review</h4>
                      <p className="text-sm text-slate-600">Your instructor will review any flagged items or open-ended responses.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Results Available</h4>
                      <p className="text-sm text-slate-600">Results will be available in your course portal within 24-48 hours.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button 
                    onClick={generateSubmissionReceipt}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Message */}
          <Card className="border-0 shadow-lg mt-12 bg-slate-50">
            <CardContent className="p-8 text-center">
              <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Congratulations!</h3>
              <p className="text-lg text-slate-600 mb-6">
                You have successfully completed your exam. Thank you for maintaining academic 
                integrity throughout the assessment process.
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Submit Your Exam</h1>
              <p className="text-slate-600">{examData?.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeSpent)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Warning for low completion */}
        {finalValidation && finalValidation.completionRate < 75 && (
          <Card className="border-0 shadow-lg bg-yellow-50 border-yellow-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-yellow-800 text-lg mb-2">Incomplete Exam Notice</h3>
                  <p className="text-yellow-700 mb-4">
                    You have only answered {finalValidation.answeredQuestions} out of {finalValidation.totalQuestions} questions 
                    ({finalValidation.completionRate}% complete). You may want to review and answer the remaining questions 
                    before submitting.
                  </p>
                  <Button 
                    onClick={onBackToReview}
                    variant="outline"
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review Unanswered Questions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Submission Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span>Exam Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">
                      {finalValidation?.answeredQuestions || 0}
                    </div>
                    <div className="text-sm text-blue-700">Questions Answered</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {finalValidation?.completionRate || 0}%
                    </div>
                    <div className="text-sm text-green-700">Completion Rate</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Questions</span>
                    <span className="font-semibold text-slate-900">
                      {finalValidation?.totalQuestions || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Time Spent</span>
                    <span className="font-semibold text-slate-900">{formatTime(timeSpent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Flagged for Review</span>
                    <span className="font-semibold text-slate-900">
                      {finalValidation?.flaggedQuestions || 0}
                    </span>
                  </div>
                  {finalValidation?.unansweredQuestions > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Unanswered</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {finalValidation.unansweredQuestions}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <span>Integrity Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {finalValidation?.behaviorScore || 100}%
                  </div>
                  <div className="text-sm text-green-700">Integrity Score</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Monitoring Violations</span>
                    <Badge className={
                      (finalValidation?.monitoringViolations || 0) === 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }>
                      {finalValidation?.monitoringViolations || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Technical Issues</span>
                    <Badge className={
                      (finalValidation?.technicalIssues || 0) === 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }>
                      {finalValidation?.technicalIssues || 0}
                    </Badge>
                  </div>
                </div>

                {(finalValidation?.behaviorScore || 100) >= 90 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Excellent Conduct</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      You maintained exemplary behavior throughout the exam.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submission Actions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Send className="w-6 h-6 text-purple-600" />
                  <span>Final Submission</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Before You Submit</h4>
                  <div className="space-y-2 text-sm text-purple-700">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Review your answers one final time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ensure all required questions are answered</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Check flagged questions for review</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Once submitted, you cannot make changes</span>
                    </div>
                  </div>
                </div>

                {finalValidation?.canSubmit ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Ready to Submit</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        All requirements met. You can safely submit your exam.
                      </p>
                    </div>

                    <Button 
                      onClick={() => setSubmissionStep('confirm')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold rounded-xl"
                    >
                      <Send className="w-5 h-5 mr-3" />
                      Submit Exam
                    </Button>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Cannot Submit</span>
                    </div>
                    <div className="text-sm text-red-700 space-y-1">
                      {finalValidation?.completionRate < 50 && (
                        <p>• Complete at least 50% of questions</p>
                      )}
                      {(finalValidation?.behaviorScore || 100) < 30 && (
                        <p>• Resolve integrity score issues</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <Button 
                    onClick={onBackToReview}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review Answers Again
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    className="w-full text-slate-600"
                    onClick={() => {/* Save progress */}}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Progress & Continue Later
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Final Confirmation Dialog */}
            {submissionStep === 'confirm' && (
              <Card className="border-2 border-red-300 shadow-2xl bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Final Confirmation Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-red-800 mb-2">Are you absolutely sure?</p>
                    <p className="text-sm text-red-700">
                      This action cannot be undone. Once you submit, you will not be able to 
                      change any answers or continue the exam.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => setSubmissionStep('review')}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmissionConfirm}
                      disabled={isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Yes, Submit Final Answers
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSubmission;