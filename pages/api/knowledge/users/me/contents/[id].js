import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import { getUserKnowledgeContents } from "@/controller/knowledge/knowledge-user.controller";

const router = createRouter();

router.use(auth).use(asnPemprovMiddleware).get(getUserKnowledgeContents);

export default router.handler({});
