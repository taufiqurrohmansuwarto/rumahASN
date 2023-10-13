// user

// get random  quiz
const userGetQuiz = async (req, res) => {};
const userAnswerQuiz = async (req, res) => {};

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
