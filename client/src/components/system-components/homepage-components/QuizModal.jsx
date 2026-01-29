import React, { useState, useEffect } from 'react';

const QuizModal = ({ isOpen, onClose, batch, questions }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [results, setResults] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    let interval;
    if (quizStarted && !quizFinished) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizFinished]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartQuiz = () => {
    const count = Math.min(questionCount, questions.length);
    const shuffled = shuffleArray(questions).slice(0, count);
    setShuffledQuestions(shuffled);
    setQuizStarted(true);
    setTimer(0);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = async () => {
    let correctCount = 0;
    shuffledQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.correct_answer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / shuffledQuestions.length) * 100;
    
    const resultData = {
      total: shuffledQuestions.length,
      correct: correctCount,
      percentage: percentage.toFixed(2),
      timeTaken: timer
    };

    setResults(resultData);
    setQuizFinished(true);

    // Save to history
    try {
      await fetch('http://localhost:8000/api/save-quiz-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdf_module_id: batch.id,
          batch_title: batch.title,
          total_questions: shuffledQuestions.length,
          correct_answers: correctCount,
          percentage: percentage,
          time_taken: timer,
          answers: userAnswers
        }),
      });
    } catch (err) {
      console.error('Error saving quiz history:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShuffledQuestions([]);
    setTimer(0);
    setResults(null);
  };

  if (!isOpen) return null;

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-black">{batch?.title}</h2>
            {quizStarted && !quizFinished && (
              <p className="text-gray-600 mt-1">Time: {formatTime(timer)}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!quizStarted ? (
            <div className="text-center space-y-6">
              <h3 className="text-xl font-semibold text-black">Ready to start?</h3>
              <p className="text-gray-600">
                This quiz contains {questions.length} questions. Select how many you want to answer:
              </p>
              
              <div>
                <label className="block text-black font-medium mb-2">Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].filter(n => n <= questions.length).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Start Quiz
              </button>
            </div>
          ) : quizFinished ? (
            <div className="text-center space-y-6">
              <h3 className="text-3xl font-bold text-black">Quiz Completed!</h3>
              <div className="bg-gray-100 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-gray-600">Score</p>
                  <p className="text-4xl font-bold text-blue-600">{results.percentage}%</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-600">Correct</p>
                    <p className="text-2xl font-semibold text-green-600">{results.correct}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="text-2xl font-semibold text-black">{results.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="text-2xl font-semibold text-black">{formatTime(results.timeTaken)}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                </p>
                <p className="text-gray-600">
                  Answered: {Object.keys(userAnswers).length} / {shuffledQuestions.length}
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-black mb-4">
                  {currentQuestion?.question}
                </h3>

                {currentQuestion?.type === 'multiple_choice' ? (
                  <div className="space-y-3">
                    {currentQuestion.choices?.filter(c => c.trim() !== '').map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(choice)}
                        className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors ${
                          userAnswers[currentQuestionIndex] === choice
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={userAnswers[currentQuestionIndex] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Type your answer"
                  />
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                
                {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                  <button
                    onClick={handleFinish}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                  >
                    Finish Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
