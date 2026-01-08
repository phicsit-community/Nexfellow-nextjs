import React from "react";

//styles
import styles from "./CreateQuiz.module.css";

//components
import Navbar from "../../Components/Navbar/Navbar";
import QuizForm from "../../Components/QuizForm/QuizForm";

const CreateQuiz = () => {
  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <QuizForm />
      </div>
    </div>
  );
};

export default CreateQuiz;
