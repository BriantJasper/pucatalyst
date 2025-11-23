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
        Schema::create('face_recognitions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->text('face_data'); // JSON serialized face descriptors
            $table->text('face_image'); // Base64 or file path
            $table->boolean('is_verified')->default(false);
            $table->integer('confidence_score')->default(0); // 0-100
            $table->timestamp('last_login_with_face')->nullable();
            $table->integer('failed_attempts')->default(0);
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('face_recognitions');
    }
};
