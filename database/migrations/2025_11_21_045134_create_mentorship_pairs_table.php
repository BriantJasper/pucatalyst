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
        Schema::create('mentorship_pairs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('alumni_id');
            $table->enum('status', ['pending', 'active', 'completed', 'declined'])->default('pending');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('goals')->nullable();
            $table->text('notes')->nullable();
            $table->integer('meeting_frequency')->default(1); // per week
            $table->integer('rating_by_student')->nullable();
            $table->integer('rating_by_alumni')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'alumni_id']);
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('alumni_id')->references('id')->on('alumni')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentorship_pairs');
    }
};
