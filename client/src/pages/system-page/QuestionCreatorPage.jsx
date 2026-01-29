import { useState, useEffect } from 'react';
import { saveBatch } from '../../utils/system-utils/homepage-utils/api';
import ToastContainer from '../../components/system-components/alert-components/ToastContainer';
import { useToast } from '../../utils/system-utils/alert-utils/useToast';

const QuestionCreatorPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [savedBatches, setSavedBatches] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [manualQuestions, setManualQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple_choice',
    choices: ['', '', '', ''],
    correct_answer: '',
    difficulty: 'medium'
  });
  const [bulkText, setBulkText] = useState('');

  const { toasts, removeToast, showSuccess, showError, showWarning, showInfo } = useToast();

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      showInfo('PDF file selected');
    } else {
      showError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputMode === 'pdf' && (!file || !title)) {
      showError('Please provide both title and PDF file');
      return;
    }

    if (inputMode === 'text' && (!textInput || !title)) {
      showError('Please provide both title and text content');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    
    if (inputMode === 'pdf') {
      formData.append('pdf', file);
    } else {
      formData.append('text', textInput);
    }
    
    formData.append('title', title);

    try {
      const response = await fetch('http://localhost:8000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        setIsParsed(data.parsed || false);
        setTitle('');
        setFile(null);
        setTextInput('');
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        if (data.parsed) {
          showSuccess(`${data.questions.length} questions parsed! Please set correct answers.`);
        } else {
          showSuccess(`${data.questions.length} questions generated successfully!`);
        }
      } else {
        showError(data.error || 'Failed to generate questions');
        console.error('Server error:', data);
      }
    } catch (err) {
      showError('Error uploading: ' + err.message);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correct_answer) {
      showError('Please fill in question and correct answer');
      return;
    }

    if (currentQuestion.type === 'multiple_choice') {
      const filledChoices = currentQuestion.choices.filter(c => c.trim() !== '');
      if (filledChoices.length < 2) {
        showError('Please provide at least 2 choices');
        return;
      }
      if (!filledChoices.includes(currentQuestion.correct_answer)) {
        showError('Correct answer must be one of the choices');
        return;
      }
    }

    setManualQuestions([...manualQuestions, { ...currentQuestion, id: Date.now() }]);
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      choices: ['', '', '', ''],
      correct_answer: '',
      difficulty: 'medium'
    });
    setError('');
    showSuccess('Question added successfully!');
  };

  const handleSaveManualQuestions = async () => {
    if (manualQuestions.length === 0) {
      showError('Please add at least one question');
      return;
    }

    if (!title) {
      showError('Please provide a batch title');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/create-manual-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          questions: manualQuestions
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Questions saved successfully!');
        setManualQuestions([]);
        setTitle('');
      } else {
        showError(data.error || 'Failed to save questions');
      }
    } catch (err) {
      showError('Error saving questions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveManualQuestion = (id) => {
    setManualQuestions(manualQuestions.filter(q => q.id !== id));
  };

  const parseBulkQuestions = () => {
    if (!bulkText.trim()) {
      showError('Please paste some text to parse');
      return;
    }

    const lines = bulkText.split('\n');
    const parsed = [];
    let currentQ = null;
    let currentChoices = [];

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      // Check if line is a question (ends with ?)
      if (line.endsWith('?')) {
        // Save previous question if exists
        if (currentQ && currentChoices.length >= 2) {
          parsed.push({
            id: Date.now() + Math.random(),
            question: currentQ,
            type: 'multiple_choice',
            choices: currentChoices,
            correct_answer: '', // User will select
            difficulty: 'medium'
          });
        }
        currentQ = line;
        currentChoices = [];
      }
      // Check if line is a choice (starts with A., B., C., D., etc.)
      else if (/^[A-Z]\.\s*(.+)$/.test(line)) {
        const match = line.match(/^[A-Z]\.\s*(.+)$/);
        if (match) {
          currentChoices.push(match[1].trim());
        }
      }
    });

    // Save last question
    if (currentQ && currentChoices.length >= 2) {
      parsed.push({
        id: Date.now() + Math.random(),
        question: currentQ,
        type: 'multiple_choice',
        choices: currentChoices,
        correct_answer: '', // User will select
        difficulty: 'medium'
      });
    }

    if (parsed.length > 0) {
      setManualQuestions([...manualQuestions, ...parsed]);
      setBulkText('');
      setError('');
      showSuccess(`${parsed.length} question(s) parsed successfully!`);
    } else {
      showError('No valid questions found. Please check the format.');
    }
  };

  const handleUpdateManualQuestionAnswer = (id, answer) => {
    setManualQuestions(manualQuestions.map(q => 
      q.id === id ? { ...q, correct_answer: answer } : q
    ));
  };

  const handleSaveBatch = async () => {
    if (questions.length === 0) {
      showError('No questions to save');
      return;
    }

    try {
      const data = await saveBatch(title || 'Untitled Batch', questions);

      if (data.success) {
        setSavedBatches([...savedBatches, data.batch]);
        setQuestions([]);
        setTitle('');
        setIsParsed(false);
        showSuccess('Questions saved successfully!');
      } else {
        showError('Failed to save questions');
      }
    } catch (err) {
      showError('Error saving questions: ' + err.message);
    }
  };

  const handleUpdateCorrectAnswer = (index, newAnswer) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].correct_answer = newAnswer;
    updatedQuestions[index].answer = newAnswer;
    setQuestions(updatedQuestions);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-40"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-black mb-6">Create Questions</h2>
          
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setInputMode('pdf')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                inputMode === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                inputMode === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                inputMode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Manual Entry
            </button>
          </div>

          {inputMode === 'manual' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-black font-medium mb-2">
                  Batch Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter batch title"
                />
              </div>

              {/* Bulk Text Parser */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-black mb-2">Quick Add: Paste Questions</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Paste multiple questions with choices (format: Question? A. Choice1 B. Choice2...)
                </p>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[150px] font-mono text-sm"
                  placeholder="Example:
Where was José Rizal born?
A. Manila
B. Calamba, Laguna
C. Dapitan
D. Cebu

When was José Rizal born?
A. June 12, 1898
B. June 19, 1861
..."
                />
                <button
                  type="button"
                  onClick={parseBulkQuestions}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Parse & Add Questions
                </button>
              </div>

              <div className="border-t border-gray-300 pt-4">
                <p className="text-center text-gray-500 text-sm mb-4">OR</p>
              </div>

              <div className="border border-gray-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-black mb-4">Add Single Question</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-black font-medium mb-2">Question</label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter your question"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-black font-medium mb-2">Type</label>
                    <select
                      value={currentQuestion.type}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="text">Text Answer</option>
                    </select>
                  </div>

                  {currentQuestion.type === 'multiple_choice' && (
                    <div>
                      <label className="block text-black font-medium mb-2">Choices</label>
                      {currentQuestion.choices.map((choice, index) => (
                        <input
                          key={index}
                          type="text"
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...currentQuestion.choices];
                            newChoices[index] = e.target.value;
                            setCurrentQuestion({...currentQuestion, choices: newChoices});
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-2"
                          placeholder={`Choice ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-black font-medium mb-2">Correct Answer</label>
                    {currentQuestion.type === 'multiple_choice' ? (
                      <select
                        value={currentQuestion.correct_answer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, correct_answer: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Select correct answer</option>
                        {currentQuestion.choices.filter(c => c.trim() !== '').map((choice, index) => (
                          <option key={index} value={choice}>{choice}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={currentQuestion.correct_answer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, correct_answer: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter correct answer"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddManualQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                  >
                    Add Question
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {manualQuestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Questions Added ({manualQuestions.length})
                  </h3>
                  <div className="space-y-3">
                    {manualQuestions.map((q, index) => (
                      <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-black font-medium mb-2">Q{index + 1}: {q.question}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveManualQuestion(q.id)}
                            className="text-red-600 hover:text-red-700 font-bold ml-2"
                          >
                            ×
                          </button>
                        </div>
                        
                        {q.type === 'multiple_choice' && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Select Correct Answer:</p>
                            <div className="space-y-2">
                              {q.choices.filter(c => c && c.trim() !== '').map((choice, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`manual-question-${q.id}`}
                                    checked={q.correct_answer === choice}
                                    onChange={() => handleUpdateManualQuestionAnswer(q.id, choice)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <label className={`text-sm ${q.correct_answer === choice ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                                    {choice} {q.correct_answer === choice && '✓'}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {!q.correct_answer && (
                              <p className="text-red-600 text-xs mt-2">⚠ Please select a correct answer</p>
                            )}
                          </div>
                        )}
                        
                        {q.type === 'text' && (
                          <p className="text-sm text-gray-600">Correct: {q.correct_answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveManualQuestions}
                    disabled={loading || manualQuestions.some(q => !q.correct_answer)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : manualQuestions.some(q => !q.correct_answer) ? 'Select All Correct Answers First' : 'Save Batch'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-black font-medium mb-2">
                  Module Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter module title"
                />
              </div>

              {inputMode === 'pdf' ? (
                <div>
                  <label className="block text-black font-medium mb-2">
                    PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-black font-medium mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[200px]"
                    placeholder="Paste or type your text content here..."
                  />
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Generating Questions...' : 'Generate Questions'}
              </button>
            </form>
          )}
        </div>

        {questions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-black">
                {isParsed ? 'Parsed Questions' : 'Generated Questions'} ({questions.length})
              </h2>
              <button
                onClick={handleSaveBatch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Save Batch
              </button>
            </div>

            {isParsed && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  ✓ Questions automatically parsed! Please review and set the correct answer for each question below.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white font-semibold px-3 py-1 rounded text-sm">
                      Q{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-black font-medium mb-2">{q.question}</p>
                      
                      {q.type === 'multiple_choice' && q.choices && (
                        <div className="space-y-2 mb-3">
                          <p className="text-sm font-medium text-gray-700">Choices:</p>
                          {q.choices.map((choice, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`question-${index}`}
                                checked={q.correct_answer === choice}
                                onChange={() => handleUpdateCorrectAnswer(index, choice)}
                                className="w-4 h-4 text-blue-600"
                              />
                              <label className={`text-sm ${q.correct_answer === choice ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                                {choice} {q.correct_answer === choice && '✓'}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'text' && (
                        <p className="text-gray-700 text-sm">Answer: {q.answer}</p>
                      )}
                      
                      <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionCreatorPage;
