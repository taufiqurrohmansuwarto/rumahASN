import { layananTrackingSiasn } from "@/controller/tracking-layanan.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware);

export default router.handler();
