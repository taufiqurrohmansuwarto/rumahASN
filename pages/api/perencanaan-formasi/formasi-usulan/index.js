import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import {
  getAll as getAllFormasiUsulan,
  create as createFormasiUsulan,
} from "@/controller/perencanaan/formasi_usulan.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitator)
  .get(getAllFormasiUsulan)
  .post(createFormasiUsulan);

export default router.handler({});
