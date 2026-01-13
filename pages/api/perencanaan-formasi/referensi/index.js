import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import {
  getJabatanFungsional,
  getJabatanPelaksana,
  getPendidikan,
} from "@/controller/perencanaan/referensi.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator);

// GET /api/perencanaan-formasi/referensi?type=jft|jfu|pendidikan
router.get(async (req, res) => {
  const { type } = req.query;

  switch (type) {
    case "jft":
      return getJabatanFungsional(req, res);
    case "jfu":
      return getJabatanPelaksana(req, res);
    case "pendidikan":
      return getPendidikan(req, res);
    default:
      return res.status(400).json({ message: "Type tidak valid. Gunakan: jft, jfu, atau pendidikan" });
  }
});

export default router.handler({});
