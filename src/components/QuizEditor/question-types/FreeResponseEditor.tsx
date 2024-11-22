import React from 'react';
import type { Choice } from '../../../types/quiz';

interface FreeResponseEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

export default function FreeResponseEditor({ choices, onChange }: FreeResponseEditorProps) {
  const handleAddChoice = () => {
    const newChoice = {
      id: crypto.randomUUID(),
      text: '',
      isCorrect: true
    };
    onChange([...choices, newChoice]);
  };

  const handleDeleteChoice = (id: string) => {
    const updatedChoices = choices.filter(choice => choice.id !== id);
    onChange(updatedChoices);
  };

  const handleChangeText = (id: string, text: string) => {
    const updatedChoices = choices.map(choice =>
      choice.id === id ? { ...choice, text } : choice
    );
    onChange(updatedChoices);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Correct Answers
      </label>
      {choices.map((choice) => (
        <div key={choice.id} className="flex items-center space-x-2">
          <input
            type="text"
            value={choice.text}
            onChange={(e) => handleChangeText(choice.id, e.target.value)}
            placeholder="Enter a correct answer"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            type="button"
            onClick={() => handleDeleteChoice(choice.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddChoice}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Another Answer
      </button>
    </div>
  );
}