import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Edit2, Share2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { toast, Toaster } from '../components/ui/toast';
import type { Quiz, Question, Choice } from '../types/quiz';

// Language mapping
const languageNames = {
    fr: 'French',
    en: 'English',
    ar: 'Arabic',
    de: 'German'
};

// Type definition for QuizMetadata
interface QuizMetadata {
    quiz_id: string;
    title: string;
    type: string;
    language: string;
    created_at: string;
    updated_at: string;
    questionCount?: number;
    status: string;
    timeLimit?: number;
    points?: number;
}

export default function QuizList() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<QuizMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'Desc' | 'Asc'>('Desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [editLoading, setEditLoading] = useState<string | null>(null);

    // Get userId from auth store
    const { userId, accessToken } = useAuthStore();

    // Fetch quizzes and question counts
    useEffect(() => {
        const fetchQuizzesWithQuestionCounts = async () => {
            if (!userId || !accessToken) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }
            try {
                const quizzesResponse = await fetch(`http://localhost:8001/quizzes/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                // Specifically handle 404 case
                if (quizzesResponse.status === 404) {
                    setQuizzes([]);
                    setLoading(false);
                    return;
                }

                if (!quizzesResponse.ok) {
                    throw new Error('Failed to fetch quizzes');
                }
                const quizzesData: QuizMetadata[] = await quizzesResponse.json();

                const quizzesWithQuestionCounts = await Promise.all(
                    quizzesData.map(async (quiz) => {
                        try {
                            const questionsResponse = await fetch(`http://localhost:8001/questions/quiz/${quiz.quiz_id}`, {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            });
                            if (questionsResponse.ok) {
                                const questionsData = await questionsResponse.json();
                                return { ...quiz, questionCount: questionsData.length };
                            } else if (questionsResponse.status === 404) {
                                return { ...quiz, questionCount: 0 };
                            } else {
                                throw new Error('Failed to fetch questions');
                            }
                        } catch (error) {
                            console.error(`Error fetching questions for quiz ${quiz.quiz_id}:`, error);
                            return { ...quiz, questionCount: 0 };
                        }
                    })
                );

                setQuizzes(quizzesWithQuestionCounts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                setLoading(false);
            }
        };

        fetchQuizzesWithQuestionCounts();
    }, [userId, accessToken]);

    // Function to fetch all quiz data for editing
    const handleEdit = async (quizMetadata: QuizMetadata) => {
        setEditLoading(quizMetadata.quiz_id);
        try {
            // Fetch questions
            const questionsResponse = await fetch(`http://localhost:8001/questions/quiz/${quizMetadata.quiz_id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!questionsResponse.ok) throw new Error('Failed to fetch questions');
            const questionsData = await questionsResponse.json();

            // Sort questions by created_at
            const sortedQuestions = questionsData.sort((a: any, b: any) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            // Fetch images and choices for each question
            const questionsWithDetails = await Promise.all(sortedQuestions.map(async (question: any) => {
                // Fetch images
                const imagesResponse = await fetch(`http://localhost:8001/question-images/${question.question_id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                let imagesData = [];
                if (imagesResponse.ok) {
                    const responseData = await imagesResponse.json();
                    // Ensure imagesData is always an array
                    imagesData = Array.isArray(responseData) ? responseData : [];
                }

                // Fetch choices
                const choicesResponse = await fetch(`http://localhost:8001/choices/${question.question_id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                let choicesData = [];
                if (choicesResponse.ok) {
                    const responseData = await choicesResponse.json();
                    // Ensure choicesData is always an array
                    choicesData = Array.isArray(responseData) ? responseData : [];
                }

                // Map the data to our Question type
                const mappedQuestion: Question = {
                    id: question.question_id,
                    type: question.type,
                    text: question.text,
                    explanation: question.explanation,
                    imageUrls: imagesData.map((img: any) => img.image_url),
                    choices: choicesData.map((choice: any) => ({
                        id: choice.choice_id,
                        text: choice.text,
                        isCorrect: choice.is_correct,
                        min: choice.min,
                        max: choice.max,
                        correctValue: choice.correctValue,
                        order: choice.order
                    }))
                };

                return mappedQuestion;
            }));

            // Construct the complete quiz object
            const quiz: Quiz = {
                id: quizMetadata.quiz_id,
                title: quizMetadata.title,
                type: quizMetadata.type,
                language: quizMetadata.language as any,
                createdAt: new Date(quizMetadata.created_at),
                updatedAt: new Date(quizMetadata.updated_at),
                status: quizMetadata.status,
                questions: questionsWithDetails,
                timeLimit: quizMetadata.timeLimit,
                points: quizMetadata.points
            };

            // Store the quiz ID in localStorage
            localStorage.setItem('currentQuizId', quiz.id);

            // Navigate to the builder with the quiz data
            navigate('/builder', { state: { quiz } });
        } catch (error) {
            console.error('Error fetching quiz details:', error);
            toast({
                title: "Error",
                description: "Failed to load quiz details. Please try again.",
                variant: "destructive"
            });
        } finally {
            setEditLoading(null);
        }
    };

    // Delete quiz handler
    const handleDeleteQuiz = async () => {
        if (!deletingQuizId) return;
        try {
            const response = await fetch(`http://localhost:8001/quizzes/${deletingQuizId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.quiz_id !== deletingQuizId));
                toast({ title: "Quiz Deleted", description: "The quiz has been successfully deleted.", variant: "default" });
            } else {
                const errorData = await response.json();
                toast({ title: "Delete Failed", description: errorData.detail || "Could not delete the quiz", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error deleting quiz:', error);
            toast({ title: "Delete Error", description: "An unexpected error occurred.", variant: "destructive" });
        } finally {
            setDeletingQuizId(null);
        }
    };

    // Handle loading and error states
    if (loading) return <div className="text-center py-8">Loading quizzes...</div>;
    
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    // Filtering and sorting function
    const filteredAndSortedQuizzes = [...quizzes]
        .filter(quiz => 
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === 'Asc') {
                return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
            } else {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
        });

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Search and Sort Container */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        {/* Search Input */}
                        <div className="relative flex-grow max-w-md mr-4">
                            <input 
                                type="text" 
                                placeholder="Search quizzes..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <Search 
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                                size={20} 
                            />
                        </div>

                        {/* Sort Buttons */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 mr-2">Sort by Last Updated:</span>
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                                <button 
                                    onClick={() => setSortOrder('Asc')} 
                                    className={`
                                        inline-flex items-center px-4 py-2 text-sm font-medium 
                                        ${sortOrder === 'Asc' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900'}
                                        border border-gray-200 rounded-l-lg 
                                        hover:bg-indigo-700 hover:text-white 
                                        focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none
                                        transition-colors duration-200
                                    `}
                                >
                                    <ArrowUp className="w-4 h-4 mr-2" />
                                    Ascending
                                </button>
                                <button 
                                    onClick={() => setSortOrder('Desc')} 
                                    className={`
                                        inline-flex items-center px-4 py-2 text-sm font-medium 
                                        ${sortOrder === 'Desc' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900'}
                                        border border-gray-200 rounded-r-lg 
                                        hover:bg-indigo-700 hover:text-white 
                                        focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none
                                        transition-colors duration-200
                                    `}
                                >
                                    <ArrowDown className="w-4 h-4 mr-2" />
                                    Descending
                                </button>
                            </div>
                        </div>
                    </div>

                    {filteredAndSortedQuizzes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm 
                                ? `No quizzes found matching "${searchTerm}"` 
                                : 'No quizzes created yet'
                            }
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredAndSortedQuizzes.map((quiz) => (
                                <div key={quiz.quiz_id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${quiz.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {quiz.status}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" /> {new Date(quiz.updated_at).toLocaleDateString()}
                                                </span>
                                                <span>{languageNames[quiz.language as keyof typeof languageNames] || quiz.language}</span>
                                                <span>{quiz.questionCount} questions</span>
                                                <span className="capitalize">{quiz.type}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleEdit(quiz)}
                                                disabled={editLoading === quiz.quiz_id}
                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50"
                                            >
                                                {editLoading === quiz.quiz_id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Edit2 className="w-5 h-5" />
                                                )}
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button onClick={() => setDeletingQuizId(quiz.quiz_id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the quiz "{quiz.title}" and remove all associated questions.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDeleteQuiz}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Toaster />
        </>
    );
}