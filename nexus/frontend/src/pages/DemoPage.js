import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Loader2, Brain, Sparkles, Atom } from 'lucide-react';

const NexusAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { type: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:5000/query', { query: inputValue });
      const aiMessage = {
        type: 'ai',
        content: response.data.answer,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error querying the model:', error);
      const errorMessage = {
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your request.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
      e.target.blur(); // Remove focus from input to trigger a re-render
      setTimeout(() => e.target.focus(), 0); // Re-focus on the input after a brief delay
    }
  };

  const MessageBubble = ({ message }) => {
    const isAI = message.type === 'ai';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`flex ${isAI ? 'flex-row' : 'flex-row-reverse'} items-start max-w-[80%] group`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isAI ? 'bg-blue-600' : 'bg-purple-600'
          } shadow-lg ${isAI ? 'mr-3' : 'ml-3'}`}>
            {isAI ? <Brain size={24} className="text-white" /> : <User size={24} className="text-white" />}
          </div>
          <div className={`p-4 ${
            isAI ? 'bg-blue-900/50' : 'bg-purple-900/50'
          } rounded-2xl shadow-lg backdrop-blur-sm border border-opacity-30 ${
            isAI ? 'border-blue-400' : 'border-purple-400'
          }`}>
            <p className="text-gray-100 text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-blue-500/30">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 pointer-events-none" />
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 border-b border-blue-500/30 flex justify-between items-center relative z-10"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 flex items-center">
            <Brain size={32} className="mr-2 text-blue-400" /> Nexus
          </h1>
          <div className="flex space-x-3">
            <Sparkles size={24} className="text-yellow-400" />
            <Atom size={24} className="text-blue-400" />
          </div>
        </motion.div>
        
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent relative z-10">
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-2 text-cyan-300"
              >
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-semibold">Nexus is thinking...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 border-t border-blue-500/30 relative z-10"
        >
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Nexus anything..."
              className="w-full px-6 py-4 bg-blue-900/30 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-blue-300 text-sm backdrop-blur-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300"
            >
              <Send size={20} className="text-white" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NexusAIChat;