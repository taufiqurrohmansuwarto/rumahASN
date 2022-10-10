import { createRouter } from "next-connect";
import { remove, update } from "../../../../controller/ref_status.controller";
import auth from "../../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).patch(update).delete(remove);

export default router.handler();
