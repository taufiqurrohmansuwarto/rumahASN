module.exports.index = async (req, res) => {
  const user = req?.user;

  try {
    // maximum limit of tickets to show is 25
    const limit = req.query.limit > 25 ? 25 : req.query.limit;
    const page = req.query.page;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.remove = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
