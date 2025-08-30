import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { getTopCategories } from "@/controller/knowledge/knowledge-insights.controller";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(asnPemprovMiddleware)
  .get(getTopCategories);

export default router.handler({});
