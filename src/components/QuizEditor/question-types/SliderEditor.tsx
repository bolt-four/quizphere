import React from 'react';
import type { Choice } from '../../../types/quiz';

interface SliderEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

export default function SliderEditor({ choices, onChange }: SliderEditorProps) {
  const currentChoice = choices[0] || {
    id: crypto.randomUUID(),
    text: '',
    isCorrect: true,
    min: 0,
    max: 100,
    correctValue: 50
  };

  const handleChange = (updates: Partial<Choice>) => {
    onChange([{ ...currentChoice, ...updates }]);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Slider Range and Correct Value
      </label>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Minimum</label>
          <input
            type="number"
            value={currentChoice.min || 0}
            onChange={(e) => handleChange({ min: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Maximum</label>
          <input
            type="number"
            value={currentChoice.max || 100}
            onChange={(e) => handleChange({ max: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Correct Value</label>
          <input
            type="number"
            value={currentChoice.correctValue || 50}
            onChange={(e) => handleChange({ correctValue: parseInt(e.target.value) })}
            min={currentChoice.min}
            max={currentChoice.max}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <input
        type="range"
        value={currentChoice.correctValue || 50}
        min={currentChoice.min}
        max={currentChoice.max}
        onChange={(e) => handleChange({ correctValue: parseInt(e.target.value) })}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}