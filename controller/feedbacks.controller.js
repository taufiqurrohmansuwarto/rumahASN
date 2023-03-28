const Feedback = require("@/models/feedbacks.model");
const listFeedbacks = async (req, res) => {
  try {
    const { custom_id } = req?.user;
    const result = await Feedback.query().findById(custom_id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { custom_id } = req?.user;
    const { feedback, stars } = req?.body;
    await Feedback.query().insert({
      user_id: custom_id,
      stars,
      feedback,
    });
    res.json({ code: 200, message: "Feedback berhasil dikirim" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  listFeedbacks,
  createFeedback,
};
