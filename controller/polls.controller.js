const Poll = require("@/models/polls.model");
const PollVote = require("@/models/polls-votes.model");
const PollAnswer = require("@/models/polls-answers.model");

// create
const createPolling = async (req, res) => {
  try {
    const body = req.body;
    const { customId } = req?.user;

    const data = {
      ...body,
      author: customId,
    };

    console.log(data);

    await Poll.query().insertGraph(data);

    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// read
const readAllPolling = async (req, res) => {
  try {
    const result = await Poll.query().withGraphFetched("[ answers]");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const updatePolling = async (req, res) => {
  try {
    const { id } = req?.query;
    const body = req.body;

    // remove the answers first

    await PollAnswer.query().delete().where({ poll_id: id });
    await Poll.query().patch(body).where({ id });
    await PollAnswer.query().insert(
      body.answers?.map((item) => ({ ...item, poll_id: id }))
    );

    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const detailPolling = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await Poll.query()
      .findById(id)
      .withGraphFetched("[answers]");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// delete
const deletePolling = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// vote
const votePolling = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// unvote
const unvotePolling = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// read
const readPollUser = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  createPolling,
  readAllPolling,
  updatePolling,
  deletePolling,
  votePolling,
  unvotePolling,
  readPollUser,
  detailPolling,
};
