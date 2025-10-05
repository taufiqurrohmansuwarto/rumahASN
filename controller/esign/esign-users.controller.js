import { handleError } from "@/utils/helper/controller-helper";
import { raw } from "objection";
const User = require("@/models/users.model");

// find all users except the current user
export const findAll = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const users = await User.query()
      .select(
        "users.custom_id as id",
        "users.custom_id as value",
        "users.username as label",
        "users.username as username",
        "users.image as image",
        "users.image as avatar",
        "users.group as group",
        "users.from as from",
        "users.status_kepegawaian as status_kepegawaian",
        // ambil jabatan dari info->jabatan->jabatan
        raw("info->'jabatan'->>'jabatan' as nama_jabatan"),
        // ambil perangkat daerah detail dari info->perangkat_daerah->>detail
        raw("info->'perangkat_daerah'->>'detail' as perangkat_daerah_detail")
      )
      .andWhere("role", "=", "USER")
      .andWhere("group", "=", "MASTER")
      .andWhere("organization_id", "ilike", "123%")
      .orderBy("username", "asc");

    res.json(users);
  } catch (error) {
    handleError(res, error);
  }
};
