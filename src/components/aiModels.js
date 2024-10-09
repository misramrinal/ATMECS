import axios from 'axios';

const HUGGING_FACE_API_TOKEN = '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';
const LANGCHAIN_API_KEY = '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';

const config = {
  huggingFace: {
    apiUrl: "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1",
    embeddingUrl: "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
    headers: { Authorization: `Bearer ${HUGGING_FACE_API_TOKEN}` }
  },
  langChain: {
    apiUrl: "https://api.smith.langchain.com",
    headers: { Authorization: `Bearer ${LANGCHAIN_API_KEY}` }
  }
};

// Document processing utilities
const splitTextIntoChunks = (text, chunkSize = 500, overlap = 50) => {
  const chunks = [];
  let index = 0;
  
  while (index < text.length) {
    const chunk = text.slice(index, index + chunkSize);
    chunks.push(chunk);
    index += chunkSize - overlap;
  }
  
  return chunks;
};

const getEmbeddings = async (texts) => {
  try {
    const response = await axios.post(config.huggingFace.embeddingUrl, {
      inputs: texts
    }, {
      headers: config.huggingFace.headers
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
};

// Main document processing function
export const processDocument = async (fileContent) => {
  try {
    // Split the document into chunks
    const chunks = splitTextIntoChunks(fileContent);
    
    // Get embeddings for all chunks
    const embeddings = await getEmbeddings(chunks);
    
    // Store chunks and their embeddings
    return chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index]
    }));
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error('Failed to process document');
  }
};

// Find most relevant chunks for a query
const findRelevantChunks = async (query, processedDocument, topK = 5) => {
  const queryEmbedding = await getEmbeddings([query]);
  
  // Compute cosine similarity between query and all chunks
  const similarities = processedDocument.map(chunk => {
    const dotProduct = chunk.embedding.reduce((sum, val, i) => sum + val * queryEmbedding[0][i], 0);
    const norm1 = Math.sqrt(chunk.embedding.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(queryEmbedding[0].reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (norm1 * norm2);
  });
  
  // Get indices of top K chunks
  const topIndices = similarities
    .map((similarity, index) => ({ similarity, index }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(item => item.index);
  
  return topIndices.map(index => processedDocument[index].content);
};

const PROMPT_TEMPLATE = `
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use maximum and keep the answer as concise as possible. Add thank u at the end

{context}

Question: {question}

Helpful Answer:`;

export const processQuery = async (query, processedDocument) => {
  try {
    const actualQuery = query || "PERFORMANCE ACHIEVEMENT AND PAYOUTS";
    
    let contextText = '';
    
    if (processedDocument) {
      const relevantChunks = await findRelevantChunks(actualQuery, processedDocument);
      contextText = relevantChunks.join('\n\n');
    }
    
    const formattedPrompt = PROMPT_TEMPLATE
      .replace('{context}', contextText)
      .replace('{question}', actualQuery);
    
    const response = await axios.post(config.huggingFace.apiUrl, {
      inputs: formattedPrompt,
      parameters: {
        max_length: 512,
        temperature: 0.7,
        do_sample: true
      }
    }, {
      headers: config.huggingFace.headers
    });
    
    let responseText = response.data[0].generated_text;
    
    // Extract the part after "Helpful Answer:" if present
    const answerStart = responseText.indexOf("Helpful Answer:");
    if (answerStart !== -1) {
      responseText = responseText.substring(answerStart + "Helpful Answer:".length).trim();
    }
    
    return responseText;
  } catch (error) {
    console.error('Error querying AI model:', error);
    throw new Error('Failed to process query. Please try again.');
  }
};

export const analyzeData = async (data, query) => {
  try {
    const response = await axios.post(`${config.langChain.apiUrl}/analyze`, {
      data,
      query,
      options: {
        trace: true
      }
    }, {
      headers: config.langChain.headers
    });

    return response.data;
  } catch (error) {
    console.error('Error analyzing data:', error);
    throw new Error('Failed to analyze data. Please try again.');
  }
};

export const generateInsights = async (data) => {
  try {
    const response = await axios.post(`${config.langChain.apiUrl}/insights`, {
      data,
      options: {
        trace: true,
        includeVisualization: true
      }
    }, {
      headers: config.langChain.headers
    });

    return response.data;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error('Failed to generate insights. Please try again.');
  }
};

export const summarizeFile = async (fileContent, fileType) => {
  try {
    const response = await axios.post(`${config.langChain.apiUrl}/summarize`, {
      content: fileContent,
      type: fileType,
      options: {
        trace: true
      }
    }, {
      headers: config.langChain.headers
    });

    return response.data;
  } catch (error) {
    console.error('Error summarizing file:', error);
    throw new Error('Failed to summarize file. Please try again.');
  }
};