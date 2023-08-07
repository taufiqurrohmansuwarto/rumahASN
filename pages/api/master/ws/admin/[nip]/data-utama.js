import { dataUtamaMasterByNip } from "@/controller/master.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(dataUtamaMasterByNip);

export default router.handler();
