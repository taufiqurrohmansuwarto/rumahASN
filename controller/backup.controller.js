const SyncUnorMaster = require("@/models/sync-unor-master.model");
const arrayToTree = require("array-to-tree");
const SimasterJft = require("@/models/simaster-jft.model");
const SimasterJfu = require("@/models/simaster-jfu.model");
const SiasnPendidikan = require("@/models/siasn-pend.model");

const unorBackup = async (req, res) => {
  try {
    let opd;
    const { current_role, organization_id } = req.user;

    if (current_role === "admin") {
      opd = 1;
    } else {
      opd = organization_id;
    }

    const result = await SyncUnorMaster.query()
      .select(
        "id as id",
        "id as value",
        "name as label",
        "name as title",
        "pId as parent_id"
      )
      .where("id", "ilike", `${opd}%`)
      .orderBy("id");

    const dataTree = arrayToTree(result, {
      parentProperty: "parent_id",
      customID: "value",
    });

    res.json(dataTree);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

const simasterJftBackup = async (req, res) => {
  const result = await SimasterJft.query().select(
    "id as id",
    "id as value",
    "name as label",
    "name as title",
    "pId as parent_id"
  );
  const hasil = arrayToTree(result, {
    parentProperty: "parent_id",
    customID: "value",
  });
  res.json(hasil);
};
const simasterJfuBackup = async (req, res) => {
  const result = await SimasterJfu.query().select(
    "id as id",
    "id as value",
    "pId as parent_id",
    "kelas_jab as kelas",
    SimasterJfu.raw("concat(name, ' - ', kelas_jab) as label"),
    SimasterJfu.raw("concat(name, ' - ', kelas_jab) as title")
  );

  const hasil = arrayToTree(result, {
    parentProperty: "parent_id",
    customID: "value",
  });
  res.json(hasil);
};

const siasnPendBackup = async (req, res) => {
  try {
    const result = await SiasnPendidikan.query().select(
      "*",
      "nama as name",
      "nama as label"
    );
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  unorBackup,
  simasterJftBackup,
  simasterJfuBackup,
  siasnPendBackup,
};
