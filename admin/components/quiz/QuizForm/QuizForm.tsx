'use client';

import React, { useState } from 'react';
import styles from './QuizForm.module.css';
import Input from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useAppSelector } from '@/lib/store/hooks';
import { useRouter } from 'next/navigation';

interface MiscField {
  fieldName: string;
  fieldValue: File[];
}

interface QuizData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: string;
  adminId: string | null;
  rules: string[];
  category: string;
  misc: MiscField[];
}

const QuizForm: React.FC = () => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.user);
  const apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;

  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: '',
    adminId: user ? user : null,
    rules: [],
    category: 'Coding',
    misc: [],
  });

  const [newRule, setNewRule] = useState('');
  const [newField, setNewField] = useState('');

  const handleInputChange = (name: string, value: string) => {
    setQuizData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMiscChange = (index: number, files: FileList) => {
    const updatedMisc = [...quizData.misc];
    updatedMisc[index].fieldValue = Array.from(files);
    setQuizData((prevData) => ({
      ...prevData,
      misc: updatedMisc,
    }));
  };

  const deleteMiscValue = (fieldNumber: number, imageNumber: number) => {
    const updatedMisc = [...quizData.misc];
    updatedMisc[fieldNumber].fieldValue.splice(imageNumber, 1);
    setQuizData((prevData) => ({
      ...prevData,
      misc: updatedMisc,
    }));
  };

  const handleAddRule = () => {
    if (newRule.trim() !== '') {
      setQuizData((prevData) => ({
        ...prevData,
        rules: [...prevData.rules, newRule],
      }));
      setNewRule('');
    }
  };

  const handleAddField = () => {
    if (newField.trim() !== '') {
      setQuizData((prevData) => ({
        ...prevData,
        misc: [...prevData.misc, { fieldName: newField, fieldValue: [] }],
      }));
      setNewField('');
    }
  };

  const handleDeleteRule = (index: number) => {
    setQuizData((prevData) => ({
      ...prevData,
      rules: prevData.rules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append('title', quizData.title);
    formData.append('description', quizData.description);
    formData.append('startTime', quizData.startTime);
    formData.append('endTime', quizData.endTime);
    formData.append('duration', quizData.duration);
    formData.append('adminId', quizData.adminId || '');
    formData.append('category', quizData.category);

    quizData.rules.forEach((rule, index) => {
      formData.append(`rules[${index}]`, rule);
    });

    quizData.misc.forEach((field, index) => {
      formData.append(`misc[${index}][fieldName]`, field.fieldName);

      field.fieldValue.forEach((file) => {
        formData.append(`misc[${index}][fieldValue]`, file);
      });
    });

    try {
      const response = await fetch(`${apiUrl}/admin/createquiz`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Quiz Created Successfully', data);
        alert('Quiz Created Successfully');
        router.push('/quiz');
        router.refresh();
      } else {
        console.error('Failed. Status:', response.status);
      }
    } catch (error) {
      console.error('Failed', error);
    }
  };

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizForm}>
        <div className={styles.quizHeader}>
          <h1>Create Contest</h1>
        </div>
        <div className={styles.quizContent}>
          <div className={styles.formGroup}>
            <div className={styles.formField}>
              <label>Title</label>
              <Input
                id="title"
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="Coding">Coding</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Aptitude">Aptitude</option>
                <option value="DSA">DSA</option>
                <option value="Web Dev">Web Dev</option>
                <option value="Science">Science</option>
              </select>
            </div>
          </div>

          <div className={styles.formField}>
            <label>Description</label>
            <textarea
              id="description"
              rows={8}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={styles.descriptionTextarea}
              value={quizData.description}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formField}>
              <label>Start Time</label>
              <Input
                className="w-full"
                type="datetime-local"
                value={quizData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label>End Time</label>
              <Input
                className="w-full"
                type="datetime-local"
                value={quizData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label>Duration</label>
              <Input
                type="number"
                className="w-full"
                value={quizData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
              />
            </div>
          </div>

          {/* Rules and Regulations */}
          <div className={styles.formField}>
            <label>Rules and Regulations</label>
            <div className={styles.formInline}>
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Enter a new rule"
              />
              <Button onClick={handleAddRule} className={styles.ml2}>
                Add Rule
              </Button>
            </div>
            <ul className={styles.rulesList}>
              {quizData.rules.map((rule, index) => (
                <li key={index} className={styles.formInline}>
                  <span className={styles.ruleText}>{rule}</span>
                  <Button
                    onClick={() => handleDeleteRule(index)}
                    className={styles.ml2}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Add New Fields Option */}
          <div>
            {quizData.misc.map((field, index) => (
              <div key={index}>
                <div className={styles.formField}>
                  <label>{field.fieldName}</label>
                  <Input
                    type="file"
                    id={field.fieldName}
                    onChange={(e) =>
                      e.target.files && handleMiscChange(index, e.target.files)
                    }
                    multiple
                    accept="image/png, image/gif, image/jpeg"
                  />
                </div>
                {field.fieldValue && (
                  <div>
                    {field.fieldValue.map((file, i) => (
                      <div key={i} className={styles.imagePreview}>
                        <img
                          src={URL.createObjectURL(file)}
                          className={styles.newFieldImage}
                          alt={`preview-${i}`}
                        />
                        <div>
                          <Button
                            className={styles.ml2}
                            onClick={() => deleteMiscValue(index, i)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.formField}>
            <label>Wanna Add Field?</label>
            <div className={styles.formInline}>
              <Input
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                placeholder="Enter a Field Name"
              />
              <Button onClick={handleAddField} className={styles.ml2}>
                Add Field
              </Button>
            </div>
          </div>

          <Button onClick={handleSubmit} className={styles.fullWidthBtn}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
