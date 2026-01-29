<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PdfModule extends Model
{
    protected $fillable = [
        'title',
        'file_path',
        'content',
        'question_count',
        'question_limit'
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
