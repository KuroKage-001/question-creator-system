import React, { useState, useEffect } from 'react';
import { fetchBatches, fetchQuestions } from '../../../utils/system-utils/homepage-utils/api';
import QuizModal from './QuizModal';
import { useToast } from '../../../utils/system-utils/alert-utils/useToast';
import ToastContainer from '../alert-components/ToastContainer';

const QuestionBatchModal = ({ isOpen, onClose }) => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);

  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadBatches();
      setDeleteMode(false);
      setSelectedBatches([]);
    }
  }, [isOpen]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await fetchBatches();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (batch) => {
    setLoading(true);
    try {
      const data = await fetchQuestions(batch.id);
      setQuestions(data);
      setSelectedBatch(batch);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToBatches = () => {
    setSelectedBatch(null);
    setQuestions([]);
    setDeleteMode(false);
    setSelectedBatches([]);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedBatches([]);
  };

  const toggleBatchSelection = (batchId) => {
    if (selectedBatches.includes(batchId)) {
      setSelectedBatches(selectedBatches.filter(id => id !== batchId));
    } else {
      setSelectedBatches([...selectedBatches, batchId]);
    }
  };

  const selectAllBatches = () => {
    if (selectedBatches.length === batches.length) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(batches.map(b => b.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBatches.length === 0) {
      showError('Please select at least one batch to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedBatches.length} batch(es)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/delete-batches', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_ids: selectedBatches
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Batches deleted successfully!');
        setSelectedBatches([]);
        setDeleteMode(false);
        loadBatches();
      } else {
        showError('Failed to delete batches: ' + data.error);
      }
    } catch (err) {
      showError('Error deleting batches: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">
              {selectedBatch ? selectedBatch.title : 'Browse Batch Questions'}
            </h2>
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
            ) : selectedBatch ? (
              <div>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={handleBackToBatches}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Back to Batches
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors ml-auto"
                  >
                    Start Quiz
                  </button>
                </div>
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
                            <div className="text-sm text-gray-700 mb-2 space-y-1">
                              {q.choices.filter(c => c && c.trim() !== '').map((choice, i) => (
                                <div key={i}>
                                  • {choice}
                                </div>
                              ))}
                            </div>
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
            ) : (
              <div>
                {/* Delete Mode Controls */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={toggleDeleteMode}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      deleteMode
                        ? 'bg-gray-200 text-black hover:bg-gray-300'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {deleteMode ? 'Cancel' : 'Delete Batches'}
                  </button>

                  {deleteMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllBatches}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-medium transition-colors"
                      >
                        {selectedBatches.length === batches.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <button
                        onClick={handleDeleteSelected}
                        disabled={selectedBatches.length === 0}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete Selected ({selectedBatches.length})
                      </button>
                    </div>
                  )}
                </div>

                {/* Batches List */}
                <div className="grid gap-4">
                  {batches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No question batches found. Create some questions first!
                    </div>
                  ) : (
                    batches.map((batch) => (
                      <div
                        key={batch.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          deleteMode
                            ? selectedBatches.includes(batch.id)
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200 hover:border-red-400 cursor-pointer'
                            : 'border-gray-200 hover:border-blue-600 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (deleteMode) {
                            toggleBatchSelection(batch.id);
                          } else {
                            loadQuestions(batch);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {deleteMode && (
                            <input
                              type="checkbox"
                              checked={selectedBatches.includes(batch.id)}
                              onChange={() => toggleBatchSelection(batch.id)}
                              className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-black mb-2">
                              {batch.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{batch.question_count} questions</span>
                              <span>•</span>
                              <span>{new Date(batch.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          isOpen={showQuiz}
          onClose={handleCloseQuiz}
          batch={selectedBatch}
          questions={questions}
        />
      )}
    </>
  );
};

export default QuestionBatchModal;
