import React, { useState, useEffect } from 'react';
import { ImagePlus, Plus, Trash, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import type { Question, Choice } from '../../types/quiz';
import MultipleChoiceEditor from './question-types/MultipleChoiceEditor';
import BooleanEditor from './question-types/BooleanEditor';
import PuzzleEditor from './question-types/PuzzleEditor';
import SliderEditor from './question-types/SliderEditor';
import FreeResponseEditor from './question-types/FreeResponseEditor';

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
}

interface ImageUploadResponse {
  url: string;
  filename: string;
  content_type: string;
}

export default function QuestionEditor({ question, onChange }: QuestionEditorProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Reset current image index when switching questions
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [question.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8001/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data: ImageUploadResponse = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const currentImages = question.imageUrls || [];
      const newImages = [...currentImages, ...uploadedUrls];
      onChange({ ...question, imageUrls: newImages });
      setCurrentImageIndex(newImages.length - 1);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = () => {
    const currentImages = question.imageUrls || [];
    if (currentImages.length === 0) return;

    const newImages = currentImages.filter((_, index) => index !== currentImageIndex);
    onChange({ ...question, imageUrls: newImages });
    setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
  };

  const renderQuestionTypeEditor = () => {
    switch (question.type) {
      case 'quiz':
        return (
          <MultipleChoiceEditor
            choices={question.choices}
            onChange={(choices) => onChange({ ...question, choices })}
          />
        );
      case 'vrai-faux':
        return (
          <BooleanEditor
            choices={question.choices}
            onChange={(choices) => onChange({ ...question, choices })}
          />
        );
      case 'puzzle':
        return (
          <PuzzleEditor
            choices={question.choices}
            onChange={(choices) => onChange({ ...question, choices })}
          />
        );
      case 'curseur':
        return (
          <SliderEditor
            choices={question.choices}
            onChange={(choices) => onChange({ ...question, choices })}
          />
        );
      case 'reponse-libre':
        return (
          <FreeResponseEditor
            choices={question.choices}
            onChange={(choices) => onChange({ ...question, choices })}
          />
        );
      default:
        return null;
    }
  };

  const images = question.imageUrls || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Question Text
        </label>
        <textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          rows={3}
          placeholder="Enter your question here..."
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Images
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              id={`image-upload-${question.id}`}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label
              htmlFor={`image-upload-${question.id}`}
              className="flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 cursor-pointer"
            >
              {uploading ? (
                <Upload className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4 mr-2" />
              )}
              Upload Images
            </label>
          </div>
        </div>

        {images.length > 0 && (
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={`Question image ${currentImageIndex + 1}`}
              className="w-full h-64 object-contain bg-gray-50"
            />
            
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 bg-black bg-opacity-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentImageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentImageIndex === 0}
                  className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white text-sm">
                  {currentImageIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() => setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1))}
                  disabled={currentImageIndex === images.length - 1}
                  className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleDeleteImage}
                className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
            <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Upload images for your question</p>
          </div>
        )}
      </div>

      {renderQuestionTypeEditor()}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Explanation (Optional)
        </label>
        <textarea
          value={question.explanation || ''}
          onChange={(e) => onChange({ ...question, explanation: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          rows={2}
          placeholder="Explain the correct answer..."
        />
      </div>
    </div>
  );
}