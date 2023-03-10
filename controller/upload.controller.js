const uploadFileToMinio = async (req, res) => {
  try {
    const { mc } = req;
    const { file } = req?.files;
    res.json({ file });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  uploadFileToMinio,
};
