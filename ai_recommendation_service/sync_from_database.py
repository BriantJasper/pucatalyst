import mysql.connector
import numpy as np
import pickle
import json
from sentence_transformers import SentenceTransformer
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USERNAME', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_DATABASE', 'pucatalyst')
}

def create_alumni_description(alumni):
    """Create a comprehensive text description of an alumni for embedding"""
    description = f"{alumni['job_title']} at {alumni.get('current_company', 'Unknown Company')}. "
    
    if alumni.get('skills'):
        skills = ', '.join(alumni['skills'][:10])  # Limit to 10 skills
        description += f"Skills: {skills}. "
    
    if alumni.get('certifications'):
        certs = ', '.join(alumni['certifications'][:5])  # Limit to 5 certs
        description += f"Certifications: {certs}. "
    
    if alumni.get('organizations'):
        orgs = ', '.join(alumni['organizations'][:5])
        description += f"Organizations: {orgs}. "
    
    if alumni.get('career_description'):
        description += f"{alumni['career_description']} "
    
    return description

def fetch_alumni_from_database():
    """Fetch all verified alumni from MySQL database"""
    print("Connecting to MySQL database...")
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # Fetch verified alumni with their user data
        query = """
            SELECT 
                u.name,
                a.current_position as job_title,
                a.current_company,
                a.career_path as major,
                a.skills_developed,
                a.certificates_earned,
                a.organizations_joined,
                a.internships,
                a.career_description,
                a.linkedin_url
            FROM alumni a
            JOIN users u ON a.user_id = u.id
            WHERE a.verification_status = 1
            AND a.deleted_at IS NULL
        """
        
        cursor.execute(query)
        alumni_records = cursor.fetchall()
        
        print(f"Fetched {len(alumni_records)} verified alumni from database")
        
        # Process alumni data
        alumni_data = []
        for record in alumni_records:
            # Parse JSON fields
            skills = json.loads(record['skills_developed']) if record['skills_developed'] else []
            certs = json.loads(record['certificates_earned']) if record['certificates_earned'] else []
            orgs = json.loads(record['organizations_joined']) if record['organizations_joined'] else []
            internships = json.loads(record['internships']) if record['internships'] else []
            
            # Extract project types from job title and internships
            projects = []
            job_title = record['job_title'] or ''
            
            # Map job titles to project types
            if 'mobile' in job_title.lower() or 'app' in job_title.lower():
                projects.extend(['MOBILE APPLICATION', 'APP INTERFACE'])
            if 'web' in job_title.lower() or 'full stack' in job_title.lower():
                projects.extend(['WEB APPLICATION', 'API DEVELOPMENT'])
            if 'data' in job_title.lower() or 'analyst' in job_title.lower():
                projects.extend(['DATA VISUALIZATION', 'PREDICTIVE ANALYTICS'])
            if 'machine learning' in job_title.lower() or 'ai' in job_title.lower():
                projects.extend(['MACHINE LEARNING MODEL', 'NLP PROJECT'])
            if 'ui' in job_title.lower() or 'ux' in job_title.lower() or 'design' in job_title.lower():
                projects.extend(['APP INTERFACE REDESIGN', 'USER EXPERIENCE STUDY'])
            if 'devops' in job_title.lower() or 'cloud' in job_title.lower():
                projects.extend(['AUTOMATION PIPELINE', 'CLOUD MIGRATION'])
            if 'backend' in job_title.lower():
                projects.extend(['API DEVELOPMENT', 'MICROSERVICES ARCHITECTURE'])
            if 'frontend' in job_title.lower():
                projects.extend(['WEB APPLICATION', 'APP INTERFACE'])
            
            alumni = {
                'name': record['name'],
                'job_title': record['job_title'] or 'Unknown',
                'current_company': record['current_company'] or 'Unknown',
                'major': record['major'] or 'Unknown',
                'skills': skills,
                'certifications': certs,
                'organizations': orgs,
                'projects': list(set(projects)),  # Remove duplicates
                'career_description': record['career_description'],
                'linkedin_url': record['linkedin_url']
            }
            alumni_data.append(alumni)
        
        cursor.close()
        conn.close()
        
        return alumni_data
        
    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        return []
    except Exception as e:
        print(f"Error: {e}")
        return []

def generate_embeddings(alumni_data):
    """Generate SBERT embeddings for alumni data"""
    print("\nLoading SBERT model...")
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    print("Generating embeddings...")
    descriptions = [create_alumni_description(alumni) for alumni in alumni_data]
    embeddings = model.encode(descriptions, show_progress_bar=True)
    
    return embeddings

def save_data(alumni_data, embeddings):
    """Save alumni data and embeddings"""
    base_dir = '../AI-SBERT-PUCATALYST'
    
    # Create directory if not exists
    os.makedirs(base_dir, exist_ok=True)
    
    print("\nSaving alumni data...")
    with open(f'{base_dir}/alumni_data.pkl', 'wb') as f:
        pickle.dump(alumni_data, f)
    
    print("Saving alumni embeddings...")
    np.save(f'{base_dir}/alumni_embeddings.npy', embeddings)
    
    print(f"\n✅ Successfully saved {len(alumni_data)} alumni records!")
    print(f"   - Data saved to: {base_dir}/alumni_data.pkl")
    print(f"   - Embeddings saved to: {base_dir}/alumni_embeddings.npy")
    print(f"   - Embedding shape: {embeddings.shape}")

def main():
    """Main function to sync alumni data from MySQL to SBERT"""
    print("=" * 60)
    print("  Alumni Data Sync - MySQL to SBERT Embeddings")
    print("=" * 60)
    print()
    
    # Step 1: Fetch alumni from database
    alumni_data = fetch_alumni_from_database()
    
    if not alumni_data:
        print("\n⚠️  No alumni data found in database!")
        print("   Please run: php artisan db:seed --class=AlumniSeeder")
        return
    
    # Step 2: Generate embeddings
    embeddings = generate_embeddings(alumni_data)
    
    # Step 3: Save data
    save_data(alumni_data, embeddings)
    
    # Step 4: Display sample
    print("\n📊 Sample Alumni Data:")
    for i, alumni in enumerate(alumni_data[:5]):
        print(f"   {i+1}. {alumni['name']} - {alumni['job_title']} at {alumni['current_company']}")
        print(f"      Skills: {', '.join(alumni['skills'][:5])}...")
        print()
    
    print("=" * 60)
    print("✨ Sync completed! AI Recommendation Service is ready to use.")
    print("=" * 60)

if __name__ == '__main__':
    main()
