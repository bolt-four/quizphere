import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizFormData, AIQuizResponse } from '../../types/quiz';
import { mapAIResponseToQuiz } from '../../utils/quizMapper';
import QuizTypeSelect from './QuizTypeSelect';
import LanguageSelect from './LanguageSelect';
import { AlertCircle, Loader2, XCircle, Upload, PlusCircle, MinusCircle } from 'lucide-react';

// Define initial form data
const initialFormData: QuizFormData = {
  language: 'en',
  proficiencyLevel: 'intermediate',
  slideCount: 10,
  toneStyle: 'conversational',
  topic: '',
  type: 'quiz',
};

interface ErrorState {
  visible: boolean;
  message: string;
}

export default function AIQuizForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuizFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]); // Handle multiple files
  const [error, setError] = useState<ErrorState>({ visible: false, message: '' });
  const [documentUrls, setDocumentUrls] = useState<string[]>([]); // Store multiple document URLs
  const [sourceUrls, setSourceUrls] = useState<string[]>(['']); // Track multiple source URLs

  // Error display and timeout
  const showError = (message: string) => {
    setError({ visible: true, message });
    setTimeout(() => setError({ visible: false, message: '' }), 5000);
  };

  // File upload function for a single file
  const uploadDocument = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      return data.filename; // Assuming the server returns { filename: "..." }
    } catch (error) {
      throw new Error('Failed to upload document. Please try again.');
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles)); // Convert FileList to Array<File>
      try {
        setLoading(true);
        const uploadedUrls = await Promise.all(
          Array.from(selectedFiles).map(file => uploadDocument(file))
        );
        setDocumentUrls(uploadedUrls);
      } catch (error) {
        showError(error instanceof Error ? error.message : 'Failed to upload documents');
      } finally {
        setLoading(false);
      }
    }
  };

  // Add a new URL field
  const addSourceUrl = () => {
    setSourceUrls([...sourceUrls, '']);
  };

  // Remove a URL field
  const removeSourceUrl = (index: number) => {
    setSourceUrls(sourceUrls.filter((_, i) => i !== index));
  };

  // Update URL at specific index
  const updateSourceUrl = (index: number, value: string) => {
    const updatedUrls = [...sourceUrls];
    updatedUrls[index] = value;
    setSourceUrls(updatedUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError({ visible: false, message: '' });

    try {
      const endpoint = `http://localhost:8001/${formData.type}/generate`;

      const transformedData = {
        language: formData.language,
        proficiency_level: formData.proficiencyLevel,
        slide_count: formData.slideCount,
        tone_style: formData.toneStyle,
        topic: formData.topic,
        source_url: sourceUrls.filter(url => !!url),
        source_document: documentUrls,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to generate quiz. Please try again.');
      }

      const data: AIQuizResponse = await response.json();
      const quiz = mapAIResponseToQuiz(data);
      
      // Navigate to builder with the generated quiz
      navigate('/builder', { state: { quiz } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(message);
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error.visible && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Generation Error</h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setError({ visible: false, message: '' })}
            className="ml-3"
          >
            <XCircle className="w-5 h-5 text-red-400 hover:text-red-500" />
          </button>
        </div>
      )}

      <QuizTypeSelect
        value={formData.type}
        onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LanguageSelect
          value={formData.language}
          onChange={(value) => setFormData((prev) => ({ ...prev, language: value }))}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Proficiency Level</label>
          <select
            value={formData.proficiencyLevel}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, proficiencyLevel: e.target.value as any }))
            }
            className="block w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Number of Slides (1-20)</label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.slideCount}
            onChange={(e) => setFormData((prev) => ({ ...prev, slideCount: parseInt(e.target.value) }))}
            className="block w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tone Style</label>
          <select
            value={formData.toneStyle}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, toneStyle: e.target.value as any }))
            }
            className="block w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="formal">Formal</option>
            <option value="conversational">Conversational</option>
            <option value="humorous">Humorous</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Topic</label>
        <input
          type="text"
          value={formData.topic}
          onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
          placeholder="Enter your quiz topic"
          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Source URLs (Optional)</label>
        {sourceUrls.map((url, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updateSourceUrl(index, e.target.value)}
              placeholder={`https://example${index + 1}.com`}
              className="block w-full px-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => removeSourceUrl(index)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              <MinusCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSourceUrl}
          className="flex items-center text-green-600 hover:text-green-800"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="ml-1">Add another URL</span>
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Source Document (Optional)</label>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv"
            className="hidden"
            id="file-Document"
            disabled={loading}
            multiple // Allow selection of multiple files
          />
          <label
            htmlFor="file-Document"
            className={`flex items-center justify-center w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm ${
              loading ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <Upload className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-600">
              {loading ? 'Uploading...' : files.length > 0 ? `${files.length} files selected` : 'Choose files...'}
            </span>
          </label>
          {documentUrls.length > 0 && (
            <p className="mt-2 text-sm text-green-600">Documents uploaded successfully</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          'Generate Quiz'
        )}
      </button>
    </form>
  );
}