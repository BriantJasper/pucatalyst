<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'description', 'category', 'logo', 'email', 'contact_person',
        'achievements', 'career_paths', 'member_count', 'meeting_day', 
        'meeting_time', 'meeting_location', 'is_active'
    ];

    protected $casts = [
        'career_paths' => 'array',
        'is_active' => 'boolean',
    ];

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_organizations')->withTimestamps();
    }
}
