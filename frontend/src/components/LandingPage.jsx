import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Brain, 
  Accessibility, 
  MonitorSpeaker, 
  BarChart3, 
  FileText,
  Users,
  Award,
  Zap,
  ArrowRight,
  Play,
  CheckCircle,
  Building,
  TrendingUp
} from 'lucide-react';
import { mockStatistics, mockFeatures, mockTestimonials, mockDemoScenarios } from '../mock';

const TypewriterText = ({ texts, speed = 100 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (textIndex < texts.length) {
      const text = texts[textIndex];
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setCurrentText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentText('');
          setCurrentIndex(0);
          setTextIndex(prev => (prev + 1) % texts.length);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentIndex, textIndex, texts, speed]);

  return (
    <span className="text-blue-600 font-bold">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const StatCounter = ({ end, duration = 2000, label, icon: Icon }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 50);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <div className="text-center group hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-center mb-2">
        <Icon className="w-8 h-8 text-blue-600 mr-2" />
        <div className="text-3xl font-bold text-slate-900">
          {count.toLocaleString()}
          {end >= 1000 && '+'}
        </div>
      </div>
      <div className="text-slate-600 font-medium">{label}</div>
    </div>
  );
};

const FeatureCarousel = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % mockFeatures.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-50 to-white p-8 shadow-xl">
      <div className="flex transition-transform duration-700 ease-in-out"
           style={{ transform: `translateX(-${currentFeature * 100}%)` }}>
        {mockFeatures.map((feature, index) => {
          const IconComponent = {
            Brain,
            Accessibility,
            MonitorSpeaker,
            BarChart3,
            FileText
          }[feature.icon];
          
          return (
            <div key={feature.id} className="min-w-full flex items-center space-x-8">
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                <IconComponent className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-6 space-x-2">
        {mockFeatures.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFeature(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentFeature ? 'bg-blue-600 scale-125' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const LandingPage = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="relative bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AssessAI Pro</h1>
                <p className="text-sm text-slate-600">Inclusive Assessment Tools</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                WCAG 2.1 AAA Compliant
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              AI-Driven Inclusive
              <br />
              <TypewriterText 
                texts={['Assessment Tools', 'Skill Evaluation', 'Learning Analytics', 'Quality Assurance']}
                speed={80}
              />
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Revolutionize education with AI-powered assessments that adapt to every learner. 
              Supporting all exam types, accessibility needs, and learning environments across 
              the entire skill ecosystem.
            </p>
            
            {/* Role Selection */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Button 
                onClick={() => onRoleSelect('admin')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Users className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Admin Dashboard
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => onRoleSelect('student')}
                size="lg"
                variant="outline"
                className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-6 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300 group bg-white"
              >
                <Award className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Student Portal
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Live Statistics */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-20">
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">
              Transforming Education Across India
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCounter 
                end={mockStatistics.totalAssessments} 
                label="Assessments Conducted"
                icon={FileText}
              />
              <StatCounter 
                end={mockStatistics.studentsEvaluated} 
                label="Students Evaluated"
                icon={Users}
              />
              <StatCounter 
                end={mockStatistics.institutionsUsing} 
                label="Institutions Using"
                icon={Building}
              />
              <StatCounter 
                end={mockStatistics.accessibilityFeatures} 
                label="Accessibility Features"
                icon={Accessibility}
              />
            </div>
          </div>

          {/* Feature Carousel */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Powered by Advanced AI Technology
            </h3>
            <FeatureCarousel />
          </div>

          {/* Interactive Demo Buttons */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Experience the Future of Assessment
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {mockDemoScenarios.map((demo) => (
                <Card key={demo.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">{demo.title}</h4>
                    <p className="text-slate-600 mb-6 leading-relaxed">{demo.description}</p>
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold rounded-xl transition-all duration-300"
                    >
                      {demo.action}
                      <Zap className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-900 mb-12">
              Trusted by Educators Nationwide
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {mockTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div className="text-left">
                        <h5 className="font-bold text-slate-900">{testimonial.name}</h5>
                        <p className="text-sm text-slate-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 italic leading-relaxed">"{testimonial.message}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl mr-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">AssessAI Pro</span>
          </div>
          <p className="text-slate-400 mb-4">
            Empowering inclusive education through AI-driven assessment solutions
          </p>
          <div className="flex justify-center items-center space-x-4">
            <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
              <TrendingUp className="w-4 h-4 mr-1" />
              Industry Leading
            </Badge>
            <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
              <Accessibility className="w-4 h-4 mr-1" />
              Fully Accessible
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;