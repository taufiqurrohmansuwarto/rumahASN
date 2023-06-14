const Podcast = require("@/models/podcast.model");

// get podcast
const index = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const result = await Podcast.query({
      limit,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// create podcast
const create = async (req, res) => {
  try {
    const result = await Podcast.query().insert(req.body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// update podcast
const update = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await Podcast.query().patchAndFetchById(id, req.body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// delete podcast
const destroy = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await Podcast.query().deleteById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  index,
  create,
  update,
  destroy,
};
