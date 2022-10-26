const listBerita = async (req, res) => {
  try {
    const { fetcher } = req;
    const result = await fetcher.get("/web/berita");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  listBerita,
};
