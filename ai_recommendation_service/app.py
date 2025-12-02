from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
import os
from typing import List, Dict, Tuple
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load SBERT model from local path (pre-trained)
BASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'AI-SBERT-PUCATALYST')
LOCAL_MODEL_PATH = os.path.join(BASE_DIR, 'sbert_model')

# Try to load local model first, fallback to downloading
if os.path.exists(LOCAL_MODEL_PATH):
    logger.info(f"Loading local SBERT model from: {LOCAL_MODEL_PATH}")
    model = SentenceTransformer(LOCAL_MODEL_PATH)
else:
    MODEL_NAME = 'paraphrase-multilingual-MiniLM-L12-v2'
    logger.info(f"Local model not found, downloading: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)

# Load alumni data  
EMBEDDINGS_PATH = os.path.join(BASE_DIR, 'alumni_embeddings.npy')
DATA_PATH = os.path.join(BASE_DIR, 'alumni_data.pkl')

alumni_embeddings = None
alumni_data = None

def load_data():
    """Load alumni embeddings and data"""
    global alumni_embeddings, alumni_data
    
    try:
        logger.info("Loading alumni embeddings...")
        alumni_embeddings = np.load(EMBEDDINGS_PATH)
        logger.info(f"Loaded {len(alumni_embeddings)} alumni embeddings")
        
        logger.info("Loading alumni data...")
        with open(DATA_PATH, 'rb') as f:
            alumni_data = pickle.load(f)
        logger.info(f"Loaded {len(alumni_data)} alumni records")
        
        return True
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        return False

def calculate_similarity(query_embedding: np.ndarray, alumni_embeddings: np.ndarray) -> np.ndarray:
    """Calculate cosine similarity between query and all alumni embeddings"""
    # Normalize embeddings
    query_norm = query_embedding / np.linalg.norm(query_embedding)
    alumni_norm = alumni_embeddings / np.linalg.norm(alumni_embeddings, axis=1, keepdims=True)
    
    # Calculate cosine similarity
    similarities = np.dot(alumni_norm, query_norm)
    return similarities

def get_top_alumni(query: str, top_n: int = 5) -> List[Dict]:
    """Get top N most similar alumni based on query"""
    if alumni_embeddings is None or alumni_data is None:
        raise ValueError("Alumni data not loaded")
    
    # Generate query embedding
    query_embedding = model.encode(query)
    
    # Calculate similarities
    similarities = calculate_similarity(query_embedding, alumni_embeddings)
    
    # Get top N indices
    top_indices = np.argsort(similarities)[::-1][:top_n]
    
    # Prepare results
    results = []
    for idx in top_indices:
        alumni = alumni_data[idx].copy()
        alumni['similarity_score'] = float(similarities[idx])
        alumni['similarity_percentage'] = float(similarities[idx] * 100)
        results.append(alumni)
    
    return results

def extract_skills_from_alumni(alumni_list: List[Dict]) -> Dict:
    """Extract and count skills from top alumni with improved filtering"""
    skills = {}
    certifications = {}
    organizations = {}
    projects = {}
    
    # Soft skills to separate (for better categorization)
    soft_skills = {'time management', 'leadership', 'communication', 'problem solving', 
                   'teamwork', 'critical thinking', 'creativity', 'adaptability'}
    
    technical_skills = {}
    soft_skill_counts = {}
    
    for alumni in alumni_list:
        # Count skills (separate technical vs soft)
        for skill in alumni.get('skills', []):
            skill_lower = skill.lower()
            if skill_lower in soft_skills:
                soft_skill_counts[skill] = soft_skill_counts.get(skill, 0) + 1
            else:
                technical_skills[skill] = technical_skills.get(skill, 0) + 1
        
        # Count certifications
        for cert in alumni.get('certifications', []):
            certifications[cert] = certifications.get(cert, 0) + 1
        
        # Count organizations
        for org in alumni.get('organizations', []):
            organizations[org] = organizations.get(org, 0) + 1
        
        # Count project types
        for project in alumni.get('projects', []):
            projects[project] = projects.get(project, 0) + 1
    
    # Merge technical and soft skills, prioritizing technical first
    sorted_technical = sorted(technical_skills.items(), key=lambda x: x[1], reverse=True)
    sorted_soft = sorted(soft_skill_counts.items(), key=lambda x: x[1], reverse=True)
    
    # Combine: show top technical skills, then some soft skills
    combined_skills = sorted_technical[:12] + sorted_soft[:3]
    
    # Filter out items that appear in less than 2 alumni (noise reduction)
    min_frequency = max(2, len(alumni_list) // 3)  # At least 2 or 1/3 of alumni
    
    sorted_certs = [(cert, count) for cert, count in 
                    sorted(certifications.items(), key=lambda x: x[1], reverse=True) 
                    if count >= min(2, len(alumni_list) // 2)]
    
    sorted_orgs = [(org, count) for org, count in 
                   sorted(organizations.items(), key=lambda x: x[1], reverse=True)
                   if count >= min(2, len(alumni_list) // 2)]
    
    sorted_projects = [(proj, count) for proj, count in 
                       sorted(projects.items(), key=lambda x: x[1], reverse=True)
                       if count >= min(2, len(alumni_list) // 2)]
    
    return {
        'skills': combined_skills,
        'certifications': sorted_certs,
        'organizations': sorted_orgs,
        'projects': sorted_projects
    }

def get_autocomplete_suggestions(partial_query: str, max_suggestions: int = 5) -> List[str]:
    """Get autocomplete suggestions based on partial query"""
    if not partial_query or len(partial_query) < 2:
        return []
    
    partial_lower = partial_query.lower()
    suggestions = set()
    
    # Extract common terms from alumni data
    for alumni in alumni_data:
        # Check job titles
        job_title = alumni.get('job_title', '').lower()
        if partial_lower in job_title:
            suggestions.add(alumni.get('job_title', ''))
        
        # Check major
        major = alumni.get('major', '').lower()
        if partial_lower in major:
            suggestions.add(alumni.get('major', ''))
        
        # Check skills
        for skill in alumni.get('skills', []):
            if partial_lower in skill.lower():
                suggestions.add(skill)
    
    return sorted(list(suggestions))[:max_suggestions]

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': MODEL_NAME,
        'alumni_count': len(alumni_data) if alumni_data else 0
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    """Get alumni recommendations based on career goal"""
    try:
        data = request.json
        query = data.get('query', '').strip()
        top_n = data.get('top_n', 5)
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        if top_n > 20:
            top_n = 20
        
        logger.info(f"Processing recommendation for query: {query}")
        
        # Get top similar alumni
        top_alumni = get_top_alumni(query, top_n)
        
        # Extract aggregated recommendations
        recommendations = extract_skills_from_alumni(top_alumni)
        
        return jsonify({
            'query': query,
            'top_alumni': top_alumni,
            'recommendations': recommendations,
            'total_alumni_analyzed': len(top_alumni)
        })
        
    except Exception as e:
        logger.error(f"Error in recommend endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/autocomplete', methods=['POST'])
def autocomplete():
    """Get autocomplete suggestions"""
    try:
        data = request.json
        partial_query = data.get('query', '').strip()
        max_suggestions = data.get('max_suggestions', 5)
        
        if not partial_query:
            return jsonify({'suggestions': []})
        
        suggestions = get_autocomplete_suggestions(partial_query, max_suggestions)
        
        return jsonify({'suggestions': suggestions})
        
    except Exception as e:
        logger.error(f"Error in autocomplete endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/alumni-stats', methods=['GET'])
def alumni_stats():
    """Get statistics about alumni data"""
    try:
        if not alumni_data:
            return jsonify({'error': 'Alumni data not loaded'}), 500
        
        # Aggregate statistics
        all_skills = set()
        all_certs = set()
        all_orgs = set()
        majors = {}
        job_titles = {}
        
        for alumni in alumni_data:
            all_skills.update(alumni.get('skills', []))
            all_certs.update(alumni.get('certifications', []))
            all_orgs.update(alumni.get('organizations', []))
            
            major = alumni.get('major', 'Unknown')
            majors[major] = majors.get(major, 0) + 1
            
            job_title = alumni.get('job_title', 'Unknown')
            job_titles[job_title] = job_titles.get(job_title, 0) + 1
        
        return jsonify({
            'total_alumni': len(alumni_data),
            'unique_skills': len(all_skills),
            'unique_certifications': len(all_certs),
            'unique_organizations': len(all_orgs),
            'majors': dict(sorted(majors.items(), key=lambda x: x[1], reverse=True)[:10]),
            'top_job_titles': dict(sorted(job_titles.items(), key=lambda x: x[1], reverse=True)[:10])
        })
        
    except Exception as e:
        logger.error(f"Error in alumni-stats endpoint: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load data on startup
    if load_data():
        logger.info("Starting AI Recommendation Service...")
        app.run(host='0.0.0.0', port=5001, debug=False)
    else:
        logger.error("Failed to load alumni data. Service not started.")
