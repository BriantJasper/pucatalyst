<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

echo "=== CHECKING FACE DATA IN DATABASE ===\n\n";

$users = User::whereNotNull('face_encoding')->orWhere('face_auth_enabled', true)->get();

if ($users->isEmpty()) {
    echo "❌ No users found with face data!\n";
} else {
    echo "✅ Found " . $users->count() . " user(s) with face data:\n\n";
    
    foreach ($users as $user) {
        echo "User ID: {$user->id}\n";
        echo "Name: {$user->name}\n";
        echo "Email: {$user->email}\n";
        echo "Face Auth Enabled: " . ($user->face_auth_enabled ? 'YES' : 'NO') . "\n";
        echo "Face Encoding: " . ($user->face_encoding ? 'EXISTS (' . strlen($user->face_encoding) . ' chars)' : 'NULL') . "\n";
        echo "Registered At: " . ($user->face_registered_at ?? 'N/A') . "\n";
        
        if ($user->face_encoding) {
            $encoding = json_decode($user->face_encoding, true);
            if (is_array($encoding)) {
                echo "Encoding Array Length: " . count($encoding) . "\n";
                echo "First 5 values: " . implode(', ', array_slice($encoding, 0, 5)) . "\n";
            } else {
                echo "⚠️ WARNING: face_encoding is not a valid JSON array!\n";
                echo "Raw data (first 100 chars): " . substr($user->face_encoding, 0, 100) . "\n";
            }
        }
        echo "\n" . str_repeat("-", 50) . "\n\n";
    }
}

echo "\n=== CHECKING ALL USERS ===\n\n";
$allUsers = User::all();
echo "Total users: " . $allUsers->count() . "\n";
foreach ($allUsers as $user) {
    echo "- ID: {$user->id}, Name: {$user->name}, Face Auth: " . ($user->face_auth_enabled ? 'ON' : 'OFF') . "\n";
}
