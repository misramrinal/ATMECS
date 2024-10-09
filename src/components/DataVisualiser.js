import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Upload, FileText, Loader2, Terminal, Maximize2, X } from 'lucide-react';
import  Card, {CardHeader, CardContent, CardFooter } from './ui/card';
import Button from './ui/Button'; 
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { pdfjs } from 'react-pdf';
import { processQuery, analyzeData, generateInsights, processDocument } from './aiModels';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const CircuitBackground = () => (
  <div className="fixed inset-0 z-0 opacity-10">
    <div className="absolute inset-0" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334D399' fill-opacity='0.4'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2L74 40h-2zm4 0l4-4v2L78 40h-2zm4 0l0 0v2L80 40h-2zM2 2l2-2h2L2 4V2zm4 0l6-2h2L4 8V2zm4 0l10-2h2L8 12V2zm4 0l14-2h2L12 16V2zm4 0l18-2h2L16 20V2zm4 0l22-2h2L20 24V2zm4 0l26-2h2L24 28V2zm4 0l30-2h2L28 32V2zm4 0l34-2h2L32 36V2zm4 0l38-2h2L36 40V2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }} />
  </div>
);

const IntroAnimation = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="text-center p-8"
  >
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        duration: 0.8,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="w-32 h-32 mx-auto mb-6 relative"
    >
      <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl animate-pulse" />
      <div className="absolute inset-2 bg-emerald-500/40 rounded-xl animate-pulse delay-75" />
      <div className="absolute inset-4 bg-emerald-500/60 rounded-lg animate-pulse delay-150" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Terminal className="w-16 h-16 text-emerald-400" />
      </div>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-emerald-400 mb-3">AI Data Assistant</h1>
      <p className="text-emerald-300 text-lg">Upload any file type and get intelligent insights</p>
    </motion.div>
  </motion.div>
);

const FileProcessingOverlay = ({ fileName, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
  >
    <div className="bg-gray-800 border border-emerald-500 rounded-lg p-6 max-w-md text-center">
      <Loader2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin" />
      <h3 className="text-xl font-semibold text-emerald-400 mb-2">Processing {fileName}</h3>
      <p className="text-emerald-300 mb-4">Please wait while we analyze your file...</p>
      <Button variant="outline" onClick={onClose} className="mt-2">
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  </motion.div>
);

const MessageBubble = ({ message }) => {
  const isAI = message.type === 'ai';
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  const bubbleVariants = {
    hidden: {
      opacity: 0,
      x: isUser ? 50 : -50,
      y: 20
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1
      }
    },
    hover: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div
        className={`flex items-start space-x-3 max-w-3xl ${
          isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isAI ? 'bg-emerald-500' : isUser ? 'bg-emerald-600' : 'bg-emerald-700'
          }`}
        >
          {isAI ? (
            <Bot className="w-7 h-7 text-gray-900" />
          ) : isUser ? (
            <User className="w-7 h-7 text-gray-900" />
          ) : (
            <FileText className="w-7 h-7 text-gray-900" />
          )}
        </motion.div>
        <motion.div
          className={`p-5 rounded-2xl backdrop-blur-lg shadow-lg ${
            isAI
              ? 'bg-emerald-900/30 border-2 border-emerald-500/50 text-emerald-100'
              : isUser
              ? 'bg-emerald-800/30 border-2 border-emerald-600/50 text-emerald-100'
              : 'bg-gray-800/30 border-2 border-emerald-700/50 text-emerald-200'
          }`}
        >
          {message.content}
        </motion.div>
        {message.insights && (
          <div className="mt-4 space-y-4">
            {message.insights.map((insight, index) => (
              <Alert key={index} variant={insight.type === 'warning' ? 'warning' : 'success'}>
                <AlertTitle>{insight.title}</AlertTitle>
                <AlertDescription>{insight.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const DataVisualiser = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [processedDocument, setProcessedDocument] = useState(null);


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
      // Read the file content
      const fileContent = await readFileContent(file);
      
      // Process the document using the existing processDocument function
      const processed = await processDocument(fileContent);
      setProcessedDocument(processed);
      
      // Generate insights from the processed document
      const insights = await generateInsights(processed);
      
      const uploadMessage = {
        type: 'system',
        content: `File "${file.name}" processed successfully.`,
        insights
      };
      setMessages(prev => [...prev, uploadMessage]);
    } catch (error) {
      setError(`Error processing file: ${error.message}`);
    } finally {
      setIsProcessingFile(false);
      setCurrentFileName('');
    }
  };
  
  // Helper function to read file content
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

  const processCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
        header: true
      });
    });
  };

  const processPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const textContent = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent.push(...text.items.map(item => item.str));
    }
    
    return textContent;
  };

  const processExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
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
    setShowIntro(false);
    setError(null);

    try {
      const response = await processQuery(inputValue, JSON.stringify(messages));
      const analysis = await analyzeData(messages, inputValue);

      const aiMessage = {
        type: 'ai',
        content: response,
        insights: analysis.insights
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-900 via-emerald-950 to-gray-900 flex flex-col">
      <CircuitBackground />
      
      <div className="relative z-10 flex-1 flex p-4">
        <Card className={`flex-1 bg-gray-900/30 backdrop-blur-md border-2 border-emerald-500/50 flex flex-col transition-all duration-500 ${isFullScreen ? 'fixed inset-2 z-50' : ''}`}>
          <CardHeader className="border-b border-emerald-500/30 py-4">
            <div className="flex justify-between items-center">
              <motion.h1 
                className="text-2xl font-bold text-emerald-400 flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <Terminal className="w-6 h-6 mr-2" />
                AI Data Assistant
              </motion.h1>
              <motion.div whileHover={{ scale: 1.1 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                >
                  <Maximize2 className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 relative">
            <AnimatePresence>
              {showIntro && <IntroAnimation />}
            </AnimatePresence>
            
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
            </div>
            
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center space-x-2 text-emerald-400"
                >
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>AI is typing...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </CardContent>

          <AnimatePresence>
            {isProcessingFile && (
              <FileProcessingOverlay
                fileName={currentFileName}
                onClose={() => setIsProcessingFile(false)}
              />
            )}
          </AnimatePresence>
          
          <CardFooter className="border-t border-emerald-500/30 p-4">
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about your data..."
                className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              />
              <Button onClick={handleSendMessage} className="ml-2">
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <input
              type="file"
              accept=".csv,.pdf,.xlsx"
              onChange={handleFileUpload}
              className="mt-2"
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="cursor-pointer mt-2 inline-flex items-center bg-emerald-500 text-white py-2 px-4 rounded-lg">
              <Upload className="mr-2" />
              Upload File
            </label>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DataVisualiser;
