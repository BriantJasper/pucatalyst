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
        Schema::create('alumni', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('alumni_id')->unique()->nullable();
            $table->string('current_company')->nullable();
            $table->string('current_position')->nullable();
            $table->string('career_path');
            $table->text('career_description')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->json('organizations_joined')->nullable(); // Array of org IDs
            $table->json('certificates_earned')->nullable(); // Array of cert IDs
            $table->json('internships')->nullable(); // Array of internship data
            $table->json('skills_developed')->nullable(); // Array of skills
            $table->text('advice_for_juniors')->nullable();
            $table->integer('verification_status')->default(0); // 0: pending, 1: verified, -1: rejected
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
        Schema::dropIfExists('alumni');
    }
};
