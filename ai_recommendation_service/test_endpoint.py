import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
import os
import traceback

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'AI-SBERT-PUCATALYST')
LOCAL_MODEL_PATH = os.path.join(BASE_DIR, 'sbert_model')
EMBEDDINGS_PATH = os.path.join(BASE_DIR, 'alumni_embeddings.npy')
DATA_PATH = os.path.join(BASE_DIR, 'alumni_data.pkl')

print("BASE_DIR:", BASE_DIR)
print("LOCAL_MODEL_PATH:", LOCAL_MODEL_PATH)
print("EMBEDDINGS_PATH:", EMBEDDINGS_PATH)
print("DATA_PATH:", DATA_PATH)

try:
    print("\nLoading model...")
    model = SentenceTransformer(LOCAL_MODEL_PATH)
    print("Model loaded successfully")

    print("\nLoading embeddings...")
    alumni_embeddings = np.load(EMBEDDINGS_PATH)
    print(f"Embeddings shape: {alumni_embeddings.shape}")

    print("\nLoading data...")
    with open(DATA_PATH, 'rb') as f:
        alumni_data = pickle.load(f)
    print(f"Data count: {len(alumni_data)}")

    # Test query
    query = 'software engineer'
    print(f"\nTesting query: '{query}'")
    query_embedding = model.encode(query)
    print(f"Query embedding shape: {query_embedding.shape}")

    # Calculate similarity
    print("\nCalculating similarities...")
    query_norm = query_embedding / np.linalg.norm(query_embedding)
    alumni_norm = alumni_embeddings / np.linalg.norm(alumni_embeddings, axis=1, keepdims=True)
    similarities = np.dot(alumni_norm, query_norm)
    print(f"Similarities calculated, shape: {similarities.shape}")

    top_indices = np.argsort(similarities)[::-1][:5]
    print(f"\nTop 5 results:")
    for idx in top_indices:
        alumni = alumni_data[idx]
        print(f"  {alumni.get('name', 'N/A')}: {similarities[idx]:.4f}")
        print(f"    Job: {alumni.get('job_title', 'N/A')}")
        print(f"    Skills: {alumni.get('skills', [])[:3]}")

    print("\n=== TEST PASSED ===")

except Exception as e:
    print(f"\n=== ERROR ===")
    print(f"Error: {e}")
    traceback.print_exc()
