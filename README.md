# Data Orchestration & Audio Processing Pipeline

A full-stack solution built for automated candidate data merging, audio file ingestion, n8n webhook integration, and background metadata extraction.

## Architecture Overview

This project is divided into core components:
* **Data Normalization Engine (Python):** Cleanses and merges disparate CSV datasets using Pandas, resolving the lack of a primary key by establishing a two-step outer join bridge.
* **REST API Backend (Node.js/Express):** Handles multipart form data, file storage, and background metadata extraction using FFmpeg/ffprobe.
* **Automation & Orchestration (n8n):** Uses n8n webhooks to capture incoming candidate payload data and automatically append records directly into Google Sheets (`ConsultBae Candidates`).
* **Client Interface (React.js):** A clean, responsive portal for candidates to submit their assessment data and files.

## Key Features & Problem Solving

* **Complex Data Merging:** The provided datasets lacked a universal ID (Source 2 lacked phones, and Source 3 lacked emails). The Python script uses Source 1 as a structural bridge to merge all files without duplicating entities.
* **Data Sanitization:** Implemented Regex to strip country codes and non-numeric characters from phone numbers, standardizing all records to strict 10-digit formats before merging.
* **Zero-Dependency Audio Extraction:** Utilized `ffprobe-static` within the Node runtime to extract deep audio metadata (Duration, Sample Rate, Bitrate) on the fly, avoiding the need for host-machine FFmpeg installations.
* **Automated Schema Evolution:** The backend automatically alters the SQLite database to accommodate new metadata columns if they do not already exist, ensuring seamless environment setups.
* **Automated Google Sheets Integration (n8n):** Configured webhook triggers linked to an automated `Append row in sheet` node that formats and saves candidate metrics (`Phone`, `Duration`, `Sample Rate`, `Bitrate`) directly into Google Sheets in real time.

## Tech Stack

* **Database:** SQLite3
* **Spreadsheet Automation:** Google Sheets API via n8n Workflows
* **Data Pipeline:** Python (Pandas)
* **Backend:** Node.js, Express, Multer, Fluent-FFmpeg, n8n Webhooks
* **Frontend:** React (Vite)

## How to Run Locally

### 1. Initialize the Database
Ensure your raw CSV files are in a `data/` folder in the root directory.
```bash
# This cleans the data and generates 'consultbae_candidates.db'
python merge_data.py
