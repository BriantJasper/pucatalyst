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

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'message' => 'User registered successfully',
                'access_token' => $token,
                'token_type' => 'bearer',
                'user' => $user,
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
