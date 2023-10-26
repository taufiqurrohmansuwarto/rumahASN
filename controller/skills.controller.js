const Skill = require("@/models/skills.model");

const index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const create = async (req, res) => {
  try {
    const { title, description } = req.body;
    const skill = await Skill.query().insert({ title, description });
    res.status(201).json({ message: "Skill created", skill });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.query;
    const { title, description } = req.body;
    const skill = await Skill.query().patchAndFetchById(id, {
      title,
      description,
    });
    res.status(200).json({ message: "Skill updated", skill });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.query;
    await Skill.query().deleteById(id);
    res.status(200).json({ message: "Skill deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  index,
  create,
  update,
  destroy,
};
