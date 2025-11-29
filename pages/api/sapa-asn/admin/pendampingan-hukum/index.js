import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { getAll } from "@/controller/sapa-asn/admin/pendampingan-hukum.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getAll);

export default router.handler();

