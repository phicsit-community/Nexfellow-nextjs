const User = require("../models/userModel");
const Quiz = require("../models/quizzes");
const Question = require("../models/questions");
const Profile = require("../models/profileModel");
const Submission = require("../models/submissions");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const jwt = require("jsonwebtoken");
const Leaderboard = require("../models/leaderboard");
const ExpressError = require("../utils/ExpressError");
const RewardModel = require("../models/rewardModel");

const sendVerificationEmail = async (email, user) => {
  const secret = process.env.SECRET;
  const token = jwt.sign({ id: User._id }, secret, { expiresIn: "120m" });

  let config = {
    host: "smtp.hostinger.com", // Hostinger SMTP server
    port: 465, // Port for secure SMTP
    secure: true, // True for 465, false for other ports
    auth: {
      user: process.env.EMAIL, // Hostinger email user
      pass: process.env.PASSWORD, // Hostinger email password
    },
  };
  let transporter = nodemailer.createTransport(config);
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "NexFellow",
      link: "https://mailgen.js/",
    },
  });

  var response = {
    body: {
      name: `${user.username}`,
      intro: "this is for the verification of the email you have provided",
      action: {
        instructions: "Click the button below to verify the email:",
        button: {
          color: "#DC4D2F",
          text: "Click here",
          link: `${process.env.BACKEND_DOMAIN}/user/verifyEmail/${user._id}/${token}`,
        },
      },
      outro:
        "If you did not request a verification email, no further action is required on your part.",
    },
  };

  var emailBody = MailGenerator.generate(response);
  let message = {
    from: `${process.env.EMAIL}`,
    to: `${email}`,
    subject: "Email Verification",
    html: emailBody,
  };

  transporter
    .sendMail(message)
    .then(() => console.log("email sent"))
    .catch((err) => console.log(err));
};

module.exports.getAllQuizes = async (req, res) => {
  const quizes = await Quiz.find();
  // latestQuiz = quizes.map((quiz) => {
  //   return quiz.startTime > Date.now();
  // });
  res.json(quizes);
};

module.exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizid);
    if (!quiz) {
      throw new ExpressError("Quiz not found", 400);
    }

    const quizId = req.params.quizid;
    const userId = req.userId;
    const userSubmission = await Submission.findOne({
      quizId: quizId,
      userId: userId,
    });
    const allUserSubmissions = await Submission.find({ quizId: quizId });

    // Sort all submissions by score in descending order
    allUserSubmissions.sort((a, b) => b.score - a.score);

    // Find the rank of the current user
    const userRank =
      allUserSubmissions.findIndex(
        (submission) => submission.userId.toString() === userId.toString()
      ) + 1;

    // Calculate the percentage of users that the current user beat
    const beatPercentage =
      ((allUserSubmissions.length - userRank) / allUserSubmissions.length) *
      100;
    console.log(allUserSubmissions.length, userRank);
    console.log({
      quiz: quiz,
      response: userSubmission,
      message: `You beat ${beatPercentage.toFixed(0)}% in this contest`,
    });
    res.json({
      quiz: quiz,
      response: userSubmission,
      message: `You beat ${beatPercentage.toFixed(2)}% in this contest`,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports.registerQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    if (!userId || !quizId) {
      throw new ExpressError("quizId or userId not provided", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ExpressError("user not found", 400);
    }

    if (!user.verified) {
      await sendVerificationEmail(user.email, user);
      throw new ExpressError("User not verified. Verification email sent", 400);
    }

    if (user.registeredQuizzes.includes(quizId)) {
      throw new ExpressError("You have already registered for this quiz", 400);
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ExpressError("quiz not found", 400);
    }

    if (Date.now() > quiz.startTime) {
      throw new ExpressError(
        "Contest has started. No registration allowed",
        400
      );
    }

    user.registeredQuizzes.push(quizId);
    await user.save();

    quiz.totalRegistered++;

    if (user.picture) {
      if (quiz.User_profile_Image.length < 3) {
        quiz.User_profile_Image.push(user.picture);
      } else if (quiz.User_profile_Image.length === 3) {
        quiz.User_profile_Image.shift();
        quiz.User_profile_Image.push(user.picture);
      }
    }

    await quiz.save();

    await sendQuizDetails(user.email, user);

    res.status(200).json("Contest registered");
  } catch (error) {
    next(error);
  }
};

const sendQuizDetails = async (email, user) => {
  console.log(user);
  try {
    let config = {
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    };
    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "NexFellow",
        link: `${process.env.SITE_URL}`,
      },
    });

    let lastRegisteredQuizId =
      user.registeredQuizzes[user.registeredQuizzes.length - 1];

    let response = {
      body: {
        name: `${user.username}`,
        intro:
          "This email is for the Contest details for which you have registered!",
        action: {
          instructions: "Click the button below to go to Contest:",
          button: {
            color: "#40dc2f",
            text: "Click here",
            link: `${process.env.SITE_URL}/contests/${lastRegisteredQuizId}`,
          },
        },
        outro:
          "If you haven't registered for this Contest, no further action is required on your part!",
      },
    };

    let emailBody = MailGenerator.generate(response);

    let message = {
      from: `${process.env.EMAIL}`,
      to: `${email}`,
      subject: "Contest Details",
      html: emailBody,
    };

    await transporter.sendMail(message);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ExpressError("Failed to send Contest details email", 500);
  }
};

