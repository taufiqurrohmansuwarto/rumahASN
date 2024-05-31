import { referensiJenisRiwayat } from "@/controller/layanan.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(referensiJenisRiwayat);

export default router.handler();
