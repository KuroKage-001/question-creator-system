import React, { useState, useEffect } from 'react';

const QuizHistoryModal = ({ isOpen, onClose }) => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/quiz-history');
      const data = await response.json();
      if (data.success) {
        setHistories(data.histories);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">Quiz History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : histories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No quiz history yet. Take a quiz to see your results here!
            </div>
          ) : (
            <div className="space-y-4">
              {histories.map((history) => (
                <div key={history.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-600 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-black">{history.batch_title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(history.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(history.percentage)}`}>
                      {history.percentage}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-center bg-gray-50 rounded-lg p-3">
                    <div>
                      <p className="text-xs text-gray-600">Score</p>
                      <p className="text-lg font-semibold text-black">
                        {history.correct_answers}/{history.total_questions}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Correct</p>
                      <p className="text-lg font-semibold text-green-600">
                        {history.correct_answers}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Wrong</p>
                      <p className="text-lg font-semibold text-red-600">
                        {history.total_questions - history.correct_answers}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="text-lg font-semibold text-black">
                        {formatTime(history.time_taken)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizHistoryModal;
