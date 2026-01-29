<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuestionController;

Route::post('/upload-pdf', [QuestionController::class, 'uploadPdf']);
Route::get('/modules', [QuestionController::class, 'getModules']);
Route::get('/questions/{moduleId}', [QuestionController::class, 'getQuestions']);
Route::post('/save-batch', [QuestionController::class, 'saveBatch']);
Route::get('/batches', [QuestionController::class, 'getBatches']);
Route::post('/create-manual-questions', [QuestionController::class, 'createManualQuestions']);
Route::post('/save-quiz-history', [QuestionController::class, 'saveQuizHistory']);
Route::get('/quiz-history', [QuestionController::class, 'getQuizHistory']);
Route::delete('/delete-batches', [QuestionController::class, 'deleteBatches']);
