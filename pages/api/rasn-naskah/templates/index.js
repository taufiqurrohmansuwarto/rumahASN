import {
  getTemplates,
  createTemplate,
} from "@/controller/rasn-naskah/templates.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getTemplates).post(createTemplate);

export default router.handler({});

