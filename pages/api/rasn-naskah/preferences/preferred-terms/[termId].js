import { removePreferredTerm } from "@/controller/rasn-naskah/preferences.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).delete(removePreferredTerm);

export default router.handler({});

