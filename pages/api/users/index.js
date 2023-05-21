import { createRouter } from "next-connect";
import { index } from "../../../controller/users.controller";
import auth from "../../../middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";

const router = createRouter();

router.use(auth, checkRole("admin")).get(index);

export default router.handler();
