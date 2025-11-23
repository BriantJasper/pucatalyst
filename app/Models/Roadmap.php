<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Roadmap extends Model
{
    protected $fillable = [
        'student_id', 'career_goal', 'semester_plans', 'skills_to_learn', 
        'organizations_to_join', 'courses_to_take', 'certificates_to_earn', 
        'projects_to_build', 'internships_to_pursue', 'gap_analysis', 
        'success_probability', 'ai_insights', 'completion_percentage'
    ];

    protected $casts = [
        'semester_plans' => 'array',
        'skills_to_learn' => 'array',
        'organizations_to_join' => 'array',
        'courses_to_take' => 'array',
        'certificates_to_earn' => 'array',
        'projects_to_build' => 'array',
        'internships_to_pursue' => 'array',
        'gap_analysis' => 'array',
        'success_probability' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
