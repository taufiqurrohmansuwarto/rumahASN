const Podcast = require("@/models/podcast.model");
const { uploadFileMinio } = require("../utils");

const URL_FILE = "https://siasn.bkd.jatimprov.go.id:9000/public";

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
      .orderBy("created_at", "desc")
      .page(parseInt(page - 1), parseInt(limit));

    res.json({
      results: result.results,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// create podcast
const createPodcast = async (req, res) => {
  try {
    const user = req?.user;
    const body = req?.body;
    const data = {
      ...body,
      author: user?.customId,
    };

    const result = await Podcast.query().insert(data);
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
  const { buffer, originalname, size, mimetype } = req?.file;
  const id = req?.query?.id;

  const format = mimetype.split("/")[1];
  const currentFilename = `${id}.${format}`;

  try {
    if (size > 10000000) {
      res.status(403).json({ code: 400, message: "File size is too large" });
    } else {
      await uploadFileMinio(req.mc, buffer, currentFilename, size, mimetype);
      const result = `${URL_FILE}/${currentFilename}`;

      const type = req?.body?.type;
      let name;

      if (type === "image") {
        await Podcast.query().patchAndFetchById(id, {
          image_url: result,
        });
        name = "image";
      } else if (type === "audio") {
        await Podcast.query().patchAndFetchById(id, {
          audio_url: result,
        });
        name = "audio";
      }

      res.json([
        {
          uid: id,
          name,
          status: "done",
          url: result,
        },
      ]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const detailPodcast = async (req, res) => {
  try {
    const id = req?.query?.id;
    const result = await Podcast.query().findById(id);
    const audio = result?.audio_url
      ? [
          {
            uid: id,
            name: "audio",
            status: "done",
            url: result?.audio_url,
          },
        ]
      : [];
    const image = result?.image_url
      ? [
          {
            uid: id,
            name: "image",
            status: "done",
            url: result?.image_url,
          },
        ]
      : [];

    const hasil = {
      ...result,
      audio,
      image,
    };

    res.json(hasil);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  detailPodcast,
  listPodcasts,
  createPodcast,
  updatePodcast,
  removePodcast,
  uploadPodcast,
};
