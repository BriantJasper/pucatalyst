<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\AlumniController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\RoadmapController;
use App\Http\Controllers\Api\AdminController;

// Public Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-face', [AuthController::class, 'verifyFace']);
Route::post('/auth/login-face', [AuthController::class, 'loginWithFace']);
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Protected Routes
Route::middleware('auth:api')->group(function () {
    // Auth Routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/register-face', [AuthController::class, 'registerFace']);
    Route::post('/auth/setup-face-auth', [AuthController::class, 'setupFaceAuth']);
    Route::post('/auth/disable-face-auth', [AuthController::class, 'disableFaceAuth']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::delete('/auth/delete-account', [AuthController::class, 'deleteAccount']);

    // Student Routes
    Route::apiResource('students', StudentController::class);
    Route::post('/students/{student}/upload-resume', [StudentController::class, 'uploadResume']);
    Route::get('/students/{student}/roadmap', [RoadmapController::class, 'getStudentRoadmap']);

    // Alumni Routes
    Route::apiResource('alumni', AlumniController::class);

    // Organization Routes
    Route::get('/organizations', [OrganizationController::class, 'index']);
    Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);

    // Course Routes
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);

    // Skill Routes
    Route::get('/skills', [SkillController::class, 'index']);
    Route::get('/skills/{skill}', [SkillController::class, 'show']);

    // Certificate Routes
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{certificate}', [CertificateController::class, 'show']);

    // Roadmap Routes
    Route::post('/roadmaps/generate', [RoadmapController::class, 'generateRoadmap']);
    Route::get('/roadmaps/{student}', [RoadmapController::class, 'show']);

    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('organizations', OrganizationController::class)->except(['index', 'show']);
        Route::apiResource('courses', CourseController::class)->except(['index', 'show']);
        Route::apiResource('skills', SkillController::class)->except(['index', 'show']);
        Route::apiResource('certificates', CertificateController::class)->except(['index', 'show']);
        Route::get('/analytics', [AdminController::class, 'getAnalytics']);
        Route::get('/students', [AdminController::class, 'getAllStudents']);
        Route::get('/alumni', [AdminController::class, 'getAllAlumni']);
        Route::post('/alumni/{alumni}/verify', [AdminController::class, 'verifyAlumni']);
    });
});
