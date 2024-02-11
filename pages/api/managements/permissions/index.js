import {
  getPermissions,
  createPermission,
} from "@/controller/roles.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getPermissions).post(createPermission);

export default router.handler({});
