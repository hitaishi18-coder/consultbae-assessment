import pandas as pd
import sqlite3
import re

print("Loading data...")

# 1. Load the three CSV files
df1 = pd.read_csv('data/source1_naukri_applicants.csv')
df2 = pd.read_csv('data/source2_gig_workers.csv')
df3 = pd.read_csv('data/source3_cbnexus_contacts.csv')

# 2. Fix the Columns (Standardization)
df1.columns = ['full_name', 'email', 'phone', 'city', 'experience_years', 'current_ctc', 'applied_date', 'skills']
df2.columns = ['email', 'full_name', 'rate', 'city', 'status', 'skills']
df3.columns = ['full_name', 'phone', 'city', 'verified', 'projects_completed']

# 3. Handle the obvious "Messy Data" traps we found
df2 = df2.dropna(how='all') 
df3 = df3[df3['phone'] != 'Phone Number'] 

# 4. Clean Data for Matching
print("Cleaning emails and phone numbers...")

# Clean Emails: Convert to lowercase and remove accidental spaces
df1['email'] = df1['email'].str.lower().str.strip()
df2['email'] = df2['email'].str.lower().str.strip()

# Clean Phones: Extract only the last 10 digits
def clean_phone(phone_val):
    if pd.isna(phone_val):
        return None
    # Remove everything that is not a number
    digits_only = re.sub(r'\D', '', str(phone_val))
    # Return only the last 10 digits
    return digits_only[-10:] if len(digits_only) >= 10 else digits_only

df1['phone'] = df1['phone'].apply(clean_phone)
df3['phone'] = df3['phone'].apply(clean_phone)

# 5. The Core Merge (Matching Logic)
print("Merging databases...")

# Merge Source 1 and Source 2 on 'email'
merge1 = pd.merge(df1, df2, on='email', how='outer', suffixes=('', '_drop'))

# Merge the result with Source 3 on 'phone'
final_df = pd.merge(merge1, df3, on='phone', how='outer', suffixes=('', '_drop2'))

# Clean up duplicate columns created during merge
for col in final_df.columns:
    if '_drop' in col:
        original_col = col.split('_drop')[0]
        final_df[original_col] = final_df[original_col].combine_first(final_df[col])
        final_df = final_df.drop(columns=[col])

# ---> THE FIX: Add empty columns for the audio app <---
final_df['audio_url'] = None 
final_df['duration'] = None
final_df['sample_rate'] = None
final_df['bitrate'] = None

print(f"Total unique candidates after merge: {len(final_df)}")

# 6. Save to SQLite Database
print("Saving to database...")
conn = sqlite3.connect('consultbae_candidates.db')
final_df.to_sql('Candidates', conn, if_exists='replace', index=False)
conn.close()

print("Success! Database 'consultbae_candidates.db' has been recreated with audio columns.")