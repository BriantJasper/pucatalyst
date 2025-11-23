<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MentorshipPair extends Model
{
    protected $table = 'mentorship_pairs';

    protected $fillable = [
        'student_id', 'alumni_id', 'status', 'start_date', 'end_date', 
        'goals', 'notes', 'meeting_frequency', 'rating_by_student', 'rating_by_alumni'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function alumni()
    {
        return $this->belongsTo(Alumni::class);
    }
}
