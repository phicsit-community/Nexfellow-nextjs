'use client';

import React, { useState } from 'react';
import styles from './AddQuestion.module.css';
import { IoMdClose } from 'react-icons/io';

interface QuestionOption {
  text: string;
}

interface QuestionData {
  quizId: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text';
  options: QuestionOption[];
  correctOption: string | string[];
}

interface AddQuestionProps {
  quizId: string;
  fetchAllQuestions: () => void;
  setAddQuestion: (show: boolean) => void;
}

const AddQuestion: React.FC<AddQuestionProps> = ({
  quizId,
  fetchAllQuestions,
  setAddQuestion,
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;

  const [questionData, setQuestionData] = useState<QuestionData>({
    quizId: quizId,
    text: '',
    type: 'radio',
    options: [{ text: '' }],
    correctOption: '',
  });

  const [noOfInputs, setNoOfInputs] = useState(4);

  const handleInputChange = (name: string, value: string) => {
    setQuestionData((prevData) => {
      if (name.startsWith('options')) {
        const optionIndex = Number(name.replace('options', ''));
        const updatedOptions = [...prevData.options];
        updatedOptions[optionIndex] = { text: value };

        return {
          ...prevData,
          options: updatedOptions,
        };
      }

      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleCreateQuestion = async () => {
    try {
      const formattedQuestionData = {
        ...questionData,
        correctOption: Array.isArray(questionData.correctOption)
          ? questionData.correctOption
          : [questionData.correctOption],
      };

      const response = await fetch(`${apiUrl}/admin/createquestion/${quizId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedQuestionData),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Question added successfully', data);

        setQuestionData({
          quizId: quizId,
          text: '',
          type: 'radio',
          options: [{ text: '' }],
          correctOption: '',
        });
        setNoOfInputs(4);

        fetchAllQuestions();
      } else {
        console.error('Failed to create question. Status:', response.status);
      }
    } catch (error) {
      console.error('Failed to create question', error);
    }
  };

  const handleCheckboxChange = (optionValue: string, isChecked: boolean) => {
    setQuestionData((prev) => {
      const currentCorrectOptions = Array.isArray(prev.correctOption)
        ? prev.correctOption
        : [];
      let updatedCorrectOptions: string[];

      if (isChecked) {
        updatedCorrectOptions = [...currentCorrectOptions, optionValue];
      } else {
        updatedCorrectOptions = currentCorrectOptions.filter(
          (option) => option !== optionValue
        );
      }

      return {
        ...prev,
        correctOption: updatedCorrectOptions,
      };
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.container2}>
        <div className={styles.close} onClick={() => setAddQuestion(false)}>
          <IoMdClose />
        </div>
        <h2 className={styles.heading}>Add Question</h2>
        <label>Enter the Question</label>
        <textarea
          className={styles.textarea}
          onChange={(e) => handleInputChange('text', e.target.value)}
          name="text"
          value={questionData.text}
        />

        <label>Enter the type of response you want</label>
        <select
          className={styles.select}
          defaultValue="radio"
          onChange={(e) =>
            handleInputChange('type', e.target.value)
          }
        >
          <option value="radio">Single Correct</option>
          <option value="checkbox">Multiple Correct</option>
          <option value="text">Text</option>
        </select>

        {questionData?.type === 'radio' && (
          <>
            <label className={styles.label}>Enter the number of options</label>
            <input
              className={styles.input}
              type="number"
              placeholder="Enter the number of options"
              onChange={(e) => setNoOfInputs(Number(e.target.value))}
              value={noOfInputs}
              name="options"
            />

            <div className={styles.optionField}>
              {Array.from({ length: noOfInputs }).map((_, index) => (
                <div key={index} className={styles.optionContainer}>
                  <input
                    className={styles.optionInput}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    onChange={(e) =>
                      handleInputChange(`options${index}`, e.target.value)
                    }
                    name={`options${index}`}
                    value={questionData.options[index]?.text || ''}
                  />

                  <div className={styles.radioContainer}>
                    <input
                      className={styles.radio}
                      type="radio"
                      name="correctOption"
                      value={questionData.options[index]?.text || ''}
                      onChange={() => {
                        setQuestionData((prevData) => ({
                          ...prevData,
                          correctOption: questionData.options[index]?.text,
                        }));
                      }}
                      checked={
                        questionData.correctOption ===
                        questionData.options[index]?.text
                      }
                      disabled={
                        !questionData.options ||
                        questionData.options.some(
                          (option) => !option?.text?.trim()
                        )
                      }
                    />
                    <label className={styles.radioLabel}>Correct Answer</label>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {questionData?.type === 'checkbox' && (
          <>
            <label className={styles.label}>
              Enter the number of options you want
            </label>
            <input
              className={styles.input}
              type="number"
              placeholder="Enter the number of options you want"
              onChange={(e) => setNoOfInputs(Number(e.target.value))}
              value={noOfInputs}
              name="options"
            />

            <div className={styles.optionField}>
              {Array.from({ length: noOfInputs }).map((_, index) => (
                <div key={index} className={styles.optionContainer}>
                  <input
                    className={styles.optionInput}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    onChange={(e) =>
                      handleInputChange(`options${index}`, e.target.value)
                    }
                    name={`options${index}`}
                    value={questionData.options[index]?.text || ''}
                  />
                  <div className={styles.checkboxContainer}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      onChange={(e) => {
                        handleCheckboxChange(
                          questionData.options[index]?.text,
                          e.target.checked
                        );
                      }}
                      name={`correctOption${index}`}
                    />
                    <label className={styles.checkboxLabel}>
                      Correct Answer
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {questionData?.type === 'text' && (
          <>
            <label className={styles.label}>Enter the Correct Answer</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter the correct answer"
              onChange={(e) =>
                handleInputChange('correctOption', e.target.value)
              }
              value={
                typeof questionData.correctOption === 'string'
                  ? questionData.correctOption
                  : ''
              }
              name="correctOption"
            />
          </>
        )}

        <button
          className={styles.button}
          onClick={() => {
            handleCreateQuestion();
            setAddQuestion(false);
          }}
        >
          Add Question
        </button>
      </div>
    </div>
  );
};

export default AddQuestion;
