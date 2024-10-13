import React, { useState, useRef, useEffect } from 'react';
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

const NexusAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const progressCheckInterval = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (progressCheckInterval.current) {
        clearInterval(progressCheckInterval.current);
      }
    };
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hideToast = () => {
    setToast(null);
  };

  const checkUploadProgress = async (fileId) => {
    try {
      const response = await axios.get(`http://localhost:5000/upload_progress/${fileId}`);
      const { status, progress } = response.data;
      
      setUploadProgress(progress);
      setUploadStatus(status);
      
      if (status === 'completed' || status === 'error') {
        clearInterval(progressCheckInterval.current);
        if (status === 'completed') {
          showToast('File processed successfully', 'success');
        } else if (status === 'error') {
          showToast('Error processing file', 'error');
        }
      }
    } catch (error) {
      console.error('Error checking upload progress:', error);
      clearInterval(progressCheckInterval.current);
      setUploadStatus('error');
      showToast('Error checking upload progress', 'error');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    if (file.size > 50 * 1024 * 1024) {
      showToast('File size exceeds 50MB limit', 'error');
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
      const response = await axios.post('http://localhost:5000/process_file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(95, progress)); // Cap at 95% until server confirms completion
        },
      });
  
      if (response.data.file_id) {
        const fileId = response.data.file_id;
        progressCheckInterval.current = setInterval(() => checkUploadProgress(fileId), 1000);
        
        setFileType(response.data.file_type);
        const aiMessage = {
          type: 'ai',
          content: `${file.name} processed successfully. You can now ask questions about it.`,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('No file_id received from server');
        showToast('Error: Unable to track file processing', 'error');
      }
  
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error.response?.data?.error || 'An unknown error occurred while processing the file.';
      setError(errorMessage);
      setUploadStatus('error');
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsFileProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isFileProcessing) return;
    if (!fileType) {
      showToast('Please upload a file first', 'warning');
      return;
    }

    const userMessage = { type: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await axios.post('http://localhost:5000/query', {
        query: inputValue,
        file_type: fileType
      });

      const aiMessage = {
        type: 'ai',
        content: response.data.answer,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error querying the model:', error);
      setError('An error occurred while processing your request. Please try again.');
      showToast('Error processing request', 'error');
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
          <FileText className="w-32 h-32 text-blue-400" />
        </motion.div>
        <h2 className="text-4xl font-bold text-blue-400 mb-6">
          {uploadStatus === 'uploading' ? 'Uploading File' : 'Processing File'}
        </h2>
        <div className="w-80 mx-auto mb-6">
          <Progress value={uploadProgress} max={100} className="h-2" />
          <p className="text-lg text-gray-300 mt-3">{uploadProgress}% Complete</p>
        </div>
        {uploadStatus === 'error' && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">Error</AlertTitle>
            <AlertDescription className="text-base">{error}</AlertDescription>
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
            {isAI && imageUrl && (
              <div className="mt-4">
                <img src={imageUrl} alt="Response visualization" className="max-w-full rounded-lg shadow-md" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };


  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center text-white flex items-center justify-center p-8">
      <div className="w-full max-w-7xl h-[90vh] bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-blue-500/30">
        <AnimatePresence>
          {isFileProcessing && <LoadingOverlay />}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 pointer-events-none" />
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-6 border-b border-blue-500/30 flex justify-between items-center relative z-10"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 flex items-center">
            <Brain size={40} className="mr-3 text-blue-400" /> Nexus AI
          </h1>
          <div className="flex space-x-4 items-center">
            {selectedFile && (
              <span className="text-base text-cyan-300">
                {selectedFile.name}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center text-base font-medium transition-colors ${isFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isFileProcessing && fileInputRef.current.click()}
              disabled={isFileProcessing}
            >
              {isFileProcessing ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 mr-2" />
              )}
              Upload File
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.csv"
              className="hidden"
              disabled={isFileProcessing}
            />
          </div>
        </motion.div>

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-transparent"
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
                className="flex items-center space-x-3 text-gray-400"
              >
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg">Nexus is thinking...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-blue-500/30 relative z-10">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your document..."
              className={`flex-1 bg-blue-900/20 text-white placeholder-gray-400 rounded-full px-8 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500/30 ${isFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFileProcessing}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 rounded-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFileProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isFileProcessing}
            >
              <Send className="w-6 h-6" />
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

export default NexusAIChat;