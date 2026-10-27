import { Button } from '../../components/Button';

interface SuggestedQuestionsProps {
  questions: string[];
  disabled: boolean;
  onPick: (question: string) => void;
}

export function SuggestedQuestions({ questions, disabled, onPick }: SuggestedQuestionsProps) {
  return (
    <div role="group" aria-label="추천 질문" className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <Button key={question} variant="secondary" disabled={disabled} onClick={() => onPick(question)} className="text-left">
          <span aria-hidden="true">💡 </span>
          {question}
        </Button>
      ))}
    </div>
  );
}
