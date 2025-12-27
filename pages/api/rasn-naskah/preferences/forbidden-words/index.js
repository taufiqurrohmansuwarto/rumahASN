import { addForbiddenWord } from "@/controller/rasn-naskah/preferences.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).post(addForbiddenWord);

export default router.handler({});

