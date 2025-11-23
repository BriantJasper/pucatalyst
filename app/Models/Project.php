<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'difficulty', 'required_skills', 'related_careers',
        'project_brief', 'resources', 'tech_stack', 'learning_outcomes', 
        'estimated_duration', 'evaluation_criteria'
    ];

    protected $casts = [
        'required_skills' => 'array',
        'related_careers' => 'array',
        'resources' => 'array',
        'evaluation_criteria' => 'array',
    ];
}
