import { adminPerencanaanUsulanDetail } from "@/controller/perencanaan.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(adminPerencanaanUsulanDetail);

export default router.handler();
