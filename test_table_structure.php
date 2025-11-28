<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== CHECKING USERS TABLE STRUCTURE ===\n\n";

$columns = Schema::getColumnListing('users');

echo "Columns in 'users' table:\n";
foreach ($columns as $column) {
    echo "- $column\n";
}

echo "\n=== CHECKING FOR FACE COLUMNS ===\n";

$faceColumns = ['face_encoding', 'face_auth_enabled', 'face_registered_at'];
foreach ($faceColumns as $col) {
    $exists = in_array($col, $columns);
    echo "- $col: " . ($exists ? '✅ EXISTS' : '❌ MISSING') . "\n";
}

echo "\n=== CHECKING MIGRATIONS ===\n";
$migrations = DB::table('migrations')->where('migration', 'like', '%face%')->get();
if ($migrations->isEmpty()) {
    echo "❌ No face-related migrations found!\n";
    echo "\nYou need to run: php artisan migrate\n";
} else {
    echo "✅ Face migrations found:\n";
    foreach ($migrations as $migration) {
        echo "- {$migration->migration} (batch: {$migration->batch})\n";
    }
}
