import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import {
  getAll as getAllFormasi,
  create as createFormasi,
} from "@/controller/perencanaan/formasi.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).get(getAllFormasi).post(createFormasi);

export default router.handler({});

