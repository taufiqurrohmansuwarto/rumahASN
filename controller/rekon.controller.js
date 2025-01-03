import { raw } from "objection";

const UnorSiasn = require("@/models/ref-siasn-unor.model");
const UnorSimaster = require("@/models/sync-unor-master.model");
const RekonUnor = require("@/models/rekon/unor.model");
const arrayToTree = require("array-to-tree");

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

    const result = await UnorSimaster.query()
      .where("id", "ilike", `${orgId}%`)
      .select(
        "id",
        "pId as parentId",
        "name as name",
        "id as value",
        "name as label",
        "name as title"
      );

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
  const { userId } = req?.user;
  const result = await RekonUnor.query().where("user_id", userId);
  res.json(result);
};


export const getRekonUnorStatistics = async (req, res) => {
  const { userId } = req?.user;
  const result = await RekonUnor.query().where("user_id", userId);
  res.json(result);
};

