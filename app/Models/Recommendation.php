<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recommendation extends Model
{
    protected $fillable = [
        'student_id', 'type', 'recommended_id', 'relevance_score', 'reason', 'status'
    ];

    protected $casts = [
        'relevance_score' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
