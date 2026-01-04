import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { downloadDokumenAdministrasi } from "@/controller/download/download-sk.controller";

const router = createRouter();

router
  .use(auth)
  .use(fasilitatorMasterMiddleware)
  .get(downloadDokumenAdministrasi);

export default router.handler();
