module.exports.zoomIndex = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const result = await zoomFetcher.get("/users/me/meetings?type=live");

    res.json({ code: 200, message: "OK", result: result?.data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
