import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { deleteVerbatim } from "@/controller/asesor-ai/verbatim.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(deleteVerbatim);

export default router.handler({});
