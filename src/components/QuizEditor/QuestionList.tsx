import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { Question } from '../../types/quiz';

interface QuestionListProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onReorder?: (questions: Question[]) => void;
}

export default function QuestionList({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onReorder
}: QuestionListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !onReorder) return;

    const newQuestions = [...questions];
    const [draggedQuestion] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(dropIndex, 0, draggedQuestion);
    onReorder(newQuestions);
    setDraggedIndex(null);
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return 'Untitled Question';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
        <button
          onClick={onAdd}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Add Question"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {questions.map((question, index) => (
          <div
            key={question.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`group flex items-center gap-2 p-3 rounded-lg cursor-move transition-colors ${
              selectedId === question.id
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
            onClick={() => onSelect(question.id)}
          >
            <div className="flex-shrink-0 text-gray-400 hover:text-gray-600">
              <GripVertical className="w-5 h-5" />
            </div>
            
            <div className="flex-shrink-0 w-6 text-sm font-medium text-gray-500">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                {truncateText(question.text)}
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(question.id);
              }}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              title="Delete Question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No questions yet. Click the + button to add one.
          </div>
        )}
      </div>
    </div>
  );
}