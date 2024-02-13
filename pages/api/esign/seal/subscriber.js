import {
  setIdSubscriber,
  subscribersDetail,
} from "@/controller/app-bsre-seal.controller";
import auth from "@/middleware/auth.middleware";
import sealingMiddleware from "@/middleware/sealing.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(sealingMiddleware)
  .patch(setIdSubscriber)
  .get(subscribersDetail);

export default router.handler({});
