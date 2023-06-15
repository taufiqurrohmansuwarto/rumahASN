const Announcement = require("@/models/announcements.model");

const announcements = async (req, res) => {
  try {
    const result = await Announcement.query();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { body } = req;
    await Announcement.query().insert(body);
    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req?.query;
    const { body } = req;

    await Announcement.query().findById(id).patch(body);
    res.json({ code: 200, message: "Success" });
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
  poolings,
  createPooling,
  updatePooling,
  removePooling,
  votePool,
};
