'use client';

import { useState } from 'react';
import styles from './Question.module.css';
import EditQuestion from '../EditQuestion/EditQuestion';
import DeleteConfirmation from '@/components/ui/DeleteConfirmation/DeleteConfirmation';

interface QuestionOption {
  text: string;
}

interface QuestionType {
  _id: string;
  quizId: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text';
  options: QuestionOption[];
  correctOption: string | string[];
}

interface QuestionProps {
  question: QuestionType;
  fetchAllQuestions: () => void;
}

const Question: React.FC<QuestionProps> = ({ question, fetchAllQuestions }) => {
  const apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/admin/deletequestion/${questionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      if (response.ok) {
        console.log('Question deleted');
      } else {
        console.error('Failed to delete question. Status:', response.status);
      }
      fetchAllQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  return (
    <div className={styles.questionContainer}>
      <h1 className={styles.question}>
        <pre>Q.{question.text}</pre>
      </h1>

      {/* For radio-type questions */}
      {question.type === 'radio' && (
        <div className={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <div key={index} className={styles.option}>
              <input
                type="radio"
                name={`question-${question._id}`}
                value={option.text}
                id={`option-${index}`}
              />
              <label htmlFor={`option-${index}`}>{option.text}</label>
            </div>
          ))}
        </div>
      )}

      {/* For checkbox-type questions */}
      {question.type === 'checkbox' && (
        <div className={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <div key={index} className={styles.option}>
              <input
                type="checkbox"
                name={`question-${question._id}`}
                value={option.text}
                id={`option-${index}`}
              />
              <label htmlFor={`option-${index}`}>{option.text}</label>
            </div>
          ))}
        </div>
      )}

      {/* For text-type questions */}
      {question.type === 'text' && (
        <div className={styles.optionsContainer}>
          <input
            className={styles.textInput}
            type="text"
            placeholder="Your answer here"
          />
        </div>
      )}

      <div className={styles.buttonContainer}>
        <div
          className={styles.button}
          onClick={() => setIsModalOpen(true)}
        >
          Edit Question
        </div>

        <div
          className={`${styles.button} ${styles.delete}`}
          onClick={() => setDeleteConfirmation(true)}
        >
          Delete Question
        </div>
      </div>

      <EditQuestion
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        question={question}
      />

      {deleteConfirmation && (
        <DeleteConfirmation
          onDelete={() => handleDeleteQuestion(question._id)}
          setDeleteConfirmation={setDeleteConfirmation}
          title="Confirm Deletion"
          message="Are you sure you want to delete this question?"
        />
      )}
    </div>
  );
};

export default Question;
