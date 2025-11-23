<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Certificate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'description', 'provider', 'url', 'duration_hours', 'cost',
        'difficulty_level', 'skills_covered', 'career_paths', 'is_free', 
        'has_exam', 'exam_cost'
    ];

    protected $casts = [
        'skills_covered' => 'array',
        'career_paths' => 'array',
        'is_free' => 'boolean',
        'has_exam' => 'boolean',
        'cost' => 'decimal:2',
    ];

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_certificates')->withTimestamps();
    }
}
