import type { AIQuizResponse, Quiz, Question, Choice, QuizType } from '../types/quiz';

export function mapAIResponseToQuiz(response: AIQuizResponse): Quiz {
  const { data } = response;
  
  const questions = data.questions.map((q): Question => {
    const choices = mapChoices(q.answer);
    
    return {
      id: crypto.randomUUID(),
      type: mapQuizType(data.metadata.type),
      text: q.question_text,
      imageUrls: q.image_url,
      explanation: q.explanation,
      choices
    };
  });

  return {
    id: data.quiz_id,
    title: 'AI Generated Quiz',
    language: data.metadata.language as any,
    type: mapQuizType(data.metadata.type),
    createdAt: new Date(data.metadata.generated_at),
    updatedAt: new Date(data.metadata.generated_at),
    status: 'draft',
    questions
  };
}

function mapQuizType(type: string): QuizType {
  const typeMap: Record<string, QuizType> = {
    quiz: 'quiz',
    vrai_ou_faux: 'vrai-faux',
    puzzle: 'puzzle',
    curseur: 'curseur',
    reponse_libre: 'reponse-libre'
  };
  return typeMap[type] || 'quiz';
}

function mapChoices(answer: AIQuestion['answer']): Choice[] {
  switch (answer.type) {
    case 'multiple_choice':
      return (answer.options || []).map((text, index) => ({
        id: crypto.randomUUID(),
        text,
        isCorrect: index === answer.correct_answer
      }));

    case 'boolean':
      return [
        { id: crypto.randomUUID(), text: 'True', isCorrect: answer.correct_answer === 1 },
        { id: crypto.randomUUID(), text: 'False', isCorrect: answer.correct_answer === 0 }
      ];

    case 'puzzle':
      return (answer.options || []).map((text, index) => ({
        id: crypto.randomUUID(),
        text,
        isCorrect: true,
        order: (answer.correct_answer as number[])[index]
      }));

    case 'curseur':
      const [min, correct, max] = answer.correct_answer as number[];
      return [{
        id: crypto.randomUUID(),
        text: '',
        isCorrect: true,
        min,
        max,
        correctValue: correct
      }];

    case 'reponse_libre':
      return (answer.correct_answer as string[]).map(text => ({
        id: crypto.randomUUID(),
        text,
        isCorrect: true
      }));

    default:
      return [];
  }
}