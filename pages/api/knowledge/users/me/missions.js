import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import { userMissions } from "@/controller/knowledge/gamification.controller";

const router = createRouter();

router.use(auth).get(asnPemprovMiddleware).get(userMissions);

export default router.handler({});
