<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Alumni extends Model
{
    use SoftDeletes;

    protected $table = 'alumni';

    protected $fillable = [
        'user_id',
        'alumni_id',
        'current_company',
        'current_position',
        'career_path',
        'career_description',
        'linkedin_url',
        'organizations_joined',
        'certificates_earned',
        'internships',
        'skills_developed',
        'advice_for_juniors',
        'verification_status',
    ];

    protected $casts = [
        'organizations_joined' => 'array',
        'certificates_earned' => 'array',
        'internships' => 'array',
        'skills_developed' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mentorships()
    {
        return $this->hasMany(MentorshipPair::class);
    }
}
