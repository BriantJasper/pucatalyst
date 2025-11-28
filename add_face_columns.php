<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Checking users table structure...\n";

// Check if columns exist (SQLite compatible)
$columns = DB::select("PRAGMA table_info(users)");
$columnNames = array_map(function($col) {
    return $col->name;
}, $columns);

echo "Current columns: " . implode(", ", $columnNames) . "\n\n";

// Check if face columns exist
$hasFaceEncoding = in_array('face_encoding', $columnNames);
$hasFaceAuthEnabled = in_array('face_auth_enabled', $columnNames);
$hasFaceRegisteredAt = in_array('face_registered_at', $columnNames);

if ($hasFaceEncoding && $hasFaceAuthEnabled && $hasFaceRegisteredAt) {
    echo "✅ All face recognition columns already exist!\n";
    exit(0);
}

echo "Adding missing face recognition columns...\n\n";

try {
    // SQLite doesn't support AFTER keyword
    if (!$hasFaceEncoding) {
        echo "Adding face_encoding column...\n";
        DB::statement("ALTER TABLE users ADD COLUMN face_encoding TEXT");
        echo "✅ face_encoding added\n";
    }
    
    if (!$hasFaceAuthEnabled) {
        echo "Adding face_auth_enabled column...\n";
        DB::statement("ALTER TABLE users ADD COLUMN face_auth_enabled INTEGER DEFAULT 0");
        echo "✅ face_auth_enabled added\n";
    }
    
    if (!$hasFaceRegisteredAt) {
        echo "Adding face_registered_at column...\n";
        DB::statement("ALTER TABLE users ADD COLUMN face_registered_at DATETIME");
        echo "✅ face_registered_at added\n";
    }
    
    echo "\n✅ All columns added successfully!\n\n";
    
    // Verify
    echo "Verifying...\n";
    $columns = DB::select("PRAGMA table_info(users)");
    foreach ($columns as $col) {
        if (in_array($col->name, ['face_encoding', 'face_auth_enabled', 'face_registered_at'])) {
            echo "  ✅ {$col->name} ({$col->type})\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
