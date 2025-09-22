import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Key,
  Copy,
  Download,
  Share,
  QrCode,
  Clock,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  MessageSquare,
  Eye,
  EyeOff
} from 'lucide-react';
import { useExamCreation } from '../../contexts/ExamCreationContext';

const TokenGenerator = () => {
  const { examData, updateTokenSettings, setGeneratedTokens, publishExam } = useExamCreation();
  const [tokens, setTokens] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenCount, setTokenCount] = useState(10);
  const [showTokens, setShowTokens] = useState(true);

  const expiryOptions = [
    { value: 1, label: '1 Hour', type: 'time' },
    { value: 6, label: '6 Hours', type: 'time' },
    { value: 12, label: '12 Hours', type: 'time' },
    { value: 24, label: '1 Day', type: 'time' },
    { value: 72, label: '3 Days', type: 'time' },
    { value: 168, label: '1 Week', type: 'time' },
    { value: 1, label: '1 Use Only', type: 'uses' },
    { value: 3, label: '3 Uses Max', type: 'uses' },
    { value: 0, label: 'Never Expires', type: 'never' }
  ];

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3) result += '-'; // Add dash in middle for readability
    }
    return result;
  };

  const generateTokens = async () => {
    setIsGenerating(true);
    
    try {
      // Get backend URL from environment
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      let examId = examData.id;
      
      // If exam doesn't have an ID, create it in the database first
      if (!examId) {
        console.log('Exam not yet saved. Creating exam in database...');
        
        // Prepare exam data for backend
        const examPayload = {
          title: examData.title || 'Untitled Assessment',
          description: examData.description || '',
          subject: examData.subject || '',
          duration: examData.duration || 60,
          instructions: examData.instructions || '',
          exam_type: examData.examType || 'mcq',
          difficulty: examData.difficulty || 'intermediate',
          content_source: examData.contentSource || 'manual'
        };
        
        // Create exam in database
        const createExamResponse = await fetch(`${backendUrl}/api/assessments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(examPayload),
        });
        
        if (!createExamResponse.ok) {
          throw new Error('Failed to create exam in database');
        }
        
        const createdExam = await createExamResponse.json();
        examId = createdExam.id;
        
        // Update examData with the new ID in the context
        dispatch({ type: 'UPDATE_EXAM_DATA', payload: { id: examId } });
        
        console.log(`Exam created successfully with ID: ${examId}`);
      }
      
      // Now generate tokens using the exam ID
      const newTokens = [];
      
      for (let i = 0; i < tokenCount; i++) {
        const response = await fetch(`${backendUrl}/api/admin/create-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exam_id: examId,
            student_name: null,
            max_usage: examData.tokenSettings.expiryType === 'uses' ? examData.tokenSettings.expiryValue : 1,
            expires_in_hours: examData.tokenSettings.expiryType === 'time' ? examData.tokenSettings.expiryValue : 24
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          newTokens.push({
            id: `token-${Date.now()}-${i}`,
            token: data.token,
            status: 'active',
            createdAt: new Date(),
            expiresAt: examData.tokenSettings.expiryType === 'time' 
              ? new Date(Date.now() + examData.tokenSettings.expiryValue * 60 * 60 * 1000)
              : null,
            maxUses: examData.tokenSettings.expiryType === 'uses' ? examData.tokenSettings.expiryValue : null,
            usedCount: 0,
            lastUsed: null,
            studentInfo: null,
            examInfo: data.exam_info
          });
        } else {
          console.error('Failed to create token:', data.message);
          // Show error to user
          alert(`Failed to create token ${i + 1}: ${data.message}`);
        }
      }

      if (newTokens.length > 0) {
        setTokens(newTokens);
        setGeneratedTokens(newTokens);
        console.log(`Successfully generated ${newTokens.length} tokens for exam ${examId}`);
      } else {
        alert('Failed to generate any tokens. Please check your exam configuration.');
      }
      
    } catch (error) {
      console.error('Error generating tokens:', error);
      alert('Failed to generate tokens. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToken = async (token) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(token);
        console.log('Token copied to clipboard using Clipboard API');
        return;
      }
    } catch (err) {
      console.warn('Clipboard API failed, trying fallback:', err);
    }

    // Fallback method using document.execCommand
    try {
      const textArea = document.createElement('textarea');
      textArea.value = token;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('Token copied to clipboard using execCommand');
        return;
      }
    } catch (err) {
      console.warn('execCommand fallback failed:', err);
    }

    // Final fallback - select the token text for manual copying
    try {
      const tokenElement = document.querySelector(`[data-token="${token}"]`);
      if (tokenElement) {
        const range = document.createRange();
        range.selectNode(tokenElement);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        console.log('Token text selected for manual copying');
        alert('Token selected! Press Ctrl+C (or Cmd+C on Mac) to copy.');
      } else {
        // Ultimate fallback - show the token in an alert
        alert(`Token: ${token}\n\nPlease copy this token manually.`);
      }
    } catch (err) {
      console.error('All copy methods failed:', err);
      alert(`Token: ${token}\n\nPlease copy this token manually.`);
    }
  };

  const copyAllTokens = async () => {
    const tokenList = tokens.map(t => t.token).join('\n');
    
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(tokenList);
        console.log('All tokens copied to clipboard using Clipboard API');
        return;
      }
    } catch (err) {
      console.warn('Clipboard API failed for all tokens, trying fallback:', err);
    }

    // Fallback method using document.execCommand
    try {
      const textArea = document.createElement('textarea');
      textArea.value = tokenList;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('All tokens copied to clipboard using execCommand');
        return;
      }
    } catch (err) {
      console.warn('execCommand fallback failed for all tokens:', err);
    }

    // Final fallback - show all tokens in an alert
    alert(`All Tokens:\n\n${tokenList}\n\nPlease copy these tokens manually.`);
  };

  const exportTokens = () => {
    const csvContent = [
      'Token,Status,Created,Expires,Max Uses,Used Count',
      ...tokens.map(t => [
        t.token,
        t.status,
        t.createdAt.toISOString(),
        t.expiresAt?.toISOString() || 'Never',
        t.maxUses || 'Unlimited',
        t.usedCount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examData.title || 'exam'}-tokens.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'used': return 'blue';
      case 'expired': return 'red';
      default: return 'gray';
    }
  };

  const getExpiryText = (token) => {
    if (examData.tokenSettings.expiryType === 'never') return 'Never expires';
    if (examData.tokenSettings.expiryType === 'uses') {
      return `${token.usedCount}/${token.maxUses} uses`;
    }
    if (token.expiresAt) {
      const timeLeft = token.expiresAt - new Date();
      if (timeLeft <= 0) return 'Expired';
      
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days} days left`;
      if (hours > 0) return `${hours} hours left`;
      return `${Math.floor(timeLeft / (1000 * 60))} minutes left`;
    }
    return 'Active';
  };

  return (
    <div className="space-y-8">
      {/* Token Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <Settings className="w-6 h-6 mr-3 text-blue-600" />
            Token Configuration
          </CardTitle>
          <p className="text-slate-600">Set up access tokens for your assessment</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Tokens
              </label>
              <input
                type="number"
                value={tokenCount}
                onChange={(e) => setTokenCount(parseInt(e.target.value))}
                min="1"
                max="1000"
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Generate 1-1000 tokens at once</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Token Expiry
              </label>
              <select
                value={`${examData.tokenSettings.expiryValue}-${examData.tokenSettings.expiryType}`}
                onChange={(e) => {
                  const [value, type] = e.target.value.split('-');
                  updateTokenSettings({
                    expiryValue: parseInt(value),
                    expiryType: type
                  });
                }}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {expiryOptions.map((option) => (
                  <option key={`${option.value}-${option.type}`} value={`${option.value}-${option.type}`}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Access Control
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="accessControl"
                    value="open"
                    checked={examData.tokenSettings.accessControl === 'open'}
                    onChange={(e) => updateTokenSettings({ accessControl: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-slate-900">Open Access</span>
                    <p className="text-sm text-slate-600">Anyone with a token can take the exam</p>
                  </div>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="accessControl"
                    value="restricted"
                    checked={examData.tokenSettings.accessControl === 'restricted'}
                    onChange={(e) => updateTokenSettings({ accessControl: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-slate-900">Restricted Access</span>
                    <p className="text-sm text-slate-600">Only specific users can access (email verification required)</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">Token Security Features</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• 8-character alphanumeric tokens with dash separator</li>
              <li>• Automatic expiry based on time or usage limits</li>
              <li>• Usage tracking and analytics for each token</li>
              <li>• Secure token validation with anti-sharing measures</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Generate Tokens */}
      {tokens.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
              <Key className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Generate Tokens</h3>
            <p className="text-slate-600 mb-6">
              Create secure access tokens for students to take your assessment
            </p>
            
            <Button
              onClick={generateTokens}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                  Generating {tokenCount} Tokens...
                </>
              ) : (
                <>
                  <Key className="w-5 h-5 mr-3" />
                  Generate {tokenCount} Tokens
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Tokens */}
      {tokens.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-slate-900">
                  <Key className="w-6 h-6 mr-3 text-green-600" />
                  Generated Tokens ({tokens.length})
                </CardTitle>
                <p className="text-slate-600">Share these tokens with your students</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTokens(!showTokens)}
                  className="rounded-xl"
                >
                  {showTokens ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showTokens ? 'Hide' : 'Show'} Tokens
                </Button>
                <Button
                  variant="outline"
                  onClick={copyAllTokens}
                  className="rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
                <Button
                  variant="outline"
                  onClick={exportTokens}
                  className="rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Token Summary */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">Active Tokens</p>
                    <p className="text-2xl font-bold text-green-900">
                      {tokens.filter(t => t.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Used Tokens</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {tokens.filter(t => t.usedCount > 0).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">Expiry Time</p>
                    <p className="text-lg font-bold text-purple-900">
                      {examData.tokenSettings.expiryType === 'never' ? 'Never' :
                       examData.tokenSettings.expiryType === 'uses' ? `${examData.tokenSettings.expiryValue} uses` :
                       `${examData.tokenSettings.expiryValue}h`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <QrCode className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600">QR Codes</p>
                    <p className="text-lg font-bold text-orange-900">Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Token List */}
            <div className="space-y-3">
              {tokens.map((token, index) => (
                <div key={token.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3">
                        <code 
                          className="text-lg font-mono font-bold text-slate-900 select-all"
                          data-token={token.token}
                        >
                          {showTokens ? token.token : '****-****'}
                        </code>
                        <Badge 
                          variant="outline" 
                          className={`bg-${getStatusColor(token.status)}-100 text-${getStatusColor(token.status)}-700 border-${getStatusColor(token.status)}-200`}
                        >
                          {token.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                        <span>Created: {token.createdAt.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{getExpiryText(token)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToken(token.token)}
                      className="rounded-lg"
                      title="Copy token"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      title="Generate QR code"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      title="Share via email"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Regenerate Tokens */}
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={generateTokens}
                disabled={isGenerating}
                className="rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate More Tokens
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sharing Options */}
      {tokens.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900">
              <Share className="w-6 h-6 mr-3 text-purple-600" />
              Share With Students
            </CardTitle>
            <p className="text-slate-600">Multiple ways to distribute tokens to your students</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">Email Distribution</h4>
                <p className="text-sm text-slate-600 mb-4">Send tokens directly to student email addresses</p>
                <Button variant="outline" className="rounded-xl">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Emails
                </Button>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <QrCode className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">QR Code Generation</h4>
                <p className="text-sm text-slate-600 mb-4">Generate QR codes for easy mobile access</p>
                <Button variant="outline" className="rounded-xl">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR
                </Button>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">Bulk Sharing</h4>
                <p className="text-sm text-slate-600 mb-4">Share all tokens via messaging platforms</p>
                <Button variant="outline" className="rounded-xl">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Share Bulk
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publish Assessment */}
      {tokens.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm inline-block mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Ready to Launch!</h3>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Your assessment is configured with {tokens.length} access tokens. 
              Click below to make it live for students.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Assessment</h4>
                <p className="text-slate-600">{examData.title}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Questions</h4>
                <p className="text-slate-600">{examData.questions.length} questions</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Duration</h4>
                <p className="text-slate-600">{examData.duration} minutes</p>
              </div>
            </div>
            
            <Button
              onClick={publishExam}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl text-lg font-semibold"
            >
              <CheckCircle className="w-6 h-6 mr-3" />
              Publish Assessment
            </Button>
            
            <p className="text-sm text-slate-500 mt-4">
              Once published, students can immediately access the assessment using their tokens
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TokenGenerator;