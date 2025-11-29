import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import {
  getById,
  updateStatus,
} from "@/controller/sapa-asn/admin/konsultasi-hukum.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getById).patch(updateStatus);

export default router.handler();

