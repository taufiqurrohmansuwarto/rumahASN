const xlsx = require("xlsx");
const Anomali23 = require("@/models/anomali23.model");
const { raw } = require("objection");
const {
  getAggregateAnomali,
  getPerbaikanByUser,
} = require("@/utils/query-utils");

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
      // read file from buffer

      const workbook = xlsx.read(file?.buffer);
      const sheet_name_list = workbook.SheetNames;
      const xlData = xlsx.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]]
      );
      await Anomali23.query().delete();
      await Anomali23.query().insert(xlData);
      trx.commit();
      res.status(200).json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    trx.rollback();
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
        if (is_repaired) {
          builder.where("is_repaired", is_repaired);
        }
      })

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
      .withGraphFetched("[user(simpleSelect)]");

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

    const sendData = {
      data: data.results,
      total: data.total,
      limit: parseInt(limit),
      page: parseInt(page),
      chart: {
        pieChart,
        barFirst,
        barSecond,
      },
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

const userAnomali2022 = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const data = await Anomali23.query()
      .where({
        employee_number,
      })
      .first();
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  uploadAnomali2022,
  getAnomali2022,
  patchAnomali2022,
  userAnomali2022,
  downloadReportAnomali,
};
