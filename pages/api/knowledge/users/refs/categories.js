import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { getKnowledgeCategories } from "@/controller/knowledge/knowledge-contents.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getKnowledgeCategories);

export default router.handler({});
