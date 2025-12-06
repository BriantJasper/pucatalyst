<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Roadmap;

class DashboardController extends Controller
{
    /**
     * Get dashboard data for the current authenticated student.
     */
    public function getDashboardData(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get student profile
        $student = Student::where('user_id', $user->id)
            ->with(['organizations', 'certificates', 'skills', 'roadmap'])
            ->first();

        if (!$student) {
            // Return default data for users without a student profile
            return response()->json([
                'user' => $this->formatUserData($user, null, null),
                'skills' => [],
                'certifications' => [],
                'organizations' => [],
                'projects' => [],
                'courses' => [],
            ]);
        }

        $roadmap = $student->roadmap;

        return response()->json([
            'user' => $this->formatUserData($user, $student, $roadmap),
            'skills' => $this->formatSkills($roadmap),
            'certifications' => $this->formatCertifications($roadmap),
            'organizations' => $this->formatOrganizations($roadmap),
            'projects' => $this->formatProjects($roadmap),
            'courses' => $this->formatCourses($roadmap),
        ]);
    }

    /**
     * Format user data for the dashboard hero section.
     */
    private function formatUserData($user, $student, $roadmap)
    {
        $yearLabels = [
            1 => 'Freshman',
            2 => 'Sophomore',
            3 => 'Junior',
            4 => 'Senior',
        ];

        return [
            'name' => $user->name,
            'avatar' => $user->avatar ?? null,
            'careerGoal' => $roadmap->career_goal ?? $student?->career_goal ?? 'Not Set',
            'major' => $student?->major ?? 'Undeclared',
            'year' => $yearLabels[$student?->year] ?? 'Student',
            'completionPercentage' => $roadmap->completion_percentage ?? 0,
        ];
    }

    /**
     * Format skills data from the roadmap.
     */
    private function formatSkills($roadmap)
    {
        if (!$roadmap || !$roadmap->skills_to_learn) {
            return [];
        }

        $skills = [];
        $iconMap = ['Code', 'Braces', 'Atom', 'Server', 'Database', 'Network', 'Cloud', 'Lock'];
        $levels = ['beginner', 'intermediate', 'advanced', 'expert'];

        // Get skill progress tracking data
        $skillProgress = $roadmap->skill_progress ?? [];

        foreach ($roadmap->skills_to_learn as $index => $skill) {
            // Handle both string and array formats from AI response
            $name = is_array($skill) ? ($skill[0] ?? $skill['name'] ?? 'Unknown Skill') : $skill;

            // Get status from skill_progress, default to in-progress for first, upcoming for rest
            $status = 'upcoming';
            if (isset($skillProgress[$name])) {
                $status = $skillProgress[$name];
            } elseif ($index === 0) {
                $status = 'in-progress';
            }

            $skills[] = [
                'id' => (string) ($index + 1),
                'name' => $name,
                'level' => $levels[min($index, 3)], // Vary levels based on position
                'status' => $status,
                'description' => "Learn and master {$name} skills",
                'icon' => $iconMap[$index % count($iconMap)],
            ];
        }

        return $skills;
    }

    /**
     * Format certifications data from the roadmap.
     */
    private function formatCertifications($roadmap)
    {
        if (!$roadmap || !$roadmap->certificates_to_earn) {
            return [];
        }

        $certifications = [];
        $iconMap = ['Cloud', 'Layout', 'Palette', 'Database', 'Award'];
        $difficulties = ['beginner', 'intermediate', 'advanced'];

        // Get cert progress tracking data
        $certProgress = $roadmap->cert_progress ?? [];

        foreach ($roadmap->certificates_to_earn as $index => $cert) {
            $name = is_array($cert) ? ($cert[0] ?? $cert['name'] ?? 'Unknown Certificate') : $cert;

            // Get status from cert_progress, default to in-progress for first, upcoming for rest
            $status = 'upcoming';
            if (isset($certProgress[$name])) {
                $status = $certProgress[$name];
            } elseif ($index === 0) {
                $status = 'in-progress';
            }

            $certifications[] = [
                'id' => (string) ($index + 1),
                'name' => $name,
                'provider' => 'Recommended Provider',
                'description' => "Industry-recognized certification for {$name}",
                'difficulty' => $difficulties[$index % count($difficulties)],
                'estimatedTime' => '20-40 hours',
                'icon' => $iconMap[$index % count($iconMap)],
                'status' => $status,
            ];
        }

        return $certifications;
    }

