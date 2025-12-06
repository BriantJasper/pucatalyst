<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds skill_progress column to track completion status of skills.
     * Format: {"skill_name": "completed|in-progress|upcoming", ...}
     */
    public function up(): void
    {
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->json('skill_progress')->nullable()->after('skills_to_learn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->dropColumn('skill_progress');
        });
    }
};
