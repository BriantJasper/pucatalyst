<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds cert_progress column to track completion status of certificates.
     * Format: {"cert_name": "completed|in-progress|upcoming", ...}
     */
    public function up(): void
    {
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->json('cert_progress')->nullable()->after('skill_progress');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->dropColumn('cert_progress');
        });
    }
};