    /**
     * Format organizations data from the roadmap.
     */
    private function formatOrganizations($roadmap)
    {
        if (!$roadmap || !$roadmap->organizations_to_join) {
            return [];
        }

        $organizations = [];
        $types = ['club', 'organization', 'society'];

        foreach ($roadmap->organizations_to_join as $index => $org) {
            $name = is_array($org) ? ($org[0] ?? $org['name'] ?? 'Unknown Organization') : $org;

            $organizations[] = [
                'id' => (string) ($index + 1),
                'name' => $name,
                'type' => $types[$index % count($types)],
                'description' => "Campus organization focused on {$name} activities and networking",
                'tags' => ['Networking', 'Growth', 'Community'],
                'memberCount' => rand(50, 200),
                'meetingFrequency' => ['Weekly', 'Bi-weekly', 'Monthly'][$index % 3],
            ];
        }

        return $organizations;
    }

    /**
     * Format projects data from the roadmap.
     */
    private function formatProjects($roadmap)
    {
        if (!$roadmap || !$roadmap->projects_to_build) {
            return [];
        }

        $projects = [];
        $difficulties = ['beginner', 'intermediate', 'advanced'];

        // Get project progress tracking data
        $projectProgress = $roadmap->project_progress ?? [];

        foreach ($roadmap->projects_to_build as $index => $project) {
            $name = is_array($project) ? ($project[0] ?? $project['name'] ?? 'Unknown Project') : $project;

            // Get status from project_progress, default to in-progress for first, upcoming for rest
            $status = 'upcoming';
            if (isset($projectProgress[$name])) {
                $status = $projectProgress[$name];
            } elseif ($index === 0) {
                $status = 'in-progress';
            }

            $projects[] = [
                'id' => (string) ($index + 1),
                'name' => $name,
                'description' => "Build a {$name} to demonstrate your skills",
                'difficulty' => $difficulties[$index % count($difficulties)],
                'category' => 'Portfolio Project',
                'skills' => ['Technical Skills', 'Problem Solving'],
                'estimatedTime' => '1-4 weeks',
                'status' => $status,
            ];
        }

        return $projects;
    }

    /**
     * Format courses data from the roadmap.
     */
    private function formatCourses($roadmap)
    {
        if (!$roadmap || !$roadmap->courses_to_take) {
            return [];
        }

        $formattedCourses = [];
        $providers = ['YouTube', 'Udemy', 'Coursera', 'LinkedIn Learning'];
        $categories = ['Web Development', 'Data Science', 'Business', 'Design'];

        // Get course progress tracking data
        $courseProgress = $roadmap->course_progress ?? [];

        // Extract course names to fetch details
        $courseNames = [];
        foreach ($roadmap->courses_to_take as $course) {
            $name = is_array($course) ? ($course[0] ?? $course['name'] ?? '') : $course;
            if ($name) {
                $courseNames[] = $name;
            }
        }

        // Fetch course details from database
        $dbCourses = \App\Models\Course::whereIn('course_name', $courseNames)->get()->keyBy('course_name');

        foreach ($roadmap->courses_to_take as $index => $courseItem) {
            $name = is_array($courseItem) ? ($courseItem[0] ?? $courseItem['name'] ?? 'Unknown Course') : $courseItem;

            // Get details from DB or fallbacks
            $dbCourse = $dbCourses->get($name);

            // Get status from course_progress, default to upcoming
            $status = 'upcoming';
            if (isset($courseProgress[$name])) {
                $status = $courseProgress[$name];
            } elseif ($index === 0) {
                $status = 'in-progress';
            }

            $formattedCourses[] = [
                'id' => (string) ($index + 1),
                'name' => $name,
                'description' => $dbCourse ? $dbCourse->description : "Online course: {$name}",
                'provider' => $dbCourse ? $dbCourse->provider : $providers[$index % count($providers)],
                'category' => $dbCourse ? $dbCourse->category : $categories[$index % count($categories)],
                'duration' => $dbCourse ? $dbCourse->duration_hours . ' hours' : (($index % 3) + 1) * 10 . ' hours',
                'isFree' => $dbCourse ? (bool)$dbCourse->is_free : $index % 2 === 0,
                'url' => $dbCourse ? $dbCourse->url : '#',
                'status' => $status,
            ];
        }

        return $formattedCourses;
    }
}
