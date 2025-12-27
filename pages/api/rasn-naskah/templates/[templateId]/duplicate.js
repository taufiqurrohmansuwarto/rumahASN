import { duplicateTemplate } from "@/controller/rasn-naskah/templates.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).post(duplicateTemplate);

export default router.handler({});

