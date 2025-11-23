<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $organizations = \App\Models\Organization::all();
        return response()->json($organizations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'logo' => 'nullable|string', // Assuming URL or path
            'email' => 'nullable|email',
            'contact_person' => 'nullable|string',
            'achievements' => 'nullable|string',
            'career_paths' => 'nullable|array',
            'member_count' => 'nullable|integer',
            'meeting_day' => 'nullable|string',
            'meeting_time' => 'nullable|string',
            'meeting_location' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $organization = \App\Models\Organization::create($validated);

        return response()->json($organization, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $organization = \App\Models\Organization::findOrFail($id);
        return response()->json($organization);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $organization = \App\Models\Organization::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|string',
            'logo' => 'nullable|string',
            'email' => 'nullable|email',
            'contact_person' => 'nullable|string',
            'achievements' => 'nullable|string',
            'career_paths' => 'nullable|array',
            'member_count' => 'nullable|integer',
            'meeting_day' => 'nullable|string',
            'meeting_time' => 'nullable|string',
            'meeting_location' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $organization->update($validated);

        return response()->json($organization);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $organization = \App\Models\Organization::findOrFail($id);
        $organization->delete();

        return response()->json(['message' => 'Organization deleted successfully']);
    }
}
