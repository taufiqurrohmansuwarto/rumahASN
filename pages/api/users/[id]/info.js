import { getUserInfo } from "@/controller/users.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getUserInfo);

export default router.handler();
