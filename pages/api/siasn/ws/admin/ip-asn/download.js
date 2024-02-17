import { downloadIPASNTahunan } from "@/controller/siasn-pengembangan-kompentensi.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(downloadIPASNTahunan);

export default router.handler();
