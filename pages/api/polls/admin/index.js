import { createPolling, readAllPolling } from "@/controller/polls.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).post(createPolling).get(readAllPolling);

export default router.handler({});
