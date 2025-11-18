import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { getProxySyncStatus } from "@/controller/siasn/proxy-siasn/proxy-pangkat.controller";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

// GET untuk check job status
router.use(auth).use(adminMiddleware).get(getProxySyncStatus);

export default router.handler();
