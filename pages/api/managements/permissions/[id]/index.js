import {
  deletePermission,
  updatePermission,
} from "@/controller/roles.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).patch(updatePermission).delete(deletePermission);

export default router.handler({});
