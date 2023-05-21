import { createRouter } from "next-connect";
import {
  detail,
  remove,
  update,
} from "../../../../controller/ref_categories.controller";
import auth from "../../../../middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";

const router = createRouter();

router.use(auth, checkRole("admin")).get(detail).delete(remove).patch(update);

export default router.handler();
