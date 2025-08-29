import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import { getPoints } from "@/controller/knowledge/gamification.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(asnPemprovMiddleware)
  .get(getPoints);

export default router.handler({});
