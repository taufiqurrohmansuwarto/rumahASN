const PodcastVote = require("@/models/podcasts-votes.model");

const addVote = async (req, res) => {
  try {
    const { id } = req?.query;
    const customId = req?.user?.customId;

    const data = {
      user_id: customId,
      podcast_id: id,
      vote: req?.body?.vote,
      comment: req?.body?.comment,
    };

    await PodcastVote.query()
      .insert(data)
      .onConflict(["podcast_id", "user_id"])
      .merge()
      .returning("*");

    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getVotes = async (req, res) => {
  try {
    const { id } = req?.query;
    const customId = req?.user?.customId;

    const votes = await PodcastVote.query()
      .where("podcast_id", id)
      .andWhere("user_id", customId)
      .withGraphFetched("[user(simpleSelect)]");

    const currentUserVote = await PodcastVote.query()
      .where("podcast_id", id)
      .andWhere("user_id", customId)
      .first();

    const vote = await PodcastVote.query().where("podcast_id", id).avg("vote");
    const countVote = await PodcastVote.query()
      .where("podcast_id", id)
      .count("vote");

    res.json({
      currentUserVote: currentUserVote || null,
      vote: vote[0].avg || 0,
      count: countVote[0].count || 0,
      votes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addVote,
  getVotes,
};
