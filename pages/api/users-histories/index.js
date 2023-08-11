import { getUsersHistories } from "@/controller/users-histories.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getUsersHistories);

export default router.handler();
