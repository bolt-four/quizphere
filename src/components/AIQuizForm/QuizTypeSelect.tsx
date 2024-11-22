import React from 'react';
import type { QuizType } from '../../types/quiz';

interface QuizTypeSelectProps {
  value: QuizType;
  onChange: (value: QuizType) => void;
}

const quizTypes: { value: QuizType; label: string }[] = [
  { value: 'quiz', label: 'Multiple Choice Quiz' },
  { value: 'vrai-faux', label: 'True/False' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'curseur', label: 'Slider' },
  { value: 'reponse-libre', label: 'Free Response' },
];

export default function QuizTypeSelect({ value, onChange }: QuizTypeSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Quiz Type</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quizTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`px-4 py-3 text-sm border rounded-lg transition-colors ${
              value === type.value
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}