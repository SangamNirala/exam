import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Type,
  Eye,
  EyeOff,
  Keyboard,
  Palette,
  Languages,
  Clock,
  Zap,
  Settings,
  Save,
  RotateCw,
  Play,
  Pause,
  SkipForward,
  Rewind,
  CheckCircle,
  AlertCircle,
  Info,
  User,
  Headphones,
  Sun,
  Moon,
  Contrast,
  MousePointer
} from 'lucide-react';

const AccessibilityControlCenter = ({ onClose, onSave, initialSettings = {} }) => {
  const [settings, setSettings] = useState({
    textToSpeech: {
      enabled: false,
      voice: 'default',
      speed: 1.0,
      pitch: 1.0,
      volume: 0.8,
      autoRead: true,
      highlightText: true
    },
    speechToText: {
      enabled: false,
      language: 'en-US',
      continuous: true,
      confidence: 0.7,
      punctuation: true
    },
    visualAdjustments: {
      fontSize: 100,
      lineHeight: 1.5,
      letterSpacing: 0,
      wordSpacing: 0,
      fontFamily: 'default'
    },
    colorContrast: {
      theme: 'default', // default, high-contrast, dark, custom
      brightness: 100,
      contrast: 100,
      saturation: 100,
      customColors: {
        background: '#ffffff',
        text: '#000000',
        accent: '#0066cc'
      }
    },
    keyboardNavigation: {
      enabled: false,
      showFocusIndicator: true,
      skipToContent: true,
      tabOrder: 'natural',
      shortcuts: true
    },
    cognitiveSupport: {
      readingGuide: false,
      focusMode: false,
      simplifyInterface: false,
      reducedMotion: false,
      extraTime: 0 // percentage
    },
    languageSupport: {
      language: 'en',
      direction: 'ltr',
      signLanguage: false,
      translation: false
    },
    ...initialSettings
  });

  const [activeTab, setActiveTab] = useState('speech');
  const [isTestingTTS, setIsTestingTTS] = useState(false);
  const [isTestingSTT, setIsTestingSTT] = useState(false);
  const [sttResult, setSttResult] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [previewText] = useState('This is a sample text to test the text-to-speech functionality with your current settings.');

  useEffect(() => {
    // Load available voices for TTS
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      
      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const testTextToSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser');
      return;
    }

    setIsTestingTTS(true);
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(previewText);
    
    // Apply settings
    if (settings.textToSpeech.voice !== 'default') {
      const selectedVoice = availableVoices.find(voice => voice.name === settings.textToSpeech.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.rate = settings.textToSpeech.speed;
    utterance.pitch = settings.textToSpeech.pitch;
    utterance.volume = settings.textToSpeech.volume;
    
    utterance.onend = () => {
      setIsTestingTTS(false);
    };
    
    utterance.onerror = () => {
      setIsTestingTTS(false);
      alert('Error occurred during text-to-speech test');
    };
    
    speechSynthesis.speak(utterance);
  };

  const stopTextToSpeech = () => {
    speechSynthesis.cancel();
    setIsTestingTTS(false);
  };

  const testSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    setIsTestingSTT(true);
    setSttResult('');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = settings.speechToText.language;
    recognition.continuous = settings.speechToText.continuous;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let result = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        result += event.results[i][0].transcript;
      }
      setSttResult(result);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsTestingSTT(false);
    };
    
    recognition.onend = () => {
      setIsTestingSTT(false);
    };
    
    recognition.start();
    
    // Auto-stop after 10 seconds
    setTimeout(() => {
      recognition.stop();
    }, 10000);
  };

  const applyColorTheme = (theme) => {
    const themes = {
      'high-contrast': {
        background: '#000000',
        text: '#ffffff',
        accent: '#ffff00'
      },
      'dark': {
        background: '#1a1a1a',
        text: '#e0e0e0',
        accent: '#4a9eff'
      },
      'blue-yellow': {
        background: '#000080',
        text: '#ffff00',
        accent: '#ffffff'
      },
      'green-black': {
        background: '#000000',
        text: '#00ff00',
        accent: '#ffffff'
      }
    };

    if (themes[theme]) {
      updateSetting('colorContrast', 'customColors', themes[theme]);
    }
    updateSetting('colorContrast', 'theme', theme);
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      textToSpeech: {
        enabled: false,
        voice: 'default',
        speed: 1.0,
        pitch: 1.0,
        volume: 0.8,
        autoRead: true,
        highlightText: true
      },
      speechToText: {
        enabled: false,
        language: 'en-US',
        continuous: true,
        confidence: 0.7,
        punctuation: true
      },
      visualAdjustments: {
        fontSize: 100,
        lineHeight: 1.5,
        letterSpacing: 0,
        wordSpacing: 0,
        fontFamily: 'default'
      },
      colorContrast: {
        theme: 'default',
        brightness: 100,
        contrast: 100,
        saturation: 100,
        customColors: {
          background: '#ffffff',
          text: '#000000',
          accent: '#0066cc'
        }
      },
      keyboardNavigation: {
        enabled: false,
        showFocusIndicator: true,
        skipToContent: true,
        tabOrder: 'natural',
        shortcuts: true
      },
      cognitiveSupport: {
        readingGuide: false,
        focusMode: false,
        simplifyInterface: false,
        reducedMotion: false,
        extraTime: 0
      },
      languageSupport: {
        language: 'en',
        direction: 'ltr',
        signLanguage: false,
        translation: false
      }
    };
    
    setSettings(defaultSettings);
  };

  const tabs = [
    { id: 'speech', label: 'Speech & Audio', icon: Volume2 },
    { id: 'visual', label: 'Visual & Display', icon: Eye },
    { id: 'navigation', label: 'Navigation', icon: Keyboard },
    { id: 'cognitive', label: 'Cognitive Support', icon: User },
    { id: 'language', label: 'Language', icon: Languages }
  ];

  const renderSpeechTab = () => (
    <div className="space-y-6">
      {/* Text-to-Speech */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-6 h-6 text-blue-600" />
              <span>Text-to-Speech</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.textToSpeech.enabled}
                onChange={(e) => updateSetting('textToSpeech', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </CardTitle>
        </CardHeader>
        {settings.textToSpeech.enabled && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Voice</label>
                <select 
                  value={settings.textToSpeech.voice}
                  onChange={(e) => updateSetting('textToSpeech', 'voice', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="default">System Default</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Speed: {settings.textToSpeech.speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.textToSpeech.speed}
                  onChange={(e) => updateSetting('textToSpeech', 'speed', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pitch: {settings.textToSpeech.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.textToSpeech.pitch}
                  onChange={(e) => updateSetting('textToSpeech', 'pitch', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Volume: {Math.round(settings.textToSpeech.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.textToSpeech.volume}
                  onChange={(e) => updateSetting('textToSpeech', 'volume', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.textToSpeech.autoRead}
                  onChange={(e) => updateSetting('textToSpeech', 'autoRead', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Auto-read questions</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.textToSpeech.highlightText}
                  onChange={(e) => updateSetting('textToSpeech', 'highlightText', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Highlight spoken text</span>
              </label>
            </div>

            {/* Test TTS */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Test Text-to-Speech</h4>
              <p className="text-sm text-slate-600 mb-3">{previewText}</p>
              <div className="flex space-x-3">
                <Button 
                  onClick={testTextToSpeech}
                  disabled={isTestingTTS}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {isTestingTTS ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Speaking...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Test Speech
                    </>
                  )}
                </Button>
                {isTestingTTS && (
                  <Button 
                    onClick={stopTextToSpeech}
                    variant="outline"
                    className="rounded-lg"
                  >
                    Stop
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Speech-to-Text */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mic className="w-6 h-6 text-green-600" />
              <span>Speech-to-Text</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.speechToText.enabled}
                onChange={(e) => updateSetting('speechToText', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
            </label>
          </CardTitle>
        </CardHeader>
        {settings.speechToText.enabled && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <select 
                  value={settings.speechToText.language}
                  onChange={(e) => updateSetting('speechToText', 'language', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="it-IT">Italian</option>
                  <option value="pt-BR">Portuguese</option>
                  <option value="zh-CN">Chinese (Mandarin)</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="ko-KR">Korean</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confidence Threshold: {Math.round(settings.speechToText.confidence * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.speechToText.confidence}
                  onChange={(e) => updateSetting('speechToText', 'confidence', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.speechToText.continuous}
                  onChange={(e) => updateSetting('speechToText', 'continuous', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Continuous recognition</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.speechToText.punctuation}
                  onChange={(e) => updateSetting('speechToText', 'punctuation', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700">Auto-punctuation</span>
              </label>
            </div>

            {/* Test STT */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-2">Test Speech-to-Text</h4>
              <p className="text-sm text-slate-600 mb-3">Click the button and speak to test speech recognition</p>
              <div className="space-y-3">
                <Button 
                  onClick={testSpeechToText}
                  disabled={isTestingSTT}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  {isTestingSTT ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2 animate-pulse" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Test Speech Recognition
                    </>
                  )}
                </Button>
                {sttResult && (
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-600 mb-1">Recognized text:</p>
                    <p className="font-medium text-slate-900">{sttResult}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );

  const renderVisualTab = () => (
    <div className="space-y-6">
      {/* Font and Text Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Type className="w-6 h-6 text-purple-600" />
            <span>Font & Text Adjustments</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Font Size: {settings.visualAdjustments.fontSize}%
              </label>
              <input
                type="range"
                min="80"
                max="300"
                step="10"
                value={settings.visualAdjustments.fontSize}
                onChange={(e) => updateSetting('visualAdjustments', 'fontSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
              <select 
                value={settings.visualAdjustments.fontFamily}
                onChange={(e) => updateSetting('visualAdjustments', 'fontFamily', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="default">System Default</option>
                <option value="serif">Serif (Times New Roman)</option>
                <option value="sans-serif">Sans-serif (Arial)</option>
                <option value="monospace">Monospace (Courier)</option>
                <option value="dyslexic">OpenDyslexic</option>
                <option value="comic">Comic Sans MS</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Line Height: {settings.visualAdjustments.lineHeight}
              </label>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={settings.visualAdjustments.lineHeight}
                onChange={(e) => updateSetting('visualAdjustments', 'lineHeight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Letter Spacing: {settings.visualAdjustments.letterSpacing}px
              </label>
              <input
                type="range"
                min="-2"
                max="5"
                step="0.5"
                value={settings.visualAdjustments.letterSpacing}
                onChange={(e) => updateSetting('visualAdjustments', 'letterSpacing', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Preview Text */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Preview</h4>
            <div 
              className="bg-white border border-slate-200 rounded-lg p-4"
              style={{
                fontSize: `${settings.visualAdjustments.fontSize}%`,
                fontFamily: settings.visualAdjustments.fontFamily === 'default' ? 'inherit' : settings.visualAdjustments.fontFamily,
                lineHeight: settings.visualAdjustments.lineHeight,
                letterSpacing: `${settings.visualAdjustments.letterSpacing}px`,
                wordSpacing: `${settings.visualAdjustments.wordSpacing}px`
              }}
            >
              <p>This is a sample question text that demonstrates how your font and spacing settings will appear during the exam. The quick brown fox jumps over the lazy dog.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color and Contrast */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Palette className="w-6 h-6 text-blue-600" />
            <span>Color & Contrast</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Color Theme</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'default', name: 'Default', bg: '#ffffff', text: '#000000', accent: '#0066cc' },
                { id: 'high-contrast', name: 'High Contrast', bg: '#000000', text: '#ffffff', accent: '#ffff00' },
                { id: 'dark', name: 'Dark Mode', bg: '#1a1a1a', text: '#e0e0e0', accent: '#4a9eff' },
                { id: 'blue-yellow', name: 'Blue/Yellow', bg: '#000080', text: '#ffff00', accent: '#ffffff' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => applyColorTheme(theme.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    settings.colorContrast.theme === theme.id 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: theme.bg, color: theme.text }}
                >
                  <div className="text-center">
                    <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ backgroundColor: theme.accent }} />
                    <span className="text-xs font-medium">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Brightness: {settings.colorContrast.brightness}%
              </label>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={settings.colorContrast.brightness}
                onChange={(e) => updateSetting('colorContrast', 'brightness', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contrast: {settings.colorContrast.contrast}%
              </label>
              <input
                type="range"
                min="50"
                max="200"
                step="5"
                value={settings.colorContrast.contrast}
                onChange={(e) => updateSetting('colorContrast', 'contrast', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Saturation: {settings.colorContrast.saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={settings.colorContrast.saturation}
                onChange={(e) => updateSetting('colorContrast', 'saturation', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNavigationTab = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Keyboard className="w-6 h-6 text-green-600" />
              <span>Keyboard Navigation</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.keyboardNavigation.enabled}
                onChange={(e) => updateSetting('keyboardNavigation', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
            </label>
          </CardTitle>
        </CardHeader>
        {settings.keyboardNavigation.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.keyboardNavigation.showFocusIndicator}
                  onChange={(e) => updateSetting('keyboardNavigation', 'showFocusIndicator', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-slate-700">Enhanced focus indicators</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.keyboardNavigation.skipToContent}
                  onChange={(e) => updateSetting('keyboardNavigation', 'skipToContent', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-slate-700">Skip to content links</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.keyboardNavigation.shortcuts}
                  onChange={(e) => updateSetting('keyboardNavigation', 'shortcuts', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-slate-700">Enable keyboard shortcuts</span>
              </label>
            </div>

            {settings.keyboardNavigation.shortcuts && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Keyboard Shortcuts</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Next Question</span>
                    <kbd className="bg-slate-200 px-2 py-1 rounded">Ctrl + →</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Question</span>
                    <kbd className="bg-slate-200 px-2 py-1 rounded">Ctrl + ←</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Flag Question</span>
                    <kbd className="bg-slate-200 px-2 py-1 rounded">Ctrl + F</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Save Progress</span>
                    <kbd className="bg-slate-200 px-2 py-1 rounded">Ctrl + S</kbd>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );

  const renderCognitiveTab = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <User className="w-6 h-6 text-orange-600" />
            <span>Cognitive & Learning Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-medium text-slate-900">Reading Guide</span>
                  <p className="text-sm text-slate-600">Highlight current line being read</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.cognitiveSupport.readingGuide}
                onChange={(e) => updateSetting('cognitiveSupport', 'readingGuide', e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="font-medium text-slate-900">Focus Mode</span>
                  <p className="text-sm text-slate-600">Dim distracting elements</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.cognitiveSupport.focusMode}
                onChange={(e) => updateSetting('cognitiveSupport', 'focusMode', e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-medium text-slate-900">Simplified Interface</span>
                  <p className="text-sm text-slate-600">Hide non-essential UI elements</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.cognitiveSupport.simplifyInterface}
                onChange={(e) => updateSetting('cognitiveSupport', 'simplifyInterface', e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MousePointer className="w-5 h-5 text-red-600" />
                <div>
                  <span className="font-medium text-slate-900">Reduced Motion</span>
                  <p className="text-sm text-slate-600">Minimize animations and transitions</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.cognitiveSupport.reducedMotion}
                onChange={(e) => updateSetting('cognitiveSupport', 'reducedMotion', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Extra Time: {settings.cognitiveSupport.extraTime}% additional
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="25"
              value={settings.cognitiveSupport.extraTime}
              onChange={(e) => updateSetting('cognitiveSupport', 'extraTime', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Standard</span>
              <span>+25%</span>
              <span>+50%</span>
              <span>+75%</span>
              <span>+100%</span>
            </div>
            {settings.cognitiveSupport.extraTime > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                Note: Extra time must be pre-approved by your instructor
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLanguageTab = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Languages className="w-6 h-6 text-indigo-600" />
            <span>Language & Localization</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Interface Language</label>
              <select 
                value={settings.languageSupport.language}
                onChange={(e) => updateSetting('languageSupport', 'language', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="ar">العربية</option>
                <option value="he">עברית</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Text Direction</label>
              <select 
                value={settings.languageSupport.direction}
                onChange={(e) => updateSetting('languageSupport', 'direction', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="ltr">Left-to-Right</option>
                <option value="rtl">Right-to-Left</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-medium text-slate-900">Sign Language Support</span>
                  <p className="text-sm text-slate-600">Show sign language videos for instructions</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.languageSupport.signLanguage}
                onChange={(e) => updateSetting('languageSupport', 'signLanguage', e.target.checked)}
                className="w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-medium text-slate-900">Real-time Translation</span>
                  <p className="text-sm text-slate-600">Translate content to your preferred language</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.languageSupport.translation}
                onChange={(e) => updateSetting('languageSupport', 'translation', e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>

          {settings.languageSupport.signLanguage && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Sign Language Options</h4>
              <select className="w-full border border-blue-300 rounded-lg px-3 py-2">
                <option value="asl">American Sign Language (ASL)</option>
                <option value="bsl">British Sign Language (BSL)</option>
                <option value="auslan">Australian Sign Language (Auslan)</option>
                <option value="lsf">French Sign Language (LSF)</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Accessibility Control Center</CardTitle>
            <Badge className="bg-blue-100 text-blue-700">
              WCAG 2.1 AAA Compliant
            </Badge>
          </div>
        </CardHeader>
        
        <div className="flex h-[calc(90vh-120px)]">
          {/* Tabs Sidebar */}
          <div className="w-64 border-r bg-slate-50">
            <div className="p-4 space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'speech' && renderSpeechTab()}
              {activeTab === 'visual' && renderVisualTab()}
              {activeTab === 'navigation' && renderNavigationTab()}
              {activeTab === 'cognitive' && renderCognitiveTab()}
              {activeTab === 'language' && renderLanguageTab()}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Button 
                onClick={resetToDefaults}
                variant="outline"
                className="rounded-xl"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
            
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccessibilityControlCenter;