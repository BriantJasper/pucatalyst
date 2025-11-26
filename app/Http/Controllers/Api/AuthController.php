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
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            if (!$token = JWTAuth::attempt($request->only('email', 'password'))) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            $user = auth()->user();
            
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
}
