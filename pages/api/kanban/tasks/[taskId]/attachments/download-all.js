import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { downloadAllAttachments } from "@/controller/kanban/attachments.controller";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(downloadAllAttachments);

export default router.handler();

