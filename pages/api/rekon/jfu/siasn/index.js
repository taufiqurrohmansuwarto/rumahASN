import { refJabatanPelaksanaSiasn } from "@/controller/rekon/rekon-jfu.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorMiddleware).get(refJabatanPelaksanaSiasn);

export default router.handler({});
