import { bulkSyncToQdrant } from "@/controller/rasn-naskah/admin.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(bulkSyncToQdrant);

export default router.handler({});

