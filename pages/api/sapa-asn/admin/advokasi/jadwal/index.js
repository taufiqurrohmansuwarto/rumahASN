import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import {
  getJadwal,
  upsertJadwal,
} from "@/controller/sapa-asn/admin/advokasi.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getJadwal).post(upsertJadwal);

export default router.handler();

