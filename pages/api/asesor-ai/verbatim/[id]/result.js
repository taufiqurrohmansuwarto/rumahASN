import { resultVerbatim } from "@/controller/asesor-ai/verbatim.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(resultVerbatim);

export default router.handler({});
