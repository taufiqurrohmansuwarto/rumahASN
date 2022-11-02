import { createRouter } from "next-connect";
import { create, index, remove } from "../../../../controller/faqs.controller";
import auth from "../../../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(index).patch(create).delete(remove);

export default router.handler({});
