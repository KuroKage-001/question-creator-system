<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PdfModule;
use App\Models\Question;
use App\Models\QuizHistory;
use Smalot\PdfParser\Parser;

class QuestionController extends Controller
{
    public function uploadPdf(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255'
            ]);

            $content = '';
            $filePath = null;

            // Check if it's a PDF upload or text input
            if ($request->hasFile('pdf')) {
                $request->validate([
                    'pdf' => 'required|mimes:pdf|max:10240',
                ]);

                $file = $request->file('pdf');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('pdfs', $fileName, 'public');

                // Extract text from PDF
                $parser = new Parser();
                $pdf = $parser->parseFile($file->getRealPath());
                $content = $pdf->getText();
            } elseif ($request->has('text')) {
                $content = $request->input('text');
                $filePath = 'text_input';
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Please provide either a PDF file or text content'
                ], 400);
            }

            // Check if text contains multiple choice questions
            $parsedQuestions = $this->parseMultipleChoiceQuestions($content);
            
            if (!empty($parsedQuestions)) {
                // Create PDF module for parsed questions
                $pdfModule = PdfModule::create([
                    'title' => $request->title,
                    'file_path' => $filePath,
                    'content' => $content,
                    'question_count' => count($parsedQuestions)
                ]);

                // Create questions from parsed data
                $questions = [];
                foreach ($parsedQuestions as $q) {
                    $question = Question::create([
                        'pdf_module_id' => $pdfModule->id,
                        'question' => $q['question'],
                        'answer' => $q['correct_answer'],
                        'difficulty' => 'medium',
                        'type' => 'multiple_choice',
                        'choices' => $q['choices'],
                        'correct_answer' => $q['correct_answer']
                    ]);
                    $questions[] = $question;
                }

                return response()->json([
                    'success' => true,
                    'module' => $pdfModule,
                    'questions' => $questions,
                    'parsed' => true
                ]);
            } else {
                // Original text-based question generation
                $pdfModule = PdfModule::create([
                    'title' => $request->title,
                    'file_path' => $filePath,
                    'content' => $content
                ]);

                // Generate questions
                $questions = $this->generateQuestions($content, $pdfModule->id);

                $pdfModule->update(['question_count' => count($questions)]);

                return response()->json([
                    'success' => true,
                    'module' => $pdfModule,
                    'questions' => $questions,
                    'parsed' => false
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    private function parseMultipleChoiceQuestions($text)
    {
        $questions = [];
        
        // Split by lines
        $lines = explode("\n", $text);
        $currentQuestion = null;
        $currentChoices = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Check if line is a question (ends with ?)
            if (preg_match('/\?$/', $line)) {
                // Save previous question if exists
                if ($currentQuestion && count($currentChoices) >= 2) {
                    $questions[] = [
                        'question' => $currentQuestion,
                        'choices' => array_column($currentChoices, 'text'),
                        'correct_answer' => $currentChoices[0]['text'] // Default to first choice
                    ];
                }
                
                $currentQuestion = $line;
                $currentChoices = [];
            }
            // Check if line is a choice (starts with A., B., C., D., etc.)
            elseif (preg_match('/^([A-Z])\.\s*(.+)$/', $line, $matches)) {
                $currentChoices[] = [
                    'letter' => $matches[1],
                    'text' => trim($matches[2])
                ];
            }
        }
        
        // Save last question
        if ($currentQuestion && count($currentChoices) >= 2) {
            $questions[] = [
                'question' => $currentQuestion,
                'choices' => array_column($currentChoices, 'text'),
                'correct_answer' => $currentChoices[0]['text'] // Default to first choice
            ];
        }
        
        return $questions;
    }

    private function generateQuestions($content, $pdfModuleId)
    {
        $questions = [];
        $sentences = preg_split('/[.!?]+/', $content);
        $sentences = array_filter(array_map('trim', $sentences));

        $count = 0;
        foreach ($sentences as $sentence) {
            if ($count >= 10) break;
            if (strlen($sentence) > 50) {
                $question = Question::create([
                    'pdf_module_id' => $pdfModuleId,
                    'question' => "What is discussed about: " . substr($sentence, 0, 100) . "...?",
                    'answer' => $sentence,
                    'difficulty' => 'medium'
                ]);
                $questions[] = $question;
                $count++;
            }
        }

        return $questions;
    }

    public function getModules()
    {
        $modules = PdfModule::with('questions')->latest()->get();
        return response()->json($modules);
    }

    public function getQuestions($moduleId)
    {
        $questions = Question::where('pdf_module_id', $moduleId)->get();
        return response()->json($questions);
    }

    public function saveBatch(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'questions' => 'required|array'
            ]);

            // Update correct answers if provided
            foreach ($request->questions as $questionData) {
                if (isset($questionData['id']) && isset($questionData['correct_answer'])) {
                    Question::where('id', $questionData['id'])->update([
                        'correct_answer' => $questionData['correct_answer'],
                        'answer' => $questionData['correct_answer']
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Batch saved successfully',
                'batch' => [
                    'title' => $request->title,
                    'question_count' => count($request->questions)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getBatches()
    {
        try {
            $batches = PdfModule::select('id', 'title', 'question_count', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'batches' => $batches
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createManualQuestions(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'questions' => 'required|array|min:1',
                'questions.*.question' => 'required|string',
                'questions.*.type' => 'required|in:text,multiple_choice',
                'questions.*.choices' => 'required_if:questions.*.type,multiple_choice|array',
                'questions.*.correct_answer' => 'required|string',
            ]);

            // Create PDF module for manual questions
            $pdfModule = PdfModule::create([
                'title' => $request->title,
                'file_path' => 'manual_entry',
                'content' => 'Manual question entry',
                'question_count' => count($request->questions),
                'question_limit' => $request->input('question_limit', count($request->questions))
            ]);

            // Create questions
            $createdQuestions = [];
            foreach ($request->questions as $q) {
                $question = Question::create([
                    'pdf_module_id' => $pdfModule->id,
                    'question' => $q['question'],
                    'answer' => $q['correct_answer'],
                    'difficulty' => $q['difficulty'] ?? 'medium',
                    'type' => $q['type'],
                    'choices' => $q['type'] === 'multiple_choice' ? $q['choices'] : null,
                    'correct_answer' => $q['correct_answer']
                ]);
                $createdQuestions[] = $question;
            }

            return response()->json([
                'success' => true,
                'module' => $pdfModule,
                'questions' => $createdQuestions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function saveQuizHistory(Request $request)
    {
        try {
            $request->validate([
                'pdf_module_id' => 'required|exists:pdf_modules,id',
                'batch_title' => 'required|string',
                'total_questions' => 'required|integer',
                'correct_answers' => 'required|integer',
                'percentage' => 'required|numeric',
                'time_taken' => 'required|integer',
                'answers' => 'required|array'
            ]);

            $history = QuizHistory::create($request->all());

            return response()->json([
                'success' => true,
                'history' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getQuizHistory()
    {
        try {
            $histories = QuizHistory::with('pdfModule')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'histories' => $histories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteBatches(Request $request)
    {
        try {
            $request->validate([
                'batch_ids' => 'required|array',
                'batch_ids.*' => 'exists:pdf_modules,id'
            ]);

            PdfModule::whereIn('id', $request->batch_ids)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Batches deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
