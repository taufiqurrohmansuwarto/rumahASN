import { generateAndSaveSubtasks } from "@/controller/kanban/ai.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).post(generateAndSaveSubtasks);

export default router.handler({});
