from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_mistralai import ChatMistralAI
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

app = Flask(__name__)
CORS(app)

# Constants
INDEX_PATH = './faiss_index'
DOC_PATH = './NVIDIA-2024-Annual-Report.pdf'

# Set Mistral API key
os.environ["MISTRAL_API_KEY"] = "a9A16J2gV70DXUS5p28EUS7Ugtb6F3S9"

def initialize_components():
    try:
        if not os.path.exists(DOC_PATH):
            raise FileNotFoundError(f"PDF file not found at {DOC_PATH}")

        # Use a more powerful embedding model
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

        # Load and process the PDF
        loader = PyPDFLoader(DOC_PATH)
        pages = loader.load_and_split()
        
        # Use a more sophisticated text splitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_documents(pages)

        # Use FAISS for better retrieval performance
        vectorstore = FAISS.from_documents(chunks, embeddings)
        
        # Save the index for future use
        vectorstore.save_local(INDEX_PATH)

        return vectorstore.as_retriever(search_kwargs={"k": 5})

    except Exception as e:
        print(f"Initialization error: {str(e)}")
        raise

retriever = initialize_components()

# Initialize Mistral LLM
llm = ChatMistralAI(model="mistral-large-latest", temperature=0.2)

# Improved RAG prompt
template = """You are an AI assistant specialized in providing information from NVIDIA's 2024 Annual Report. 
Use the following pieces of context to answer the question at the end.
If you don't know the answer or the information is not present in the given context, just say that you don't have that information in the report, don't try to make up an answer.
Provide a concise and accurate answer based solely on the given context. 

Context:
{context}

Question: {question}

Helpful Answer:"""
custom_rag_prompt = PromptTemplate.from_template(template)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | custom_rag_prompt
    | llm
    | StrOutputParser()
)

@app.route('/query', methods=['POST'])
def query_model():
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({'error': 'No query provided'}), 400

        user_query = data['query']
        
        # Use the rag_chain to get the response
        response = rag_chain.invoke(user_query)
        
        return jsonify({
            'answer': response,
            'status': 'success' 
        })

    except Exception as e:
        print(f"Query error: {str(e)}")
        return jsonify({
            'error': 'An error occurred while processing your request',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)