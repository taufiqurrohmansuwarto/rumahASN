// user
const QuestionAnswer = require("@/models/questions_answers.model");
const LeaderboardQuiz = require("@/models/leaderboard_quiz.model");

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
      text: question?.option_a?.text,
      // is_correct: question.option_a.is_correct,
      option: "option_a",
    },
    {
      text: question?.option_b?.text,
      // is_correct: question.option_b.is_correct,
      option: "option_b",
    },
    {
      text: question?.option_c?.text,
      // is_correct: question.option_c.is_correct,
      option: "option_c",
    },
    {
      text: question?.option_d?.text,
      // is_correct: question.option_d.is_correct,
      option: "option_d",
    },
    {
      text: question?.option_e?.text,
      // is_correct: question.option_e.is_correct,
      option: "option_e",
    },
  ];

  return {
    question: question?.question,
    options: shuffleOptions(options),
  };
};

// get random  quiz
const userGetQuiz = async (req, res) => {
  try {
    let correct_question = [];
    const { customId } = req?.user;
    const dataKuis = await LeaderboardQuiz.query().findById(customId);
    correct_question = dataKuis?.correct_question;

    const totalQuiz = await QuestionAnswer.query().count();

    // if correct question is 75% of total question then reset
    if (correct_question?.length >= totalQuiz[0].count * 0.75) {
      await LeaderboardQuiz.query().findById(customId).patch({
        correct_question: [],
      });
      const dataKuisReload = await LeaderboardQuiz.query().findById(customId);
      correct_question = dataKuisReload?.correct_question;
    }

    const result = await QuestionAnswer.query()
      .where((builder) => {
        if (correct_question?.length > 0 && dataKuis) {
          builder.whereNotIn("id", correct_question);
        }
      })
      .orderByRaw("RANDOM()")
      .first();

    const hasil = randomizeQuestionOptions(result);

    res.json({
      id: result?.id,
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
    const { customId } = req?.user;
    const result = await QuestionAnswer.query().findById(id);
    const answer = req?.body?.answer;

    const is_correct = result[answer].is_correct;
    const options = [
      {
        text: result?.option_a?.text,
        is_correct: result.option_a.is_correct,
        option: "option_a",
      },
      {
        text: result?.option_b?.text,
        is_correct: result.option_b.is_correct,
        option: "option_b",
      },
      {
        text: result?.option_c?.text,
        is_correct: result?.option_c?.is_correct,
        option: "option_c",
      },
      {
        text: result?.option_d?.text,
        is_correct: result?.option_d?.is_correct,
        option: "option_d",
      },
      {
        text: result?.option_e?.text,
        is_correct: result?.option_e?.is_correct,
        option: "option_e",
      },
    ];

    const correct_option = options.find((item) => !!item?.is_correct);

    if (is_correct) {
      // check if user already answer
      const check = await LeaderboardQuiz.query().findById(customId);
      const correct_question = [...check?.correct_question, id];

      // if total correct_question is 70% of total question then reset
      const totalData = await QuestionAnswer.query().count();
      const totalQuestion = totalData[0].count;
      const totalCorrectQuestion = check?.correct_question?.length;

      if (parseInt(totalCorrectQuestion) >= parseInt(totalQuestion) * 0.7) {
        await LeaderboardQuiz.query().findById(customId).patch({
          correct_question: [],
        });
      }

      if (!check) {
        await LeaderboardQuiz.query().insert({
          user_id: customId,
          score: 1,
          date: new Date(),
          correct_question: [id],
        });
        console.log("insert baru");
      } else {
        await LeaderboardQuiz.query()
          .findById(customId)
          .patch({
            score: check.score + 1,
            date: new Date(),
            correct_question,
          });
        console.log("insert lama");
      }
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
const leaderBoardQuiz = async (req, res) => {
  try {
    const result = await LeaderboardQuiz.query()
      .orderBy("score", "desc")
      .limit(25)
      .withGraphFetched("user(simpleSelect)");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userScore = async (req, res) => {
  try {
    const { customId } = req?.user;
    const result = await LeaderboardQuiz.query().findById(customId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
  userScore,
};
