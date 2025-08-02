import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { getRekamanVerbatim } from "@/controller/asesor-ai/verbatim.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getRekamanVerbatim);

export default router.handler({});
