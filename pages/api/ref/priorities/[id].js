import { createRouter } from "next-connect";
import {
  detail,
  update,
  remove,
} from "../../../../controller/ref_priorities.controller";
import auth from "../../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(detail).delete(remove).patch(update);

export default router.handler();
