const { default: axios } = require("axios");
const apiGateway = process.env.APIGATEWAY_URL;
const fs = require("fs");
const path = require("path");

const moment = require("moment");
const arrayToTree = require("array-to-tree");
const { orderBy, trim, toString, toNumber } = require("lodash");
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
  riwayatPindahInstansi,
  riwayatPindahWilayahKerja,
  riwayatPnsUnor,
} = require("@/utils/siasn-utils");

const {
  proxyKeluargaDataOrtu,
  proxyKeluargaAnak,
  proxyKeluargaPasangan,
  cariPnsKinerja,
} = require("@/utils/siasn-proxy.utils");
const { getRwPangkat } = require("@/utils/master.utils");
const { createLogSIASN } = require("@/utils/logs");
const BackupSIASN = require("@/models/backup-siasn.model");
const RefSIASNUnor = require("@/models/ref-siasn-unor.model");
const { getSession } = require("next-auth/react");

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

    await createLogSIASN({
      userId: req?.user?.customId,
      type: "UPDATE",
      employeeNumber: nip,
      siasnService: "data-utama",
      request_data: JSON.stringify(payload),
    });

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
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const allPnsByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const siasnRequest = req.siasnRequest;

    const hasil = await getSession({ req });

    const fetcher = axios.create({
      baseURL: apiGateway,
      headers: {
        Authorization: `Bearer ${hasil?.accessToken}`,
      },
    });

    const { data } = await cariPnsKinerja(fetcher, nip);
    res.json(data);
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

    const data = result?.data;

    if (data?.code === 0) {
      return res.json([]);
    } else {
      return res.json(data?.data);
    }
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

    const data = result?.data;

    if (data?.code === 0) {
      return res.json([]);
    } else {
      return res.json(data?.data);
    }
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

    const results = await Promise.allSettled([
      riwayatGolonganPangkat(siasnRequest, nip),
      getRwPangkat(fetcher, nip),
    ]);

    const pangkat_simaster =
      results[1].status === "fulfilled" ? results[1].value.data : [];
    const pangkat_siasn =
      results[0].status === "fulfilled" ? results[0].value.data : [];

    const data = {
      pangkat_siasn: orderBy(pangkat_siasn?.data, "golongan", "desc"),
      pangkat_simaster: orderBy(
        pangkat_simaster,
        (item) => item?.pangkat?.gol_ruang,
        "desc"
      ),
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const removeBackupSIASN = async (req, res) => {
  try {
    await BackupSIASN.query().delete();
    res.json({ code: 200, message: "success" });
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
      titleJabatan: d?.NamaJabatan,
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
    const { pns_penilai, ...body } = req?.body?.data;
    const { employee_number: nip } = req?.user;

    const apiGateway = process.env.APIGATEWAY_URL;
    const hasil = await getSession({ req });

    const fetcher = axios.create({
      baseURL: apiGateway,
      headers: {
        Authorization: `Bearer ${hasil?.accessToken}`,
      },
    });

    const dataCurrent = await siasnRequest.get(`/pns/data-utama/${nip}`);
    const dataPenilai = await cariPnsKinerja(fetcher, pns_penilai);

    if (!dataPenilai) {
      res.status(500).json({ message: "error" });
    } else {
      const penilai = dataPenilai?.data;
      const currentPns = dataCurrent?.data?.data;

      const data = {
        ...body,
        hasilKinerjaNilai: parseInt(body?.hasilKinerjaNilai),
        perilakuKerjaNilai: parseInt(body?.perilakuKerjaNilai),
        kuadranKinerjaNilai: getKuadran(
          parseInt(body?.hasilKinerjaNilai),
          parseInt(body?.perilakuKerjaNilai)
        ),
        penilaiGolongan: penilai?.golongan_id,
        penilaiJabatan: penilai?.jabatan_nama,
        penilaiNama: penilai?.nama,
        penilaiNipNrp: penilai?.nip_baru,
        penilaiUnorNama: penilai?.unor_nm,
        pnsDinilaiOrang: currentPns?.id,
        statusPenilai: "ASN",
        tahun: toNumber(body?.tahun) || 2022,
      };

      await siasnRequest.post("/skp22/save", data);

      await createLogSIASN({
        userId: req?.user?.customId,
        type: "CREATE",
        employeeNumber: nip,
        siasnService: "skp22",
      });

      res.json({ code: 200 });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const postSkp2022ByNip = async (req, res) => {
  try {
    const { siasnRequest } = req;
    const { pns_penilai, ...body } = req?.body;
    const { nip } = req?.query;

    const apiGateway = process.env.APIGATEWAY_URL;
    const hasil = await getSession({ req });

    const fetcher = axios.create({
      baseURL: apiGateway,
      headers: {
        Authorization: `Bearer ${hasil?.accessToken}`,
      },
    });

    const dataCurrent = await siasnRequest.get(`/pns/data-utama/${nip}`);

    const dataPenilai = await cariPnsKinerja(fetcher, pns_penilai);

    if (!dataPenilai) {
      res.status(500).json({ message: "error" });
    } else {
      const penilai = dataPenilai?.data;
      const currentPns = dataCurrent?.data?.data;

      const data = {
        ...body,
        hasilKinerjaNilai: parseInt(body?.hasilKinerjaNilai),
        perilakuKerjaNilai: parseInt(body?.perilakuKerjaNilai),
        kuadranKinerjaNilai: getKuadran(
          parseInt(body?.hasilKinerjaNilai),
          parseInt(body?.perilakuKerjaNilai)
        ),
        penilaiGolongan: penilai?.golongan_id,
        penilaiJabatan: penilai?.jabatan_nama,
        penilaiNama: penilai?.nama,
        penilaiNipNrp: penilai?.nip_baru,
        penilaiUnorNama: penilai?.unor_nm,
        pnsDinilaiOrang: currentPns?.id,
        statusPenilai: "ASN",
        tahun: toNumber(body?.tahun) || 2022,
      };

      await siasnRequest.post("/skp22/save", data);

      // create log
      await createLogSIASN({
        userId: req?.user?.customId,
        type: "CREATE",
        employeeNumber: nip,
        siasnService: "skp22",
        request_data: JSON.stringify(data),
      });

      res.json({ code: 200 });
    }
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
      nomorSk: trim(body?.nomorSk?.toString()),
      pnsId: currentPns?.data?.data?.id,
      kreditUtamaBaru: toString(body?.kreditUtamaBaru),
      kreditPenunjangBaru: toString(body?.kreditPenunjangBaru),
      kreditBaruTotal: toString(body?.kreditBaruTotal),
    };

    const result = await request.post(`/angkakredit/save`, data);

    if (result?.data?.code === 0) {
      console.log(result?.data?.message);
      res.status(500).json({ message: result?.data?.message });
    } else {
      await createLogSIASN({
        userId: req?.user?.customId,
        type: "CREATE",
        employeeNumber: nip,
        siasnService: "angkakredit",
      });

      res.json({
        code: 200,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const hapusAkByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { id, nip } = req?.query;

    const result = await request.delete(`/angkakredit/delete/${id}`);

    await createLogSIASN({
      userId: req?.user?.customId,
      type: "DELETE",
      employeeNumber: nip,
      siasnService: "angkakredit",
    });

    res.json({
      code: 200,
      message: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const hapusAk = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { id } = req?.query;

    const result = await request.delete(`/angkakredit/delete/${id}`);

    await createLogSIASN({
      userId: req?.user?.customId,
      type: "DELETE",
      employeeNumber: req?.user?.employee_number,
      siasnService: "angkakredit",
    });

    res.json({
      code: 200,
      message: "success",
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
    const body = req?.body;

    const currentPns = await request.get(`/pns/data-utama/${nip}`);

    const data = {
      ...body,
      nomorSk: trim(body?.nomorSk),
      pnsId: currentPns?.data?.data?.id,
      kreditUtamaBaru: body?.kreditUtamaBaru?.toString(),
      kreditPenunjangBaru: body?.kreditPenunjangBaru?.toString(),
      kreditBaruTotal: body?.kreditBaruTotal?.toString(),
    };

    const hasil = await request.post(`/angkakredit/save`, data);

    if (hasil?.data?.code === 0) {
      console.log(hasil?.data?.message);
      res.status(500).json({ message: hasil?.data?.message });
    } else {
      await createLogSIASN({
        userId: req?.user?.customId,
        type: "CREATE",
        employeeNumber: nip,
        siasnService: "angkakredit",
        request_data: JSON.stringify(data),
      });

      res.json({
        code: 200,
        message: "success",
      });
    }
  } catch (error) {
    console.log(error);
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

const getHukdisByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;

    const result = await request.get(`/pns/rw-hukdis/${nip}`);
    const data = result?.data?.data;
    if (!data) {
      res.json([]);
    } else {
      res.json(data);
    }
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

    const result = await request.post(`/jabatan/save`, data);

    await createLogSIASN({
      userId: req?.user?.customId,
      type: "CREATE",
      employeeNumber: nip,
      siasnService: "jabatan",
      request_data: JSON.stringify(data),
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

const getRefJenisDikalt = async (req, res) => {
  try {
    const result = await axios.get(
      `https://siasn.bkd.jatimprov.go.id/pemprov-api/vendor/reference/jenis-diklat`
    );

    const order = orderBy(result?.data, ["jenis_diklat"], ["asc"]);

    const data = order?.map((d) => ({
      ...d,
      label: d?.jenis_diklat,
      value: d?.id,
    }));

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getRefUrusanPemerintahan = async (req, res) => {
  try {
    const result = await axios.get(
      `https://siasn.bkd.jatimprov.go.id/pemprov-api/vendor/reference/urusan-pemerintahan`
    );

    const data = result?.data?.map((d) => ({
      ...d,
      label: d?.nama,
      value: d?.id,
    }));

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

const getDiklatStruktural = async (req, res) => {
  try {
    const result = await axios.get(
      `https://siasn.bkd.jatimprov.go.id/pemprov-api/vendor/reference/diklat-struktural`
    );

    const data = result?.data?.map((d) => ({
      ...d,
      label: d?.nama,
      value: d?.id,
    }));

    res.json(data);
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
  const CURRENT_DIRECTORY = process.cwd();
  const filePath = path.join(CURRENT_DIRECTORY, "token.json");

  try {
    const token = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sso_token = token?.sso_token;
    const wso_token = token?.wso_token;

    res.json({
      accessToken: {
        sso: sso_token,
        wso2: wso_token,
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

const riwayatKeluargaByNip = async (req, res) => {
  try {
    const { siasnRequest: request, fetcher } = req;
    const { nip } = req?.query;

    const hasilAnak = await proxyKeluargaAnak(fetcher, nip);
    const hasilPasangan = await proxyKeluargaPasangan(fetcher, nip);
    // const hasilPasangan = await pasangan(request, nip);
    const hasilOrtu = await proxyKeluargaDataOrtu(fetcher, nip);

    res.json({
      anak: hasilAnak?.data,
      pasangan: hasilPasangan?.data,
      ortu: hasilOrtu?.data,
    });
  } catch (error) {
    console.log("error coy", error);
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

    const dataKursus = orderBy(kursus?.data?.data, ["tahun"], "desc");
    const dataDiklat = orderBy(diklat?.data?.data, ["tahun"], "desc");

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

const getRwPindahInstansiByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;
    const result = await riwayatPindahInstansi(request, nip);
    const hasil = result?.data;
    const success = hasil?.code === 1 && hasil?.data?.length !== 0;

    if (success) {
      res.json(hasil?.data);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwPwkByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;
    const result = await riwayatPindahWilayahKerja(request, nip);
    const hasil = result?.data;

    const success = hasil?.code === 1 && hasil?.data?.length !== 0;

    if (success) {
      res.json(hasil?.data);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const getRwPnsUnorByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;
    const result = await riwayatPnsUnor(request, nip);

    const hasil = result?.data;

    const success = hasil?.code === 1 && hasil?.data?.length !== 0;

    if (success) {
      res.json(hasil?.data);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  getRwPwkByNip,
  getRwPnsUnorByNip,
  getRwPindahInstansiByNip,
  downloadDocument,
  getAngkaKredit,
  getAngkaKreditByNip,
  getHukdis,
  getHukdisByNip,
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
  removeBackupSIASN,
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
  allPnsByNip,
  riwayatKeluargaByNip,
  hapusAkByNip,
  hapusAk,

  getRefJenisDikalt,
  getRefUrusanPemerintahan,
  getDiklatStruktural,
};
