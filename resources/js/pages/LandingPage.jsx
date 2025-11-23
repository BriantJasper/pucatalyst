import { Link } from 'react-router-dom';
import { 
  Rocket, Target, Users, TrendingUp, Award, BookOpen, 
  Briefcase, Brain, ArrowRight, Sparkles 
} from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Rocket className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                PU Catalyst
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition">Features</a>
              <Link to="/login" className="text-gray-700 hover:text-primary-600 transition">Login</Link>
              <Link to="/register" className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered University Roadmap</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent">Career Journey</span> Starts Here
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Get AI-powered recommendations on organizations, certificates, skills, and projects based on successful alumni patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2 text-lg font-semibold shadow-lg">
                Start Your Roadmap
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="bg-white text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-50 transition border-2 border-gray-200 text-lg font-semibold">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Students Guided</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Alumni Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Career Paths</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">95%</div>
              <div className="text-gray-600 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">AI-powered tools and insights to guide your university journey</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-5 group-hover:bg-primary-600 group-hover:text-white transition">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized Roadmap</h3>
              <p className="text-gray-600 leading-relaxed">AI-generated career roadmap based on your goals and alumni success patterns</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-5 group-hover:bg-primary-600 group-hover:text-white transition">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Organization Match</h3>
              <p className="text-gray-600 leading-relaxed">Find the best university organizations based on your career aspirations</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-5 group-hover:bg-primary-600 group-hover:text-white transition">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certificate Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">Get curated certificate suggestions that matter for your target career</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-5 group-hover:bg-primary-600 group-hover:text-white transition">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Navigator</h3>
              <p className="text-gray-600 leading-relaxed">Discover which elective courses will boost your career prospects</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-5 group-hover:bg-primary-600 group-hover:text-white transition">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Skill Gap Analysis</h3>
              <p className="text-gray-600 leading-relaxed">Identify missing skills and get actionable steps to fill the gaps</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-xl transition group">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-5 group-hover:bg-primary-600 group-hover:text-white transition">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Alumni Insights</h3>
              <p className="text-gray-600 leading-relaxed">Learn from successful alumni who achieved your dream career</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Future?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of students who are already on their path to success</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition text-lg font-semibold shadow-lg">
              Create Your Roadmap Now
              <TrendingUp className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="w-8 h-8 text-primary-400" />
            <span className="text-2xl font-bold">PU Catalyst</span>
          </div>
          <p className="text-gray-400 mb-6">Empowering students with AI-driven career guidance</p>
          <p className="text-gray-500 text-sm">© 2025 PU Catalyst. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
