<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'student_id',
        'major',
        'year',
        'gpa',
        'career_goal',
        'interests',
        'skill_assessment',
        'resume_path',
        'bio',
    ];

    protected $casts = [
        'interests' => 'array',
        'skill_assessment' => 'array',
        'gpa' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'student_skills')->withTimestamps();
    }

    public function organizations()
    {
        return $this->belongsToMany(Organization::class, 'student_organizations')->withTimestamps();
    }

    public function certificates()
    {
        return $this->belongsToMany(Certificate::class, 'student_certificates')->withTimestamps();
    }

    public function recommendations()
    {
        return $this->hasMany(Recommendation::class);
    }

    public function roadmap()
    {
        return $this->hasOne(Roadmap::class);
    }

    public function mentorships()
    {
        return $this->hasMany(MentorshipPair::class);
    }
}
