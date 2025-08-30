import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { getTopContents } from "@/controller/knowledge/knowledge-insights.controller";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(asnPemprovMiddleware)
  .get(getTopContents);

export default router.handler({});
