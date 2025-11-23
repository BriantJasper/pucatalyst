<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $certificates = \App\Models\Certificate::all();
        return response()->json($certificates);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'provider' => 'required|string',
            'url' => 'nullable|url',
            'duration_hours' => 'nullable|integer',
            'cost' => 'nullable|numeric',
            'difficulty_level' => 'nullable|string',
            'skills_covered' => 'nullable|array',
            'career_paths' => 'nullable|array',
            'is_free' => 'boolean',
            'has_exam' => 'boolean',
            'exam_cost' => 'nullable|numeric'
        ]);

        $certificate = \App\Models\Certificate::create($validated);

        return response()->json($certificate, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $certificate = \App\Models\Certificate::findOrFail($id);
        return response()->json($certificate);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $certificate = \App\Models\Certificate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'provider' => 'sometimes|required|string',
            'url' => 'nullable|url',
            'duration_hours' => 'nullable|integer',
            'cost' => 'nullable|numeric',
            'difficulty_level' => 'nullable|string',
            'skills_covered' => 'nullable|array',
            'career_paths' => 'nullable|array',
            'is_free' => 'boolean',
            'has_exam' => 'boolean',
            'exam_cost' => 'nullable|numeric'
        ]);

        $certificate->update($validated);

        return response()->json($certificate);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $certificate = \App\Models\Certificate::findOrFail($id);
        $certificate->delete();

        return response()->json(['message' => 'Certificate deleted successfully']);
    }
}
