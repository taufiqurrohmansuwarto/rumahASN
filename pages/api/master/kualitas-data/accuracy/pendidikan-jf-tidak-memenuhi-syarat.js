import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import { tingkatPendidikanJabatanFungsionalTidakMemenuhiSyarat } from "@/controller/kualitas-data/accuracy.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(tingkatPendidikanJabatanFungsionalTidakMemenuhiSyarat);

export default router.handler();
