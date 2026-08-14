# Data Orchestration & Audio Processing Pipeline

A full-stack solution built for automated candidate data merging, audio file ingestion, and background metadata extraction.

##  Architecture Overview

This project is divided into three core components:
1. **Data Normalization Engine (Python):** Cleanses and merges disparate CSV datasets using Pandas, resolving the lack of a primary key by establishing a two-step outer join bridge.
2. **REST API Backend (Node.js/Express):** Handles multipart form data, file storage, and background metadata extraction using FFmpeg.
3. **Client Interface (React.js):** A clean, responsive portal for candidates to submit their assessment data.

##  Key Features & Problem Solving

* **Complex Data Merging:** The provided datasets lacked a universal ID. Source 2 lacked phones, and Source 3 lacked emails. The Python script uses Source 1 as a structural bridge to merge all files without duplicating entities.
* **Data Sanitization:** Implemented Regex to strip country codes and non-numeric characters from phone numbers, standardizing all records to strict 10-digit formats before merging.
* **Zero-Dependency Audio Extraction:** Utilized `ffprobe-static` within the Node runtime to extract deep audio metadata (Duration, Sample Rate, Bitrate) on the fly, avoiding the need for host-machine FFmpeg installations.
* **Automated Schema Evolution:** The backend automatically alters the SQLite database to accommodate new metadata columns if they do not already exist, ensuring seamless environment setups.

##  Tech Stack

* **Database:** SQLite3
* **Data Pipeline:** Python (Pandas)
* **Backend:** Node.js, Express, Multer, Fluent-FFmpeg
* **Frontend:** React (Vite)

##  How to Run Locally

### 1. Initialize the Database
Ensure your raw CSV files are in a `data/` folder in the root directory.
```bash
# This cleans the data and generates 'consultbae_candidates.db'
python merge_data.py
