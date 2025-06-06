import {
  removeLabelFromEmail,
  getEmailLabels,
  assignLabelToEmail,
} from "@/controller/rasn-mail/emails.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .get(getEmailLabels)
  .post(assignLabelToEmail)
  .delete(removeLabelFromEmail);

export default router.handler({});
