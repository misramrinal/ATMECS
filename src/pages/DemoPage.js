import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Upload, FileText, Loader2, Terminal, AlertTriangle } from 'lucide-react';
import Card, {CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import Button from '../components/ui/Button';
import { processQuery, analyzeData, generateInsights, processDocument } from '../components/aiModels';

const MessageBubble = ({ message }) => {
  const isAI = message.type === 'ai';
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`p-3 rounded-lg ${
          isAI ? 'bg-purple-900/50 text-purple-100' :
          isUser ? 'bg-pink-900/50 text-pink-100' :
          'bg-gray-800/50 text-gray-100'
        }`}>
          {message.content}
          {message.insights && (
            <div className="mt-2 space-y-2">
              {message.insights.map((insight, index) => (
                <Alert key={index}>
                  <AlertDescription>{insight}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FileProcessingOverlay = ({ fileName, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-purple-900/70 border border-purple-500 rounded-lg p-8 max-w-md"
    >
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-purple-300 text-center mb-2">
        Processing {fileName}
      </h3>
      <p className="text-purple-200 text-center">
        Please wait while our AI analyzes your file...
      </p>
    </motion.div>
  </motion.div>
);

const DemoPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setIsProcessingFile(true);
    setCurrentFileName(file.name);
    setError(null);
  
    try {
      const fileContent = await readFileContent(file);
      
      // Log file information for debugging
      console.log('File type:', file.type);
      console.log('File content type:', typeof fileContent);
      
      const processed = await processDocument(fileContent);
      
      if (!processed || processed.length === 0) {
        throw new Error('No processable content found in the file');
      }
      
      const insights = await generateInsights(processed);
      
      const uploadMessage = {
        type: 'system',
        content: `File "${file.name}" processed successfully.`,
        insights: insights?.insights || []
      };
      
      setMessages(prev => [...prev, uploadMessage]);
    } catch (error) {
      console.error('File processing error:', error);
      setError(`Error processing file: ${error.message}`);
    } finally {
      setIsProcessingFile(false);
      setCurrentFileName('');
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      
      if (file.type === 'text/csv' || file.type.includes('text/plain')) {
        reader.readAsText(file);
      } else if (file.type === 'application/pdf' || file.type.includes('spreadsheet') || file.type.includes('excel')) {
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const aiResponse = await processQuery(inputValue);
      const analysis = await analyzeData(inputValue);
      
      const aiMessage = {
        type: 'ai',
        content: aiResponse,
        insights: analysis?.insights
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-900 via-purple-900 to-pink-900 flex flex-col">
      <Card className="flex-1 bg-gray-900/30 backdrop-blur-md border border-purple-500/50 m-4 flex flex-col relative">
        <CardContent className="flex-1 overflow-y-auto p-6 relative">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-purple-300"
            >
              <Loader2 className="animate-spin" />
              <span>AI is thinking...</span>
            </motion.div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="p-4 border-t border-purple-500/30">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about your data..."
              className="flex-1 p-3 rounded-lg bg-gray-800 border border-purple-500/50 focus:outline-none focus:border-pink-500 text-white"
              disabled={isProcessingFile}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isProcessingFile}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Send className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => fileInputRef.current.click()}
              disabled={isProcessingFile}
              variant="outline"
            >
              <Upload className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".csv,.pdf,.xlsx,.xls"
        />
      </Card>

      <AnimatePresence>
        {isProcessingFile && (
          <FileProcessingOverlay
            fileName={currentFileName}
            onClose={() => setIsProcessingFile(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoPage;