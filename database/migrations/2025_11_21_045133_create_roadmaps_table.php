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
        Schema::create('roadmaps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id')->unique();
            $table->string('career_goal');
            $table->json('semester_plans')->nullable(); // Semester-by-semester roadmap
            $table->json('skills_to_learn')->nullable(); // Priority-ordered skills
            $table->json('organizations_to_join')->nullable();
            $table->json('courses_to_take')->nullable();
            $table->json('certificates_to_earn')->nullable();
            $table->json('projects_to_build')->nullable();
            $table->json('internships_to_pursue')->nullable();
            $table->json('gap_analysis')->nullable(); // What's missing
            $table->decimal('success_probability', 3, 2)->nullable(); // 0-1
            $table->text('ai_insights')->nullable();
            $table->integer('completion_percentage')->default(0);
            $table->timestamps();
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roadmaps');
    }
};
