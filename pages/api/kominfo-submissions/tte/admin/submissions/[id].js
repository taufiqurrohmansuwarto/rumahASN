import { updatePengajuanTTEAdmin } from "@/controller/tte-submission/tte-submission.controller";
import adminKominfoMiddleware from "@/middleware/admin-kominfo.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminKominfoMiddleware).patch(updatePengajuanTTEAdmin);

export default router.handler({});
