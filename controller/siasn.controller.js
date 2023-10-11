const { default: axios } = require("axios");
const moment = require("moment");
const arrayToTree = require("array-to-tree");
const { ssoFetcher, wso2Fetcher } = require("@/utils/siasn-fetcher");
const { orderBy, sortBy } = require("lodash");
const {
  riwayatPendidikan,
  riwayatGolonganPangkat,
  riwayatPMK,
  riwayatPenghargaan,
  riwayatCtln,
  riwayatDiklat,
  riwayatKursus,
  postDataKursus,
  rwPemberhentian,
  rwMasaKerja,
  updateDataUtama,
} = require("@/utils/siasn-utils");
const {
  proxyDownloadFoto,
  proxyKeluargaDataOrtu,
  proxyKeluargaAnak,
  proxyKeluargaPasangan,
} = require("@/utils/siasn-proxy.utils");
const { getRwPangkat } = require("@/utils/master.utils");
const { createLogSIASN } = require("@/utils/logs");
const Anomali23 = require("@/models/anomali23.model");
const BackupSIASN = require("@/models/backup-siasn.model");
const RefSIASNUnor = require("@/models/ref-siasn-unor.model");

const dataUtamaUpdate = {
  agama_id: "string",
  alamat: "string",
  email: "string",
  email_gov: "string",
  kabupaten_id: "string",
  karis_karsu: "string",
  kelas_jabatan: "string",
  kpkn_id: "string",
  lokasi_kerja_id: "string",
  nomor_bpjs: "string",
  nomor_hp: "string",
  nomor_telpon: "string",
  npwp_nomor: "string",
  npwp_tanggal: "string",
  pns_orang_id: "string",
  tanggal_taspen: "string",
  tapera_nomor: "string",
  taspen_nomor: "string",
};

