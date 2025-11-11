import { createRouter } from "next-connect";
import { patch } from "@/controller/users.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).patch(patch);

export default router.handler();
