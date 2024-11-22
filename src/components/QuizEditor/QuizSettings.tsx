import React from 'react';
import type { Quiz, Language, QuizType } from '../../types/quiz';

interface QuizSettingsProps {
  quiz: Quiz;
  onChange?: (quiz: Quiz) => void;
  onClose: () => void;
  onSave?: (quiz: Quiz) => void;
}

export default function QuizSettings({
  quiz: initialQuiz,
  onChange,
  onClose,
  onSave,
}: QuizSettingsProps) {
  const [quiz, setQuiz] = React.useState(initialQuiz);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz.title.trim()) {
      return;
    }
    if (onSave) {
      onSave(quiz);
    } else if (onChange) {
      onChange(quiz);
      onClose();
    }
  };

  const handleChange = (updates: Partial<Quiz>) => {
    const updatedQuiz = { ...quiz, ...updates };
    setQuiz(updatedQuiz);
    if (onChange) {
      onChange(updatedQuiz);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Quiz Title
        </label>
        <input
          type="text"
          value={quiz.title}
          onChange={(e) => handleChange({ title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
          placeholder="Enter quiz title"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={quiz.description || ''}
          onChange={(e) => handleChange({ description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          rows={3}
          placeholder="Enter quiz description (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            value={quiz.language}
            onChange={(e) => handleChange({ language: e.target.value as Language })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Quiz Type
          </label>
          <select
            value={quiz.type}
            onChange={(e) => handleChange({ type: e.target.value as QuizType })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          >
            <option value="quiz">Multiple Choice</option>
            <option value="vrai-faux">True/False</option>
            <option value="puzzle">Puzzle</option>
            <option value="curseur">Slider</option>
            <option value="reponse-libre">Free Response</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            value={quiz.timeLimit || ''}
            onChange={(e) => handleChange({ timeLimit: parseInt(e.target.value) })}
            min="5"
            max="120"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Points
          </label>
          <input
            type="number"
            value={quiz.points || ''}
            onChange={(e) => handleChange({ points: parseInt(e.target.value) })}
            min="0"
            max="1000"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!quiz.title.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {onSave ? 'Create Quiz' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}