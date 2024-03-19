const petaJabatan = async (req, res) => {
  try {
    const { clientCredentialsFetcher } = req;
    const result = await clientCredentialsFetcher.get(
      `/siasn-ws/perencanaan/peta-jabatan`
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
const petaJabatanById = async (req, res) => {
  try {
    const { clientCredentialsFetcher } = req;
    const { id } = req.query;
    const result = await clientCredentialsFetcher.get(
      `/siasn-ws/perencanaan/peta-jabatan/${id}`
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

module.exports = {
  petaJabatan,
  petaJabatanById,
};
