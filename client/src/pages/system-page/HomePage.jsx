import React, { useState } from 'react';
import QuestionBatchModal from '../../components/system-components/homepage-components/QuestionBatchModal';
import QuizHistoryModal from '../../components/system-components/homepage-components/QuizHistoryModal';

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-black">
              Welcome to Our Q&A Platform
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              A question-and-answer web system is an online platform where users can post 
              questions on specific topics and receive answers from other users, experts, 
              or moderators, promoting knowledge sharing and collaborative problem-solving 
              within a community through structured discussions, voting, and feedback features 
              that help surface the most helpful and accurate responses.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center pt-6">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Browse Batch Questions
            </button>
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Quiz History
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-12">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-3">Ask Questions</h3>
              <p className="text-gray-700">
                Post your questions and get answers from the community
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-3">Share Knowledge</h3>
              <p className="text-gray-700">
                Help others by providing accurate and helpful answers
              </p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-3">Vote & Feedback</h3>
              <p className="text-gray-700">
                Surface the best answers through community voting
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Question Batch Modal */}
      <QuestionBatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Quiz History Modal */}
      <QuizHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
    </div>
  );
};

export default HomePage;
