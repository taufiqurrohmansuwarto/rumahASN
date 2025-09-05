import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { getMyRevisions } from "@/controller/knowledge/knowledge-revisions.controller";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getMyRevisions);

export default router.handler({});