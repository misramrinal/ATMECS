import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence  } from 'framer-motion';
import { ArrowRight, Zap, Shield, Brain, BarChart2, Globe, Activity } from 'lucide-react';
import Card from '../components/ui/card';
import ThreeDBackground from '../components/ThreeDBackground'; // 3D background for Hero section
import ParticleBackground from '../components/ParticleBackground'; // Particle background for the rest

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05, rotateY: 10 }}
    className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30"
  >
    <div className="text-cyan-400 mb-4">
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

// Testimonial data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CTO, TechCorp",
    content: "This RAG solution has revolutionized how we handle data. It's like having a team of data scientists at your fingertips.",
  },
  {
    name: "Michael Chen",
    role: "Data Scientist, AI Innovations",
    content: "The speed and accuracy of insights generated are unprecedented. This is truly the future of enterprise decision-making.",
  },
  {
    name: "Emma Rodriguez",
    role: "VP of Operations, Global Solutions",
    content: "Implementation was seamless, and the results were immediate. Our productivity has increased by 300%.",
  },
  {
    name: "Alex Thompson",
    role: "CEO, FutureTech",
    content: "The best decision our company has made is implementing this AI-powered solution.",
  },
  {
    name: "Sophia Lee",
    role: "Head of Analytics, DataXperts",
    content: "It has completely transformed how we interpret data, saving us countless hours of manual work.",
  }
];

const TestimonialCarousel = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="relative w-full max-w-4xl mx-auto overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-lg z-0"></div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <Card className="bg-black/50 p-6 border border-cyan-500/30 rounded-lg shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
              <div className="relative z-10">
                <blockquote className="text-lg text-cyan-100 mb-4 font-light">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold relative">
                    <div className="absolute inset-0 rounded-full blur-sm bg-cyan-400 animate-pulse"></div>
                    <span className="relative z-10">{testimonials[currentTestimonial].name[0]}</span>
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">{testimonials[currentTestimonial].name}</div>
                    <div className="text-cyan-300">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {testimonials.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentTestimonial ? 'bg-cyan-400' : 'bg-gray-600'
              }`}
              animate={{
                scale: index === currentTestimonial ? 1.5 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    );
  };

// Stats Component
const Stats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    <div>
      <h3 className="text-3xl font-bold text-cyan-400">100+</h3>
      <p className="text-gray-300">Global Clients</p>
    </div>
    <div>
      <h3 className="text-3xl font-bold text-cyan-400">300%</h3>
      <p className="text-gray-300">Productivity Boost</p>
    </div>
    <div>
      <h3 className="text-3xl font-bold text-cyan-400">24/7</h3>
      <p className="text-gray-300">Support Availability</p>
    </div>
    <div>
      <h3 className="text-3xl font-bold text-cyan-400">99.9%</h3>
      <p className="text-gray-300">System Uptime</p>
    </div>
  </div>
);

// Additional Component: Use Cases
const UseCases = () => (
    <section className="w-full py-16 bg-black">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
          Use Cases
        </h2>
        <p className="text-lg text-gray-300 mb-4">
          Our solution is applicable across various industries:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-2">Finance</h3>
            <p className="text-gray-300">
              Real-time fraud detection and analysis to protect assets and improve security.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-2">Healthcare</h3>
            <p className="text-gray-300">
              Patient data management and insights for better treatment outcomes.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-2">Retail</h3>
            <p className="text-gray-300">
              Enhanced customer experience through personalized recommendations and inventory management.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-2">Manufacturing</h3>
            <p className="text-gray-300">
              Predictive maintenance and efficiency improvements for smarter production processes.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-2">Logistics</h3>
            <p className="text-gray-300">
              Optimize routes and reduce costs with AI-driven logistics solutions.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-2">Education</h3>
            <p className="text-gray-300">
              Enhance learning experiences with personalized learning paths and insights.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

const HomePage = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <ThreeDBackground />
      <ParticleBackground />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <motion.div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600"
          >
            The Future of AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl text-gray-300 mb-8"
          >
            Enterprise-grade RAG solution powered by advanced AI
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold flex items-center space-x-2"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="w-full min-h-screen flex items-center justify-center px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Cutting-Edge Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={Brain} title="Advanced RAG" description="State-of-the-art retrieval for precise insights" />
            <FeatureCard icon={Zap} title="Lightning Fast" description="50% faster decision-making process" />
            <FeatureCard icon={Shield} title="Enterprise Security" description="GDPR compliant with end-to-end encryption" />
            <FeatureCard icon={BarChart2} title="Rich Analytics" description="Comprehensive dashboards and visualizations" />
            <FeatureCard icon={Globe} title="Global Scalability" description="Seamlessly scale across multiple regions" />
            <FeatureCard icon={Activity} title="AI-Driven Insights" description="Uncover hidden patterns in your data" />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="w-full py-16 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
            Our Achievements
          </h2>
          <Stats />
        </div>
      </section>

      {/* Use Cases Section */}
      <UseCases />

      {/* Testimonials Section */}
      <section className="w-full py-16 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
            What Our Clients Say
          </h2>
          <TestimonialCarousel />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
