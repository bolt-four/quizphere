import React, { useState } from 'react';
import { Plus, Trash, GripVertical } from 'lucide-react';
import type { Choice } from '../../../types/quiz';

interface MultipleChoiceEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

export default function MultipleChoiceEditor({ choices, onChange }: MultipleChoiceEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddChoice = () => {
    const newChoice: Choice = {
      id: crypto.randomUUID(),
      text: '',
      isCorrect: false
    };
    onChange([...choices, newChoice]);
  };

  const handleChoiceChange = (choiceId: string, updates: Partial<Choice>) => {
    onChange(
      choices.map(choice =>
        choice.id === choiceId ? { ...choice, ...updates } : choice
      )
    );
  };

  const handleDeleteChoice = (choiceId: string) => {
    onChange(choices.filter(choice => choice.id !== choiceId));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newChoices = [...choices];
    const [draggedChoice] = newChoices.splice(draggedIndex, 1);
    newChoices.splice(dropIndex, 0, draggedChoice);

    onChange(newChoices);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Answer Choices
        </label>
        <button
          onClick={handleAddChoice}
          className="flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Choice
        </button>
      </div>

      <div className="space-y-3">
        {choices.map((choice, index) => (
          <div
            key={choice.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center gap-3 p-2 border rounded-lg ${
              draggedIndex === index ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
            } transition-colors cursor-move`}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-5 h-5 text-gray-400" />
              <span className="w-8 text-sm font-medium text-gray-500">{index + 1}</span>
            </div>
            <input
              type="text"
              value={choice.text}
              onChange={(e) => handleChoiceChange(choice.id, { text: e.target.value })}
              placeholder="Enter answer choice"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <input
              type="checkbox"
              checked={choice.isCorrect}
              onChange={(e) => handleChoiceChange(choice.id, { isCorrect: e.target.checked })}
              className="w-5 h-5 text-purple-600 focus:ring-purple-500"
            />
            <button
              onClick={() => handleDeleteChoice(choice.id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}