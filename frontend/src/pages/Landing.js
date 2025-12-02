import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, TrendingUp, Shield, Clock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Compare MFIs",
      description: "Find the best microfinance institution with competitive interest rates"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Quick Approval",
      description: "Get loan approvals in as fast as 5-7 days from top MFIs"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Process",
      description: "Your data is protected with bank-level security"
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: "Simple Application",
      description: "Easy step-by-step loan application process"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" data-testid="landing-page">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-green-800" style={{ fontFamily: 'Space Grotesk' }}>GrameenGo</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              data-testid="header-login-btn"
              className="text-green-700 hover:text-green-800 hover:bg-green-50"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/register')}
              data-testid="header-register-btn"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-900 mb-6" style={{ fontFamily: 'Space Grotesk' }}>
            Microfinance Made Simple
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with trusted microfinance institutions in Bangladesh. Compare rates, apply online, and grow your business with accessible loans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              data-testid="hero-get-started-btn"
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl"
            >
              Apply for a Loan
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/mfis')}
              data-testid="hero-explore-mfis-btn"
              className="border-2 border-green-600 text-green-700 hover:bg-green-50 text-lg px-8 py-6 rounded-full"
            >
              Explore MFIs
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-green-900 mb-12" style={{ fontFamily: 'Space Grotesk' }}>
          Why Choose GrameenGo?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-green-100">Partner MFIs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5-7</div>
              <div className="text-green-100">Days Approval</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">16.5%</div>
              <div className="text-green-100">From Interest Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1.5M</div>
              <div className="text-green-100">Max Loan Amount</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Ready to Grow Your Business?
            </h2>
            <p className="text-lg text-green-50 mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who have successfully obtained microfinance loans through GrameenGo
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              data-testid="cta-get-started-btn"
              className="bg-white text-green-700 hover:bg-green-50 text-lg px-8 py-6 rounded-full shadow-lg"
            >
              Start Your Application
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>GrameenGo</span>
          </div>
          <p className="text-gray-400">Empowering businesses through accessible microfinance</p>
          <p className="text-gray-500 text-sm mt-4">© 2025 GrameenGo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
