<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('face_encoding')->nullable()->after('password');
            $table->boolean('face_auth_enabled')->default(false)->after('face_encoding');
            $table->timestamp('face_registered_at')->nullable()->after('face_auth_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['face_encoding', 'face_auth_enabled', 'face_registered_at']);
        });
    }
};
