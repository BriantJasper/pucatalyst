<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Roadmap extends Model
{
    protected $fillable = [
        'student_id',
        'career_goal',
        'semester_plans',
        'skills_to_learn',
        'skill_progress',
        'certificates_to_earn',
        'cert_progress',
        'projects_to_build',
        'project_progress',
        'organizations_to_join',
        'courses_to_take',
        'course_progress',
        'internships_to_pursue',
        'gap_analysis',
        'success_probability',
        'ai_insights',
        'completion_percentage'
    ];

    protected $casts = [
        'semester_plans' => 'array',
        'skills_to_learn' => 'array',
        'skill_progress' => 'array',
        'certificates_to_earn' => 'array',
        'cert_progress' => 'array',
        'projects_to_build' => 'array',
        'project_progress' => 'array',
        'organizations_to_join' => 'array',
        'courses_to_take' => 'array',
        'course_progress' => 'array',
        'internships_to_pursue' => 'array',
        'gap_analysis' => 'array',
        'success_probability' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
