const urlImage = "https://bkd.jatimprov.go.id/file_pemprov/bannerweb/";
const queryString = require("query-string");
const googleapis = require("googleapis");

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

const nilaiCasn = async (req, res) => {
  try {
    const { fetcher } = req;
    const result = await fetcher.get(`/web/nilai-casn`);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const publikasiCasn = async (req, res) => {
  try {
    const { fetcher } = req;

    const newQuery = queryString.stringify(req?.query, {
      skipEmptyString: true,
    });

    const result = await fetcher.get(`/web/publikasi-casn?${newQuery}}`);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detailPublikasiCASN = async (req, res) => {
  try {
    const { fetcher } = req;
    const { id } = req?.query;
    const result = await fetcher.get(`/web/publikasi-casn/${id}`);
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

// youtube api
const getLIstYoutubeBKDJatim = async (req, res) => {
  try {
    const youtubeFetcher = googleapis.google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });
    // get list youtube bkd jatim
    const result = await youtubeFetcher.search.list({
      part: ["snippet"],
      channelId: "UCokkbWw9VaJxGp3xqOjbcKg",
      maxResults: 6,
      order: "date",
      // get statistics
    });
    res.json(result?.data?.items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getLIstYoutubeBKDJatim,
  listBerita,
  listBanner,
  nilaiCasn,
  publikasiCasn,
  detailPublikasiCASN,
};
