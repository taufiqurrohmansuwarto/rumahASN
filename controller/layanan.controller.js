const { servicesData } = require("@/utils/data");
const { marked } = require("marked");

const findInboxUsulanByNip = async (request, layananId, nip) => {
  try {
    const result = await request.get(
      `/siasn-ws/layanan/inbox-usulan/${layananId}/${nip}`
    );
    return result?.data;
  } catch (error) {
    console.log(error);
  }
};

const getLayananKepegawaian = (req, res) => {
  try {
    const slug = req?.query;
    const result = servicesData.map(({ content, ...rest }) => rest);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const layananKepegawaianSlug = (req, res) => {
  try {
    const { slug } = req?.query;
    const result = servicesData.find((item) => item.slug === slug);

    const hasil = marked.parse(result?.content);

    res.json({
      ...result,
      content: hasil,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const referensiJenisRiwayat = async (req, res) => {
  try {
    const { fetcher: request } = req;
    const result = await request.get(
      "/siasn-ws/layanan/referensi/jenis-riwayat"
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const inboxLayananByNip = async (req, res) => {
  try {
    const { nip, layanan_id } = req.query;
    const result = await findInboxUsulanByNip(req.fetcher, layanan_id, nip);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const inboxLayanan = async (req, res) => {
  try {
    const { employee_number: nip } = req.user;
    const layanan_id = req.query?.layanan_id;
    const result = await findInboxUsulanByNip(req.fetcher, layanan_id, nip);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  getLayananKepegawaian,
  layananKepegawaianSlug,
  referensiJenisRiwayat,
  inboxLayananByNip,
  inboxLayanan,
};
