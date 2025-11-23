<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Skill extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'description', 'type', 'category', 'proficiency_level',
        'related_careers', 'demand_score', 'learning_resources'
    ];

    protected $casts = [
        'related_careers' => 'array',
        'learning_resources' => 'array',
    ];

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_skills')->withTimestamps();
    }
}
