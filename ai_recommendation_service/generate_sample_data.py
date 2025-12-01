import numpy as np
import pickle
from sentence_transformers import SentenceTransformer

# Sample alumni data based on the screenshot
alumni_data = [
    {
        'name': 'Cahya Sari',
        'job_title': 'Mobile App Developer',
        'major': 'Information Technology',
        'skills': ['CI/CD', 'AWS', 'JavaScript', 'SQL', 'React'],
        'certifications': ['CompTIA A+', 'AWS Certified Cloud Practitioner', 'Google IT Support Professional', 'Certified ScrumMaster (CSM)', 'Google UX Design'],
        'organizations': ['PUFA_COMPUTER_SCIENCE', 'PUMA_INFORMATION_TECHNOLOGY', 'PURTC', 'PUSC', 'AIESEC'],
        'projects': ['APP INTERFACE', 'APP INTERFACE REDESIGN', 'MACHINE LEARNING', 'MACHINE LEARNING MODEL', 'LEARNING MODEL']
    },
    {
        'name': 'Bayu Firdaus',
        'job_title': 'Mobile App Developer',
        'major': 'Information Technology',
        'skills': ['CI/CD', 'AWS', 'JavaScript', 'SQL', 'React'],
        'certifications': ['CompTIA A+', 'AWS Certified Cloud Practitioner', 'Google IT Support Professional'],
        'organizations': ['PUFA_COMPUTER_SCIENCE', 'PUMA_INFORMATION_TECHNOLOGY', 'PURTC'],
        'projects': ['APP INTERFACE', 'MACHINE LEARNING']
    },
    {
        'name': 'Budi Lestari',
        'job_title': 'Mobile App Developer',
        'major': 'Information Technology',
        'skills': ['CI/CD', 'AWS', 'JavaScript', 'SQL', 'React'],
        'certifications': ['AWS Certified Cloud Practitioner', 'Google IT Support Professional', 'Certified ScrumMaster (CSM)'],
        'organizations': ['PUMA_INFORMATION_TECHNOLOGY', 'PURTC', 'PUSC'],
        'projects': ['APP INTERFACE REDESIGN', 'MACHINE LEARNING MODEL']
    },
    {
        'name': 'Hani Ramadhan',
        'job_title': 'Mobile App Developer',
        'major': 'Information Technology',
        'skills': ['CI/CD', 'AWS', 'JavaScript', 'SQL', 'React'],
        'certifications': ['CompTIA A+', 'AWS Certified Cloud Practitioner', 'Google UX Design'],
        'organizations': ['PUFA_COMPUTER_SCIENCE', 'PUMA_INFORMATION_TECHNOLOGY', 'AIESEC'],
        'projects': ['APP INTERFACE', 'LEARNING MODEL']
    },
    {
        'name': 'Rizky Ramadhan',
        'job_title': 'Mobile App Developer',
        'major': 'Information Technology',
        'skills': ['CI/CD', 'AWS', 'JavaScript', 'SQL', 'React'],
        'certifications': ['CompTIA A+', 'AWS Certified Cloud Practitioner', 'Google IT Support Professional', 'Certified ScrumMaster (CSM)'],
        'organizations': ['PUFA_COMPUTER_SCIENCE', 'PUMA_INFORMATION_TECHNOLOGY', 'PURTC', 'PUSC', 'AIESEC'],
        'projects': ['APP INTERFACE', 'MACHINE LEARNING', 'MACHINE LEARNING MODEL']
    },
    # Additional alumni for variety
    {
        'name': 'Siti Nurhaliza',
        'job_title': 'Web Developer',
        'major': 'Computer Science',
        'skills': ['HTML', 'CSS', 'JavaScript', 'PHP', 'Laravel', 'Vue.js', 'MySQL'],
        'certifications': ['AWS Certified Developer', 'Google IT Support Professional', 'Meta Front-End Developer'],
        'organizations': ['PUFA_COMPUTER_SCIENCE', 'PUMA_INFORMATION_TECHNOLOGY', 'PUSC'],
        'projects': ['WEB APPLICATION', 'E-COMMERCE PLATFORM', 'CONTENT MANAGEMENT SYSTEM']
    },
    {
        'name': 'Ahmad Zaki',
        'job_title': 'Data Scientist',
        'major': 'Information Technology',
        'skills': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Data Analysis'],
        'certifications': ['AWS Machine Learning Specialty', 'Google Data Analytics', 'IBM Data Science Professional'],
        'organizations': ['PUFA_COMPUTER_SCIENCE', 'AI Research Club', 'PUMA_INFORMATION_TECHNOLOGY'],
        'projects': ['MACHINE LEARNING MODEL', 'PREDICTIVE ANALYTICS', 'COMPUTER VISION', 'NLP PROJECT']
    },
    {
        'name': 'Dewi Lestari',
        'job_title': 'UI/UX Designer',
        'major': 'Information Technology',
        'skills': ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Wireframing', 'Prototyping'],
        'certifications': ['Google UX Design', 'Adobe Certified Professional', 'Interaction Design Foundation'],
        'organizations': ['PUSC', 'PURTC', 'Design Community'],
        'projects': ['APP INTERFACE', 'APP INTERFACE REDESIGN', 'WEB REDESIGN', 'USER EXPERIENCE STUDY']
    },
    {
        'name': 'Rudi Hartono',
        'job_title': 'Full Stack Developer',
        'major': 'Computer Science',
        'skills': ['JavaScript', 'React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
        'certifications': ['AWS Solutions Architect', 'MongoDB Certified Developer', 'Docker Certified Associate'],
        'organizations': ['PUFA_COMPUTER_SCIENCE', 'PUMA_INFORMATION_TECHNOLOGY', 'AIESEC'],
        'projects': ['WEB APPLICATION', 'API DEVELOPMENT', 'MICROSERVICES ARCHITECTURE', 'CLOUD DEPLOYMENT']
    },
    {
        'name': 'Putri Maharani',
        'job_title': 'DevOps Engineer',
        'major': 'Information Technology',
        'skills': ['CI/CD', 'Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Linux', 'Python', 'Terraform'],
        'certifications': ['AWS DevOps Engineer', 'Kubernetes Administrator', 'Certified Jenkins Engineer'],
        'organizations': ['PUFA_COMPUTER_SCIENCE', 'PUMA_INFORMATION_TECHNOLOGY', 'Cloud Computing Club'],
        'projects': ['AUTOMATION PIPELINE', 'INFRASTRUCTURE AS CODE', 'CONTAINER ORCHESTRATION', 'CLOUD MIGRATION']
    }
]

# Create text descriptions for embedding
def create_alumni_description(alumni):
    """Create a comprehensive text description of an alumni for embedding"""
    description = f"{alumni['job_title']} with major in {alumni['major']}. "
    description += f"Skills: {', '.join(alumni['skills'])}. "
    description += f"Certifications: {', '.join(alumni['certifications'])}. "
    description += f"Organizations: {', '.join(alumni['organizations'])}. "
    description += f"Projects: {', '.join(alumni['projects'])}."
    return description

# Load SBERT model
print("Loading SBERT model...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Generate embeddings
print("Generating embeddings for alumni data...")
descriptions = [create_alumni_description(alumni) for alumni in alumni_data]
embeddings = model.encode(descriptions)

# Save data
print("Saving alumni data...")
with open('../AI-SBERT-PUCATALYST/alumni_data.pkl', 'wb') as f:
    pickle.dump(alumni_data, f)

print("Saving alumni embeddings...")
np.save('../AI-SBERT-PUCATALYST/alumni_embeddings.npy', embeddings)

print(f"\nSuccessfully created data for {len(alumni_data)} alumni!")
print(f"Embedding shape: {embeddings.shape}")
print("\nSample alumni:")
for i, alumni in enumerate(alumni_data[:3]):
    print(f"{i+1}. {alumni['name']} - {alumni['job_title']}")