module.exports.actionBookmark = async (req, res) => {
  try {
    const userId = req.userId;
    const quizId = req.params.quizId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found!" });
    }

    if (profile.bookmarks.includes(quizId)) {
      profile.bookmarks.pull(quizId);
      await profile.save();
      res.status(200).json({
        message: "Contest removed from bookmarks",
        bookmarks: profile.bookmarks,
      });
    } else {
      profile.bookmarks.push(quizId);
      await profile.save();
      res.status(200).json({
        message: "Contest added to bookmarks",
        bookmarks: profile.bookmarks,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.bookmarkedQuizzes = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError("user not found", 400);
  }

  const profile = await Profile.findOne({ userId });
  if (!profile) {
    return res.status(404).json({ message: "Profile not found!" });
  }

  const bookmarkedQuizzes = profile.bookmarks;

  const bookmarked = await Quiz.find({ _id: { $in: bookmarkedQuizzes } });

  try {
    const data = await Promise.all(
      bookmarked.map(async (quiz) => {
        const score = await getscore(quiz._id, userId);
        return {
          title: quiz.title,
          startTime: quiz.startTime,
          endTime: quiz.endTime,
          score: score,
          id: quiz._id,
          premium: user.subscriptionTier === "bronze" ? true : false,
        };
      })
    );

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.isRegistered = async (req, res) => {
  const userId = req.userId;
  const { quizId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError("user not found", 400);
  }
  if (!user.registeredQuizzes.includes(quizId)) {
    return res.status(200).json(false);
  }
  return res.status(200).json(true);
};

const getscore = async (quizId, userId) => {
  try {
    const response = await Submission.findOne({
      quizId: quizId,
      userId: userId,
    });
    //-2 if quiz not attempted
    return response ? response.score : -2; // Return score if submission found, else 0
  } catch (error) {
    console.error("Error fetching score:", error);
    return 0; // Return 0 in case of any error
  }
};

module.exports.getYourQuizzes = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError("user not found", 400);
  }
  const registeredQuizzes = user.registeredQuizzes;

  const yourQuizzes = await Quiz.find({ _id: { $in: registeredQuizzes } });

  try {
    const data = await Promise.all(
      yourQuizzes.map(async (quiz) => {
        const score = await getscore(quiz._id, userId);
        return {
          title: quiz.title,
          startTime: quiz.startTime,
          endTime: quiz.endTime,
          score: score,
          id: quiz._id,
          premium: user.subscriptionTier === "bronze" ? true : false,
        };
      })
    );

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Contest data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.addResponseAndUpdateSubmission = async (req, res) => {
  const { answers, timeTaken } = req.body;
  const userId = req.userId;
  const { quizId } = req.params;

  try {
    if (!userId || !quizId) {
      throw new ExpressError("quizId or userId not provided", 400);
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ExpressError("Quiz not found", 404);
    }

    const now = new Date();
    if (quiz.endTime < now) {
      throw new ExpressError("Quiz has ended. No submission allowed", 400);
    }

    const previousSubmission = await Submission.findOne({ userId, quizId });
    if (previousSubmission) {
      throw new ExpressError("Quiz already submitted", 400);
    }

    let correctAnswersCount = 0;
    let totalScore = 0;
    let maxScore = 0;

    const evaluatedAnswers = await Promise.all(
      answers.map(async (answer) => {
        try {
          const question = await Question.findById(answer.questionId);
          if (!question) {
            throw new ExpressError("Question not found", 404);
          }

          let isCorrect = false;
          let questionScore = 0;
          const questionMaxScore = question.points;

          if (question.type === "checkbox") {
            const correctOptions = question.correctOption;
            const userResponse = answer.response || [];

            if (userResponse.length === 0) {
              isCorrect = false;
              questionScore = 0;
            } else {
              const correctSelectedCount = userResponse.filter((option) =>
                correctOptions.includes(option)
              ).length;

              const incorrectSelectedCount = userResponse.filter(
                (option) => !correctOptions.includes(option)
              ).length;

              const totalCorrectCount = correctOptions.length;

              if (incorrectSelectedCount === 0) {
                questionScore =
                  (correctSelectedCount / totalCorrectCount) * questionMaxScore;
              }

              isCorrect = correctSelectedCount === totalCorrectCount;
            }
          } else if (question.type === "radio") {
            const correctOptions = question.correctOption.map((opt) =>
              opt.toLowerCase()
            );
            const userResponse = Array.isArray(answer.response)
              ? answer.response[0]
              : answer.response;

            if (!userResponse) {
              isCorrect = false;
              questionScore = 0;
            } else {
              const normalizedUserResponse = userResponse.toLowerCase();
              isCorrect = correctOptions.includes(normalizedUserResponse);
              questionScore = isCorrect ? questionMaxScore : 0;
            }
          } else if (question.type === "text") {
            const correctOptions = question.correctOption.map((opt) =>
              opt.toLowerCase()
            );
            const userResponse = Array.isArray(answer.response)
              ? answer.response[0]
              : answer.response;

            if (!userResponse) {
              isCorrect = false;
              questionScore = 0;
            } else {
              const normalizedUserResponse = userResponse.toLowerCase();
              isCorrect = correctOptions.includes(normalizedUserResponse);
              questionScore = isCorrect ? questionMaxScore : 0;
            }
          }

          questionScore = isNaN(questionScore) ? 0 : questionScore;

          if (isCorrect) correctAnswersCount++;
          totalScore += questionScore;
          maxScore += questionMaxScore;

          return { ...answer, correct: isCorrect, score: questionScore };
        } catch (error) {
          console.error("Error evaluating answer:", error);
          throw new ExpressError("Error evaluating answer", 500);
        }
      })
    );

    totalScore = isNaN(totalScore) ? 0 : totalScore;
    maxScore = isNaN(maxScore) ? 0 : maxScore;

    const submission = new Submission({
      userId,
      quizId,
      answers: evaluatedAnswers,
      totalQuestions: answers.length,
      correctAnswers: correctAnswersCount,
      timeTaken,
      score: totalScore,
      maxScore: maxScore,
    });

    await submission.save();

    res.status(200).json("Quiz submitted successfully with partial marking");
  } catch (error) {
    console.error("Error during quiz submission:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

module.exports.getFinalScore = async (req, res) => {
  const { userId, quizId } = req.params;
  if (!userId || !quizId) {
    throw new ExpressError("quizId or userId not provided", 400);
  }

  const submission = await Submission.findOne({ userId, quizId });
  if (!submission) {
    throw new ExpressError("Submission not found", 400);
  }
  res.status(200).json({ score: submission.score });
};

module.exports.getQuestions = async (req, res) => {
  const userId = req.userId;
  //check if the user is registered for the quiz
  const user = await User.findById(userId);
  if (!user) {
    return res.status(400).json("user not found");
  }
  const registeredQuizzes = user.registeredQuizzes;

  if (!registeredQuizzes.includes(req.params.quizid)) {
    throw new ExpressError("You are not registered for this Contest", 400);
  }

  const quizId = req.params.quizid;

  const questions = await Question.find({ quizId: quizId });
  const quiz = await Quiz.findById(quizId);
  const duration = quiz.duration * 60;
  res.status(200).json({ questions, duration });
};

// module.exports.getSubmissions = async (req, res) => {
//   const submissions = await Submission.find({ userId: req.userId });
//   res.status(200).json({ submissions });
// }

//analytics

module.exports.getQuizAnalytics = async (req, res) => {
  const { quizid } = req.params;
  const userId = req.userId;

  if (!userId || !quizid) {
    throw new ExpressError("quizId or userId not provided", 400);
  }

  const submission = await Submission.findOne({
    quizId: quizid,
    userId: userId,
  });
  if (!submission) {
    throw new ExpressError("Submission not found", 400);
  }

  const data = {
    correctAnswers: submission.correctAnswers,
    totalQuestions: submission.totalQuestions,
    score: submission.score,
  };
  res.status(200).json(data);
};

module.exports.getWrongAnswers = async (req, res) => {
  const { quizid } = req.params;
  const userId = req.userId;

  if (!userId || !quizid) {
    throw new ExpressError("quizId or userId not provided", 400);
  }

  const submission = await Submission.findOne({
    quizId: quizid,
    userId: userId,
  }).populate("answers.questionId");

  let wrongAnswer = [];

  submission.answers.forEach((answer) => {
    const question = answer.questionId;

    if (question.type === "checkbox") {
      const sortedCorrectOptions = question.correctOption.sort().join(",");
      const sortedResponse = answer.response.sort().join(",");

      if (sortedResponse !== sortedCorrectOptions) {
        wrongAnswer.push({
          questionText: question.text,
          correctOptions: question.correctOption,
          userResponse: answer.response,
        });
      }
    } else if (!answer.correct) {
      wrongAnswer.push({
        questionText: question.text,
        correctOption: question.correctOption,
        userResponse: answer.response,
      });
    }
  });

  res.status(200).json(wrongAnswer);
};

module.exports.getLeaderboard = async (req, res) => {
  const { quizid } = req.params;

  if (!quizid) {
    return res.status(400).json({ error: "Quiz ID is required" });
  }

  try {
    const leaderboard = await Leaderboard.findOne({ quizId: quizid });
    if (!leaderboard) {
      return res.status(404).json({ error: "Leaderboard not found" });
    }
    res.status(200).json(leaderboard);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching leaderboard" });
  }
};

module.exports.addRewardToQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    let { rewards } = req.body;

    console.log(rewards);
    if (!quizId || !rewards) {
      if (!quizId) {
        return res.status(400).json({
          success: false,
          message: "Quiz Id is required",
        });
      }
      if (!rewards) {
        return res.status(400).json({
          success: false,
          message: "Rewards is required",
        });
      }
    }

    rewards = rewards.filter((reward) => {
      return reward !== "";
    });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(400).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // const reward = await RewardModel.findById(rewardId);
    // if (!reward) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Reward not found",
    //   });
    // }

    // if (quiz.rewards.includes(rewardId)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Reward already added to quiz",
    //   });

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $set: { rewards: rewards } },
      { new: true }
    )
      .populate("rewards")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Reward added to quiz successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    console.log("Error while adding reward to quiz");
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error while adding reward to quiz",
      error: error.message,
    });
  }
};

module.exports.getPublicQuiz = async (req, res) => {
  try {
    const { quizid } = req.params;
    const quiz = await Quiz.findById(quizid)
      .select(
        "title description category totalRegistered duration questions rewards"
      )
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Return only public-safe information
    return res.status(200).json({
      status: "success",
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        totalRegistered: quiz.totalRegistered,
        duration: quiz.duration,
        questionCount: quiz.questions.length,
        rewards: quiz.rewards,
        rules: quiz.rules ? quiz.rules.slice(0, 3) : [],
      },
    });
  } catch (error) {
    console.error("Error fetching public quiz data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
