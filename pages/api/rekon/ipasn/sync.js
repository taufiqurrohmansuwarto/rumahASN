import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";
import { syncRekonIPASN } from "@/controller/rekon/rekon-ipasn.controller";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(syncRekonIPASN);

export default router.handler({});
