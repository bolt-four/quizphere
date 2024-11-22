import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Quiz, Question, Choice } from '../types/quiz';
import { ArrowLeft, ArrowRight, Timer, Edit2, GripVertical } from 'lucide-react';

export default function QuizPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz as Quiz;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 30);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const pointsPerQuestion = quiz.points || 10; // Points configured per question

  useEffect(() => {
    if (!quiz) {
      navigate('/');
      return;
    }
  }, [quiz, navigate]);

  useEffect(() => {
    if (showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext();
          return quiz.timeLimit || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResult]);

  const calculateScore = () => {
    let totalScore = 0;

    quiz.questions.forEach((question) => {
      const answer = answers[question.id];
      if (!answer) return;

      switch (question.type) {
        case 'quiz':
          // Check if all selected answers are correct and no incorrect ones are selected
          const selectedChoices = new Set(answer as string[]);
          const correctChoices = new Set(question.choices.filter(c => c.isCorrect).map(c => c.id));
          const isCorrect = 
            selectedChoices.size === correctChoices.size &&
            [...selectedChoices].every(id => correctChoices.has(id));
          if (isCorrect) totalScore += pointsPerQuestion;
          break;

        case 'vrai-faux':
          if (answer === question.choices.find(c => c.isCorrect)?.id) {
            totalScore += pointsPerQuestion;
          }
          break;

        case 'puzzle':
          // Check if the order matches exactly
          const isOrderCorrect = answer.every((id: string, index: number) => {
            const choice = question.choices.find(c => c.id === id);
            return choice?.order === index;
          });
          if (isOrderCorrect) totalScore += pointsPerQuestion;
          break;

        case 'curseur':
          const choice = question.choices[0];
          const value = parseInt(answer);
          if (value === choice.correctValue) {
            totalScore += pointsPerQuestion;
          } else {
            // Partial credit based on how close the answer is
            const range = choice.max! - choice.min!;
            const deviation = Math.abs(value - choice.correctValue!);
            const accuracy = Math.max(0, 1 - (deviation / range));
            totalScore += pointsPerQuestion * accuracy;
          }
          break;

        case 'reponse-libre':
          const correctAnswers = question.choices.map(c => c.text.toLowerCase());
          if (correctAnswers.includes(answer.toLowerCase())) {
            totalScore += pointsPerQuestion;
          }
          break;
      }
    });

    return Math.round(totalScore);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResult(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(quiz.timeLimit || 30);
    }
  };

  const handleGoToBuilder = () => {
    navigate('/builder', { state: { quiz } });
  };

  const renderQuestionContent = () => {
    const answer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'quiz':
        return (
          <div className="space-y-3">
            {currentQuestion.choices.map((choice) => {
              const isSelected = (answer || []).includes(choice.id);
              return (
                <label
                  key={choice.id}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const currentAnswers = answer || [];
                      const newAnswers = e.target.checked
                        ? [...currentAnswers, choice.id]
                        : currentAnswers.filter((id: string) => id !== choice.id);
                      setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
                    }}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-3">{choice.text}</span>
                </label>
              );
            })}
          </div>
        );

      case 'vrai-faux':
        return (
          <div className="space-y-3">
            {currentQuestion.choices.map((choice) => (
              <label
                key={choice.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  answer === choice.id
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <input
                  type="radio"
                  checked={answer === choice.id}
                  onChange={() => setAnswers({ ...answers, [currentQuestion.id]: choice.id })}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-3">{choice.text}</span>
              </label>
            ))}
          </div>
        );

      case 'puzzle':
        const currentOrder = answer || currentQuestion.choices.map(c => c.id);
        return (
          <div className="space-y-2">
            {currentOrder.map((choiceId: string, index: number) => {
              const choice = currentQuestion.choices.find(c => c.id === choiceId)!;
              return (
                <div
                  key={choice.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIndex = index;
                    const newOrder = [...currentOrder];
                    const [moved] = newOrder.splice(fromIndex, 1);
                    newOrder.splice(toIndex, 0, moved);
                    setAnswers({ ...answers, [currentQuestion.id]: newOrder });
                  }}
                  className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 cursor-move hover:border-purple-300"
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <span className="flex-1">{choice.text}</span>
                </div>
              );
            })}
          </div>
        );

      case 'curseur':
        const sliderChoice = currentQuestion.choices[0];
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Min: {sliderChoice.min}</span>
              <span>Max: {sliderChoice.max}</span>
            </div>
            <input
              type="range"
              min={sliderChoice.min}
              max={sliderChoice.max}
              value={answer || sliderChoice.min}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-lg font-semibold text-purple-600">
              Current value: {answer || sliderChoice.min}
            </div>
          </div>
        );

      case 'reponse-libre':
        return (
          <input
            type="text"
            value={answer || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        );

      default:
        return null;
    }
  };

  if (!quiz) return null;

  if (showResult) {
    const totalPoints = pointsPerQuestion * quiz.questions.length;
    const percentageCorrect = (score / totalPoints) * 100;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Quiz Complete!</h1>
          <div className="text-center mb-8">
            <p className="text-2xl font-semibold text-purple-600">
              Your Score: {score} points
            </p>
            <p className="text-gray-600 mt-2">
              {Math.round(percentageCorrect)}% Correct
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleGoToBuilder}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go to Builder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Preview: {quiz.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-600">
              <Timer className="w-5 h-5 mr-2" />
              {timeLeft}s
            </div>
            <button
              onClick={handleGoToBuilder}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Go to Builder
            </button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-sm font-medium text-purple-600">
                {pointsPerQuestion} points
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
            
            {/* Display Images if any */}
            {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
              <div className="mb-6">
                <img
                  src={currentQuestion.imageUrls[0]}
                  alt="Question"
                  className="max-h-64 mx-auto object-contain"
                />
              </div>
            )}

            {/* Question-specific content */}
            {renderQuestionContent()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {isLastQuestion ? 'Finish' : 'Next'}
              <ArrowRight className="w-5 h-5 ml-2 inline-block" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}