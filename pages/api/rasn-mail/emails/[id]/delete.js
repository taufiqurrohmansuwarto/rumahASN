import {
  deleteEmail,
  restoreEmail,
} from "@/controller/rasn-mail/emails.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .delete(deleteEmail)
  .put(restoreEmail);

export default router.handler({});
