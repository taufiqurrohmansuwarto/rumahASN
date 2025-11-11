import { createRouter } from "next-connect";
import adminMiddleware from "@/middleware/admin.middleware";
const { index } = require("@/controller/users.controller");
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(index);

export default router.handler();
