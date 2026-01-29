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
        Schema::create('quiz_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pdf_module_id')->constrained()->onDelete('cascade');
            $table->string('batch_title');
            $table->integer('total_questions');
            $table->integer('correct_answers');
            $table->decimal('percentage', 5, 2);
            $table->integer('time_taken'); // in seconds
            $table->json('answers'); // user's answers
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_histories');
    }
};
