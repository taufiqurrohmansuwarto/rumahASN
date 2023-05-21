import { createRouter } from "next-connect";
import {
  remove,
  update,
} from "../../../../controller/admin-sub-categories.controller";
import { detail } from "../../../../controller/ref_status.controller";
import auth from "../../../../middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";
const router = createRouter();

router.use(auth, checkRole("admin")).get(detail).patch(update).delete(remove);

export default router.handler();
