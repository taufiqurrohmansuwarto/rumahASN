import { handleError } from "@/utils/helper/controller-helper";
import StatusUsul from "@/models/ref_siasn/status-usul.model";

// import json status usul
const jsonStatusUsul = require("@/docs/siasn/status-usul.json");

export const syncStatusUsul = async (req, res) => {
  try {
    const knex = StatusUsul.knex();
    //     remove first
    await knex.delete().from("ref_siasn.status_usul");
    //     insert new
    await knex.insert(jsonStatusUsul).into("ref_siasn.status_usul");
    res.json({ status: true, message: "Status Usul berhasil diambil" });
  } catch (error) {
    handleError(res, error);
  }
};

export const getStatusUsul = async (req, res) => {
  const knex = StatusUsul.knex();
  try {
    const getAllStatusUsul = await StatusUsul.query();

    if (getAllStatusUsul.length === 0) {
      await knex.delete().from("ref_siasn.status_usul");
      await knex.batchInsert("ref_siasn.status_usul", jsonStatusUsul);
    }

    const result = await knex.select("*").from("ref_siasn.status_usul");
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
