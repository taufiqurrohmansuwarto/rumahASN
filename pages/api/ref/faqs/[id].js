import { createRouter } from "next-connect";
import { index, remove, update } from "../../../../controller/faqs.controller";
import auth from "../../../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(index).patch(update).delete(remove);

export default router.handler({});
