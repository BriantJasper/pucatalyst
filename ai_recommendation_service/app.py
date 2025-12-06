import os
import sys
import pandas as pd
import numpy as np
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer
from pypdf import PdfReader

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
AI_DATA_DIR = os.path.join(PROJECT_ROOT, 'AI-SBERT-PUCATALYST')
MODEL_PATH = os.path.join(AI_DATA_DIR, 'sbert_model')
DATA_PATH = os.path.join(AI_DATA_DIR, 'alumni_data.pkl')

# Global variables to store model and data
sbert_model = None
df = None
sbert_embeddings_full = None

def standardize_text(text):
    if pd.isna(text) or text is None:
        return ""
    text = str(text).lower()
    text = re.sub(r'[;,|]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + " "
        return text.strip()
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return ""

def load_resources():
    global sbert_model, df, sbert_embeddings_full
    
    print("Loading resources...")
    
    # 1. Load Data
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Data file not found at: {DATA_PATH}")
    
    print(f"Loading data from {DATA_PATH}...")
    if DATA_PATH.endswith('.pkl'):
        data = pd.read_pickle(DATA_PATH)
        # Handle if it's a list of dicts
        if isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            df = data
    else:
        df = pd.read_csv(DATA_PATH)
    print(f"Data loaded. Shape: {df.shape}")
    
    # 2. Load Model
    print(f"Loading SBERT model from {MODEL_PATH}...")
    try:
        sbert_model = SentenceTransformer(MODEL_PATH)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load local model, trying to load from HuggingFace as fallback (might require internet): {e}")
        sbert_model = SentenceTransformer('distiluse-base-multilingual-cased-v1')

    # 3. Generate/Load Embeddings
    # In a production env, we should save these to a .npy file to save time.
    # For now, we'll generate them on startup or load if available.
    embeddings_path = os.path.join(AI_DATA_DIR, 'alumni_embeddings.npy')
    
    if os.path.exists(embeddings_path):
        print(f"Loading embeddings from {embeddings_path}...")
        sbert_embeddings_full = np.load(embeddings_path)
    else:
        print("Generating embeddings (this might take a while)...")
        # Ensure 'combined_features' exists or create it
        if 'combined_features' not in df.columns:
             # Create combined features similar to notebook if missing
            # Based on notebook: 'major', 'job_title', 'skills', 'projects', 'certifications', 'organizations'
             df['combined_features'] = df.apply(lambda row: ' '.join([
                str(row['major']),
                str(row['job_title']),
                str(row['skills']),
                str(row['projects']),
                str(row['certifications']),
                str(row['organizations'])
            ]), axis=1)
        
        sbert_embeddings_full = sbert_model.encode(df['combined_features'].tolist(), show_progress_bar=True)
        # Save for next time
        np.save(embeddings_path, sbert_embeddings_full)
        
    print(f"Embeddings ready. Shape: {sbert_embeddings_full.shape}")

def recommend_profile_and_actions_sbert(target_text, context_text="", top_n_alumni_display=5, top_n_actions=5, top_n_alumni_for_actions=15):
    # 1. Profile Matching
    standardized_target_text = standardize_text(target_text + " " + context_text)
    target_vector = sbert_model.encode([standardized_target_text], convert_to_tensor=False)

    target_sim_scores = cosine_similarity(target_vector, sbert_embeddings_full).flatten()

    sim_scores = list(enumerate(target_sim_scores))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Top Alumni for Display
    top_alumni_indices_display = [i[0] for i in sim_scores[1:top_n_alumni_display + 1]] # Exclude self (though 'self' isn't in DB, just following logic)
    top_alumni_scores_display = [i[1] for i in sim_scores[1:top_n_alumni_display + 1]]

    recommended_alumni_df = df.iloc[top_alumni_indices_display].copy()
    recommended_alumni_df['Similarity Score'] = top_alumni_scores_display

    # 2. Action Analysis
    top_alumni_indices_for_actions = [i[0] for i in sim_scores[1:top_n_alumni_for_actions + 1]]
    target_alumni_data = df.iloc[top_alumni_indices_for_actions]

    # Extract Data
    # Note: Data in pickle seems to be lists already, not strings like "A, B". 
    # Let's handle both cases (list or string)
    
    def explode_items(series):
        # If it's already a list, just explode. If string, split then explode.
        if series.empty: return series
        first_item = series.iloc[0]
        if isinstance(first_item, list):
            return series.explode().astype(str).str.strip()
        return series.astype(str).str.split(r'[,|]').explode().str.strip()

    org_list_full_entities = explode_items(target_alumni_data['organizations'])
    skills_list = explode_items(target_alumni_data['skills'])
    certs_list = explode_items(target_alumni_data['certifications'])

    # Organizations
    org_list_filtered = org_list_full_entities[~org_list_full_entities.isin(['nan', '', ' '])]
    org_counts = Counter(org_list_filtered[org_list_filtered.str.len() > 1].str.strip())
    org_counts_df = pd.DataFrame(org_counts.items(), columns=['Organisasi', 'count'])

    generic_single_words = ['puma', 'management', 'accounting', 'informatics', 'science', 'engineering']
    def filter_generic_single_words(org_name):
        if ' ' not in org_name and org_name in generic_single_words:
            if org_name in ['aiesec', 'debate', 'accounting']: return True
            return False
        return True
    
    if not org_counts_df.empty:
        top_orgs = org_counts_df[org_counts_df['Organisasi'].apply(filter_generic_single_words)]
        top_orgs = top_orgs.sort_values('count', ascending=False).head(top_n_actions)
    else:
        top_orgs = pd.DataFrame(columns=['Organisasi', 'count'])

    # Skills
    skills_counts = Counter(skills_list[skills_list.str.len() > 0].str.strip())
    top_skills = pd.DataFrame(skills_counts.most_common(top_n_actions), columns=['Skill', 'count'])

    # Certificates
    certs_counts = Counter(certs_list[certs_list.str.len() > 0].str.strip())
    top_certs = pd.DataFrame(certs_counts.most_common(top_n_actions), columns=['Sertifikat', 'count'])

    # Projects
    # Projects might be a list of strings too
    proj_series = target_alumni_data['projects']
    if not proj_series.empty and isinstance(proj_series.iloc[0], list):
        proj_list = proj_series.explode().astype(str).fillna('')
        # Join back to text for vectorizer? Or just count phrases?
        # Vectorizer expects a list of documents.
        # Let's treat each project title as a document.
        proj_docs = proj_list.tolist()
    else:
        proj_docs = target_alumni_data['projects'].astype(str).fillna('').tolist()

    action_stop_words = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such',
        'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', '','from','up','down','out','over','under'
    ]
    
    if proj_docs:
        try:
            proj_vectorizer = CountVectorizer(ngram_range=(1, 3), stop_words=list(action_stop_words))
            proj_matrix = proj_vectorizer.fit_transform(proj_docs)
            proj_sums = np.sum(proj_matrix, axis=0)
            proj_counts = pd.DataFrame({'phrase': proj_vectorizer.get_feature_names_out(), 'count': proj_sums.flat}).sort_values('count', ascending=False)

            proj_counts['is_ngram'] = proj_counts['phrase'].apply(lambda x: len(x.split()) > 1)
            top_projs = proj_counts.sort_values(['is_ngram', 'count'], ascending=[False, False]).head(top_n_actions).rename(columns={'phrase': 'Project Keywords'})
        except ValueError:
             top_projs = pd.DataFrame(columns=['Project Keywords', 'count'])
    else:
        top_projs = pd.DataFrame(columns=['Project Keywords', 'count'])

    return recommended_alumni_df, top_orgs, top_skills, top_certs, top_projs

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'ai_recommendation_sbert'}), 200

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json(silent=True) or {}
        # Accept both 'goal' and 'query' for flexibility
        goal = data.get('goal') or data.get('query')
        context = data.get('context', '')
        resume_path = data.get('resume_path')
        top_n = data.get('top_n', 5)
        
        if not goal:
            return jsonify({'error': 'Goal or query is required'}), 400
            
        if len(goal) < 3:
             return jsonify({'error': 'Goal is too short'}), 400

        # Extract text from PDF if provided (Windows-safe)
        if isinstance(resume_path, str) and resume_path.strip():
            # Normalize Windows path and ensure it's a local .pdf file
            normalized_path = os.path.normpath(resume_path)
            if normalized_path.lower().endswith('.pdf') and os.path.isfile(normalized_path):
                try:
                    print(f"Extracting text from resume: {normalized_path}")
                    resume_text = extract_text_from_pdf(normalized_path)
                    if resume_text:
                        context += " Resume Content: " + resume_text
                except Exception as pdf_err:
                    # Log and continue without blocking recommendations
                    print(f"Resume extraction skipped due to error: {pdf_err}")
            else:
                # Ignore non-existent, non-pdf, or URL-like paths to avoid Errno 22
                pass

        alumni_df, org_actions, skills_actions, certs_actions, proj_actions = recommend_profile_and_actions_sbert(goal, context)
        
        # Format response - use 'top_alumni' to match frontend expectations
        # Frontend expects: name, job_title, current_company, major, similarity_percentage
        
        # Scale similarity score to percentage (0-100)
        alumni_df['similarity_percentage'] = alumni_df['Similarity Score'] * 100
        
        response = {
            'top_alumni': alumni_df[['name', 'job_title', 'current_company', 'major', 'similarity_percentage']].to_dict(orient='records'),
            'recommendations': {
                'organizations': org_actions.values.tolist(), # Convert to list of [name, count]
                'skills': skills_actions.values.tolist(),
                'certifications': certs_actions.values.tolist(),
                'projects': proj_actions.values.tolist()
            }
        }
        
        return jsonify(response), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/autocomplete', methods=['POST'])
