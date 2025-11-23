<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_code', 'course_name', 'description', 'department', 'credits', 'semester',
        'related_skills', 'career_paths', 'instructor', 'difficulty_level', 
        'is_elective', 'is_required', 'is_active'
    ];

    protected $casts = [
        'related_skills' => 'array',
        'career_paths' => 'array',
        'difficulty_level' => 'decimal:1',
        'is_elective' => 'boolean',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];
}
