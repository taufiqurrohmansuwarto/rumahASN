import { userRoles } from "@/controller/roles.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(userRoles);

export default router.handler({});