def autocomplete():
    try:
        data = request.get_json(silent=True) or {}
        query = data.get('query', '').lower()
        max_suggestions = data.get('max_suggestions', 5)
        
        if not query:
            return jsonify({'suggestions': []}), 200
            
        # Simple autocomplete based on skills and job titles in the dataframe
        if df is None:
             return jsonify({'suggestions': []}), 200
             
        # Collect potential suggestions
        suggestions = set()
        
        # 1. Job Titles (job_title)
        jobs = df['job_title'].dropna().unique()
        for job in jobs:
            if query in str(job).lower():
                suggestions.add(str(job))
                
        # 2. Skills
        # Skills might be list or string
        if not df['skills'].empty and isinstance(df['skills'].iloc[0], list):
             all_skills = df['skills'].explode().dropna().unique()
        else:
             all_skills = df['skills'].astype(str).str.split(r'[,|]').explode().dropna().unique()

        for skill in all_skills:
            if query in str(skill).lower():
                suggestions.add(str(skill))
                
        # Limit and sort
        sorted_suggestions = sorted(list(suggestions), key=len)[:max_suggestions]
        
        return jsonify({'suggestions': sorted_suggestions}), 200
        
    except Exception as e:
        print(f"Autocomplete Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_resources()
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting AI Recommendation Service on port {port}")
    app.run(host='0.0.0.0', port=port)
