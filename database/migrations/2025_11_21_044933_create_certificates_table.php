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
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->string('provider'); // Google, Coursera, AWS, etc
            $table->string('url')->nullable();
            $table->integer('duration_hours')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('difficulty_level')->default('intermediate');
            $table->json('skills_covered')->nullable(); // Array of skill IDs
            $table->json('career_paths')->nullable(); // Array of career paths
            $table->boolean('is_free')->default(false);
            $table->boolean('has_exam')->default(true);
            $table->string('exam_cost')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
