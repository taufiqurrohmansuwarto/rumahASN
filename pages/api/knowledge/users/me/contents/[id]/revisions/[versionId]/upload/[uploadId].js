import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { deleteRevisionAttachment } from "@/controller/knowledge/knowledge-revisions.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).delete(deleteRevisionAttachment);

export default router.handler({});
