<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Updates courses table to support online courses (YouTube, Coursera, Udemy, etc.)
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Online course specific fields
            $table->string('url')->nullable()->after('description');
            $table->string('provider')->nullable()->after('url'); // YouTube, Coursera, Udemy, LinkedIn Learning, etc.
            $table->decimal('duration_hours', 6, 1)->nullable()->after('provider'); // Course duration in hours
            $table->boolean('is_free')->default(false)->after('duration_hours');
            $table->decimal('cost', 8, 2)->nullable()->after('is_free');
            $table->string('category')->nullable()->after('cost'); // Web Dev, Leadership, Data Science, etc.

            // Make university-specific fields nullable
            $table->string('department')->nullable()->change();
            $table->string('course_code')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['url', 'provider', 'duration_hours', 'is_free', 'cost', 'category']);
        });
    }
};
