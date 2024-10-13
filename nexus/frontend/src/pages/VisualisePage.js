import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Loader2, Brain, Upload, FileText, AlertCircle } from 'lucide-react';
import { Toast } from '../components/ui/Toast';
import {
  Progress,
  Alert,
  AlertDescription,
  AlertTitle,
} from '../components/ui/alert';

const VisualisePage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [datasetUrl, setDatasetUrl] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    if (file.size > 50 * 1024 * 1024) {
      showToast('File size exceeds 50MB limit', 'error');
      return;
    }
  
    if (!file.name.endsWith('.csv')) {
      showToast('Please upload a CSV file', 'error');
      return;
    }
  
    setSelectedFile(file);
    setIsFileProcessing(true);
    setUploadProgress(0);
    setUploadStatus('uploading');
    setError(null);
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post('http://localhost:8000/upload_to_github', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(95, progress));
        },
      });
  
      setDatasetUrl(response.data.dataset_url);
      setUploadStatus('completed');
      setUploadProgress(100);
      showToast(`${file.name} uploaded successfully`, 'success');
  
      const aiMessage = {
        type: 'ai',
        content: `${file.name} uploaded successfully. You can now ask questions about it.`,
      };
      setMessages(prev => [...prev, aiMessage]);
  
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.error || 'An unknown error occurred while uploading the file.';
      setError(errorMessage);
      setUploadStatus('error');
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsFileProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isFileProcessing) return;
    if (!datasetUrl) {
      showToast('Please upload a CSV file first', 'warning');
      return;
    }

    const userMessage = { type: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/get_results', {
        prompt: inputValue,
        dataset_url: datasetUrl
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const aiMessage = {
        type: 'ai',
        content: response.data.answer,
      };

      const imageUrlMatch = aiMessage.content.match(/!\[.*?\]\((https:\/\/.*?\.png)\)/);
      if (imageUrlMatch) {
        aiMessage.imageUrl = imageUrlMatch[1];
      }
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error querying the model:', error);
      const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred while processing your request.';
      setError(errorMessage);
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isFileProcessing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const LoadingOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <FileText className="w-24 h-24 text-blue-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-blue-400 mb-4">
          {uploadStatus === 'uploading' ? 'Uploading File' : 'Processing File'}
        </h2>
        <div className="w-64 mx-auto mb-4">
          <Progress value={uploadProgress} max={100} />
          <p className="text-sm text-gray-300 mt-2">{uploadProgress}% Complete</p>
        </div>
        {uploadStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </motion.div>
  );

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
            <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            {message.imageUrl && (
              <div className="mt-4">
                <img src={message.imageUrl} alt="Generated visualization" className="max-w-full h-auto rounded-lg shadow-lg" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center text-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-blue-500/30">
        <AnimatePresence>
          {isFileProcessing && <LoadingOverlay />}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 pointer-events-none" />
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 border-b border-blue-500/30 flex justify-between items-center relative z-10"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 flex items-center">
            <Brain size={32} className="mr-2 text-blue-400" /> Visualise CSV
          </h1>
          <div className="flex space-x-3 items-center">
            {selectedFile && (
              <span className="text-sm text-cyan-300">
                {selectedFile.name}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center text-sm font-medium transition-colors ${isFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isFileProcessing && fileInputRef.current.click()}
              disabled={isFileProcessing}
            >
              {isFileProcessing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              Upload CSV
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
              disabled={isFileProcessing}
            />
          </div>
        </motion.div>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-transparent"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2 text-gray-400"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-blue-500/30 relative z-10">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your CSV..."
              className={`flex-1 bg-blue-900/20 text-white placeholder-gray-400 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500/30 ${isFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFileProcessing}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFileProcessing}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={hideToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VisualisePage;