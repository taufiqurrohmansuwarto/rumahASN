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
    const result = await Poll.query()
      .withGraphFetched("[answers]")
      .orderBy("is_active", "desc");
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

    // jika ada answers dengan array maka lakukan hal yang dibawaah ini
    if (body?.answers) {
      // remove the answers first

      const currentPollAnswer = await PollAnswer.query().where({ poll_id: id });

      // compare the current answers with the new answers
      const currentPollAnswerId = currentPollAnswer.map((item) => item.id);
      const newPollAnswerId = body.answers.map((item) => item.id);

      const toDelete = currentPollAnswerId.filter(
        (item) => !newPollAnswerId.includes(item)
      );

      await Poll.query().patch(body).where({ id });
      await PollAnswer.query()
        .insert(body.answers?.map((item) => ({ ...item, poll_id: id })))
        .onConflict(["id"])
        .merge();

      await PollAnswer.query().delete().whereIn("id", toDelete);

      res.json({ code: 200, message: "Success" });
    } else {
      await Poll.query()
        .patch({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .where({ id });
      res.json({ code: 200, message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const detailPolling = async (req, res) => {
  try {
    const { id } = req?.query;
    const detail = req?.query?.detail || "simple";

    if (detail === "simple") {
      const result = await Poll.query()
        .findById(id)
        .withGraphFetched("[answers]");

      res.json(result);
    }
    if (detail === "dashboard") {
      // count the votes
      const result = await Poll.query()
        .withGraphFetched("[answers]")
        .findById(id);

      let promise = [];

      result.answers.forEach((item) => {
        promise.push(
          PollVote.query()
            .count()
            .where({ answer_id: item.id })
            .then((res) => res[0].count)
        );
      });

      const hasil = await Promise.all(promise);

      const data = result.answers.map((item, index) => {
        return {
          ...item,
          title: item.answer,
          value: parseInt(hasil[index]),
          votes_count: parseInt(hasil[index]),
        };
      });

      res.json({ ...result, answers: data });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// delete
const deletePolling = async (req, res) => {
  try {
    const { id } = req?.query;
    await PollAnswer.query().delete().where({ poll_id: id });
    await Poll.query().deleteById(id);
    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// vote
const votePolling = async (req, res) => {
  try {
    const { customId } = req?.user;

    const body = req.body;

    const data = {
      ...body,
      user_id: customId,
    };

    // upsert manual
    await PollVote.query()
      .insert(data)
      .onConflict(["poll_id", "user_id"])
      .merge();

    res.json({ code: 200, message: "Success" });
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
    // between start_date and end_date
    const result = await Poll.query()
      .where("is_active", true)
      .withGraphFetched("[answers]");

    const { customId } = req?.user;
    const votes = await PollVote.query().where({ user_id: customId });

    const data = result.map((item) => {
      const vote = votes.find((vote) => vote.poll_id === item.id);
      return {
        ...item,
        vote: vote?.answer_id,
      };
    });

    res.json(data);
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
