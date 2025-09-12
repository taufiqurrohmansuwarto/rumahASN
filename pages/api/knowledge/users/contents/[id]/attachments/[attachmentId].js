import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { deleteMyContentAttachment } from "@/controller/knowledge/knowledge-user.controller";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).delete(deleteMyContentAttachment);

export default router.handler({});
