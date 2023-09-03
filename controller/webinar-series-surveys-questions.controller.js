const WebinarQuestion = require("@/models/webinar-series-surveys-questions.model");

const surveysQuestions = async (req, res) => {
  try {
    const result = await WebinarQuestion.query();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const detailSurveyQuestion = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarQuestion.query().findById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createSurveyQuestion = async (req, res) => {
  try {
    const body = req?.body;
    await WebinarQuestion.query().insert(body);
    res.json({
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSurveyQuestion = async (req, res) => {
  try {
    const { id } = req?.query;
    const body = req?.body;

    await WebinarQuestion.query().patchAndFetchById(id, body);

    res.json({
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteSurveyQuestion = async (req, res) => {
  try {
    const { id } = req?.query;
    await WebinarQuestion.query().deleteById(id);
    res.json({
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  surveysQuestions,
  detailSurveyQuestion,
  createSurveyQuestion,
  updateSurveyQuestion,
  deleteSurveyQuestion,
};
