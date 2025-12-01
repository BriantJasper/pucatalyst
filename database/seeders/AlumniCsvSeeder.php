<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AlumniCsvSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting CSV Alumni Import...');
        
        // Path to CSV file
        $csvPath = base_path('AI-SBERT-PUCATALYST/synthetic_alumni_data_final_v2_balanced (1).csv');
        
        if (!file_exists($csvPath)) {
            $this->command->error("CSV file not found at: {$csvPath}");
            return;
        }

        // Read CSV using native PHP
        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->command->error("Failed to open CSV file");
            return;
        }
        
        // Get headers
        $headers = fgetcsv($handle);
        
        // Read all records
        $records = [];
        while (($data = fgetcsv($handle)) !== false) {
            $records[] = array_combine($headers, $data);
        }
        fclose($handle);
        
        $totalRecords = count($records);
        
        $this->command->info("Found {$totalRecords} alumni records in CSV");
        
        $batchSize = 100;
        $batches = array_chunk($records, $batchSize);
        $processed = 0;
        
        foreach ($batches as $batchIndex => $batch) {
            foreach ($batch as $record) {
                $email = $this->generateEmail($record['Nama'], $record['ID']);

                // Skip if user already exists (idempotent)
                $existingUser = DB::table('users')->where('email', $email)->first();
                if ($existingUser) {
                    // Ensure alumni record exists; if not create it
                    $existingAlumni = DB::table('alumni')->where('user_id', $existingUser->id)->first();
                    if (!$existingAlumni) {
                        $this->insertAlumni($existingUser->id, $record);
                        $processed++;
                    }
                    continue;
                }

                // Create user
                $userId = DB::table('users')->insertGetId([
                    'name' => $record['Nama'],
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'role' => 'alumni',
                    'email_verified' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Create alumni record
                $this->insertAlumni($userId, $record);
                $processed++;
            }

            $progress = round(($processed / $totalRecords) * 100, 1);
            $this->command->info("Progress: {$processed}/{$totalRecords} ({$progress}%)");
        }
        
        $this->command->info("✅ Successfully imported {$processed} alumni from CSV!");
    }
    
    private function generateEmail(string $name, string $id): string
    {
        $slug = strtolower(str_replace(' ', '.', $name));
        $slug = preg_replace('/[^a-z0-9.]/', '', $slug);
        return "{$slug}.{$id}@alumni.uc.ac.id";
    }
    
    private function generateLinkedInUrl(string $name): string
    {
        $slug = strtolower(str_replace(' ', '-', $name));
        $slug = preg_replace('/[^a-z0-9-]/', '', $slug);
        return "https://linkedin.com/in/{$slug}";
    }
    
    private function parseSkills(string $skillsStr): array
    {
        if (empty($skillsStr)) {
            return [];
        }
        
        // Split by comma and clean up
        $skills = array_map('trim', explode(',', $skillsStr));
        
        // Remove empty entries
        return array_filter($skills, function($skill) {
            return !empty($skill);
        });
    }
    
    private function parseCertificates(string $certsStr): array
    {
        if (empty($certsStr)) {
            return [];
        }
        
        // Split by comma and clean up
        $certs = array_map('trim', explode(',', $certsStr));
        
        // Remove empty entries
        return array_filter($certs, function($cert) {
            return !empty($cert);
        });
    }
    
    private function parseOrganizations(string $orgsStr): array
    {
        if (empty($orgsStr)) {
            return [];
        }
        
        // Split by | or comma and clean up
        $orgs = preg_split('/[|,]/', $orgsStr);
        $orgs = array_map('trim', $orgs);
        
        // Remove empty entries
        return array_filter($orgs, function($org) {
            return !empty($org);
        });
    }
    
    private function parseProjects(string $projectStr): array
    {
        if (empty($projectStr)) {
            return [];
        }
        
        // Split by comma and clean up
        $projects = array_map('trim', explode(',', $projectStr));
        
        // Remove empty entries
        return array_filter($projects, function($project) {
            return !empty($project);
        });
    }

    private function insertAlumni(int $userId, array $record): void
    {
        $skills = $this->parseSkills($record['Skills']);
        $certificates = $this->parseCertificates($record['Certificates']);
        $organizations = $this->parseOrganizations($record['Organisasi']);
        // Projects parsed but alumni table has no column; could be incorporated later.

        DB::table('alumni')->insert([
            'user_id' => $userId,
            'alumni_id' => 'ALU' . $record['ID'],
            'current_position' => $record['Pekerjaan Saat Ini'],
            'current_company' => $record['Perusahaan'],
            'career_path' => $record['Jurusan'],
            'skills_developed' => json_encode($skills),
            'certificates_earned' => json_encode($certificates),
            'organizations_joined' => json_encode($organizations),
            'internships' => json_encode([]),
            'career_description' => $record['combined_features'] ?? '',
            'linkedin_url' => $this->generateLinkedInUrl($record['Nama']),
            'verification_status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
