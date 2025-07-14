import os
from dotenv import load_dotenv

load_dotenv()  # This loads variables from .env into os.environ

# Now the environment variable is available to your process
from google.cloud import storage

client = storage.Client()
buckets = list(client.list_buckets())
print("Buckets:", buckets)
