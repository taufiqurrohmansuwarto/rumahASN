import { removeForbiddenWord } from "@/controller/rasn-naskah/preferences.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).delete(removeForbiddenWord);

export default router.handler({});

