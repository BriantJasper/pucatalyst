import pandas as pd
import os

DATA_PATH = r'd:\xampp\smkimmanuel\htdocs\React\AIFinal\pucatalyst\AI-SBERT-PUCATALYST\alumni_data.pkl'

try:
    if DATA_PATH.endswith('.pkl'):
        data = pd.read_pickle(DATA_PATH)
        if isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            df = data
    else:
        df = pd.read_csv(DATA_PATH)
        
    print("Columns:", df.columns.tolist())
    print("First row:", df.iloc[0].to_dict())
except Exception as e:
    print(f"Error: {e}")
