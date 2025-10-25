import { listEmailSubmissionUser } from "@/controller/tte-submission/email-submission.controller";
import adminKominfoMiddleware from "@/middleware/admin-kominfo.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminKominfoMiddleware).get(listEmailSubmissionUser);

export default router.handler({});
