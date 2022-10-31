import { createRouter } from "next-connect";
import {
  remove,
  update,
} from "../../../../controller/admin-sub-categories.controller";
import { detail } from "../../../../controller/ref_status.controller";
import auth from "../../../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(detail).patch(update).remove(remove);

export default router.handler();