const updateEmployeeInformation = async (req, res) => {
  try {
    const user = req?.user;
    const siasnRequest = req.siasnRequest;

    const nip = user?.employee_number;
    const { data } = await siasnRequest.get(`/pns/data-utama/${nip}`);

    const id = data?.data?.id;

    const payload = {
      pns_orang_id: id,
      ...req?.body,
    };

    await updateDataUtama(siasnRequest, payload);

    res.json({
      message: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

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

const siasnEmployeeDetailByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const siasnRequest = req.siasnRequest;

    const { data } = await siasnRequest.get(`/pns/data-utama/${nip}`);

    const hasil = {
      ...data?.data,
    };

    res.json(hasil);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const siasnRwPemberhentian = async (req, res) => {
  try {
    const { nip } = req?.query;
    const siasnRequest = req.siasnRequest;

    const result = await rwPemberhentian(siasnRequest, nip);

    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const siasnRwMasaKerja = async (req, res) => {
  try {
    const { nip } = req?.query;
    const siasnRequest = req.siasnRequest;

    const result = await rwMasaKerja(siasnRequest, nip);

    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const siasnEmployeeDetailPangkat = async (req, res) => {
  try {
    const { nip } = req?.query;
    const siasnRequest = req.siasnRequest;
    const fetcher = req?.fetcher;

    const { data: pangkat_siasn } = await riwayatGolonganPangkat(
      siasnRequest,
      nip
    );

    const { data: pangkat_simaster } = await getRwPangkat(fetcher, nip);

    res.json({
      pangkat_siasn: orderBy(pangkat_siasn?.data, "golongan", "desc"),
      pangkat_simaster: orderBy(
        pangkat_simaster,
        (item) => item?.pangkat?.gol_ruang,
        "desc"
      ),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getTreeRef = async (req, res) => {
  try {
    const { siasnRequest: request } = req;

    const currentTime = moment().format("YYYY-MM-DD");
    const checkUpdate = await BackupSIASN.query()
      .where("backup_date", currentTime)
      .andWhere("type", "ref_unor")
      .first();

    if (!checkUpdate) {
      const result = await request.get("/referensi/ref-unor");
      await RefSIASNUnor.query().delete();
      await RefSIASNUnor.query().insertGraph(result?.data?.data);
      await BackupSIASN.query().insert({
        backup_date: currentTime,
        type: "ref_unor",
      });
    }

    const refUnor = await RefSIASNUnor.query();

    const data = refUnor;
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

const getSkp2022ByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;
    const result = await request.get(`/pns/rw-skp22/${nip}`);
    res.json(result?.data?.data);
  } catch (error) {
    console.log(error);
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
    const { penilain, ...body } = req?.body?.data;
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

    const result = await siasnRequest.post("/skp22/save", data);

    // create log
    await createLogSIASN({
      userId: req?.user?.customId,
      type: "CREATE",
      employeeNumber: nip,
      siasnService: "skp22",
    });

    res.json({ code: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const postSkp2022ByNip = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { penilain, ...body } = req?.body?.data;
    const { nip } = req?.query;

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

    // create log
    await createLogSIASN({
      userId: req?.user?.customId,
      type: "CREATE",
      employeeNumber: nip,
      siasnService: "skp22",
    });

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

const getAngkaKreditByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;

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
    const body = req?.body?.data;

    const currentPns = await request.get(`/pns/data-utama/${nip}`);

    const data = {
      ...body,
      pnsId: currentPns?.data?.data?.id,
      kreditUtamaBaru: body?.kreditUtamaBaru?.toString(),
      kreditPenunjangBaru: body?.kreditPenunjangBaru?.toString(),
      kreditBaruTotal: body?.kreditBaruTotal?.toString(),
    };

    await request.post(`/angkakredit/save`, data);

    // create log
    await createLogSIASN({
      userId: req?.user?.customId,
      type: "CREATE",
      employeeNumber: nip,
      siasnService: "angkakredit",
    });

    res.json({
      code: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const postAngkaKreditByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;
    const body = req?.body?.data;

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

    const data = result?.data?.data;

    if (!data?.length) {
      res.json(data);
    } else {
      const hasil = orderBy(
        data,
        [
          (d) => {
            const dateParts = d?.tmtJabatan?.split("-");
            return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
          },
        ],
        ["desc"]
      );
      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getJabatanByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;

    const { nip } = req?.query;

    const result = await request.get(`/pns/rw-jabatan/${nip}`);

    const data = result?.data?.data;

    if (!data?.length) {
      res.json(data);
    } else {
      const hasil = orderBy(
        data,
        [
          (d) => {
            const dateParts = d?.tmtJabatan?.split("-");
            return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
          },
        ],
        ["desc"]
      );
      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const postRiwayatJabatan = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;
    const body = req?.body?.data;

    // cekId
    const dataUtama = await request.get(`/pns/data-utama/${nip}`);

    // insert log
    await createLogSIASN({
      userId: req?.user?.customId,
      type: "CREATE",
      employeeNumber: nip,
      siasnService: "jabatan",
    });

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

const postRiwayatJabatanByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;
    const body = req?.body;

    // cekId
    const dataUtama = await request.get(`/pns/data-utama/${nip}`);
    const id = dataUtama?.data?.data?.id;
    const data = {
      ...body,
      pnsId: id,
    };

    await request.post(`/jabatan/save`, data);

    // create log
    await createLogSIASN({
      userId: req?.user?.customId,
      type: "CREATE",
      employeeNumber: nip,
      siasnService: "jabatan",
    });

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

const getTokenSIASN = async (req, res) => {
  try {
    const firstToken = await ssoFetcher();
    const secondToken = await wso2Fetcher();

    res.json({
      accessToken: {
        sso: firstToken,
        wso2: secondToken,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwPendidikan = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;

    const result = await riwayatPendidikan(request, nip);
    const data = result?.data?.data;

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwPendidikanByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;

    const result = await riwayatPendidikan(request, nip);
    const data = result?.data?.data;

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwGolongan = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;

    const result = await riwayatGolonganPangkat(request, nip);

    const data = result?.data?.data;
    const sortData = orderBy(data, ["golongan"], "desc");

    res.json(sortData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwKeluarga = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req?.user;

    const { data: dataOrtu } = await proxyKeluargaDataOrtu(fetcher, nip);
    const { data: dataAnak } = await proxyKeluargaAnak(fetcher, nip);
    const { data: dataPasangan } = await proxyKeluargaPasangan(fetcher, nip);

    res.json({
      ortu: dataOrtu,
      anak: dataAnak,
      pasangan: dataPasangan,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwMasaKerja = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;

    const result = await riwayatPMK(request, nip);
    const data = result?.data?.data;

    if (data === "Data tidak ditemukan") {
      res.json([]);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwPenghargaan = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;

    const result = await riwayatPenghargaan(request, nip);
    const data = result?.data?.data;

    if (data === "Data tidak ditemukan") {
      res.json([]);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwCltn = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;

    const result = await riwayatCtln(request, nip);
    const data = result?.data?.data;

    if (data === "Data tidak ditemukan") {
      res.json([]);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwDiklat = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { employee_number: nip } = req?.user;
    const kursus = await riwayatKursus(request, nip);
    const diklat = await riwayatDiklat(request, nip);

    const dataKursus = kursus?.data?.data;
    const dataDiklat = diklat?.data?.data;

    res.json({
      kursus: dataKursus,
      diklat: dataDiklat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const postRiwayatKursus = async (req, res) => {
  try {
    const { siasnRequest: request, body } = req;
    const { employee_number: nip } = req?.user;

    const dataUtama = await request.get(`/pns/data-utama/${nip}`);
    const pnsOrangId = dataUtama?.data?.data?.id;

    const data = {
      ...body,
      pnsOrangId,
    };

    const result = await postDataKursus(request, data);

    if (result?.data?.status === "success") {
      res.json({ code: 200 });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  downloadDocument,
  getAngkaKredit,
  getAngkaKreditByNip,
  getHukdis,
  getJabatan,
  getJabatanByNip,
  getRefJft,
  getRefJfu,
  getRwCltn,
  getRwDiklat,
  getRwGolongan,
  getRwKeluarga,
  getRwMasaKerja,
  getRwPendidikan,
  getRwPendidikanByNip,
  getRwPenghargaan,
  getSkp,
  getSkp2022,
  getSkp2022ByNip,
  getTokenSIASN,
  getTreeRef,
  postAngkaKredit,
  postAngkaKreditByNip,
  postRiwayatJabatan,
  postRiwayatJabatanByNip,
  postRiwayatKursus,
  postSkp2022,
  postSkp2022ByNip,
  siasnEmployeeDetailByNip,
  siasnEmployeeDetailPangkat,
  siasnEmployeesDetail,
  siasnRwMasaKerja,
  siasnRwPemberhentian,

  //
  updateEmployeeInformation,
};
