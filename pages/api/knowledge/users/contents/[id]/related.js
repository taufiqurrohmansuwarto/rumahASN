import { createRouter } from "next-connect";
import { getContentRelated } from "@/controller/knowledge/knowledge-contents.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getContentRelated);

export default router.handler({});
