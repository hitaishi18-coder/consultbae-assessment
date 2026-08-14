import sqlite3
import pandas as pd

print("Checking database for saved audio...")

# Database se connect karein
conn = sqlite3.connect('consultbae_candidates.db')

# Sirf un candidates ka data nikalein jinki audio save huyi hai
query = """
SELECT full_name, phone, audio_url, duration, sample_rate, bitrate 
FROM Candidates 
WHERE audio_url IS NOT NULL
"""

df = pd.read_sql_query(query, conn)

if df.empty:
    print("Koi audio record nahi mila. (Ya toh upload nahi hua, ya phone number match nahi kiya)")
else:
    print("\n--- SUCCESS: Audio Records Found! ---")
    print(df.to_string())

conn.close()