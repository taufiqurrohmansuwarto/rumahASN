const { default: axios } = require("axios");
const moment = require("moment");
const arrayToTree = require("array-to-tree");
const { NextResponse } = require("next/server");

const siasnEmployeesDetail = async (req, res) => {
  try {
    const user = req.user;
    const siasnRequest = req.siasnRequest;

    const nip = user?.employee_number;
    const { data } = await siasnRequest.get(`/pns/data-utama/${nip}`);

    res.json(data?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getTreeRef = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const result = await request.get("/referensi/ref-unor");
    const data = result?.data?.data;
    const dataFlat = data?.map((d) => ({
      id: d?.Id,
      key: d?.Id,
      parentId: d?.DiatasanId,
      name: d?.NamaUnor,
      value: d?.Id,
      label: d?.NamaUnor,
      title: d?.NamaUnor,
    }));

    const tree = arrayToTree(dataFlat, {
      parentProperty: "parentId",
      customID: "id",
    });
    res.json(tree);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getSkp = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;
    const result = await request.get(`/pns/rw-skp/${nip}`);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
  }
};

const getSkp2022 = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;
    const result = await request.get(`/pns/rw-skp22/${nip}`);
    res.json(result?.data?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

function getKuadran(a, b) {
  if (a === b) {
    if (a === 1) {
      return 1;
    } else if (a === 2) {
      return 2;
    } else if (a === 3) {
      return 5;
    }
  } else {
    return Math.max(a, b);
  }
}

const postSkp2022 = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { penilain, ...body } = req?.body;
    const { employee_number: nip } = req?.user;

    const dataCurrent = await siasnRequest.get(`/pns/data-utama/${nip}`);
    const dataPenilai = await siasnRequest.get(
      `/pns/data-utama/${body?.penilai}`
    );

    const penilai = dataPenilai?.data?.data;
    const currentPns = dataCurrent?.data?.data;

    const data = {
      ...body,
      hasilKinerjaNilai: parseInt(body?.hasilKinerjaNilai),
      perilakuKerjaNilai: parseInt(body?.perilakuKerjaNilai),
      kuadranKinerjaNilai: getKuadran(
        parseInt(body?.hasilKinerjaNilai),
        parseInt(body?.perilakuKerjaNilai)
      ),
      penilaiGolongan: penilai?.golRuangAkhirId,
      penilaiJabatan: penilai?.jabatanNama,
      penilaiNama: penilai?.nama,
      penilaiNipNrp: penilai?.nipBaru,
      penilaiUnorNama: penilai?.unorNama,
      pnsDinilaiOrang: currentPns?.id,
      statusPenilai: "ASN",
      tahun: 2022,
    };

    await siasnRequest.post("/skp22/save", data);
    res.json({ code: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const detailSkp2022 = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const result = await request.get("/pns/rw-skp22/1999103052019031008");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getAngkaKredit = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;

    const result = await request.get(`/pns/rw-angkakredit/${nip}`);
    res.json(result?.data?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const postAngkaKredit = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;
    const body = req?.body;

    const currentPns = await request.get(`/pns/data-utama/${nip}`);

    const data = {
      ...body,
      pnsId: currentPns?.data?.data?.id,
      kreditUtamaBaru: body?.kreditUtamaBaru?.toString(),
      kreditPenunjangBaru: body?.kreditPenunjangBaru?.toString(),
      kreditBaruTotal: body?.kreditBaruTotal?.toString(),
    };

    await request.post(`/angkakredit/save`, data);

    res.json({
      code: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const daftarKenaikanPangkat = async (req, res) => {
  try {
    const { siasnRequest: request } = req;

    const periode = req?.query?.periode || moment().format("YYYY-MM-DD");

    const result = await request.get(
      `/pns/list-kp-instansi?periode=${periode}`
    );

    res.json(result?.data?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getDiklat = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;

    const result = await request.get(`/pns/rw-diklat/${nip}`);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getHukdis = async (req, res) => {
  try {
    const { siasnRequest: request } = req;

    const { employee_number: nip } = req?.user;

    const result = await request.get(`/pns/rw-hukdis/${nip}`);
    res.json(result?.data?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getJabatan = async (req, res) => {
  try {
    const { siasnRequest: request } = req;

    const { employee_number: nip } = req?.user;

    const result = await request.get(`/pns/rw-jabatan/${nip}`);
    res.json(result?.data?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const postRiwayatJabatan = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;
    const body = req?.body;

    // cekId
    const dataUtama = await request.get(`/pns/data-utama/${nip}`);
    const id = dataUtama?.data?.data?.id;
    const data = {
      ...body,
      pnsId: id,
    };

    await request.post(`/jabatan/save`, data);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getRefJfu = async (req, res) => {
  try {
    const { jabatan } = req?.query;
    const result = await axios.get(
      `https://siasn.bkd.jatimprov.go.id/pemprov-api/vendor/reference/ref-jfu/${jabatan}`
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getRefJft = async (req, res) => {
  try {
    const { jabatan } = req?.query;
    const result = await axios.get(
      `https://siasn.bkd.jatimprov.go.id/pemprov-api/vendor/reference/ref-jft/${jabatan}`
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const { filePath } = req?.query;

    const { fetcher } = req;

    const result = await fetcher.get(
      `/siasn-ws/proxy/download?file_path=${filePath}`,
      {
        responseType: "arraybuffer",
      }
    );

    // send file via pdf
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Length": result?.data?.length,
    });

    res.end(Buffer.from(result?.data, "binary"));
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  downloadDocument,
  siasnEmployeesDetail,
  getTreeRef,
  getJabatan,
  postRiwayatJabatan,
  getSkp,
  getSkp2022,
  postSkp2022,
  getHukdis,
  postAngkaKredit,
  getAngkaKredit,
  getRefJft,
  getRefJfu,
};
