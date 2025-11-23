<?php

namespace Database\Seeders;

use App\Models\Certificate;
use Illuminate\Database\Seeder;

class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        $certificates = [
            // Web Development
            [
                'name' => 'AWS Certified Solutions Architect',
                'description' => 'Demonstrates expertise in designing distributed systems and deploying applications on AWS cloud platform.',
                'provider' => 'Amazon Web Services',
                'url' => 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
                'duration_hours' => 40,
                'cost' => 150.00,
                'difficulty_level' => 'Intermediate',
                'skills_covered' => ['AWS', 'Cloud Architecture', 'EC2', 'S3', 'Lambda', 'VPC'],
                'career_paths' => ['Cloud Engineer', 'Solutions Architect', 'DevOps Engineer'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 150.00
            ],
            [
                'name' => 'Google Cloud Professional Cloud Architect',
                'description' => 'Validates ability to design, develop, and manage robust, secure, scalable cloud solutions on Google Cloud.',
                'provider' => 'Google Cloud',
                'url' => 'https://cloud.google.com/certification/cloud-architect',
                'duration_hours' => 50,
                'cost' => 200.00,
                'difficulty_level' => 'Advanced',
                'skills_covered' => ['GCP', 'Cloud Architecture', 'Kubernetes', 'BigQuery', 'Cloud Functions'],
                'career_paths' => ['Cloud Architect', 'DevOps Engineer', 'Data Engineer'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 200.00
            ],
            [
                'name' => 'Meta Front-End Developer Professional',
                'description' => 'Build responsive websites and interactive web applications using React, HTML, CSS, and JavaScript.',
                'provider' => 'Meta (Coursera)',
                'url' => 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
                'duration_hours' => 120,
                'cost' => 49.00,
                'difficulty_level' => 'Beginner',
                'skills_covered' => ['React', 'JavaScript', 'HTML/CSS', 'Git', 'Figma', 'Bootstrap'],
                'career_paths' => ['Front-End Developer', 'Web Developer', 'UI Developer'],
                'is_free' => true,
                'has_exam' => true,
                'exam_cost' => 0.00
            ],
            [
                'name' => 'Microsoft Certified: Azure Developer Associate',
                'description' => 'Demonstrates proficiency in designing, building, testing, and maintaining cloud applications on Microsoft Azure.',
                'provider' => 'Microsoft',
                'url' => 'https://learn.microsoft.com/en-us/certifications/azure-developer/',
                'duration_hours' => 35,
                'cost' => 165.00,
                'difficulty_level' => 'Intermediate',
                'skills_covered' => ['Azure', 'C#', '.NET', 'Docker', 'Azure Functions', 'Cosmos DB'],
                'career_paths' => ['Cloud Developer', 'Full-Stack Developer', 'DevOps Engineer'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 165.00
            ],

            // Data Science & AI
            [
                'name' => 'IBM Data Science Professional Certificate',
                'description' => 'Master data science tools including Python, SQL, data visualization, and machine learning.',
                'provider' => 'IBM (Coursera)',
                'url' => 'https://www.coursera.org/professional-certificates/ibm-data-science',
                'duration_hours' => 150,
                'cost' => 39.00,
                'difficulty_level' => 'Beginner',
                'skills_covered' => ['Python', 'SQL', 'Data Visualization', 'Machine Learning', 'Pandas', 'NumPy'],
                'career_paths' => ['Data Scientist', 'Data Analyst', 'ML Engineer'],
                'is_free' => true,
                'has_exam' => true,
                'exam_cost' => 0.00
            ],
            [
                'name' => 'TensorFlow Developer Certificate',
                'description' => 'Validates skills in building and training neural network models using TensorFlow.',
                'provider' => 'Google (TensorFlow)',
                'url' => 'https://www.tensorflow.org/certificate',
                'duration_hours' => 60,
                'cost' => 100.00,
                'difficulty_level' => 'Intermediate',
                'skills_covered' => ['TensorFlow', 'Deep Learning', 'CNN', 'NLP', 'Time Series'],
                'career_paths' => ['ML Engineer', 'AI Engineer', 'Data Scientist'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 100.00
            ],
            [
                'name' => 'Microsoft Certified: Azure AI Engineer Associate',
                'description' => 'Design and implement AI solutions using Azure Cognitive Services and ML services.',
                'provider' => 'Microsoft',
                'url' => 'https://learn.microsoft.com/en-us/certifications/azure-ai-engineer/',
                'duration_hours' => 40,
                'cost' => 165.00,
                'difficulty_level' => 'Advanced',
                'skills_covered' => ['Azure AI', 'Computer Vision', 'NLP', 'Azure ML', 'Cognitive Services'],
                'career_paths' => ['AI Engineer', 'ML Engineer', 'Data Scientist'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 165.00
            ],

            // Cybersecurity
            [
                'name' => 'CompTIA Security+',
                'description' => 'Entry-level cybersecurity certification covering security concepts, tools, and procedures.',
                'provider' => 'CompTIA',
                'url' => 'https://www.comptia.org/certifications/security',
                'duration_hours' => 45,
                'cost' => 370.00,
                'difficulty_level' => 'Beginner',
                'skills_covered' => ['Network Security', 'Cryptography', 'Risk Management', 'Incident Response'],
                'career_paths' => ['Security Analyst', 'Network Administrator', 'Security Engineer'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 370.00
            ],
            [
                'name' => 'Certified Ethical Hacker (CEH)',
                'description' => 'Learn ethical hacking techniques to identify and fix security vulnerabilities.',
                'provider' => 'EC-Council',
                'url' => 'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/',
                'duration_hours' => 80,
                'cost' => 1199.00,
                'difficulty_level' => 'Advanced',
                'skills_covered' => ['Penetration Testing', 'Ethical Hacking', 'Vulnerability Assessment', 'Security Tools'],
                'career_paths' => ['Ethical Hacker', 'Penetration Tester', 'Security Consultant'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 950.00
            ],
            [
                'name' => 'Google Cybersecurity Professional Certificate',
                'description' => 'Learn in-demand cybersecurity skills to protect networks and data.',
                'provider' => 'Google (Coursera)',
                'url' => 'https://www.coursera.org/professional-certificates/google-cybersecurity',
                'duration_hours' => 100,
                'cost' => 49.00,
                'difficulty_level' => 'Beginner',
                'skills_covered' => ['Security Operations', 'SIEM Tools', 'Python', 'Linux', 'Incident Response'],
                'career_paths' => ['Cybersecurity Analyst', 'SOC Analyst', 'Security Engineer'],
                'is_free' => true,
                'has_exam' => true,
                'exam_cost' => 0.00
            ],

            // Project Management
            [
                'name' => 'Project Management Professional (PMP)',
                'description' => 'Globally recognized project management certification demonstrating leadership skills.',
                'provider' => 'PMI',
                'url' => 'https://www.pmi.org/certifications/project-management-pmp',
                'duration_hours' => 35,
                'cost' => 555.00,
                'difficulty_level' => 'Advanced',
                'skills_covered' => ['Project Management', 'Agile', 'Scrum', 'Risk Management', 'Stakeholder Management'],
                'career_paths' => ['Project Manager', 'Program Manager', 'Product Manager'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 555.00
            ],
            [
                'name' => 'Google Project Management Professional Certificate',
                'description' => 'Learn project management fundamentals and agile methodologies.',
                'provider' => 'Google (Coursera)',
                'url' => 'https://www.coursera.org/professional-certificates/google-project-management',
                'duration_hours' => 90,
                'cost' => 49.00,
                'difficulty_level' => 'Beginner',
                'skills_covered' => ['Project Planning', 'Agile', 'Scrum', 'Risk Management', 'Communication'],
                'career_paths' => ['Project Coordinator', 'Project Manager', 'Scrum Master'],
                'is_free' => true,
                'has_exam' => true,
                'exam_cost' => 0.00
            ],

            // UX/UI Design
            [
                'name' => 'Google UX Design Professional Certificate',
                'description' => 'Learn user experience design fundamentals and create professional UX portfolios.',
                'provider' => 'Google (Coursera)',
                'url' => 'https://www.coursera.org/professional-certificates/google-ux-design',
                'duration_hours' => 120,
                'cost' => 49.00,
                'difficulty_level' => 'Beginner',
                'skills_covered' => ['UX Research', 'Wireframing', 'Prototyping', 'Figma', 'User Testing'],
                'career_paths' => ['UX Designer', 'UI Designer', 'Product Designer'],
                'is_free' => true,
                'has_exam' => true,
                'exam_cost' => 0.00
            ],
            [
                'name' => 'Adobe Certified Professional in UX Design',
                'description' => 'Demonstrates proficiency in Adobe XD and UX design principles.',
                'provider' => 'Adobe',
                'url' => 'https://www.adobe.com/training/certification.html',
                'duration_hours' => 30,
                'cost' => 180.00,
                'difficulty_level' => 'Intermediate',
                'skills_covered' => ['Adobe XD', 'Prototyping', 'UI Design', 'Design Systems', 'User Research'],
                'career_paths' => ['UX Designer', 'UI Designer', 'Interaction Designer'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 180.00
            ],

            // Business & Analytics
            [
                'name' => 'Google Data Analytics Professional Certificate',
                'description' => 'Develop job-ready skills in data cleaning, analysis, and visualization.',
                'provider' => 'Google (Coursera)',
                'url' => 'https://www.coursera.org/professional-certificates/google-data-analytics',
                'duration_hours' => 110,
                'cost' => 49.00,
                'difficulty_level' => 'Beginner',
                'skills_covered' => ['SQL', 'R', 'Tableau', 'Data Cleaning', 'Data Visualization'],
                'career_paths' => ['Data Analyst', 'Business Analyst', 'BI Analyst'],
                'is_free' => true,
                'has_exam' => true,
                'exam_cost' => 0.00
            ],
            [
                'name' => 'Tableau Desktop Specialist',
                'description' => 'Validates foundational skills in Tableau for data visualization and analysis.',
                'provider' => 'Tableau',
                'url' => 'https://www.tableau.com/learn/certification/desktop-specialist',
                'duration_hours' => 20,
                'cost' => 100.00,
                'difficulty_level' => 'Beginner',
                'skills_covered' => ['Tableau', 'Data Visualization', 'Dashboard Design', 'Data Analysis'],
                'career_paths' => ['Data Analyst', 'BI Developer', 'Data Visualization Specialist'],
                'is_free' => false,
                'has_exam' => true,
                'exam_cost' => 100.00
            ],
        ];

        foreach ($certificates as $certificate) {
            Certificate::create($certificate);
        }
    }
}
