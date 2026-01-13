import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import {
  getById as getFormasiById,
  update as updateFormasi,
  remove as deleteFormasi,
} from "@/controller/perencanaan/formasi.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitator)
  .get(getFormasiById)
  .patch(updateFormasi)
  .delete(deleteFormasi);

export default router.handler({});

