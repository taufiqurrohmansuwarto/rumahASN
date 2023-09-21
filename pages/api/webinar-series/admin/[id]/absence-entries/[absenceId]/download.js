import { getReportAbsences } from "@/controller/webinar-series-participants-absence.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(getReportAbsences);

export default router.handler({});
