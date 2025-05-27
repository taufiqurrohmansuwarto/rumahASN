import {
  deleteLabel,
  updateLabel,
} from "@/controller/rasn-mail/labels.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .patch(updateLabel)
  .delete(deleteLabel);

export default router.handler({});
