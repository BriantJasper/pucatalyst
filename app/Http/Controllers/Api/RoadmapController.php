<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RoadmapController extends Controller
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

        $roadmap = \App\Models\Roadmap::create($validated);

        return response()->json($roadmap, 201);
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $roadmap = \App\Models\Roadmap::findOrFail($id);
        $roadmap->delete();

        return response()->json(['message' => 'Roadmap deleted successfully']);
    }
}
