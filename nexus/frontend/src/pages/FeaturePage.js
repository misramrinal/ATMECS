import React, { useState } from 'react';
import { motion} from 'framer-motion';
import { Brain, Zap, Shield, BarChart2, Globe, Code, Workflow, GitBranch } from 'lucide-react';
import  Card  from '../components/ui/card';

const FeaturePage = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      icon: Brain,
      title: 'Advanced RAG System',
      description: 'State-of-the-art retrieval augmented generation for precise and contextual insights',
      details: [
        'ColBERT embedding model for superior retrieval',
        'Hybrid search combining dense and sparse methods',
        'Cross-encoder re-ranking for optimal relevance'
      ],
      color: 'purple'
    },
    {
      icon: Zap,
      title: 'Few-shot learning',
      description: 'Few-shot learning enables rapid adaptation to diverse scenarios with minimal data.',
      details: [
        'Sub-second query processing',
        'Real-time data updates and indexing',
        'Parallel processing architecture'
      ],
      color: 'yellow'
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'GDPR compliant with end-to-end encryption and advanced access controls',
      details: [
        'Role-based access control (RBAC)',
        'Data encryption at rest and in transit',
        'Regular security audits and compliance checks'
      ],
      color: 'green'
    },
    {
      icon: BarChart2,
      title: 'Rich Analytics',
      description: 'Comprehensive dashboards and visualizations for deep business insights',
      details: [
        'Interactive data visualizations',
        'Customizable dashboards',
        'Export capabilities in multiple formats'
      ],
      color: 'blue'
    },
    {
      icon: Globe,
      title: 'Data Visualisation',
      description: 'Intelligent output differentiation between visual and textual insights optimizes user experience.',
      details: [
        'Multi-region deployment support',
        'Automatic load balancing',
        'Edge computing capabilities'
      ],
      color: 'cyan'
    },
    {
      icon: Code,
      title: 'Developer-Friendly',
      description: 'Easy integration with existing systems through comprehensive APIs',
      details: [
        'RESTful and GraphQL APIs',
        'WebSocket support for real-time updates',
        'Extensive SDK support for multiple languages'
      ],
      color: 'pink'
    },
    {
      icon: Workflow,
      title: 'Workflow Automation',
      description: 'Automate complex business processes with AI-powered workflows',
      details: [
        'Visual workflow builder',
        'Conditional branching and loops',
        'Integration with popular workflow engines'
      ],
      color: 'orange'
    },
    {
      icon: GitBranch,
      title: 'Open Source',
      description: 'Cost-effective and efficient RAG system that powers our application’s ability to provide relevant insights and answers from the uploaded data.',
      details: [
        'Git-like versioning for knowledge bases',
        'Rollback and restore capabilities',
        'Collaborative editing with conflict resolution'
      ],
      color: 'indigo'
    }
  ];

  const FeatureCard = ({ feature, index }) => {
    const Icon = feature.icon;
    const isActive = activeFeature === index;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.05, rotateY: 10 }}
        onClick={() => setActiveFeature(isActive ? null : index)}
        className={`cursor-pointer ${isActive ? 'col-span-2 row-span-2' : ''}`}
      >
        <Card className={`h-full bg-gradient-to-br from-${feature.color}-900/50 to-gray-900/50 backdrop-blur-md border border-${feature.color}-500/30 p-6 transition-all duration-300`}>
          <div className={`text-${feature.color}-400 mb-4`}>
            <Icon size={32} />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-white">{feature.title}</h3>
          <p className="text-gray-300 mb-4">{feature.description}</p>
          
          <motion.div
            initial={false}
            animate={{ height: isActive ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            {isActive && (
              <ul className="space-y-2 mt-4 border-t border-gray-700 pt-4">
                {feature.details.map((detail, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color}-400`} />
                    <span>{detail}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: Math.random()
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [null, Math.random(), 0]
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Cutting-Edge Features
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the advanced capabilities that make our RAG solution the future of enterprise decision-making
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-to-r from-purple-900 to-pink-900 p-8 backdrop-blur-md border-none">
              <h2 className="text-3xl font-bold mb-4">Ready to Experience These Features?</h2>
              <p className="text-xl text-gray-300 mb-6">
                Transform your business decisions with our enterprise RAG solution
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-purple-900 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Schedule a Demo
              </motion.button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePage;