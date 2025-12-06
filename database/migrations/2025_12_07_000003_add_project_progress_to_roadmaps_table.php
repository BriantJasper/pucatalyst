<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds project_progress column to track completion status of projects.
     * Format: {"project_name": "completed|in-progress|upcoming", ...}
     */
    public function up(): void
    {
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->json('project_progress')->nullable()->after('cert_progress');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->dropColumn('project_progress');
        });
    }
};
