import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage
import re
import json
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env


def save_remediation_json(remediation_str, filename):
    lines = remediation_str.strip().splitlines()
    # Remove the first line if it is a code block marker (``` or ```
    if lines and lines.strip().startswith('```'):
        lines = lines[1:]
    # Remove the last line if it is a code block marker (```
    if lines and lines[-1].strip().startswith('```'):
        lines = lines[:-1]
    cleaned = '\n'.join(lines).strip()
    
    if not cleaned:
        raise ValueError("No JSON content found in the remediation variable after cleaning.")
    
    try:
        json_data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON data: {e}\nContent after cleaning:\n{cleaned}")
    
    with open(filename, 'w') as f:
        json.dump(json_data, f, indent=2)



# === CONFIGURATION ===
EXCEL_FILE = r"C:\My Files\Hackathons\Covasant\Test Results and Suites Schema.xlsx"  # Replace with your actual Excel file name
SHEET_NAME = "Test results data"       # The sheet you want to use
HEADER_ROW = 2                        # Zero-based index: 2 means third row in Excel
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment.")

# === LOAD DATA ===
df = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_NAME, header=HEADER_ROW)
df.columns = df.columns.str.strip()

# === FILTER FOR FAILURES/WARNINGS ===
filtered_df = df[df['result_status'].str.lower() != 'passed']

# === INITIALIZE GEMINI CLIENT ===
client = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0
)

def generate_remediation_action(row):
    issue_description = row['result_message']
    row_data = row.to_dict()
    prompt = (
    "Given the following data quality test result, analyze the issue and respond strictly in JSON format with two fields:\n"
    "1. 'reasoning_and_remediation': Provide step-by-step reasoning about the possible root cause based on the context, "
    "then give clear, concise, and definite remediation steps using Google Cloud Platform tools. "
    "The remediation should be suitable for automation and tailored to the available data. "
    "2. 'gcp_commands': A JSON array of GCP CLI commands (with correct attributes and parameters based on the provided context) "
    "that should be executed in sequential order to resolve the error. Each command should be a single string as it would be run in the terminal.\n"
    f"Issue: {issue_description}\n"
    f"Context: {row_data}\n"
    "Do NOT include generic advice, examples, or any content outside the JSON object."
    )
    messages = [HumanMessage(content=prompt)]
    response = client(messages)
    return response.content

# === PROCESS AND PRINT RESULTS ===
for idx, row in filtered_df.iterrows():
    remediation = generate_remediation_action(row)
    print(f"Issue: {row['result_message']}")
    print(f"Context: {row.to_dict()}")
    print(f"Gemini Analysis & Remediation:\n{remediation}\n{'-'*60}\n")
    #filename = f"remediation_output_{idx}.json"
    #save_remediation_json(remediation, filename)
    #print(f"Saved remediation output to {filename}")
