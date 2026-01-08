import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import htmr from "htmr";

//styles
import styles from "./Quiz.module.css";

//components
import Navbar from "../../Components/Navbar/Navbar";
import Question from "../../Components/Question/Question";
import AddQuestion from "../../Components/AddQuestion/AddQuestion";
import SideBar from "../../Components/SideBar/SideBar";

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allQuestions, setAllQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [addQuestion, setAddQuestion] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const convertToIST = (dateString, includeDate = true) => {
    const date = new Date(dateString);
    const options = {
      timeZone: "Asia/Kolkata",
      year: includeDate ? "numeric" : undefined,
      month: includeDate ? "long" : undefined,
      day: includeDate ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const formattedDate = date.toLocaleString("en-IN", options);
    return formattedDate.replace(/am|pm/g, (match) => match.toUpperCase());
  };

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/admin/getquiz/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setQuiz(data);
        } else {
          console.error("Failed to fetch quiz. Status:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Fetch all questions
  const fetchAllQuestions = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setQuestionsLoading(true);
    setQuestionsError(null);
    try {
      const response = await fetch(`${apiUrl}/admin/getquestions/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAllQuestions(data);
        //console.log("All questions:", data);
      } else {
        console.error(
          "Failed to fetch all questions. Status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Failed to fetch all questions:", error);
      setQuestionsError(error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const [showConfirmation, setShowConfirmation] = useState(false); // State to control the confirmation popup

  const calculateResult = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true); // Show confirmation popup
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/admin/compileResults/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        console.log("Result calculated successfully");
        alert("Result calculated successfully"); // Show success alert
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to calculate result:", error);
      alert("Failed to calculate result. Please try again."); // Show error alert
    } finally {
      setShowConfirmation(false); // Reset confirmation state
    }
  };

  useEffect(() => {
    fetchAllQuestions();
  }, [id]);

  const handleEditQuiz = () => {
    navigate(`/quiz/edit/${id}`);
  };

  const startTime = quiz.startTime ? convertToIST(quiz.startTime, false) : null;
  const endTime = quiz.endTime ? convertToIST(quiz.endTime, false) : null;

  return (
    <div className={styles.parentContainer}>
      <Navbar />
      <SideBar />
      <div className={styles.container}>
        {loading ? (
          <div>Loading quiz...</div>
        ) : error ? (
          <div>Error fetching quiz</div>
        ) : (
          quiz && (
            <div className={styles.infoContainer}>
              <h1 className={styles.heading}>{quiz.title}</h1>
              <div className={styles.category}>{quiz.category}</div>
              <p className={styles.description}>
                <pre className="whitespace-pre-wrap">
                  <code>{htmr(quiz.description)}</code>
                </pre>
              </p>

              <div className={styles.rulesContainer}>
                <h2 className={styles.rulesHeading}>Rules</h2>
                <ul>
                  {quiz.rules ? (
                    quiz.rules.map((rule, index) => (
                      <li key={index} className={styles.rule}>
                        {rule}
                      </li>
                    ))
                  ) : (
                    <p>No rules</p>
                  )}
                </ul>
              </div>
              {quiz.misc && quiz.misc.length > 0 && (
                <div style={{ margin: "20px 0" }}>
                  <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
                    Additional Files
                  </h2>
                  {quiz.misc.map((item, index) => (
                    <div key={index}>
                      <h3 style={{ fontSize: "1.25rem", margin: "10px 0" }}>
                        {item.fieldName}
                      </h3>
                      {item.fieldValue.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          {item.fieldValue.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Uploaded File ${idx + 1}`}
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                objectFit: "cover",
                                borderRadius: "5px",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p>No files uploaded.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.miscInfo}>
                <div className={styles.part}>
                  <p className={styles.partInfo}>
                    <span>Total Registered:</span> {quiz.totalRegistered}
                  </p>

                  <span>
                    Date: {new Date(quiz.startTime).toLocaleDateString()}
                  </span>

                  <p className={styles.partInfo}>
                    <span>Start Time:</span> {startTime}
                  </p>

                  <p className={styles.partInfo}>
                    <span>End Time:</span> {endTime}
                  </p>

                  <p className={styles.partInfo}>
                    <span>Duration:</span> {quiz.duration} minutes
                  </p>

                  <p className={styles.partInfo}>
                    <span>Rewards:</span>
                  </p>
                </div>

                <div className={styles.part}>
                  <div
                    className={styles.button}
                    onClick={() => {
                      setAddQuestion(true);
                    }}
                  >
                    Add Question
                  </div>
                  <div className={styles.button} onClick={handleEditQuiz}>
                    Edit Contest
                  </div>
                  <div
                    className={styles.button}
                    onClick={() => setShowConfirmation(true)}
                  >
                    Calculate Result
                  </div>
                  <div
                    className={styles.button}
                    onClick={() => navigate(`/add-rewards/${id}`)}
                  >
                    Add Rewards
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {showConfirmation && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg w-[50vw] h-[50vh] flex justify-center flex-col items-center">
              <p className="text-lg font-bold mb-4">
                Are you sure you want to calculate results?
              </p>
              <p className="text-lg mb-4">
                This action will calculate all the score and the leaderboard
                will be displayed.
              </p>
              <div className="flex">
                <button
                  className="text-white bg-red-500 px-4 py-2 rounded mr-2 hover:bg-red-600"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="text-white bg-green-500 px-4 py-2 rounded hover:bg-green-600"
                  onClick={calculateResult}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.infoContainer}>
          <div className={styles.heading}>Questions</div>
          {questionsLoading ? (
            <div>Loading questions...</div>
          ) : questionsError ? (
            <div>Error fetching questions</div>
          ) : allQuestions.length > 0 ? (
            allQuestions.map((question, index) => (
              <Question
                key={index}
                question={question}
                fetchAllQuestions={fetchAllQuestions}
              />
            ))
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50px",
                fontSize: "1.5rem",
                color: "gray",
              }}
            >
              No questions
            </div>
          )}
        </div>
      </div>
      {addQuestion && (
        <div className={styles.addQueModal}>
          <AddQuestion
            quizId={id}
            setAddQuestion={setAddQuestion}
            fetchAllQuestions={fetchAllQuestions}
          />
        </div>
      )}
    </div>
  );
};

export default Quiz;
