const urlImage = "https://bkd.jatimprov.go.id/file_pemprov/bannerweb/";
const listBerita = async (req, res) => {
  try {
    const { fetcher } = req;
    const result = await fetcher.get("/web/berita");
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const listBanner = async (req, res) => {
  try {
    let hasil = [];
    const { fetcher } = req;
    const result = await fetcher.get("/web/banner");
    const data = result?.data;

    if (data?.length) {
      hasil = data.map((item) => ({
        ...item,
        image_url: urlImage + item?.gambar_sampul,
      }));
    } else {
      hasil = [];
    }
    res.json(hasil);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  listBerita,
  listBanner,
};
