import os
from collections import defaultdict
import time
import re
import uuid
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain_mistralai import ChatMistralAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import PromptTemplate
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from github import Github

app = Flask(__name__)
CORS(app)

# Constants
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'pdf', 'csv'}
INDEX_PATH = './chroma_db'
GITHUB_TOKEN = "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"
REPO_NAME = "ATMECS_dataset"
CHATCSV_API_KEY = "sk_3ZkvTQE9QBCAuWhxzGbhUQ1a"

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit

# Set Mistral API key
os.environ["MISTRAL_API_KEY"] = "HrBozeMBZ61JZLCdQrqksACzmseeM14m"

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables
DOC_PATH = None
retriever = None
vectorstore = None
llm = None
conversation = None
file_upload_progress = defaultdict(lambda: {'status': 'uploading', 'progress': 0})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def initialize_components():
    global retriever, vectorstore, llm, conversation
    try:
        if not os.path.exists(DOC_PATH):
            raise FileNotFoundError(f"PDF file not found at {DOC_PATH}")

        print(f"Loading file: {DOC_PATH}")
        loader = PyPDFLoader(DOC_PATH)
        docs = loader.load()
        print("PDF loaded successfully")
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_documents(docs)
        print(f"Text split into {len(chunks)} chunks")

        hf_embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

        print("Creating vector store...")
        vectorstore = Chroma.from_documents(documents=chunks, embedding=hf_embeddings, persist_directory=INDEX_PATH)
        print("Vector store created successfully")

        retriever = vectorstore.as_retriever()
        print("Retriever initialized successfully")

        llm = ChatMistralAI(model="mistral-medium")
        print("Language model initialized successfully")

        conversation_prompt = PromptTemplate.from_template("""
        The following is a conversation between a helpful assistant and a user. The assistant has access to memory of past interactions and make
        answers more formal and be concise with the answer but providing helpful insights.

        Conversation History:
        {history}

        User: {input}
        Assistant:""")

        conversation_memory = ConversationBufferMemory(return_messages=True)
        conversation = ConversationChain(
            llm=llm,
            memory=conversation_memory,
            prompt=conversation_prompt,
            verbose=True
        )
        print("Conversation chain initialized successfully")

    except Exception as e:
        print(f"Initialization error: {str(e)}")
        print(f"Error occurred at {e.__traceback__.tb_lineno}")
        raise

# Improved RAG prompt
template = """
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use maximum and keep the answer as concise as possible. Add thank u at the end.

{context}

Question: {question}

Helpful Answer:
"""
custom_rag_prompt = PromptTemplate.from_template(template)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def is_sensitive_query(query):
    sensitive_patterns = [
        r"reveal.*secret.*password",
        r"bypass.*security",
        r"hack.*system",
        r"toxic.*injection.*attack.*activate.*developer",
    ]
    return any(re.search(pattern, query.lower()) for pattern in sensitive_patterns)

def upload_to_github(file_path, repo_name, github_token):
    g = Github(github_token)
    user = g.get_user()
    
    try:
        repo = user.get_repo(repo_name)
    except:
        repo = user.create_repo(repo_name)
    
    with open(file_path, 'r') as file:
        content = file.read()
    
    filename = os.path.basename(file_path)
    
    try:
        file = repo.get_contents(filename)
        repo.update_file(file.path, f"Updated {filename}", content, file.sha)
    except:
        repo.create_file(filename, f"Added {filename}", content)
    
    url = f"https://raw.githubusercontent.com/{user.login}/{repo.name}/main/{filename}"
    return url

@app.route('/process_file', methods=['POST'])
def process_file():
    global DOC_PATH
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        file_path = os.path.normpath(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        file.save(file_path)
        
        try:
            file_upload_progress[file_id]['status'] = 'processing'
            file_upload_progress[file_id]['progress'] = 50

            if filename.lower().endswith('.pdf'):
                DOC_PATH = file_path
                initialize_components()
            elif filename.lower().endswith('.csv'):
                dataset_url = upload_to_github(file_path, REPO_NAME, GITHUB_TOKEN)
                os.remove(file_path)
                return jsonify({
                    'message': 'File processed successfully',
                    'file_type': 'csv',
                    'file_id': file_id,
                    'dataset_url': dataset_url
                }), 200

            file_upload_progress[file_id]['status'] = 'completed'
            file_upload_progress[file_id]['progress'] = 100
            
            return jsonify({
                'message': 'File processed successfully',
                'file_type': 'pdf' if filename.lower().endswith('.pdf') else 'csv',
                'file_id': file_id
            }), 200
        except Exception as e:
            file_upload_progress[file_id]['status'] = 'error'
            error_message = f"Error processing file: {str(e)}"
            print(error_message)
            return jsonify({'error': error_message, 'file_id': file_id}), 500
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/upload_progress/<file_id>', methods=['GET'])
def get_upload_progress(file_id):
    if file_id == 'undefined' or not file_id:
        return jsonify({'error': 'Invalid file ID'}), 400

    progress_data = file_upload_progress[file_id]
    return jsonify(progress_data)

@app.route('/query', methods=['POST'])
def query_model():
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({'error': 'No query provided'}), 400

        if retriever is None or llm is None:
            return jsonify({'error': 'No document has been processed yet'}), 400

        user_query = data['query']
        
        rag_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | custom_rag_prompt
            | llm
            | StrOutputParser()
        )
        
        initial_response = rag_chain.invoke(user_query)

        if is_sensitive_query(user_query):
            return jsonify({
                'answer': "I'm sorry, but I can't assist you because of security measures.",
                'status': 'security_blocked'
            })
        
        time.sleep(30)
        final_response = conversation.predict(input=initial_response)
        
        return jsonify({
            'answer': final_response,
            'status': 'success'
        })

    except Exception as e:
        print(f"Query error: {str(e)}")
        return jsonify({
            'error': 'An error occurred while processing your request',
            'details': str(e)
        }), 500

@app.route('/get_results', methods=['POST'])
def get_results():
    data = request.json
    if not data or 'prompt' not in data or 'dataset_url' not in data:
        return jsonify({'error': 'Missing prompt or dataset URL'}), 400

    url = 'https://www.chatcsv.co/api/v1/chat'
    headers = {
        'accept': 'text/event-stream',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {CHATCSV_API_KEY}'
    }
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "user",
                "content": data['prompt']
            }
        ],
        "files": [
            data['dataset_url']
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload, stream=True)
        response.raise_for_status()
        
        full_response = ''
        for line in response.iter_lines(decode_unicode=True):
            if line:
                full_response += line + '\n'
        
        full_response = full_response.replace("An error occurred: 'gpt-3.5-turbo'", "").strip()
        
        if not full_response:
            full_response = "I'm sorry, I couldn't process your request. Please try again."
        
        return jsonify({'answer': full_response}), 200
    except requests.RequestException as e:
        return jsonify({'error': f"Request failed: {str(e)}"}), 500
    
@app.route('/upload_to_github', methods=['POST'])
def upload_file_to_github():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            dataset_url = upload_to_github(file_path, REPO_NAME, GITHUB_TOKEN)
            os.remove(file_path)  # Remove the file after uploading to GitHub
            return jsonify({'dataset_url': dataset_url}), 200
        except Exception as e:
            os.remove(file_path)  # Remove the file if an error occurs
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type'}), 400


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
