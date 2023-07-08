const activities = async (req, res) => {
  try {
    res.json({ code: 200, message: "OK" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  activities,
};
