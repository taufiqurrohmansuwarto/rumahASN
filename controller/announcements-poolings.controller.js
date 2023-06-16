const Announcement = require("@/models/announcements.model");
const { parseMarkdown } = require("@/utils/parsing");

const announcements = async (req, res) => {
  try {
    const result = await Announcement.query()
      .first()
      .withGraphFetched("[createdBy(simpleSelect)]");

    // parse the content

    if (!result) {
      res.json(null);
    } else {
      const hasil = {
        ...result,
        html: parseMarkdown(result.content),
      };

      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// this should be an admin only
const createAnnouncement = async (req, res) => {
  try {
    const { body } = req;
    const user = req?.user;
    const data = {
      ...body,
      author: user?.customId,
    };

    const role = user?.current_role;
    if (role !== "admin") {
      res.status(403).json({ code: 403, message: "Forbidden" });
    } else {
      await Announcement.query().insert(data);
      res.json({ code: 200, message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// this should be an admin only
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req?.query;
    const { body } = req;
    const role = req?.user?.current_role;

    if (role !== "admin")
      res.status(403).json({ code: 403, message: "Forbidden" });
    else {
      await Announcement.query().findById(id).patch(body);
      res.json({ code: 200, message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const removeAnnouncement = async (req, res) => {
  try {
    const { id } = req?.query;

    if (req?.user?.current_role !== "admin") {
      res.status(403).json({ code: 403, message: "Forbidden" });
    } else {
      await Announcement.query().deleteById(id);
      res.json({ code: 200, message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// poolings
const createPooling = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const poolings = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const updatePooling = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const removePooling = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const votePool = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  announcements,
  createAnnouncement,
  updateAnnouncement,
  removeAnnouncement,
  poolings,
  createPooling,
  updatePooling,
  removePooling,
  votePool,
};
