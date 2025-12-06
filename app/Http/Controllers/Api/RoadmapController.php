<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Roadmap;
use App\Models\Student;

class RoadmapController extends Controller
{
    /**
     * Generate a roadmap using AI service.
     */
    public function generateRoadmap(Request $request)
    {
        $request->validate([
            'career_goal' => 'required|string|min:3',
            'student_id' => 'nullable|exists:students,id', // Optional if using auth user
        ]);

        // Get student ID from request or auth user
        $studentId = $request->student_id;
        if (!$studentId && auth()->check()) {
            // Assuming the user is a student or has a student profile linked
            $student = Student::where('user_id', auth()->id())->first();
            if ($student) {
                $studentId = $student->id;
            }
        }

        if (!$studentId) {
            return response()->json(['error' => 'Student ID is required or student profile not found.'], 400);
        }

        $careerGoal = $request->career_goal;
        $context = "Student ID: " . $studentId;

        // Call Python AI Service
        try {
            $response = Http::timeout(60)->post('http://127.0.0.1:5001/recommend', [
                'goal' => $careerGoal,
                'context' => $context,
                'top_n' => 5
            ]);

            if ($response->failed()) {
                Log::error('AI Service Failed: ' . $response->body());
                return response()->json(['error' => 'Failed to get recommendations from AI service.'], 500);
            }

            $aiData = $response->json();

            // Map AI data to Roadmap model structure
            // AI returns: 
            // 'top_alumni' (array), 
            // 'recommendations' => ['organizations', 'skills', 'certifications', 'projects']

            $recs = $aiData['recommendations'] ?? [];

            $roadmapData = [
                'student_id' => $studentId,
                'career_goal' => $careerGoal,
                'skills_to_learn' => $this->formatAiList($recs['skills'] ?? []),
                'organizations_to_join' => $this->formatAiList($recs['organizations'] ?? []),
                'certificates_to_earn' => $this->formatAiList($recs['certifications'] ?? []),
                'projects_to_build' => $this->formatAiList($recs['projects'] ?? []),
                'ai_insights' => "Generated based on " . count($aiData['top_alumni'] ?? []) . " successful alumni profiles.",
                'completion_percentage' => 0,
                'success_probability' => 0.85 // Estimated probability
            ];

            // Return combined data: roadmap preview + raw AI response for frontend display flexibility
            return response()->json([
                'roadmap_preview' => $roadmapData,
                'ai_response' => $aiData
            ]);
        } catch (\Exception $e) {
            Log::error('Roadmap Generation Error: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while generating the roadmap: ' . $e->getMessage()], 500);
        }
    }

    private function formatAiList($aiList)
    {
        // AI returns list of objects or arrays [item, frequency]
        // We want to transform this if necessary, or just store it.
        // For now, let's keep it as is, frontend handles the format.
        return $aiList;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // If student_id isn't provided, try to find it from auth
        if (!$request->has('student_id') && auth()->check()) {
            $student = Student::where('user_id', auth()->id())->first();
            if ($student) {
                $request->merge(['student_id' => $student->id]);
            }
        }

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'career_goal' => 'required|string',
            'semester_plans' => 'nullable|array',
            'skills_to_learn' => 'nullable|array',
            'organizations_to_join' => 'nullable|array',
            'courses_to_take' => 'nullable|array',
            'certificates_to_earn' => 'nullable|array',
            'projects_to_build' => 'nullable|array',
            'internships_to_pursue' => 'nullable|array',
            'gap_analysis' => 'nullable|array',
            'success_probability' => 'nullable|numeric',
            'ai_insights' => 'nullable|string',
            'completion_percentage' => 'nullable|integer'
        ]);

        $roadmap = Roadmap::updateOrCreate(
            ['student_id' => $validated['student_id']],
            $validated
        );

        return response()->json($roadmap, 201);
    }

    /**
     * Get the current student's roadmap.
     */
    public function current(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Assuming User has a student relationship or we find student by user_id
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $roadmap = Roadmap::where('student_id', $student->id)->first();

        if (!$roadmap) {
            return response()->json(['message' => 'No roadmap found'], 404);
        }

        return response()->json($roadmap);
    }

    /**
     * Display the specified resource.
     * Note: This assumes we want to fetch by Roadmap ID. 
     * To fetch by Student ID, we might need a different endpoint or logic.
     */
    public function show(string $id)
    {
        $roadmap = \App\Models\Roadmap::findOrFail($id);
        return response()->json($roadmap);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $roadmap = \App\Models\Roadmap::findOrFail($id);

        $validated = $request->validate([
            'career_goal' => 'sometimes|required|string',
            'semester_plans' => 'nullable|array',
            'skills_to_learn' => 'nullable|array',
            'organizations_to_join' => 'nullable|array',
            'courses_to_take' => 'nullable|array',
            'certificates_to_earn' => 'nullable|array',
            'projects_to_build' => 'nullable|array',
            'internships_to_pursue' => 'nullable|array',
            'gap_analysis' => 'nullable|array',
            'success_probability' => 'nullable|numeric',
            'ai_insights' => 'nullable|string',
            'completion_percentage' => 'nullable|integer'
        ]);

        $roadmap->update($validated);

        return response()->json($roadmap);
    }

    public function autocomplete(Request $request)
    {
        $query = $request->input('query');

        try {
            $response = Http::timeout(5)->post('http://127.0.0.1:5001/autocomplete', [
                'query' => $query,
                'max_suggestions' => 5
            ]);

            if ($response->successful()) {
                return $response->json();
            }
            return response()->json(['suggestions' => []]);
        } catch (\Exception $e) {
            return response()->json(['suggestions' => []]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $roadmap = \App\Models\Roadmap::findOrFail($id);
        $roadmap->delete();

        return response()->json(['message' => 'Roadmap deleted successfully']);
    }
    /**
     * Add a single item to the roadmap.
     */
    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'sometimes|exists:students,id',
            'type' => 'required|string|in:skill,certification,organization,project,course',
            'value' => 'required|string',
            'career_goal' => 'nullable|string' // In case we need to create one
        ]);

        $studentId = $request->input('student_id');

        if (!$studentId && $request->user()) {
            // Fetch student from user
            $student = \App\Models\Student::where('user_id', $request->user()->id)->first();
            if ($student) {
                $studentId = $student->id;
            }
        }

        if (!$studentId) {
            return response()->json(['error' => 'Student ID required'], 400);
        }

        $roadmap = Roadmap::firstOrCreate(
            ['student_id' => $studentId],
            [
                'career_goal' => $validated['career_goal'] ?? 'Undefined Goal',
                'success_probability' => 0.0,
                'completion_percentage' => 0
            ]
        );

        $columnMap = [
            'skill' => 'skills_to_learn',
            'certification' => 'certificates_to_earn',
            'organization' => 'organizations_to_join',
            'project' => 'projects_to_build',
            'course' => 'courses_to_take'
        ];

        $column = $columnMap[$validated['type']];
        $currentItems = $roadmap->$column ?? [];

        // Ensure currentItems is array (handle null or string issues)
        if (!is_array($currentItems)) {
            $currentItems = [];
        }

        $exists = false;
        foreach ($currentItems as $item) {
            $name = is_array($item) ? $item[0] : $item;
            if ($name === $validated['value']) {
                $exists = true;
                break;
            }
        }

        if (!$exists) {
            // Append as simple string
            $currentItems[] = $validated['value'];

            // Force save the json array
            $roadmap->$column = $currentItems;
            $roadmap->save();
        }

        return response()->json($roadmap);
    }

    /**
     * Update the status of a skill in the roadmap.
     */
    public function updateSkillStatus(Request $request)
    {
        $validated = $request->validate([
            'skill_name' => 'required|string',
            'status' => 'required|in:upcoming,in-progress,completed'
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $student = Student::where('user_id', $user->id)->first();
        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $roadmap = Roadmap::where('student_id', $student->id)->first();
        if (!$roadmap) {
            return response()->json(['error' => 'Roadmap not found'], 404);
        }

        // Get current skill progress or initialize empty array
        $skillProgress = $roadmap->skill_progress ?? [];

        // Update the skill status
        $skillProgress[$validated['skill_name']] = $validated['status'];
        $roadmap->skill_progress = $skillProgress;

        // Recalculate completion percentage based on skills AND certificates
        $roadmap->completion_percentage = $this->calculateCompletionPercentage($roadmap);

        $roadmap->save();

        return response()->json([
            'message' => 'Skill status updated successfully',
            'roadmap' => $roadmap,
            'skill_progress' => $skillProgress
        ]);
    }

    /**
     * Update the status of a certificate in the roadmap.
     */
    public function updateCertStatus(Request $request)
    {
        $validated = $request->validate([
            'cert_name' => 'required|string',
            'status' => 'required|in:upcoming,in-progress,completed'
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $student = Student::where('user_id', $user->id)->first();
        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $roadmap = Roadmap::where('student_id', $student->id)->first();
        if (!$roadmap) {
            return response()->json(['error' => 'Roadmap not found'], 404);
        }

        // Get current cert progress or initialize empty array
        $certProgress = $roadmap->cert_progress ?? [];

        // Update the cert status
        $certProgress[$validated['cert_name']] = $validated['status'];
        $roadmap->cert_progress = $certProgress;

        // Recalculate completion percentage based on skills AND certificates
        $roadmap->completion_percentage = $this->calculateCompletionPercentage($roadmap);

        $roadmap->save();

        return response()->json([
            'message' => 'Certificate status updated successfully',
            'roadmap' => $roadmap,
            'cert_progress' => $certProgress
        ]);
    }

    /**
     * Calculate the overall completion percentage based on skills and certificates.
     */
    private function calculateCompletionPercentage($roadmap): int
    {
        $totalItems = 0;
        $completedItems = 0;

        // Count completed skills
        $skills = $roadmap->skills_to_learn ?? [];
        $skillProgress = $roadmap->skill_progress ?? [];
        foreach ($skills as $skill) {
            $skillName = is_array($skill) ? ($skill[0] ?? $skill['name'] ?? '') : $skill;
            $totalItems++;
            if (isset($skillProgress[$skillName]) && $skillProgress[$skillName] === 'completed') {
                $completedItems++;
            }
        }

        // Count completed certificates
        $certs = $roadmap->certificates_to_earn ?? [];
        $certProgress = $roadmap->cert_progress ?? [];
        foreach ($certs as $cert) {
            $certName = is_array($cert) ? ($cert[0] ?? $cert['name'] ?? '') : $cert;
            $totalItems++;
            if (isset($certProgress[$certName]) && $certProgress[$certName] === 'completed') {
                $completedItems++;
            }
        }

        // Count completed projects
        $projects = $roadmap->projects_to_build ?? [];
        $projectProgress = $roadmap->project_progress ?? [];
        foreach ($projects as $project) {
            $projectName = is_array($project) ? ($project[0] ?? $project['name'] ?? '') : $project;
            $totalItems++;
            if (isset($projectProgress[$projectName]) && $projectProgress[$projectName] === 'completed') {
                $completedItems++;
            }
        }

        // Count completed courses
        $courses = $roadmap->courses_to_take ?? [];
        $courseProgress = $roadmap->course_progress ?? [];
        foreach ($courses as $course) {
            $courseName = is_array($course) ? ($course[0] ?? $course['name'] ?? '') : $course;
            $totalItems++;
            if (isset($courseProgress[$courseName]) && $courseProgress[$courseName] === 'completed') {
                $completedItems++;
            }
        }

        if ($totalItems === 0) {
            return 0;
        }

        return (int) round(($completedItems / $totalItems) * 100);
    }

    /**
     * Update the status of a project in the roadmap.
     */
    public function updateProjectStatus(Request $request)
    {
        $validated = $request->validate([
            'project_name' => 'required|string',
            'status' => 'required|in:upcoming,in-progress,completed'
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $student = Student::where('user_id', $user->id)->first();
        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $roadmap = Roadmap::where('student_id', $student->id)->first();
        if (!$roadmap) {
            return response()->json(['error' => 'Roadmap not found'], 404);
        }

        // Get current project progress or initialize empty array
        $projectProgress = $roadmap->project_progress ?? [];

        // Update the project status
        $projectProgress[$validated['project_name']] = $validated['status'];
        $roadmap->project_progress = $projectProgress;

        // Recalculate completion percentage
        $roadmap->completion_percentage = $this->calculateCompletionPercentage($roadmap);

        $roadmap->save();

        return response()->json([
            'message' => 'Project status updated successfully',
            'roadmap' => $roadmap,
            'project_progress' => $projectProgress
        ]);
    }

    /**
     * Update the status of a course in the roadmap.
     */
    public function updateCourseStatus(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string',
            'status' => 'required|in:upcoming,in-progress,completed'
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $student = Student::where('user_id', $user->id)->first();
        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $roadmap = Roadmap::where('student_id', $student->id)->first();
        if (!$roadmap) {
            return response()->json(['error' => 'Roadmap not found'], 404);
        }

        $courseProgress = $roadmap->course_progress ?? [];
        $courseProgress[$validated['course_name']] = $validated['status'];
        $roadmap->course_progress = $courseProgress;

        $roadmap->completion_percentage = $this->calculateCompletionPercentage($roadmap);
        $roadmap->save();

        return response()->json([
            'message' => 'Course status updated successfully',
            'roadmap' => $roadmap,
            'course_progress' => $courseProgress
        ]);
    }
}
