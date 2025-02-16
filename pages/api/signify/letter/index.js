import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { LetterController } from "@/controller/signify/letter.controller";
const router = createRouter();

router.use(auth).use(asnPemprovMiddleware).post(LetterController.createLetter);

router.post(LetterController.createLetter);

export default router.handler({});
