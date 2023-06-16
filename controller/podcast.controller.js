const Podcast = require("@/models/podcast.model");

// get podcast
const listPodcasts = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;

    const result = await Podcast.query()
      .where((builder) => {
        if (search) {
          builder.where("title", "like", `%${search}%`);
        }
      })
      .page(parseInt(page - 1), parseInt(limit));

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// create podcast
const createPodcast = async (req, res) => {
  try {
    const result = await Podcast.query().insert(req.body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// update podcast
const updatePodcast = async (req, res) => {
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
const removePodcast = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await Podcast.query().deleteById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const uploadPodcast = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const detailPodcast = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  detailPodcast,
  listPodcasts,
  createPodcast,
  updatePodcast,
  removePodcast,
  uploadPodcast,
};
