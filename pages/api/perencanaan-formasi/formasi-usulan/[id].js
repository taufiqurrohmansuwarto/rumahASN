import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import {
  getById as getFormasiUsulanById,
  update as updateFormasiUsulan,
  remove as deleteFormasiUsulan,
} from "@/controller/perencanaan/formasi_usulan.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitator)
  .get(getFormasiUsulanById)
  .patch(updateFormasiUsulan)
  .delete(deleteFormasiUsulan);

export default router.handler({});
