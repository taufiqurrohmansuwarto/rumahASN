import { createRouter } from "next-connect";
import {
  detail,
  remove,
  update,
} from "../../../../controller/sub-faqs.controller";
import auth from "../../../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(detail).patch(update).delete(remove);

export default router.handler({});
