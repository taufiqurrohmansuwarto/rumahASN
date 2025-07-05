import { handleError } from "@/utils/helper/controller-helper";

const Anomali = require("@/models/anomali23.model");
const PegawaiSimaster = require("@/models/sync-pegawai.model");

export const syncAnomali = async () => {
  try {
    const knex = PegawaiSimaster.knex();

    const pegawaiSimaster = await knex
      .select("a23.nip_baru", "")
      .from("anomali_23 as a23")
      .leftJoin("sync_pegawai as sp", "a23.nip_baru", "sp.nip_master");
    console.log(pegawaiSimaster);
  } catch (error) {
    handleError(error);
  }
};
export const resumeAnomali = async () => {};
export const stopAnomali = async () => {};
export const getInfoAnomali = async () => {};
export const restartSyncAnomali = async () => {};
