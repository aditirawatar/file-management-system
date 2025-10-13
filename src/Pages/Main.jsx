import React, { useEffect, useState } from "react";
import "../animations.css";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ArrowRight, Shield, Zap, Users, Cloud, Lock, CheckCircle } from "lucide-react";

function Main() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-gray-900 overflow-hidden">
      <section className="relative container mx-auto px-4 pt-20 pb-32 text-center">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8 animate-fadeInUp">
            <Zap className="w-4 h-4" />
            Smart and Secure File Management
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fadeInUp stagger-1">
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
              Organize Files
            </span>
            <br />
            <span className="text-gray-800">Effortlessly</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fadeInUp stagger-2">
            The modern file management solution for teams and individuals.
            Upload, organize, and collaborate with enterprise-grade security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp stagger-3">
            <Link to={user ? "/dashboardpage" : "/login"}>
              <button className="group btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl flex items-center gap-2 transition-all duration-300">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="#features">
              <button className="px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 transition-all duration-300 hover-lift">
                Learn More
              </button>
            </a>
          </div>

          <div className="mt-16 flex justify-center items-center gap-8 text-sm text-gray-600 animate-fadeInUp stagger-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Free forever plan
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Everything you need to manage files
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover-lift card-hover animate-fadeInUp stagger-1">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload and access your files instantly with our optimized cloud infrastructure. Experience seamless performance.
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 hover-lift card-hover animate-fadeInUp stagger-2">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Enterprise Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level encryption and advanced access controls keep your files safe and compliant with industry standards.
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 hover-lift card-hover animate-fadeInUp stagger-3">
              <div className="w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Share files securely with your team. Real-time collaboration with granular permission controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-fadeInUp">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to transform your file management?
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Join thousands of teams who trust FileFlow for their file management needs.
                </p>
                <Link to={user ? "/dashboardpage" : "/signup"}>
                  <button className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 hover-lift flex items-center gap-2">
                    Start For Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
              <div className="animate-fadeInUp stagger-2">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Cloud className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Cloud Storage</h4>
                        <p className="text-blue-100">Secure cloud storage with automatic backups</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Lock className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Advanced Security</h4>
                        <p className="text-blue-100">End-to-end encryption for all your files</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Users className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Team Management</h4>
                        <p className="text-blue-100">Collaborate seamlessly with your team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 FileFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Main;
