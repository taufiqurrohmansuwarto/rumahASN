const xlsx = require("xlsx");
const Anomali23 = require("@/models/anomali23.model");
const {
  getAggregateAnomali,
  getPerbaikanByUser,
} = require("@/utils/query-utils");
const { sortBy } = require("lodash");
const dayjs = require("dayjs");
const { handleError } = require("@/utils/helper/controller-helper");

dayjs.locale("id");
require("dayjs/locale/id");

const downloadReportAnomali = async (req, res) => {
  try {
    const result = await Anomali23.query().withGraphFetched(
      "[user(simpleSelect)]"
    );

    const serialize = result.map((item) => {
      return {
        ...item,
        nama: item?.user?.username,
      };
    });

    const data = xlsx.utils.json_to_sheet(serialize);
    const wb = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(wb, data, "anomali2023");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "report.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadAnomali2022 = async (req, res) => {
  const trx = await Anomali23.startTransaction();
  try {
    const file = req?.file;

    if (!file) {
      res.status(400).json({ message: "File is required" });
    } else {
      const workbook = xlsx.read(file?.buffer);
      const sheet_name_list = workbook.SheetNames;

      const xlData = xlsx.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]]
      );

      // Ekstrak jenis anomali unik dari file Excel
      const uniqueAnomalies = [
        ...new Set(
          xlData.map((item) => item.jenis_anomali_nama).filter(Boolean)
        ),
      ];

      // Hapus data yang ada untuk jenis anomali yang ada di file Excel
      if (uniqueAnomalies.length > 0) {
        await Anomali23.query(trx)
          .whereIn("jenis_anomali_nama", uniqueAnomalies)
          .delete();
      }

      // Insert semua data dari Excel
      if (xlData.length > 0) {
        await Anomali23.query(trx).insert(xlData);
      }

      await trx.commit();
      res.status(200).json({
        message: "success",
        inserted: xlData.length,
        processedAnomalies: uniqueAnomalies,
      });
    }
  } catch (error) {
    console.log(error);
    await trx.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAnomali2022 = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 20;
    const jenis_anomali = req?.query?.jenis_anomali || "";
    const is_repaired = req?.query?.is_repaired || false;

    const data = await Anomali23.query()
      .where((builder) => {
        if (jenis_anomali) {
          builder.where("jenis_anomali_nama", "like", `%${jenis_anomali}%`);
        }
      })
      .andWhere("is_repaired", is_repaired)
      .page(parseInt(page) - 1, parseInt(limit))
      .orderBy([
        {
          column: "jenis_anomali_nama",
          order: "desc",
        },
        {
          column: "updated_at",
          order: "desc",
        },
      ])
      .withGraphFetched("[user(simpleSelect), pegawai_simaster(simpleSelect)]");

    const sendData = {
      data: data.results,
      total: data.total,
      limit: parseInt(limit),
      page: parseInt(page),
    };

    res.json(sendData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const patchAnomali2022 = async (req, res) => {
  try {
    const id = req?.query?.id;
    const { customId } = req?.user;

    const reset = req?.body?.reset;

    const payload = {
      is_repaired: req?.body?.is_repaired,
      description: req?.body?.description,
      user_id: customId,
      updated_at: new Date(),
    };

    if (reset) {
      await Anomali23.query().findById(id).patch({
        is_repaired: false,
        description: null,
        user_id: null,
        updated_at: new Date(),
      });
      res.json({ message: "success" });
    } else {
      await Anomali23.query().findById(id).patch(payload);
      res.json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const anomaliByUser = async (req, res) => {
  try {
    const { employee_number } = req?.user;

    const data = await Anomali23.query()
      .where({
        nip_baru: employee_number,
      })
      .withGraphFetched("[user(simpleSelect)]")
      .andWhere("is_repaired", false);

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userAnomali2022 = async (req, res) => {
  try {
    const { employee_number } = req?.query;
    const data = await Anomali23.query()
      .where({
        nip_baru: employee_number,
      })
      .withGraphFetched("[user(simpleSelect)]");
    // .andWhere("is_repaired", false);
    // .first();

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function updateValues(data) {
  const updatedData = [...data];

  updatedData.forEach((item, index) => {
    if (item.type === "belum_diperbaiki" && item.value > 0) {
      const sameLabelItem = data.find(
        (d) =>
          d.label === item.label && d.type === "sudah_diperbaiki" && d.value > 0
      );

      if (sameLabelItem) {
        updatedData[index].value -= sameLabelItem.value;
        updatedData[index].value = Math.max(0, updatedData[index].value); // memastikan value tidak menjadi negatif
      }
    }
  });

  return updatedData;
}

const aggregateAnomali = async (req, res) => {
  try {
    const repairedCount = await Anomali23.query()
      .count("id as value")
      .where("is_repaired", true)
      .first();

    const notRepairedCount = await Anomali23.query()
      .count("id as value")
      .where("is_repaired", false)
      .first();

    const pieChart = [
      { type: "Sudah diperbaiki", value: parseInt(repairedCount.value) },
      { type: "Belum diperbaiki", value: parseInt(notRepairedCount.value) },
    ];

    const barFirst = await getAggregateAnomali();
    const barSecond = await getPerbaikanByUser();

    const pieChartResult = sortBy(pieChart, "value").reverse();
    const barFirstResult = updateValues(sortBy(barFirst, "label").reverse());
    const barSecondResult = sortBy(barSecond, "label").reverse();

    const data = {
      pieChart: pieChartResult,
      barFirst: barFirstResult,
      barSecond: barSecondResult,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const patchUserAnomali = async (req, res) => {
  try {
    const id = req?.query?.id;
    const { customId, employee_number } = req?.user;

    const reset = req?.body?.reset;

    const payload = {
      is_repaired: req?.body?.is_repaired,
      description: req?.body?.description,
      user_id: customId,
      updated_at: new Date(),
    };

    if (reset) {
      await Anomali23.query().findById(id).patch({
        is_repaired: false,
        description: null,
        user_id: null,
        updated_at: new Date(),
      });
      res.json({ message: "success" });
    } else {
      await Anomali23.query()
        .where("id", id)
        .andWhere("nip_baru", employee_number)
        .patch(payload);
      res.json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const patchUserAnomaliByNip = async (req, res) => {
  try {
    const id = req?.query?.id;
    const { customId, employee_number } = req?.user;

    const reset = req?.body?.reset;

    const payload = {
      is_repaired: req?.body?.is_repaired,
      description: req?.body?.description,
      user_id: customId,
      updated_at: new Date(),
    };

    if (reset) {
      await Anomali23.query().findById(id).patch({
        is_repaired: false,
        description: null,
        user_id: null,
        updated_at: new Date(),
      });
      res.json({ message: "success" });
    } else {
      await Anomali23.query()
        .where("id", id)
        .andWhere("nip_baru", employee_number)
        .patch(payload);
      res.json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAnomaliByNip = async (req, res) => {
  try {
    const { employee_number, id } = req?.query;
    const { customId } = req?.user;

    const reset = req?.body?.reset;

    const payload = {
      is_repaired: req?.body?.is_repaired,
      description: req?.body?.description,
      user_id: customId,
      updated_at: new Date(),
    };

    if (reset) {
      await Anomali23.query().where("nip_baru", employee_number).patch({
        is_repaired: false,
        description: null,
        user_id: null,
        updated_at: new Date(),
      });
      res.json({ message: "success" });
    } else {
      await Anomali23.query()
        .where("nip_baru", employee_number)
        .andWhere("id", id)
        .patch(payload);
      res.json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userAnomaliByDate = async (req, res) => {
  try {
    let date = req?.query?.date;

    const result = await Anomali23.query()
      .select("user.custom_id", "user.username as label")
      .whereRaw(`DATE(updated_at) = '${dayjs(date).format("YYYY-MM-DD")}'`)
      .joinRelated("user")
      .andWhere("anomali_23.is_repaired", true)
      .andWhere("user.current_role", "=", "admin")
      .count("anomali_23.id as value")
      .groupBy("user.custom_id");

    const hasil = result.map((item) => ({
      ...item,
      value: Number(item.value),
    }));

    res.json(hasil);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkAnomaliByNip = async (req, res) => {
  try {
    const { nip } = req?.query?.nip;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAllAnomali = async (req, res) => {
  try {
    await Anomali23.query().delete();
    res.json({ message: "success" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  deleteAllAnomali,
  userAnomaliByDate,
  patchUserAnomali,
  aggregateAnomali,
  uploadAnomali2022,
  getAnomali2022,
  patchAnomali2022,
  userAnomali2022,
  downloadReportAnomali,
  patchUserAnomaliByNip,
  updateAnomaliByNip,
  anomaliByUser,
};
