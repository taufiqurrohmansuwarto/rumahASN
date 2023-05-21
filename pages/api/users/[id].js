import { createRouter } from "next-connect";
import { patch } from "../../../controller/users.controller";
import auth from "../../../middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";

const router = createRouter();

router.use(auth, checkRole("admin")).patch(patch);

export default router.handler();
