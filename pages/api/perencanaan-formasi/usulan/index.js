import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import {
  getAll as getAllUsulan,
  create as createUsulan,
} from "@/controller/perencanaan/usulan.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).get(getAllUsulan).post(createUsulan);

export default router.handler({});

