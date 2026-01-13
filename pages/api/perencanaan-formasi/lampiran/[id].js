import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import {
  getById as getLampiranById,
  update as updateLampiran,
  remove as deleteLampiran,
} from "@/controller/perencanaan/lampiran.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).get(getLampiranById).patch(updateLampiran).delete(deleteLampiran);

export default router.handler({});

