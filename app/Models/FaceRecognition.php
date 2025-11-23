<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaceRecognition extends Model
{
    protected $table = 'face_recognitions';

    protected $fillable = [
        'user_id', 'face_data', 'face_image', 'is_verified', 'confidence_score', 
        'last_login_with_face', 'failed_attempts'
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'last_login_with_face' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
