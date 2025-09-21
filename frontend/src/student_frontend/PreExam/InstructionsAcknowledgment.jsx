import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Eye,
  Clock,
  User,
  Pen,
  Download,
  ArrowRight,
  Lock,
  Info,
  HelpCircle,
  Scale
} from 'lucide-react';

const InstructionsAcknowledgment = ({ examDetails, onComplete, onBack }) => {
  const [acknowledgments, setAcknowledgments] = useState({
    academicIntegrity: false,
    technicalRequirements: false,
    behaviorExpectations: false,
    privacyConsent: false,
    monitoringConsent: false,
    finalConfirmation: false
  });
  
  const [digitalSignature, setDigitalSignature] = useState('');
  const [currentDateTime] = useState(new Date().toISOString());
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const termsRef = useRef(null);
  const signatureRef = useRef(null);

  const acknowledgmentSections = [
    {
      id: 'academicIntegrity',
      title: 'Academic Integrity Commitment',
      icon: Shield,
      description: 'I understand and agree to uphold academic integrity standards',
      content: [
        'I will not communicate with other individuals during the exam',
        'I will not access unauthorized materials or resources',
        'I will not share exam content before, during, or after the exam',
        'I understand that violations may result in disciplinary action',
        'I will report any technical issues or concerns immediately'
      ]
    },
    {
      id: 'technicalRequirements',
      title: 'Technical Environment Confirmation',
      icon: Eye,
      description: 'I confirm my technical setup meets exam requirements',
      content: [
        'My camera and microphone are functioning properly',
        'I have a stable internet connection',
        'My testing environment is quiet and private',
        'I have completed the system compatibility check',
        'I understand technical issues may affect my exam'
      ]
    },
    {
      id: 'behaviorExpectations',
      title: 'Behavioral Guidelines Agreement',
      icon: User,
      description: 'I agree to follow proper exam behavior protocols',
      content: [
        'I will remain seated and face the camera throughout the exam',
        'I will not leave the designated exam area without permission',
        'I will keep my hands visible and avoid suspicious movements',
        'I will not wear unauthorized items (hats, sunglasses, etc.)',
        'I will maintain appropriate behavior at all times'
      ]
    },
    {
      id: 'privacyConsent',
      title: 'Privacy and Data Usage Consent',
      icon: Lock,
      description: 'I consent to data collection and usage as described',
      content: [
        'I consent to video and audio recording during the exam',
        'I understand biometric data will be collected for identity verification',
        'I consent to behavioral analysis for integrity monitoring',
        'I understand data will be stored securely and used only for exam purposes',
        'I have read and accept the privacy policy'
      ]
    },
    {
      id: 'monitoringConsent',
      title: 'Proctoring and Monitoring Agreement',
      icon: Eye,
      description: 'I consent to continuous monitoring during the exam',
      content: [
        'I consent to real-time behavioral monitoring',
        'I understand AI systems will analyze my behavior',
        'I consent to screen sharing and activity monitoring',
        'I understand suspicious behavior will be flagged',
        'I accept that monitoring data may be reviewed by instructors'
      ]
    },
    {
      id: 'finalConfirmation',
      title: 'Final Confirmation and Responsibility',
      icon: Scale,
      description: 'I take full responsibility for my exam session',
      content: [
        'I confirm I am the enrolled student taking this exam',
        'I accept full responsibility for my exam performance',
        'I understand the consequences of policy violations',
        'I confirm all information provided is accurate',
        'I am ready to begin the proctored examination'
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (termsRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
        const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
        setScrollProgress(progress);
        
        if (progress >= 90) {
          setHasScrolledTerms(true);
        }
      }
    };

    const termsElement = termsRef.current;
    if (termsElement) {
      termsElement.addEventListener('scroll', handleScroll);
      return () => termsElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleAcknowledgmentChange = (sectionId, checked) => {
    setAcknowledgments(prev => ({
      ...prev,
      [sectionId]: checked
    }));
  };

  const allAcknowledged = Object.values(acknowledgments).every(Boolean);
  const hasValidSignature = digitalSignature.trim().length >= 2;
  const canProceed = allAcknowledged && hasValidSignature && hasScrolledTerms;

  const handleSubmit = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);

    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const acknowledgmentData = {
        acknowledgments,
        digitalSignature: digitalSignature.trim(),
        timestamp: currentDateTime,
        examId: examDetails?.id,
        studentId: examDetails?.studentId,
        ipAddress: 'Recorded for security',
        userAgent: navigator.userAgent,
        acknowledgedSections: acknowledgmentSections.length
      };

      onComplete(acknowledgmentData);
    } catch (error) {
      console.error('Acknowledgment submission error:', error);
      alert('Error submitting acknowledgment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAcknowledmentPDF = () => {
    // In a real implementation, this would generate a proper PDF
    const content = `
EXAM ACKNOWLEDGMENT RECEIPT

Student: ${digitalSignature}
Exam: ${examDetails?.title}
Date: ${new Date(currentDateTime).toLocaleString()}

ACKNOWLEDGED SECTIONS:
${acknowledgmentSections.map(section => 
  `✓ ${section.title}: ${section.description}`
).join('\n')}

Digital Signature: ${digitalSignature}
Timestamp: ${currentDateTime}

This acknowledgment confirms your agreement to all exam policies and procedures.
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-acknowledgment-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Exam Acknowledgment & Agreement</h1>
              <p className="text-slate-600">{examDetails?.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <Scale className="w-4 h-4 mr-1" />
                Legally Binding
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Final Step
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Important Notice */}
        <Card className="border-0 shadow-lg bg-amber-50 border-amber-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-800 text-lg mb-2">Important Legal Notice</h3>
                <p className="text-amber-700 leading-relaxed">
                  By proceeding with this acknowledgment, you are entering into a legally binding agreement. 
                  Please read all sections carefully. Your digital signature will be legally equivalent to 
                  a handwritten signature. Violations of this agreement may result in serious academic 
                  consequences including course failure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Terms and Conditions */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span>Acknowledgment Sections</span>
                  </div>
                  <Badge variant="outline">
                    {Object.values(acknowledgments).filter(Boolean).length} of {acknowledgmentSections.length} completed
                  </Badge>
                </CardTitle>
                <p className="text-slate-600">
                  Please read each section carefully and check the box to acknowledge your understanding and agreement.
                </p>
              </CardHeader>
              <CardContent>
                <div 
                  ref={termsRef}
                  className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl p-6 space-y-6"
                >
                  {acknowledgmentSections.map((section) => {
                    const IconComponent = section.icon;
                    const isAcknowledged = acknowledgments[section.id];
                    
                    return (
                      <div key={section.id} className={`p-4 rounded-xl border-2 transition-all ${
                        isAcknowledged ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'
                      }`}>
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            isAcknowledged ? 'bg-green-200' : 'bg-slate-100'
                          }`}>
                            {isAcknowledged ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <IconComponent className="w-6 h-6 text-slate-600" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 mb-2">{section.title}</h3>
                            <p className="text-slate-600 mb-3">{section.description}</p>
                            
                            <ul className="space-y-1 mb-4">
                              {section.content.map((item, index) => (
                                <li key={index} className="flex items-start space-x-2 text-sm">
                                  <span className="text-blue-600 mt-0.5">•</span>
                                  <span className="text-slate-700">{item}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isAcknowledged}
                                onChange={(e) => handleAcknowledgmentChange(section.id, e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded"
                              />
                              <span className={`font-medium ${
                                isAcknowledged ? 'text-green-800' : 'text-slate-900'
                              }`}>
                                I acknowledge and agree to the above terms
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Scroll Progress */}
                {!hasScrolledTerms && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span>Reading Progress</span>
                      <span>{Math.round(scrollProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scrollProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Please scroll through all sections to continue
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Signature and Summary */}
          <div className="space-y-6">
            {/* Digital Signature */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Pen className="w-6 h-6 text-purple-600" />
                  <span>Digital Signature</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type your full legal name *
                  </label>
                  <input
                    ref={signatureRef}
                    type="text"
                    placeholder="Enter your full legal name"
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This will serve as your legal digital signature
                  </p>
                </div>

                {hasValidSignature && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Signature Preview</span>
                    </div>
                    <div className="bg-white border-2 border-dashed border-purple-300 rounded p-3 text-center">
                      <div className="text-lg font-signature text-purple-800 mb-1">
                        {digitalSignature}
                      </div>
                      <div className="text-xs text-purple-600">
                        Signed on {new Date(currentDateTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Info className="w-6 h-6 text-blue-600" />
                  <span>Acknowledgment Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Exam</span>
                    <span className="text-sm font-medium text-slate-900">
                      {examDetails?.title || 'Assessment'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Date & Time</span>
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(currentDateTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Sections Acknowledged</span>
                    <span className="text-sm font-medium text-slate-900">
                      {Object.values(acknowledgments).filter(Boolean).length} / {acknowledgmentSections.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Digital Signature</span>
                    <span className="text-sm font-medium text-slate-900">
                      {hasValidSignature ? '✓ Provided' : '✗ Required'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    {canProceed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className={`font-semibold ${
                      canProceed ? 'text-green-800' : 'text-amber-800'
                    }`}>
                      {canProceed ? 'Ready to Proceed' : 'Requirements Incomplete'}
                    </span>
                  </div>

                  {!canProceed && (
                    <div className="text-sm text-slate-600 space-y-1">
                      {!allAcknowledged && <p>• Complete all acknowledgment sections</p>}
                      {!hasValidSignature && <p>• Provide digital signature</p>}
                      {!hasScrolledTerms && <p>• Read all terms completely</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <Button 
                onClick={generateAcknowledmentPDF}
                variant="outline"
                className="w-full rounded-xl"
                disabled={!canProceed}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Acknowledgment
              </Button>

              <div className="flex space-x-3">
                <Button 
                  onClick={onBack}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Begin Exam
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <Card className="border-0 shadow-lg mt-8 bg-slate-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Scale className="w-6 h-6 text-slate-600 flex-shrink-0 mt-1" />
              <div className="text-sm text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">Legal Disclaimer:</p>
                <p>
                  This digital acknowledgment constitutes a legally binding agreement between you and the 
                  educational institution. By providing your digital signature and proceeding, you confirm 
                  your identity and agree to be bound by all terms and conditions outlined above.
                </p>
                <p>
                  Your exam session will be recorded and monitored. All data collected will be used in 
                  accordance with applicable privacy laws and the institution's privacy policy.
                </p>
                <div className="flex items-center space-x-4 pt-2">
                  <Button variant="ghost" size="sm" className="text-blue-600 p-0">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Privacy Policy
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-600 p-0">
                    <FileText className="w-4 h-4 mr-1" />
                    Terms of Service
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructionsAcknowledgment;