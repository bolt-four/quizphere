import React, { useState } from 'react';
import { Brain, PenLine } from 'lucide-react';
import Modal from './Modal';
import AIQuizForm from './AIQuizForm/AIQuizForm';
import ProfileMenu from './ProfileMenu';
import type { Quiz } from '../types/quiz';

interface DashboardHeaderProps {
  onCreateBlank: () => void;
}

export default function DashboardHeader({ onCreateBlank }: DashboardHeaderProps) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold">QuizPhere</h1>
              <p className="mt-2 text-purple-100">Create engaging quizzes in multiple languages</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                className="flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                onClick={() => setIsAIModalOpen(true)}
              >
                <Brain className="w-5 h-5 mr-2" />
                Generate with AI
              </button>
              
              <button
                onClick={onCreateBlank}
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
              >
                <PenLine className="w-5 h-5 mr-2" />
                Create from Blank
              </button>

              <ProfileMenu />
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title="Generate Quiz with AI"
      >
        <AIQuizForm />
      </Modal>
    </>
  );
}