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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description');
            $table->string('category'); // Tech Club, Business, Sports, etc
            $table->string('logo')->nullable();
            $table->string('email')->nullable();
            $table->string('contact_person')->nullable();
            $table->text('achievements')->nullable();
            $table->json('career_paths')->nullable(); // Array of related career paths
            $table->integer('member_count')->default(0);
            $table->string('meeting_day')->nullable();
            $table->string('meeting_time')->nullable();
            $table->string('meeting_location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
