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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->default('intermediate');
            $table->json('required_skills')->nullable(); // Array of skill IDs
            $table->json('related_careers')->nullable(); // Array of career paths
            $table->text('project_brief')->nullable();
            $table->json('resources')->nullable(); // Links to tutorials, documentation
            $table->string('tech_stack')->nullable();
            $table->text('learning_outcomes')->nullable();
            $table->string('estimated_duration')->nullable();
            $table->json('evaluation_criteria')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
