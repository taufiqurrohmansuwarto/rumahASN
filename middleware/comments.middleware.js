const Tickets = require("../models/tickets.model");

module.exports = async (req, res, next) => {
  try {
    const { id } = req?.query;
    const result = await Tickets.query()
      .where("id", id)
      .andWhere("is_published", true)
      .andWhere("is_locked", false)
      .first();

    if (!result) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
