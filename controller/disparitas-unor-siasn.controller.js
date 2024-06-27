const DisparitasUnor = require("@/models/disparitas-unor.model");

const detailDisparitasUnor = async (req, res) => {
  try {
    const { id } = req?.query;

    const data = await DisparitasUnor.query().findById(id);

    res.status(200).json({
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateDisparitasUnor = async (req, res) => {
  try {
    const { id } = req?.query;
    const data = req?.body;

    // upsert
    await DisparitasUnor.query()
      .insert({
        ...data,
        id,
      })
      .onConflict("id")
      .merge();

    res.status(200).json({
      message: "Data berhasil disimpan",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  updateDisparitasUnor,
  detailDisparitasUnor,
};
