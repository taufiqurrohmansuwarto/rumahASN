import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import {
  getById as getUsulanById,
  update as updateUsulan,
  remove as deleteUsulan,
} from "@/controller/perencanaan/usulan.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).get(getUsulanById).patch(updateUsulan).delete(deleteUsulan);

export default router.handler({});

