import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { LetterController } from "@/controller/signify/letter.controller";
const router = createRouter();

router.use(auth).use(asnPemprovMiddleware).get(LetterController.getMyLetter);

export default router.handler({});
