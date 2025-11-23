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
        Schema::create('student_organizations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('organization_id');
            $table->enum('role', ['member', 'officer', 'leader', 'founder'])->default('member');
            $table->date('joined_date')->nullable();
            $table->date('left_date')->nullable();
            $table->text('achievements')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['student_id', 'organization_id']);
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_organizations');
    }
};
