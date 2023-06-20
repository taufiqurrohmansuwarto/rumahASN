const CommentPodcast = require("@/models/comments-podcasts.model");
const { parseMarkdown } = require("@/utils/parsing");

const commentsPodcasts = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await CommentPodcast.query()
      .where("podcast_id", id)
      .withGraphFetched("[user(simpleSelect)]")
      .orderBy("created_at", "desc");

    let hasil;

    if (result.length > 0) {
      hasil = result.map((item) => {
        return {
          ...item,
          html: parseMarkdown(item?.comment) || "",
        };
      });
    } else {
      hasil = [];
    }

    res.json(hasil);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateCommentPodcast = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const customId = req?.user?.customId;

    await CommentPodcast.query()
      .update({
        ...req?.body,
      })
      .where("id", commentId)
      .andWhere("podcast_id", id)
      .andWhere("user_id", customId);
    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCommentPodcast = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const customId = req?.user?.customId;

    await CommentPodcast.query()
      .delete()
      .where("id", commentId)
      .andWhere("podcast_id", id)
      .andWhere("user_id", customId);

    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const detailCommentPodcast = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const result = await CommentPodcast.query()
      .where("id", commentId)
      .andWhere("podcast_id", id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const createCommentPodcast = async (req, res) => {
  try {
    const { id } = req?.query;
    const customId = req?.user?.customId;
    const body = req?.body;
    const data = {
      ...body,
      user_id: customId,
      podcast_id: id,
    };
    const result = await CommentPodcast.query().insert(data);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  commentsPodcasts,
  updateCommentPodcast,
  deleteCommentPodcast,
  detailCommentPodcast,
  createCommentPodcast,
};
