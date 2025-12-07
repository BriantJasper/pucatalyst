<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtpVerification extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'otp',
        'type',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    /**
     * Get the user that owns the OTP.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the OTP has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the OTP has been used.
     */
    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    /**
     * Check if the OTP is valid (not expired and not used).
     */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isUsed();
    }

    /**
     * Mark the OTP as used.
     */
    public function markAsUsed(): void
    {
        $this->update(['used_at' => now()]);
    }

    /**
     * Generate a new 6-digit OTP.
     */
    public static function generateOtp(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new OTP for email verification.
     */
    public static function createForEmailVerification(User $user, int $expiryMinutes = 15): self
    {
        // Invalidate previous OTPs for this user and type
        self::where('user_id', $user->id)
            ->where('type', 'email_verification')
            ->whereNull('used_at')
            ->delete();

        return self::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'otp' => self::generateOtp(),
            'type' => 'email_verification',
            'expires_at' => now()->addMinutes($expiryMinutes),
        ]);
    }

    /**
     * Create a new OTP for password reset.
     */
    public static function createForPasswordReset(string $email, int $expiryMinutes = 15): self
    {
        // Invalidate previous OTPs for this email and type
        self::where('email', $email)
            ->where('type', 'password_reset')
            ->whereNull('used_at')
            ->delete();

        $user = User::where('email', $email)->first();

        return self::create([
            'user_id' => $user?->id,
            'email' => $email,
            'otp' => self::generateOtp(),
            'type' => 'password_reset',
            'expires_at' => now()->addMinutes($expiryMinutes),
        ]);
    }

    /**
     * Find a valid OTP by code and type.
     */
    public static function findValidOtp(string $email, string $otp, string $type): ?self
    {
        return self::where('email', $email)
            ->where('otp', $otp)
            ->where('type', $type)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();
    }
}
