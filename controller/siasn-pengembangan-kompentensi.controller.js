const { createLogSIASN } = require("@/utils/logs");

const xlsx = require("xlsx");

const {
  postDataKursus,
  postDataDiklat,
  riwayatKursus,
  riwayatDiklat,
  IPASNBaru,
  dataUtama,
} = require("@/utils/siasn-utils");
const { toString, upperCase } = require("lodash");

const postRiwayatKursus = async (req, res) => {
  try {
    const { siasnRequest: request, body } = req;
    const { employee_number: nip } = req?.user;

    const dataUtama = await request.get(`/pns/data-utama/${nip}`);
    const pnsOrangId = dataUtama?.data?.data?.id;
    const instansiId = "A5EB03E23CCCF6A0E040640A040252AD";
    const type = req?.body?.type;

    const data = {
      ...body,
      jenisDiklatId: toString(body.jenisDiklatId),
      pnsOrangId,
      instansiId,
    };

    let result;

    //     karena ada 2 post maka saya beri toggle untuk membedakan antara kursus dan diklat
    if (type === "kursus") {
      result = await postDataKursus(request, data);
    } else if (type === "diklat") {
      // data yang di post ke siasn berbeda antara kursus dan diklat
      const payload = {
        pnsOrangId,
        instansiId,
        latihanStrukturalId: data?.latihanStrukturalId,
        nomor: data?.nomorSertipikat,
        tahun: data?.tahunKursus,
        tanggal: data?.tanggalKursus,
        tanggalSelesai: data?.tanggalSelesaiKursus,
        institusiPenyelenggara: data?.institusiPenyelenggara,
        jumlahJam: data?.jumlahJam,
      };

      result = await postDataDiklat(request, payload);
    }

    if (!result?.data?.success) {
      res.status(400).json({
        message: result?.data?.message,
      });
    } else {
      await createLogSIASN({
        userId: req?.user?.customId,
        type: "POST",
        siasnService: upperCase(type),
        employeeNumber: nip,
        request_data: JSON.stringify(data),
      });
      res.json({
        message: "OK",
        data,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const postRiwayatKursusByNip = async (req, res) => {
  try {
    const { siasnRequest: request, body } = req;
    const { nip } = req?.query;

    const dataUtama = await request.get(`/pns/data-utama/${nip}`);
    const pnsOrangId = dataUtama?.data?.data?.id;
    const instansiId = "A5EB03E23CCCF6A0E040640A040252AD";
    const type = req?.body?.type;

    const data = {
      ...body,
      jenisDiklatId: toString(body.jenisDiklatId),
      pnsOrangId,
      instansiId,
    };

    let result;

    //     karena ada 2 post maka saya beri toggle untuk membedakan antara kursus dan diklat
    if (type === "kursus") {
      result = await postDataKursus(request, data);
    } else if (type === "diklat") {
      // data yang di post ke siasn berbeda antara kursus dan diklat
      const payload = {
        pnsOrangId,
        instansiId,
        latihanStrukturalId: data?.latihanStrukturalId,
        nomor: data?.nomorSertipikat,
        tahun: data?.tahunKursus,
        tanggal: data?.tanggalKursus,
        tanggalSelesai: data?.tanggalSelesaiKursus,
        institusiPenyelenggara: data?.institusiPenyelenggara,
        jumlahJam: data?.jumlahJam,
      };

      result = await postDataDiklat(request, payload);
    }

    if (!result?.data?.success) {
      res.status(400).json({
        message: result?.data?.message,
      });
    } else {
      await createLogSIASN({
        userId: req?.user?.customId,
        type: "POST",
        siasnService: upperCase(type),
        employeeNumber: nip,
        request_data: JSON.stringify(data),
      });
      res.json({
        message: "OK",
        data,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getIpAsn = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req?.user;
    const tahun = req?.query?.tahun || new Date().getFullYear();
    const result = await fetcher.get(
      `/siasn-ws/layanan/ip-asn/${nip}?tahun=${tahun}`
    );
    const hasil = result?.data;

    if (hasil) {
      res.json(hasil);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getNilaiIPASN = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    // const { nip } = req?.query;
    const { employee_number: nip } = req?.user;
    const nilaiIPASN = await IPASNBaru(fetcher, nip);
    res.json(nilaiIPASN);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getNilaiIPASNByNip = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    const { nip } = req?.query;
    // const { employee_number: nip } = req?.user;
    const nilaiIPASN = await IPASNBaru(fetcher, nip);
    res.json(nilaiIPASN);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getIpAsnByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req?.query;
    const tahun = req?.query?.tahun || new Date().getFullYear();

    const result = await fetcher.get(
      `/siasn-ws/layanan/ip-asn/${nip}?tahun=${tahun}`
    );

    const hasil = result?.data;

    if (hasil) {
      res.json(hasil);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getRwDiklatByNip = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const { nip } = req?.query;
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
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const downloadIPASNTahunan = async (req, res) => {
  try {
    const tahun = req?.query?.tahun || new Date().getFullYear() - 1;
    const limit = req?.query?.limit || 10;
    const offset = req?.query?.offset || 0;

    const { fetcher } = req;
    const type = req?.query?.type || "xlsx";

    const url = `/siasn-ws/layanan/ip-asn?tahun=${tahun}&limit=1`;
    const result = await fetcher.get(url);

    if (type === "json") {
      res.json(result?.data?.data);
    } else if (type === "xlsx") {
      console.log("masuk sini");
      // get the fucking total and get all data
      const secondUrl = `/siasn-ws/layanan/ip-asn?tahun=${tahun}&limit=${limit}&offset=${offset}`;

      const secondResult = await fetcher.get(secondUrl);

      const data = secondResult?.data?.data?.data;

      let currentData = [];

      if (!data?.length) {
        currentData = [];
      } else {
        currentData = data;
      }

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(currentData);

      xlsx.utils.book_append_sheet(wb, ws, "IP ASN tahun");

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "ipasn.xlsx"
      );

      res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  downloadIPASNTahunan,
  getRwDiklatByNip,
  postRiwayatKursus,
  postRiwayatKursusByNip,
  getIpAsn,
  getNilaiIPASN,
  getIpAsnByNip,
  getNilaiIPASNByNip,
};
