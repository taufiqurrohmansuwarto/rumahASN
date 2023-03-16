const publicDashboard = async (req, res) => {
  try {
    // todo ini digunakan untuk melakukan query dashboard berdasarkan BIDANG yang dapat dilihat bu kaban
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  publicDashboard,
};
