import React from 'react';
import type { Choice } from '../../../types/quiz';

interface BooleanEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

export default function BooleanEditor({ choices, onChange }: BooleanEditorProps) {
  const initializeChoices = () => {
    if (choices.length !== 2) {
      return [
        { id: crypto.randomUUID(), text: 'True', isCorrect: false },
        { id: crypto.randomUUID(), text: 'False', isCorrect: false }
      ];
    }
    return choices;
  };

  const currentChoices = initializeChoices();

  const handleChange = (value: boolean) => {
    onChange(
      currentChoices.map(choice => ({
        ...choice,
        isCorrect: choice.text === (value ? 'True' : 'False')
      }))
    );
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Correct Answer
      </label>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            checked={currentChoices.find(c => c.text === 'True')?.isCorrect}
            onChange={() => handleChange(true)}
            className="w-5 h-5 text-purple-600 focus:ring-purple-500"
          />
          <span className="ml-2">True</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            checked={currentChoices.find(c => c.text === 'False')?.isCorrect}
            onChange={() => handleChange(false)}
            className="w-5 h-5 text-purple-600 focus:ring-purple-500"
          />
          <span className="ml-2">False</span>
        </label>
      </div>
    </div>
  );
}