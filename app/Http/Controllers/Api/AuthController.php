<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use App\Models\Alumni;
use App\Models\FaceRecognition;
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
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'student_id' => 'required|string|max:50|unique:students,student_id',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,alumni,admin',
            'phone' => 'nullable|string',
            'face_images' => 'nullable|array|min:5',
            'face_images.*' => 'nullable|string',
        ]);

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
                    $faceServiceUrl = env('FACE_RECOGNITION_SERVICE_URL', 'http://localhost:5000');

                    $response = Http::timeout(30)->post($faceServiceUrl . '/encode-faces', [
                        'images' => $request->face_images
                    ]);

                    if ($response->successful() && $response->json('success')) {
                        $encoding = $response->json('encoding');

                        $user->update([
                            'face_encoding' => json_encode($encoding),
                            'face_auth_enabled' => true,
                            'face_registered_at' => now(),
                        ]);

                        Log::info('Face encoding saved for user: ' . $user->id);
                    } else {
                        Log::warning('Face encoding failed: ' . $response->body());
                    }
                } catch (\Exception $e) {
                    Log::error('Face recognition service error: ' . $e->getMessage());
                    // Continue registration even if face recognition fails
                }
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
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            $login = trim($request->login);
            $credentials = [];

            // Check if login is email or student_id
            if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
                // Login with email
                $credentials = [
                    'email' => $login,
                    'password' => $request->password,
                ];

                if (!$token = JWTAuth::attempt($credentials)) {
                    return response()->json(['error' => 'Invalid credentials'], 401);
                }
                $user = auth()->user();
            } else {
                // Login with student_id - find user by student_id
                $student = Student::where('student_id', $login)->first();

                if (!$student) {
                    return response()->json(['error' => 'Invalid credentials'], 401);
                }

                $user = $student->user;

                if (!Hash::check($request->password, $user->password)) {
                    return response()->json(['error' => 'Invalid credentials'], 401);
                }

                $token = JWTAuth::fromUser($user);
            }

            // Check if face authentication is enabled for this user
            if ($user->face_auth_enabled) {
                // Return temporary token that requires face verification
                return response()->json([
                    'message' => 'Face verification required',
                    'requires_face_verification' => true,
                    'temp_token' => $token, // This token will be validated during face verification
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                ]);
            }

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
            // Validate temp token and get user
            JWTAuth::setToken($request->temp_token);
            $user = JWTAuth::authenticate();

            if (!$user) {
                return response()->json(['error' => 'Invalid token'], 401);
            }

            if (!$user->face_auth_enabled || !$user->face_encoding) {
                return response()->json(['error' => 'Face authentication not set up'], 400);
            }

            // Call face recognition service
            $faceServiceUrl = env('FACE_RECOGNITION_SERVICE_URL', 'http://localhost:5000');

            $response = Http::timeout(30)->post($faceServiceUrl . '/verify-face', [
                'image' => $request->face_image,
                'stored_encoding' => json_decode($user->face_encoding, true)
            ]);

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
            $faceRecognition = FaceRecognition::where('is_verified', true)->first();

            if (!$faceRecognition) {
                return response()->json(['error' => 'Face not found'], 404);
            }

            $user = $faceRecognition->user;
            $token = JWTAuth::fromUser($user);

            $faceRecognition->update([
                'last_login_with_face' => now(),
                'failed_attempts' => 0,
            ]);

            return response()->json([
                'message' => 'Login with face successful',
                'access_token' => $token,
                'token_type' => 'bearer',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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



    public function setupFaceAuth(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'face_images' => 'required|array|min:5',
            'face_images.*' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            $user = auth()->user();

            // Call face recognition service to encode faces
            $faceServiceUrl = env('FACE_RECOGNITION_SERVICE_URL', 'http://localhost:5000');

            $response = Http::timeout(60)->post($faceServiceUrl . '/encode-faces', [
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

            // Delete related records based on role
            if ($user->role === 'student') {
                // Delete student-specific data
                $user->student()->delete();
            } elseif ($user->role === 'alumni') {
                // Delete alumni-specific data
                $user->alumni()->delete();
            }

            // Delete face recognition data if exists
            if ($user->face_encoding) {
                $user->face_encoding = null;
                $user->face_auth_enabled = false;
                $user->save();
            }

            // Finally delete the user
            $user->delete();

            // Invalidate token
            auth()->logout();

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete account error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete account: ' . $e->getMessage()
            ], 500);
        }
    }
}
