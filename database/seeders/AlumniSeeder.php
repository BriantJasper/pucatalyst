<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class AlumniSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // Job titles and career paths
        $jobTitles = [
            'Mobile App Developer',
            'Web Developer',
            'Full Stack Developer',
            'Frontend Developer',
            'Backend Developer',
            'Data Scientist',
            'Machine Learning Engineer',
            'Data Analyst',
            'UI/UX Designer',
            'Product Designer',
            'DevOps Engineer',
            'Cloud Engineer',
            'Software Engineer',
            'Quality Assurance Engineer',
            'Business Analyst',
            'Product Manager',
            'Cybersecurity Analyst',
            'Database Administrator',
            'System Administrator',
            'Network Engineer',
        ];

        $companies = [
            'Gojek', 'Tokopedia', 'Bukalapak', 'Traveloka', 'Grab',
            'Shopee', 'OVO', 'Dana', 'LinkAja', 'Blibli',
            'Google Indonesia', 'Microsoft Indonesia', 'Amazon Web Services',
            'Meta (Facebook)', 'Apple', 'Telkom Indonesia', 'Bank Mandiri',
            'Bank BCA', 'Bank BRI', 'Pertamina', 'PLN', 'Garuda Indonesia',
            'GoTo Financial', 'Sea Group', 'Kredivo', 'Akulaku',
            'Salesforce', 'Adobe', 'Netflix', 'Spotify', 'Airbnb',
            'Uber', 'Twitter', 'LinkedIn', 'IBM', 'Oracle',
            'SAP', 'Cisco', 'Intel', 'Samsung', 'LG Electronics'
        ];

        $majors = [
            'Information Technology',
            'Computer Science',
            'Software Engineering',
            'Information Systems',
            'Data Science',
        ];

        // Skills pool
        $technicalSkills = [
            'Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
            'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask', 'Laravel', 'Spring Boot',
            'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'SASS', 'LESS',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle',
            'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI/CD', 'GitHub Actions',
            'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
            'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI', 'Excel',
            'Git', 'Linux', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum',
            'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
            'SQL', 'NoSQL', 'Firebase', 'Supabase', 'CI/CD', 'Testing', 'Jest', 'Selenium'
        ];

        $softSkills = [
            'Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Critical Thinking',
            'Time Management', 'Adaptability', 'Creativity', 'Collaboration', 'Project Management'
        ];

        // Certifications
        $certifications = [
            'CompTIA A+', 'CompTIA Network+', 'CompTIA Security+',
            'AWS Certified Solutions Architect', 'AWS Certified Developer', 'AWS Certified DevOps Engineer', 'AWS Machine Learning Specialty',
            'Google Cloud Professional', 'Google IT Support Professional', 'Google Data Analytics', 'Google UX Design',
            'Microsoft Azure Fundamentals', 'Microsoft Azure Administrator', 'Azure Data Engineer',
            'Certified ScrumMaster (CSM)', 'Professional Scrum Master (PSM)',
            'Meta Front-End Developer', 'Meta Back-End Developer',
            'IBM Data Science Professional', 'IBM Full Stack Cloud Developer',
            'Oracle Certified Professional', 'Cisco CCNA', 'CISSP',
            'Kubernetes Administrator (CKA)', 'Docker Certified Associate',
            'Salesforce Administrator', 'SAP Certified'
        ];

        // Organizations
        $organizations = [
            'PUFA_COMPUTER_SCIENCE',
            'PUMA_INFORMATION_TECHNOLOGY',
            'PURTC',
            'PUSC',
            'AIESEC',
            'Google Developer Student Clubs (GDSC)',
            'Microsoft Learn Student Ambassador',
            'AI Research Club',
            'Data Science Community',
            'Design Community',
            'Cyber Security Club',
            'Robotics Club',
            'Game Development Club',
            'Mobile Development Community',
            'Web Development Community'
        ];

        // Project types
        $projectTypes = [
            'WEB APPLICATION',
            'MOBILE APPLICATION',
            'E-COMMERCE PLATFORM',
            'CONTENT MANAGEMENT SYSTEM',
            'API DEVELOPMENT',
            'MACHINE LEARNING MODEL',
            'PREDICTIVE ANALYTICS',
            'COMPUTER VISION',
            'NLP PROJECT',
            'DATA VISUALIZATION',
            'APP INTERFACE',
            'APP INTERFACE REDESIGN',
            'WEB REDESIGN',
            'USER EXPERIENCE STUDY',
            'AUTOMATION PIPELINE',
            'INFRASTRUCTURE AS CODE',
            'CONTAINER ORCHESTRATION',
            'CLOUD MIGRATION',
            'MICROSERVICES ARCHITECTURE',
            'REAL-TIME CHAT APPLICATION',
            'IoT SYSTEM',
            'BLOCKCHAIN PROJECT',
            'LEARNING MANAGEMENT SYSTEM'
        ];

        echo "Generating 2000 random alumni...\n";
        echo "This may take a few minutes...\n\n";

        for ($i = 0; $i < 2000; $i++) {
            // Create user first
            $firstName = $faker->firstName();
            $lastName = $faker->lastName();
            $email = strtolower($firstName . '.' . $lastName . '.' . ($i + 1) . '@alumni.president.ac.id');

            $userId = DB::table('users')->insertGetId([
                'name' => $firstName . ' ' . $lastName,
                'email' => $email,
                'password' => Hash::make('password123'),
                'role' => 'alumni',
                'email_verified' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Random job selection
            $jobTitle = $faker->randomElement($jobTitles);
            $company = $faker->randomElement($companies);
            $major = $faker->randomElement($majors);

            // Select random skills (5-10 technical + 3-5 soft skills)
            $numTechnicalSkills = $faker->numberBetween(5, 10);
            $numSoftSkills = $faker->numberBetween(3, 5);
            $selectedSkills = array_merge(
                $faker->randomElements($technicalSkills, $numTechnicalSkills),
                $faker->randomElements($softSkills, $numSoftSkills)
            );

            // Select random certifications (2-5)
            $numCerts = $faker->numberBetween(2, 5);
            $selectedCerts = $faker->randomElements($certifications, $numCerts);

            // Select random organizations (2-5)
            $numOrgs = $faker->numberBetween(2, 5);
            $selectedOrgs = $faker->randomElements($organizations, $numOrgs);

            // Select random project types (2-5)
            $numProjects = $faker->numberBetween(2, 5);
            $selectedProjects = $faker->randomElements($projectTypes, $numProjects);

            // Create internships history (1-3 internships)
            $numInternships = $faker->numberBetween(1, 3);
            $internships = [];
            for ($j = 0; $j < $numInternships; $j++) {
                $internships[] = [
                    'company' => $faker->randomElement($companies),
                    'position' => $faker->randomElement(['Intern', 'Junior Developer', 'Trainee']),
                    'duration' => $faker->randomElement(['3 months', '6 months', '1 year']),
                    'year' => $faker->numberBetween(2020, 2024)
                ];
            }

            // Career description
            $careerDescriptions = [
                "Started as an intern and worked my way up to become a {$jobTitle}. Passionate about building scalable solutions.",
                "Transitioned from {$major} to professional {$jobTitle} through continuous learning and hands-on projects.",
                "Currently working at {$company} as {$jobTitle}, focusing on innovation and best practices.",
                "Experienced {$jobTitle} with expertise in modern technologies and agile methodologies.",
                "Building impactful products as {$jobTitle}, leveraging cutting-edge technology stack."
            ];

            // Advice for juniors
            $adviceList = [
                "Focus on building a strong foundation in programming fundamentals before diving into frameworks.",
                "Work on real-world projects and contribute to open source to gain practical experience.",
                "Network with professionals in your field and seek mentorship opportunities.",
                "Stay updated with the latest technologies but master the basics first.",
                "Build a portfolio showcasing your best work and be active on LinkedIn and GitHub.",
                "Don't be afraid to fail - every mistake is a learning opportunity.",
                "Soft skills are just as important as technical skills for career growth.",
                "Join communities, attend meetups, and participate in hackathons.",
                "Learn to communicate your ideas effectively, both in writing and verbally.",
                "Be curious, keep learning, and never stop exploring new technologies."
            ];

            // Insert alumni data
            $alumniId = 'ALM-' . str_pad($userId, 6, '0', STR_PAD_LEFT);
            
            DB::table('alumni')->insert([
                'user_id' => $userId,
                'alumni_id' => $alumniId,
                'current_company' => $company,
                'current_position' => $jobTitle,
                'career_path' => $jobTitle,
                'career_description' => $faker->randomElement($careerDescriptions),
                'linkedin_url' => 'https://linkedin.com/in/' . strtolower(str_replace(' ', '-', $firstName . '-' . $lastName)),
                'organizations_joined' => json_encode($selectedOrgs),
                'certificates_earned' => json_encode($selectedCerts),
                'internships' => json_encode($internships),
                'skills_developed' => json_encode($selectedSkills),
                'advice_for_juniors' => $faker->randomElement($adviceList),
                'verification_status' => 1, // All verified
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (($i + 1) % 100 === 0) {
                echo "✓ Created " . ($i + 1) . " alumni...\n";
            }
        }

        echo "\n✅ Successfully generated 2000 alumni with complete data!\n";
    }
}
