import React from "react";
import styles from "./QuizForm.module.css";
import { Input } from "../Input/Input";
import { Button } from "../Button/Button";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QuizForm = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    duration: "",
    adminId: user ? user : null,
    rules: [],
    category: "Coding",
    misc: [],
  });
  const [newRule, setNewRule] = useState("");
  const [newField, setNewField] = useState("");

  const handleInputChange = (name, value) => {
    setQuizData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMiscChange = (index, files) => {
    console.log(files);
    const updatedMisc = [...quizData.misc];
    updatedMisc[index].fieldValue = Array.from(files);
    setQuizData((prevData) => ({
      ...prevData,
      misc: updatedMisc,
    }));
  };

  const deleteMiscValue = (fieldNumber, imageNumber) => {
    const updatedMisc = [...quizData.misc];
    updatedMisc[fieldNumber].fieldValue.splice(imageNumber, 1);
    setQuizData((prevData) => ({
      ...prevData,
      misc: updatedMisc,
    }));
  };

  const handleAddRule = () => {
    if (newRule.trim() !== "") {
      setQuizData((prevData) => ({
        ...prevData,
        rules: [...prevData.rules, newRule],
      }));
      setNewRule(""); // clear input field
    }
  };

  const handleAddField = () => {
    if (newField.trim() !== "") {
      setQuizData((prevData) => ({
        ...prevData,
        misc: [...prevData.misc, { fieldName: newField, fieldValue: [] }],
      }));
      setNewField(""); // clear input field
    }
  };

  const handleDeleteRule = (index) => {
    setQuizData((prevData) => ({
      ...prevData,
      rules: prevData.rules.filter((rule, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    console.log(quizData);
  
    const formData = new FormData();
  
    formData.append("title", quizData.title);
    formData.append("description", quizData.description);
    formData.append("startTime", quizData.startTime);
    formData.append("endTime", quizData.endTime);
    formData.append("duration", quizData.duration);
    formData.append("adminId", quizData.adminId);
    formData.append("category", quizData.category);
  
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
        method: "POST",
        body: formData,
        credentials: "include",
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Quiz Created Successfully", data);
        alert("Quiz Created Successfully");
        navigate("/");
        window.location.reload();
      } else {
        console.error("Failed. Status:", response.status);
      }
    } catch (error) {
      console.error("Failed", error);
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
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="Category">Category</label>
              <select
                id="category"
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                <option value="Coding" default>
                  Coding
                </option>
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
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={styles.descriptionTextarea}
              value={quizData.description}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.formField}>
              <label>Start Time</label>
              <Input
                className="w-[100%]"
                type="datetime-local"
                value={quizData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label>End Time</label>
              <Input
                className="w-[100%]"
                type="datetime-local"
                value={quizData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label>Duration</label>
              <Input
                type="number"
                className="w-[100%]"
                value={quizData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
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
                    onChange={(e) => handleMiscChange(index, e.target.files)}
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
