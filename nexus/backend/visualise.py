from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from github import Github
import requests
import uuid
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Constants
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'csv'}
GITHUB_TOKEN = "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"
REPO_NAME = "ATMECS_dataset"
CHATCSV_API_KEY = "sk_3ZkvTQE9QBCAuWhxzGbhUQ1a"

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables
file_upload_progress = defaultdict(lambda: {'status': 'uploading', 'progress': 0})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        
        # Collect all the response content
        full_response = ''
        for line in response.iter_lines(decode_unicode=True):
            if line:
                full_response += line + '\n'
        
        # Process the full response to extract the answer
        # You may need to adjust this parsing based on the actual response format
        full_response = full_response.replace("An error occurred: 'gpt-3.5-turbo'", "").strip()
        
        # If the response is empty after removing the error, return a generic message
        if not full_response:
            full_response = "I'm sorry, I couldn't process your request. Please try again."
        
        return jsonify({'answer': full_response}), 200
    except requests.RequestException as e:
        return jsonify({'error': f"Request failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False)