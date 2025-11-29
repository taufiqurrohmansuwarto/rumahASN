import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { getSummary } from "@/controller/sapa-asn/admin/dashboard.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getSummary);

export default router.handler();

