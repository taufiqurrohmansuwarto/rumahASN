import { userReadDetail } from "@/controller/employee-services.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(userReadDetail);

export default router.handler();
