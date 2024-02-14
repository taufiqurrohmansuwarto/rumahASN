import { getRefJenisDikalt } from "@/controller/siasn.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getRefJenisDikalt);

export default router.handler();
