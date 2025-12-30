import {
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/controller/rasn-naskah/templates.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getTemplate).patch(updateTemplate).delete(deleteTemplate);

export default router.handler({});

