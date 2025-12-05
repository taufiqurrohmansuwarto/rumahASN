import {
  deleteAttachment,
  getAttachmentUrl,
} from "@/controller/kanban/attachments.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getAttachmentUrl).delete(deleteAttachment);

export default router.handler({});

