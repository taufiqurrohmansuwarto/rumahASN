import { getLanguageStyles } from "@/controller/rasn-naskah/preferences.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getLanguageStyles);

export default router.handler({});

