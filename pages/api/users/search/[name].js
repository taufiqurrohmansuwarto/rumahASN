import { searchUser } from "@/controller/users.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(searchUser);

export default router.handler();
