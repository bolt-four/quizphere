import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import QuizList from '../components/QuizList';
import Modal from '../components/Modal';
import QuizSettings from '../components/QuizEditor/QuizSettings';
import type { Quiz } from '../types/quiz';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateBlank = () => {
    setShowSettings(true);
  };

  const handleQuizCreate = (quiz: Quiz) => {
    navigate('/builder', { state: { quiz } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onCreateBlank={handleCreateBlank} />
      <QuizList />

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Create New Quiz"
      >
        <QuizSettings
          quiz={{
            id: crypto.randomUUID(),
            title: 'Untitled Quiz',
            language: 'en',
            type: 'quiz',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft',
            questions: [],
            timeLimit: 30,
            points: 100
          }}
          onClose={() => setShowSettings(false)}
          onSave={handleQuizCreate}
        />
      </Modal>
    </div>
  );
}