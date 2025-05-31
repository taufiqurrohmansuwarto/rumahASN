import {
  deleteAttachment,
  getAttachment,
} from "@/controller/rasn-mail/upload.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .get(getAttachment)
  .delete(deleteAttachment);

export default router.handler({});
