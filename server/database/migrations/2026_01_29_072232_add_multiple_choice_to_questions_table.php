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
        Schema::table('questions', function (Blueprint $table) {
            $table->string('type')->default('text')->after('difficulty'); // 'text' or 'multiple_choice'
            $table->json('choices')->nullable()->after('type');
            $table->string('correct_answer')->nullable()->after('choices');
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['type', 'choices', 'correct_answer']);
        });
    }
};
