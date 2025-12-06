"""
Script to regenerate alumni embeddings using the local SBERT model.
This is necessary when the model dimensions don't match the existing embeddings.
"""
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
import os

# Paths
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'AI-SBERT-PUCATALYST')
LOCAL_MODEL_PATH = os.path.join(BASE_DIR, 'sbert_model')
DATA_PATH = os.path.join(BASE_DIR, 'alumni_data.pkl')
EMBEDDINGS_PATH = os.path.join(BASE_DIR, 'alumni_embeddings.npy')
EMBEDDINGS_BACKUP_PATH = os.path.join(BASE_DIR, 'alumni_embeddings_backup.npy')

def create_alumni_description(alumni):
    """Create a comprehensive text description of an alumni for embedding"""
    description = f"{alumni.get('job_title', 'Unknown')} at {alumni.get('current_company', 'Unknown Company')}. "
    
    if alumni.get('skills'):
        skills = ', '.join(alumni['skills'][:10])
        description += f"Skills: {skills}. "
    
    if alumni.get('certifications'):
        certs = ', '.join(alumni['certifications'][:5])
        description += f"Certifications: {certs}. "
    
    if alumni.get('organizations'):
        orgs = ', '.join(alumni['organizations'][:5])
        description += f"Organizations: {orgs}. "
    
    if alumni.get('career_description'):
        description += f"{alumni['career_description']} "
    
    return description.strip()

def main():
    print("=== Regenerating Alumni Embeddings ===\n")
    
    # Load the model
    print(f"Loading model from: {LOCAL_MODEL_PATH}")
    model = SentenceTransformer(LOCAL_MODEL_PATH)
    
    # Test model dimension
    test_embedding = model.encode("test")
    print(f"Model output dimension: {len(test_embedding)}")
    
    # Load alumni data
    print(f"\nLoading alumni data from: {DATA_PATH}")
    with open(DATA_PATH, 'rb') as f:
        alumni_data = pickle.load(f)
    print(f"Loaded {len(alumni_data)} alumni records")
    
    # Check existing embeddings
    if os.path.exists(EMBEDDINGS_PATH):
        old_embeddings = np.load(EMBEDDINGS_PATH)
        print(f"Existing embeddings shape: {old_embeddings.shape}")
        
        # Backup old embeddings
        np.save(EMBEDDINGS_BACKUP_PATH, old_embeddings)
        print(f"Backed up old embeddings to: {EMBEDDINGS_BACKUP_PATH}")
    
    # Generate descriptions for all alumni
    print("\nGenerating text descriptions for all alumni...")
    descriptions = [create_alumni_description(alumni) for alumni in alumni_data]
    
    # Show sample description
    print(f"\nSample description (first alumni):")
    print(f"  {descriptions[0][:200]}...")
    
    # Generate embeddings
    print(f"\nGenerating embeddings for {len(descriptions)} alumni (this may take a while)...")
    embeddings = model.encode(descriptions, show_progress_bar=True)
    
    print(f"Generated embeddings shape: {embeddings.shape}")
    
    # Save new embeddings
    np.save(EMBEDDINGS_PATH, embeddings)
    print(f"\nSaved new embeddings to: {EMBEDDINGS_PATH}")
    
    # Verify
    loaded = np.load(EMBEDDINGS_PATH)
    print(f"Verification - Loaded embeddings shape: {loaded.shape}")
    
    print("\n=== Done! ===")
    print("You can now restart the AI recommendation service.")

if __name__ == "__main__":
    main()
