<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizHistory extends Model
{
    protected $fillable = [
        'pdf_module_id',
        'batch_title',
        'total_questions',
        'correct_answers',
        'percentage',
        'time_taken',
        'answers'
    ];

    protected $casts = [
        'answers' => 'array'
    ];

    public function pdfModule()
    {
        return $this->belongsTo(PdfModule::class);
    }
}
