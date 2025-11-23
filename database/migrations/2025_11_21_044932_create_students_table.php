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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('student_id')->unique()->nullable();
            $table->string('major');
            $table->enum('year', ['1', '2', '3', '4'])->default('1');
            $table->decimal('gpa', 3, 2)->nullable();
            $table->string('career_goal');
            $table->text('interests')->nullable(); // JSON array
            $table->json('skill_assessment')->nullable(); // {hard_skills: 0-5, soft_skills: 0-5}
            $table->string('resume_path')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
