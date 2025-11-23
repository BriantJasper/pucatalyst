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
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['hard', 'soft'])->default('hard');
            $table->enum('category', ['Programming', 'Leadership', 'Communication', 'Cloud', 'Cybersecurity', 'Data Science', 'UI/UX', 'Business', 'Other'])->nullable();
            $table->integer('proficiency_level')->nullable(); // 1-5 scale
            $table->json('related_careers')->nullable(); // Array of career paths
            $table->integer('demand_score')->default(5); // 1-10
            $table->json('learning_resources')->nullable(); // URLs to courses/tutorials
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};
