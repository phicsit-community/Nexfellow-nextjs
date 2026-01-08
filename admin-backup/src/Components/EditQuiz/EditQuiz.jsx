import React, { useState } from "react";
import styles from "./EditQuiz.module.css";
import { Input } from "../Input/Input";
import { Button } from "../Button/Button";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const EditQuiz = ({ quiz }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  console.log(user);
  const apiUrl = import.meta.env.VITE_API_URL;

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   const pad = (num) => String(num).padStart(2, "0");
  //   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
  //     date.getDate()
  //   )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  // };

  const convertUTCToLocal = (utcTime) => {
    const localTime = new Date(utcTime);
    const offset = localTime.getTimezoneOffset();
    const adjustedTime = new Date(localTime.getTime() - offset * 60000);
    return adjustedTime.toISOString().slice(0, 16);
  };

  // Convert local time string back to UTC time
  const convertLocalToUTC = (localTime) => {
    const date = new Date(localTime);
    return date.toISOString();
  };

  const [quizData, setQuizData] = useState({
    title: quiz.title,
    description: quiz.description,
    startTime: quiz.startTime ? convertUTCToLocal(quiz.startTime) : "",
    endTime: quiz.endTime ? convertUTCToLocal(quiz.endTime) : "",
    duration: quiz.duration,
    adminId: user ? user : null,
    rules: quiz.rules,
    category: quiz.category,
  });

  console.log(quizData);

  const [newRule, setNewRule] = useState("");

  const handleInputChange = (name, value) => {
    setQuizData((prevData) => ({
      ...prevData,
      [name]: value,
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

  const handleDeleteRule = (index) => {
    setQuizData((prevData) => ({
      ...prevData,
      rules: prevData.rules.filter((rule, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("You need to log in to edit a quiz");
      return;
    }
    if (user === quizData.adminId) {
      const utcStartTime = convertLocalToUTC(quizData.startTime);
      const utcEndTime = convertLocalToUTC(quizData.endTime);
  
      const updatedQuizData = {
        ...quizData,
        startTime: utcStartTime,
        endTime: utcEndTime,
      };
  
      console.log(user, updatedQuizData);
      try {
        const response = await fetch(`${apiUrl}/admin/updatequiz/${quiz._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedQuizData),
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Quiz Updated Successfully", data);
          alert("Quiz Updated Successfully");
          navigate(`/quiz/${quiz._id}`);
        } else {
          console.error("Failed. Status:", response.status);
        }
      } catch (error) {
        console.error("Failed", error);
      }
    } else {
      alert("You are not authorized to edit this quiz");
    }
  };

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizForm}>
        <div className={styles.quizHeader}>
          <h1>Edit Contest</h1>
        </div>
        <div className={styles.quizContent}>
          <div className={styles.formGroup}>
            <div className={styles.formField}>
              <label>Title</label>
              <Input
                id="title"
                onChange={(e) => handleInputChange("title", e.target.value)}
                value={quizData.title}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="Category">Category</label>
              <select id="category"
              onChange={(e) => handleInputChange("category", e.target.value)}
              >
                <option value="Coding" default>Coding</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Aptitude">Aptitude</option>
                <option value="DSA">DSA</option>
                <option value="Web Dev">Web Dev</option>
                <option value="science">Science</option>
              </select>
              {/* <Input
                id="category"
                onChange={(e) => handleInputChange("category", e.target.value)}
                
              /> */}
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
          {/* rule and regulation */}
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

          <Button onClick={handleSubmit} className={styles.fullWidthBtn}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;
