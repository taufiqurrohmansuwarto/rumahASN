import { getCategories } from "@/controller/rasn-naskah/templates.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getCategories);

export default router.handler({});

