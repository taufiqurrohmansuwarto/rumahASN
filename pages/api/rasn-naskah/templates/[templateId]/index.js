import {
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/controller/rasn-naskah/templates.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getTemplate).patch(updateTemplate).delete(deleteTemplate);

export default router.handler({});

