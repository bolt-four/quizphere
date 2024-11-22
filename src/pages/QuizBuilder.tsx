import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuizEditor from '../components/QuizEditor/QuizEditor';
import type { Quiz } from '../types/quiz';

export default function QuizBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const [quiz] = useState<Quiz>(location.state?.quiz || {
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
  });

  const handleSave = async (updatedQuiz: Quiz) => {
    // TODO: Implement API call to save quiz
    console.log('Saving quiz:', updatedQuiz);
  };

  const handlePublish = async (updatedQuiz: Quiz) => {
    // TODO: Implement API call to publish quiz
    console.log('Publishing quiz:', updatedQuiz);
  };

  return (
    <QuizEditor
      quiz={quiz}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}