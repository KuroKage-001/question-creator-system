<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'pdf_module_id',
        'question',
        'answer',
        'difficulty',
        'type',
        'choices',
        'correct_answer'
    ];

    protected $casts = [
        'choices' => 'array'
    ];

    public function pdfModule()
    {
        return $this->belongsTo(PdfModule::class);
    }
}
