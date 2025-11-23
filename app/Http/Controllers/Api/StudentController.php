<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StudentController extends Controller
{
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
        //
    }

    /**
     * Display the specified resource.
     */
    /**
     * Display the specified resource.
     */
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = \App\Models\Student::where('user_id', $id)
            ->with(['user', 'organizations', 'certificates', 'roadmap'])
            ->firstOrFail();
        return response()->json($student);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $student = \App\Models\Student::where('user_id', $id)->firstOrFail();

        $validated = $request->validate([
            'major' => 'required|string',
            'year' => 'required|in:1,2,3,4',
            'gpa' => 'nullable|numeric|between:0,4.00',
            'career_goal' => 'required|string',
            'interests' => 'nullable|array',
            'skill_assessment' => 'nullable|array',
            'bio' => 'nullable|string',
            'student_id' => 'nullable|string|unique:students,student_id,' . $student->id,
        ]);

        $student->update($validated);

        // Update user name if provided
        if ($request->has('name')) {
            $student->user->update(['name' => $request->name]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'student' => $student->load(['user', 'organizations', 'certificates', 'roadmap'])
        ]);
    }

    /**
     * Upload resume.
     */
    public function uploadResume(Request $request, string $id)
    {
        $request->validate([
            'resume' => 'required|file|mimes:pdf,doc,docx|max:2048',
        ]);

        $student = \App\Models\Student::where('user_id', $id)->firstOrFail();

        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes', 'public');
            $student->update(['resume_path' => $path]);

            return response()->json([
                'message' => 'Resume uploaded successfully',
                'path' => $path
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    // Relationship Management

    public function attachOrganization(Request $request, string $id)
    {
        $request->validate(['organization_id' => 'required|exists:organizations,id']);
        $student = \App\Models\Student::where('user_id', $id)->firstOrFail();
        $student->organizations()->syncWithoutDetaching([$request->organization_id]);
        return response()->json(['message' => 'Organization attached successfully', 'student' => $student->load('organizations')]);
    }

    public function detachOrganization(Request $request, string $id)
    {
        $request->validate(['organization_id' => 'required|exists:organizations,id']);
        $student = \App\Models\Student::where('user_id', $id)->firstOrFail();
        $student->organizations()->detach($request->organization_id);
        return response()->json(['message' => 'Organization detached successfully', 'student' => $student->load('organizations')]);
    }

    public function attachCertificate(Request $request, string $id)
    {
        $request->validate(['certificate_id' => 'required|exists:certificates,id']);
        $student = \App\Models\Student::where('user_id', $id)->firstOrFail();
        $student->certificates()->syncWithoutDetaching([$request->certificate_id]);
        return response()->json(['message' => 'Certificate attached successfully', 'student' => $student->load('certificates')]);
    }

    public function detachCertificate(Request $request, string $id)
    {
        $request->validate(['certificate_id' => 'required|exists:certificates,id']);
        $student = \App\Models\Student::where('user_id', $id)->firstOrFail();
        $student->certificates()->detach($request->certificate_id);
        return response()->json(['message' => 'Certificate detached successfully', 'student' => $student->load('certificates')]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
