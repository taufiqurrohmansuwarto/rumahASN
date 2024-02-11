import { deleteRole, updateRole } from "@/controller/roles.controller";
import auth from "@/middleware/auth.middleware";
import prakomMiddleware from "@/middleware/prakom.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(prakomMiddleware).patch(updateRole).delete(deleteRole);

export default router.handler({});
