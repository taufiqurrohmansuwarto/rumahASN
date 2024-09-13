import {
  findPerencanaanUsulanVerif,
  createPerencanaanUsulanVerif,
} from "@/controller/perencanaan.controller";
import auth from "@/middleware/auth.middleware";
import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(fasilitatorMasterMiddleware)
  .get(findPerencanaanUsulanVerif)
  .post(createPerencanaanUsulanVerif);

export default router.handler();
