'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EditQuestion.module.css';
import { IoMdClose } from 'react-icons/io';

interface QuestionOption {
  text: string;
}

interface Question {
  _id: string;
  quizId: string;
  text: string;
  type: 'radio' | 'checkbox' | 'text';
  options: QuestionOption[];
  correctOption: string | string[];
}

interface EditQuestionProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

const EditQuestion: React.FC<EditQuestionProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  if (!isOpen) return null;

  const apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;
  const router = useRouter();

  const [questionData, setQuestionData] = useState({
    quizId: question.quizId,
    text: question.text,
    type: question.type,
    options: question.options,
    correctOption: question.correctOption,
  });

  const [noOfInputs, setNoOfInputs] = useState(question.options.length);

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

  useEffect(() => {
    if (noOfInputs > questionData.options.length) {
      const updatedOptions = [...questionData.options];
      while (updatedOptions.length < noOfInputs) {
        updatedOptions.push({ text: '' });
      }
      setQuestionData((prevData) => ({
        ...prevData,
        options: updatedOptions,
      }));
    } else if (noOfInputs < questionData.options.length) {
      const updatedOptions = questionData.options.slice(0, noOfInputs);
      setQuestionData((prevData) => ({
        ...prevData,
        options: updatedOptions,
      }));
    }
  }, [noOfInputs]);

  const handleNoOfInputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value)) && Number(value) >= 0) {
      setNoOfInputs(value === '' ? 0 : Number(value));
    }
  };

  const handleUpdateQuestion = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/admin/updatequestion/${question._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Question Updated Successfully', data);
        alert('Question Updated Successfully');
        router.push(`/quiz/${question.quizId}`);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed', error);
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
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.container}>
          <div className={styles.container2}>
            <div className={styles.close} onClick={onClose}>
              <IoMdClose />
            </div>
            <h2 className={styles.heading}>Edit Question</h2>
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
              value={questionData.type}
              onChange={(e) => {
                handleInputChange('type', e.target.value);
                setNoOfInputs(1);
                setQuestionData((prev) => ({
                  ...prev,
                  options: [{ text: '' }],
                  correctOption: prev.type === 'checkbox' ? [] : '',
                }));
              }}
            >
              <option value="radio">Single Correct</option>
              <option value="checkbox">Multiple Correct</option>
              <option value="text">Text</option>
            </select>

            {questionData.type === 'radio' && (
              <>
                <label>Enter the number of options you want</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="Enter the number of options you want"
                  onChange={handleNoOfInputsChange}
                  value={noOfInputs}
                  name="options"
                />
                <div className={styles.optionField}>
                  {questionData.options.map((option, index) => (
                    <div key={index} className={styles.optionContainer}>
                      <input
                        className={styles.outputinput}
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          handleInputChange(`options${index}`, e.target.value)
                        }
                        name={`options${index}`}
                      />
                      <div className={styles.radioContainer}>
                        <input
                          type="radio"
                          name="correctOption"
                          value={option.text}
                          onChange={() =>
                            handleInputChange('correctOption', option.text)
                          }
                          checked={questionData.correctOption === option.text}
                        />
                        <label className={styles.radioLabel}>
                          Correct Answer
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {questionData.type === 'checkbox' && (
              <>
                <label>Enter the number of options you want</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="Enter the number of options you want"
                  onChange={handleNoOfInputsChange}
                  value={noOfInputs}
                  name="options"
                />
                <div className={styles.optionField}>
                  {questionData.options.map((option, index) => (
                    <div key={index} className={styles.optionContainer}>
                      <input
                        className={styles.outputinput}
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          handleInputChange(`options${index}`, e.target.value)
                        }
                        name={`options${index}`}
                      />
                      <div className={styles.checkboxContainer}>
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(questionData.correctOption) &&
                            questionData.correctOption.includes(option.text)
                          }
                          onChange={(e) =>
                            handleCheckboxChange(option.text, e.target.checked)
                          }
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

            {questionData.type === 'text' && (
              <>
                <label>Enter the Correct Answer</label>
                <input
                  className={styles.input}
                  type="text"
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
            <button className={styles.button} onClick={handleUpdateQuestion}>
              Update Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuestion;
