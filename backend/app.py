import os
from dotenv import load_dotenv
import pandas as pd
from flask import Flask, request, jsonify
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage
import re
import json
from werkzeug.utils import secure_filename
from tempfile import mkdtemp
from flask_cors import CORS

load_dotenv()  # Load environment variables from .env

# === Flask App Setup ===
app = Flask(__name__)
CORS(app, resources={r"/analyze": {"origins": [
    "https://team-pikachu-5f4c8.firebaseapp.com",
    "https://team-pikachu-5f4c8.web.app"
]}})

UPLOAD_FOLDER = mkdtemp()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# === Gemini Setup ===
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment.")
client = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0
)


# === Helper Function to Clean AI JSON ===
def save_remediation_json(remediation_str):
    lines = remediation_str.strip().splitlines()
    if lines and lines[0].strip().startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip().startswith("```"):
        lines = lines[:-1]
    cleaned = "\n".join(lines).strip()

    if not cleaned:
        raise ValueError("No JSON content found in the remediation variable after cleaning.")

    try:
        json_data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON data: {e}\nContent after cleaning:\n{cleaned}")
    
    return json_data


# === AI Analysis Function ===
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
    return save_remediation_json(response.content)


# === Flask API Route ===
@app.route("/analyze", methods=["POST"])
def analyze_excel():
    try:
        # Get file and sheet name from request
        file = request.files.get("file")
        sheet_name = request.form.get("sheet_name")

        if not file or not sheet_name:
            return jsonify({"error": "Missing file or sheet_name in request"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        # Read Excel with fixed header row
        df = pd.read_excel(filepath, sheet_name=sheet_name, header=2)
        df.columns = df.columns.str.strip()
        df = df.fillna("")  # <<< ADD THIS LINE

        # Filter failures/warnings
        filtered_df = df[df['result_status'].str.lower() != 'passed']

        results = []
        for _, row in filtered_df.iterrows():
            try:
                row_cleaned = row.fillna("")
                remediation = generate_remediation_action(row_cleaned)
                results.append({
                    "issue": row['result_message'],
                    "context": row.to_dict(),
                    "remediation": remediation
                })
            except Exception as e:
                results.append({
                    "issue": row['result_message'],
                    "context": row.to_dict(),
                    "error": str(e)
                })

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# === Run Server ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
