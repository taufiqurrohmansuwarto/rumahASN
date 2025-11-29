import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import {
  getJadwalDetail,
  updateKuota,
} from "@/controller/sapa-asn/admin/advokasi.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getJadwalDetail).patch(updateKuota);

export default router.handler();

