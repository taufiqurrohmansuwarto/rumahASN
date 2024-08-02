import { comparePegawai } from "@/controller/compare.controller";
import auth from "@/middleware/auth.middleware";
import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(fasilitatorMasterMiddleware)
  .get(comparePegawai);

export default router.handler();
