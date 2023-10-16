// user
const QuestionAnswer = require("@/models/questions_answers.model");

const shuffleOptions = (options) => {
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]; // Menukar elemen
  }
  return options;
};

const randomizeQuestionOptions = (question) => {
  const options = [
    {
      text: question.option_a.text,
      // is_correct: question.option_a.is_correct,
      option: "option_a",
    },
    {
      text: question.option_b.text,
      // is_correct: question.option_b.is_correct,
      option: "option_b",
    },
    {
      text: question.option_c.text,
      // is_correct: question.option_c.is_correct,
      option: "option_c",
    },
    {
      text: question.option_d.text,
      // is_correct: question.option_d.is_correct,
      option: "option_d",
    },
  ];

  return {
    question: question.question,
    options: shuffleOptions(options),
  };
};

// get random  quiz
const userGetQuiz = async (req, res) => {
  try {
    const result = await QuestionAnswer.query().orderByRaw("RANDOM()").first();
    const hasil = randomizeQuestionOptions(result);
    res.json({
      id: result.id,
      ...hasil,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const userAnswerQuiz = async (req, res) => {
  try {
    const { id } = req?.query;
    const user = req?.user;
    const result = await QuestionAnswer.query().findById(id);
    const answer = req?.body?.answer;

    const is_correct = result[answer].is_correct;
    const options = [
      {
        text: result.option_a.text,
        is_correct: result.option_a.is_correct,
        option: "option_a",
      },
      {
        text: result.option_b.text,
        is_correct: result.option_b.is_correct,
        option: "option_b",
      },
      {
        text: result.option_c.text,
        is_correct: result.option_c.is_correct,
        option: "option_c",
      },
      {
        text: result.option_d.text,
        is_correct: result.option_d.is_correct,
        option: "option_d",
      },
    ];

    const correct_option = options.find((item) => !!item?.is_correct);

    if (is_correct) {
    }

    res.json({
      correct_option: correct_option?.option,
      correct_answer: correct_option?.text,
      is_correct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// leaderboard
const leaderBoardQuiz = async (req, res) => {};

// admin imports quiz from file
const importQuiz = async (req, res) => {};
// remove quiz
const removeQuiz = async (req, res) => {};
// update quiz
const updateQuiz = async (req, res) => {};
// create quize
const createQuiz = async (req, res) => {};

module.exports = {
  // admin
  importQuiz,
  removeQuiz,
  updateQuiz,
  createQuiz,
  //   user
  userGetQuiz,
  userAnswerQuiz,
  leaderBoardQuiz,
};
