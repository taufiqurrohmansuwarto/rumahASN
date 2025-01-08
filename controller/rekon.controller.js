import { raw } from "objection";

const UnorSiasn = require("@/models/ref-siasn-unor.model");
const UnorSimaster = require("@/models/sync-unor-master.model");
const RekonUnor = require("@/models/rekon/unor.model");
const arrayToTree = require("array-to-tree");
const ExcelJS = require("exceljs");

// unor siasn
export const getUnorSiasn = async (req, res) => {
  try {
    const result = await UnorSiasn.query();
    const dataFlat = result?.map((d) => ({
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
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// unor simaster
export const getUnorSimaster = async (req, res) => {
  try {
    const { current_role, organization_id } = req?.user;
    const orgId = current_role === "admin" ? "1" : organization_id;

    const result = await UnorSimaster.getRelationCountsPerId(orgId);

    const tree = arrayToTree(result, {
      parentProperty: "parentId",
      customID: "id",
    });

    res.json(tree);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// detail unor simaster
export const getDetailUnorSimaster = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await UnorSimaster.query()
      .findById(id)
      .select(
        "id",
        "name",
        "pId",
        raw("get_hierarchy_simaster(id) as hierarchy")
      );
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// rekon
export const getRekonUnor = async (req, res) => {
  try {
    const { master_id } = req?.query;
    const result = await RekonUnor.query()
      .where("id_simaster", master_id)
      .select(
        "id",
        "id_siasn",
        "id_simaster",
        raw("get_hierarchy_siasn(id_siasn) as unor_siasn")
      );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const postRekonUnor = async (req, res) => {
  try {
    const payload = req?.body;
    const { custom_id: customId } = req?.user;

    const check = await RekonUnor.query()
      .where("id_siasn", payload?.id_siasn)
      .andWhere("id_simaster", payload?.id_simaster);

    if (check?.length > 0) {
      res.json(null);
    } else {
      const result = await RekonUnor.query().insert({
        ...payload,
        user_id: customId,
      });
      res.json({
        message: "Success",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateRekonUnor = async (req, res) => {
  try {
    const payload = req?.body;
    const { userId } = req?.user;
    const { unorId } = req?.query;
    const result = await RekonUnor.query()
      .where("id", unorId)
      .andWhere("user_id", userId)
      .patch({
        ...payload,
      });
    res.json({
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteRekonUnor = async (req, res) => {
  try {
    const { unorId } = req?.query;
    const result = await RekonUnor.query().where("id", unorId).delete();
    console.log(result);

    res.json({
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getRekonUnorReport = async (req, res) => {
  const { current_role, organization_id } = req?.user;
  const orgId = current_role === "admin" ? "1" : organization_id;

  const data = await UnorSimaster.getReport(orgId);
  const rows = [];
  let no = 1;

  // Proses data untuk laporan
  data.forEach((record) => {
    const { id_simaster, id_siasn, name, unor_siasn, level } = record; // Level berasal dari rekursi tree query

    // Pecah id_siasn menjadi array jika ada lebih dari satu (misalnya dipisahkan koma)
    const idsiasnList = id_siasn ? id_siasn.split(",") : [];

    // Gabungkan id_siasn ke dalam satu string dengan pemisah koma
    const idSiasnString = idsiasnList.join(", ");

    // Tambahkan indentasi pada nama sesuai dengan level menggunakan "-"
    const indentedName = `${"-".repeat(level * 2)}${name}`; // Menjorok sesuai level

    // Tambahkan data ke baris
    rows.push({
      No: no++,
      ID_SIMASTER: id_simaster,
      NAME: indentedName,
      ID_SIASN: idSiasnString || "", // Jika kosong, tetap kosong
      UNOR_SIASN: unor_siasn || "",
      JUMLAH_ID_SIASN: idsiasnList.length, // Hitung jumlah id_siasn
    });
  });

  // Membuat workbook dan worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Rekon Unor");

  // Menambahkan header kolom
  worksheet.columns = [
    { header: "No", key: "No", width: 10 },
    { header: "ID_SIMASTER", key: "ID_SIMASTER", width: 30 },
    { header: "NAME", key: "NAME", width: 110 },
    { header: "ID_SIASN", key: "ID_SIASN", width: 50 },
    { header: "UNOR_SIASN", key: "UNOR_SIASN", width: 50 },
    { header: "JUMLAH_ID_SIASN", key: "JUMLAH_ID_SIASN", width: 20 },
  ];

  // Menambahkan baris ke worksheet
  rows.forEach((row) => {
    const excelRow = worksheet.addRow(row);

    // Wrap text untuk kolom NAME dan UNOR_SIASN
    excelRow.getCell("NAME").alignment = { wrapText: true };
    excelRow.getCell("UNOR_SIASN").alignment = { wrapText: true };

    // Beri warna merah jika ID_SIASN kosong
    if (!row.ID_SIASN) {
      excelRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" }, // Warna merah
        };
      });
    }

    // Tambahkan border pada semua sel di baris
    excelRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Atur style header
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDDDDD" }, // Warna abu-abu
    };

    // Tambahkan border pada header
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Set header respon
  const fileName = `rekon_unor_report_${orgId}.xlsx`;
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  // Kirim file Excel
  await workbook.xlsx.write(res);
};

export const getRekonUnorStatistics = async (req, res) => {
  const { current_role, organization_id } = req?.user;
  const orgId = current_role === "admin" ? "1" : organization_id;

  try {
    const statistics = await UnorSimaster.getProgress(orgId);
    res.json(statistics);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Gagal mendapatkan statistik rekon unor",
    });
  }
};

export const getSIASNUnor = async (req, res) => {
  try {
    const result = await UnorSiasn.query().select(
      raw("get_hierarchy_siasn('Id')").as("nama_unor")
    );

    console.log(result[0]);

    // save to excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SIASN Unor");
    worksheet.columns = [
      { header: "Id", key: "Id", width: 10 },
      { header: "Nama Unor", key: "nama_unor", width: 100 },
      { header: "Nama Unor Atasan", key: "nama_unor_atasan", width: 100 },
    ];

    result.forEach((row) => {
      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SIASN_Unor.xlsx`
    );
    await workbook.xlsx.write(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
