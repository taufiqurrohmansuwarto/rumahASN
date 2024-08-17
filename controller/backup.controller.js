const SyncUnorMaster = require("@/models/sync-unor-master.model");
const arrayToTree = require("array-to-tree");

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

module.exports = {
  unorBackup,
};
