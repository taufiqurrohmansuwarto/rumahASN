import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import { masaKerjaKurangDari2TahunStruktural } from "@/controller/kualitas-data/accuracy.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(masaKerjaKurangDari2TahunStruktural);

export default router.handler();
