import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import { awardUserXP } from "@/controller/knowledge/gamification.controller";

const router = createRouter();

router.use(auth).post(asnPemprovMiddleware).post(awardUserXP);

export default router.handler({});
