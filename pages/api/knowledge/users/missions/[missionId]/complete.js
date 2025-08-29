import { userMissionComplete } from "@/controller/knowledge/gamification.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(userMissionComplete)
  .post(userMissionComplete);

export default router.handler({});
