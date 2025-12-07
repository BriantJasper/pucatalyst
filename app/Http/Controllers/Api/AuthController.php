<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\Alumni;
use App\Models\FaceRecognition;
use App\Models\OtpVerification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Increase time limit for face processing during registration
        set_time_limit(120); // 2 minutes

        // Build validation rules - student_id is only required for students
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,alumni,admin',
            'phone' => 'nullable|string',
            'face_images' => 'nullable|array|min:5',
            'face_images.*' => 'nullable|string',
        ];

        // Add student_id validation only for students
        if ($request->role === 'student') {
            $rules['student_id'] = 'required|string|max:50|unique:students,student_id';
        } else {
            $rules['student_id'] = 'nullable|string|max:50';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'role' => $request->role,
                'email_verified' => false,
            ]);

            if ($request->role === 'student') {
                Student::create([
                    'user_id' => $user->id,
                    'student_id' => $request->student_id,
                    'major' => $request->major ?? 'Undeclared',
                    'career_goal' => $request->career_goal ?? 'Not specified',
                ]);
            } elseif ($request->role === 'alumni') {
                Alumni::create([
                    'user_id' => $user->id,
                    'career_path' => $request->career_path ?? 'Not specified',
                ]);
            }

            // Process face images if provided
            if ($request->has('face_images') && is_array($request->face_images) && count($request->face_images) >= 5) {
                try {
                    Log::info('Starting face encoding process for user: ' . $user->id);
                    Log::info('Number of face images: ' . count($request->face_images));

                    $faceServiceUrl = env('FACE_RECOGNITION_SERVICE_URL', 'http://localhost:5000');
                    Log::info('Face service URL: ' . $faceServiceUrl);

                    // Increased timeout to 90 seconds for augmentation processing
                    $response = Http::timeout(90)->post($faceServiceUrl . '/encode-faces', [
                        'images' => $request->face_images
                    ]);

                    Log::info('Face service response status: ' . $response->status());
                    Log::info('Face service response body: ' . $response->body());

                    if ($response->successful() && $response->json('success')) {
                        $encoding = $response->json('encoding');

                        Log::info('Encoding received, length: ' . (is_array($encoding) ? count($encoding) : 'not array'));

                        $encodingJson = json_encode($encoding);
                        Log::info('Encoding JSON length: ' . strlen($encodingJson));

                        $updated = $user->update([
                            'face_encoding' => $encodingJson,
                            'face_auth_enabled' => true,
                            'face_registered_at' => now(),
                        ]);

                        Log::info('User update result: ' . ($updated ? 'SUCCESS' : 'FAILED'));

                        // Verify the data was saved
                        $user->refresh();
                        Log::info('Verified - face_auth_enabled: ' . ($user->face_auth_enabled ? 'true' : 'false'));
                        Log::info('Verified - face_encoding length: ' . strlen($user->face_encoding ?? ''));
                    } else {
                        Log::warning('Face encoding failed: ' . $response->body());
                    }
                } catch (\Exception $e) {
                    Log::error('Face recognition service error: ' . $e->getMessage());
                    Log::error('Stack trace: ' . $e->getTraceAsString());
                    // Continue registration even if face recognition fails
                }
            } else {
                Log::info('No face images provided or insufficient images for user: ' . $user->id);
            }

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'message' => 'User registered successfully',
                'access_token' => $token,
                'token_type' => 'bearer',
                'user' => $user,
                'face_auth_enabled' => $user->face_auth_enabled,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        try {
            $login = $request->login;
            $credentials = [];

            // Check if login is email or student_id
            if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
                // Login with email
                $user = User::where('email', $login)->first();

                if (!$user || !Hash::check($request->password, $user->password)) {
                    return response()->json(['error' => 'Invalid Credentials'], 401);
                }

                $token = JWTAuth::fromUser($user);
            } else {
                // Login with student_id - find user by student_id
                $student = Student::where('student_id', $login)->first();

                if (!$student) {
                    return response()->json(['error' => 'Invalid Credentials'], 401);
                }

                $user = $student->user;

                if (!Hash::check($request->password, $user->password)) {
                    return response()->json(['error' => 'Invalid Credentials'], 401);
                }

                $token = JWTAuth::fromUser($user);
            }

            // $user is now set in both branches above
            // Face auth is only used for standalone face login, not as 2FA for credential login

            return response()->json([
                'message' => 'Login successful',
                'access_token' => $token,
                'token_type' => 'bearer',
                'user' => $user,
            ]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token error'], 500);
        }
    }

    public function verifyFace(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'face_image' => 'required|string',
            'temp_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            Log::info('Face verification request received');
            Log::info('Temp token present: ' . ($request->temp_token ? 'YES' : 'NO'));

            // Validate temp token and get user
            JWTAuth::setToken($request->temp_token);
            $user = JWTAuth::authenticate();

            if (!$user) {
                Log::warning('Invalid token during face verification');
                return response()->json(['error' => 'Invalid token'], 401);
            }

            Log::info('User authenticated: ' . $user->id);
            Log::info('Face auth enabled: ' . ($user->face_auth_enabled ? 'true' : 'false'));
            Log::info('Face encoding exists: ' . ($user->face_encoding ? 'YES (' . strlen($user->face_encoding) . ' chars)' : 'NO'));

            if (!$user->face_auth_enabled || !$user->face_encoding) {
                Log::warning('Face authentication not set up for user: ' . $user->id);
                return response()->json(['error' => 'Face authentication not set up'], 400);
            }

            // Call face recognition service
            $faceServiceUrl = env('FACE_RECOGNITION_SERVICE_URL', 'http://localhost:5000');

            Log::info('Calling face service at: ' . $faceServiceUrl);

            $storedEncoding = json_decode($user->face_encoding, true);
            Log::info('Stored encoding array length: ' . (is_array($storedEncoding) ? count($storedEncoding) : 'not array'));

            $response = Http::timeout(30)->post($faceServiceUrl . '/verify-face', [
                'image' => $request->face_image,
                'stored_encoding' => $storedEncoding
            ]);

            Log::info('Face service response status: ' . $response->status());
            Log::info('Face service response: ' . $response->body());

            if (!$response->successful()) {
                Log::error('Face verification service error: ' . $response->body());
                return response()->json([
                    'error' => 'Face verification service unavailable',
                    'details' => $response->json('error') ?? 'Unknown error'
                ], 500);
            }

            $result = $response->json();

            if (!$result['success']) {
                return response()->json([
                    'error' => 'Face verification failed',
                    'details' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            // Check if face matches
            if (!$result['match']) {
                return response()->json([
                    'error' => 'Face does not match',
                    'confidence' => $result['confidence'] ?? 0,
                    'message' => 'The captured face does not match your registered face'
                ], 401);
            }

            // Face verified successfully
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'message' => 'Face verification successful',
                'access_token' => $token,
                'token_type' => 'bearer',
                'user' => $user,
                'confidence' => $result['confidence'] ?? 0,
            ]);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token error: ' . $e->getMessage()], 401);
        } catch (\Exception $e) {
            Log::error('Face verification error: ' . $e->getMessage());
            return response()->json(['error' => 'Face verification failed: ' . $e->getMessage()], 500);
        }
    }

    public function registerFace(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'face_data' => 'required|string',
            'face_image' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            $user = auth()->user();

            FaceRecognition::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'face_data' => $request->face_data,
                    'face_image' => $request->face_image,
                    'is_verified' => true,
                    'confidence_score' => 100,
                ]
            );

            return response()->json(['message' => 'Face registered successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function loginWithFace(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'face_data' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            Log::info('Face login attempt started');

            // Get all users with face auth enabled
            $usersWithFaceAuth = User::where('face_auth_enabled', true)
                ->whereNotNull('face_encoding')
                ->get();

            Log::info('Found ' . $usersWithFaceAuth->count() . ' users with face auth enabled');

            if ($usersWithFaceAuth->isEmpty()) {
                return response()->json([
                    'error' => 'No users with face authentication enabled'
                ], 404);
            }

            $faceServiceUrl = env('FACE_RECOGNITION_SERVICE_URL', 'http://localhost:5000');
            $bestMatch = null;
            $bestConfidence = 0;
            $matchThreshold = 70; // Minimum confidence to consider a match

            // Compare face against each registered user
            foreach ($usersWithFaceAuth as $user) {
                try {
                    $storedEncoding = json_decode($user->face_encoding, true);

                    if (!$storedEncoding) {
                        Log::warning('Invalid face encoding for user: ' . $user->id);
                        continue;
                    }

                    $response = Http::timeout(15)->post($faceServiceUrl . '/verify-face', [
                        'image' => $request->face_data,
                        'stored_encoding' => $storedEncoding
                    ]);

                    if ($response->successful()) {
                        $result = $response->json();

                        if ($result['success'] && $result['match']) {
                            $confidence = $result['confidence'] ?? 0;
                            Log::info("User {$user->id} matched with confidence: {$confidence}%");

                            if ($confidence > $bestConfidence && $confidence >= $matchThreshold) {
                                $bestConfidence = $confidence;
                                $bestMatch = $user;
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning('Error comparing face for user ' . $user->id . ': ' . $e->getMessage());
                    continue;
                }
            }

            if (!$bestMatch) {
                Log::warning('Face login failed: No matching face found');
                return response()->json([
                    'error' => 'Face not recognized',
                    'message' => 'No matching face found. Please try again or use password login.'
                ], 401);
            }

            // Found a match!
            Log::info('Face login successful for user: ' . $bestMatch->id . ' with confidence: ' . $bestConfidence);

            $token = JWTAuth::fromUser($bestMatch);

            return response()->json([
                'message' => 'Login with face successful',
                'access_token' => $token,
                'token_type' => 'bearer',
                'user' => $bestMatch,
                'confidence' => $bestConfidence,
            ]);
        } catch (\Exception $e) {
            Log::error('Face login error: ' . $e->getMessage());
            return response()->json(['error' => 'Face login failed: ' . $e->getMessage()], 500);
        }
    }

    public function me()
    {
        return response()->json(auth()->user());
    }

    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function refresh()
    {
        return response()->json([
            'access_token' => auth()->refresh(),
            'token_type' => 'bearer',
        ]);
    }

    public function redirectToGoogle()
    {
        try {
            $url = \Laravel\Socialite\Facades\Socialite::driver('google')
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = \Laravel\Socialite\Facades\Socialite::driver('google')
                ->stateless()
                ->user();

            // Find or create user
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Create new user from Google data
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(\Illuminate\Support\Str::random(32)), // Random password for OAuth users
                    'role' => 'student', // Default role, can be changed
                    'email_verified' => true, // Google emails are verified
                ]);

                // Create student profile
                Student::create([
                    'user_id' => $user->id,
                    'major' => 'Undeclared',
                    'career_goal' => 'Not specified',
                ]);
            }

            // Generate JWT token
            $token = JWTAuth::fromUser($user);

            // Redirect to frontend callback with token and user data
            $frontendUrl = env('VITE_APP_URL', 'http://localhost:3000');
            $callbackUrl = $frontendUrl . '/auth/callback?' . http_build_query([
                'token' => $token,
                'user' => json_encode($user),
            ]);

            return redirect($callbackUrl);
        } catch (\Exception $e) {
            // Redirect to frontend with error
            $frontendUrl = env('VITE_APP_URL', 'http://localhost:3000');
            $errorUrl = $frontendUrl . '/auth/callback?' . http_build_query([
                'error' => $e->getMessage(),
            ]);
            return redirect($errorUrl);
        }
    }

    public function setupFaceAuth(Request $request)
    {
        // Increase time limit for face processing (with augmentation takes longer)
        set_time_limit(120); // 2 minutes instead of 30 seconds

        $validator = Validator::make($request->all(), [
            'face_images' => 'required|array|min:5',
            'face_images.*' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            $user = auth()->user();

            // Call face recognition service to encode faces with extended timeout
            $faceServiceUrl = env('FACE_RECOGNITION_SERVICE_URL', 'http://localhost:5000');

            // Increased timeout to 90 seconds for augmentation processing
            $response = Http::timeout(90)->post($faceServiceUrl . '/encode-faces', [
                'images' => $request->face_images
            ]);

            if (!$response->successful()) {
                Log::error('Face encoding service error: ' . $response->body());
                return response()->json([
                    'success' => false,
                    'error' => 'Face encoding service unavailable',
                    'details' => $response->json('error') ?? 'Unknown error'
                ], 500);
            }

            $result = $response->json();

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'Face encoding failed',
                    'details' => $result['error'] ?? 'Unknown error'
                ], 400);
            }

            // Store the face encoding
            $user->face_encoding = json_encode($result['encoding']);
            $user->face_auth_enabled = true;
            $user->face_registered_at = now();
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Face authentication enabled successfully',
                'images_processed' => $result['images_processed'] ?? count($request->face_images),
            ]);
        } catch (\Exception $e) {
            Log::error('Setup face auth error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to set up face authentication: ' . $e->getMessage()
            ], 500);
        }
    }

    public function disableFaceAuth(Request $request)
    {
        try {
            $user = auth()->user();

            $user->face_encoding = null;
            $user->face_auth_enabled = false;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Face authentication disabled successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Disable face auth error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to disable face authentication: ' . $e->getMessage()
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
            'new_password_confirmation' => 'required|string|same:new_password',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            $user = auth()->user();

            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 401);
            }

            // Update password
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Change password error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to change password: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteAccount(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Store user info before any operations
            $userEmail = $user->email;
            $userId = $user->id;
            $userRole = $user->role;

            // Invalidate token FIRST before any deletion
            try {
                auth()->logout();
            } catch (\Exception $e) {
                Log::info('Token invalidation before deletion: ' . $e->getMessage());
            }

            // Now perform deletion - user is already logged out so JWT won't interfere
            DB::beginTransaction();
            try {
                // Delete related records based on role
                if ($userRole === 'student') {
                    $student = Student::where('user_id', $userId)->first();
                    if ($student) {
                        // Detach pivot table relationships first
                        $student->skills()->detach();
                        $student->organizations()->detach();
                        $student->certificates()->detach();

                        // Delete related records
                        $student->roadmap()->delete();
                        $student->recommendations()->delete();
                        $student->mentorships()->delete();

                        // Delete the student record
                        $student->forceDelete();
                    }
                } elseif ($userRole === 'alumni') {
                    Alumni::where('user_id', $userId)->forceDelete();
                }

                // Delete face recognition data if exists
                FaceRecognition::where('user_id', $userId)->delete();

                // Delete OTP verifications
                OtpVerification::where('email', $userEmail)->delete();

                // Delete the user (force delete to bypass soft delete)
                User::where('id', $userId)->forceDelete();

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Delete account transaction error: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to delete account: ' . $e->getMessage()
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete account error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send OTP for email verification.
     */
    public function sendVerificationOtp(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if ($user->email_verified) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email already verified'
                ], 400);
            }

            // Create OTP
            $otp = OtpVerification::createForEmailVerification($user);

            // Send email
            Mail::send('emails.otp-verification', [
                'userName' => $user->name,
                'otp' => $otp->otp,
                'expiryMinutes' => 15
            ], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Verify Your Email - PU Catalyst');
            });

            return response()->json([
                'success' => true,
                'message' => 'Verification OTP sent to your email'
            ]);
        } catch (\Exception $e) {
            Log::error('Send verification OTP error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to send verification OTP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify OTP for email verification.
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if ($user->email_verified) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email already verified'
                ]);
            }

            // Find valid OTP
            $otp = OtpVerification::findValidOtp($user->email, $request->otp, 'email_verification');

            if (!$otp) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired OTP'
                ], 400);
            }

            // Mark OTP as used
            $otp->markAsUsed();

            // Mark email as verified
            $user->email_verified = true;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Verify OTP error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to verify OTP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend OTP for email verification.
     */
    public function resendOtp(Request $request)
    {
        return $this->sendVerificationOtp($request);
    }

    /**
     * Update email address (only allowed for unverified accounts).
     */
    public function updateEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 400);
        }

        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Only allow email change if email is not yet verified
            if ($user->email_verified) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot change email after verification. Please contact support.'
                ], 400);
            }

            $oldEmail = $user->email;
            $newEmail = $request->email;

            // Update user email
            $user->email = $newEmail;
            $user->save();

            // Delete old OTPs for the old email
            OtpVerification::where('email', $oldEmail)->delete();

            // Send new OTP to the new email
            OtpVerification::createForEmailVerification($user);

            return response()->json([
                'success' => true,
                'message' => 'Email updated successfully. A new verification code has been sent.',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Update email error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request password reset (forgot password).
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            $user = User::where('email', $request->email)->first();

            // Always return success to prevent email enumeration
            if (!$user) {
                return response()->json([
                    'success' => true,
                    'message' => 'If your email is registered, you will receive a password reset code'
                ]);
            }

            // Create OTP for password reset
            $otp = OtpVerification::createForPasswordReset($user->email);

            // Send email
            Mail::send('emails.password-reset', [
                'otp' => $otp->otp,
                'expiryMinutes' => 15
            ], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Reset Your Password - PU Catalyst');
            });

            return response()->json([
                'success' => true,
                'message' => 'If your email is registered, you will receive a password reset code'
            ]);
        } catch (\Exception $e) {
            Log::error('Forgot password error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to process request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password with OTP.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|string|same:password',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            // Find valid OTP
            $otp = OtpVerification::findValidOtp($request->email, $request->otp, 'password_reset');

            if (!$otp) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired OTP'
                ], 400);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Mark OTP as used
            $otp->markAsUsed();

            // Update password
            $user->password = Hash::make($request->password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to reset password: ' . $e->getMessage()
            ], 500);
        }
    }
}
