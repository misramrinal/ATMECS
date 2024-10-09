import requests

# Define the API endpoint
url = 'https://www.chatcsv.co/api/v1/chat'

# Your authorization token (replace <token> with your actual token)
headers = {
    'accept': 'text/event-stream',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_3ZkvTQE9QBCAuWhxzGbhUQ1a'
}

# Define the data payload
data = {
    "model": "gpt-3.5-turbo",
    "messages": [
        {
            "role": "user",
            "content": "Show me some interesting visuals about the dataset"
        }
    ],
    "files": [
        "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
    ]
}

# Make the POST request
response = requests.post(url, headers=headers, json=data, stream=True)

# Check for a successful response
if response.status_code == 200:
    # Print the response in chunks since it's a text/event-stream
    for line in response.iter_lines(decode_unicode=True):
        if line:
            print(line)
else:
    print(f"Request failed with status code {response.status_code}: {response.text}")
