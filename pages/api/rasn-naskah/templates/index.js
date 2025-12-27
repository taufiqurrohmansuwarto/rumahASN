import {
  getTemplates,
  createTemplate,
} from "@/controller/rasn-naskah/templates.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getTemplates).post(createTemplate);

export default router.handler({});

