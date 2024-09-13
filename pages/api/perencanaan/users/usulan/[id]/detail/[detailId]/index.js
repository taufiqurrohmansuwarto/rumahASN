import {
  deletePerencanaanUsulanDetail,
  updatePerencanaanUsulanDetail,
} from "@/controller/perencanaan.controller";
import auth from "@/middleware/auth.middleware";
import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(fasilitatorMasterMiddleware)
  .patch(updatePerencanaanUsulanDetail)
  .delete(deletePerencanaanUsulanDetail);

export default router.handler();
